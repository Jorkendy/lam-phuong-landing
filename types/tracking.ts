export type EventName =
  | "service_view"
  | "service_expand"
  | "case_study_view"
  | "cta_click"
  | "contact_email_click"
  | "job_alert_subscribe_submit"
  | "job_alert_subscribe_success"
  | "job_alert_subscribe_error"
  | "job_card_view"
  | "job_view"
  | "apply_click"
  | "jobs_load_more"
  | "job_filter_apply"
  | "jobs_empty_view"
  | "job_detail_scroll";

export type PageType = "home" | "jobs_list" | "job_detail";
export type ApplySource = "list" | "detail";
export type FilterKey =
  | "job_types"
  | "job_categories"
  | "product_groups"
  | "locations";

/** Job context — KHÔNG còn `market`. `tags` chỉ có ở detail. */
export interface JobContext {
  job_id: string;
  job_title: string;
  job_slug: string;
  location?: string;
}

export interface EventPayloadMap {
  service_view: { page_type: "home"; service_name: string; position: number };
  service_expand: { page_type: "home"; service_name: string; position: number };
  case_study_view: {
    page_type: "home";
    case_study_name: string;
    position: number;
  };
  cta_click: {
    page_type: "home";
    cta_label: string;
    source_section: string;
    destination: string;
  };
  contact_email_click: {
    page_type: PageType;
    email: string;
    source_section: string;
  };

  job_alert_subscribe_submit: { page_type: "jobs_list" };
  job_alert_subscribe_success: { page_type: "jobs_list" };
  job_alert_subscribe_error: {
    page_type: "jobs_list";
    reason: "invalid_email" | "server_error";
  };

  job_card_view: JobContext & { page_type: "jobs_list"; position: number };
  job_view:
    | (JobContext & {
        page_type: "jobs_list";
        position: number;
        source: "list";
      })
    | (JobContext & { page_type: "job_detail"; tags: string; source: "detail" });
  apply_click: JobContext & {
    page_type: "jobs_list" | "job_detail";
    source: ApplySource;
    destination_url: string;
    max_scroll_percent?: number; // chỉ khi source = 'detail'
    tags?: string; // chuỗi join, có khi apply từ detail
  };
  jobs_load_more: { page_type: "jobs_list"; current_count: number };
  job_filter_apply: {
    page_type: "jobs_list";
    filter_key: FilterKey;
    filter_value: string;
    action: "add" | "remove";
  };
  jobs_empty_view: { page_type: "jobs_list"; has_active_filter: boolean };
  job_detail_scroll: JobContext & {
    page_type: "job_detail";
    percent: 25 | 50 | 75 | 100;
  };
}
