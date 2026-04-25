"use client";

import { useCallback, useState } from "react";

export default function SubscribeSection() {
  const [email, setEmail] = useState<string>("");
  const [disabled, setDisabled] = useState<boolean>(false);

  const onChange = useCallback((event: any) => {
    setEmail(event.target.value);
  }, []);

  const onSubmit = useCallback(async () => {
    if (disabled) {
      return;
    }
    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
    } catch (error) {
      console.log("=>(SubscribeSection.tsx:25) error", error);
    }
  }, [disabled, email]);

  return (
    <div className="border border-light xl:p-5 p-3.5 rounded-3xl mt-5  bg-white">
      <p className="text-[16px] font-bold">
        Nhận thông báo về công việc mới nhất
      </p>
      <div className="grid grid-cols-3 mt-3 gap-2 w-full">
        <div className="col-span-2 relative w-full flex items-center gap-3">
          <svg width="13" height="11" className="absolute left-3 top-3">
            <use href="/images/icons.svg#icon-evelop"></use>
          </svg>
          <input
            value={email}
            onChange={onChange}
            type="text"
            placeholder="Địa chỉ email"
            className="border border-light rounded-3xl px-5 pl-8 py-1
                            xl:placeholder:text-[18px] placeholder:text-light text-[14px] xl:text-[16px] w-full"
          />
        </div>
        <button
          disabled={disabled || !email}
          className="col-span-1 border border-light py-1 px-3 rounded-3xl bg-light text-white text-[14px] xl:text-[16px]"
          onClick={onSubmit}
          type="button"
        >
          Đăng ký
        </button>
      </div>
    </div>
  );
}
