import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://textipe.com";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/dashboard/",
        "/projects/",
        "/setup/",
        "/demo/",
        "/login/",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
