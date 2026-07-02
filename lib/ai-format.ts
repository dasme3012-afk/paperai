import OpenAI from "openai";
import { sanitizeHtml } from "./sanitize";
import { log } from "./logger";

/**
 * Retry wrapper with exponential backoff.
 * Retries up to `maxRetries` times on failure.
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  label: string,
  maxRetries: number = 3
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isLast = attempt === maxRetries;
      log.warn(`${label} attempt ${attempt}/${maxRetries} failed`, {
        error: error instanceof Error ? error.message : String(error),
        willRetry: !isLast,
      });
      if (isLast) throw error;
      // Exponential backoff: 1s, 2s, 4s
      await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt - 1)));
    }
  }
  throw new Error(`${label} failed after ${maxRetries} retries`);
}

// ─── Google Vision OCR ───────────────────────────────────────────────────────

async function extractWithGoogleVision(buffer: Buffer): Promise<string> {
  const apiKey = process.env.Google_Vision_ApI;
  if (!apiKey) throw new Error("Google_Vision_ApI is missing");

  const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      requests: [
        {
          image: { content: buffer.toString("base64") },
          features: [{ type: "DOCUMENT_TEXT_DETECTION" }]
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`Google Vision API failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const rawText = data.responses?.[0]?.fullTextAnnotation?.text;
  if (!rawText) {
    throw new Error("Google Vision API returned no text");
  }

  return rawText;
}

// ─── Main Router ─────────────────────────────────────────────────────────────

export async function extractAndFormatPage(
  buffer: Buffer,
  mimeType: string,
  language: string,
  sourceUrl?: string
): Promise<{ ocrText: string; html: string }> {
  const visionApiKey = process.env.Google_Vision_ApI;
  const openaiApiKey = process.env.OPENAI_API_KEY;

  // Primary workflow: Google Vision OCR → OpenAI formatting with vision
  if (visionApiKey && openaiApiKey) {
    try {
      log.info("Using primary workflow: Google Vision OCR + OpenAI formatting");
      const ocrText = await withRetry(() => extractWithGoogleVision(buffer), "Google Vision OCR");
      const html = await withRetry(() => formatQuestionPaper(ocrText, language, sourceUrl, buffer, mimeType), "OpenAI Formatting");
      return { ocrText, html };
    } catch (error) {
      log.warn("Primary workflow failed, falling back to OpenAI single-pass", { error: String(error) });
    }
  }

  // Fallback: OpenAI single-pass (image → HTML)
  if (openaiApiKey) {
    log.info("Using fallback workflow: OpenAI single-pass");
    return extractAndFormatOpenAI(buffer, mimeType, language, sourceUrl);
  }

  throw new Error("No AI API keys configured. Set OPENAI_API_KEY and Google_Vision_ApI.");
}

// ─── Two-step formatter: OCR text + image → HTML ────────────────────────────

export async function formatQuestionPaper(
  ocrText: string,
  language: string,
  sourceUrl?: string,
  imageBuffer?: Buffer,
  imageMimeType?: string
) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is required");
  const client = new OpenAI({ apiKey });
  const model = process.env.OPENAI_FORMATTING_MODEL ?? "gpt-4o-mini";

  const messages: any[] = [
    { role: "system", content: SYSTEM_PROMPT }
  ];

  // Build user message: always include OCR text
  const userParts: any[] = [];

  // Determine if we can send the image for vision
  const hasImage = imageBuffer && imageMimeType;
  const hasSourceUrl = sourceUrl && (sourceUrl.startsWith("http") || sourceUrl.startsWith("data:"));

  let userText = `Here is the raw OCR text extracted from the document:\n\n${ocrText}\n\nLanguage hint: ${language}.\n\nFormat this OCR text into clean HTML following all the rules in the system prompt.`;

  if (hasImage || hasSourceUrl) {
    userText += `\n\nAn image of the original page is attached. Use it to:
1. Identify where diagrams, charts, graphs, figures, or illustrations appear.
2. For EACH diagram you find, output this exact marker at the correct location in the HTML:
   <!--DIAGRAM:{"top":T,"left":L,"width":W,"height":H,"desc":"DESCRIPTION"}-->
   Where T, L, W, H are approximate percentages (0-100) of the diagram's bounding box on the page, and DESCRIPTION is a brief text description of what the diagram shows.
3. Do NOT insert any <img> tags for diagrams. Only use the <!--DIAGRAM:...--> marker.
4. At the VERY END of your HTML output, append exactly one of these two lines:
   <!--WATERMARK:true--> if the page has a printed watermark, school logo, institutional seal, decorative border pattern, or colored background design
   <!--WATERMARK:false--> if the page is plain white paper, ruled/lined paper, or graph paper with no background watermark`;
  }

  userParts.push({ type: "text", text: userText });

  // Attach image via vision: prefer raw buffer (more reliable), fallback to URL
  if (hasImage) {
    const dataUri = `data:${imageMimeType};base64,${imageBuffer.toString("base64")}`;
    userParts.push({ type: "image_url", image_url: { url: dataUri } });
  } else if (hasSourceUrl) {
    userParts.push({ type: "image_url", image_url: { url: sourceUrl } });
  }

  messages.push({ role: "user", content: userParts.length === 1 ? userParts[0].text : userParts });

  const response = await client.chat.completions.create({
    model,
    temperature: 0.1,
    messages
  });

  return sanitizeHtml(cleanHtml(response.choices[0]?.message.content ?? "<p></p>"));
}

// ─── Single-pass OpenAI fallback (image → HTML) ─────────────────────────────

async function extractAndFormatOpenAI(
  buffer: Buffer,
  mimeType: string,
  language: string,
  sourceUrl?: string
): Promise<{ ocrText: string; html: string }> {
  return withRetry(() => _extractAndFormatOpenAI(buffer, mimeType, language, sourceUrl), "OpenAI OCR");
}

async function _extractAndFormatOpenAI(
  buffer: Buffer,
  mimeType: string,
  language: string,
  sourceUrl?: string
): Promise<{ ocrText: string; html: string }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is required");
  const client = new OpenAI({ apiKey });
  const imageUrl = `data:${mimeType};base64,${buffer.toString("base64")}`;

  const diagramInstruction = `
When you see diagrams, charts, graphs, images, or illustrations, output this marker at the corresponding location:
<!--DIAGRAM:{"top":T,"left":L,"width":W,"height":H,"desc":"DESCRIPTION"}-->
Where T, L, W, H are approximate percentages (0-100) of the diagram's bounding box on the page.
Do NOT insert <img> tags for diagrams. Only use the <!--DIAGRAM:...--> marker.

At the VERY END of your HTML output, append exactly one of these two lines:
<!--WATERMARK:true--> if the page has a printed watermark, school logo, institutional seal, or decorative border
<!--WATERMARK:false--> if the page is plain white/ruled paper with no background watermark`;

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    temperature: 0,
    messages: [
      { role: "system", content: SYSTEM_PROMPT + diagramInstruction },
      {
        role: "user",
        content: [
          { type: "text", text: `Language hint: ${language}. Look at this exam paper image and output formatted HTML directly.` },
          { type: "image_url", image_url: { url: imageUrl } }
        ]
      }
    ]
  });

  const raw = response.choices[0]?.message.content ?? "<p></p>";
  const html = sanitizeHtml(cleanHtml(raw));
  const ocrText = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return { ocrText, html };
}

// ─── Shared ──────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = [
  "You are an expert formatter for school exam papers.",
  "Convert the given content into clean semantic HTML.",
  "Use h1/h2/h3 for headings, ol/li for numbered questions, ul/li for bullets.",
  "Put marks like [2] inside <span class=\"marks\">. MCQ options in 2-col borderless table.",
  "- For horizontal dividing lines, use an <hr> tag.",
  "- If the original text or numerals are in a specific language (like Marathi), preserve them EXACTLY. DO NOT translate numerals to English.",
  "Do NOT add any boxes or placeholder text not present in the original content.",
  "Return ONLY HTML — no markdown fences, no explanations."
].join(" ");

function cleanHtml(content: string) {
  return content
    .trim()
    .replace(/^```html\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}
