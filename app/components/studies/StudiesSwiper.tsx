"use client";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

export type Study = {
  image: string;
  tag: string;
  title: string;
  description: string;
};

export default function StudiesSwiper({ studies }: { studies: Study[] }) {
  return (
    <Swiper
      slidesPerView={1.2}
      spaceBetween={10}
      autoplay={{
        delay: 2500,
        disableOnInteraction: false,
      }}
      breakpoints={{
        640: { slidesPerView: 1.7, spaceBetween: 20 },
        768: { slidesPerView: 2.7, spaceBetween: 20 },
        1024: { slidesPerView: 3.7, spaceBetween: 30 },
      }}
      modules={[Autoplay]}
    >
      {studies.map(({ image, tag, title, description }) => (
        <SwiperSlide key={image}>
          <div className="group">
            <div className="bg-primary py-4 text-white flex flex-col gap-4 rounded-md">
              <h2 className="px-4 uppercase lg:text-[18px] text-[16px]">
                {tag}
              </h2>
              <div className="relative">
                <Image
                  src={image}
                  alt={title.replace(/\n/g, " ")}
                  width={540}
                  height={326}
                  sizes="(max-width: 640px) 80vw, (max-width: 1024px) 40vw, 320px"
                  className="w-full object-cover lg:h-[298px] h-[208px]"
                />
                <div className="absolute bg-[rgba(8,8,8,0.8)] top-0 left-0 p-4 text-white h-full visible opacity-0 group-hover:opacity-100 transition duration-300 ease-in">
                  {description}
                </div>
              </div>
              <h2 className="px-4 uppercase min-h-12 lg:text-[18px] text-[16px] whitespace-pre-line">
                {title}
              </h2>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
