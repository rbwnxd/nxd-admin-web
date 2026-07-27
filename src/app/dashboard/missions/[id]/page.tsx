"use client";

import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Save,
  Target,
  Upload,
  X,
  Loader2,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { getMissionDetail, updateMission, deleteMission } from "../actions";
import { ConfirmDialog } from "@/components/dialog/ConfirmDialog";
import { uploadImageFile } from "@/app/actions";
import { toast } from "sonner";
import { STORAGE_URL } from "@/lib/api";
import moment from "moment";
import type { Mission, MissionFormData } from "@/lib/types";

export default function MissionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const missionId = params.id as string;
  const jsonWebToken = useAuthStore((state) => state.token);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mission, setMission] = useState<Mission | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const [formData, setFormData] = useState<MissionFormData>({
    thumbnailImageOriginalPath: "",
    title: { ko: "", en: "" },
    description: { ko: "", en: "" },
    youtubeUrl: "",
    pointAmount: 100,
    totalPointAmount: 100000,
    participationIntervalHours: 24,
    publishedAt: "",
    pointFinishedAt: null,
    endedAt: null,
  });

  const [isOneTimeOnly, setIsOneTimeOnly] = useState(false);
  const [hasPointFinishedAt, setHasPointFinishedAt] = useState(false);
  const [hasEndedAt, setHasEndedAt] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!jsonWebToken || !missionId) return;
    setIsDeleting(true);
    try {
      await deleteMission({ missionId, jsonWebToken });
      toast.success("미션이 삭제되었습니다.");
      router.push("/dashboard/missions");
    } catch (error) {
      console.error("미션 삭제 실패:", error);
      toast.error("미션 삭제에 실패했습니다.");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  useEffect(() => {
    if (!jsonWebToken || !missionId) return;

    const fetchMission = async () => {
      setPageLoading(true);
      try {
        const result = await getMissionDetail({ missionId, jsonWebToken });
        if (result?.mission) {
          const m = result.mission;
          setMission(m);

          const publishedLocal = moment(m.publishedAt).format(
            "YYYY-MM-DDTHH:mm",
          );
          const pointFinishedLocal = m.pointFinishedAt
            ? moment(m.pointFinishedAt).format("YYYY-MM-DDTHH:mm")
            : null;
          const endedLocal = m.endedAt
            ? moment(m.endedAt).format("YYYY-MM-DDTHH:mm")
            : null;

          setFormData({
            thumbnailImageOriginalPath: m.thumbnailImageOriginalPath,
            title: m.title,
            description: m.description,
            youtubeUrl: m.youtubeUrl,
            pointAmount: m.pointAmount,
            totalPointAmount: m.totalPointAmount,
            participationIntervalHours: m.participationIntervalHours,
            publishedAt: publishedLocal,
            pointFinishedAt: pointFinishedLocal,
            endedAt: endedLocal,
          });

          setIsOneTimeOnly(m.participationIntervalHours === null);
          setHasPointFinishedAt(!!m.pointFinishedAt);
          setHasEndedAt(!!m.endedAt);
        }
      } catch (error) {
        console.error("미션 상세 조회 실패:", error);
        toast.error("미션 정보를 가져올 수 없습니다.");
      } finally {
        setPageLoading(false);
      }
    };

    fetchMission();
  }, [jsonWebToken, missionId]);

  const handleThumbnailUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file || !jsonWebToken) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const previewUrl = URL.createObjectURL(file);
      setThumbnailPreview(previewUrl);

      const key = await uploadImageFile({
        file,
        jsonWebToken,
        onProgress: setUploadProgress,
        dataCollectionName: "missions",
      });

      setFormData((prev) => ({
        ...prev,
        thumbnailImageOriginalPath: key,
      }));

      toast.success("썸네일 이미지가 업로드되었습니다.");
    } catch (error) {
      console.error("썸네일 업로드 실패:", error);
      toast.error("썸네일 업로드에 실패했습니다.");
      setThumbnailPreview(null);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const removeThumbnail = () => {
    setFormData((prev) => ({
      ...prev,
      thumbnailImageOriginalPath: "",
    }));
    setThumbnailPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!jsonWebToken || !missionId) {
      toast.error("인증이 필요합니다.");
      return;
    }

    if (!formData.thumbnailImageOriginalPath) {
      toast.error("썸네일 이미지를 업로드해주세요.");
      return;
    }
    if (!formData.title.ko.trim() || !formData.title.en.trim()) {
      toast.error("제목을 한국어와 영어 모두 입력해주세요.");
      return;
    }
    if (!formData.description.ko.trim() || !formData.description.en.trim()) {
      toast.error("설명을 한국어와 영어 모두 입력해주세요.");
      return;
    }
    if (!formData.youtubeUrl.trim()) {
      toast.error("YouTube URL을 입력해주세요.");
      return;
    }
    if (formData.pointAmount <= 0) {
      toast.error("1회당 지급 포인트를 올바르게 입력해주세요.");
      return;
    }
    if (formData.totalPointAmount < formData.pointAmount) {
      toast.error("전체 포인트 예산은 1회당 지급 포인트 이상이어야 합니다.");
      return;
    }
    if (!formData.publishedAt) {
      toast.error("공개 시작 일시를 설정해주세요.");
      return;
    }

    setLoading(true);

    try {
      const requestBody: MissionFormData = {
        ...formData,
        participationIntervalHours: isOneTimeOnly
          ? null
          : formData.participationIntervalHours,
        publishedAt: new Date(formData.publishedAt).toISOString(),
        pointFinishedAt:
          hasPointFinishedAt && formData.pointFinishedAt
            ? new Date(formData.pointFinishedAt).toISOString()
            : null,
        endedAt:
          hasEndedAt && formData.endedAt
            ? new Date(formData.endedAt).toISOString()
            : null,
      };

      const updated = await updateMission({
        missionId,
        body: requestBody,
        jsonWebToken,
      });

      if (updated) {
        setMission(updated);
        setIsEditing(false);
        toast.success("미션이 수정되었습니다.");
      }
    } catch (error) {
      console.error("미션 수정 실패:", error);
      toast.error("미션 수정에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const getMissionStatus = (m: Mission) => {
    const now = moment();
    if (m.deletedAt)
      return { label: "삭제됨", variant: "destructive" as const };
    if (m.endedAt && now.isAfter(moment(m.endedAt)))
      return { label: "종료", variant: "secondary" as const };
    if (!m.isPointAvailable)
      return { label: "포인트 소진", variant: "outline" as const };
    if (now.isBefore(moment(m.publishedAt)))
      return { label: "예정", variant: "secondary" as const };
    return { label: "진행중", variant: "default" as const };
  };

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-muted-foreground">미션을 찾을 수 없습니다.</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.back()}
        >
          뒤로 가기
        </Button>
      </div>
    );
  }

  const status = getMissionStatus(mission);

  // 상세보기 모드
  if (!isEditing) {
    return (
      <div className="container mx-auto max-w-3xl">
        {/* 상단 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8" />
              <div>
                <h1 className="text-3xl font-bold">미션 상세</h1>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              삭제
            </Button>
            <Button onClick={() => setIsEditing(true)}>수정</Button>
          </div>
        </div>

        {/* 상태 & 썸네일 */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start gap-6">
              {mission.thumbnailImage256Path && (
                <Image
                  src={`${STORAGE_URL}/${mission.thumbnailImage256Path}`}
                  alt={mission.title.ko}
                  width={128}
                  height={128}
                  className="w-32 h-32 rounded-lg object-cover flex-shrink-0"
                  unoptimized
                />
              )}
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant={status.variant}>{status.label}</Badge>
                  {mission.participationIntervalHours === null ? (
                    <Badge variant="outline">1회 참여</Badge>
                  ) : (
                    <Badge variant="outline">
                      {mission.participationIntervalHours}시간 간격
                    </Badge>
                  )}
                </div>
                <h2 className="text-2xl font-bold">{mission.title.ko}</h2>
                <p className="text-muted-foreground">{mission.title.en}</p>
                <p className="text-sm">{mission.description.ko}</p>
                <a
                  href={mission.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  YouTube 영상 보기
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 포인트 통계 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>포인트 & 통계</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">1회 지급</p>
                <p className="text-xl font-bold">{mission.pointAmount}P</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">남은 예산</p>
                <p className="text-xl font-bold">
                  {mission.remainingPointAmount.toLocaleString()}P
                </p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">전체 예산</p>
                <p className="text-xl font-bold">
                  {mission.totalPointAmount.toLocaleString()}P
                </p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">포인트 가용</p>
                <p
                  className={`text-xl font-bold ${mission.isPointAvailable ? "text-green-600" : "text-red-600"}`}
                >
                  {mission.isPointAvailable ? "가능" : "불가"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              <div className="text-center p-3 border rounded-lg">
                <p className="text-sm text-muted-foreground">재생 시작</p>
                <p className="text-lg font-semibold">
                  {mission.playStartedCount}회
                </p>
                <p className="text-xs text-muted-foreground">
                  {mission.playStartedUserCount}명
                </p>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <p className="text-sm text-muted-foreground">재생 완료</p>
                <p className="text-lg font-semibold">
                  {mission.playEndedCount}회
                </p>
                <p className="text-xs text-muted-foreground">
                  {mission.playEndedUserCount}명
                </p>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <p className="text-sm text-muted-foreground">포인트 적립</p>
                <p className="text-lg font-semibold">
                  {mission.pointGrantedCount}회
                </p>
                <p className="text-xs text-muted-foreground">
                  {mission.pointGrantedUserCount}명
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 일정 정보 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>일정 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">공개 시작</span>
                <span>
                  {moment(mission.publishedAt).format("YYYY-MM-DD HH:mm")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">포인트 적립 종료</span>
                <span>
                  {mission.pointFinishedAt
                    ? moment(mission.pointFinishedAt).format("YYYY-MM-DD HH:mm")
                    : "제한 없음"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">미션 종료</span>
                <span>
                  {mission.endedAt
                    ? moment(mission.endedAt).format("YYYY-MM-DD HH:mm")
                    : "제한 없음"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">생성일</span>
                <span>
                  {moment(mission.createdAt).format("YYYY-MM-DD HH:mm")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">수정일</span>
                <span>
                  {moment(mission.updatedAt).format("YYYY-MM-DD HH:mm")}
                </span>
              </div>
            </div>
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
          onCancel={() => setIsDeleteDialogOpen(false)}
          confirmText={isDeleting ? "삭제 중..." : "삭제"}
        />
      </div>
    );
  }

  // 수정 모드
  return (
    <div className="container mx-auto max-w-3xl">
      {/* 상단 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-3">
          <Target className="w-8 h-8" />
          <div>
            <h1 className="text-3xl font-bold">미션 수정</h1>
            <p className="text-muted-foreground">미션 정보를 수정합니다</p>
          </div>
        </div>
      </div>

      {/* 썸네일 이미지 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>썸네일 이미지</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {thumbnailPreview || formData.thumbnailImageOriginalPath ? (
              <div className="relative inline-block">
                <Image
                  src={
                    thumbnailPreview ||
                    `${STORAGE_URL}/${formData.thumbnailImageOriginalPath}`
                  }
                  alt="썸네일 미리보기"
                  width={192}
                  height={192}
                  className="w-48 h-48 rounded-lg object-cover"
                  unoptimized
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6"
                  onClick={removeThumbnail}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div
                className="w-48 h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">
                  이미지 업로드
                </span>
              </div>
            )}
            {isUploading && (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm text-muted-foreground">
                  업로드 중... {uploadProgress}%
                </span>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleThumbnailUpload}
            />
            {!thumbnailPreview && !formData.thumbnailImageOriginalPath && (
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <Upload className="w-4 h-4 mr-2" />
                파일 선택
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 기본 정보 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="titleKo">제목 (한국어) *</Label>
              <Input
                id="titleKo"
                value={formData.title.ko}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    title: { ...prev.title, ko: e.target.value },
                  }))
                }
                placeholder="한국어 제목"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="titleEn">제목 (영어) *</Label>
              <Input
                id="titleEn"
                value={formData.title.en}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    title: { ...prev.title, en: e.target.value },
                  }))
                }
                placeholder="English title"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="descKo">설명 (한국어) *</Label>
              <Textarea
                id="descKo"
                value={formData.description.ko}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: { ...prev.description, ko: e.target.value },
                  }))
                }
                placeholder="한국어 설명"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descEn">설명 (영어) *</Label>
              <Textarea
                id="descEn"
                value={formData.description.en}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: { ...prev.description, en: e.target.value },
                  }))
                }
                placeholder="English description"
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="youtubeUrl">YouTube URL *</Label>
            <Input
              id="youtubeUrl"
              value={formData.youtubeUrl}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, youtubeUrl: e.target.value }))
              }
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>
        </CardContent>
      </Card>

      {/* 포인트 설정 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>포인트 설정</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pointAmount">1회당 지급 포인트 *</Label>
              <Input
                id="pointAmount"
                type="number"
                min={1}
                value={formData.pointAmount}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    pointAmount: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalPointAmount">전체 포인트 예산 *</Label>
              <Input
                id="totalPointAmount"
                type="number"
                min={1}
                value={formData.totalPointAmount}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    totalPointAmount: Number(e.target.value),
                  }))
                }
              />
              <p className="text-xs text-muted-foreground">
                이미 사용된 포인트보다 작게 설정할 수 없습니다. (현재 사용:{" "}
                {mission
                  ? (
                      mission.totalPointAmount - mission.remainingPointAmount
                    ).toLocaleString()
                  : 0}
                P)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 참여 정책 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>참여 정책</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch
              id="isOneTimeOnly"
              checked={isOneTimeOnly}
              onCheckedChange={(checked) => {
                setIsOneTimeOnly(checked);
                if (checked) {
                  setFormData((prev) => ({
                    ...prev,
                    participationIntervalHours: null,
                  }));
                } else {
                  setFormData((prev) => ({
                    ...prev,
                    participationIntervalHours: 24,
                  }));
                }
              }}
            />
            <Label htmlFor="isOneTimeOnly">1회만 참여 가능</Label>
          </div>

          {!isOneTimeOnly && (
            <div className="space-y-2">
              <Label htmlFor="participationIntervalHours">
                재참여 간격 (시간)
              </Label>
              <Input
                id="participationIntervalHours"
                type="number"
                min={1}
                value={formData.participationIntervalHours || 24}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    participationIntervalHours: Number(e.target.value),
                  }))
                }
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* 일정 설정 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>일정 설정</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="publishedAt">공개 시작 일시 *</Label>
            <Input
              id="publishedAt"
              type="datetime-local"
              value={formData.publishedAt}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  publishedAt: e.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Switch
                id="hasPointFinishedAt"
                checked={hasPointFinishedAt}
                onCheckedChange={setHasPointFinishedAt}
              />
              <Label htmlFor="hasPointFinishedAt">
                포인트 적립 종료 일시 설정
              </Label>
            </div>
            {hasPointFinishedAt && (
              <Input
                type="datetime-local"
                value={formData.pointFinishedAt || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    pointFinishedAt: e.target.value,
                  }))
                }
              />
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Switch
                id="hasEndedAt"
                checked={hasEndedAt}
                onCheckedChange={setHasEndedAt}
              />
              <Label htmlFor="hasEndedAt">미션 종료 일시 설정</Label>
            </div>
            {hasEndedAt && (
              <Input
                type="datetime-local"
                value={formData.endedAt || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, endedAt: e.target.value }))
                }
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* 저장 버튼 */}
      <div className="flex justify-end gap-3 mb-8">
        <Button
          variant="outline"
          onClick={() => setIsEditing(false)}
          disabled={loading}
        >
          취소
        </Button>
        <Button onClick={handleSubmit} disabled={loading || isUploading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              저장 중...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              저장
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
