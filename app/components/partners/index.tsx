import Image from "next/image";
import { RouterRoot } from "@/app/constants";

const PARTNERS = [
  { src: "/images/logo-1.png", w: 147, h: 48 },
  { src: "/images/logo-2.png", w: 87, h: 59 },
  { src: "/images/logo-3.png", w: 131, h: 24 },
  { src: "/images/logo-4.png", w: 120, h: 62 },
  { src: "/images/logo-5.png", w: 145, h: 53 },
  { src: "/images/logo-6.png", w: 77, h: 66 },
  { src: "/images/logo-7.png", w: 153, h: 59 },
  { src: "/images/logo-8.png", w: 129, h: 71 },
  { src: "/images/logo-9.png", w: 164, h: 58 },
  { src: "/images/logo-10.png", w: 94, h: 74 },
  { src: "/images/logo-11.png", w: 136, h: 54 },
  { src: "/images/logo-12.png", w: 116, h: 55 },
  { src: "/images/logo-13.png", w: 108, h: 47 },
  { src: "/images/logo-14.png", w: 159, h: 45 },
];

const Partners = () => {
  return (
    <div id={RouterRoot.Partner} className="relative py-8 lg:pb-20">
      <div className="container mx-auto px-8 pr-0 lg:px-0" data-aos="fade-up">
        <div className="lg:max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 grid-cols-4 items-center">
            <h3 className="mb-5 lg:text-[48px] text-[32px] font-bold col-span-3 lg:col-span-1 uppercase">
              Ours partners
            </h3>
            <div className="bg-light h-[5px] w-full lg:col-span-2 col-span-1 translate-y-[-10px]"></div>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-8 lg:px-0" data-aos="fade-up">
        <div className="lg:max-w-6xl mx-auto">
          <div className="flex flex-col lg:grid lg:grid-cols-3 items-start gap-14">
            <div className="col-span-1">
              <p>
                Chúng tôi tự hào đồng hành cùng các đối tác hàng đầu trong ngành
                game và giải trí.
              </p>
              <p>
                Sự tin tưởng và hợp tác chặt chẽ là động lực để Lam Phương mang
                đến những giải pháp marketing sáng tạo, hiệu quả, góp phần tạo
                nên thành công bền vững cho từng thương hiệu.
              </p>
            </div>
            <div className="col-span-2">
              <div
                role="list"
                aria-label="Logo các đối tác của Lam Phương"
                className="flex justify-center items-center gap-3 lg:gap-5 flex-wrap"
              >
                {PARTNERS.map(({ src, w, h }) => (
                  <div
                    key={src}
                    role="listitem"
                    className="flex lg:w-[22%] w-[30%] justify-center"
                  >
                    <Image
                      src={src}
                      alt=""
                      width={w}
                      height={h}
                      sizes="(max-width: 1024px) 30vw, 160px"
                      className="h-auto w-auto max-h-[80px]"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Partners;
