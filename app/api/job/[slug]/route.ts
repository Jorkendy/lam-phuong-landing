import { getJobDetail } from "../service";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const data = await getJobDetail(slug);
    return Response.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
      },
    });
  } catch (error) {
    console.error("[/api/job/[slug]] error", error);
    return Response.json(null, { status: 404 });
  }
}
