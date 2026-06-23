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

// Single-pass: image → formatted HTML directly (skips the OCR→text→format two-step)
// This halves the processing time per page with no quality loss.
export async function extractAndFormatPage(
  buffer: Buffer,
  mimeType: string,
  language: string
): Promise<{ ocrText: string; html: string }> {
  const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY;
  if (!apiKey) {
    return extractAndFormatOpenAI(buffer, mimeType, language);
  }
  return extractAndFormatGemini(buffer, mimeType, language);
}

// Legacy text-only formatter (used as fallback when only text is available)
export async function formatQuestionPaper(ocrText: string, language: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return formatWithGoogleAiStudio(ocrText, language);
  }
  const client = new OpenAI({ apiKey });
  const model = process.env.OPENAI_FORMATTING_MODEL ?? "gpt-4o";
  const response = await client.chat.completions.create({
    model,
    temperature: 0.1,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `Language hint: ${language}\n\nOCR TEXT:\n${ocrText}` }
    ]
  });
  return sanitizeHtml(cleanHtml(response.choices[0]?.message.content ?? "<p></p>"));
}

// ─── Single-pass Gemini (image → HTML) ─────────────────────────────────────

async function extractAndFormatGemini(
  buffer: Buffer,
  mimeType: string,
  language: string
): Promise<{ ocrText: string; html: string }> {
  return withRetry(() => _extractAndFormatGemini(buffer, mimeType, language), "Gemini OCR");
}

async function _extractAndFormatGemini(
  buffer: Buffer,
  mimeType: string,
  language: string
): Promise<{ ocrText: string; html: string }> {
  const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY!;
  // Use flash for speed; only fall back to pro if env overrides
  const model = process.env.GOOGLE_AI_STUDIO_MODEL ?? "gemini-2.5-flash";

  const prompt = [
    "You are an expert OCR and document formatter for school exam papers.",
    `Language hint: ${language}.`,
    "Look at this image of a question paper page.",
    "Extract ALL text exactly as it appears — every word, number, symbol, and mark scheme.",
    "Output a single clean HTML document. Rules:",
    "- Use h1 for the exam title, h2 for section headers, h3 for sub-sections.",
    "- Use ol/li for numbered questions, ul/li for bullet points.",
    "- Marks like [2] or (4) go inside <strong> at the end of the line.",
    "- MCQ options A B C D: put in a 2-column borderless table <table class='borderless'><tr><td>(A)...</td><td>(B)...</td></tr></table>",
    "- Preserve all tables with <table><thead><tbody><tr><th><td>.",
    "- Do NOT add any boxes, placeholders, or content that is not visible in the image.",
    "- Do NOT add [DIAGRAM HERE] or any other placeholder text.",
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
  language: string
): Promise<{ ocrText: string; html: string }> {
  return withRetry(() => _extractAndFormatOpenAI(buffer, mimeType, language), "OpenAI OCR");
}

async function _extractAndFormatOpenAI(
  buffer: Buffer,
  mimeType: string,
  language: string
): Promise<{ ocrText: string; html: string }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("No AI API key configured.");
  const client = new OpenAI({ apiKey });
  const imageUrl = `data:${mimeType};base64,${buffer.toString("base64")}`;

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    temperature: 0,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
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
  "Put marks like [2] inside <strong>. MCQ options in 2-col borderless table.",
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
