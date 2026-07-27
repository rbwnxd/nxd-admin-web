"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useMissionStore } from "@/store/missionStore";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Loader2,
  Edit,
  MoreHorizontal,
  Trash2,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
  Target,
  // RefreshCw,
} from "lucide-react";
import {
  getMissions,
  deleteMission,
  // syncMissionParticipationStats,
  // syncMissionParticipationSummaries,
} from "./actions";
import { ConfirmDialog } from "@/components/dialog/ConfirmDialog";
import { toast } from "sonner";
import moment from "moment";
import { STORAGE_URL } from "@/lib/api";
import type { Mission } from "@/lib/types";

export default function MissionsPage() {
  const router = useRouter();
  const jsonWebToken = useAuthStore((state) => state.token);
  const {
    missions,
    totalCount,
    loading,
    currentPage,
    itemsPerPage,
    setMissions,
    setTotalCount,
    setLoading,
    setCurrentPage,
    removeMission,
  } = useMissionStore();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [missionToDelete, setMissionToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  // const [isSyncing, setIsSyncing] = useState(false);

  const fetchMissions = async () => {
    if (!jsonWebToken) return;
    setLoading(true);
    try {
      const result = await getMissions({
        params: {
          __skip: (currentPage - 1) * itemsPerPage,
          __limit: itemsPerPage,
        },
        jsonWebToken,
      });

      if (result) {
        setMissions(result.missions || []);
        setTotalCount(result.totalCount || 0);
      }
    } catch (error) {
      console.error("Missions fetch error:", error);
      toast.error("미션 목록을 가져올 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jsonWebToken, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDelete = async () => {
    if (!missionToDelete || !jsonWebToken) return;

    setIsDeleting(true);
    try {
      await deleteMission({
        missionId: missionToDelete,
        jsonWebToken,
      });
      removeMission(missionToDelete);
      toast.success("미션이 성공적으로 삭제되었습니다.");
    } catch (error) {
      console.error("미션 삭제 실패:", error);
      toast.error("미션 삭제에 실패했습니다.");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setMissionToDelete(null);
    }
  };

  // const handleSyncStats = async () => {
  //   if (!jsonWebToken) return;
  //   setIsSyncing(true);
  //   try {
  //     await syncMissionParticipationStats({ jsonWebToken });
  //     await syncMissionParticipationSummaries({ jsonWebToken });
  //     toast.success("미션 참여 통계가 동기화되었습니다.");
  //     fetchMissions();
  //   } catch (error) {
  //     console.error("통계 동기화 실패:", error);
  //     toast.error("통계 동기화에 실패했습니다.");
  //   } finally {
  //     setIsSyncing(false);
  //   }
  // };

  const getMissionStatus = (mission: Mission) => {
    const now = moment();
    if (mission.deletedAt)
      return { label: "삭제됨", variant: "destructive" as const };
    if (mission.endedAt && now.isAfter(moment(mission.endedAt)))
      return { label: "종료", variant: "secondary" as const };
    if (!mission.isPointAvailable)
      return { label: "포인트 소진", variant: "outline" as const };
    if (now.isBefore(moment(mission.publishedAt)))
      return { label: "예정", variant: "secondary" as const };
    return { label: "진행중", variant: "default" as const };
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div className="container mx-auto">
      {/* 상단 헤더 */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 gap-4 lg:gap-0">
        <div className="flex items-center gap-3">
          <Target className="w-8 h-8" />
          <div>
            <h1 className="text-3xl font-bold">미션 관리</h1>
            <p className="text-muted-foreground">
              유튜브 영상 시청 미션을 생성하고 관리합니다
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end lg:self-auto">
          {/* <Button
            variant="outline"
            onClick={handleSyncStats}
            disabled={isSyncing}
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`}
            />
            통계 동기화
          </Button> */}
          <Button
            onClick={() => router.push("/dashboard/missions/create")}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />새 미션 생성
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{`미션 목록 (${totalCount})`}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : missions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <Target className="w-12 h-12 mb-2 opacity-50" />
              <p>등록된 미션이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {missions.map((mission) => {
                const status = getMissionStatus(mission);

                return (
                  <div
                    key={mission._id}
                    className="border rounded-lg p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className={`flex-1 cursor-pointer ${mission.deletedAt ? "cursor-default" : ""}`}
                        onClick={() => {
                          if (mission.deletedAt) return;
                          router.push(`/dashboard/missions/${mission._id}`);
                        }}
                      >
                        <div className="flex items-start gap-4">
                          {/* 썸네일 */}
                          {mission.thumbnailImage256Path && (
                            <Image
                              src={`${STORAGE_URL}/${mission.thumbnailImage256Path}`}
                              alt={mission.title.ko}
                              width={80}
                              height={80}
                              className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                              unoptimized
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={status.variant}>
                                {status.label}
                              </Badge>
                              {mission.participationIntervalHours === null ? (
                                <Badge variant="outline">1회 참여</Badge>
                              ) : (
                                <Badge variant="outline">
                                  {mission.participationIntervalHours}시간 간격
                                </Badge>
                              )}
                            </div>

                            <h3 className="font-semibold text-lg mb-1 truncate">
                              {mission.title.ko}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-2 truncate">
                              {mission.description.ko}
                            </p>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                              <span>1회 포인트: {mission.pointAmount}P</span>
                              <span>
                                예산:{" "}
                                {mission.remainingPointAmount.toLocaleString()}/
                                {mission.totalPointAmount.toLocaleString()}P
                              </span>
                              <span>재생: {mission.playStartedCount}회</span>
                              <span>적립: {mission.pointGrantedCount}회</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              공개일:{" "}
                              {moment(mission.publishedAt).format(
                                "YYYY-MM-DD HH:mm",
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* 액션 버튼 */}
                      {!mission.deletedAt && (
                        <div className="flex items-center gap-2 ml-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(
                                    `/dashboard/missions/${mission._id}`,
                                  );
                                }}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                상세/수정
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMissionToDelete(mission._id);
                                  setIsDeleteDialogOpen(true);
                                }}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                삭제
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
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
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1}
                      className="h-9 w-9"
                      title="이전 페이지"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </PaginationItem>

                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const pageNumber =
                      Math.max(1, Math.min(totalPages - 4, currentPage - 2)) +
                      i;
                    if (pageNumber > totalPages) return null;

                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          onClick={() => handlePageChange(pageNumber)}
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
                      onClick={() => handlePageChange(currentPage + 1)}
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
                      onClick={() => handlePageChange(totalPages)}
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
        </CardContent>
      </Card>

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="미션 삭제"
        description="이 미션을 정말 삭제하시겠습니까? 삭제된 미션은 사용자에게 노출되지 않습니다."
        variant="destructive"
        onConfirm={handleDelete}
        onCancel={() => {
          setIsDeleteDialogOpen(false);
          setMissionToDelete(null);
        }}
        confirmText={isDeleting ? "삭제 중..." : "삭제"}
      />
    </div>
  );
}
