"use client";
import { RouterRoot } from "@/app/constants";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const Banner = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const onScroll = useCallback((id: string | null) => {
    if (!id) return;
    if (id == RouterRoot.Home) return;
    const el = document.querySelector(`#${id}`);
    el?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleScroll = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("id", RouterRoot.About);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    onScroll(RouterRoot.About);
  };

  useGSAP(() => {
    gsap.fromTo(
      ".heading > span, .button-link",
      {
        visibility: "visible",
        opacity: 0,
        y: 50,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.75,
        ease: "power2.out",
        delay: 0.5,
        stagger: (index) => 0.25 * index,
      },
    );
  }, []);

  const arrowRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({ repeat: -1, yoyo: true });
    gsap.to(arrowRef.current, {
      filter: "drop-shadow(0px 0px 10px rgba(255, 255, 255, 0.8))",
      duration: 1,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut",
    });
    tl.to(arrowRef.current, {
      x: 10,
      duration: 1.5,
      ease: "power2.inOut",
    }).to(arrowRef.current, {
      x: 0,
      duration: 1.5,
      ease: "power2.inOut",
    });
  }, []);

  return (
    <div className="banner lg:h-screen h-[465px] relative flex flex-col justify-end items-center">
      <div className="container relative z-1 px-6 lg:px-8 bottom-8 mx-auto">
        <div className="flex flex-col lg:flex-row justify-between lg:items-end items-start gap-3">
          <h1 className="heading uppercase text-[32px] lg:text-[64px] font-bold lg:leading-20 leading-10 m-0">
            <span className="block">
              make it <span className="text-primary">simple.</span>
            </span>
            <span className="block">
              make it <span className="text-primary">memorable.</span>
            </span>
          </h1>
          <button
            className="button cursor-pointer button-link"
            onClick={handleScroll}
            aria-label="Cuộn xuống phần Giới thiệu"
          >
            <svg ref={arrowRef} width="70" height="22" aria-hidden="true">
              <use href="/images/icons.svg#icon-arrow"></use>
            </svg>
          </button>
        </div>
      </div>
      <div className="wrapper-image absolute top-0 left-0 z-0 lg:h-screen h-auto">
        <Image
          src="/images/bg-banner.png"
          alt=""
          width={1920}
          height={1023}
          priority
          sizes="100vw"
          className="object-cover w-full h-full"
        />
      </div>
    </div>
  );
};

export default Banner;
