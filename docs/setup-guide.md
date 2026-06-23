# Local Setup Guide

Follow these steps to set up PaperAI on your local machine for development.

## Prerequisites
- Node.js 18 or newer
- npm, yarn, or pnpm
- A Supabase account (free tier is fine)
- An API key for Google Gemini or OpenAI

## 1. Clone and Install
```bash
git clone https://github.com/yourusername/paperai.git
cd paperai
npm install
```

## 2. Supabase Setup
1. Create a new project on [Supabase](https://supabase.com).
2. Go to **Authentication > Providers** and enable **Google**. You will need to configure Google OAuth credentials in Google Cloud Console.
3. Go to **Storage** and create a new bucket named `paper-sources`. Make it **Private**.
4. Run the database migrations (if you have the Supabase CLI installed):
   ```bash
   supabase link --project-ref your-project-ref
   supabase db push
   ```

## 3. Environment Variables
Copy the `.env.example` file to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in the required variables in `.env.local`:
- `NEXT_PUBLIC_APP_URL=http://localhost:3000`
- `NEXT_PUBLIC_SUPABASE_URL` (From Supabase Project Settings > API)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (From Supabase Project Settings > API)
- `SUPABASE_SERVICE_ROLE_KEY` (From Supabase Project Settings > API)
- `OCR_PROVIDER=google-ai-studio` (or `openai`)
- `GOOGLE_AI_STUDIO_API_KEY` (From Google AI Studio)

## 4. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Common Setup Issues

**"Supabase is not configured" error**
Make sure your `.env.local` file contains the three Supabase variables and they are exactly as shown in your Supabase dashboard. You must restart the dev server after changing `.env.local`.

**Upload fails immediately**
Ensure you have created the `paper-sources` bucket in Supabase Storage.

**OCR processing fails**
Check your API keys. If using Gemini, ensure `GOOGLE_AI_STUDIO_API_KEY` is set. If using OpenAI, ensure `OPENAI_API_KEY` is set and your account has billing enabled.
