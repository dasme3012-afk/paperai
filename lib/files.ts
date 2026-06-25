import sharp from "sharp";

export async function normalizeUpload(file: File) {
  const original = Buffer.from(await file.arrayBuffer());
  const isImage = file.type.startsWith("image/");

  if (!isImage) {
    return {
      buffer: original,
      previewBuffer: original,
      mimeType: file.type || "application/pdf",
      sourceType: "pdf" as const
    };
  }

  const image = sharp(original, { failOn: "none" }).rotate();
  const metadata = await image.metadata();
  const width = Math.min(metadata.width ?? 1800, 1800);
  const compressed = await image
    .flatten({ background: '#ffffff' })
    .resize({ width, withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();

  return {
    buffer: compressed,
    previewBuffer: compressed,
    mimeType: "image/jpeg",
    sourceType: "image" as const
  };
}

export function fileExt(mimeType: string) {
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType.includes("png")) return "png";
  if (mimeType.includes("webp")) return "webp";
  return "jpg";
}
