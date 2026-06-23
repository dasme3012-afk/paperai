import { AppHeader } from "@/components/app-header";
import { UploadZone } from "@/components/upload-zone";

export default function NewProjectPage() {
  return (
    <main className="min-h-screen bg-paper text-ink dark:bg-[#101113] dark:text-paper">
      <AppHeader />
      <div className="mx-auto max-w-7xl px-4 py-6">
        <h1 className="text-3xl font-black">New question paper</h1>
        <p className="mt-1 text-sm text-black/60 dark:text-white/60">Upload one file per page for the best OCR accuracy. PDF preview is lazy-loaded in the editor.</p>
        <a href="/demo" className="mt-4 inline-flex min-h-11 items-center rounded-md border border-line px-4 font-bold dark:border-white/10">
          Try demo editor
        </a>
        <div className="mt-6">
          <UploadZone />
        </div>
      </div>
    </main>
  );
}
