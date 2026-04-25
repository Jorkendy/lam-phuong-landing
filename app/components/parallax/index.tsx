import Image from "next/image";

const Parallax = () => {
  return (
    <div className="mt-14">
      <Image
        src="/images/bg-parallax.png"
        alt=""
        width={1920}
        height={811}
        sizes="100vw"
        className="w-full object-cover lg:h-[810px] h-[235px]"
      />
    </div>
  );
};

export default Parallax;
