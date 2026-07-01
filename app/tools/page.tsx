"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText, Image as ImageIcon, Combine, Scissors, RotateCw,
  Maximize, Minimize2, RefreshCw, Crop, ClipboardType,
  Upload, Download, ArrowLeft, Loader2, Plus, Trash2, CheckCircle
} from "lucide-react";
import { PDFDocument, degrees } from "pdf-lib";
import { toast } from "sonner";

type ToolId =
  | "pdf-to-jpg"
  | "jpg-to-pdf"
  | "merge-pdf"
  | "split-pdf"
  | "rotate-pdf"
  | "image-resizer"
  | "image-compressor"
  | "convert-to-jpg"
  | "convert-from-jpg"
  | "crop-image"
  | "rotate-image"
  | "word-counter";

interface ToolInfo {
  id: ToolId;
  name: string;
  desc: string;
  category: "PDF" | "Image" | "Text";
  icon: any;
}

const TOOLS_LIST: ToolInfo[] = [
  { id: "pdf-to-jpg", name: "PDF to JPG", desc: "Extract PDF pages as individual images", category: "PDF", icon: FileText },
  { id: "jpg-to-pdf", name: "JPG to PDF", desc: "Convert multiple images into a single PDF document", category: "PDF", icon: ImageIcon },
  { id: "merge-pdf", name: "Merge PDF", desc: "Combine multiple PDF files into a single document", category: "PDF", icon: Combine },
  { id: "split-pdf", name: "Split PDF", desc: "Extract specific pages from a PDF file", category: "PDF", icon: Scissors },
  { id: "rotate-pdf", name: "Rotate PDF", desc: "Rotate pages in a PDF document and save them", category: "PDF", icon: RotateCw },
  { id: "image-resizer", name: "Image Resizer", desc: "Resize dimensions of your PNG, JPG, or WebP images", category: "Image", icon: Maximize },
  { id: "image-compressor", name: "Image Compressor", desc: "Reduce file size of your images with quality control", category: "Image", icon: Minimize2 },
  { id: "convert-to-jpg", name: "Convert to JPG", desc: "Turn PNG, GIF, SVG, WEBP, and HEIC images to JPG in bulk", category: "Image", icon: RefreshCw },
  { id: "convert-from-jpg", name: "Convert from JPG", desc: "Turn JPG images to PNG and compile animated GIFs", category: "Image", icon: ImageIcon },
  { id: "crop-image", name: "Crop Image", desc: "Crop borders or select area from your images", category: "Image", icon: Crop },
  { id: "rotate-image", name: "Rotate Image", desc: "Rotate JPG, PNG, and WebP images and save them", category: "Image", icon: RotateCw },
  { id: "word-counter", name: "Word Counter", desc: "Count words, characters, and reading time in real-time", category: "Text", icon: ClipboardType },
];

function ToolsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeToolParam = searchParams.get("tool") as ToolId;
  const [activeTool, setActiveTool] = useState<ToolId>(activeToolParam || "pdf-to-jpg");
  const workspaceRef = useRef<HTMLDivElement>(null);

  // Keep state synced with URL parameter
  useEffect(() => {
    if (activeToolParam && TOOLS_LIST.some(t => t.id === activeToolParam)) {
      setActiveTool(activeToolParam);
    }
  }, [activeToolParam]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      const timer = setTimeout(() => {
        workspaceRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [activeTool]);

  const selectTool = (id: ToolId) => {
    setActiveTool(id);
    router.push(`/tools?tool=${id}`);
  };

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Navbar */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-1 text-sm font-bold text-white/50 hover:text-white transition-colors">
            <ArrowLeft size={16} />
            <span>Home</span>
          </Link>
          <div className="h-4 w-px bg-white/10" />
          <Link href="/" className="flex items-center select-none">
            <img src="/logo.png" alt="Textipe Logo" className="h-7 w-auto" />
          </Link>
        </div>
        <div className="flex items-center gap-3 text-sm font-semibold text-white/70">
          <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            100% Client-Side & Free
          </span>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl flex flex-col lg:flex-row gap-6 p-5">
        {/* Sidebar Selector */}
        <aside className="w-full lg:w-72 shrink-0 space-y-5">
          <div className="rounded-2xl border border-white/10 bg-[#121220] p-4">
            <h2 className="text-sm font-bold text-white/40 mb-3 px-2 uppercase tracking-wider">Document Tools</h2>
            <div className="space-y-1">
              {TOOLS_LIST.map((tool) => {
                const Icon = tool.icon;
                const isSelected = activeTool === tool.id;
                return (
                  <button
                    key={tool.id}
                    onClick={() => selectTool(tool.id)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs font-bold transition-all ${
                      isSelected
                        ? "bg-brand text-white shadow-lg shadow-brand/20"
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon size={14} className={isSelected ? "text-white" : "text-white/40"} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate">{tool.name}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Workspace Card */}
        <section ref={workspaceRef} className="flex-1 min-w-0">
          <div className="rounded-2xl border border-white/10 bg-[#121220] p-6 md:p-8 shadow-2xl min-h-[500px] flex flex-col">
            <div className="border-b border-white/10 pb-4 mb-6">
              <h1 className="text-2xl font-black">{TOOLS_LIST.find(t => t.id === activeTool)?.name}</h1>
              <p className="text-xs text-white/55 mt-1">{TOOLS_LIST.find(t => t.id === activeTool)?.desc}</p>
            </div>

            <div className="flex-1 flex flex-col justify-center">
              <ActiveToolWorkspace toolId={activeTool} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function ToolsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <Loader2 className="animate-spin text-brand" size={32} />
      </div>
    }>
      <ToolsContent />
    </Suspense>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Workspace Dispatcher Component
// ─────────────────────────────────────────────────────────────────────────────
function ActiveToolWorkspace({ toolId }: { toolId: ToolId }) {
  switch (toolId) {
    case "pdf-to-jpg": return <PdfToJpgTool />;
    case "jpg-to-pdf": return <JpgToPdfTool />;
    case "merge-pdf": return <MergePdfTool />;
    case "split-pdf": return <SplitPdfTool />;
    case "rotate-pdf": return <RotatePdfTool />;
    case "image-resizer": return <ImageResizerTool />;
    case "image-compressor": return <ImageCompressorTool />;
    case "convert-to-jpg": return <ConvertToJpgTool />;
    case "convert-from-jpg": return <ConvertFromJpgTool />;
    case "crop-image": return <CropImageTool />;
    case "rotate-image": return <RotateImageTool />;
    case "word-counter": return <WordCounterTool />;
    default: return <div className="text-center text-white/40">Select a tool from the sidebar.</div>;
  }
}

// Helper: Custom File drop zone UI
function DropZone({ onSelect, accept, multiple = false, label }: { onSelect: (files: FileList) => void; accept: string; multiple?: boolean; label: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.type === "dragenter" || e.type === "dragover") setDrag(true);
    else if (e.type === "dragleave") setDrag(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    if (e.dataTransfer.files?.length) onSelect(e.dataTransfer.files);
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${
        drag ? "border-brand bg-brand/5 scale-[0.99]" : "border-white/10 hover:border-white/20 bg-white/5"
      }`}
    >
      <input type="file" ref={inputRef} className="hidden" accept={accept} multiple={multiple} onChange={(e) => e.target.files && onSelect(e.target.files)} />
      <Upload size={32} className="mx-auto text-white/30 mb-4" />
      <p className="text-sm font-bold text-white/90">{label}</p>
      <p className="text-xs text-white/40 mt-1.5">or drag and drop your files here</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. PDF to JPG Tool
// ─────────────────────────────────────────────────────────────────────────────
function PdfToJpgTool() {
  const [file, setFile] = useState<File | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const processPdf = async (files: FileList) => {
    const f = files[0];
    if (!f) return;
    setFile(f);
    setLoading(true);
    setImages([]);

    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
      const pdf = await pdfjs.getDocument({ data: await f.arrayBuffer() }).promise;
      const urls: string[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          await page.render({ canvasContext: ctx, viewport }).promise;
          urls.push(canvas.toDataURL("image/jpeg", 0.9));
        }
      }
      setImages(urls);
    } catch (err) {
      toast.error("Failed to parse PDF document.");
    } finally {
      setLoading(false);
    }
  };

  const downloadAll = () => {
    images.forEach((url, i) => {
      const a = document.createElement("a");
      a.href = url;
      a.download = `${file?.name.replace(/\.[^.]+$/, "")}_page_${i + 1}.jpg`;
      a.click();
    });
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <Loader2 className="animate-spin text-brand mx-auto mb-4" size={32} />
        <p className="text-sm font-semibold text-white/70">Rendering PDF pages to images...</p>
      </div>
    );
  }

  if (images.length) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-xs text-white/50">Generated {images.length} images from {file?.name}</p>
          <div className="flex gap-2">
            <button onClick={() => { setFile(null); setImages([]); }} className="text-xs border border-white/10 hover:bg-white/5 px-3 py-1.5 rounded-lg cursor-pointer">Start Over</button>
            <button onClick={downloadAll} className="flex items-center gap-1.5 bg-brand px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer hover:brightness-110"><Download size={13} /> Download All</button>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[450px] overflow-y-auto p-2 border border-white/5 rounded-xl bg-black/25">
          {images.map((src, idx) => (
            <div key={idx} className="relative group rounded-lg overflow-hidden border border-white/10">
              <img src={src} alt={`Page ${idx + 1}`} className="w-full h-auto object-contain bg-white" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <a href={src} download={`${file?.name.replace(/\.[^.]+$/, "")}_page_${idx + 1}.jpg`} className="p-2 bg-brand rounded-full hover:scale-105 transition-transform">
                  <Download size={14} />
                </a>
              </div>
              <div className="absolute bottom-1 left-1 bg-black/80 px-1.5 py-0.5 rounded text-[10px] text-white/70">Page {idx + 1}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return <DropZone onSelect={processPdf} accept=".pdf" label="Select PDF file to extract images" />;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. JPG to PDF Tool
// ─────────────────────────────────────────────────────────────────────────────
interface ImageItem {
  id: string;
  file: File;
  preview: string;
}

function JpgToPdfTool() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(false);

  const addImages = (files: FileList) => {
    const list: ImageItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith("image/")) {
        list.push({
          id: Math.random().toString(36).substring(2),
          file,
          preview: URL.createObjectURL(file)
        });
      }
    }
    setImages(prev => [...prev, ...list]);
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => {
      if (img.id === id) { URL.revokeObjectURL(img.preview); return false; }
      return true;
    }));
  };

  const generatePdf = async () => {
    if (!images.length) return;
    setLoading(true);
    try {
      const pdfDoc = await PDFDocument.create();
      for (const imgItem of images) {
        const arrayBuffer = await imgItem.file.arrayBuffer();
        let embeddedImage;
        if (imgItem.file.type === "image/png") {
          embeddedImage = await pdfDoc.embedPng(arrayBuffer);
        } else {
          embeddedImage = await pdfDoc.embedJpg(arrayBuffer);
        }
        
        const page = pdfDoc.addPage([embeddedImage.width, embeddedImage.height]);
        page.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width: embeddedImage.width,
          height: embeddedImage.height
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "images_converted.pdf";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF created successfully!");
    } catch (err) {
      toast.error("Failed to generate PDF document.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <Loader2 className="animate-spin text-brand mx-auto mb-4" size={32} />
        <p className="text-sm font-semibold text-white/70">Generating PDF file...</p>
      </div>
    );
  }

  if (images.length) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-xs text-white/50">{images.length} images selected</p>
          <div className="flex gap-2">
            <button onClick={() => { setImages([]); }} className="text-xs border border-white/10 hover:bg-white/5 px-3 py-1.5 rounded-lg cursor-pointer">Clear All</button>
            <button onClick={generatePdf} className="flex items-center gap-1.5 bg-brand px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer hover:brightness-110"><Download size={13} /> Save PDF</button>
          </div>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 max-h-[350px] overflow-y-auto p-3 border border-white/5 rounded-xl bg-black/25">
          {images.map((img) => (
            <div key={img.id} className="relative group aspect-[3/4] rounded-lg overflow-hidden border border-white/10 bg-black">
              <img src={img.preview} alt="" className="w-full h-full object-cover" />
              <button onClick={() => removeImage(img.id)} className="absolute top-1 right-1 p-1 bg-red-600/80 text-white rounded hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 size={12} />
              </button>
            </div>
          ))}
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-lg hover:border-white/20 bg-white/5 cursor-pointer transition-colors aspect-[3/4]">
            <input type="file" className="hidden" accept="image/*" multiple onChange={(e) => e.target.files && addImages(e.target.files)} />
            <Plus size={20} className="text-white/40 mb-1" />
            <span className="text-[10px] font-bold text-white/50">Add more</span>
          </label>
        </div>
      </div>
    );
  }

  return <DropZone onSelect={addImages} accept="image/*" multiple label="Select image files to convert to PDF" />;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Merge PDF Tool
// ─────────────────────────────────────────────────────────────────────────────
function MergePdfTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const addFiles = (selectedFiles: FileList) => {
    const list: File[] = [];
    for (let i = 0; i < selectedFiles.length; i++) {
      if (selectedFiles[i].name.endsWith(".pdf")) {
        list.push(selectedFiles[i]);
      }
    }
    setFiles(prev => [...prev, ...list]);
  };

  const removeFile = (idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const mergeFiles = async () => {
    if (files.length < 2) { toast.error("Please add at least 2 PDF files to merge."); return; }
    setLoading(true);
    try {
      const mergedPdf = await PDFDocument.create();
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }
      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "merged_document.pdf";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDFs merged successfully!");
    } catch (err) {
      toast.error("Failed to merge PDF files.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <Loader2 className="animate-spin text-brand mx-auto mb-4" size={32} />
        <p className="text-sm font-semibold text-white/70">Merging PDF documents...</p>
      </div>
    );
  }

  if (files.length) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-xs text-white/50">{files.length} PDFs selected</p>
          <div className="flex gap-2">
            <button onClick={() => { setFiles([]); }} className="text-xs border border-white/10 hover:bg-white/5 px-3 py-1.5 rounded-lg cursor-pointer">Clear All</button>
            <button onClick={mergeFiles} className="flex items-center gap-1.5 bg-brand px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer hover:brightness-110"><Combine size={13} /> Merge Files</button>
          </div>
        </div>
        <div className="space-y-2 max-h-[300px] overflow-y-auto p-2 border border-white/5 rounded-xl bg-black/25">
          {files.map((file, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-[#17172b]">
              <div className="flex items-center gap-3 min-w-0">
                <FileText size={16} className="text-brand shrink-0" />
                <span className="text-xs font-bold text-white/95 truncate pr-4">{file.name}</span>
                <span className="text-[10px] text-white/40">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
              <button onClick={() => removeFile(idx)} className="p-1 text-white/40 hover:text-red-400 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
        <label className="flex items-center justify-center gap-2 border-2 border-dashed border-white/10 rounded-xl py-3 hover:border-white/20 bg-white/5 cursor-pointer transition-colors text-xs font-bold text-white/55">
          <input type="file" className="hidden" accept=".pdf" multiple onChange={(e) => e.target.files && addFiles(e.target.files)} />
          <Plus size={16} /> Add more PDF files
        </label>
      </div>
    );
  }

  return <DropZone onSelect={addFiles} accept=".pdf" multiple label="Select PDF files to merge" />;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Split PDF Tool
// ─────────────────────────────────────────────────────────────────────────────
function SplitPdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [pagesInput, setPagesInput] = useState("");
  const [loading, setLoading] = useState(false);

  const onSelectPdf = async (files: FileList) => {
    const f = files[0];
    if (!f) return;
    setFile(f);
    setLoading(true);
    try {
      const arrayBuffer = await f.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      setNumPages(pdf.getPageCount());
      setPagesInput(`1-${pdf.getPageCount()}`);
    } catch {
      toast.error("Failed to load PDF.");
      setFile(null);
    } finally {
      setLoading(false);
    }
  };

  const splitPdf = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const srcPdf = await PDFDocument.load(arrayBuffer);
      const destPdf = await PDFDocument.create();

      // Simple parser for page inputs like "1-3, 5, 8-10"
      const ranges = pagesInput.split(",");
      const selectedIndices: number[] = [];

      for (const range of ranges) {
        const parts = range.trim().split("-");
        if (parts.length === 1) {
          const idx = parseInt(parts[0]) - 1;
          if (idx >= 0 && idx < numPages) selectedIndices.push(idx);
        } else if (parts.length === 2) {
          const start = parseInt(parts[0]) - 1;
          const end = parseInt(parts[1]) - 1;
          for (let i = Math.max(0, start); i <= Math.min(numPages - 1, end); i++) {
            selectedIndices.push(i);
          }
        }
      }

      if (!selectedIndices.length) {
        toast.error("No valid pages selected.");
        setLoading(false);
        return;
      }

      const copiedPages = await destPdf.copyPages(srcPdf, selectedIndices);
      copiedPages.forEach((page) => destPdf.addPage(page));

      const pdfBytes = await destPdf.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `split_${file.name}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF split and downloaded!");
    } catch {
      toast.error("Failed to split PDF.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <Loader2 className="animate-spin text-brand mx-auto mb-4" size={32} />
        <p className="text-sm font-semibold text-white/70">Processing PDF...</p>
      </div>
    );
  }

  if (file) {
    return (
      <div className="space-y-5 max-w-md mx-auto">
        <div className="flex items-center gap-3 p-3 rounded-lg border border-white/5 bg-[#17172b]">
          <FileText size={18} className="text-brand shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white/90 truncate">{file.name}</p>
            <p className="text-[10px] text-white/40">{numPages} pages · {(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          <button onClick={() => setFile(null)} className="text-xs text-white/40 hover:text-white underline">Change</button>
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-white/75" htmlFor="pg-split">Select Page Range</label>
          <input
            id="pg-split"
            type="text"
            value={pagesInput}
            onChange={(e) => setPagesInput(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none focus:border-brand text-xs transition-colors"
            placeholder="e.g. 1-3, 5, 7-10"
          />
          <p className="text-[10px] text-white/40">Select individual pages or ranges separated by commas (e.g. 1-3, 5).</p>
        </div>
        <button onClick={splitPdf} className="w-full flex items-center justify-center gap-1.5 bg-brand py-2.5 rounded-lg text-xs font-bold cursor-pointer hover:brightness-110">
          <Scissors size={13} /> Extract Pages
        </button>
      </div>
    );
  }

  return <DropZone onSelect={onSelectPdf} accept=".pdf" label="Select PDF file to split" />;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Rotate PDF Tool
// ─────────────────────────────────────────────────────────────────────────────
function RotatePdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [rotation, setRotation] = useState<0 | 90 | 180 | 270>(0);
  const [loading, setLoading] = useState(false);

  const rotate = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const pages = pdf.getPages();
      for (const page of pages) {
        const currentRot = page.getRotation().angle;
        page.setRotation(degrees((currentRot + rotation) % 360));
      }
      const pdfBytes = await pdf.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rotated_${file.name}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Rotated PDF downloaded!");
    } catch {
      toast.error("Failed to rotate PDF.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <Loader2 className="animate-spin text-brand mx-auto mb-4" size={32} />
        <p className="text-sm font-semibold text-white/70">Rotating PDF pages...</p>
      </div>
    );
  }

  if (file) {
    return (
      <div className="space-y-6 max-w-sm mx-auto text-center">
        <div className="flex items-center gap-3 p-3 rounded-lg border border-white/5 bg-[#17172b] text-left">
          <FileText size={18} className="text-brand shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white/90 truncate">{file.name}</p>
          </div>
          <button onClick={() => setFile(null)} className="text-xs text-white/40 hover:text-white underline">Change</button>
        </div>

        <div className="flex items-center justify-center gap-4 py-4">
          <button onClick={() => setRotation((r) => ((r - 90 + 360) % 360) as any)} className="p-2 border border-white/10 hover:bg-white/5 rounded-lg text-xs font-bold flex items-center gap-1"><RotateCw className="scale-x-[-1]" size={14} /> Rotate Left</button>
          <span className="text-sm font-black text-brand">{rotation}°</span>
          <button onClick={() => setRotation((r) => ((r + 90) % 360) as any)} className="p-2 border border-white/10 hover:bg-white/5 rounded-lg text-xs font-bold flex items-center gap-1">Rotate Right <RotateCw size={14} /></button>
        </div>

        <button onClick={rotate} className="w-full flex items-center justify-center gap-1.5 bg-brand py-2.5 rounded-lg text-xs font-bold cursor-pointer hover:brightness-110">
          <Download size={13} /> Save Rotated PDF
        </button>
      </div>
    );
  }

  return <DropZone onSelect={(fs) => fs[0] && setFile(fs[0])} accept=".pdf" label="Select PDF file to rotate" />;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Image Resizer Tool
// ─────────────────────────────────────────────────────────────────────────────
function ImageResizerTool() {
  const [file, setFile] = useState<File | null>(null);
  const [imgUrl, setImgUrl] = useState("");
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [origRatio, setOrigRatio] = useState(1);
  const [lockRatio, setLockRatio] = useState(true);

  const loadFile = (files: FileList) => {
    const f = files[0];
    if (!f) return;
    setFile(f);
    const url = URL.createObjectURL(f);
    setImgUrl(url);
    const img = new Image();
    img.src = url;
    img.onload = () => {
      setWidth(img.width);
      setHeight(img.height);
      setOrigRatio(img.width / img.height);
    };
  };

  const handleWidthChange = (w: number) => {
    setWidth(w);
    if (lockRatio) setHeight(Math.round(w / origRatio));
  };

  const handleHeightChange = (h: number) => {
    setHeight(h);
    if (lockRatio) setWidth(Math.round(h * origRatio));
  };

  const saveResized = () => {
    const img = new Image();
    img.src = imgUrl;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        const a = document.createElement("a");
        a.href = canvas.toDataURL(file?.type || "image/jpeg");
        a.download = `resized_${file?.name}`;
        a.click();
      }
    };
  };

  if (file) {
    return (
      <div className="space-y-6 max-w-sm mx-auto">
        <div className="relative aspect-video border border-white/10 rounded-xl overflow-hidden bg-black/40">
          <img src={imgUrl} alt="" className="w-full h-full object-contain" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-white/60" htmlFor="resize-w">Width (px)</label>
            <input id="resize-w" type="number" value={width} onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)} className="w-full rounded-lg border border-white/10 bg-[#17172b] px-3 py-2 text-xs outline-none focus:border-brand text-white" />
          </div>
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-white/60" htmlFor="resize-h">Height (px)</label>
            <input id="resize-h" type="number" value={height} onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)} className="w-full rounded-lg border border-white/10 bg-[#17172b] px-3 py-2 text-xs outline-none focus:border-brand text-white" />
          </div>
        </div>
        <label className="flex items-center gap-2 text-xs font-bold text-white/60 cursor-pointer">
          <input type="checkbox" checked={lockRatio} onChange={(e) => setLockRatio(e.target.checked)} className="rounded bg-white/5 border-white/10 accent-brand" />
          <span>Lock Aspect Ratio</span>
        </label>
        <div className="flex gap-2">
          <button onClick={() => { setFile(null); URL.revokeObjectURL(imgUrl); }} className="flex-1 text-xs border border-white/10 hover:bg-white/5 py-2.5 rounded-lg cursor-pointer">Back</button>
          <button onClick={saveResized} className="flex-1 bg-brand py-2.5 rounded-lg text-xs font-bold cursor-pointer hover:brightness-110 flex items-center justify-center gap-1"><Download size={13} /> Download</button>
        </div>
      </div>
    );
  }

  return <DropZone onSelect={loadFile} accept="image/*" label="Select image to resize" />;
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Image Compressor Tool
// ─────────────────────────────────────────────────────────────────────────────
function ImageCompressorTool() {
  const [file, setFile] = useState<File | null>(null);
  const [imgUrl, setImgUrl] = useState("");
  const [quality, setQuality] = useState(0.7);
  const [originalSize, setOriginalSize] = useState("");
  const [compressedSize, setCompressedSize] = useState("");
  const [compressedUrl, setCompressedUrl] = useState("");

  const loadFile = (files: FileList) => {
    const f = files[0];
    if (!f) return;
    setFile(f);
    setOriginalSize((f.size / 1024).toFixed(1) + " KB");
    const url = URL.createObjectURL(f);
    setImgUrl(url);
    compress(url, f.type, 0.7);
  };

  const compress = (urlStr: string, type: string, q: number) => {
    const img = new Image();
    img.src = urlStr;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        // Force jpeg compression as png cannot compress quality natively in browser canvas
        const outputType = type === "image/png" ? "image/jpeg" : type;
        const compDataUrl = canvas.toDataURL(outputType, q);
        setCompressedUrl(compDataUrl);
        // Estimate size from base64
        const head = compDataUrl.indexOf(",") + 1;
        const sizeBytes = Math.round((compDataUrl.length - head) * 3 / 4);
        setCompressedSize((sizeBytes / 1024).toFixed(1) + " KB");
      }
    };
  };

  const handleQualityChange = (q: number) => {
    setQuality(q);
    if (imgUrl && file) compress(imgUrl, file.type, q);
  };

  const downloadCompressed = () => {
    const a = document.createElement("a");
    a.href = compressedUrl;
    const ext = file?.type === "image/png" ? "jpg" : file?.name.split(".").pop();
    a.download = `compressed_${file?.name.replace(/\.[^.]+$/, "")}.${ext}`;
    a.click();
  };

  if (file) {
    return (
      <div className="space-y-6 max-w-sm mx-auto">
        <div className="relative aspect-video border border-white/10 rounded-xl overflow-hidden bg-black/40">
          <img src={compressedUrl || imgUrl} alt="" className="w-full h-full object-contain" />
        </div>
        <div className="flex justify-between text-xs text-white/55 font-bold">
          <span>Original: {originalSize}</span>
          <span className="text-green-400">Compressed: {compressedSize}</span>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-bold text-white/60">
            <label htmlFor="comp-quality">Compression Quality</label>
            <span>{Math.round(quality * 100)}%</span>
          </div>
          <input
            id="comp-quality"
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={quality}
            onChange={(e) => handleQualityChange(parseFloat(e.target.value))}
            className="w-full accent-brand bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setFile(null); URL.revokeObjectURL(imgUrl); setCompressedUrl(""); }} className="flex-1 text-xs border border-white/10 hover:bg-white/5 py-2.5 rounded-lg cursor-pointer">Back</button>
          <button onClick={downloadCompressed} className="flex-1 bg-brand py-2.5 rounded-lg text-xs font-bold cursor-pointer hover:brightness-110 flex items-center justify-center gap-1"><Download size={13} /> Save Image</button>
        </div>
      </div>
    );
  }

  return <DropZone onSelect={loadFile} accept="image/*" label="Select image to compress" />;
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. Convert to JPG Tool
// ─────────────────────────────────────────────────────────────────────────────
interface ConvertFileItem {
  id: string;
  name: string;
  size: string;
  file: File;
  previewUrl: string;
  status: "pending" | "converting" | "ready" | "error";
  errorMsg?: string;
  resultUrl?: string;
}

function ConvertToJpgTool() {
  const [files, setFiles] = useState<ConvertFileItem[]>([]);
  const [converting, setConverting] = useState(false);

  const addFiles = (selectedFiles: FileList) => {
    const list: ConvertFileItem[] = [];
    for (let i = 0; i < selectedFiles.length; i++) {
      const f = selectedFiles[i];
      list.push({
        id: Math.random().toString(36).substring(2),
        name: f.name,
        size: (f.size / 1024).toFixed(1) + " KB",
        file: f,
        previewUrl: f.type.startsWith("image/") ? URL.createObjectURL(f) : "",
        status: "pending"
      });
    }
    setFiles(prev => [...prev, ...list]);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(item => {
      if (item.id === id) {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
        if (item.resultUrl) URL.revokeObjectURL(item.resultUrl);
        return false;
      }
      return true;
    }));
  };

  const convertToJpg = async () => {
    setConverting(true);
    const updatedFiles = [...files];

    for (let i = 0; i < updatedFiles.length; i++) {
      const item = updatedFiles[i];
      if (item.status === "ready") continue;

      updatedFiles[i] = { ...item, status: "converting" };
      setFiles([...updatedFiles]);

      try {
        let imageBlob: Blob;
        const fileExt = item.name.split(".").pop()?.toLowerCase();

        if (fileExt === "heic" || item.file.type === "image/heic") {
          const heic2any = (await import("heic2any")).default;
          const result = await heic2any({
            blob: item.file,
            toType: "image/jpeg",
            quality: 0.9
          });
          imageBlob = Array.isArray(result) ? result[0] : result;
        } else if (fileExt === "tif" || fileExt === "tiff" || fileExt === "psd" || fileExt === "raw") {
          throw new Error(`Format .${fileExt} requires backend parsing. Only PNG, GIF, SVG, WEBP, and HEIC are supported client-side.`);
        } else {
          // Standard browser image load to canvas
          imageBlob = await new Promise<Blob>((resolve, reject) => {
            const img = new Image();
            img.src = URL.createObjectURL(item.file);
            img.onload = () => {
              const canvas = document.createElement("canvas");
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext("2d");
              if (ctx) {
                ctx.drawImage(img, 0, 0);
                canvas.toBlob(
                  (b) => (b ? resolve(b) : reject(new Error("Canvas conversion failed"))),
                  "image/jpeg",
                  0.9
                );
              } else {
                reject(new Error("Canvas context failed"));
              }
            };
            img.onerror = () => reject(new Error("Failed to load image"));
          });
        }

        const resultUrl = URL.createObjectURL(imageBlob);
        updatedFiles[i] = {
          ...item,
          status: "ready",
          resultUrl
        };
      } catch (err: any) {
        updatedFiles[i] = {
          ...item,
          status: "error",
          errorMsg: err?.message || "Failed to convert"
        };
      }
      setFiles([...updatedFiles]);
    }
    setConverting(false);
  };

  const downloadAll = () => {
    files.forEach((item) => {
      if (item.resultUrl) {
        const a = document.createElement("a");
        a.href = item.resultUrl;
        a.download = `${item.name.replace(/\.[^.]+$/, "")}.jpg`;
        a.click();
      }
    });
  };

  if (files.length) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-xs text-white/50">{files.length} images selected</p>
          <div className="flex gap-2">
            <button onClick={() => { setFiles([]); }} className="text-xs border border-white/10 hover:bg-white/5 px-3 py-1.5 rounded-lg cursor-pointer">Clear All</button>
            {files.some(f => f.status === "ready") && (
              <button onClick={downloadAll} className="flex items-center gap-1.5 bg-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer hover:bg-blue-500"><Download size={13} /> Download JPGs</button>
            )}
            <button onClick={convertToJpg} disabled={converting} className="flex items-center gap-1.5 bg-brand px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer hover:brightness-110 disabled:opacity-50">
              {converting ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
              <span>Convert to JPG</span>
            </button>
          </div>
        </div>
        <div className="space-y-2 max-h-[350px] overflow-y-auto p-2 border border-white/5 rounded-xl bg-black/25">
          {files.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-[#17172b]">
              <div className="flex items-center gap-3 min-w-0">
                {item.previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.previewUrl} alt="" className="w-8 h-8 object-cover rounded border border-white/10" />
                ) : (
                  <div className="w-8 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white/40">IMG</div>
                )}
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white/95 truncate pr-4 block">{item.name}</span>
                  <span className="text-[10px] text-white/40 block mt-0.5">{item.size}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {item.status === "converting" && <span className="text-[10px] font-bold text-blue-400 flex items-center gap-1"><Loader2 size={10} className="animate-spin" /> Converting...</span>}
                {item.status === "ready" && <span className="text-[10px] font-bold text-green-400">✓ Ready</span>}
                {item.status === "error" && <span className="text-[10px] font-bold text-red-400" title={item.errorMsg}>Error</span>}
                <button onClick={() => removeFile(item.id)} className="p-1 text-white/40 hover:text-red-400 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return <DropZone onSelect={addFiles} accept="image/*,.heic" multiple label="Select PNG, WebP, GIF, SVG, or HEIC files to convert to JPG" />;
}

// ─────────────────────────────────────────────────────────────────────────────
// 8b. Convert from JPG Tool
// ─────────────────────────────────────────────────────────────────────────────
function ConvertFromJpgTool() {
  const [files, setFiles] = useState<ImageItem[]>([]);
  const [converting, setConverting] = useState(false);
  const [outputMode, setOutputMode] = useState<"png" | "gif-animated">("png");
  const [gifSpeed, setGifSpeed] = useState(0.5); // seconds per frame
  const [gifWidth, setGifWidth] = useState(640);
  const [gifHeight, setGifHeight] = useState(480);
  const [animatedGifUrl, setAnimatedGifUrl] = useState("");

  const addFiles = (selectedFiles: FileList) => {
    const list: ImageItem[] = [];
    for (let i = 0; i < selectedFiles.length; i++) {
      const f = selectedFiles[i];
      if (f.type.startsWith("image/") || f.name.endsWith(".jpg") || f.name.endsWith(".jpeg")) {
        list.push({
          id: Math.random().toString(36).substring(2),
          file: f,
          preview: URL.createObjectURL(f)
        });
      }
    }
    setFiles(prev => [...prev, ...list]);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(img => {
      if (img.id === id) { URL.revokeObjectURL(img.preview); return false; }
      return true;
    }));
  };

  const convertToPng = async () => {
    setConverting(true);
    try {
      for (const item of files) {
        const img = new Image();
        img.src = item.preview;
        await new Promise<void>((resolve, reject) => {
          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(img, 0, 0);
              const a = document.createElement("a");
              a.href = canvas.toDataURL("image/png");
              a.download = `${item.file.name.replace(/\.[^.]+$/, "")}.png`;
              a.click();
              resolve();
            } else {
              reject(new Error("Canvas failure"));
            }
          };
          img.onerror = () => reject(new Error("Failed to load image"));
        });
      }
      toast.success("Images converted to PNG successfully!");
    } catch {
      toast.error("Failed to convert images.");
    } finally {
      setConverting(false);
    }
  };

  const makeAnimatedGif = async () => {
    if (files.length < 2) {
      toast.error("Please add at least 2 JPG images to create an animated GIF.");
      return;
    }
    setConverting(true);
    try {
      const gifshot = (await import("gifshot")).default;
      const imagesList: string[] = files.map(item => item.preview);

      gifshot.createGIF({
        images: imagesList,
        interval: gifSpeed,
        gifWidth: gifWidth,
        gifHeight: gifHeight,
        numWorkers: 2,
        frameDuration: gifSpeed * 10
      }, (obj: any) => {
        if (!obj.error) {
          setAnimatedGifUrl(obj.image);
          toast.success("Animated GIF created!");
        } else {
          toast.error("Failed to compile GIF: " + obj.errorMsg);
        }
        setConverting(false);
      });
    } catch (err: any) {
      toast.error("Error creating GIF: " + err.message);
      setConverting(false);
    }
  };

  const downloadAnimatedGif = () => {
    if (!animatedGifUrl) return;
    const a = document.createElement("a");
    a.href = animatedGifUrl;
    a.download = "animated_photo.gif";
    a.click();
  };

  if (converting) {
    return (
      <div className="text-center py-10">
        <Loader2 className="animate-spin text-brand mx-auto mb-4" size={32} />
        <p className="text-sm font-semibold text-white/70">Processing files...</p>
      </div>
    );
  }

  if (files.length) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => { setOutputMode("png"); setAnimatedGifUrl(""); }}
              className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all border ${
                outputMode === "png"
                  ? "bg-brand text-white border-brand"
                  : "border-white/10 text-white/60 hover:bg-white/5"
              }`}
            >
              Convert to PNG
            </button>
            <button
              onClick={() => { setOutputMode("gif-animated"); }}
              className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all border ${
                outputMode === "gif-animated"
                  ? "bg-brand text-white border-brand"
                  : "border-white/10 text-white/60 hover:bg-white/5"
              }`}
            >
              Create Animated GIF
            </button>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setFiles([]); setAnimatedGifUrl(""); }} className="text-xs border border-white/10 hover:bg-white/5 px-3 py-1.5 rounded-lg cursor-pointer">Clear All</button>
            {outputMode === "png" ? (
              <button onClick={convertToPng} className="flex items-center gap-1.5 bg-brand px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer hover:brightness-110"><RefreshCw size={13} /> Convert to PNG</button>
            ) : (
              <>
                {animatedGifUrl && (
                  <button onClick={downloadAnimatedGif} className="flex items-center gap-1.5 bg-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer hover:bg-blue-500"><Download size={13} /> Save GIF</button>
                )}
                <button onClick={makeAnimatedGif} className="flex items-center gap-1.5 bg-brand px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer hover:brightness-110"><Plus size={13} /> Compile GIF</button>
              </>
            )}
          </div>
        </div>

        {outputMode === "gif-animated" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-black/20 p-4 border border-white/5 rounded-xl">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider">GIF Animation Settings</h3>
              
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-white/60">
                  <label htmlFor="gif-delay">Speed (seconds per frame)</label>
                  <span>{gifSpeed}s</span>
                </div>
                <input
                  id="gif-delay"
                  type="range"
                  min="0.1"
                  max="3.0"
                  step="0.1"
                  value={gifSpeed}
                  onChange={(e) => setGifSpeed(parseFloat(e.target.value))}
                  className="w-full accent-brand"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-white/60" htmlFor="gif-w">Width (px)</label>
                  <input id="gif-w" type="number" value={gifWidth} onChange={(e) => setGifWidth(parseInt(e.target.value) || 320)} className="w-full rounded-lg border border-white/10 bg-[#17172b] px-3 py-1.5 text-xs outline-none focus:border-brand text-white" />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-white/60" htmlFor="gif-h">Height (px)</label>
                  <input id="gif-h" type="number" value={gifHeight} onChange={(e) => setGifHeight(parseInt(e.target.value) || 240)} className="w-full rounded-lg border border-white/10 bg-[#17172b] px-3 py-1.5 text-xs outline-none focus:border-brand text-white" />
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center border-l border-white/5 pl-6 min-h-[200px]">
              {animatedGifUrl ? (
                <div className="space-y-2 text-center">
                  <p className="text-[10px] font-bold text-green-400">✓ Compilation Complete</p>
                  <div className="border border-white/10 rounded-lg overflow-hidden max-h-[200px] max-w-[250px] bg-black">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={animatedGifUrl} alt="Compiled GIF Preview" className="w-full h-full object-contain" />
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-1">
                  <ImageIcon size={28} className="mx-auto text-white/20" />
                  <p className="text-xs text-white/40">Preview will appear here after compiling.</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 max-h-[350px] overflow-y-auto p-3 border border-white/5 rounded-xl bg-black/25">
          {files.map((img) => (
            <div key={img.id} className="relative group aspect-[3/4] rounded-lg overflow-hidden border border-white/10 bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.preview} alt="" className="w-full h-full object-cover" />
              <button onClick={() => removeFile(img.id)} className="absolute top-1 right-1 p-1 bg-red-600/80 text-white rounded hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 size={12} />
              </button>
            </div>
          ))}
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-lg hover:border-white/20 bg-white/5 cursor-pointer transition-colors aspect-[3/4]">
            <input type="file" className="hidden" accept="image/jpeg,image/jpg" multiple onChange={(e) => e.target.files && addFiles(e.target.files)} />
            <Plus size={20} className="text-white/40 mb-1" />
            <span className="text-[10px] font-bold text-white/50">Add more</span>
          </label>
        </div>
      </div>
    );
  }

  return <DropZone onSelect={addFiles} accept="image/jpeg,image/jpg" multiple label="Select JPG image files to convert or stitch into a GIF" />;
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. Crop Image Tool
// ─────────────────────────────────────────────────────────────────────────────
function CropImageTool() {
  const [file, setFile] = useState<File | null>(null);
  const [imgUrl, setImgUrl] = useState("");
  const [cropBox, setCropBox] = useState({ x: 15, y: 15, w: 70, h: 70 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setStartPos({ x, y });
    setCropBox({ x, y, w: 0, h: 0 });
    setIsDrawing(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const currX = ((e.clientX - rect.left) / rect.width) * 100;
    const currY = ((e.clientY - rect.top) / rect.height) * 100;

    const x = Math.max(0, Math.min(100, Math.min(startPos.x, currX)));
    const y = Math.max(0, Math.min(100, Math.min(startPos.y, currY)));
    const w = Math.max(0, Math.min(100 - x, Math.abs(startPos.x - currX)));
    const h = Math.max(0, Math.min(100 - y, Math.abs(startPos.y - currY)));

    setCropBox({ x, y, w, h });
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    if (cropBox.w < 2 || cropBox.h < 2) {
      setCropBox({ x: 15, y: 15, w: 70, h: 70 });
    }
  };

  const crop = () => {
    if (!file) return;
    const img = new Image();
    img.src = imgUrl;
    img.onload = () => {
      const leftPx = Math.round(img.width * (cropBox.x / 100));
      const topPx = Math.round(img.height * (cropBox.y / 100));
      const widthPx = Math.round(img.width * (cropBox.w / 100));
      const heightPx = Math.round(img.height * (cropBox.h / 100));

      if (widthPx <= 0 || heightPx <= 0) {
        toast.error("Invalid crop selection.");
        return;
      }

      const canvas = document.createElement("canvas");
      canvas.width = widthPx;
      canvas.height = heightPx;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, leftPx, topPx, widthPx, heightPx, 0, 0, widthPx, heightPx);
        const a = document.createElement("a");
        a.href = canvas.toDataURL(file.type || "image/jpeg");
        a.download = `cropped_${file.name}`;
        a.click();
      }
    };
  };

  if (file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto flex flex-col items-center w-full">
        {/* Large Crop Canvas Workspace */}
        <div
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="relative w-full max-h-[60vh] border border-white/10 rounded-2xl overflow-hidden bg-black/40 cursor-crosshair select-none flex items-center justify-center"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imgUrl} alt="" className="max-w-full max-h-[60vh] object-contain pointer-events-none" />

          {/* Dynamic Selection Overlay Box */}
          <div
            style={{
              position: "absolute",
              top: `${cropBox.y}%`,
              left: `${cropBox.x}%`,
              width: `${cropBox.w}%`,
              height: `${cropBox.h}%`,
              border: "2px dashed #3b82f6",
              boxShadow: "0 0 0 9999px rgba(0,0,0,0.65)",
              pointerEvents: "none",
              zIndex: 10
            }}
          >
            {/* Crop handles inside the selection box */}
            <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full" />
            <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full" />
            <div className="absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full" />
            <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full" />
          </div>
        </div>

        <div className="text-center text-xs text-white/50">
          💡 Click and drag your mouse on the image to draw a new crop area.
        </div>

        <div className="flex gap-4 w-full max-w-md">
          <button
            onClick={() => { setFile(null); URL.revokeObjectURL(imgUrl); }}
            className="flex-1 text-xs border border-white/10 hover:bg-white/5 py-2.5 rounded-xl cursor-pointer font-bold transition-all"
          >
            Back
          </button>
          <button
            onClick={crop}
            className="flex-1 bg-brand py-2.5 rounded-xl text-xs font-bold cursor-pointer hover:brightness-110 flex items-center justify-center gap-1.5 transition-all"
          >
            <Download size={13} /> Crop & Save
          </button>
        </div>
      </div>
    );
  }

  return <DropZone onSelect={(fs) => { if (fs[0]) { setFile(fs[0]); setImgUrl(URL.createObjectURL(fs[0])); } }} accept="image/*" label="Select image to crop" />;
}

// ─────────────────────────────────────────────────────────────────────────────
// 9b. Rotate Image Tool
// ─────────────────────────────────────────────────────────────────────────────
function RotateImageTool() {
  const [file, setFile] = useState<File | null>(null);
  const [imgUrl, setImgUrl] = useState("");
  const [rotation, setRotation] = useState<0 | 90 | 180 | 270>(0);

  const rotate = () => {
    if (!file) return;
    const img = new Image();
    img.src = imgUrl;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const angle = (rotation * Math.PI) / 180;
      const isLandscape = rotation === 90 || rotation === 270;

      canvas.width = isLandscape ? img.height : img.width;
      canvas.height = isLandscape ? img.width : img.height;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(angle);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);

        const a = document.createElement("a");
        a.href = canvas.toDataURL(file.type || "image/jpeg");
        a.download = `rotated_${file.name}`;
        a.click();
      }
    };
  };

  if (file) {
    return (
      <div className="space-y-6 max-w-xl mx-auto flex flex-col items-center w-full">
        <div className="relative w-full max-h-[50vh] border border-white/10 rounded-2xl overflow-hidden bg-black/40 flex items-center justify-center p-4">
          <img
            src={imgUrl}
            alt=""
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: "transform 0.2s ease",
              maxWidth: "100%",
              maxHeight: "45vh",
              objectFit: "contain"
            }}
          />
        </div>

        <div className="flex gap-4">
          <button onClick={() => setRotation((r) => ((r - 90 + 360) % 360) as any)} className="p-2 border border-white/10 hover:bg-white/5 rounded-lg text-xs font-bold flex items-center gap-1"><RotateCw className="scale-x-[-1]" size={14} /> Rotate Left</button>
          <span className="text-sm font-black text-brand self-center">{rotation}°</span>
          <button onClick={() => setRotation((r) => ((r + 90) % 360) as any)} className="p-2 border border-white/10 hover:bg-white/5 rounded-lg text-xs font-bold flex items-center gap-1">Rotate Right <RotateCw size={14} /></button>
        </div>

        <div className="flex gap-4 w-full max-w-md">
          <button onClick={() => { setFile(null); URL.revokeObjectURL(imgUrl); setRotation(0); }} className="flex-1 text-xs border border-white/10 hover:bg-white/5 py-2.5 rounded-xl font-bold cursor-pointer transition-all">Back</button>
          <button onClick={rotate} className="flex-1 bg-brand py-2.5 rounded-xl text-xs font-bold cursor-pointer hover:brightness-110 flex items-center justify-center gap-1.5 transition-all"><Download size={13} /> Save Image</button>
        </div>
      </div>
    );
  }

  return <DropZone onSelect={(fs) => { if (fs[0]) { setFile(fs[0]); setImgUrl(URL.createObjectURL(fs[0])); } }} accept="image/*" label="Select image to rotate" />;
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. Word / Character Counter Tool
// ─────────────────────────────────────────────────────────────────────────────
function WordCounterTool() {
  const [text, setText] = useState("");

  const trimmed = text.trim();
  const words = trimmed === "" ? 0 : trimmed.split(/\s+/).length;
  const charactersWithSpaces = text.length;
  const charactersWithoutSpaces = text.replace(/\s/g, "").length;
  const paragraphs = trimmed === "" ? 0 : text.split(/\n+/).filter(p => p.trim() !== "").length;
  const readTimeMins = Math.ceil(words / 200); // 200 words per minute average reading speed

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center">
          <p className="text-[10px] font-bold text-white/40 uppercase">Words</p>
          <p className="text-lg font-black text-brand mt-1">{words}</p>
        </div>
        <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center">
          <p className="text-[10px] font-bold text-white/40 uppercase">Characters</p>
          <p className="text-lg font-black text-brand mt-1">{charactersWithSpaces}</p>
        </div>
        <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center">
          <p className="text-[10px] font-bold text-white/40 uppercase">No Spaces</p>
          <p className="text-lg font-black text-brand mt-1">{charactersWithoutSpaces}</p>
        </div>
        <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center">
          <p className="text-[10px] font-bold text-white/40 uppercase">Paragraphs</p>
          <p className="text-lg font-black text-brand mt-1">{paragraphs}</p>
        </div>
        <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center col-span-2 sm:col-span-1">
          <p className="text-[10px] font-bold text-white/40 uppercase">Reading Time</p>
          <p className="text-lg font-black text-brand mt-1">~{readTimeMins}m</p>
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-white/60" htmlFor="counter-txt">Enter or Paste your Text</label>
        <textarea
          id="counter-txt"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start typing or paste your content here..."
          className="w-full h-64 rounded-xl border border-white/10 bg-white/5 p-4 text-xs outline-none focus:border-brand text-white resize-none transition-colors"
        />
      </div>
      <div className="flex justify-end">
        <button onClick={() => setText("")} className="text-xs text-white/40 hover:text-white underline">Clear Text</button>
      </div>
    </div>
  );
}


