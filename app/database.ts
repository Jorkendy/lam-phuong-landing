import Airtable from "airtable";

// export const database = new Airtable({
//   apiKey: process.env.AIRTABLE_API_KEY,
// }).base(process.env.BASE_ID || "");

// Đổi thành này (lazy init)
let _database: ReturnType<typeof Airtable.prototype.base> | null = null;

export function getDatabase() {
  if (!_database) {
    _database = new Airtable({
      apiKey: process.env.AIRTABLE_API_KEY,
    }).base(process.env.BASE_ID || "");
  }
  return _database;
}