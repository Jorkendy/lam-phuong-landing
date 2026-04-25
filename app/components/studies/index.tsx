import Image from "next/image";
import dynamic from "next/dynamic";
import { RouterRoot } from "@/app/constants";
import type { Study } from "./StudiesSwiper";

const StudiesSwiper = dynamic(() => import("./StudiesSwiper"));

const STUDIES: Study[] = [
  {
    image: "/images/image-1.png",
    tag: "vietnam championship series",
    title: "TỰ HÀO VCS XUẤT HIỆN TRÊN \nTRUYỀN HÌNH QUỐC GIA VTV",
    description:
      "Chung kết VCS khép lại mùa giải thành công, đánh dấu sự trở lại ấn tượng sau nhiều năm. Sự kiện thu hút đông đảo cộng đồng game và vinh dự xuất hiện trên nhiều trang báo lớn, đặc biệt là bản tin thể thao VTV1.",
  },
  {
    image: "/images/image-2.png",
    tag: "Teamfight tactics",
    title: "Sự kiện quy mô lớn\nĐẤU TRƯỜNG HỖN CHIẾN",
    description:
      "Sự kiện offline Đấu Trường Chân Lý lớn nhất Việt Nam quy tụ hơn 1.000 cờ thủ tham gia. Đấu Trường Hỗn Chiến mang đến không khí lễ hội sôi động và quà tặng độc quyền giá trị dành cho người chơi.",
  },
  {
    image: "/images/image-3.png",
    tag: "into the arcane",
    title: "Sự kiện offline chào đón\narcane season 2",
    description:
      "Sự kiện offline tại Việt Nam chào đón bản cập nhật Arcane của Riot Games. Người chơi được trải nghiệm các hoạt động hấp dẫn như xem giải đấu eSports, tham gia trò chơi nhận quà.",
  },
  {
    image: "/images/image-4.png",
    tag: "Valorant",
    title: "BST phong cách đặc vụ\nCLOVE VALORANT",
    description:
      "Bộ sưu tập Clove ra mắt chào đón Đặc vụ 25 – Clove trong VALORANT, mang đậm phong cách của nhân vật, tạo sự hào hứng và mong chờ cho người chơi.",
  },
  {
    image: "/images/image-5.png",
    tag: "pubg mobile esports",
    title: "2022 PMPL VIETNAM FINALS",
    description:
      "PMPL Vietnam Mùa Thu 2022 là giải đấu PUBG MOBILE hàng đầu, nơi các đội tuyển tranh ngôi Vô địch quốc nội và 4 vé dự PMPL SEA Championship Mùa Thu 2022. Toàn bộ sự kiện được tổ chức, vận hành và phát sóng bởi đội ngũ Việt Nam.",
  },
  {
    image: "/images/image-6.png",
    tag: "VCT 2024",
    title: "VIEWING PARTY CKTG\nVALORANT CHAMPIONS 2024",
    description:
      "Sự kiện Viewing Party VALORANT Champions 2024 là cơ hội để các fan VALORANT VN nhau hòa mình vào không khí sôi động, cùng nhau tận hưởng trận đấu kịch tính, bùng nổ với những pha highlight đỉnh cao.",
  },
];

const Studies = () => {
  return (
    <div id={RouterRoot.Studies} className="py-10 relative" data-aos="fade-up">
      <div className="absolute top-0 left-0 w-full">
        <Image
          src="/images/bg-vector.webp"
          alt=""
          width={1806}
          height={506}
          sizes="100vw"
          className="w-full h-[150px] object-cover"
        />
      </div>
      <div className="container mx-auto px-8 pr-0 lg:px-0">
        <div className="grid grid-cols-3 lg:max-w-6xl mx-auto items-center">
          <h3 className="mb-5 lg:text-[48px] text-[32px] font-bold col-span-2 lg:col-span-1 uppercase">
            CASE STUDIES
          </h3>
          <div className="bg-light h-[5px] w-full lg:col-span-2 col-span-1 translate-y-[-10px]"></div>
        </div>
      </div>
      <div className="swipers ml-4 lg:ml-0">
        <StudiesSwiper studies={STUDIES} />
      </div>
    </div>
  );
};

export default Studies;
