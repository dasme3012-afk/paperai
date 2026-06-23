"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { FileUp, Loader2 } from "lucide-react";
import { toast } from "sonner";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_FILES = 25;

// Only images and PDFs — no executables or unsupported types
const ACCEPTED_TYPES = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "application/pdf": [".pdf"],
};

export function UploadZone({ layout = "double" }: { layout?: "single" | "double" }) {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("auto");
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback((accepted: File[]) => {
    const valid = accepted.filter((file) => {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} exceeds the 10 MB limit.`);
        return false;
      }
      return true;
    });

    setFiles((current) => [...current, ...valid].slice(0, MAX_FILES));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    multiple: true,
    maxFiles: MAX_FILES,
  });

  async function process() {
    setLoading(true);
    let timer: number | undefined;
    try {
      setProgress(12);
      const processedFiles = await expandPdfFiles(files);
      setProgress(22);
      const form = new FormData();
      form.set("title", title || files[0]?.name.replace(/\.[^.]+$/, "") || "Question paper");
      form.set("language", language);
      processedFiles.forEach((file) => form.append("files", file));

      timer = window.setInterval(() => setProgress((value) => Math.min(value + 8, 88)), 700);
      const response = await fetch("/api/process", { method: "POST", body: form });
      window.clearInterval(timer);
      timer = undefined;
      setProgress(100);

      const data = await response.json();
      if (response.status === 401) {
        toast.error("Please sign in before processing a paper.");
        router.push("/login");
        return;
      }

      if (!response.ok) {
        toast.error(data.error ?? "Upload failed");
        setProgress(0);
        return;
      }

      toast.success("Question paper generated.");
      router.push(`/projects/${data.projectId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
      setProgress(0);
    } finally {
      if (timer) window.clearInterval(timer);
      setLoading(false);
    }
  }

  if (layout === "single") {
    return (
      <div className="rounded-lg border border-line bg-white p-6 shadow-page dark:border-white/10 dark:bg-[#17191d] flex flex-col text-ink dark:text-paper">
        <h2 className="text-xl font-black mb-4">Digitize Paper</h2>
        <div className="grid grid-cols-1 sm:grid-cols-[1.8fr_1.2fr] gap-3">
          <div>
            <label className="text-xs font-bold" htmlFor="title">Project title</label>
            <input
              id="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="mt-1.5 w-full rounded-md border border-line bg-transparent px-3 py-2 text-sm outline-none focus:border-brand dark:border-white/15"
              placeholder="Class 10 Science Preliminary Exam"
            />
          </div>
          <div>
            <label className="text-xs font-bold" htmlFor="language">OCR language</label>
            <select
              id="language"
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              className="mt-1.5 w-full rounded-md border border-line bg-transparent px-3 py-2 text-sm outline-none focus:border-brand dark:border-white/15"
            >
              <option value="auto" className="dark:bg-[#17191d]">Auto detect</option>
              <option value="en" className="dark:bg-[#17191d]">English</option>
              <option value="hi" className="dark:bg-[#17191d]">Hindi</option>
              <option value="mr" className="dark:bg-[#17191d]">Marathi</option>
            </select>
          </div>
        </div>

        <div
          {...getRootProps()}
          className={`mt-4 grid min-h-[140px] cursor-pointer place-items-center rounded-lg border-2 border-dashed p-4 text-center transition ${
            isDragActive ? "border-brand bg-blue-50 dark:bg-blue-950/20" : "border-line dark:border-white/15"
          }`}
        >
          <input {...getInputProps()} />
          <div>
            <FileUp className="mx-auto mb-2 text-brand" size={32} />
            <p className="text-sm font-black">Drop images, PDFs or Office files here</p>
            <p className="mt-1 text-xs text-black/60 dark:text-white/60">Images, PDF, Word, Excel, PowerPoint · Max 25 files · 15 MB each</p>
          </div>
        </div>

        {files.length > 0 && (
          <div className="mt-3 space-y-1.5 max-h-28 overflow-y-auto">
            {files.map((file) => (
              <div key={`${file.name}-${file.size}`} className="flex items-center justify-between rounded-md bg-black/5 px-2.5 py-1.5 text-xs dark:bg-white/10">
                <span className="truncate max-w-[190px]">{file.name}</span>
                <span className="text-black/50 dark:text-white/50">{Math.ceil(file.size / 1024)} KB</span>
              </div>
            ))}
          </div>
        )}

        {loading && (
          <div className="mt-4">
            <div className="h-1.5 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
              <div className="h-full bg-brand transition-all animate-pulse" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold"><Loader2 className="animate-spin" size={14} /> Digitizing and formatting paper...</p>
          </div>
        )}

        <button
          onClick={process}
          disabled={!files.length || loading}
          className="mt-4 w-full rounded-md bg-brand min-h-11 px-5 py-3 font-black text-white hover:bg-brand/90 disabled:opacity-50"
        >
          Generate editable paper
        </button>
      </div>
    );
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-lg border border-line bg-white p-5 dark:border-white/10 dark:bg-white/5">
        <div className="grid grid-cols-1 sm:grid-cols-[1.8fr_1.2fr] gap-4">
          <div>
            <label className="text-sm font-bold" htmlFor="title">Project title</label>
            <input
              id="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="mt-2 w-full rounded-md border border-line bg-transparent px-4 py-3 outline-none focus:border-brand dark:border-white/15"
              placeholder="Class 10 Science Preliminary Exam"
            />
          </div>
          <div>
            <label className="text-sm font-bold" htmlFor="language">OCR language</label>
            <select
              id="language"
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              className="mt-2 w-full rounded-md border border-line bg-transparent px-4 py-3 outline-none focus:border-brand dark:border-white/15"
            >
              <option value="auto">Auto detect</option>
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="mr">Marathi</option>
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-line bg-white p-5 dark:border-white/10 dark:bg-white/5">
        <div
          {...getRootProps()}
          className={`grid min-h-[260px] cursor-pointer place-items-center rounded-lg border-2 border-dashed p-6 text-center transition ${
            isDragActive ? "border-brand bg-blue-50 dark:bg-blue-950/20" : "border-line dark:border-white/15"
          }`}
        >
          <input {...getInputProps()} />
          <div>
            <FileUp className="mx-auto mb-4 text-brand" size={40} />
            <p className="text-lg font-black">Drop images, PDFs or Office files here</p>
            <p className="mt-2 text-sm text-black/60 dark:text-white/60">Images, PDF, Word, Excel, PowerPoint · Max 25 files · 15 MB each</p>
          </div>
        </div>

        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            {files.map((file) => (
              <div key={`${file.name}-${file.size}`} className="flex items-center justify-between rounded-md bg-black/5 px-3 py-2 text-sm dark:bg-white/10">
                <span className="truncate">{file.name}</span>
                <span>{Math.ceil(file.size / 1024)} KB</span>
              </div>
            ))}
          </div>
        )}

        {loading && (
          <div className="mt-4">
            <div className="h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
              <div className="h-full bg-brand transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-2 flex items-center gap-2 text-sm font-semibold"><Loader2 className="animate-spin" size={16} /> OCR and AI formatting in progress</p>
          </div>
        )}

        <button
          onClick={process}
          disabled={!files.length || loading}
          className="mt-5 w-full rounded-md bg-ink px-5 py-4 font-black text-white disabled:opacity-50 dark:bg-paper dark:text-ink"
        >
          Generate editable paper
        </button>
      </div>
    </section>
  );
}

async function expandPdfFiles(files: File[]) {
  const output: File[] = [];

  for (const file of files) {
    if (file.type !== "application/pdf") {
      output.push(file);
      continue;
    }

    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
    const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) continue;

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: context, viewport }).promise;
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.88));
      if (!blob) continue;

      output.push(new File([blob], `${file.name.replace(/\.pdf$/i, "")}-page-${pageNumber}.jpg`, { type: "image/jpeg" }));
    }
  }

  return output;
}
