import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Markdown from "react-markdown";
import SubscribeSection from "../../components/SubscribeSection";
import { FEATURES } from "@/app/feature-flags";
import { getJobDetail } from "@/app/api/job/service";
import { GetRecordsResponse, JobFields } from "@/type";

export const revalidate = 300;

export async function generateStaticParams() {
  const BASE_URL = `https://api.airtable.com/v0/${process.env.BASE_ID}`;
  const slugs: { slug: string }[] = [];
  let offset: string | undefined;

  do {
    const url = `${BASE_URL}/${process.env.JOBS_TABLE}?fields[]=Slug&pageSize=100${offset ? `&offset=${offset}` : ""}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}` },
    });
    const data: GetRecordsResponse<JobFields> = await res.json();
    for (const record of data.records || []) {
      if (record.fields["Slug"]) {
        slugs.push({ slug: `${record.fields["Slug"]}-${record.id}` });
      }
    }
    offset = data.offset;
  } while (offset);

  return slugs;
}

type JobDetail = {
  title?: string;
  description?: string;
  requirements?: string;
  benefits?: string;
  location?: string;
  tags?: string[];
};

const getJob = cache(async (slug: string): Promise<JobDetail | null> => {
  try {
    return await getJobDetail(slug);
  } catch {
    return null;
  }
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getJob(slug);
  const title = data?.title || "Tuyển dụng";
  const description = (data?.description || "")
    .replace(/[#*_`>\-]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);

  return {
    title,
    description: description || undefined,
    alternates: { canonical: `/jobs-search/chi-tiet/${slug}` },
    openGraph: {
      title: `${title} | Lam Phương`,
      description: description || undefined,
      url: `/jobs-search/chi-tiet/${slug}`,
      type: "article",
    },
  };
}

function buildJobPostingLd(slug: string, data: JobDetail) {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://lamphuong.com.vn";
  const description = [data.description, data.requirements, data.benefits]
    .filter(Boolean)
    .join("\n\n");

  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: data.title,
    description,
    datePosted: new Date().toISOString().split("T")[0],
    employmentType: "FULL_TIME",
    hiringOrganization: {
      "@type": "Organization",
      name: "Lam Phương",
      sameAs: siteUrl,
      logo: `${siteUrl}/images/logo.png`,
    },
    jobLocation: data.location
      ? {
          "@type": "Place",
          address: {
            "@type": "PostalAddress",
            addressLocality: data.location,
            addressCountry: "VN",
          },
        }
      : undefined,
    directApply: false,
    url: `${siteUrl}/jobs-search/chi-tiet/${slug}`,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = (await getJob(slug)) || ({} as JobDetail);
  const jsonLd = data.title ? buildJobPostingLd(slug, data) : null;

  return (
    <main id="main-content" className="detail pt-[116px] pb-8 lg:pb-0">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <div className="container mx-auto px-6 lg:px-0 relative min-h-screen">
        <div className="lg:max-w-6xl mx-auto lg:py-16 py-5 relative">
          <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8 mt-5 lg:mt-16">
            <div className="col-span-1">
              {FEATURES.SUBSCRIBE && <SubscribeSection />}
            </div>
            <div className="col-span-2 flex flex-col gap-8">
              <h2 className="text-light hover:text-light text-[24px] lg:text-[36px] leading-9">
                {data.title}
              </h2>
              <div className="lg:flex lg:justify-between lg:items-center block">
                <div className="group flex items-center gap-2 flex-wrap lg:mb-0 mb-4">
                  {(data.tags || []).map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="text-light border border-light rounded-3xl px-3 py-1"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                {!!data.location && (
                  <div className="group min-w-[150px]">
                    <div className="flex items-center gap-2">
                      <svg width="13" height="18" aria-hidden="true">
                        <use href="/images/icons.svg#icon-location"></use>
                      </svg>
                      <p className="text-light">{data.location}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="mb-4 [&>h3]:text-light [&>h3]:text-[22px] [&>h3]:mb-3 [&>ul]:list-disc [&>ul]:flex [&>ul]:flex-col [&>ul]:gap-3 [&>ul]:pl-5 [&>ul]:mb-5 whitespace-pre-line">
                <h4 className="text-light text-[22px] mb-3">Job Description</h4>
                <Markdown>{data.description}</Markdown>

                <h4 className="text-light text-[22px] mb-3">Requirements</h4>
                <Markdown>{data.requirements}</Markdown>

                <h4 className="text-light text-[22px] mb-3">Benefits</h4>
                <Markdown>{data.benefits}</Markdown>

                <Link
                  href="https://airtable.com/applRt3FQ5QTJY6sn/pag3suI5n5zwMkT6o/form"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-10 self-start cursor-pointer text-white lg:text-[18px] border border-light bg-light rounded-3xl px-4 py-2 hover:bg-white hover:text-light inline-block"
                >
                  Apply Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
