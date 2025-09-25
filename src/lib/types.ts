export interface Announcement {
  _id: string;
  titleList: [
    {
      ko: string;
      en: string;
    }
  ];
  contentList: [
    {
      ko: string;
      en: string;
    }
  ];
  publishedAt: string;
  imageList: {
    image64Path: string;
    image128Path: string;
    image256Path: string;
    image512Path: string;
    image1024Path: string;
    imageFilename: string;
    imageOriginalPath: string;
    name: string;
  }[];
  externalLink: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
