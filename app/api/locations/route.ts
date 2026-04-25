import { unstable_cache } from "next/cache";
import { database } from "@/app/database";

const getLocations = unstable_cache(
  async () => {
    const response = await database(process.env.LOCATIONS_TABLE || "")
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
  ["locations"],
  { revalidate: 300, tags: ["locations"] },
);

export async function GET() {
  try {
    const data = await getLocations();
    return Response.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("[/api/locations] error", error);
    return Response.json([], { status: 200 });
  }
}
