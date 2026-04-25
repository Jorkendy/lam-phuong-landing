import { unstable_cache } from "next/cache";
import { database } from "@/app/database";

const getJobCategories = unstable_cache(
  async () => {
    const response = await database(process.env.JOB_CATEGORIES_TABLE || "")
      .select({
        fields: ["Name"],
        filterByFormula: "{Status}='Active'",
      })
      .firstPage();
    return response.map((item) => ({
      name: item.fields["Name"],
      id: item.fields["Name"],
    }));
  },
  ["job-categories"],
  { revalidate: 300, tags: ["job-categories"] },
);

export async function GET() {
  try {
    const data = await getJobCategories();
    return Response.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("[/api/job-categories] error", error);
    return Response.json([], { status: 200 });
  }
}
