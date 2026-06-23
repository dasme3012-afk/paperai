# Troubleshooting Guide

This guide covers common issues you might encounter while using, developing, or deploying PaperAI.

## OCR Processing Failures

### Issue: "Upload failed" or "OCR processing failed"
**Possible Causes:**
1. **API Key Missing/Invalid:** Ensure your `GOOGLE_AI_STUDIO_API_KEY` or `OPENAI_API_KEY` is correct.
2. **Billing Issues:** If using OpenAI, ensure your account has sufficient credits.
3. **Rate Limits:** AI providers have strict rate limits. PaperAI implements retries, but a surge of pages might still fail. Check Vercel logs for `429 Too Many Requests`.
4. **File Too Large:** Individual pages extracted from PDFs shouldn't exceed API limits, but exceptionally high-resolution images might.

**Solution:** Check the Vercel server logs. If using Gemini, try switching `GOOGLE_AI_STUDIO_MODEL` to `gemini-2.5-flash` for better rate limits.

## Authentication Errors

### Issue: Google Login Fails or Redirects to Localhost
**Possible Causes:**
1. **Supabase Site URL:** Your Supabase project's Site URL is still set to `http://localhost:3000`.
2. **Google Cloud Console:** The Authorized redirect URIs in your Google Cloud credentials don't match your production domain.

**Solution:** 
1. In Supabase, go to Authentication > URL Configuration and set the Site URL to your production domain.
2. In Google Cloud Console, ensure `https://yourdomain.com/auth/callback` is allowed.

### Issue: "Supabase is not configured"
**Solution:** Ensure `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are all set in your environment variables.

## Build and Deployment Errors

### Issue: Type Errors During Build
**Solution:** Run `npm run typecheck` locally to find the exact error. Next.js production builds will fail if there are any TypeScript errors.

### Issue: Function Timeout on Vercel
**Solution:** OCR processing takes time. The `vercel.json` file sets the maxDuration to 60 seconds. If you are on a Vercel Hobby plan, you are hard-capped at 10 seconds (or 60s for Next.js API routes under specific conditions). If you hit timeouts frequently, you may need to upgrade to Vercel Pro.

## Upload and Export Failures

### Issue: "Invalid file type" or "File too large"
**Solution:** PaperAI only accepts JPG, PNG, and PDF files. The maximum file size is 10 MB per file.

### Issue: DOCX Export Fails
**Solution:** This usually happens if the AI generated invalid HTML that the `html-to-docx` library cannot parse. Check the server logs for parsing errors. The HTML sanitizer is designed to prevent this, but complex table structures can sometimes break the exporter.
