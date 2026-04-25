import { unstable_cache } from "next/cache";
import { database } from "@/app/database";

const TABLE_BY_TYPE: Record<string, string | undefined> = {
  "job-types": process.env.JOB_TYPES_TABLE,
  "job-categories": process.env.JOB_CATEGORIES_TABLE,
  locations: process.env.LOCATIONS_TABLE,
  "product-groups": process.env.PRODUCT_GROUPS_TABLE,
};

const getFilterValues = unstable_cache(
  async (table: string) => {
    const records = await database(table)
      .select({
        fields: ["Name"],
        filterByFormula: "{Status}='Active'",
      })
      .firstPage();
    return records.map((item) => ({
      name: item.fields["Name"],
      id: item.fields["Name"],
    }));
  },
  ["filter-values"],
  { revalidate: 300, tags: ["filter-values"] },
);

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ type: string }> },
) {
  const { type } = await params;
  const table = TABLE_BY_TYPE[type];
  if (!table) {
    return Response.json([], { status: 404 });
  }
  try {
    const data = await getFilterValues(table);
    return Response.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error(`[/api/filters/${type}] error`, error);
    return Response.json([], { status: 200 });
  }
}
