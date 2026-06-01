"use client";

import { ChangeEvent, useCallback, useState } from "react";
import { trackEvent } from "@/lib/track";

type Status = "idle" | "loading" | "success" | "error";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SubscribeSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const onChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
    setStatus("idle");
  }, []);

  const onSubmit = useCallback(async () => {
    if (status === "loading") return;
    if (!EMAIL_RE.test(email)) {
      // L2c — validate client thất bại
      trackEvent("job_alert_subscribe_error", {
        page_type: "jobs_list",
        reason: "invalid_email",
      });
      setStatus("error");
      return;
    }
    // L2a — submit hợp lệ phía client
    trackEvent("job_alert_subscribe_submit", { page_type: "jobs_list" });
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({ ok: false }));
      if (data.ok) {
        // L2b — ghi Airtable thành công
        trackEvent("job_alert_subscribe_success", { page_type: "jobs_list" });
        setStatus("success");
        setEmail("");
      } else {
        // L2c — API trả lỗi
        trackEvent("job_alert_subscribe_error", {
          page_type: "jobs_list",
          reason: "server_error",
        });
        setStatus("error");
      }
    } catch (error) {
      console.error("[subscribe]", error);
      trackEvent("job_alert_subscribe_error", {
        page_type: "jobs_list",
        reason: "server_error",
      });
      setStatus("error");
    }
  }, [status, email]);

  const disabled = status === "loading" || !email;

  return (
    <div className="border border-light xl:p-5 p-3.5 rounded-3xl mt-5 bg-white">
      <p className="text-[16px] font-bold">
        Nhận thông báo về công việc mới nhất
      </p>
      <div className="grid grid-cols-3 mt-3 gap-2 w-full">
        <div className="col-span-2 relative w-full flex items-center gap-3">
          <svg width="13" height="11" className="absolute left-3 top-3" aria-hidden="true">
            <use href="/images/icons.svg#icon-evelop"></use>
          </svg>
          <label htmlFor="subscribe-email" className="sr-only">
            Địa chỉ email
          </label>
          <input
            id="subscribe-email"
            value={email}
            onChange={onChange}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="Địa chỉ email"
            aria-invalid={status === "error"}
            className="border border-light rounded-3xl px-5 pl-8 py-1 xl:placeholder:text-[18px] placeholder:text-light text-[14px] xl:text-[16px] w-full"
          />
        </div>
        <button
          disabled={disabled}
          className="col-span-1 border border-light py-1 px-3 rounded-3xl bg-light text-white text-[14px] xl:text-[16px] disabled:opacity-60"
          onClick={onSubmit}
          type="button"
        >
          {status === "loading" ? "Đang gửi..." : "Đăng ký"}
        </button>
      </div>
      {status === "success" && (
        <p
          role="status"
          className="text-[13px] xl:text-[14px] text-primary mt-2"
        >
          Đã đăng ký. Cảm ơn bạn!
        </p>
      )}
      {status === "error" && (
        <p
          role="alert"
          className="text-[13px] xl:text-[14px] text-red-600 mt-2"
        >
          Có lỗi xảy ra hoặc email chưa hợp lệ. Vui lòng thử lại.
        </p>
      )}
    </div>
  );
}
