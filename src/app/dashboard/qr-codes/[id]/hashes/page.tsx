"use client";

import { useRouter, useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
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
} from "@/components/ui/pagination";
import {
  ArrowLeft,
  Hash,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
  Plus,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { createAdditionalIssueQRCode, getQRCodeHashes } from "../../actions";
import { toast } from "sonner";
import moment from "moment";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 *
 * 해시 코드 목록, QR코드 아이디 뽑는기능 추가,
 */

export default function QRCodeHashesPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const jsonWebToken = useAuthStore((state) => state.token);

  const [actionLoading, setActionLoading] = useState(false);
  const [additionalIssueCount, setAdditionalIssueCount] = useState(1);
  const [additionalIssueDialogOpen, setAdditionalIssueDialogOpen] =
    useState(false);

  const {
    qrHashes,
    totalHashCount,
    hashLoading,
    currentHashPage,
    hashItemsPerPage,
    hashIncludeDeleted,
    setQRHashes,
    setTotalHashCount,
    setHashLoading,
    setCurrentHashPage,
    setHashIncludeDeleted,
    findQRCodeById,
  } = useQRCodeStore();

  const qrCode = findQRCodeById(params.id);

  const fetchHashes = useCallback(async () => {
    if (!jsonWebToken || !params.id) return;

    setHashLoading(true);
    try {
      const result = await getQRCodeHashes({
        qrCodeId: params.id,
        params: {
          __skip: (currentHashPage - 1) * hashItemsPerPage,
          __limit: hashItemsPerPage,
          __includeDeleted: hashIncludeDeleted,
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
  }, [
    currentHashPage,
    hashItemsPerPage,
    hashIncludeDeleted,
    jsonWebToken,
    params.id,
    setQRHashes,
    setTotalHashCount,
    setHashLoading,
  ]);

  useEffect(() => {
    fetchHashes();
  }, [
    jsonWebToken,
    params.id,
    currentHashPage,
    hashItemsPerPage,
    hashIncludeDeleted,
    fetchHashes,
  ]);

  const handlePageChange = (page: number) => {
    setCurrentHashPage(page);
  };

  const totalPages = Math.ceil(totalHashCount / hashItemsPerPage);

  const isExpired = !moment().isBefore(moment(qrCode?.expiresAt));

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

  // 추가 발행 처리
  const handleAdditionalIssue = async () => {
    if (additionalIssueCount < 1) {
      toast.error("추가 발행 수는 최소 1 이상이어야 합니다.");
      return;
    }

    setActionLoading(true);
    try {
      await createAdditionalIssueQRCode({
        qrCodeId: params.id,
        body: {
          hashCount: additionalIssueCount,
        },
        jsonWebToken: jsonWebToken!,
      });

      toast.success(`${additionalIssueCount}개의 해시가 추가 발행되었습니다.`);
      setAdditionalIssueDialogOpen(false);
      setAdditionalIssueCount(1);

      if (currentHashPage !== 1) {
        setCurrentHashPage(1);
      } else {
        fetchHashes();
      }
    } catch (error: unknown) {
      console.error("해시 추가 발행 오류:", error);

      const status =
        typeof error === "object" && error !== null
          ? // AxiosError 형태: { response: { status } }
            // 또는 직접 status가 있는 경우
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (error as any).response?.status ?? (error as any).status
          : undefined;

      if (status === 422) {
        toast.error("추가 발행 실패. 만료된 qrCode입니다");
      } else {
        toast.error("해시 추가 발행에 실패했습니다.");
      }
    } finally {
      setActionLoading(false);
    }
  };

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
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 gap-4 lg:gap-0">
        <div className="flex items-center gap-3">
          <Hash className="w-8 h-8" />
          <div>
            <h1 className="text-3xl font-bold">해시 관리</h1>
            <p className="text-muted-foreground">
              {qrCode.displayMainTitleList[0]?.ko || "제목 없음"}의 해시 목록
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end lg:self-auto">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className={isExpired ? "cursor-not-allowed" : undefined}>
                <Button
                  onClick={() => setAdditionalIssueDialogOpen(true)}
                  className="flex items-center gap-2"
                  disabled={isExpired}
                >
                  <Plus className="w-4 h-4" />
                  추가 해시 발행
                </Button>
              </span>
            </TooltipTrigger>
            {isExpired && (
              <TooltipContent>
                만료된 qrCode에는 추가 발행을 할 수 없습니다
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{`해시 목록 (${totalHashCount})`}</CardTitle>
          <div className="flex flex-col lg:flex-row w-full items-end justify-end mt-2 gap-4">
            <div className="space-y-2">
              <div key={"includeDeleted"} className="flex items-center gap-2">
                <Label
                  htmlFor={"includeDeleted"}
                  className="text-sm font-normal"
                >
                  {"삭제 해시 포함"}
                </Label>
                <Switch
                  id={"includeDeleted"}
                  checked={hashIncludeDeleted}
                  onCheckedChange={(checked: boolean) =>
                    setHashIncludeDeleted(checked)
                  }
                  disabled={hashLoading}
                />
              </div>
            </div>
          </div>
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
                  <PaginationItem>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handlePageChange(1)}
                      disabled={currentHashPage <= 1}
                      className="h-9 w-9"
                      title="첫 페이지"
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                  </PaginationItem>
                  <PaginationItem>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handlePageChange(currentHashPage - 1)}
                      disabled={currentHashPage <= 1}
                      className="h-9 w-9"
                      title="이전 페이지"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </PaginationItem>

                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const pageNumber =
                      Math.max(
                        1,
                        Math.min(totalPages - 4, currentHashPage - 2)
                      ) + i;
                    if (pageNumber > totalPages) return null;

                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          onClick={() => handlePageChange(pageNumber)}
                          isActive={currentHashPage === pageNumber}
                          className="cursor-pointer"
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  <PaginationItem>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handlePageChange(currentHashPage + 1)}
                      disabled={currentHashPage >= totalPages}
                      className="h-9 w-9"
                      title="다음 페이지"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </PaginationItem>
                  <PaginationItem>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handlePageChange(totalPages)}
                      disabled={currentHashPage >= totalPages}
                      className="h-9 w-9"
                      title="마지막 페이지"
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 활동정지 다이얼로그 */}
      <Dialog
        open={additionalIssueDialogOpen}
        onOpenChange={setAdditionalIssueDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 " />
              추가 발행
            </DialogTitle>
            <DialogDescription className="whitespace-pre-line">
              {`${qrCode?.displayMainTitleList[0]?.ko}의 해시를 추가 발행합니다.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">추가 발행 수량</Label>
              <Input
                type="number"
                min="1"
                value={additionalIssueCount || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setAdditionalIssueCount(val === "" ? 0 : Number(val) || 0);
                }}
                onBlur={(e) => {
                  const numVal = Number(e.target.value);
                  if (isNaN(numVal) || numVal < 1) {
                    setAdditionalIssueCount(1);
                  }
                }}
                className="mt-1"
                placeholder="10"
              />
              <p className="text-xs text-muted-foreground mt-1">
                1개 이상 발행 가능합니다
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAdditionalIssueDialogOpen(false);
                setAdditionalIssueCount(1);
              }}
              disabled={actionLoading}
            >
              취소
            </Button>
            <Button
              onClick={handleAdditionalIssue}
              disabled={actionLoading || additionalIssueCount < 1}
              variant="default"
              className="cursor-pointer"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  발행중...
                </>
              ) : (
                `${additionalIssueCount}개 발행`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
