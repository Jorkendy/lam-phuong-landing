import Link from "next/link";

type PostProps = {
  slug: string;
  title: string;
  summary: string;
  location: string;
};

export default function Post({ slug, title, summary, location }: PostProps) {
  return (
    <article className="group rounded-3xl p-4 border border-light shadow-[0_2px_0_rgba(66,157,165,1)] flex flex-col gap-4 mb-6 bg-white">
      <h2 className="text-[24px] lg:text-[36px] leading-9">
        <Link
          href={`/jobs-search/chi-tiet/${slug}`}
          className="group-hover:text-light hover:text-light"
        >
          {title}
        </Link>
      </h2>
      <p className="line-clamp-3">{summary}</p>
      <div className="flex justify-between items-center">
        <div>
          {!!location && (
            <div className="flex items-center gap-2">
              <svg width="13" height="18" aria-hidden="true">
                <use href="/images/icons.svg#icon-location" />
              </svg>
              <p className="text-light">{location}</p>
            </div>
          )}
        </div>

        <Link
          href="https://airtable.com/applRt3FQ5QTJY6sn/pag3suI5n5zwMkT6o/form"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Ứng tuyển vị trí ${title}`}
          className="cursor-pointer text-light lg:text-[18px] border border-light rounded-3xl px-4 py-1 hover:bg-light hover:text-white inline-block"
        >
          Apply Now
        </Link>
      </div>
    </article>
  );
}
