import { Metadata } from "next";
import { notFound } from "next/navigation";
import { TOOLS_LIST } from "@/lib/tools-data";
import { ClientToolWorkspace } from "./client-workspace";

interface Props {
  params: Promise<{
    tool: string;
  }>;
}

export async function generateStaticParams() {
  return TOOLS_LIST.map((tool) => ({
    tool: tool.id,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tool: toolSlug } = await params;
  const tool = TOOLS_LIST.find((t) => t.id === toolSlug);
  if (!tool) return {};

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://textipe.app";
  const canonicalUrl = `${baseUrl}/tools/${tool.id}`;

  return {
    title: tool.seoTitle,
    description: tool.seoDesc,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: tool.seoTitle,
      description: tool.seoDesc,
      url: canonicalUrl,
      type: "website",
    },
  };
}

export default async function ToolPage({ params }: Props) {
  const { tool: toolSlug } = await params;
  const tool = TOOLS_LIST.find((t) => t.id === toolSlug);
  if (!tool) notFound();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": tool.faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a,
      },
    })),
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": tool.h1,
    "description": tool.desc,
    "step": tool.instructions.map((step, idx) => ({
      "@type": "HowToStep",
      "position": idx + 1,
      "text": step,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      
      <ClientToolWorkspace initialToolId={tool.id} />
    </>
  );
}
