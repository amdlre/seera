import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = env.NEXT_PUBLIC_APP_URL;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/*/dashboard", "/*/builder", "/*/admin", "/*/verify", "/api", "/print"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
