"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Target, Upload, X, Loader2 } from "lucide-react";
import { createMission } from "../actions";
import { uploadImageFile } from "@/app/actions";
import { toast } from "sonner";
import { STORAGE_URL } from "@/lib/api";
import type { MissionFormData } from "@/lib/types";

export default function CreateMissionPage() {
  const router = useRouter();
  const jsonWebToken = useAuthStore((state) => state.token);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleThumbnailUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file || !jsonWebToken) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 미리보기 설정
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
    if (!jsonWebToken) {
      toast.error("인증이 필요합니다.");
      return;
    }

    // 유효성 검사
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

      await createMission({
        body: requestBody,
        jsonWebToken,
      });

      toast.success("미션이 성공적으로 생성되었습니다.");
      router.push("/dashboard/missions");
    } catch (error) {
      console.error("미션 생성 실패:", error);
      toast.error("미션 생성에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-3xl">
      {/* 상단 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-3">
          <Target className="w-8 h-8" />
          <div>
            <h1 className="text-3xl font-bold">미션 생성</h1>
            <p className="text-muted-foreground">
              새로운 유튜브 영상 시청 미션을 생성합니다
            </p>
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
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            예상 참여 가능 횟수:{" "}
            {formData.pointAmount > 0
              ? Math.floor(
                  formData.totalPointAmount / formData.pointAmount,
                ).toLocaleString()
              : 0}
            회
          </p>
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
              <p className="text-sm text-muted-foreground">
                마지막 포인트 적립 완료 시각 기준으로 재참여 가능 시간이
                계산됩니다.
              </p>
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
              className="w-fit"
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
                className="w-fit"
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
                className="w-fit"
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
          onClick={() => router.back()}
          disabled={loading}
        >
          취소
        </Button>
        <Button onClick={handleSubmit} disabled={loading || isUploading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              생성 중...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              미션 생성
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
