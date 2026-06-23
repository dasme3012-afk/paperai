import { AlignmentType, Document, HeadingLevel, ImageRun, Packer, Paragraph, TextRun } from "docx";

export async function htmlToDocxBuffer(html: string, title: string) {
  const blocks = await htmlToDocxBlocks(html);

  const doc = new Document({
    creator: "PaperAI",
    title,
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, right: 720, bottom: 720, left: 720 }
          }
        },
        children: blocks.length ? blocks : [new Paragraph("")]
      }
    ]
  });

  return Packer.toBuffer(doc);
}

async function htmlToDocxBlocks(html: string) {
  const normalized = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi, "\n[[IMAGE:$1]]\n")
    .replace(/<\/(p|h1|h2|h3|li|tr)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

  const blocks: Paragraph[] = [];
  const lines = normalized.split(/\n+/).map((line) => line.trim()).filter(Boolean);

  for (const [index, line] of lines.entries()) {
    const imageMatch = line.match(/^\[\[IMAGE:(.+)\]\]$/);
    if (imageMatch) {
      const image = await fetchImage(imageMatch[1]);
      if (image) {
        blocks.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 180 },
            children: [
              new ImageRun({
                data: image,
                transformation: {
                  width: 520,
                  height: 280
                }
              })
            ]
          })
        );
        continue;
      }
    }

    const trimmed = line.trim();
    blocks.push(new Paragraph({
      heading: index === 0 ? HeadingLevel.HEADING_1 : undefined,
      alignment: index === 0 ? AlignmentType.CENTER : AlignmentType.LEFT,
      spacing: { after: 180 },
      children: [new TextRun({ text: trimmed || " ", bold: index === 0 })]
    }));
  }

  return blocks;
}

async function fetchImage(src: string) {
  try {
    if (src.startsWith("data:")) {
      return Buffer.from(src.split(",")[1] ?? "", "base64");
    }

    const response = await fetch(src);
    if (!response.ok) return null;
    return Buffer.from(await response.arrayBuffer());
  } catch {
    return null;
  }
}
