import { unstable_cache } from "next/cache";
import { database } from "@/app/database";

const getJobTypes = unstable_cache(
  async () => {
    const response = await database(process.env.JOB_TYPES_TABLE || "")
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
  ["job-types"],
  { revalidate: 300, tags: ["job-types"] },
);

export async function GET() {
  try {
    const data = await getJobTypes();
    return Response.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("[/api/job-types] error", error);
    return Response.json([], { status: 200 });
  }
}
