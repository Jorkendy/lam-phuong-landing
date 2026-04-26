import { NextRequest } from "next/server";
import { GetRecordsResponse, JobFields, LocationFields } from "@/type";
import {
  buildJobsFilterFormula,
  jobListFieldsQuery,
} from "@/app/jobs-search/lib/filter";

const BASE_URL = `https://api.airtable.com/v0/${process.env.BASE_ID}`;
const PAGE_SIZE = 3;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const offset = searchParams.get("offset") || "";
    const formula = buildJobsFilterFormula(searchParams);

    const params = new URLSearchParams();
    params.set("pageSize", String(PAGE_SIZE));
    params.set("filterByFormula", formula);
    if (offset) params.set("offset", offset);

    const url = `${BASE_URL}/${process.env.JOBS_TABLE}?${jobListFieldsQuery()}&${params.toString()}`;
    const response: GetRecordsResponse<JobFields> = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
      },
      next: { revalidate: 60, tags: ["jobs"] },
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
          next: { revalidate: 300, tags: ["locations"] },
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

    return new Response(
      JSON.stringify({ data, offset: response.offset || "" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("[/api/jobs] error", error);
    return new Response(JSON.stringify({ data: [], offset: "" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}
