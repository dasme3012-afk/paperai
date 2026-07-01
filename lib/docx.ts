// @ts-expect-error missing types for html-to-docx
import HTMLtoDOCX from "html-to-docx";

export async function htmlToDocxBuffer(html: string, title: string, pageSize?: string, pageOrientation?: string) {
  const orientation = pageOrientation === "landscape" ? "landscape" : "portrait";
  
  // Create a styled HTML document that includes the necessary CSS for tables and alignment
  const styledHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, "Mangal", sans-serif; color: #111827; }
          h1 { text-align: center; font-size: 24pt; font-weight: bold; }
          h2 { font-size: 18pt; font-weight: bold; }
          h3 { font-size: 14pt; font-weight: bold; }
          p { margin-bottom: 8pt; }
          .marks { float: right; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 12pt; }
          td, th { border: 1px solid #d1d5db; padding: 6pt; vertical-align: middle; }
          th { background-color: #f9fafb; font-weight: bold; }
          table.borderless td, table.borderless th { border: none !important; }
          .page-break { page-break-after: always; clear: both; }
          img { max-width: 100%; }
        </style>
      </head>
      <body>
        ${html}
      </body>
    </html>
  `;

  const generate = typeof HTMLtoDOCX === "function" ? HTMLtoDOCX : (HTMLtoDOCX as any).default;

  let buffer = await generate(styledHtml, null, {
    title,
    orientation,
    margins: { top: 720, right: 720, bottom: 720, left: 720 },
    font: "Arial",
  });

  if (typeof Blob !== "undefined" && buffer instanceof Blob) {
    buffer = Buffer.from(await buffer.arrayBuffer());
  } else if (buffer instanceof ArrayBuffer) {
    buffer = Buffer.from(buffer);
  }

  return buffer;
}
