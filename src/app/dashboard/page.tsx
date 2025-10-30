"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Image from "next/image";
import { DateRange } from "react-day-picker";
import { useAuthStore } from "@/store/authStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrendingUp, User2, Users } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable, DataTableColumnHeader } from "@/components/ui/data-table";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { getDailyRankingAnalysis } from "./actions";
import {
  DailyRankingAnalysisDto,
  DailyRankingAnalysisUserStat,
  RankingRange,
} from "@/lib/types";
import { STORAGE_URL } from "@/lib/api";
import moment from "moment";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const jsonWebToken = useAuthStore((state) => state.token);
  const router = useRouter();

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: moment().subtract(7, "days").toDate(),
    to: moment().toDate(),
  });
  const [rankingRange, setRankingRange] = useState<RankingRange>("TOP10");
  const [analysisData, setAnalysisData] =
    useState<DailyRankingAnalysisDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 테이블 컬럼 정의
  const columns = useMemo<ColumnDef<DailyRankingAnalysisUserStat>[]>(
    () => [
      {
        id: "ranking",
        header: "순위",
        cell: ({ row }) => {
          const index = row.index;
          return <div className="text-center font-medium">{index + 1}</div>;
        },
        size: 80,
      },
      {
        id: "user",
        header: "사용자",
        accessorFn: (row) => row.user?.nickname || "",
        cell: ({ row }) => {
          const userStat = row.original;
          return (
            <div className="flex items-center gap-2">
              {userStat.user?.imageList &&
              userStat.user.imageList.length > 0 ? (
                <div className="relative w-8 h-8 rounded-full overflow-hidden">
                  <Image
                    src={`${STORAGE_URL}/${userStat?.user?.imageList?.[0]?.image64Path}`}
                    alt={userStat?.user?.nickname || "profile"}
                    fill
                    className="object-cover"
                    sizes="32px"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <User2 className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
              <span className="text-sm font-medium">
                {userStat.user?.nickname || "알 수 없음"}
              </span>
            </div>
          );
        },
        size: 200,
      },
      {
        accessorKey: "totalAppearances",
        header: "출현 횟수",
        cell: ({ row }) => {
          const userStat = row.original;
          return (
            <div className="text-right">
              {userStat.totalAppearances}일 (
              {userStat.appearanceRate.toFixed(1)}%)
            </div>
          );
        },
        size: 120,
      },
      {
        accessorKey: "averageRanking",
        header: "평균 랭킹",
        cell: ({ row }) => {
          const userStat = row.original;
          return (
            <div className="text-right">
              {userStat.averageRanking.toFixed(1)}위
            </div>
          );
        },
        size: 100,
      },
      {
        accessorKey: "bestRanking",
        header: "최고 랭킹",
        cell: ({ row }) => {
          const userStat = row.original;
          return <div className="text-right">{userStat.bestRanking}위</div>;
        },
        size: 100,
      },
      {
        id: "period",
        header: "기간",
        cell: ({ row }) => {
          const userStat = row.original;
          return (
            <div className="text-right">
              <div className="text-xs text-muted-foreground">
                {moment.utc(userStat.firstAppearanceDate).format("YYYY-MM-DD")}{" "}
                ~
                <br />
                {moment.utc(userStat.lastAppearanceDate).format("YYYY-MM-DD")}
              </div>
            </div>
          );
        },
        size: 120,
      },
    ],
    []
  );

  const handleAnalyze = useCallback(async () => {
    if (!jsonWebToken) {
      setError("인증이 필요합니다.");
      return;
    }

    if (!dateRange?.from || !dateRange?.to) {
      setError("시작일과 종료일을 모두 선택해주세요.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await getDailyRankingAnalysis({
        params: {
          startDate: moment(dateRange.from).format("YYYY-MM-DD"),
          endDate: moment(dateRange.to).format("YYYY-MM-DD"),
          rankingRange,
        },
        jsonWebToken,
      });

      if (result?.analysis) {
        setAnalysisData(result.analysis);
      } else {
        setError("분석 데이터를 가져오지 못했습니다.");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "분석 중 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  }, [jsonWebToken, dateRange, rankingRange]);

  // 필터링 변경시 자동 패치
  useEffect(() => {
    if (dateRange?.from && dateRange?.to && rankingRange) {
      handleAnalyze();
    }
  }, [handleAnalyze, dateRange, rankingRange]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">대시보드</h2>
        <p className="text-muted-foreground">
          NXD 관리자 대시보드에 오신 것을 환영합니다.
        </p>
      </div>

      {/* 일간 랭킹 분석 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            일간 랭킹 분석
          </CardTitle>
          <CardDescription>
            특정 기간 동안 상위 랭킹에 반복적으로 나타나는 사용자들의 통계를
            분석합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 분석 파라미터 입력 */}
          <div className="flex gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateRange">분석 기간</Label>
              <DateRangePicker
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                placeholder="분석할 기간을 선택하세요"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rankingRange">랭킹 범위</Label>
              <Select
                value={rankingRange}
                onValueChange={(value) =>
                  setRankingRange(value as RankingRange)
                }
              >
                <SelectTrigger id="rankingRange">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TOP10">TOP 10</SelectItem>
                  <SelectItem value="TOP30">TOP 30</SelectItem>
                  <SelectItem value="TOP50">TOP 50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 로딩 상태 표시 */}
          {isLoading && (
            <div className="flex items-center justify-center p-4">
              <div className="text-sm text-muted-foreground">분석 중...</div>
            </div>
          )}

          {/* 에러 메시지 */}
          {error && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
              {error}
            </div>
          )}

          {/* 분석 결과 */}
          {analysisData && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      분석 기간
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analysisData.totalDays}일
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {moment.utc(analysisData.startDate).format("YYYY-MM-DD")}{" "}
                      ~ {moment.utc(analysisData.endDate).format("YYYY-MM-DD")}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      랭킹 범위
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analysisData.range}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      분석 사용자 수
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analysisData.userStats.length}명
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 사용자 통계 테이블 */}
              <DataTable
                columns={columns}
                data={analysisData.userStats}
                searchKey="user"
                searchPlaceholder="사용자 검색..."
                showColumnToggle={false}
                showPagination={true}
                pageSize={10}
                loading={isLoading}
                onRowClick={(row) => {
                  router.push(`/dashboard/users/${row?.user?._id}`);
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
