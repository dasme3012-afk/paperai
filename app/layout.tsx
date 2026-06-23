import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://paperai.app";

export const metadata: Metadata = {
  title: "PaperAI - Question Paper Digitizer",
  description: "AI-powered OCR, editing, and export for school question papers. Turn printed tests into editable DOCX and PDF files instantly.",
  metadataBase: new URL(APP_URL),
  openGraph: {
    title: "PaperAI - Question Paper Digitizer",
    description: "AI-powered OCR, editing, and export for school question papers.",
    url: APP_URL,
    siteName: "PaperAI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PaperAI - Question Paper Digitizer",
    description: "AI-powered OCR, editing, and export for school question papers.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PaperAI",
  operatingSystem: "Web",
  applicationCategory: "EducationalApplication",
  description: "AI-powered OCR tool to digitize and format physical question papers.",
  url: APP_URL,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {gaId && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaId}');
                `,
              }}
            />
          </>
        )}
      </head>
      <body className={inter.className}>
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
