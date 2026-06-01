# Tracking Plan — lamphuong.com.vn (đã đối chiếu source code)

> **Phạm vi:** 3 trang — Trang chủ (`/`), Danh sách tuyển dụng (`/jobs-search`), Chi tiết job (`/jobs-search/chi-tiet/[slug]`).
> **Mục tiêu kinh doanh:** (1) **Recruitment lead-gen** — phễu `cta_click → job_view → apply_click`; (2) **Brand/Portfolio** — đo engagement với services, case studies, partners, subscribe.
> **Convention:** event name `snake_case`, param key `snake_case`.
> **Stack thực tế (đã verify):** Next.js 16 (App Router) + **Umami self-host** (`window.umami.track`) + **Airtable** (qua API/server).
> **Trạng thái:** Đây là bản **hoàn chỉnh, đã đối chiếu với source code thật** (không còn ASSUMPTION). Mọi event đã được kiểm tra điểm gắn trong code; những event không có điểm gắn (không clickable) đã bị loại bỏ; bổ sung các event mới phát hiện trong code (filter, subscribe states).

---

## 0. Chú giải trạng thái (so với bản đề xuất ban đầu)

| Ký hiệu | Ý nghĩa |
|---|---|
| ✅ **GIỮ** | Có điểm gắn thật trong code, giữ nguyên |
| ⚠️ **SỬA** | Có trong code nhưng phải đổi trigger/param cho đúng thực tế |
| ❌ **BỎ** | Không có điểm gắn (element không clickable / không tồn tại) → loại khỏi plan |
| ➕ **MỚI** | Phát hiện trong code, chưa có trong bản đề xuất ban đầu |

**Tóm tắt thay đổi lớn nhất so với bản đầu:**
1. ✅ **Umami đã được nhúng sẵn** trong `app/layout.tsx` → §7.1 coi như xong (xem giá trị thật bên dưới).
2. ✅ **Lỗi SEO `canonical`/`og:url` = localhost (§6.5 bản cũ) đã được xử lý** — layout dùng `metadataBase` với fallback `https://lamphuong.com.vn`. Không còn là vấn đề.
3. ⚠️ **Form subscribe ĐÃ CÓ function** (gọi `/api/subscribe` → ghi Airtable) → nâng cấp từ "chỉ track click" thành **submit / success / error**.
4. ❌ **`service_click`, `case_study_click`, `partner_logo_click`** — các element này **không clickable** trong code → bỏ (xem chi tiết từng mục).
5. ⚠️ **`apply_click`** dùng `<a target="_blank">` → **đã mở tab mới**, race condition không còn → KHÔNG cần `sendBeacon`/`await`. Và **`destination_url` là URL Airtable cố định, dùng chung cho mọi job** ⇒ attribution job phải lấy từ context client-side.
6. ⚠️ **Job context** đổi theo data model thật: **bỏ `market`** (không có field), `work_type`/`tags` lấy từ Loại công việc / Danh mục / Nhóm sản phẩm.
7. ➕ **Thêm `job_filter_apply`** — bộ lọc (loại công việc, ngành nghề, nhóm sản phẩm, địa điểm) là tín hiệu nhu cầu rất giá trị, bản cũ bỏ sót.

---

## 1. Ràng buộc Umami (FACT)

- Dùng **JS API `umami.track(name, data)`**, KHÔNG dùng `data-umami-event-*`. Lý do: data-attribute lưu mọi giá trị thành **string**; plan có param `number` (`position`, `percent`, `current_count`) và `boolean` ⇒ bắt buộc JS API để giữ đúng kiểu.
- `umami.track()` **trả về Promise**. Vì các nút Apply đã mở **tab mới** (không unload trang) nên KHÔNG bắt buộc `await`; vẫn nên `try/catch` nuốt lỗi.
- **Pageview tự động:** Umami auto-track pageview cả 3 trang ⇒ **KHÔNG** track thủ công `page_view`. Riêng `job_view` của trang detail (D1) vẫn track như custom event vì cần job context.
- **Default properties tự động** (`url`, `referrer`, `title`, `hostname`, `language`, `screen`) đã có ⇒ KHÔNG tự thêm `page_path`/`page_title`.
- Event name ≤ 50 ký tự (toàn bộ tên trong plan đều đạt).

### Cấu hình tracker thực tế (đã có trong code — `app/layout.tsx`)

```tsx
<Script
  src="https://analytics.vinhpham.com.vn/script.js"
  data-website-id="3bd8f72f-d23f-439a-a6e1-2142dff4d815"
  data-domains="lamphuong.com.vn"
  strategy="afterInteractive"
/>
```

> ⚠️ Ghi chú: host & website-id hiện **hardcode** trong layout. Không bắt buộc đổi, nhưng nếu muốn nhiều môi trường (dev/stg/prod) thì nên đưa vào env `NEXT_PUBLIC_UMAMI_HOST`, `NEXT_PUBLIC_UMAMI_WEBSITE_ID`. `data-domains="lamphuong.com.vn"` ⇒ Umami **chỉ ghi nhận** traffic từ domain này (local/dev sẽ không gửi event — cần test trên domain prod hoặc bỏ tạm `data-domains` khi QA).

---

## 2. Quy ước chung (Conventions)

### 2.1. Naming
- Event: động từ + danh từ, `snake_case`. Ví dụ: `apply_click`, `job_view`.
- Param: `snake_case`, giá trị `string` / `number` / `boolean`, không lồng object sâu.
- Giá trị enum chuẩn hoá viết thường, không dấu.

### 2.2. Param dùng chung (common params)
Umami **đã tự** thu `url`, `referrer`, `title`, `hostname`, `language`, `screen` — KHÔNG thêm lại. Chỉ thêm:

| Param | Type | Mô tả | Ví dụ |
|---|---|---|---|
| `page_type` | `string` | Loại trang (enum), Umami không tự suy ra | `home` |

`page_type` enum: `home` | `jobs_list` | `job_detail`.

### 2.3. Param định danh job (job context)
Gắn vào mọi event liên quan tới job. **Đã chỉnh theo data model Airtable thật:**

| Param | Type | Bắt buộc | Nguồn dữ liệu thật | Có ở List? | Có ở Detail? |
|---|---|---|---|---|---|
| `job_id` | `string` | có | Record id Airtable = **đoạn cuối slug sau dấu `-` cuối cùng** | ✅ (parse từ slug) | ✅ (parse từ slug) |
| `job_title` | `string` | có | Field `Tiêu đề` | ✅ | ✅ |
| `job_slug` | `string` | có | `${Slug}-${recordId}` | ✅ | ✅ (param `slug`) |
| `location` | `string` | nên có | Field `Khu vực` → Location `Name` | ✅ (`locationMap`) | ✅ |
| `tags` | `string` (chuỗi join) | detail | `Loại công việc` + `Danh mục công việc` + `Nhóm sản phẩm` (merge → join bằng `,`) | ❌ không có | ✅ |

> ❌ **Bỏ `market`**: không tồn tại field nào về "thị trường" trong Airtable. (Các field thật: `Tiêu đề`, `Mô tả công việc`, `Khu vực`, `Slug`, `Hạn chót nhận`, `Loại công việc`, `Danh mục công việc`, `Nhóm sản phẩm`, `Yêu cầu`, `Quyền lợi`, `Status`.)
> ⚠️ **`tags` là chuỗi join (KHÔNG phải array)** — vì Umami flatten array thành key theo vị trí (`tags.0`, `tags.1`...), không group/filter được. Dùng `tags` chỉ để **hiển thị/debug**, không dùng để phân tích chéo. Muốn slice theo loại công việc → dùng `job_filter_apply`, hoặc nâng cấp scalar (xem §10 Roadmap).
> ⚠️ **`work_type`**: ánh xạ từ `Loại công việc`, nhưng service hiện **gộp chung** vào `tags` (`app/api/job/service.ts:58`). Long-term nên tách thành **scalar** ở backend — xem §7.6 & §10.
> **Cách lấy `job_id`** (FACT — `app/api/job/service.ts:11-13`): `const recordID = slug.split("-").pop()`. Slug có thể chứa nhiều dấu `-`, nên **luôn lấy đoạn cuối**, không regex. Nên có hàm `extractJobId(slug)` dùng chung cho list & detail.

---

## 3. Trang chủ — `page_type = home`

| # | Event | Trạng thái | Trigger (điểm gắn thật) | Khi nào fire | Params riêng | Loại |
|---|---|---|---|---|---|---|
| H1 | ~~`page_view`~~ | — | — | Không track — Umami auto | — | Pageview |
| H2 | `service_view` | ✅ GIỮ | Card trong "Our services" (`app/components/services/index.tsx`) vào viewport | Mỗi card ≥50% lần đầu/phiên | `service_name`, `position` | Impression |
| H3 | `service_expand` | ⚠️ SỬA (was `service_click`) | Card là **accordion toggle** (`onClick` mở mô tả), **không phải link** | Khi user **mở** một service (expand) | `service_name`, `position` | Engagement |
| H4 | `case_study_view` | ⚠️ SỬA | Slide trong Swiper "CASE STUDIES" (`StudiesSwiper.tsx`) | Khi slide hiển thị (dùng `onSlideChange` của Swiper hoặc IO) | `case_study_name`, `position` | Impression |
| ~~H5~~ | ~~`case_study_click`~~ | ❌ BỎ | Slide **chỉ hover hiện mô tả**, không có link/onClick | — | — | — |
| H6 | `cta_click` | ✅ GIỮ | `<Link href="/jobs-search">Xem công việc</Link>` (`careers/index.tsx:28`) | Khi click | `cta_label="xem_cong_viec"`, `source_section="careers_home"`, `destination="/jobs-search"` | Conversion (micro) |
| ~~H7~~ | ~~`partner_logo_click`~~ | ❌ BỎ | Logo partner **không clickable**, `alt=""`, không có tên (`partners/index.tsx`) | — | — | — |
| H8 | `contact_email_click` | ✅ GIỮ | `mailto:hr@lamphuong.com.vn` trong footer (`footer/index.tsx:31`) | Khi click | `email`, `source_section="footer"` | Conversion (micro) |

**Ghi chú:**
- `SERVICES` là mảng cứng 5 mục (`Content marketing`, `Creative Production`, `KOLs/Influencer Booking`, `PR & Communication`, `Public Event & Activation`). `service_name` = `title`, `position` = index.
- `STUDIES` là mảng cứng 6 mục, Swiper **autoplay** (`StudiesSwiper.tsx`). Vì autoplay tự chạy, nên track theo **`onSlideChange`** (slide nào thực sự đang ở giữa) thay vì IntersectionObserver để tránh nhiễu. `case_study_name` = `tag` (vd `vietnam championship series`).
- **Footer nằm trong root layout** ⇒ `contact_email_click` có thể fire ở **cả 3 trang**; set `page_type` theo trang đang đứng.
- H2/H4 impression: dùng `IntersectionObserver` `threshold: 0.5`, fire **một lần/phiên/phần tử**, `unobserve` sau khi fire.

---

## 4. Danh sách tuyển dụng — `page_type = jobs_list`

| # | Event | Trạng thái | Trigger (điểm gắn thật) | Khi nào fire | Params riêng | Loại |
|---|---|---|---|---|---|---|
| L1 | ~~`page_view`~~ | — | — | Không track — Umami auto | — | Pageview |
| L2a | `job_alert_subscribe_submit` | ⚠️ SỬA | Nút "Đăng ký" (`SubscribeSection.tsx:71`) — form **đã hoạt động** | Khi user bấm submit (sau validate client pass) | — | Engagement |
| L2b | `job_alert_subscribe_success` | ➕ MỚI | Response `/api/subscribe` trả `{ok:true}` | Khi ghi Airtable thành công | — | Conversion (micro) |
| L2c | `job_alert_subscribe_error` | ➕ MỚI | Email không hợp lệ hoặc API lỗi | Khi `status="error"` | `reason` (`invalid_email` \| `server_error`) | Engagement |
| L3 | `job_card_view` | ✅ GIỮ | Mỗi `<article>` job card (`Post.tsx`) vào viewport | Mỗi card ≥50% lần đầu/phiên | job context + `position` | Impression |
| L4 | `job_view` | ✅ GIỮ | Click tiêu đề job — `<Link href="/jobs-search/chi-tiet/${slug}">` (`Post.tsx:25`) | Khi click (client nav, không unload) | job context + `position`, `source="list"` | Funnel (bước 2) |
| L5 | `apply_click` | ✅ GIỮ | Nút "Apply Now" — `<a target="_blank" rel="noopener noreferrer">` (`Post.tsx:58`) | Khi click | job context + `source="list"`, `destination_url` | **Conversion (chính)** |
| L6 | `jobs_load_more` | ✅ GIỮ | Nút "Xem thêm" (`ClientView.tsx:111-118`) | Khi click | `current_count` (số job đang hiển thị trước khi load) | Engagement |
| L7 | `job_filter_apply` | ➕ MỚI | Checkbox trong Filter (`FilterBase.tsx:91` `onChange`) | Mỗi lần tick/bỏ tick 1 giá trị lọc | `filter_key`, `filter_value`, `action` (`add`\|`remove`) | Engagement |
| L8 | `jobs_empty_view` | ➕ MỚI (khuyến nghị) | Khối empty-state khi `records.length === 0` (`ClientView.tsx:84`) | Khi danh sách rỗng hiển thị | `has_active_filter` (`boolean`) | Diagnostics |

**Ghi chú quan trọng:**
- **Subscribe (L2)** gated bởi feature flag `FEATURES.SUBSCRIBE` (`app/feature-flags.ts`, hiện = `true`). Validate client: regex email (`SubscribeSection.tsx:7`). Server (`/api/subscribe`) trả `error: "invalid_email" | "invalid_body" | "server_error"`. Map `reason` từ đó.
- **`apply_click` — attribution:** `destination_url` là **một URL Airtable cố định** dùng chung cho mọi job: `https://airtable.com/applRt3FQ5QTJY6sn/pag3suI5n5zwMkT6o/form`. Form Airtable **không biết** job nào ⇒ **chỉ có job context bắn từ client mới cho biết user apply từ tin nào**. Đây là lý do bắt buộc track `apply_click` kèm job context.
- **Không có race condition** với apply: link đã `target="_blank" rel="noopener noreferrer"` ⇒ trang hiện tại không unload. Chỉ cần `umami.track(...)` trong `onClick`, không cần `await`/`sendBeacon`.
- `job_card_view` ở list **không có `tags`** (list chỉ trả title/summary/location/slug/deadline — `jobs-search/page.tsx:69-75`). Job context list = `job_id` + `job_title` + `job_slug` + `location`.
- `jobs_load_more`: `PAGE_SIZE = 5` (`jobs-search/page.tsx:7`); `current_count = records.length` ngay trước khi gọi `loadMore`.
- `job_filter_apply.filter_key` enum: `job_types` | `job_categories` | `product_groups` | `locations` (`lib/filter.ts:3-8`). `filter_value` = `name` (tên hiển thị từ API filter).
- **Phân biệt L3 vs L4:** `job_card_view` = card lọt màn hình (bị động); `job_view` = user chủ động click. Cặp này tính **CTR theo từng job** = `job_view` / `job_card_view`.

---

## 5. Chi tiết job — `page_type = job_detail`

> Trang detail là **Server Component** (`chi-tiet/[slug]/page.tsx`). Để fire `job_view` (mount), `job_detail_scroll`, và `apply_click`, cần **một client component nhỏ** nhận props (`job_id`, `job_title`, `job_slug`, `location`, `tags`) từ server rồi gắn tracking.

| # | Event | Trạng thái | Trigger (điểm gắn thật) | Khi nào fire | Params riêng | Loại |
|---|---|---|---|---|---|---|
| D1 | `job_view` | ✅ GIỮ | Page load (client wrapper `useEffect` mount) | Khi render xong | job context + `tags` (chuỗi join), `source="detail"` | Funnel + Pageview |
| D2 | `job_detail_scroll` | ✅ GIỮ | Scroll độ sâu khối JD (`<div className="mb-4 ...">`, `page.tsx:169`) | Khi đạt mốc 25/50/75/100% | job context + `percent` (`25\|50\|75\|100`) | Engagement |
| D3 | `apply_click` | ✅ GIỮ | Nút "Apply Now" — `<a target="_blank">` (`page.tsx:179`) | Khi click | job context + `source="detail"`, `destination_url`, `max_scroll_percent` | **Conversion (chính)** |

**Ghi chú:**
- `tags` ở detail = `[...jobTypes, ...jobCategories, ...productGroups]` (`service.ts:58`) → **join bằng `,`** trước khi bắn (vd `"Freelancer,Social Content,ROBLOX"`). Lý do dùng chuỗi thay vì array: xem §2.3.
- `apply_click` detail dùng **cùng URL Airtable cố định** như list ⇒ `source` (`list` vs `detail`) là cách duy nhất phân biệt nguồn apply.
- D2: mỗi mốc fire **một lần/phiên**; lưu mốc sâu nhất vào biến để gắn `max_scroll_percent` vào D3. `max_scroll_percent` giúp phát hiện "apply mà chưa đọc hết JD" → chỉ báo chất lượng lead.

---

## 6. Phễu & chỉ số (Funnels & Metrics)

**Recruitment funnel (chính):**

```
cta_click (H6, từ home)        ─┐
                                ├─► job_view (L4 / D1) ─► apply_click (L5 / D3)
direct vào /jobs-search         ─┘
```

| Chỉ số | Công thức |
|---|---|
| **Home → Jobs CR** | phiên có `cta_click` (H6) dẫn tới pageview `jobs_list` |
| **Job CTR** | `job_view` / `job_card_view` (theo từng `job_id`) |
| **Apply CR** | `apply_click` / `job_view`, tách theo `source` (`list` vs `detail`) |
| **Apply không đọc hết JD** | phân phối `max_scroll_percent` trong `apply_click` (D3) |
| **Demand theo bộ lọc** | đếm `job_filter_apply` theo `filter_key` + `filter_value` |
| **Subscribe CR** | `job_alert_subscribe_success` / `job_alert_subscribe_submit` |

**Brand engagement (phụ):** `service_view`/`service_expand`, `case_study_view`, `contact_email_click`.

---

## 7. Implementation Spec (cho dev / Claude Code)

> Stack thực tế: **Next.js 16 App Router + Umami self-host + Airtable**. Umami đã nhúng sẵn (§1).

### 7.1. Khởi tạo Umami — ✅ ĐÃ XONG
Đã có `<Script>` Umami trong `app/layout.tsx:100` (xem §1). Không cần làm lại. `window.umami.track` khả dụng sau khi script load.

### 7.2. TypeScript types (`types/tracking.ts`)

```ts
export type EventName =
  | 'service_view'
  | 'service_expand'
  | 'case_study_view'
  | 'cta_click'
  | 'contact_email_click'
  | 'job_alert_subscribe_submit'
  | 'job_alert_subscribe_success'
  | 'job_alert_subscribe_error'
  | 'job_card_view'
  | 'job_view'
  | 'apply_click'
  | 'jobs_load_more'
  | 'job_filter_apply'
  | 'jobs_empty_view'
  | 'job_detail_scroll';

export type PageType = 'home' | 'jobs_list' | 'job_detail';
export type ApplySource = 'list' | 'detail';
export type FilterKey = 'job_types' | 'job_categories' | 'product_groups' | 'locations';

/** Job context — KHÔNG còn `market`. `tags` chỉ có ở detail. */
export interface JobContext {
  job_id: string;
  job_title: string;
  job_slug: string;
  location?: string;
}

export interface EventPayloadMap {
  service_view: { page_type: 'home'; service_name: string; position: number };
  service_expand: { page_type: 'home'; service_name: string; position: number };
  case_study_view: { page_type: 'home'; case_study_name: string; position: number };
  cta_click: { page_type: 'home'; cta_label: string; source_section: string; destination: string };
  contact_email_click: { page_type: PageType; email: string; source_section: string };

  job_alert_subscribe_submit: { page_type: 'jobs_list' };
  job_alert_subscribe_success: { page_type: 'jobs_list' };
  job_alert_subscribe_error: { page_type: 'jobs_list'; reason: 'invalid_email' | 'server_error' };

  job_card_view: JobContext & { page_type: 'jobs_list'; position: number };
  job_view:
    | (JobContext & { page_type: 'jobs_list'; position: number; source: 'list' })
    | (JobContext & { page_type: 'job_detail'; tags: string; source: 'detail' });
  apply_click: JobContext & {
    page_type: 'jobs_list' | 'job_detail';
    source: ApplySource;
    destination_url: string;
    max_scroll_percent?: number; // chỉ khi source = 'detail'
    tags?: string;               // chuỗi join, có khi apply từ detail
  };
  jobs_load_more: { page_type: 'jobs_list'; current_count: number };
  job_filter_apply: { page_type: 'jobs_list'; filter_key: FilterKey; filter_value: string; action: 'add' | 'remove' };
  jobs_empty_view: { page_type: 'jobs_list'; has_active_filter: boolean };
  job_detail_scroll: JobContext & { page_type: 'job_detail'; percent: 25 | 50 | 75 | 100 };
}
```

### 7.3. Helper `trackEvent` (`lib/track.ts`)

```ts
import type { EventName, EventPayloadMap } from '@/types/tracking';

declare global {
  interface Window {
    umami?: { track: (name: string, data?: Record<string, unknown>) => Promise<unknown> };
  }
}

export function trackEvent<E extends EventName>(name: E, payload: EventPayloadMap[E]): void {
  try {
    if (typeof window === 'undefined' || !window.umami) return;
    window.umami.track(name, payload as Record<string, unknown>);
  } catch {
    // Nuốt lỗi — tracking không bao giờ được làm vỡ UX
  }
}

/** Lấy job_id = đoạn cuối slug sau dấu '-' cuối cùng (khớp service.ts) */
export function extractJobId(slug: string): string {
  const parts = slug.split('-');
  return parts[parts.length - 1] ?? '';
}
```

### 7.4. `apply_click` — pattern (KHÔNG cần await)
Vì link đã `target="_blank" rel="noopener noreferrer"`, trang không unload. Chỉ cần gắn `onClick` lên thẻ `<a>`/`<Link>`:

```tsx
<Link
  href="https://airtable.com/applRt3FQ5QTJY6sn/pag3suI5n5zwMkT6o/form"
  target="_blank"
  rel="noopener noreferrer"
  onClick={() =>
    trackEvent('apply_click', {
      page_type: 'job_detail',
      job_id, job_title, job_slug, location,
      source: 'detail',
      destination_url: 'https://airtable.com/applRt3FQ5QTJY6sn/pag3suI5n5zwMkT6o/form',
      max_scroll_percent: getMaxScrollPercent(),
      tags,
    })
  }
>
  Apply Now
</Link>
```

### 7.5. Mapping event → component (đã verify file thật)

| Event | File / Vị trí | Cách lấy data |
|---|---|---|
| `service_view` / `service_expand` | `app/components/services/index.tsx` (mảng `SERVICES`, `onClick` ở dòng 56) | `service_name`=`title`, `position`=index |
| `case_study_view` | `app/components/studies/StudiesSwiper.tsx` (Swiper `onSlideChange`) | `case_study_name`=`tag`, `position`=index |
| `cta_click` | `app/components/careers/index.tsx:28` (`<Link href="/jobs-search">`) | giá trị tĩnh (§3 H6) |
| `contact_email_click` | `app/components/footer/index.tsx:31` (`mailto:`) | `email` tĩnh, `page_type` theo trang |
| `job_alert_subscribe_*` | `app/jobs-search/components/SubscribeSection.tsx` (`onSubmit` dòng 18) | `reason` từ `data.error` / validate |
| `job_card_view` | `app/jobs-search/components/Post.tsx` (`<article>`) + `ClientView.tsx` (`records.map`) | job context từ props + `position`=index |
| `job_view` (list) | `app/jobs-search/components/Post.tsx:25` (`<Link>` tiêu đề) | job context + `position`, `source='list'` |
| `apply_click` (list) | `app/jobs-search/components/Post.tsx:58` | job context + `source='list'` |
| `jobs_load_more` | `app/jobs-search/components/ClientView.tsx:111` | `current_count`=`records.length` |
| `job_filter_apply` | `app/jobs-search/components/FilterBase.tsx:91` (`onChange`) | `filter_key`, `filter_value`=`name`, `action`=`checked?'add':'remove'` |
| `jobs_empty_view` | `app/jobs-search/components/ClientView.tsx:84` | `has_active_filter`=`hasActiveFilter` |
| `job_view` (detail) | `chi-tiet/[slug]/page.tsx` → cần client wrapper (mount) | job context + `tags` |
| `job_detail_scroll` | `chi-tiet/[slug]/page.tsx:169` (khối JD) → client wrapper | `percent` |
| `apply_click` (detail) | `chi-tiet/[slug]/page.tsx:179` | job context + `source='detail'` + `max_scroll_percent` |

### 7.6. Nguồn data job (Airtable) — field thật & chuẩn hoá

Field thật (`type/index.ts`, `lib/filter.ts`, `api/job/service.ts`):

| Khái niệm | Field Airtable | Ghi chú |
|---|---|---|
| Tiêu đề | `Tiêu đề` | → `job_title` |
| Mô tả | `Mô tả công việc` | summary ở list |
| Địa điểm | `Khu vực` (link → Location `Name`) | → `location` |
| Slug | `Slug` | `job_slug = ${Slug}-${recordId}` |
| Hạn nộp | `Hạn chót nhận` | gated bởi `FEATURES.DEADLINE_FILTER` |
| Loại công việc | `Loại công việc` | vào `tags` (detail) / filter `job_types` |
| Ngành nghề | `Danh mục công việc` | vào `tags` / filter `job_categories` |
| Nhóm sản phẩm | `Nhóm sản phẩm` | vào `tags` / filter `product_groups` |
| Trạng thái | `Status` | chỉ lấy `"Approved"` (`lib/filter.ts:51`) |

> **Quyết định:** **v1 KHÔNG tách** `work_type` — `tags` join thành chuỗi để hiển thị; demand theo loại công việc đã đo được qua `job_filter_apply`. **Long-term** mới tách thành **scalar** ở backend (xem §10). Khi tách: chuẩn hoá enum ở `service.ts` (một nguồn sự thật), lấy giá trị **primary** (phần tử đầu) cho mỗi dimension, frontend chỉ nhận & bắn.

### 7.7. Checklist trước khi implement (đã cập nhật theo source)

- [x] ~~Umami đã nhúng chưa~~ → **Đã có** (`layout.tsx:100`).
- [x] ~~SEO canonical localhost~~ → **Đã xử lý** (`metadataBase`).
- [x] ~~Service/partner clickable?~~ → Service = accordion (track `service_expand`); **Partner KHÔNG clickable → bỏ**.
- [x] ~~Case study clickable?~~ → **Không** → bỏ `case_study_click`, chỉ giữ impression.
- [ ] Tạo **client wrapper** cho trang detail (server component) để fire `job_view` / `job_detail_scroll` / `apply_click`.
- [ ] Viết `extractJobId(slug)` dùng chung; verify khớp `service.ts`.
- [x] ~~Chốt tách `work_type`~~ → **v1 không tách**, để long-term (§7.6, §10).
- [ ] `tags` bắn dạng **chuỗi join**, không bắn array (§2.3).
- [ ] Khi QA local: nhớ `data-domains="lamphuong.com.vn"` ⇒ event chỉ ghi trên domain prod (tạm bỏ attribute hoặc test trên prod/staging domain).
- [ ] (Tuỳ chọn) Thêm `data-testid` ổn định cho mỗi điểm track để QA.

### 7.8. Ví dụ payload hoàn chỉnh

`apply_click` từ trang detail:

```json
{
  "page_type": "job_detail",
  "job_id": "recHLYpLG9O0OlSXi",
  "job_title": "Roblox - Channel Owner",
  "job_slug": "roblox-channel-owner-recHLYpLG9O0OlSXi",
  "location": "Hồ Chí Minh",
  "tags": "Freelancer,Social Content,ROBLOX",
  "source": "detail",
  "destination_url": "https://airtable.com/applRt3FQ5QTJY6sn/pag3suI5n5zwMkT6o/form",
  "max_scroll_percent": 75
}
```

> `url`, `title`, `referrer`... KHÔNG nằm trong payload — Umami tự thêm.

---

## 8. Tổng hợp danh sách event (Quick reference)

| Event | Trang | Loại | Trạng thái |
|---|---|---|---|
| `service_view` | home | Impression | ✅ |
| `service_expand` | home | Engagement | ⚠️ (was service_click) |
| `case_study_view` | home | Impression | ⚠️ |
| `cta_click` | home | Conversion (micro) | ✅ |
| `contact_email_click` | tất cả (footer) | Conversion (micro) | ✅ |
| `job_alert_subscribe_submit` | jobs_list | Engagement | ⚠️ |
| `job_alert_subscribe_success` | jobs_list | Conversion (micro) | ➕ |
| `job_alert_subscribe_error` | jobs_list | Engagement | ➕ |
| `job_card_view` | jobs_list | Impression | ✅ |
| `job_view` | jobs_list, job_detail | Funnel | ✅ |
| `apply_click` | jobs_list, job_detail | **Conversion (chính)** | ✅ |
| `jobs_load_more` | jobs_list | Engagement | ✅ |
| `job_filter_apply` | jobs_list | Engagement | ➕ |
| `jobs_empty_view` | jobs_list | Diagnostics | ➕ |
| `job_detail_scroll` | job_detail | Engagement | ✅ |
| ~~`case_study_click`~~ | ~~home~~ | — | ❌ BỎ (không clickable) |
| ~~`partner_logo_click`~~ | ~~home~~ | — | ❌ BỎ (không clickable) |

> `page_view` **không** track thủ công — Umami auto-track cho cả 3 trang.

---

## 9. Cơ hội mở rộng (ngoài phạm vi hiện tại — tuỳ chọn)

Phát hiện trong code, không bắt buộc nhưng có thể bổ sung sau:
- `nav_click` — menu header (`header/index.tsx`, `MENU_ITEMS`) + mở menu mobile (sidebar). Đo điều hướng nội bộ trên home.
- `banner_scroll_cta` — nút mũi tên cuộn xuống ở banner (`banner/index.tsx:81`).
- `filter_section_toggle` — mở/đóng accordion bộ lọc (`FilterBase.tsx` AccordionTrigger).

---

## 10. Long-term / Roadmap

> Phần này KHÔNG làm ở v1. Ghi lại để giữ schema "đúng hướng" ngay từ đầu, tránh phải đập đi làm lại khi tuyển dụng trở thành metric cốt lõi.

### 10.1. Đòn bẩy lớn nhất: đóng vòng attribution qua Airtable prefill 🎯

**Vấn đề hiện tại:** form Apply là **một URL Airtable dùng chung** (`.../pag3suI5n5zwMkT6o/form`) cho mọi job. Record đơn ứng tuyển trong Airtable **không mang** `job_id`/`source` ⇒ ta chỉ đo được tới `apply_click` (bấm nút rời site), **không biết ai thực sự nộp và từ job/nguồn nào**.

**Giải pháp:** prefill job context vào URL form. Airtable form hỗ trợ `?prefill_<Tên field>=<giá trị>` và ẩn field bằng `&hide_<Tên field>=true`. Ví dụ:

```
https://airtable.com/applRt3FQ5QTJY6sn/pag3suI5n5zwMkT6o/form
  ?prefill_JobId=recHLYpLG9O0OlSXi
  &prefill_Source=detail
  &hide_JobId=true&hide_Source=true
```

**Lợi ích:** có **full funnel thật** `job_view → apply_click → application_submitted` (đo bằng chính dữ liệu Airtable, không phụ thuộc Umami) ⇒ CR chính xác theo từng job & nguồn, không chỉ "click rời site".
**Cần làm:** thêm field `JobId`/`Source` vào bảng đơn ứng tuyển + form Airtable; build URL Apply động theo job (thay vì hardcode); verify tên field thật.
**Mức ưu tiên:** 🟥 Cao — giá trị hơn hẳn việc tăng độ chi tiết dimension.

### 10.2. Chuẩn hoá dimension thành scalar ở backend

Khi cần slice conversion theo `work_type` / `job_category` / `location`:
- Sửa `getJobDetail` (`service.ts`) trả **dimension riêng, chuẩn hoá enum** (viết thường, không dấu), lấy giá trị **primary** (phần tử đầu).
- `service.ts` = **single source of truth** cho mapping; áp dụng cho **cả list & detail** để không lệch dữ liệu.
- Bắn dạng **scalar** (`work_type: "freelancer"`) — Umami filter-by-property mới chạy được. KHÔNG bắn array.
- `tags` (chuỗi join) vẫn giữ cho hiển thị/debug.
**Mức ưu tiên:** 🟧 Trung bình — làm khi có report cụ thể cần xem.

### 10.3. Khi Umami hết đất → nâng cấp công cụ

Umami mạnh ở pageview/event đơn giản; **yếu ở**: multi-value dimension, join cross-event, cohort/retention, attribution xuyên session. Nếu tuyển dụng thành core business:
- **Product analytics** (vd PostHog) — funnel/cohort/multi-value tốt hơn hẳn; hoặc
- **Đẩy event + dữ liệu Airtable apply vào warehouse** (BigQuery…) để join tự do.
- Điều kiện để migrate dễ: **giữ event schema sạch, param scalar, tên ổn định** ngay từ v1 (plan này đã tuân thủ).
**Mức ưu tiên:** 🟩 Thấp — chỉ khi vượt trần Umami.

### 10.4. Bảng ưu tiên

| Việc | v1 | Long-term | Ưu tiên |
|---|---|---|---|
| `tags` → chuỗi join (không array) | ✅ | — | 🟥 (tránh nợ kỹ thuật) |
| Prefill `job_id`/`source` vào form Airtable | — | 🎯 | 🟥 Cao |
| Tách `work_type`/`category` thành scalar ở `service.ts` | — | ⏳ | 🟧 Trung bình |
| Giữ schema scalar + tên ổn định để migrate | ✅ | ✅ | 🟩 (nền tảng) |
| Nâng cấp PostHog / warehouse | — | ⏳ | 🟩 Thấp |

---

*Ghi chú nguồn: Bản này được tổng hợp từ **đọc trực tiếp source code** (các đường dẫn file:line trích trong bảng) đối chiếu với tracking plan đề xuất ban đầu. Mọi ASSUMPTION trong bản cũ đã được xác minh hoặc loại bỏ. Cần re-verify lại nếu UI/component đổi tên trong tương lai.*
