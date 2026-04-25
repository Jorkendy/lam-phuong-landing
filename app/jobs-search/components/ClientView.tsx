"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import SubscribeSection from "./SubscribeSection";
import { ChevronDown } from "lucide-react";
import Banner from "@/public/images/banner-page.png";
import Image from "next/image";
import Post from "./Post";
import Filter from "./Filter";

type JobItem = {
  title: string;
  summary: string;
  location: string;
  slug: string;
};

type ClientViewProps = {
  offset: string | null;
  data: JobItem[];
};

export default function ClientView({
  offset: initialOffset,
  data,
}: ClientViewProps) {
  const searchParams = useSearchParams();
  const [records, setRecords] = useState<JobItem[]>(data);
  const [offset, setOffset] = useState<string | null>(initialOffset);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setOffset(initialOffset);
  }, [initialOffset]);

  useEffect(() => {
    setRecords(data);
  }, [data]);

  const loadMore = async () => {
    if (!offset || loading) return;
    setLoading(true);
    try {
      const params = new URLSearchParams(searchParams.toString());
      params.set("offset", offset);
      const res = await fetch(`/api/jobs?${params.toString()}`).then((res) =>
        res.json(),
      );
      setRecords((prev) => [...prev, ...res.data]);
      setOffset(res.offset || null);
    } catch (error) {
      console.error("Error fetching more records:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main id="main-content" className="pt-[116px]">
      <div
        className="container mx-auto px-6 lg:px-0 relative"
        data-aos="fade-up"
      >
        <div className="lg:max-w-6xl mx-auto lg:py-16 py-5 relative">
          <Image
            className="w-full"
            src={Banner}
            alt="Banner image"
            width={1260}
            height={540}
          />

          <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8 mt-5 lg:mt-16">
            <div className="col-span-1">
              <Filter />

              <SubscribeSection />
            </div>

            <div className="col-span-2 relative z-1">
              {records.map((item) => {
                return <Post key={item.slug} {...item} />;
              })}

              {offset && (
                <div className="mt-16 px-8" onClick={loadMore}>
                  <button
                    disabled={loading}
                    className="flex flex-col justify-center items-center text-light text-[22px] cursor-pointer text-center mx-auto lg:mx-0 disabled:opacity-50"
                  >
                    {loading ? "Đang tải..." : "Xem thêm"}
                    <ChevronDown className=" text-light" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
