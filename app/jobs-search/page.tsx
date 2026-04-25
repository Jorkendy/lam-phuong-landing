import ClientView from "./components/ClientView";
import { GetRecordsResponse, JobFields, LocationFields } from "@/type";
import { buildJobsFilterFormula, jobListFieldsQuery } from "./lib/filter";

const BASE_URL = `https://api.airtable.com/v0/${process.env.BASE_ID}`;
const PAGE_SIZE = 5;

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const formula = buildJobsFilterFormula(params);
  const encodedFormula = encodeURIComponent(formula);

  const url = `${BASE_URL}/${process.env.JOBS_TABLE}?pageSize=${PAGE_SIZE}&${jobListFieldsQuery()}&filterByFormula=${encodedFormula}`;
  const response: GetRecordsResponse<JobFields> = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
    },
    next: { revalidate: 0 },
  }).then((res) => res.json());

  const records = response.records || [];
  const locationIds = Array.from(
    new Set(
      records
        .map(({ fields }) => fields["Khu vực"]?.[0])
        .filter((id): id is string => !!id),
    ),
  );

  const locationMap: Record<string, string> = {};
  if (locationIds.length > 0) {
    const filterLocationFormula = `OR(${locationIds
      .map((id) => `RECORD_ID()="${id}"`)
      .join(",")})`;
    const urlLocation = `${BASE_URL}/${process.env.LOCATIONS_TABLE}?filterByFormula=${encodeURIComponent(filterLocationFormula)}`;
    const responseLocation: GetRecordsResponse<LocationFields> = await fetch(
      urlLocation,
      {
        headers: {
          Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
        },
        next: { revalidate: 0 },
      },
    ).then((res) => res.json());
    (responseLocation.records || []).forEach((record) => {
      locationMap[record.id] = record.fields["Name"];
    });
  }

  const data = records.map(({ fields, id }) => ({
    title: fields["Tiêu đề"],
    summary: fields["Mô tả công việc"],
    location: locationMap[fields["Khu vực"]?.[0]] || "",
    slug: `${fields["Slug"]}-${id}`,
  }));

  return <ClientView data={data} offset={response.offset || null} />;
}
