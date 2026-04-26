"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(
      "[data-aos]:not(.aos-shown)",
    );
    if (els.length === 0) return;

    const reduce = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    )?.matches;
    if (reduce || typeof IntersectionObserver === "undefined") {
      els.forEach((el) => el.classList.add("aos-shown"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("aos-shown");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0, rootMargin: "0px 0px -5% 0px" },
    );

    els.forEach((el) => observer.observe(el));

    const safety = setTimeout(() => {
      document
        .querySelectorAll<HTMLElement>("[data-aos]:not(.aos-shown)")
        .forEach((el) => el.classList.add("aos-shown"));
    }, 1500);

    return () => {
      clearTimeout(safety);
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}
