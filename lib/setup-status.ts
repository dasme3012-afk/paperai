export type SetupStatus = {
  appUrl: boolean;
  supabaseUrl: boolean;
  supabaseAnonKey: boolean;
  supabaseServiceRoleKey: boolean;
  openaiApiKey: boolean;
  ocrProvider: string;
  googleVisionCredentials: boolean;
  googleAiStudioKey: boolean;
  readyForAuth: boolean;
  readyForOpenAiOcr: boolean;
  readyForGoogleVisionOcr: boolean;
  readyForGoogleAiStudioOcr: boolean;
  readyForAiFormatting: boolean;
  readyForProcessing: boolean;
};

export function getSetupStatus(): SetupStatus {
  const ocrProvider = process.env.OCR_PROVIDER ?? "openai";
  const supabaseUrl = isValidHttpUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const readyForAuth = Boolean(
    supabaseUrl &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  const readyForOpenAiOcr = Boolean(process.env.OPENAI_API_KEY);
  const readyForGoogleVisionOcr = Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
  const readyForGoogleAiStudioOcr = Boolean(process.env.GOOGLE_AI_STUDIO_API_KEY);
  const readyForAiFormatting = readyForOpenAiOcr || readyForGoogleAiStudioOcr;
  const providerReady =
    ocrProvider === "google"
      ? readyForGoogleVisionOcr
      : ocrProvider === "google-ai-studio"
        ? readyForGoogleAiStudioOcr
        : readyForOpenAiOcr;

  return {
    appUrl: Boolean(process.env.NEXT_PUBLIC_APP_URL),
    supabaseUrl,
    supabaseAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    supabaseServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    openaiApiKey: readyForOpenAiOcr,
    ocrProvider,
    googleVisionCredentials: readyForGoogleVisionOcr,
    googleAiStudioKey: readyForGoogleAiStudioOcr,
    readyForAuth,
    readyForOpenAiOcr,
    readyForGoogleVisionOcr,
    readyForGoogleAiStudioOcr,
    readyForAiFormatting,
    readyForProcessing: readyForAuth && providerReady && readyForAiFormatting
  };
}

export function isValidHttpUrl(value?: string) {
  if (!value) return false;

  try {
    const url = new URL(value);
    return (url.protocol === "http:" || url.protocol === "https:") && Boolean(url.hostname);
  } catch {
    return false;
  }
}
