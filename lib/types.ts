export type PaperPage = {
  id: string;
  pageNumber: number;
  sourceUrl: string;
  sourceType: "image" | "pdf";
  ocrText: string;
  html: string;
  hasWatermark?: boolean;
  diagrams: Array<{
    id: string;
    placeholder: string;
    imageUrl?: string;
    pageNumber: number;
  }>;
};

export type PaperProject = {
  id: string;
  user_id: string;
  title: string;
  status: "draft" | "processing" | "ready" | "failed";
  language: "auto" | "en" | "hi" | "mr";
  pages: PaperPage[];
  pageSize?: "a4" | "letter" | "legal";
  pageOrientation?: "portrait" | "landscape";
  created_at: string;
  updated_at: string;
};

export type ProcessPaperResponse = {
  projectId: string;
  pages: PaperPage[];
};
