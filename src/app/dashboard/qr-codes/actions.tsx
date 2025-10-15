"use client";

import { axiosApi } from "@/lib/axios";

// QR 코드 목록 조회
export const getQRCodes = async ({
  params,
  jsonWebToken,
}: {
  params: {
    __skip?: number;
    __limit?: number;
    category?: "ALBUM" | "CONCERT" | "OFFLINE_SPOT" | "GOODS";
  };
  jsonWebToken: string;
}) => {
  try {
    const { data } = await axiosApi("/admin/qr-codes", "get", undefined, {
      params,
      headers: {
        Authorization: `jwt ${jsonWebToken}`,
      },
    });
    return (data && data["data"]) || null;
  } catch (error) {
    console.warn("QRCode getQRCodes error", error);
    throw error;
  }
};

// QR 코드 생성
export const createQRCode = async ({
  body,
  jsonWebToken,
}: {
  body: {
    category: "ALBUM" | "CONCERT" | "OFFLINE_SPOT" | "GOODS";
    point?: number;
    displayMainTitleList?: { [key: string]: string }[];
    displaySubTitleList?: { [key: string]: string }[];
    displayTextList?: { [key: string]: string }[];
    imageList?: { name: string; imageOriginalPath: string }[];
    expireMinutes?: number;
    issuedCount?: number;
    hashCount?: number;
    isHashReusable?: boolean;
    isEnabled?: boolean;
  };
  jsonWebToken: string;
}) => {
  try {
    const { data } = await axiosApi("/admin/qr-codes", "post", body, {
      headers: {
        Authorization: `jwt ${jsonWebToken}`,
      },
    });
    return (data && data["data"] && data["data"]["qrCode"]) || null;
  } catch (error) {
    console.warn("QRCode createQRCode error", error);
    throw error;
  }
};

// QR 코드 수정 함수
export const updateQRCode = async ({
  id,
  body,
  jsonWebToken,
}: {
  id: string;
  body: {
    category?: "ALBUM" | "CONCERT" | "OFFLINE_SPOT" | "GOODS";
    point?: number;
    displayMainTitleList?: { [key: string]: string }[];
    displaySubTitleList?: { [key: string]: string }[];
    displayTextList?: { [key: string]: string }[];
    imageList?: { name: string; imageOriginalPath: string }[];
    issuedCount?: number;
    isEnabled?: boolean;
  };
  jsonWebToken: string;
}) => {
  try {
    const { data } = await axiosApi(`/admin/qr-codes/${id}`, "patch", body, {
      headers: {
        Authorization: `jwt ${jsonWebToken}`,
      },
    });
    return (data && data["data"] && data["data"]["qrCode"]) || null;
  } catch (error) {
    console.warn("QRCode updateQRCode error", error);
    throw error;
  }
};

// QR 코드 단일 상세 조회
export const getQRCodeDetail = async ({
  qrCodeId,
  jsonWebToken,
}: {
  qrCodeId: string;
  jsonWebToken: string;
}) => {
  try {
    const { data } = await axiosApi(
      `/admin/qr-codes/${qrCodeId}`,
      "get",
      undefined,
      {
        headers: {
          Authorization: `jwt ${jsonWebToken}`,
        },
      }
    );
    return (data && data["data"]) || null;
  } catch (error) {
    console.warn("QRCode getQRCodeDetail error", error);
    throw error;
  }
};

// QR 코드 해시 목록 조회
export const getQRCodeHashes = async ({
  qrCodeId,
  params,
  jsonWebToken,
}: {
  qrCodeId: string;
  params: {
    __skip?: number;
    __limit?: number;
  };
  jsonWebToken: string;
}) => {
  try {
    const { data } = await axiosApi(
      `/admin/qr-codes/${qrCodeId}/hashes`,
      "get",
      undefined,
      {
        params,
        headers: {
          Authorization: `jwt ${jsonWebToken}`,
        },
      }
    );
    return (data && data["data"]) || null;
  } catch (error) {
    console.warn("QRCode getQRCodeHashes error", error);
    throw error;
  }
};

// 체크인 목록 조회 (앱 관리자용)
export const getQRCodeCheckIns = async ({
  params,
  jsonWebToken,
}: {
  params: {
    __skip?: number;
    __limit?: number;
  };
  jsonWebToken: string;
}) => {
  try {
    const { data } = await axiosApi(
      "/admin/qr-codes/check-in",
      "get",
      undefined,
      {
        params,
        headers: {
          Authorization: `jwt ${jsonWebToken}`,
        },
      }
    );
    return (data && data["data"]) || null;
  } catch (error) {
    console.warn("QRCode getQRCodeCheckIns error", error);
    throw error;
  }
};

// 체크인 생성
export const createQRCodeCheckIn = async ({
  body,
  jsonWebToken,
}: {
  body: {
    category: "ALBUM" | "CONCERT" | "OFFLINE_SPOT" | "GOODS";
    title: string;
    startAt: string;
    endAt: string;
    adminIds: string[];
    memo?: string;
  };
  jsonWebToken: string;
}) => {
  try {
    const { data } = await axiosApi("/admin/qr-codes/check-in", "post", body, {
      headers: {
        Authorization: `jwt ${jsonWebToken}`,
      },
    });
    return (data && data["data"] && data["data"]["qrCodeCheckIn"]) || null;
  } catch (error) {
    console.warn("QRCode createQRCodeCheckIn error", error);
    throw error;
  }
};

// 체크인 수정
export const updateQRCodeCheckIn = async ({
  checkInId,
  body,
  jsonWebToken,
}: {
  checkInId: string;
  body: {
    category: "ALBUM" | "CONCERT" | "OFFLINE_SPOT" | "GOODS";
    title: string;
    startAt: string;
    endAt: string;
    adminIds: string[];
    memo?: string;
  };
  jsonWebToken: string;
}) => {
  try {
    const { data } = await axiosApi(
      `/admin/qr-codes/check-in/${checkInId}`,
      "put",
      body,
      {
        headers: {
          Authorization: `jwt ${jsonWebToken}`,
        },
      }
    );
    return (data && data["data"] && data["data"]["qrCodeCheckIn"]) || null;
  } catch (error) {
    console.warn("QRCode updateQRCodeCheckIn error", error);
    throw error;
  }
};

// 체크인 삭제
export const deleteQRCodeCheckIn = async ({
  checkInId,
  jsonWebToken,
}: {
  checkInId: string;
  jsonWebToken: string;
}) => {
  try {
    const { data } = await axiosApi(
      `/admin/qr-codes/check-in/${checkInId}`,
      "delete",
      undefined,
      {
        headers: {
          Authorization: `jwt ${jsonWebToken}`,
        },
      }
    );
    return (data && data["data"]) || null;
  } catch (error) {
    console.warn("QRCode deleteQRCodeCheckIn error", error);
    throw error;
  }
};

// 어드민 유저 리스트 조회
export const getAdminUsers = async ({
  params,
  jsonWebToken,
}: {
  params?: {
    __skip?: number;
    __limit?: number;
    search?: string;
  };
  jsonWebToken: string;
}) => {
  try {
    const { data } = await axiosApi(
      "/admin/users",
      "get",
      undefined,
      {
        params,
        headers: {
          Authorization: `jwt ${jsonWebToken}`,
        },
      }
    );
    return (data && data["data"]) || null;
  } catch (error) {
    console.warn("getAdminUsers error", error);
    throw error;
  }
};

// QR 코드 체크인 검증
export const verifyQRCodeCheckIn = async ({
  qrCodeCheckInId,
  body,
  jsonWebToken,
}: {
  qrCodeCheckInId: string;
  body: {
    hashId: string;
    token: string;
  };
  jsonWebToken: string;
}) => {
  try {
    const { data } = await axiosApi(
      `/admin/qr-codes/check-in/${qrCodeCheckInId}/verify`,
      "post",
      body,
      {
        headers: {
          Authorization: `jwt ${jsonWebToken}`,
        },
      }
    );
    return (data && data["data"]) || null;
  } catch (error) {
    console.warn("QRCode verifyQRCodeCheckIn error", error);
    throw error;
  }
};

// 체크인 검증 목록 조회
export const getQRCodeVerifications = async ({
  qrCodeCheckInId,
  params,
  jsonWebToken,
}: {
  qrCodeCheckInId: string;
  params: {
    __skip?: number;
    __limit?: number;
  };
  jsonWebToken: string;
}) => {
  try {
    const { data } = await axiosApi(
      `/admin/qr-codes/check-in/${qrCodeCheckInId}/verifications`,
      "get",
      undefined,
      {
        params,
        headers: {
          Authorization: `jwt ${jsonWebToken}`,
        },
      }
    );
    return (data && data["data"]) || null;
  } catch (error) {
    console.warn("QRCode getQRCodeVerifications error", error);
    throw error;
  }
};

// 체크인 검증 기록 삭제
export const deleteQRCodeVerification = async ({
  qrCodeCheckInId,
  qrCodeVerificationId,
  jsonWebToken,
}: {
  qrCodeCheckInId: string;
  qrCodeVerificationId: string;
  jsonWebToken: string;
}) => {
  try {
    const { data } = await axiosApi(
      `/admin/qr-codes/check-in/${qrCodeCheckInId}/verifications/${qrCodeVerificationId}`,
      "delete",
      undefined,
      {
        headers: {
          Authorization: `jwt ${jsonWebToken}`,
        },
      }
    );
    return (data && data["data"]) || null;
  } catch (error) {
    console.warn("QRCode deleteQRCodeVerification error", error);
    throw error;
  }
};
