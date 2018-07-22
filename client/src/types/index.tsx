export interface User {
   _id: string;
   username: string;
}

export interface UserState {
  auth_token: string;
  user: null | User;
}

export interface UserStateStore {
  user: null | UserState;
}

export interface GuideDataItemComment {
  type: "comment";
  text: string;
  spoiler: null | string;
}

export interface GuideDataItemImage {
  image: string;
  spoiler: null | string;
}

export interface GuideDataItemImages {
  type: "images";
  rows: null | number;
  align: null | "left" | "right" | "center";
  images: GuideDataItemImage[];
  spoiler?: string;
}

export interface GuideDataItemHeader {
  type: "header";
  text: string;
}

export type GuideDataItemGroupItem = (GuideDataItemHeader | GuideDataItemImages | GuideDataItemComment);

export interface GuideDataItemGroup {
  type: "group";
  spoiler: null | string;
  items: GuideDataItemGroupItem[];
}

export type GuideDataItem = (GuideDataItemHeader | GuideDataItemImages | GuideDataItemComment | GuideDataItemGroup);

export interface GuideDataAuthor {
  _id: string;
  username: string;
}

export interface GuideDataEdit {
  title: string;
  spoiler: null | string;
  class: string;
  items: GuideDataItem[];
}

export interface GuideData {
  _id: string;
  created: Date;
  modified: Date;
  version: number;
  title: string;
  spoiler: null | string;
  class: string;
  author: GuideDataAuthor;
  items: GuideDataItem[];
}
