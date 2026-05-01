/**
 * Feature Flags
 * Bật/tắt tính năng bằng cách đổi giá trị true/false
 */
export const FEATURES = {
  /**
   * Lọc và hiển thị hạn chót nhận hồ sơ trên job listing.
   * - true: ẩn job đã hết hạn + hiện "Hạn nộp: ..." trên mỗi job card
   * - false: hiện tất cả job không phân biệt hạn + ẩn UI hạn nộp
   */
  DEADLINE_FILTER: false,

  /**
   * Form đăng ký nhận thông báo job mới.
   * - true: hiện form subscribe trong sidebar job listing
   * - false: ẩn form (chưa chốt phương án gửi email)
   */
  SUBSCRIBE: true,
} as const;
