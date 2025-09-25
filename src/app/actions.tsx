"use client";

import { axiosApi } from "@/lib/axios";

// 이미지 업로드 관련 API 함수들

// 1단계: 멀티파트 업로드 ID 발급
export const getMultipartUploadId = async ({
  filename,
  fileType = "images",
  dataCollectionName = "announcements",
  jsonWebToken,
}: {
  filename: string;
  fileType?: string;
  dataCollectionName?: string;
  jsonWebToken: string | null;
}) => {
  try {
    const { data } = await axiosApi(
      "/uploads/multipart/upload-id",
      "post",
      {
        filename,
        fileType,
        dataCollectionName,
      },
      {
        headers: {
          Authorization: `jwt ${jsonWebToken}`,
        },
      }
    );
    return data?.data || null;
  } catch (error) {
    console.warn("getMultipartUploadId error", error);
    throw error;
  }
};

// 2단계: Pre-signed URL 발급
export const getPreSignedUrls = async ({
  uploadId,
  key,
  partCount = 1,
  jsonWebToken,
}: {
  uploadId: string;
  key: string;
  partCount?: number;
  jsonWebToken: string | null;
}) => {
  try {
    const { data } = await axiosApi(
      "/uploads/multipart/pre-signed-urls",
      "post",
      {
        uploadId,
        key,
        partCount,
      },
      {
        headers: {
          Authorization: `jwt ${jsonWebToken}`,
        },
      }
    );
    return data?.data || null;
  } catch (error) {
    console.warn("getPreSignedUrls error", error);
    throw error;
  }
};

// 3단계: 파일을 pre-signed URL에 업로드
export const uploadFileToS3 = async (
  presignedUrl: string,
  file: File
): Promise<string> => {
  try {
    const response = await axiosApi(
      presignedUrl,
      "put",
      file,
      {
        headers: {
          "Content-Type": file.type,
        },
      },
      "" // baseURL을 빈 문자열로 설정하여 완전한 URL 사용
    );

    // ETag 추출 (따옴표 제거)
    const etag =
      response.headers.etag?.replace(/"/g, "") ||
      response.headers.ETag?.replace(/"/g, "") ||
      "";
    return etag;
  } catch (error) {
    console.warn("uploadFileToS3 error", error);
    throw error;
  }
};

// 4단계: 멀티파트 업로드 완료 처리
export const completeMultipartUpload = async ({
  uploadId,
  key,
  partList,
  action = "complete",
  jsonWebToken,
}: {
  uploadId: string;
  key: string;
  partList: Array<{ partNumber: number; ETag: string }>;
  action?: "complete" | "abort";
  jsonWebToken: string | null;
}) => {
  try {
    const { data } = await axiosApi(
      "/uploads/multipart",
      "put",
      {
        uploadId,
        key,
        partList,
        action,
      },
      {
        headers: {
          Authorization: `jwt ${jsonWebToken}`,
        },
      }
    );
    return data?.data || null;
  } catch (error) {
    console.warn("completeMultipartUpload error", error);
    throw error;
  }
};

// 통합 이미지 업로드 함수
export const uploadImageFile = async ({
  file,
  jsonWebToken,
  onProgress,
}: {
  file: File;
  jsonWebToken: string | null;
  onProgress?: (progress: number) => void;
}): Promise<string> => {
  try {
    onProgress?.(10); // 시작

    // 1단계: 업로드 ID 발급
    const uploadData = await getMultipartUploadId({
      filename: file.name,
      fileType: "images",
      dataCollectionName: "announcements",
      jsonWebToken,
    });

    if (!uploadData?.uploadId || !uploadData?.key) {
      throw new Error("Failed to get upload ID");
    }

    onProgress?.(30); // 업로드 ID 발급 완료

    // 2단계: Pre-signed URL 발급
    const urlData = await getPreSignedUrls({
      uploadId: uploadData.uploadId,
      key: uploadData.key,
      partCount: 1,
      jsonWebToken,
    });

    if (!urlData?.urlList?.[0]?.url) {
      throw new Error("Failed to get pre-signed URL");
    }

    onProgress?.(50); // Pre-signed URL 발급 완료

    // 3단계: S3에 파일 업로드
    const etag = await uploadFileToS3(urlData.urlList[0].url, file);

    onProgress?.(80); // 파일 업로드 완료

    // 4단계: 멀티파트 업로드 완료 처리
    await completeMultipartUpload({
      uploadId: uploadData.uploadId,
      key: uploadData.key,
      partList: [{ partNumber: 1, ETag: etag }],
      action: "complete",
      jsonWebToken,
    });

    onProgress?.(100); // 완료

    // 업로드된 파일의 key 반환 (경로)
    return uploadData.key;
  } catch (error) {
    console.error("uploadImageFile error", error);
    throw error;
  }
};
