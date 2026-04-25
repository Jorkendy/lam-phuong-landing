import type { MetadataRoute } from "next";
import type { GetRecordsResponse, JobFields } from "@/type";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lamphuong.com.vn";

export const revalidate = 3600;

async function fetchJobSlugs(): Promise<{ slug: string; updatedAt?: Date }[]> {
  const baseId = process.env.BASE_ID;
  const apiKey = process.env.AIRTABLE_API_KEY;
  const table = process.env.JOBS_TABLE;
  if (!baseId || !apiKey || !table) return [];

  try {
    const url = `https://api.airtable.com/v0/${baseId}/${table}?fields%5B%5D=Slug&filterByFormula=${encodeURIComponent(
      `{Status}="Approved"`,
    )}&pageSize=100`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
      next: { revalidate: 3600, tags: ["jobs"] },
    });
    if (!res.ok) return [];
    const data: GetRecordsResponse<JobFields> = await res.json();
    return (data.records || []).map((record) => ({
      slug: `${record.fields["Slug"]}-${record.id}`,
    }));
  } catch (error) {
    console.error("[sitemap] fetchJobSlugs", error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${siteUrl}/jobs-search`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  const jobs = await fetchJobSlugs();
  const jobEntries: MetadataRoute.Sitemap = jobs.map(({ slug }) => ({
    url: `${siteUrl}/jobs-search/chi-tiet/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticEntries, ...jobEntries];
}
