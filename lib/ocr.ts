import OpenAI from "openai";
import vision from "@google-cloud/vision";

type OcrInput = {
  buffer: Buffer;
  mimeType: string;
  language: string;
};

export async function extractText({ buffer, mimeType, language }: OcrInput) {
  const provider = process.env.OCR_PROVIDER ?? "openai";

  if (provider === "google") {
    return extractWithGoogleVision(buffer, language);
  }

  if (provider === "google-ai-studio") {
    return extractWithGoogleAiStudio(buffer, mimeType, language);
  }

  return extractWithOpenAIVision(buffer, mimeType, language);
}

async function extractWithGoogleVision(buffer: Buffer, language: string) {
  const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  const client = credentialsJson
    ? new vision.ImageAnnotatorClient({ credentials: JSON.parse(credentialsJson) })
    : new vision.ImageAnnotatorClient();

  const [result] = await client.documentTextDetection({
    image: { content: buffer },
    imageContext: language === "auto" ? undefined : { languageHints: [language] }
  });

  return result.fullTextAnnotation?.text ?? "";
}

async function extractWithOpenAIVision(buffer: Buffer, mimeType: string, language: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is missing.");

  const client = new OpenAI({ apiKey });
  const imageUrl = `data:${mimeType};base64,${buffer.toString("base64")}`;
  const response = await client.chat.completions.create({
    model: "gpt-4o",
    temperature: 0,
    messages: [
      {
        role: "system",
        content:
          "You are an OCR engine for school question papers. Extract all visible text in reading order. Preserve question numbering, marks, tables, section headings, and language. If a diagram or image appears, insert [DIAGRAM HERE]."
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `OCR this question paper page. Language hint: ${language}. Return plain text only.`
          },
          {
            type: "image_url",
            image_url: { url: imageUrl }
          }
        ]
      }
    ]
  });

  return response.choices[0]?.message.content ?? "";
}

async function extractWithGoogleAiStudio(buffer: Buffer, mimeType: string, language: string) {
  const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_AI_STUDIO_API_KEY is missing.");
  const model = process.env.GOOGLE_AI_STUDIO_MODEL ?? "gemini-2.5-pro";

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: [
                "OCR this handwritten or printed school question paper page in reading order.",
                `Language hint: ${language}.`,
                "Preserve question numbering, sections, marks, MCQs, tables, headings, and spacing.",
                "If diagrams or images appear, insert [DIAGRAM HERE].",
                "Return plain text only."
              ].join(" ")
            },
            {
              inlineData: {
                mimeType,
                data: buffer.toString("base64")
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Google AI Studio OCR failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text ?? "").join("\n") ?? "";
}
