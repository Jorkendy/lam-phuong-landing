"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/track";

const APPLY_URL =
  "https://airtable.com/applRt3FQ5QTJY6sn/pag3suI5n5zwMkT6o/form";
const SCROLL_TARGET_ID = "job-detail-jd";
const MILESTONES = [25, 50, 75, 100] as const;

type JobDetailTrackingProps = {
  jobId: string;
  jobTitle: string;
  jobSlug: string;
  location?: string;
  /** Chuỗi tags đã join bằng ',' (loại công việc + danh mục + nhóm sản phẩm). */
  tags: string;
};

/**
 * Client wrapper cho trang detail (Server Component): fire `job_view` khi mount,
 * theo dõi độ sâu cuộn JD (`job_detail_scroll`), và render nút Apply
 * (`apply_click`) kèm `max_scroll_percent`.
 */
export default function JobDetailTracking({
  jobId,
  jobTitle,
  jobSlug,
  location,
  tags,
}: JobDetailTrackingProps) {
  const jobContext = {
    job_id: jobId,
    job_title: jobTitle,
    job_slug: jobSlug,
    location,
  };
  const maxScrollPercent = useRef(0);

  // D1 — job_view khi render xong
  useEffect(() => {
    trackEvent("job_view", {
      page_type: "job_detail",
      ...jobContext,
      tags,
      source: "detail",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobSlug]);

  // D2 — job_detail_scroll theo mốc 25/50/75/100% khối JD
  useEffect(() => {
    const el = document.getElementById(SCROLL_TARGET_ID);
    if (!el) return;
    const fired = new Set<number>();

    const onScroll = () => {
      const elementTop = el.getBoundingClientRect().top + window.scrollY;
      const height = el.offsetHeight || 1;
      const scrolled = window.scrollY + window.innerHeight - elementTop;
      const percent = Math.max(0, Math.min(100, (scrolled / height) * 100));

      for (const milestone of MILESTONES) {
        if (percent >= milestone && !fired.has(milestone)) {
          fired.add(milestone);
          if (milestone > maxScrollPercent.current) {
            maxScrollPercent.current = milestone;
          }
          trackEvent("job_detail_scroll", {
            page_type: "job_detail",
            ...jobContext,
            percent: milestone,
          });
        }
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobSlug]);

  return (
    <Link
      href={APPLY_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Ứng tuyển vị trí ${jobTitle}`}
      className="mt-10 self-start cursor-pointer text-white lg:text-[18px] border border-light bg-light rounded-3xl px-4 py-2 hover:bg-white hover:text-light inline-block"
      onClick={() =>
        trackEvent("apply_click", {
          page_type: "job_detail",
          ...jobContext,
          source: "detail",
          destination_url: APPLY_URL,
          max_scroll_percent: maxScrollPercent.current,
          tags,
        })
      }
    >
      Apply Now
    </Link>
  );
}
