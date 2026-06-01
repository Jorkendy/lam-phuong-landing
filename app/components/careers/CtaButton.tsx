"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/track";

/** H6 — `cta_click` từ section Careers ở trang chủ. */
export default function CtaButton() {
  return (
    <Link
      href="/jobs-search"
      className="text-light border border-light rounded-3xl px-4 py-3 inline-flex max-w-[160px] justify-center hover:bg-light hover:text-white"
      onClick={() =>
        trackEvent("cta_click", {
          page_type: "home",
          cta_label: "xem_cong_viec",
          source_section: "careers_home",
          destination: "/jobs-search",
        })
      }
    >
      Xem công việc
    </Link>
  );
}
