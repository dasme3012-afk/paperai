# Environment Variables Guide

This document lists all the environment variables used in PaperAI and their purpose.

## Public Variables
These are exposed to the browser. They must be prefixed with `NEXT_PUBLIC_`.

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_APP_URL` | Yes | The URL where the app is hosted. Used for CORS and OAuth redirects. | `http://localhost:3000` |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL. | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous API key. Safe to expose. | `eyJh...` |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | No | Google Analytics 4 Measurement ID. | `G-XXXXXXXXXX` |
| `NEXT_PUBLIC_SENTRY_DSN` | No | Sentry Data Source Name for error tracking. | `https://x@o.ingest.sentry.io/y` |

## Private Variables
These are kept secret on the server. Do **not** prefix these with `NEXT_PUBLIC_`.

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase admin key for bypassing Row Level Security in server APIs. | `eyJh...` |
| `OCR_PROVIDER` | No | The OCR engine to use. Defaults to `openai`. | `google-ai-studio`, `google-vision`, `openai` |
| `OPENAI_API_KEY` | Yes* | OpenAI API Key (Required if `OCR_PROVIDER=openai`). | `sk-...` |
| `OPENAI_FORMATTING_MODEL` | No | Model to use for formatting. Defaults to `gpt-4o-mini`. | `gpt-4o-mini` |
| `GOOGLE_AI_STUDIO_API_KEY` | Yes* | Gemini API Key (Required if `OCR_PROVIDER=google-ai-studio`). | `AIza...` |
| `GOOGLE_AI_STUDIO_MODEL` | No | Gemini model to use. Defaults to `gemini-2.5-flash`. | `gemini-2.5-flash` |
| `Google_Vision_ApI` | Yes* | Google Cloud Vision API Key (Required for two-step Vision+OpenAI workflow). | `AIzaSy...` |

> *At least one AI provider must be configured depending on the chosen `OCR_PROVIDER`.*
