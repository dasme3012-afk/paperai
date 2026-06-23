# Deployment Guide

Follow these steps to deploy PaperAI to Vercel.

## 1. Prepare Supabase for Production
Before deploying the frontend, ensure your Supabase project is ready:
1. Update the **Site URL** in Supabase (Authentication > URL Configuration) to your production domain (e.g., `https://paperai.app`).
2. Add any additional redirect URIs (e.g., `https://paperai.app/auth/callback`).
3. Ensure your Google OAuth credentials in Google Cloud Console allow redirects to your production domain.

## 2. Deploy to Vercel
The easiest way to deploy PaperAI is to use the Vercel Platform.

1. Push your code to a GitHub repository.
2. Go to [Vercel](https://vercel.com) and click **Add New > Project**.
3. Import your GitHub repository.
4. Expand the **Environment Variables** section.

## 3. Configure Environment Variables
Add the following environment variables in the Vercel dashboard:

**Required:**
- `NEXT_PUBLIC_APP_URL`: Your production domain (e.g., `https://paperai.app`)
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

**AI Provider (Pick one):**
- **Gemini (Recommended):** Set `OCR_PROVIDER=google-ai-studio` and `GOOGLE_AI_STUDIO_API_KEY=your-key`
- **OpenAI:** Set `OCR_PROVIDER=openai` and `OPENAI_API_KEY=your-key`

**Optional Analytics:**
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`: Google Analytics 4 ID

## 4. Deploy
Click **Deploy**. Vercel will build and deploy your application.

## 5. Post-Deployment Verification
Once deployed, visit your production URL and test the following:
1. Log in with Google.
2. Upload a test image or PDF.
3. Verify that the OCR process completes successfully.
4. Export the result as a DOCX and PDF.

If any of these fail, check the Vercel logs and consult the [Troubleshooting Guide](troubleshooting.md).
