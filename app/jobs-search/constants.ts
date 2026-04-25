export const enum FilterKeyEnum {
  JobTypes = 1,
  JobCategories = 2,
  ProductGroups = 3,
  Locations = 4,
}

export const CONFIG_BY_KEY = {
  [FilterKeyEnum.JobTypes]: {
    api: "/api/filters/job-types",
    key: "job_types",
    title: "Loại công việc",
  },
  [FilterKeyEnum.JobCategories]: {
    api: "/api/filters/job-categories",
    key: "job_categories",
    title: "Ngành nghề",
  },
  [FilterKeyEnum.ProductGroups]: {
    api: "/api/filters/product-groups",
    key: "product_groups",
    title: "Nhóm sản phẩm",
  },
  [FilterKeyEnum.Locations]: {
    api: "/api/filters/locations",
    key: "locations",
    title: "Địa điểm",
  },
};
