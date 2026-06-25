# Textipe

**Textipe** is an AI-powered OCR application that digitizes physical question papers, worksheets, and exams into perfectly formatted, editable documents.

Teachers spend countless hours retyping physical papers. Textipe automates this using advanced AI (Google Gemini / OpenAI) to extract text, reconstruct tables, and preserve formatting, outputting clean HTML that can be edited and exported to DOCX or PDF.

## ✨ Features
- **Smart OCR:** Uses Gemini 1.5 Flash (or OpenAI GPT-4o) to instantly digitize complex papers.
- **WYSIWYG Editor:** A powerful TipTap-based editor tailored for educational content.
- **Table Reconstruction:** Automatically detects and formats tables.
- **Instant Export:** Download the digitized paper as a clean DOCX or PDF file.
- **Secure Authentication:** Google OAuth and email login via Supabase.
- **Project Management:** Save and organize digitized papers in a personal dashboard.

## 🛠 Tech Stack
- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database & Auth:** [Supabase](https://supabase.com/)
- **Editor:** [TipTap](https://tiptap.dev/)
- **AI Processing:** [Google AI Studio](https://aistudio.google.com/) (Gemini) / [OpenAI](https://openai.com/)

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/textipe.git
cd textipe
npm install
```

### 2. Set up environment variables
Copy the example environment file:
```bash
cp .env.example .env.local
```
Fill in the necessary keys for Supabase and your chosen AI provider (Gemini recommended). See [Environment Variables Docs](docs/environment-variables.md) for details.

### 3. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📚 Documentation
- [Environment Variables](docs/environment-variables.md)
- [Local Setup Guide](docs/setup-guide.md)
- [Deployment Guide](docs/deployment-guide.md)
- [Troubleshooting](docs/troubleshooting.md)

## ☁️ Deployment
Textipe is optimized for deployment on Vercel. See the [Deployment Guide](docs/deployment-guide.md) for step-by-step instructions.

## 📄 License
This project is licensed under the MIT License.
