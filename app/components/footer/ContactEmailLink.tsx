"use client";

import { usePathname } from "next/navigation";
import { getPageType, trackEvent } from "@/lib/track";

const EMAIL = "hr@lamphuong.com.vn";

/**
 * H8 — `contact_email_click`. Footer nằm trong root layout nên link này xuất
 * hiện ở cả 3 trang; `page_type` suy ra từ pathname hiện tại.
 */
export default function ContactEmailLink() {
  const pathname = usePathname();

  return (
    <a
      href={`mailto:${EMAIL}`}
      className="hover:text-light"
      onClick={() =>
        trackEvent("contact_email_click", {
          page_type: getPageType(pathname),
          email: EMAIL,
          source_section: "footer",
        })
      }
    >
      {EMAIL}
    </a>
  );
}
