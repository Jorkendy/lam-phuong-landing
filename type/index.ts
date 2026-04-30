import { RefObject } from "react";
import { FieldSet, Records } from "airtable";

export interface ScrollRefProps {
  refs: {
    aboutRef: RefObject<HTMLDivElement | null>;
    servicesRef: RefObject<HTMLDivElement | null>;
    careersRef: RefObject<HTMLDivElement | null>;
    partnersRef: RefObject<HTMLDivElement | null>;
    studiesRef: RefObject<HTMLDivElement | null>;
  };
}

export interface CareerListItem {
  title: string;
  summary: string;
  slug: string;
  location: string;
  deadline?: string;
}

export interface JobFields extends FieldSet {
  "Tiêu đề": string;
  "Mô tả công việc": string;
  "Khu vực": string[];
  Slug: string;
  "Hạn chót nhận"?: string;
}

export interface LocationFields extends FieldSet {
  Name: string;
}

export interface FilterFields extends FieldSet {
  Name: string;
}

export type GetRecordsResponse<T extends FieldSet> = {
  records: Records<T>;
  offset: string;
};
