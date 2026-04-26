import Airtable from "airtable";

export const database = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY,
}).base(process.env.BASE_ID || "");
