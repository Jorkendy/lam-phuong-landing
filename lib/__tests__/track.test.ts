import { afterEach, describe, expect, test, vi } from "vitest";
import { extractJobId, getPageType, trackEvent } from "@/lib/track";

afterEach(() => {
  delete window.umami;
  vi.restoreAllMocks();
});

describe("extractJobId", () => {
  test("returns the record id after the last dash", () => {
    expect(extractJobId("roblox-channel-owner-recHLYpLG9O0OlSXi")).toBe(
      "recHLYpLG9O0OlSXi",
    );
  });

  test("returns the whole string when there is no dash", () => {
    expect(extractJobId("recHLYpLG9O0OlSXi")).toBe("recHLYpLG9O0OlSXi");
  });

  test("returns empty string for empty slug", () => {
    expect(extractJobId("")).toBe("");
  });
});

describe("getPageType", () => {
  test("maps the home path", () => {
    expect(getPageType("/")).toBe("home");
  });

  test("maps the jobs list path with or without trailing slash", () => {
    expect(getPageType("/jobs-search")).toBe("jobs_list");
    expect(getPageType("/jobs-search/")).toBe("jobs_list");
  });

  test("maps the job detail path", () => {
    expect(getPageType("/jobs-search/chi-tiet/roblox-rec123")).toBe(
      "job_detail",
    );
  });
});

describe("trackEvent", () => {
  test("forwards name and payload to window.umami.track", () => {
    const track = vi.fn();
    window.umami = { track };

    trackEvent("cta_click", {
      page_type: "home",
      cta_label: "xem_cong_viec",
      source_section: "careers_home",
      destination: "/jobs-search",
    });

    expect(track).toHaveBeenCalledWith("cta_click", {
      page_type: "home",
      cta_label: "xem_cong_viec",
      source_section: "careers_home",
      destination: "/jobs-search",
    });
  });

  test("does nothing when umami is not present", () => {
    expect(() =>
      trackEvent("job_alert_subscribe_submit", { page_type: "jobs_list" }),
    ).not.toThrow();
  });

  test("swallows errors thrown by umami.track", () => {
    window.umami = {
      track: () => {
        throw new Error("network down");
      },
    };

    expect(() =>
      trackEvent("job_alert_subscribe_success", { page_type: "jobs_list" }),
    ).not.toThrow();
  });
});
