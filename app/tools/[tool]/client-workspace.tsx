"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, ImageIcon } from "lucide-react";
import { TOOLS_LIST, type ToolId } from "@/lib/tools-data";
import { ActiveToolWorkspace } from "@/app/tools/page";

interface Props {
  initialToolId: ToolId;
}

export function ClientToolWorkspace({ initialToolId }: Props) {
  const [activeTool, setActiveTool] = useState<ToolId>(initialToolId);
  const router = useRouter();
  const workspaceRef = useRef<HTMLDivElement>(null);

  // Sync state if initialToolId changes
  useEffect(() => {
    setActiveTool(initialToolId);
  }, [initialToolId]);

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
    router.push(`/tools/${id}`);
  };

  const currentTool = TOOLS_LIST.find((t) => t.id === activeTool);

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Navbar */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Link href="/tools" className="flex items-center gap-1 text-sm font-bold text-white/50 hover:text-white transition-colors">
            <ArrowLeft size={16} />
            <span>Tools Hub</span>
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
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs font-bold transition-all cursor-pointer ${
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
        <section ref={workspaceRef} className="flex-1 min-w-0 space-y-6">
          <div className="rounded-2xl border border-white/10 bg-[#121220] p-6 md:p-8 shadow-2xl min-h-[500px] flex flex-col">
            <div className="border-b border-white/10 pb-4 mb-6">
              <h1 className="text-2xl font-black">{currentTool?.h1}</h1>
              <p className="text-xs text-white/55 mt-1">{currentTool?.desc}</p>
            </div>

            <div className="flex-1 flex flex-col justify-center">
              <ActiveToolWorkspace toolId={activeTool} />
            </div>
          </div>

          {/* SEO Optimized FAQ & Instructions Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* How to use */}
            <div className="rounded-2xl border border-white/10 bg-[#121220]/50 p-6 space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">
                How to use {currentTool?.name}
              </h2>
              <ol className="list-decimal pl-4 text-xs text-white/60 space-y-3 leading-relaxed">
                {currentTool?.instructions.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ol>
            </div>

            {/* FAQs */}
            <div className="rounded-2xl border border-white/10 bg-[#121220]/50 p-6 space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {currentTool?.faqs.map((faq, idx) => (
                  <div key={idx} className="space-y-1">
                    <h3 className="text-xs font-bold text-white/80">{faq.q}</h3>
                    <p className="text-xs text-white/55 leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Related Tools Internal Linking */}
          <div className="rounded-2xl border border-white/10 bg-[#121220]/30 p-6 space-y-4">
            <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest">Other Useful Free Tools</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {TOOLS_LIST.filter(t => t.id !== activeTool).slice(0, 4).map((tool) => {
                const Icon = tool.icon;
                return (
                  <Link
                    key={tool.id}
                    href={`/tools/${tool.id}`}
                    className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 p-3 transition-colors text-xs font-bold text-white/70 hover:text-white"
                  >
                    <Icon size={12} className="text-white/40" />
                    <span className="truncate">{tool.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
