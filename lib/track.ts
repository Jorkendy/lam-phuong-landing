import type { EventName, EventPayloadMap, PageType } from "@/types/tracking";

declare global {
  interface Window {
    umami?: {
      track: (name: string, data?: Record<string, unknown>) => Promise<unknown>;
    };
  }
}

/**
 * Bắn một custom event tới Umami.
 *
 * Không bao giờ throw — tracking không được phép làm vỡ UX. Vì các nút Apply
 * đã mở tab mới (không unload trang), KHÔNG cần `await` ở đây.
 */
export function trackEvent<E extends EventName>(
  name: E,
  payload: EventPayloadMap[E],
): void {
  try {
    if (typeof window === "undefined" || !window.umami) return;
    window.umami.track(name, payload as Record<string, unknown>);
  } catch {
    // Nuốt lỗi — tracking không bao giờ được làm vỡ UX
  }
}

/** Lấy job_id = đoạn cuối slug sau dấu '-' cuối cùng (khớp service.ts) */
export function extractJobId(slug: string): string {
  const parts = slug.split("-");
  return parts[parts.length - 1] ?? "";
}

/** Suy ra page_type từ pathname — dùng cho event ở component dùng chung (footer). */
export function getPageType(pathname: string): PageType {
  if (pathname.startsWith("/jobs-search/chi-tiet")) return "job_detail";
  if (pathname === "/jobs-search" || pathname.startsWith("/jobs-search"))
    return "jobs_list";
  return "home";
}
