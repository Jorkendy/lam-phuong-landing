import Link from "next/link";
import { FEATURES } from "@/app/feature-flags";

type PostProps = {
  slug: string;
  title: string;
  summary: string;
  location: string;
  deadline?: string | null;
};

function formatDeadline(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function Post({ slug, title, summary, location, deadline }: PostProps) {
  return (
    <article className="group rounded-3xl p-4 border border-light shadow-[0_2px_0_rgba(66,157,165,1)] flex flex-col gap-4 mb-6 bg-white">
      <h2 className="text-[24px] lg:text-[36px] leading-9">
        <Link
          href={`/jobs-search/chi-tiet/${slug}`}
          className="group-hover:text-light hover:text-light"
        >
          {title}
        </Link>
      </h2>
      <p className="line-clamp-3">{summary}</p>
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
          {!!location && (
            <div className="flex items-center gap-2">
              <svg width="13" height="18" aria-hidden="true">
                <use href="/images/icons.svg#icon-location" />
              </svg>
              <p className="text-light">{location}</p>
            </div>
          )}
          {FEATURES.DEADLINE_FILTER && !!deadline && (
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="text-light">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <p className="text-sm text-gray-500">
                Hạn nộp: <span className="text-light font-medium">{formatDeadline(deadline)}</span>
              </p>
            </div>
          )}
        </div>

        <Link
          href="https://airtable.com/applRt3FQ5QTJY6sn/pag3suI5n5zwMkT6o/form"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Ứng tuyển vị trí ${title}`}
          className="cursor-pointer text-light lg:text-[18px] border border-light rounded-3xl px-4 py-1 hover:bg-light hover:text-white inline-block"
        >
          Apply Now
        </Link>
      </div>
    </article>
  );
}
