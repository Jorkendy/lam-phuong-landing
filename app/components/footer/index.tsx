import Image from "next/image";

const Footer = () => {
  return (
    <footer className="relative">
      <div className="container mx-auto px-8 mt-8 lg:mt-0">
        <div className="border-t-5 border-light py-8">
          <Image
            src="/images/logo.png"
            alt="Lam Phương"
            width={260}
            height={68}
            sizes="(max-width: 1280px) 160px, 260px"
            className="w-[160px] xl:w-[260px] h-auto"
          />
          <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 lg:gap-8 mt-10">
            <div className="max-w-64">
              <p>
                ©2025 Công ty Cổ phẩn Giải trí và Truyền Thông Lam Phương
              </p>
            </div>
            <div className="max-w-64">
              <p>
                Tầng 2, Số 3, 27/16 Huỳnh Thúc Kháng, Phường Láng Hạ, Quận Đống
                Đa, Hà Nội
              </p>
            </div>
            <div className="max-w-64">
              <p>Contact:</p>
              <p>
                <a href="mailto:hr@lamphuong.com.vn" className="hover:text-light">
                  hr@lamphuong.com.vn
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
