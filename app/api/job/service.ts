import { unstable_cache } from "next/cache";
import { database } from "@/app/database";
import { FieldSet } from "airtable";

interface NamedRecord extends FieldSet {
  Name: string;
}

export const getJobDetail = unstable_cache(
  async (slug: string) => {
    const chunks = slug.split("-");
    const recordID = chunks[chunks.length - 1];

    const response = await database(process.env.JOBS_TABLE || "").find(
      recordID,
    );
    const fields = response.fields;

    const locationId = ((fields["Khu vực"] as string[]) || [])[0] || "";

    async function fetchNames(table: string, ids: string[]): Promise<string[]> {
      if (ids.length === 0) return [];
      const formula = `OR(${ids.map((id) => `RECORD_ID()="${id}"`).join(",")})`;
      const records = await database<NamedRecord>(table)
        .select({ filterByFormula: formula })
        .firstPage();
      return records.map((r) => r.fields["Name"]);
    }

    const [locationResponse, jobTypes, jobCategories, productGroups] =
      await Promise.all([
        locationId
          ? database(process.env.LOCATIONS_TABLE || "").find(locationId)
          : null,
        fetchNames(
          process.env.JOB_TYPES_TABLE || "",
          (fields["Loại công việc"] as string[]) || [],
        ),
        fetchNames(
          process.env.JOB_CATEGORIES_TABLE || "",
          (fields["Danh mục công việc"] as string[]) || [],
        ),
        fetchNames(
          process.env.PRODUCT_GROUPS_TABLE || "",
          (fields["Nhóm sản phẩm"] as string[]) || [],
        ),
      ]);

    return {
      title: fields["Tiêu đề"] as string,
      description: fields["Mô tả công việc"] as string,
      requirements: fields["Yêu cầu"] as string,
      benefits: fields["Quyền lợi"] as string,
      location: locationResponse
        ? (locationResponse.fields["Name"] as string)
        : "",
      tags: [...jobTypes, ...jobCategories, ...productGroups],
    };
  },
  ["job-detail"],
  { revalidate: 300, tags: ["job-detail"] },
);
