export const IS_DEV = process.env.NODE_ENV === "development" ? true : false;

export const STORAGE_URL = `https://storage.nxd-c.com`;
// export const STORAGE_URL = IS_DEV
//   ? `https://nxd-storage-test.s3.ap-northeast-2.amazonaws.com`
//   : `https://storage.nxd-c.com`;

// export const STORAGE_URL = IS_DEV
// ? `https://plam-storage-dev.s3.ap-northeast-2.amazonaws.com`
// : `https://storage.plam.kr`

// npm start = 개발 서버
// build => 릴리즈 서버
export const API_URL = IS_DEV
  ? `https://api-test.nxd-c.com`
  : `https://api.nxd-c.com`;
