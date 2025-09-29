"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  MoreHorizontal,
  FileText,
  Edit,
  Trash2,
  Layers,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import moment from "moment";
import Image from "next/image";
import { STORAGE_URL } from "@/lib/api";
import { useEffect, useState } from "react";
import { getArtists, deleteArtist } from "./actions";
import { useAuthStore } from "@/store/authStore";
import { useArtistStore } from "@/store/artistStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function ArtistsPage() {
  const router = useRouter();

  const artists = useArtistStore((state) => state.artists);
  const setArtists = useArtistStore((state) => state.setArtists);
  const currentPage = useArtistStore((state) => state.currentPage);
  const setCurrentPage = useArtistStore((state) => state.setCurrentPage);
  const totalCount = useArtistStore((state) => state.totalCount);
  const setTotalCount = useArtistStore((state) => state.setTotalCount);

  const jsonWebToken = useAuthStore((state) => state.token);

  // 삭제 다이얼로그 상태
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedArtistId, setSelectedArtistId] = useState<string>("");

  // 데이터 패치 로딩 상태
  const [isFetching, setIsFetching] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    if (!jsonWebToken) return;

    const fetchArtist = async () => {
      try {
        setIsFetching(true);
        const skip = (currentPage - 1) * itemsPerPage;

        const result = await getArtists({
          params: {
            __skip: skip,
            __limit: itemsPerPage,
          },
          jsonWebToken,
        });

        if (result) {
          setArtists(result?.artists);

          setTotalCount(result?.count);
        }
      } catch (error) {
        console.error("Fetch artists error:", error);
        toast.error("아티스트를 불러오는데 실패했습니다.");
      } finally {
        setIsFetching(false);
      }
    };

    fetchArtist();
  }, [jsonWebToken, currentPage, itemsPerPage, setArtists, setTotalCount]);

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleMoveDetail = (id: string) => {
    console.log(`Move to artist detail with id: ${id}`);

    router.push(`/dashboard/artists/${id}`);
  };

  const handleEdit = (id: string) => {
    console.log(`Edit artist with id: ${id}`);

    router.push(`/dashboard/artists/create?isUpdate=true&id=${id}`);
  };

  const handleDelete = (id: string) => {
    setSelectedArtistId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      // 삭제 API 호출
      setIsLoading(true);
      const result = await deleteArtist({
        id: selectedArtistId,
        jsonWebToken,
      });

      if (result) {
        // 삭제 성공 시 해당 공지사항에 deletedAt 추가
        const updatedArtists = artists.map((artist) =>
          artist._id === selectedArtistId
            ? { ...artist, deletedAt: new Date().toISOString() }
            : artist
        );
        setArtists(updatedArtists);

        toast.success("아티스트가 성공적으로 삭제되었습니다.");
      } else {
        toast.error("아티스트 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("Delete artist error:", error);
      toast.error("아티스트 삭제 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
      setSelectedArtistId("");
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setSelectedArtistId("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">아티스트 관리</h2>
          <p className="text-muted-foreground">
            게시될 아티스트를 관리할 수 있습니다.
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/artists/create")}>
          <Plus className="mr-2 h-4 w-4" />새 아티스트 추가
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>아티스트 목록</CardTitle>
        </CardHeader>
        <CardContent>
          {isFetching ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            </div>
          ) : artists?.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <FileText className="h-12 w-12 text-muted-foreground" />
                <p className="text-lg font-medium text-muted-foreground">
                  등록된 아티스트가 없습니다
                </p>
                <p className="text-sm text-muted-foreground">
                  새 아티스트를 추가해보세요.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {artists?.map((artist) => {
                return (
                  <div
                    key={artist._id}
                    className="flex items-center justify-between p-4 border rounded-lg cursor-pointer"
                    onClick={() => handleMoveDetail(artist._id)}
                  >
                    <div className="flex items-center space-x-4 ">
                      {artist?.imageList?.length > 0 ? (
                        <div className="relative">
                          <Image
                            src={`${STORAGE_URL}/${artist?.imageList?.[0]?.image256Path}`}
                            alt="Artist"
                            width={48}
                            height={48}
                            className="w-12 h-auto rounded-sm"
                          />
                          {artist.imageList.length > 1 && (
                            <div className="absolute -top-0 -right-0 bg-black/45 text-primary-foreground rounded-sm p-1">
                              <Layers className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                          <FileText className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}

                      <div>
                        <h3 className="font-semibold">
                          {artist.nameList[0].ko}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5 mb-1">
                          {artist.nameList[0].en}
                        </p>
                        {!!artist.deletedAt && (
                          <p className="text-xs text-muted-foreground">
                            {`삭제일 : ${moment(artist?.deletedAt).format(
                              "YYYY-MM-DD h:mm"
                            )}`}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <DropdownMenu>
                        {!artist.deletedAt && (
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                        )}
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleEdit(artist._id);
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
                              handleDelete(artist._id);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            삭제
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 페이지네이션 */}
      {
        // <Pagination className="mt-6">
        //   <PaginationContent>
        //     <PaginationItem>
        //       <PaginationPrevious
        //         href="#"
        //         onClick={(e) => {
        //           e.preventDefault();
        //           if (currentPage > 1) handlePageChange(currentPage - 1);
        //         }}
        //         className={
        //           currentPage <= 1 ? "pointer-events-none opacity-50" : ""
        //         }
        //       />
        //     </PaginationItem>
        //     {(() => {
        //       const totalPages = Math.ceil(totalCount / itemsPerPage);
        //       const pages = [];
        //       const maxPagesToShow = 5;
        //       let startPage = Math.max(
        //         1,
        //         currentPage - Math.floor(maxPagesToShow / 2)
        //       );
        //       const endPage = Math.min(
        //         totalPages,
        //         startPage + maxPagesToShow - 1
        //       );
        //       if (endPage - startPage + 1 < maxPagesToShow) {
        //         startPage = Math.max(1, endPage - maxPagesToShow + 1);
        //       }
        //       // 시작 생략 표시
        //       if (startPage > 1) {
        //         pages.push(
        //           <PaginationItem key="start">
        //             <PaginationLink
        //               href="#"
        //               onClick={(e) => {
        //                 e.preventDefault();
        //                 handlePageChange(1);
        //               }}
        //             >
        //               1
        //             </PaginationLink>
        //           </PaginationItem>
        //         );
        //         if (startPage > 2) {
        //           pages.push(
        //             <PaginationItem key="ellipsis-start">
        //               <PaginationEllipsis />
        //             </PaginationItem>
        //           );
        //         }
        //       }
        //       // 페이지 번호들
        //       for (let i = startPage; i <= endPage; i++) {
        //         pages.push(
        //           <PaginationItem key={i}>
        //             <PaginationLink
        //               href="#"
        //               isActive={currentPage === i}
        //               onClick={(e) => {
        //                 e.preventDefault();
        //                 handlePageChange(i);
        //               }}
        //             >
        //               {i}
        //             </PaginationLink>
        //           </PaginationItem>
        //         );
        //       }
        //       // 끝 생략 표시
        //       if (endPage < totalPages) {
        //         if (endPage < totalPages - 1) {
        //           pages.push(
        //             <PaginationItem key="ellipsis-end">
        //               <PaginationEllipsis />
        //             </PaginationItem>
        //           );
        //         }
        //         pages.push(
        //           <PaginationItem key="end">
        //             <PaginationLink
        //               href="#"
        //               onClick={(e) => {
        //                 e.preventDefault();
        //                 handlePageChange(totalPages);
        //               }}
        //             >
        //               {totalPages}
        //             </PaginationLink>
        //           </PaginationItem>
        //         );
        //       }
        //       return pages;
        //     })()}
        //     <PaginationItem>
        //       <PaginationNext
        //         href="#"
        //         onClick={(e) => {
        //           e.preventDefault();
        //           const totalPages = Math.ceil(totalCount / itemsPerPage);
        //           if (currentPage < totalPages)
        //             handlePageChange(currentPage + 1);
        //         }}
        //         className={
        //           currentPage >= Math.ceil(totalCount / itemsPerPage)
        //             ? "pointer-events-none opacity-50"
        //             : ""
        //         }
        //       />
        //     </PaginationItem>
        //   </PaginationContent>
        // </Pagination>
      }

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="아티스트 삭제"
        description="정말로 이 아티스트를 삭제하시겠습니까?"
        confirmText="삭제"
        cancelText="취소"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isLoading={isLoading}
        variant="destructive"
      />
    </div>
  );
}
