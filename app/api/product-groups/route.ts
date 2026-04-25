import { unstable_cache } from "next/cache";
import { database } from "@/app/database";

const getProductGroups = unstable_cache(
  async () => {
    const response = await database(process.env.PRODUCT_GROUPS_TABLE || "")
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
  ["product-groups"],
  { revalidate: 300, tags: ["product-groups"] },
);

export async function GET() {
  try {
    const data = await getProductGroups();
    return Response.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("[/api/product-groups] error", error);
    return Response.json([], { status: 200 });
  }
}
