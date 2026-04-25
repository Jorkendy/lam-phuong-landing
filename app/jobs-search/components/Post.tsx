import Link from "next/link";

type PostProps = {
  slug: string;
  title: string;
  summary: string;
  location: string;
};

export default function Post({ slug, title, summary, location }: PostProps) {
  return (
    <div className="group rounded-3xl p-4 border border-light shadow-[0_2px_0_rgba(66,157,165,1)] flex flex-col gap-4 mb-6 bg-white">
      <Link href={`/jobs-search/chi-tiet/${slug}`}>
        <h2 className="group-hover:text-light hover:text-light text-[24px] lg:text-[36px] leading-9">
          {title}
        </h2>
      </Link>
      <p className="line-clamp-3">{summary}</p>
      <div className="flex justify-between items-center">
        <div className="group">
          {!!location && (
            <div className="flex items-center gap-2">
              <svg width="13" height="18">
                <use href="/images/icons.svg#icon-location" />
              </svg>
              <p className="text-light">{location}</p>
            </div>
          )}
        </div>

        <Link href="https://airtable.com/applRt3FQ5QTJY6sn/pag3suI5n5zwMkT6o/form">
          <button className="cursor-pointer text-light lg:text-[18px] border border-light rounded-3xl px-4 py-1 hover:bg-light hover:text-white">
            Apply Now
          </button>
        </Link>
      </div>
    </div>
  );
}
