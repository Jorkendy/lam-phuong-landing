"use client";

import Image from "next/image";
import { useState } from "react";
import { RouterRoot } from "@/app/constants";

const SERVICES = [
  {
    title: "Content marketing",
    description:
      "Xây dựng những nội dung sáng tạo, bám sát xu hướng và văn hóa game, giúp thương hiệu thu hút và kết nối sâu sắc với cộng đồng game thủ.",
  },
  {
    title: "Creative Production",
    description:
      "Từ ý tưởng đến sản phẩm hoàn chỉnh, thông điệp của thương hiệu được truyền tải một cách sống động và khác biệt thông qua những ấn phẩm hình ảnh, video ấn tượng.",
  },
  {
    title: "KOLs/Influencer Booking",
    description:
      "Kết nối thương hiệu với các KOLs và Influencer phù hợp, tối ưu hóa tầm ảnh hưởng và gia tăng độ nhận diện trong cộng đồng game thủ.",
  },
  {
    title: "PR & Communication",
    description:
      "Chúng tôi xây dựng chiến lược truyền thông hiệu quả, lan tỏa thông điệp thương hiệu qua các kênh báo chí, truyền thông số và cộng đồng.",
  },
  {
    title: "Public Event & Activation",
    description:
      "Tổ chức sự kiện và kích hoạt thương hiệu sáng tạo, mang đến trải nghiệm tương tác độc đáo, giúp thương hiệu chinh phục và gắn kết người dùng.",
  },
];

const Services = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setActiveIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div id={RouterRoot.Service} className="services relative">
      <div className="container px-6 lg:px-8 mx-auto">
        <div className="flex lg:max-w-6xl mx-auto" data-aos="fade-up">
          <div className="elements">
            <h3 className="uppercase lg:text-[48px] text-[32px] font-bold mb-4 lg:mb-10">
              Our services
            </h3>
            {SERVICES.map(({ title, description }, index) => {
              const isActive = activeIndex === index;
              return (
                <div
                  key={title}
                  className="mb-4 lg:mb-10 relative cursor-pointer"
                  onClick={() => handleToggle(index)}
                >
                  <Image
                    src="/images/icon-animation.gif"
                    alt=""
                    width={100}
                    height={100}
                    unoptimized
                    className={`absolute left-[-85px] top-[-33px] transition-opacity duration-300 ${
                      isActive ? "h-auto opacity-100" : "h-0 opacity-0"
                    }`}
                  />
                  <h2 className="text-light capitalize font-bold lg:text-[48px] text-[32px] title leading-10 lg:leading-8">
                    {title}
                  </h2>
                  <div
                    className={`max-w-xl mt-3 transition-all duration-300 ease-in overflow-hidden ${
                      isActive ? "h-auto opacity-100" : "h-0 opacity-0"
                    }`}
                  >
                    <p>{description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
