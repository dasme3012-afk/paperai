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

// ─── Two-step: Google Vision OCR → OpenAI Formatting ─────────────────────────

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

  // Primary workflow: Google Vision + OpenAI
  if (visionApiKey && openaiApiKey) {
    try {
      log.info("Using primary workflow: Google Vision + GPT-4o-mini");
      const ocrText = await withRetry(() => extractWithGoogleVision(buffer), "Google Vision OCR");
      const html = await withRetry(() => formatQuestionPaper(ocrText, language, sourceUrl), "OpenAI Formatting");
      return { ocrText, html };
    } catch (error) {
      log.warn("Primary workflow failed, falling back to Gemini", { error: String(error) });
    }
  }

  // Fallback workflow: Gemini (or OpenAI vision as last resort)
  const geminiApiKey = process.env.GOOGLE_AI_STUDIO_API_KEY;
  if (geminiApiKey) {
    log.info("Using fallback workflow: Gemini 2.5 single-pass");
    return extractAndFormatGemini(buffer, mimeType, language, sourceUrl);
  }

  log.info("Using fallback workflow: OpenAI single-pass");
  return extractAndFormatOpenAI(buffer, mimeType, language, sourceUrl);
}

// Text-only formatter (used in the two-step workflow)
export async function formatQuestionPaper(ocrText: string, language: string, sourceUrl?: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return formatWithGoogleAiStudio(ocrText, language);
  }
  const client = new OpenAI({ apiKey });
  const model = process.env.OPENAI_FORMATTING_MODEL ?? "gpt-4o-mini";
  const imgInstruction = sourceUrl
    ? `\nIMPORTANT: When you encounter descriptions of diagrams, charts, graphs, images, or illustrations in the OCR text, insert this exact img tag: <img src="${sourceUrl}" alt="Source page image" style="max-width:100%;margin:12px auto;display:block;border:1px solid #e5e7eb;border-radius:4px;" />`
    : "\nFor any diagrams, charts, graphs, images, or illustrations, insert the exact text [DIAGRAM HERE].";
  const response = await client.chat.completions.create({
    model,
    temperature: 0.1,
    messages: [
      { role: "system", content: SYSTEM_PROMPT + imgInstruction },
      { role: "user", content: `Language hint: ${language}\n\nOCR TEXT:\n${ocrText}` }
    ]
  });
  return sanitizeHtml(cleanHtml(response.choices[0]?.message.content ?? "<p></p>"));
}

// ─── Single-pass Gemini (image → HTML) ─────────────────────────────────────

async function extractAndFormatGemini(
  buffer: Buffer,
  mimeType: string,
  language: string,
  sourceUrl?: string
): Promise<{ ocrText: string; html: string }> {
  return withRetry(() => _extractAndFormatGemini(buffer, mimeType, language, sourceUrl), "Gemini OCR");
}

async function _extractAndFormatGemini(
  buffer: Buffer,
  mimeType: string,
  language: string,
  sourceUrl?: string
): Promise<{ ocrText: string; html: string }> {
  const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY!;
  const model = process.env.GOOGLE_AI_STUDIO_MODEL ?? "gemini-2.5-flash";

  const diagramInstruction = sourceUrl
    ? `- For any diagrams, charts, graphs, images, or illustrations, insert this exact img tag: <img src="${sourceUrl}" alt="Source page image" style="max-width:100%;margin:12px auto;display:block;border:1px solid #e5e7eb;border-radius:4px;" />`
    : "- For any diagrams, charts, graphs, images, or illustrations, insert the exact text [DIAGRAM HERE].";

  const prompt = [
    "You are an expert OCR and document formatter for school exam papers.",
    `Language hint: ${language}.`,
    "Look at this image of a question paper page.",
    "Extract ALL text exactly as it appears — every word, number, symbol, and mark scheme.",
    "Output a single clean HTML document. Rules:",
    "- Use h1 for the exam title, h2 for section headers, h3 for sub-sections.",
    "- Use ol/li for numbered questions, ul/li for bullet points.",
    "- Marks like [2] or (4) go inside <span class=\"marks\"> at the end of the line.",
    "- MCQ options A B C D: put in a 2-column borderless table <table class='borderless'><tr><td>(A)...</td><td>(B)...</td></tr></table>",
    "- Preserve all tables with <table><thead><tbody><tr><th><td>.",
    "- For horizontal dividing lines, use an <hr> tag.",
    diagramInstruction,
    "- If the original text or numerals are in a specific language (like Marathi or Hindi), preserve them EXACTLY. DO NOT translate numerals to English.",
    "- Preserve any watermarks, colored backgrounds, or visual styling by describing them in comments.",
    "- Do NOT add any boxes or content that is not visible in the image.",
    "- Correct obvious OCR mistakes but never change academic meaning.",
    "Return ONLY the HTML. No markdown fences, no explanations."
  ].join(" ");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              { inlineData: { mimeType, data: buffer.toString("base64") } }
            ]
          }
        ],
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
        ],
        generationConfig: { temperature: 0, maxOutputTokens: 8192 }
      })
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini single-pass failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const raw = data.candidates?.[0]?.content?.parts
    ?.map((p: { text?: string }) => p.text ?? "")
    .join("\n") ?? "<p></p>";

  const html = sanitizeHtml(cleanHtml(raw));
  // ocrText is just the stripped-text version for storage
  const ocrText = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return { ocrText, html };
}

// ─── Single-pass OpenAI (image → HTML) ──────────────────────────────────────

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
  if (!apiKey) throw new Error("No AI API key configured.");
  const client = new OpenAI({ apiKey });
  const imageUrl = `data:${mimeType};base64,${buffer.toString("base64")}`;

  const imgInstruction = sourceUrl
    ? `\nIMPORTANT: When you see diagrams, charts, graphs, images, or illustrations, insert this exact img tag: <img src="${sourceUrl}" alt="Source page image" style="max-width:100%;margin:12px auto;display:block;border:1px solid #e5e7eb;border-radius:4px;" />`
    : "";

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    temperature: 0,
    messages: [
      { role: "system", content: SYSTEM_PROMPT + imgInstruction },
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

// ─── Legacy text→HTML (fallback) ────────────────────────────────────────────

async function formatWithGoogleAiStudio(ocrText: string, language: string) {
  const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_AI_STUDIO_API_KEY is required.");
  const model = process.env.GOOGLE_AI_STUDIO_MODEL ?? "gemini-2.5-flash";

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: `${SYSTEM_PROMPT}\n\nLanguage hint: ${language}\n\nOCR TEXT:\n${ocrText}` }] }],
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
        ],
        generationConfig: { temperature: 0.1 }
      })
    }
  );

  if (!response.ok) throw new Error(`Gemini format failed: ${response.statusText}`);
  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("\n") ?? "<p></p>";
  return sanitizeHtml(cleanHtml(text));
}

// ─── Shared ──────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = [
  "You are an expert formatter for school exam papers.",
  "Convert the given content into clean semantic HTML.",
  "Use h1/h2/h3 for headings, ol/li for numbered questions, ul/li for bullets.",
  "Put marks like [2] inside <span class=\"marks\">. MCQ options in 2-col borderless table.",
  "- For horizontal dividing lines, use an <hr> tag.",
  "- For any diagrams, charts, graphs, images, or illustrations, insert the exact text [DIAGRAM HERE].",
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
