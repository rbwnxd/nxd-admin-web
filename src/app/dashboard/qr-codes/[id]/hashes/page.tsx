"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useQRCodeStore } from "@/store/qrCodeStore";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ArrowLeft, Hash, RefreshCw } from "lucide-react";
import { getQRCodeHashes } from "../../actions";
import { toast } from "sonner";
import moment from "moment";

/**
 *
 * 해시 코드 목록, QR코드 아이디 뽑는기능 추가,
 */

export default function QRCodeHashesPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const jsonWebToken = useAuthStore((state) => state.token);

  const {
    qrHashes,
    totalHashCount,
    hashLoading,
    currentHashPage,
    hashItemsPerPage,
    setQRHashes,
    setTotalHashCount,
    setHashLoading,
    setCurrentHashPage,
    findQRCodeById,
  } = useQRCodeStore();

  const qrCode = findQRCodeById(params.id);

  useEffect(() => {
    if (!jsonWebToken || !params.id) return;

    const fetchHashes = async () => {
      setHashLoading(true);
      try {
        const result = await getQRCodeHashes({
          qrCodeId: params.id,
          params: {
            __skip: (currentHashPage - 1) * hashItemsPerPage,
            __limit: hashItemsPerPage,
          },
          jsonWebToken,
        });

        if (result) {
          setQRHashes(result.qrCodeHashes || []);
          setTotalHashCount(result.count || 0);
        }
      } catch (error) {
        console.error("QR hash fetch error:", error);
        toast.error("해시 목록을 가져올 수 없습니다.");
      } finally {
        setHashLoading(false);
      }
    };

    fetchHashes();
  }, [
    jsonWebToken,
    params.id,
    currentHashPage,
    hashItemsPerPage,
    setQRHashes,
    setTotalHashCount,
    setHashLoading,
  ]);

  const handlePageChange = (page: number) => {
    setCurrentHashPage(page);
  };

  const totalPages = Math.ceil(totalHashCount / hashItemsPerPage);

  if (!qrCode) {
    return (
      <div className="container mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Hash className="h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium text-muted-foreground">
              QR 코드를 찾을 수 없습니다
            </p>
            <Button onClick={() => router.back()}>돌아가기</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      {/* 상단 네비게이션 */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          돌아가기
        </Button>
      </div>

      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <Hash className="w-8 h-8" />
        <div>
          <h1 className="text-3xl font-bold">해시 관리</h1>
          <p className="text-muted-foreground">
            {qrCode.displayMainTitleList[0]?.ko || "제목 없음"}의 해시 목록
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{`해시 목록 (${totalHashCount})`}</CardTitle>
        </CardHeader>
        <CardContent>
          {hashLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-muted-foreground">로딩 중...</div>
            </div>
          ) : qrHashes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <Hash className="w-12 h-12 mb-2 opacity-50" />
              <p>등록된 해시가 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {qrHashes.map((hash) => (
                <div
                  key={hash._id}
                  className="border rounded-lg p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">해시 ID: {hash._id}</Badge>
                        {hash.expiresAt && (
                          <Badge
                            variant={
                              new Date(hash.expiresAt) > new Date()
                                ? "default"
                                : "destructive"
                            }
                          >
                            {new Date(hash.expiresAt) > new Date()
                              ? "유효"
                              : "만료"}
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-1 text-sm">
                        <div>
                          <span className="font-medium">토큰:</span>
                          <code className="ml-2 px-2 py-1 bg-muted rounded text-xs">
                            {hash.token}
                          </code>
                        </div>

                        {hash.expiresAt && (
                          <div>
                            <span className="font-medium">만료일:</span>
                            <span className="ml-2">
                              {moment(hash.expiresAt).format(
                                "YYYY-MM-DD HH:mm:ss"
                              )}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-4 text-muted-foreground">
                          <span>
                            생성일:{" "}
                            {moment(hash.createdAt).format("YYYY-MM-DD HH:mm")}
                          </span>
                          <span>
                            수정일:{" "}
                            {moment(hash.updatedAt).format("YYYY-MM-DD HH:mm")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationPrevious
                    onClick={() =>
                      currentHashPage > 1 &&
                      handlePageChange(currentHashPage - 1)
                    }
                    className={
                      currentHashPage <= 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => handlePageChange(page)}
                          isActive={currentHashPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}

                  <PaginationNext
                    onClick={() =>
                      currentHashPage < totalPages &&
                      handlePageChange(currentHashPage + 1)
                    }
                    className={
                      currentHashPage >= totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
