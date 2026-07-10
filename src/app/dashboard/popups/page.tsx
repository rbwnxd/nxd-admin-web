"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import moment from "moment";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Edit,
  ImageIcon,
  Loader2,
  MoreHorizontal,
  Plus,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import { Switch } from "@/components/ui/switch";
import { ConfirmDialog } from "@/components/dialog";
import { STORAGE_URL } from "@/lib/api";
import { Popup } from "@/lib/types";
import { useAuthStore } from "@/store/authStore";
import { usePopupStore } from "@/store/popupStore";
import { deletePopup, getPopups } from "./actions";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 10;

const getPopupStatus = (popup: Popup) => {
  if (popup.deletedAt) {
    return { label: "삭제됨", variant: "destructive" as const };
  }
  if (!popup.isPublished) {
    return { label: "비공개", variant: "secondary" as const };
  }
  if (moment().isBefore(moment(popup.displayStartedAt))) {
    return { label: "노출 예정", variant: "secondary" as const };
  }
  if (moment().isAfter(moment(popup.displayEndedAt))) {
    return { label: "노출 종료", variant: "outline" as const };
  }
  return { label: "노출 중", variant: "default" as const };
};

const ExternalLinkText = ({ href }: { href: string | null }) => (
  <p className="text-sm text-muted-foreground line-clamp-1">
    <span>외부링크: </span>
    {href ? (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="text-primary hover:underline"
        onClick={(e) => e.stopPropagation()}
      >
        {href}
      </a>
    ) : (
      <span>-</span>
    )}
  </p>
);

export default function PopupsPage() {
  const router = useRouter();
  const jsonWebToken = useAuthStore((state) => state.token);
  const {
    popups,
    currentPage,
    totalCount,
    includeDeleted,
    includeUnpublished,
    setPopups,
    setCurrentPage,
    setTotalCount,
    setIncludeDeleted,
    setIncludeUnpublished,
  } = usePopupStore();

  const [isFetching, setIsFetching] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedPopupId, setSelectedPopupId] = useState("");

  useEffect(() => {
    if (!jsonWebToken) return;

    const fetchPopups = async () => {
      try {
        setIsFetching(true);
        const result = await getPopups({
          params: {
            __skip: (currentPage - 1) * ITEMS_PER_PAGE,
            __limit: ITEMS_PER_PAGE,
            __includeDeleted: includeDeleted,
            __includeUnpublished: includeUnpublished,
          },
          jsonWebToken,
        });

        if (result) {
          setPopups(result.popups || []);
          setTotalCount(result.count || 0);
        }
      } catch (error) {
        console.error("Fetch popups error:", error);
        toast.error("팝업 목록을 불러오는데 실패했습니다.");
      } finally {
        setIsFetching(false);
      }
    };

    fetchPopups();
  }, [
    currentPage,
    includeDeleted,
    includeUnpublished,
    jsonWebToken,
    setPopups,
    setTotalCount,
  ]);

  const handleDelete = (id: string) => {
    setSelectedPopupId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      const result = await deletePopup({
        id: selectedPopupId,
        jsonWebToken,
      });

      if (result) {
        setPopups(
          popups.map((popup) =>
            popup._id === selectedPopupId
              ? { ...popup, deletedAt: new Date().toISOString() }
              : popup,
          ),
        );
        toast.success("팝업이 삭제되었습니다.");
      } else {
        toast.error("팝업 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("Delete popup error:", error);
      toast.error("팝업 삭제 중 오류가 발생했습니다.");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setSelectedPopupId("");
    }
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 gap-4 lg:gap-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">팝업 관리</h2>
          <p className="text-muted-foreground">
            앱에 노출할 팝업을 관리할 수 있습니다.
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/popups/create")}>
          <Plus className="mr-2 h-4 w-4" />새 팝업 추가
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{`팝업 목록 (${totalCount})`}</CardTitle>
          <div className="flex flex-col lg:flex-row w-full items-end justify-end mt-2 gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="includeDeleted" className="text-sm font-normal">
                삭제 팝업 포함
              </Label>
              <Switch
                id="includeDeleted"
                checked={includeDeleted}
                onCheckedChange={setIncludeDeleted}
                disabled={isFetching || isDeleting}
              />
            </div>
            <div className="flex items-center gap-2">
              <Label
                htmlFor="includeUnpublished"
                className="text-sm font-normal"
              >
                비공개 팝업 포함
              </Label>
              <Switch
                id="includeUnpublished"
                checked={includeUnpublished}
                onCheckedChange={setIncludeUnpublished}
                disabled={isFetching || isDeleting}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isFetching ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : popups.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <ImageIcon className="h-12 w-12 text-muted-foreground" />
                <p className="text-lg font-medium text-muted-foreground">
                  등록된 팝업이 없습니다
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {popups.map((popup) => {
                const status = getPopupStatus(popup);
                return (
                  <div
                    key={popup._id}
                    className="flex items-center justify-between gap-4 p-4 border rounded-lg cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => router.push(`/dashboard/popups/${popup._id}`)}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {popup.image?.image256Path ? (
                        <Image
                          src={`${STORAGE_URL}/${popup.image.image256Path}`}
                          alt={popup.eventName}
                          width={72}
                          height={72}
                          className="w-16 h-16 rounded-sm object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-muted rounded-sm flex items-center justify-center">
                          <ImageIcon className="h-7 w-7 text-muted-foreground" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">
                            {popup.eventName}
                          </h3>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          노출 순서: {popup.displayOrder ?? "-"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          노출 기간:{" "}
                          {moment(popup.displayStartedAt).format(
                            "YYYY-MM-DD HH:mm",
                          )}{" "}
                          ~{" "}
                          {moment(popup.displayEndedAt).format(
                            "YYYY-MM-DD HH:mm",
                          )}
                        </p>
                        <ExternalLinkText href={popup.externalLink} />
                      </div>
                    </div>

                    {!popup.deletedAt && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              router.push(
                                `/dashboard/popups/create?isUpdate=true&id=${popup._id}`,
                              );
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            수정
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDelete(popup._id);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            삭제
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage <= 1}
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
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="h-9 w-9"
                  title="이전 페이지"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </PaginationItem>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pageNumber =
                  Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                if (pageNumber > totalPages) return null;
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      onClick={() => setCurrentPage(pageNumber)}
                      isActive={currentPage === pageNumber}
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
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
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
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage >= totalPages}
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

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="팝업 삭제"
        description="정말로 이 팝업을 삭제하시겠습니까?"
        confirmText="삭제"
        cancelText="취소"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsDeleteDialogOpen(false);
          setSelectedPopupId("");
        }}
        isLoading={isDeleting}
        variant="destructive"
      />
    </div>
  );
}
