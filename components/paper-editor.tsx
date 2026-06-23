"use client";

import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Heading from "@tiptap/extension-heading";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";

import { FontSize, PageBreak } from "@/lib/tiptap-extensions";

import {
  AlignCenter, AlignLeft, AlignRight, AlignJustify, Bold, ChevronLeft, ChevronRight,
  Download, Heading1, Heading2, Heading3, ImagePlus, Italic, Strikethrough,
  List, ListOrdered, RotateCcw, RotateCw, Save, Table2, Grid3X3,
  UnderlineIcon, ZoomIn, ZoomOut, PanelLeftClose, PanelLeftOpen,
  SeparatorHorizontal
} from "lucide-react";
import { toast } from "sonner";
import type { PaperPage, PaperProject } from "@/lib/types";

type Props = { project: PaperProject; demoMode?: boolean };

const FONT_FAMILIES = [
  { name: "Default (Sans)", value: "sans-serif" },
  { name: "Arial", value: "Arial" },
  { name: "Times New Roman", value: "Times New Roman" },
  { name: "Georgia", value: "Georgia" },
  { name: "Courier New", value: "Courier New" },
  { name: "Verdana", value: "Verdana" },
  { name: "Trebuchet MS", value: "Trebuchet MS" },
  { name: "Impact", value: "Impact" },
];

const FONT_SIZES = [
  "12px", "13px", "14px", "15px", "16px", "18px", "20px", "24px", "32px", "48px"
];

export function PaperEditor({ project, demoMode = false }: Props) {
  const [title, setTitle] = useState(project.title);
  const [pages, setPages] = useState<PaperPage[]>(project.pages ?? []);
  const [activePage, setActivePage] = useState(0);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [exporting, setExporting] = useState<"pdf" | "docx" | null>(null);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [showOriginal, setShowOriginal] = useState(true);

  // Auto-hide original panel on mobile devices
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setShowOriginal(false);
    }
  }, []);
  const active = pages[activePage];

  // We use refs to avoid re-initializing TipTap when pages/activePage state shifts
  const activePageRef = useRef(activePage);
  useEffect(() => { activePageRef.current = activePage; }, [activePage]);

  const pagesRef = useRef(pages);
  useEffect(() => { pagesRef.current = pages; }, [pages]);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: false }),
      Heading.configure({ levels: [1, 2, 3] }),
      Underline,
      Image,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TextStyle,
      FontFamily,
      Color,
      Highlight.configure({ multicolor: true }),
      FontSize,
      PageBreak
    ],
    content: active?.html ?? "<p></p>",
    editorProps: {
      attributes: {
        class: "editor-content ProseMirror outline-none min-h-[800px] text-gray-900",
        style: "color: #111827; font-size: 15px; line-height: 1.7;"
      }
    },
    onUpdate({ editor: cur }) {
      setDirty(true);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const html = cur.getHTML();
        setPages((ps) => ps.map((p, i) => (i === activePageRef.current ? { ...p, html } : p)));
      }, 150);
    }
  }, []);

  // Update editor content when active page switches
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    const page = pagesRef.current[activePage];
    if (editor && page) {
      editor.commands.setContent(page.html || "<p></p>");
    }
    setRotation(0);
    setZoom(1);
  }, [activePage, editor]);

  function flushChanges() {
    if (debounceRef.current && editor) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
      const html = editor.getHTML();
      const updated = pagesRef.current.map((p, i) => (i === activePageRef.current ? { ...p, html } : p));
      setPages(updated);
      pagesRef.current = updated;
      return updated;
    }
    return pagesRef.current;
  }

  async function save() {
    if (demoMode) { setDirty(false); toast.success("Changes kept in session."); return; }
    setSaving(true);
    const currentPages = flushChanges();
    const res = await fetch(`/api/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, pages: currentPages })
    });
    setSaving(false);
    if (!res.ok) { toast.error("Save failed."); return; }
    setDirty(false); toast.success("Saved.");
  }

  async function downloadPdf() {
    setExporting("pdf");
    const html2pdf = (await import("html2pdf.js")).default;
    const currentPages = flushChanges();
    const container = document.createElement("div");
    container.innerHTML = currentPages.map((p) => p.html).join('<div style="page-break-after:always"></div>');
    container.className = "editor-content";
    container.style.cssText = "color:#111827;font-size:15px;line-height:1.7;";
    await html2pdf().set({
      filename: `${title}.pdf`, margin: 12,
      image: { type: "jpeg", quality: 0.96 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
    }).from(container).save();
    if (!demoMode) await fetch("/api/downloads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectId: project.id, type: "pdf" }) });
    setExporting(null);
  }

  async function downloadDocx() {
    setExporting("docx");
    const currentPages = flushChanges();
    const combined = currentPages.map((p) => p.html).join('<div style="page-break-after:always"></div>');
    const res = await fetch("/api/export/docx", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, html: combined }) });
    if (!res.ok) { toast.error("DOCX export failed."); setExporting(null); return; }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    Object.assign(document.createElement("a"), { href: url, download: `${title}.docx` }).click();
    URL.revokeObjectURL(url);
    if (!demoMode) await fetch("/api/downloads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectId: project.id, type: "docx" }) });
    setExporting(null);
  }

  if (!active) return <div className="p-8 text-center text-gray-500">No pages found.</div>;

  const isLandscapeRotated = (rotation / 90) % 2 !== 0;

  // Active styles helpers
  const activeFontFamily = editor?.getAttributes("textStyle").fontFamily || "sans-serif";
  const activeFontSize = editor?.getAttributes("textStyle").fontSize || "15px";
  const activeColor = editor?.getAttributes("textStyle").color || "#111827";
  const activeHighlight = editor?.getAttributes("highlight").color || "#ffffff";
  const isBorderlessTable = editor?.isActive("table", { class: "borderless" });

  return (
    <div className="flex flex-col" style={{ height: "100vh", minHeight: 600, background: "#1a1a2a" }}>

      {/* ── Top title bar ── */}
      <div style={{ background: "#111120", borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        className="flex items-center justify-between px-4 py-2 flex-shrink-0 gap-3">
        <input
          value={title}
          onChange={(e) => { setTitle(e.target.value); setDirty(true); }}
          className="flex-1 min-w-0 bg-transparent text-sm font-bold text-white outline-none placeholder-white/30 focus:bg-white/5 focus:px-2 rounded transition-all"
          placeholder="Document title"
        />
        <span className="text-xs text-white/40 flex-shrink-0 mr-2">
          {demoMode ? "Demo" : saving ? "Saving…" : dirty ? "● Unsaved" : "✓ Saved"}
        </span>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => setShowOriginal((v) => !v)}
            title={showOriginal ? "Hide original" : "Show original"}
            className="flex h-7 px-2.5 items-center gap-1 rounded border border-white/10 text-xs font-semibold text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            {showOriginal ? <PanelLeftClose size={13} /> : <PanelLeftOpen size={13} />}
            <span>{showOriginal ? "Hide Original" : "Show Original"}</span>
          </button>

          <div className="w-px h-4 bg-white/10 mx-1" />

          <button
            onClick={save}
            className="flex h-7 px-2.5 items-center gap-1 rounded border border-white/10 text-xs font-semibold text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            <Save size={13} />
            <span>Save</span>
          </button>
          
          <button
            disabled={exporting !== null}
            onClick={downloadPdf}
            className="flex h-7 px-3 items-center gap-1 rounded bg-blue-600 text-xs font-bold text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
          >
            <Download size={11} />
            <span>{exporting === "pdf" ? "PDF..." : "PDF"}</span>
          </button>
          
          <button
            disabled={exporting !== null}
            onClick={downloadDocx}
            className="flex h-7 px-3 items-center gap-1 rounded border border-white/20 text-xs font-bold text-white/80 hover:bg-white/10 disabled:opacity-50 transition-colors"
          >
            <Download size={11} />
            <span>{exporting === "docx" ? "DOCX..." : "DOCX"}</span>
          </button>
        </div>
      </div>

      {/* ── Ribbon toolbar ── */}
      <div style={{ background: "#111120", borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        className="flex items-center gap-0.5 px-2 py-1 flex-shrink-0 overflow-x-auto hide-scrollbar">

        {/* Undo / Redo */}
        <TB label="Undo" onClick={() => editor?.chain().focus().undo().run()}><RotateCcw size={14} /></TB>
        <TB label="Redo" onClick={() => editor?.chain().focus().redo().run()}><RotateCw size={14} /></TB>
        <Sep />

        {/* Font Family selector */}
        <select
          value={activeFontFamily}
          onChange={(e) => editor?.chain().focus().setFontFamily(e.target.value).run()}
          style={{ background: "#1b1b2f", border: "1px solid rgba(255,255,255,0.15)" }}
          className="h-6 px-1.5 text-xs text-white rounded outline-none cursor-pointer focus:border-blue-500 mr-1"
        >
          {FONT_FAMILIES.map((f) => (
            <option key={f.value} value={f.value}>{f.name}</option>
          ))}
        </select>

        {/* Font Size selector */}
        <select
          value={activeFontSize}
          onChange={(e) => editor?.chain().focus().setFontSize(e.target.value).run()}
          style={{ background: "#1b1b2f", border: "1px solid rgba(255,255,255,0.15)" }}
          className="h-6 px-1.5 text-xs text-white rounded outline-none cursor-pointer focus:border-blue-500 mr-1"
        >
          <option value="">Size</option>
          {FONT_SIZES.map((sz) => (
            <option key={sz} value={sz}>{sz}</option>
          ))}
        </select>
        <Sep />

        {/* Basic styles */}
        <TB label="Bold" active={editor?.isActive("bold")} onClick={() => editor?.chain().focus().toggleBold().run()}><Bold size={14} /></TB>
        <TB label="Italic" active={editor?.isActive("italic")} onClick={() => editor?.chain().focus().toggleItalic().run()}><Italic size={14} /></TB>
        <TB label="Underline" active={editor?.isActive("underline")} onClick={() => editor?.chain().focus().toggleUnderline().run()}><UnderlineIcon size={14} /></TB>
        <TB label="Strikethrough" active={editor?.isActive("strike")} onClick={() => editor?.chain().focus().toggleStrike().run()}><Strikethrough size={14} /></TB>
        <Sep />

        {/* Native Text Color Picker */}
        <label className="relative flex h-6 w-6 items-center justify-center rounded cursor-pointer hover:bg-white/10" title="Text Color">
          <span className="text-xs font-black" style={{ color: activeColor }}>A</span>
          <input
            type="color"
            value={activeColor.startsWith("#") ? activeColor : "#111827"}
            onChange={(e) => editor?.chain().focus().setColor(e.target.value).run()}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          />
        </label>

        {/* Native Highlight/Background Color Picker */}
        <label className="relative flex h-6 w-6 items-center justify-center rounded cursor-pointer hover:bg-white/10" title="Highlight Color">
          <span className="text-[10px] font-bold bg-yellow-300 text-black px-0.5 rounded">ab</span>
          <input
            type="color"
            value={activeHighlight.startsWith("#") ? activeHighlight : "#ffff00"}
            onChange={(e) => editor?.chain().focus().toggleHighlight({ color: e.target.value }).run()}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          />
        </label>
        <button
          onClick={() => editor?.chain().focus().unsetHighlight().run()}
          className="px-1 text-[9px] font-bold text-white/40 hover:text-white transition-colors"
          title="Clear Highlight"
        >
          Clear
        </button>
        <Sep />

        {/* Headings */}
        <TB label="H1" active={editor?.isActive("heading", { level: 1 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}><Heading1 size={14} /></TB>
        <TB label="H2" active={editor?.isActive("heading", { level: 2 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 size={14} /></TB>
        <TB label="H3" active={editor?.isActive("heading", { level: 3 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 size={14} /></TB>
        <Sep />

        {/* Alignment */}
        <TB label="Left" onClick={() => editor?.chain().focus().setTextAlign("left").run()}><AlignLeft size={14} /></TB>
        <TB label="Center" onClick={() => editor?.chain().focus().setTextAlign("center").run()}><AlignCenter size={14} /></TB>
        <TB label="Right" onClick={() => editor?.chain().focus().setTextAlign("right").run()}><AlignRight size={14} /></TB>
        <TB label="Justify" onClick={() => editor?.chain().focus().setTextAlign("justify").run()}><AlignJustify size={14} /></TB>
        <Sep />

        {/* Lists */}
        <TB label="Bullet list" active={editor?.isActive("bulletList")} onClick={() => editor?.chain().focus().toggleBulletList().run()}><List size={14} /></TB>
        <TB label="Numbered list" active={editor?.isActive("orderedList")} onClick={() => editor?.chain().focus().toggleOrderedList().run()}><ListOrdered size={14} /></TB>
        <Sep />

        {/* Page Break */}
        <TB label="Insert Page Break" onClick={() => editor?.chain().focus().setPageBreak().run()}><SeparatorHorizontal size={14} /></TB>
        <Sep />

        {/* Image / Tables */}
        <TB label="Image URL" onClick={() => { const u = window.prompt("Image URL"); if (u) editor?.chain().focus().setImage({ src: u }).run(); }}><ImagePlus size={14} /></TB>
        <TB label="Insert Table" onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}><Table2 size={14} /></TB>

        {/* Advanced Table Operations (Visible when table is active) */}
        {editor?.isActive("table") && (
          <div className="flex items-center gap-0.5 ml-2 bg-white/5 px-1 py-0.5 rounded border border-white/10">
            <span className="text-[9px] text-white/40 font-bold px-1 font-mono uppercase">Table:</span>
            <button onClick={() => editor.chain().focus().addRowBefore().run()} className="px-1 text-[10px] text-white/60 hover:text-white" title="Add Row Above">+Row A</button>
            <button onClick={() => editor.chain().focus().addRowAfter().run()} className="px-1 text-[10px] text-white/60 hover:text-white" title="Add Row Below">+Row B</button>
            <button onClick={() => editor.chain().focus().addColumnBefore().run()} className="px-1 text-[10px] text-white/60 hover:text-white" title="Add Col Left">+Col L</button>
            <button onClick={() => editor.chain().focus().addColumnAfter().run()} className="px-1 text-[10px] text-white/60 hover:text-white" title="Add Col Right">+Col R</button>
            <div className="w-px h-3 bg-white/15 mx-1" />
            <button onClick={() => editor.chain().focus().mergeCells().run()} className="px-1 text-[10px] text-white/60 hover:text-white" title="Merge Cells">Merge</button>
            <button onClick={() => editor.chain().focus().splitCell().run()} className="px-1 text-[10px] text-white/60 hover:text-white" title="Split Cell">Split</button>
            <div className="w-px h-3 bg-white/15 mx-1" />
            <button
              onClick={() => editor.chain().focus().updateAttributes("table", { class: isBorderlessTable ? null : "borderless" }).run()}
              className="px-1 text-[10px] font-bold text-white/65 hover:text-white rounded"
              style={{ background: isBorderlessTable ? "rgba(96,165,250,0.18)" : "transparent", color: isBorderlessTable ? "#60a5fa" : undefined }}
              title="Toggle Borderless Grid (For MCQ choices without outer box borders)"
            >
              Borderless
            </button>
            <div className="w-px h-3 bg-white/15 mx-1" />
            <button onClick={() => editor.chain().focus().deleteRow().run()} className="px-1 text-[10px] text-red-400 hover:text-red-300" title="Delete Row">-Row</button>
            <button onClick={() => editor.chain().focus().deleteColumn().run()} className="px-1 text-[10px] text-red-400 hover:text-red-300" title="Delete Col">-Col</button>
            <button onClick={() => editor.chain().focus().deleteTable().run()} className="px-1 text-[10px] text-red-500 font-bold hover:text-red-400" title="Delete Table">Delete</button>
          </div>
        )}
      </div>

      {/* ── Main landscape workspace: original | editor ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT: Original image (48% width) ── */}
        {showOriginal && (
          <div className="flex flex-col" style={{ width: "48%", flexShrink: 0, borderRight: "1px solid rgba(255,255,255,0.07)", background: "#13131f" }}>

            {/* Image controls */}
            <div className="flex items-center justify-between px-3 py-1.5 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-center gap-1">
                {pages.length > 1 && (
                  <>
                    <IB title="Prev page" onClick={() => setActivePage((p) => Math.max(0, p - 1))} disabled={activePage === 0}><ChevronLeft size={13} /></IB>
                    <span className="text-xs text-white/50 px-1">Pg {activePage + 1}/{pages.length}</span>
                    <IB title="Next page" onClick={() => setActivePage((p) => Math.min(pages.length - 1, p + 1))} disabled={activePage === pages.length - 1}><ChevronRight size={13} /></IB>
                    <div className="mx-1 h-3.5 w-px bg-white/15" />
                  </>
                )}
                <span className="text-xs font-semibold text-white/40">Original</span>
              </div>
              <div className="flex items-center gap-0.5">
                <IB title="Zoom out" onClick={() => setZoom((z) => Math.max(0.25, z - 0.25))}><ZoomOut size={12} /></IB>
                <span className="w-9 text-center text-[10px] font-mono text-white/40">{Math.round(zoom * 100)}%</span>
                <IB title="Zoom in" onClick={() => setZoom((z) => Math.min(4, z + 0.25))}><ZoomIn size={12} /></IB>
                <div className="mx-1 h-3.5 w-px bg-white/15" />
                <IB title="Rotate CCW" onClick={() => setRotation((r) => (r - 90 + 360) % 360)}><RotateCcw size={12} /></IB>
                <IB title="Rotate CW" onClick={() => setRotation((r) => (r + 90) % 360)}><RotateCw size={12} /></IB>
                <button onClick={() => { setRotation(0); setZoom(1); }} className="ml-0.5 rounded px-1 py-0.5 text-[9px] font-bold text-white/35 hover:text-white hover:bg-white/10 transition-colors">RST</button>
              </div>
            </div>

            {/* Page strip (when multiple pages) */}
            {pages.length > 1 && (
              <div className="flex gap-1.5 overflow-x-auto px-2 py-1.5 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                {pages.map((page, i) => (
                  <button key={page.id} onClick={() => setActivePage(i)}
                    className="relative flex-shrink-0 overflow-hidden rounded transition-all"
                    style={{ width: 44, height: 56, border: `2px solid ${i === activePage ? "#2563eb" : "rgba(255,255,255,0.15)"}`, opacity: i === activePage ? 1 : 0.6 }}>
                    {page.sourceType === "image"
                      ? <img src={page.sourceUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <div className="flex h-full w-full items-center justify-center text-[8px] font-bold text-white/40" style={{ background: "rgba(255,255,255,0.05)" }}>PDF</div>}
                    <div style={{ position: "absolute", bottom: 2, right: 2, background: "rgba(0,0,0,0.7)", borderRadius: 2, padding: "0 2px", fontSize: 7, fontWeight: 900, color: "white" }}>P{page.pageNumber}</div>
                  </button>
                ))}
              </div>
            )}

            {/* Image viewer — fills remaining height, scroll when zoomed */}
            <div className="flex-1 overflow-auto flex items-start justify-center p-3" style={{ background: "#0d0d1a" }}>
              {active.sourceType === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={active.sourceUrl}
                  alt={`Page ${active.pageNumber}`}
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    width: isLandscapeRotated ? "auto" : `${zoom * 100}%`,
                    maxWidth: isLandscapeRotated ? `${zoom * 45}vh` : `${zoom * 100}%`,
                    maxHeight: isLandscapeRotated ? "none" : undefined,
                    objectFit: "contain",
                    borderRadius: 4,
                    border: "1px solid rgba(255,255,255,0.1)",
                    transition: "transform 0.2s ease"
                  }}
                  loading="lazy"
                />
              ) : (
                <iframe src={active.sourceUrl} style={{ width: "100%", height: "100%", minHeight: 500, borderRadius: 4, border: "1px solid rgba(255,255,255,0.1)" }} title="PDF preview" loading="lazy" />
              )}
            </div>
          </div>
        )}

        {/* ── RIGHT: TipTap Document Workspace (remaining width) ── */}
        <div className="flex flex-1 flex-col overflow-hidden" style={{ background: "#2d2d3f" }}>

          {/* Scrollable A4 canvas area */}
          <div className="flex-1 overflow-auto py-6 px-4">
            <div
              style={{
                background: "#ffffff",
                color: "#111827",
                maxWidth: 800,
                minHeight: 1100,
                margin: "0 auto",
                padding: "56px 64px",
                boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
                borderRadius: 2,
                position: "relative"
              }}
              className="a4-page-content"
            >
              {/* Page indicator */}
              <div style={{ position: "absolute", top: 10, right: 14, fontSize: 10, color: "#9ca3af", fontFamily: "monospace", userSelect: "none" }}>
                Page {active.pageNumber} {pages.length > 1 && `of ${pages.length}`}
              </div>

              {/* TipTap editable content */}
              <EditorContent editor={editor} />
            </div>

            {/* Page navigation footer when multiple pages */}
            {pages.length > 1 && (
              <div className="flex items-center justify-center gap-3 mt-5 pb-4">
                <button onClick={() => setActivePage((p) => Math.max(0, p - 1))} disabled={activePage === 0}
                  className="flex items-center gap-1 rounded px-3 py-1.5 text-xs font-bold text-white/60 hover:bg-white/10 disabled:opacity-30 transition-colors border border-white/15">
                  <ChevronLeft size={13} /> Prev page
                </button>
                <span className="text-xs text-white/40">{activePage + 1} / {pages.length}</span>
                <button onClick={() => setActivePage((p) => Math.min(pages.length - 1, p + 1))} disabled={activePage === pages.length - 1}
                  className="flex items-center gap-1 rounded px-3 py-1.5 text-xs font-bold text-white/60 hover:bg-white/10 disabled:opacity-30 transition-colors border border-white/15">
                  Next page <ChevronRight size={13} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Toolbar button
function TB({ label, onClick, active, children }: { label: string; onClick: () => void; active?: boolean; children: React.ReactNode }) {
  return (
    <button onClick={onClick} title={label} aria-label={label}
      style={{ color: active ? "#60a5fa" : "rgba(255,255,255,0.65)", background: active ? "rgba(96,165,250,0.12)" : "transparent" }}
      className="flex h-6 min-w-6 items-center justify-center rounded px-1 text-xs transition-colors hover:bg-white/10">
      {children}
    </button>
  );
}

// ── Icon button (for image controls)
function IB({ title, onClick, disabled, children }: { title: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button onClick={onClick} title={title} disabled={disabled}
      className="flex h-5 w-5 items-center justify-center rounded text-white/40 hover:bg-white/10 hover:text-white disabled:opacity-25 transition-colors">
      {children}
    </button>
  );
}

function Sep() {
  return <div className="mx-0.5 h-4 w-px flex-shrink-0" style={{ background: "rgba(255,255,255,0.1)" }} />;
}
