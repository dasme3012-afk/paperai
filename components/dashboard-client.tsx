"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, Download, FileText, MoreVertical, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { PaperProject } from "@/lib/types";

type DownloadRow = {
  id: string;
  project_id: string;
  export_type: "pdf" | "docx";
  created_at: string;
  projects?: { title?: string } | null;
};

export function DashboardClient() {
  const [projects, setProjects] = useState<PaperProject[]>([]);
  const [downloads, setDownloads] = useState<DownloadRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/projects")
        .then((response) => (response.ok ? response.json() : { projects: [] }))
        .then((data) => setProjects(data.projects ?? [])),
      fetch("/api/downloads")
        .then((response) => (response.ok ? response.json() : { downloads: [] }))
        .then((data) => setDownloads(data.downloads ?? []))
    ]).finally(() => setLoading(false));
  }, []);

  async function deleteProject(project: PaperProject) {
    if (!window.confirm(`Delete "${project.title}"? This cannot be undone.`)) return;

    const previous = projects;
    setProjects((current) => current.filter((item) => item.id !== project.id));
    const response = await fetch(`/api/projects/${project.id}`, { method: "DELETE" });

    if (!response.ok) {
      setProjects(previous);
      toast.error("Project delete failed.");
      return;
    }

    toast.success("Project deleted.");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-black">Dashboard</h1>
          <p className="mt-1 text-sm text-black/60 dark:text-white/60">Manage saved papers, recent uploads, and exports.</p>
        </div>
        <Link href="/projects/new" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-brand px-5 font-bold text-white">
          <Plus size={18} /> New paper
        </Link>
      </div>

      <section className="mt-6 grid gap-3 md:grid-cols-3">
        <Metric title="Saved projects" value={projects.length} icon={<FileText size={20} />} />
        <Metric title="Recent uploads" value={projects.filter((project) => Date.now() - new Date(project.created_at).getTime() < 604800000).length} icon={<Clock size={20} />} />
        <Metric title="Download history" value={downloads.length} icon={<Download size={20} />} />
      </section>

      <section className="mt-6 rounded-lg border border-line bg-white dark:border-white/10 dark:bg-white/5">
        <div className="border-b border-line p-4 dark:border-white/10">
          <h2 className="font-black">Projects</h2>
        </div>
        {loading ? (
          <div className="p-8 text-sm text-black/60 dark:text-white/60">Loading projects...</div>
        ) : projects.length ? (
          <div className="divide-y divide-line dark:divide-white/10">
            {projects.map((project) => (
              <div key={project.id} className="grid gap-2 p-4 hover:bg-black/5 dark:hover:bg-white/10 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                <Link href={`/projects/${project.id}`} className="min-w-0">
                  <h3 className="truncate font-black">{project.title}</h3>
                  <p className="text-sm text-black/60 dark:text-white/60">{project.pages?.length ?? 0} pages - {project.status}</p>
                </Link>
                <p className="text-sm font-semibold text-black/60 dark:text-white/60">{new Date(project.updated_at).toLocaleDateString()}</p>
                <button
                  onClick={() => deleteProject(project)}
                  className="inline-grid h-10 w-10 place-items-center rounded-md border border-line text-coral hover:bg-red-50 dark:border-white/10 dark:hover:bg-red-950/20"
                  title="Delete project"
                  aria-label={`Delete ${project.title}`}
                >
                  <Trash2 size={17} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <FileText className="mx-auto mb-3 text-brand" />
            <p className="font-black">No projects yet</p>
            <p className="mt-1 text-sm text-black/60 dark:text-white/60">Upload a question paper to generate your first editable document.</p>
          </div>
        )}
      </section>

      <section className="mt-6 rounded-lg border border-line bg-white dark:border-white/10 dark:bg-white/5">
        <div className="flex items-center justify-between border-b border-line p-4 dark:border-white/10">
          <h2 className="font-black">Recent downloads</h2>
          <MoreVertical size={18} className="text-black/45 dark:text-white/45" />
        </div>
        {downloads.length ? (
          <div className="divide-y divide-line dark:divide-white/10">
            {downloads.map((download) => (
              <div key={download.id} className="grid gap-1 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <p className="font-semibold">{download.projects?.title ?? "Question paper"}</p>
                <p className="text-sm text-black/60 dark:text-white/60">
                  {download.export_type.toUpperCase()} - {new Date(download.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="p-6 text-sm text-black/60 dark:text-white/60">Exports will appear here after PDF or DOCX downloads.</p>
        )}
      </section>
    </div>
  );
}

function Metric({ title, value, icon }: { title: string; value: React.ReactNode; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-line bg-white p-4 dark:border-white/10 dark:bg-white/5">
      <div className="mb-3 text-brand">{icon}</div>
      <p className="text-sm text-black/60 dark:text-white/60">{title}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}
