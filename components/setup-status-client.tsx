"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, CircleAlert, Copy, Database, ExternalLink, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import type { SetupStatus } from "@/lib/setup-status";

type SupabaseSchemaStatus = {
  ready: boolean;
  projects: { ok: boolean; message: string };
  downloads: { ok: boolean; message: string };
  bucket: { ok: boolean; message: string };
};

const envTemplate = `NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
OPENAI_FORMATTING_MODEL=gpt-4o-mini
OCR_PROVIDER=openai
GOOGLE_APPLICATION_CREDENTIALS_JSON=
GOOGLE_AI_STUDIO_API_KEY=`;

export function SetupStatusClient() {
  const [status, setStatus] = useState<SetupStatus | null>(null);
  const [schemaStatus, setSchemaStatus] = useState<SupabaseSchemaStatus | null>(null);
  const [checkingSchema, setCheckingSchema] = useState(false);
  const [schemaSql, setSchemaSql] = useState("");

  useEffect(() => {
    fetch("/api/setup/status")
      .then((response) => response.json())
      .then(setStatus);
    checkSchema();
    fetch("/api/setup/schema")
      .then((response) => response.text())
      .then(setSchemaSql);
  }, []);

  async function copyTemplate() {
    await navigator.clipboard.writeText(envTemplate);
    toast.success(".env.local template copied.");
  }

  async function copySchema() {
    try {
      await navigator.clipboard.writeText(schemaSql);
      toast.success("Supabase schema SQL copied.");
    } catch {
      toast.error("Clipboard blocked. Select the SQL box and copy manually.");
    }
  }

  async function checkSchema() {
    setCheckingSchema(true);
    const response = await fetch("/api/setup/supabase");
    const data = await response.json();
    setSchemaStatus(data);
    setCheckingSchema(false);
  }

  if (!status) {
    return <div className="rounded-lg border border-line bg-white p-6 dark:border-white/10 dark:bg-white/5">Checking setup...</div>;
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
      <section className="rounded-lg border border-line bg-white p-5 dark:border-white/10 dark:bg-white/5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-black">Environment status</h2>
            <p className="mt-1 text-sm text-black/60 dark:text-white/60">Add these values to `.env.local`, then restart the dev server.</p>
          </div>
          {status.readyForProcessing ? (
            <Badge ok label="Ready" />
          ) : (
            <Badge ok={false} label="Needs keys" />
          )}
        </div>

        <div className="mt-5 grid gap-3">
          <CheckRow ok={status.supabaseUrl} label="NEXT_PUBLIC_SUPABASE_URL" />
          <CheckRow ok={status.supabaseAnonKey} label="NEXT_PUBLIC_SUPABASE_ANON_KEY" />
          <CheckRow ok={status.supabaseServiceRoleKey} label="SUPABASE_SERVICE_ROLE_KEY" />
          <CheckRow ok={status.readyForAiFormatting} label="AI formatting key" />
          <CheckRow ok={status.appUrl} label="NEXT_PUBLIC_APP_URL" />
          <CheckRow ok={status.ocrProvider === "openai" ? status.readyForOpenAiOcr : status.ocrProvider === "google" ? status.readyForGoogleVisionOcr : status.readyForGoogleAiStudioOcr} label={`OCR provider: ${status.ocrProvider}`} />
        </div>
      </section>

      <section className="rounded-lg border border-line bg-white p-5 dark:border-white/10 dark:bg-white/5">
        <h2 className="text-xl font-black">Next actions</h2>
        <div className="mt-4 space-y-3 text-sm leading-6 text-black/70 dark:text-white/70">
          <p>1. Create a Supabase project and run `supabase/schema.sql` in SQL Editor.</p>
          <p>2. Copy Supabase URL, anon key, and service role key into `.env.local`.</p>
          <p>3. Add either `OPENAI_API_KEY` or `GOOGLE_AI_STUDIO_API_KEY` for AI formatting.</p>
          <p>4. Restart this dev server and upload one real paper.</p>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <button onClick={copyTemplate} className="inline-flex min-h-11 items-center gap-2 rounded-md bg-brand px-4 font-bold text-white">
            <Copy size={17} /> Copy env template
          </button>
          <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-md border border-line px-4 font-bold dark:border-white/10">
            Supabase <ExternalLink size={17} />
          </a>
        </div>
      </section>

      <section className="rounded-lg border border-line bg-white p-5 dark:border-white/10 dark:bg-white/5 lg:col-span-2">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-black"><Database size={20} /> Supabase schema</h2>
            <p className="mt-1 text-sm text-black/60 dark:text-white/60">These must be present in the same Supabase project used by `.env.local`.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={copySchema} className="inline-flex min-h-11 items-center gap-2 rounded-md bg-brand px-4 font-bold text-white">
              <Copy size={17} /> Copy schema SQL
            </button>
            <button onClick={checkSchema} className="inline-flex min-h-11 items-center gap-2 rounded-md border border-line px-4 font-bold dark:border-white/10">
              <RefreshCcw size={17} /> {checkingSchema ? "Checking" : "Recheck"}
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <CheckRow ok={Boolean(schemaStatus?.projects.ok)} label="projects table" />
          <CheckRow ok={Boolean(schemaStatus?.downloads.ok)} label="download_history table" />
          <CheckRow ok={Boolean(schemaStatus?.bucket.ok)} label="paper-sources bucket" />
        </div>

        {schemaStatus && !schemaStatus.ready && (
          <div className="mt-4 rounded-md border border-coral/30 bg-red-50 p-4 text-sm leading-6 text-red-800 dark:bg-red-950/20 dark:text-red-100">
            Schema is not ready yet. Copy the schema SQL, paste it into Supabase SQL Editor for this project, run it, then click Recheck.
          </div>
        )}

        <label className="mt-5 block text-sm font-black" htmlFor="schema-sql">Schema SQL</label>
        <textarea
          id="schema-sql"
          value={schemaSql}
          readOnly
          onFocus={(event) => event.currentTarget.select()}
          className="mt-2 h-72 w-full rounded-md border border-line bg-zinc-950 p-4 font-mono text-xs leading-5 text-zinc-50 outline-none dark:border-white/10"
        />
        <p className="mt-2 text-sm text-black/60 dark:text-white/60">
          Click inside the SQL box, press Ctrl+A, then Ctrl+C if the copy button is blocked.
        </p>
      </section>
    </div>
  );
}

function CheckRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-line px-3 py-3 dark:border-white/10">
      <span className="font-semibold">{label}</span>
      {ok ? <CheckCircle2 className="text-mint" size={20} /> : <CircleAlert className="text-coral" size={20} />}
    </div>
  );
}

function Badge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-black ${ok ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
      {label}
    </span>
  );
}
