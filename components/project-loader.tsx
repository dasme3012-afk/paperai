"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PaperEditor } from "@/components/paper-editor";
import type { PaperProject } from "@/lib/types";

export function ProjectLoader({ id }: { id: string }) {
  const [project, setProject] = useState<PaperProject | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Project not found");
        setProject(data.project);
      })
      .catch((reason: Error) => setError(reason.message));
  }, [id]);

  if (error) {
    return (
      <main className="grid min-h-screen place-items-center bg-paper px-4 text-ink dark:bg-[#101113] dark:text-paper">
        <div className="max-w-md rounded-lg border border-line bg-white p-6 text-center dark:border-white/10 dark:bg-white/5">
          <h1 className="text-2xl font-black">Could not open project</h1>
          <p className="mt-2 text-sm text-black/60 dark:text-white/60">{error}</p>
          <Link href="/dashboard" className="mt-5 inline-flex rounded-md bg-brand px-4 py-2 font-bold text-white">Back to dashboard</Link>
        </div>
      </main>
    );
  }

  if (!project) {
    return <main className="grid min-h-screen place-items-center bg-paper text-ink dark:bg-[#101113] dark:text-paper">Loading editor...</main>;
  }

  return <PaperEditor project={project} />;
}
