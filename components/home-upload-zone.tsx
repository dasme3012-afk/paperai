"use client";

import { useCallback, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  FileImage, FileText, Loader2, X, Upload, CheckCircle2,
  ChevronDown, ChevronUp, FileSpreadsheet
} from "lucide-react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import type { PaperProject } from "@/lib/types";

const PaperEditor = dynamic(() => import("@/components/paper-editor").then(m => m.PaperEditor), {
  loading: () => (
    <div className="flex min-h-[400px] items-center justify-center rounded-xl border border-white/10 bg-white/5">
      <div className="flex items-center gap-2 text-white/50">
        <Loader2 className="animate-spin" size={18} /> Loading editor...
      </div>
    </div>
  ),
  ssr: false,
});

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_FILES = 25;

// Only allow images and PDFs — block executables and unsupported types
const ACCEPTED_TYPES = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "application/pdf": [".pdf"],
};



function fileIcon(file: File) {
  if (file.type.startsWith("image/")) return <FileImage size={14} className="text-blue-400 flex-shrink-0" />;
  if (file.type === "application/pdf") return <FileText size={14} className="text-red-400 flex-shrink-0" />;
  return <FileSpreadsheet size={14} className="text-green-400 flex-shrink-0" />;
}

export function HomeUploadZone() {
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState<"auto" | "en" | "hi" | "mr">("auto");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState("Preparing files...");
  const [project, setProject] = useState<PaperProject | null>(null);
  const [showFiles, setShowFiles] = useState(true);
  const timerRef = useRef<number | undefined>(undefined);

  const onDrop = useCallback((accepted: File[], rejected: { file: File; errors: readonly { code: string }[] }[]) => {
    for (const { errors } of rejected) {
      const isType = errors.some((e) => e.code === "file-invalid-type");
      if (isType) {
        toast.error("Only images, PDFs, and Office files are accepted.");
        return;
      }
    }

    const valid = accepted.filter((file) => {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} exceeds the 10 MB limit.`);
        return false;
      }
      return true;
    });

    setFiles((cur) => {
      const merged = [...cur, ...valid];
      if (merged.length > MAX_FILES) {
        toast.error(`Maximum ${MAX_FILES} files per session.`);
        return merged.slice(0, MAX_FILES);
      }
      return merged;
    });

    if (valid.length > 0) {
      setTitle(valid[0].name.replace(/\.[^.]+$/, ""));
    }
    setProject(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    multiple: true,
    maxFiles: MAX_FILES,
  });

  function removeFile(index: number) {
    setFiles((cur) => {
      const updated = cur.filter((_, i) => i !== index);
      if (updated.length === 0) {
        setTitle("");
      } else if (index === 0) {
        setTitle(updated[0].name.replace(/\.[^.]+$/, ""));
      }
      return updated;
    });
    setProject(null);
  }

  async function generate() {
    if (!files.length) return;
    setLoading(true);
    setProgress(5);
    setProgressMsg("Preparing files...");

    try {
      // Expand PDFs to images and compress existing images client-side
      setProgressMsg("Compressing and reading pages...");
      setProgress(15);
      const processedFiles = await processAndCompressFiles(files);

      setProgressMsg("Uploading to AI engine...");
      setProgress(30);

      const form = new FormData();
      form.set("title", title || files[0]?.name.replace(/\.[^.]+$/, "") || "Question paper");
      form.set("language", language);
      processedFiles.forEach((f) => form.append("files", f));

      // Animate progress while waiting
      timerRef.current = window.setInterval(() => {
        setProgress((v) => {
          if (v >= 88) return v;
          if (v > 60) setProgressMsg("Formatting document...");
          else if (v > 40) setProgressMsg("Running OCR...");
          return v + 6;
        });
      }, 600);

      const res = await fetch("/api/process", { method: "POST", body: form });
      window.clearInterval(timerRef.current);
      setProgress(100);
      setProgressMsg("Done!");

      const data = await res.json();

      if (res.status === 401) {
        toast.error("Please sign in to process papers.");
        return;
      }
      if (!res.ok) {
        toast.error(data.error ?? "Processing failed");
        setProgress(0);
        return;
      }

      // Inline — no navigation
      const proj: PaperProject = {
        id: data.projectId,
        user_id: "guest",
        title: title || files[0]?.name.replace(/\.[^.]+$/, "") || "Question paper",
        language,
        pages: data.pages,
        status: "ready",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setProject(proj);
      toast.success("Paper digitized! Scroll down to edit.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
      setProgress(0);
    } finally {
      if (timerRef.current) window.clearInterval(timerRef.current);
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      {/* Upload card */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm overflow-hidden">

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`relative mx-5 my-5 cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200 p-10 text-center
            ${isDragActive
              ? "border-brand bg-brand/8 scale-[1.01]"
              : "border-white/15 hover:border-white/30 hover:bg-white/[0.02]"
            }`}
        >
          <input {...getInputProps()} />
          <div className={`transition-transform duration-200 ${isDragActive ? "scale-110" : ""}`}>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
              <Upload size={28} className={isDragActive ? "text-brand" : "text-white/50"} />
            </div>
            <p className="text-lg font-bold text-white">
              {isDragActive ? "Drop files here" : "Drop files or click to browse"}
            </p>
            <p className="mt-2 text-sm text-white/40">
              Images & PDFs · Max 25 files · 10 MB each
            </p>
          </div>
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="px-5 mt-4">
            <button
              onClick={() => setShowFiles((v) => !v)}
              className="flex w-full items-center justify-between text-sm font-semibold text-white/60 hover:text-white transition-colors mb-2"
            >
              <span>{files.length} file{files.length !== 1 ? "s" : ""} selected</span>
              <div className="flex items-center gap-4">
                <span 
                  className="text-red-400/80 hover:text-red-300 text-xs px-2 py-0.5 rounded bg-red-500/10 transition-colors" 
                  onClick={(e) => { e.stopPropagation(); setFiles([]); setTitle(""); setProject(null); }}
                >
                  Clear All
                </span>
                {showFiles ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </div>
            </button>

            {showFiles && (
              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                {files.map((file, i) => (
                  <div
                    key={`${file.name}-${i}`}
                    className="group flex items-center gap-2.5 rounded-lg bg-white/5 px-3 py-2 text-xs"
                  >
                    {fileIcon(file)}
                    <span className="flex-1 truncate text-white/80">{file.name}</span>
                    <span className="text-white/35 flex-shrink-0">{(file.size / 1024).toFixed(0)} KB</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-white/40 hover:text-white"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Progress bar */}
        {loading && (
          <div className="px-5 mt-4">
            <div className="flex items-center justify-between text-xs text-white/50 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Loader2 size={12} className="animate-spin" />
                {progressMsg}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10 relative">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-brand to-blue-400 transition-all duration-[2000ms] ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Success state */}
        {project && !loading && (
          <div className="mx-5 mt-4 flex items-center gap-2 rounded-xl bg-green-500/10 border border-green-500/20 px-4 py-3 text-sm text-green-400">
            <CheckCircle2 size={16} />
            Paper digitized — editor is ready below!
          </div>
        )}

        {/* Generate button */}
        <div className="p-5 pt-4">
          <button
            onClick={generate}
            disabled={!files.length || loading}
            className="w-full rounded-xl bg-brand py-3.5 text-sm font-black text-white hover:bg-blue-500 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150"
          >
            {loading ? "Digitizing..." : project ? "Re-generate" : "Generate Editable Paper"}
          </button>
          <p className="mt-2 text-center text-[11px] text-white/25">
            Free plan: 5 images / 24h · Pro: 100 / 24h · Ultra: 250 / 24h
          </p>
        </div>
      </div>

      {/* Full-screen editor overlay — takes over entire viewport */}
      {project && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            width: "100vw",
            height: "100vh",
            overflow: "hidden"
          }}
        >
          {/* Close / Back to upload button */}
          <button
            onClick={() => setProject(null)}
            style={{
              position: "fixed",
              top: 8,
              left: 8,
              zIndex: 10000,
              background: "rgba(0,0,0,0.7)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 6,
              padding: "4px 12px",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              backdropFilter: "blur(8px)",
            }}
          >
            ← Back to upload
          </button>
          <PaperEditor project={project} demoMode={true} />
        </div>
      )}
    </div>
  );
}

// Expand PDFs into JPEGs and compress large images client-side before upload
async function processAndCompressFiles(files: File[]) {
  const output: File[] = [];
  for (const file of files) {
    if (file.type === "application/pdf") {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url
        ).toString();
        const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
        for (let p = 1; p <= pdf.numPages; p++) {
          const page = await pdf.getPage(p);
          const vp = page.getViewport({ scale: 2 });
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) continue;
          canvas.width = vp.width;
          canvas.height = vp.height;
          await page.render({ canvasContext: ctx, viewport: vp }).promise;
          const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", 0.85));
          if (!blob) continue;
          output.push(new File([blob], `${file.name.replace(/\.pdf$/i, "")}-p${p}.jpg`, { type: "image/jpeg" }));
        }
      } catch {
        output.push(file); // fall back to sending raw PDF
      }
    } else if (file.type.startsWith("image/")) {
      // Compress image client-side to save bandwidth and bypass Vercel 4.5MB limit
      try {
        const bmp = await createImageBitmap(file);
        const MAX_WIDTH = 1800;
        let width = bmp.width;
        let height = bmp.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(bmp, 0, 0, width, height);
          const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", 0.85));
          if (blob) {
            output.push(new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" }));
            continue;
          }
        }
        output.push(file); // Fallback
      } catch {
        output.push(file); // Fallback
      }
    } else {
      output.push(file);
    }
  }
  return output;
}
