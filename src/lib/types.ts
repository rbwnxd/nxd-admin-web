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

export interface Artist {
  _id: string;
  nameList: [
    {
      ko: string;
      en: string;
    }
  ];
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
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// === 차트 관련 타입들 ===

export interface ChartItem {
  _id: string;
  nameList: Array<{ ko: string; en: string }>;
  descriptionList: Array<{ ko: string; en: string }>;
  type: "DAILY_ACCUMULATED" | "ALL_TIME_ACCUMULATED" | "SEASON";
  season?: {
    startedAt: string;
    endedAt: string;
  } | null;
  isActivated: boolean;
  summaryUpdatedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

// 관리자용 차트 랭킹 아이템 타입 (새 API 스펙 기준)
export interface AdminChartRankingItem {
  user: {
    _id: string;
    nickname: string;
    imageList: Array<{
      name: string;
      imageOriginalPath: string;
      image64Path: string;
      image128Path: string;
      image256Path: string;
      image512Path: string;
      image1024Path: string;
      imageFilename: string;
    }>;
    currentPoint: number;
  };
  previousPoint: number | null;
  totalPoint: number;
  previousRanking: number | null;
  ranking: number;
  changedRanking: number | null;
  index: number;
}

// 시즌 차트 생성 폼 타입
export interface SeasonChartForm {
  nameKo: string;
  nameEn: string;
  descriptionKo: string;
  descriptionEn: string;
  startedAt: string;
  endedAt: string;
}
