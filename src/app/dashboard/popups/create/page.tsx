"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import moment from "moment";
import { ArrowLeft, Eye, Loader2, Save, Trash2, Upload, X } from "lucide-react";
import { uploadImageFile } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { STORAGE_URL } from "@/lib/api";
import { Popup, PopupFormData, UploadedImage } from "@/lib/types";
import { useAuthStore } from "@/store/authStore";
import { getPopup, postPopup, putPopup } from "../actions";
import { toast } from "sonner";

export default function PopupCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isUpdateMode = searchParams.get("isUpdate") === "true";
  const popupId = searchParams.get("id");
  const jsonWebToken = useAuthStore((state) => state.token);

  const [formData, setFormData] = useState<PopupFormData>({
    eventName: "",
    displayStartedAt: "",
    displayEndedAt: "",
    displayOrder: "",
    isPublished: true,
    externalLink: "",
  });
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);

  const isUploading = images.some((image) => image.isUploading);

  useEffect(() => {
    if (!isUpdateMode || !popupId || !jsonWebToken) return;

    const fetchPopup = async () => {
      try {
        setDataLoading(true);
        const popup: Popup | null = await getPopup({
          id: popupId,
          jsonWebToken,
        });

        if (!popup) {
          toast.error("팝업 정보를 찾을 수 없습니다.");
          return;
        }

        setFormData({
          eventName: popup.eventName || "",
          displayStartedAt: moment(popup.displayStartedAt).format(
            "YYYY-MM-DDTHH:mm",
          ),
          displayEndedAt: moment(popup.displayEndedAt).format(
            "YYYY-MM-DDTHH:mm",
          ),
          displayOrder:
            popup.displayOrder === undefined ? "" : String(popup.displayOrder),
          isPublished: popup.isPublished,
          externalLink: popup.externalLink || "",
        });

        if (popup.image) {
          setImages([
            {
              id: popup.image.imageOriginalPath,
              file: null,
              progress: 100,
              isUploading: false,
              path: popup.image.imageOriginalPath,
              preview: `${STORAGE_URL}/${popup.image.image256Path}`,
            },
          ]);
        }
      } catch (error) {
        console.error("Fetch popup error:", error);
        toast.error("팝업 정보를 불러오는데 실패했습니다.");
      } finally {
        setDataLoading(false);
      }
    };

    fetchPopup();
  }, [isUpdateMode, jsonWebToken, popupId]);

  const handleInputChange = (
    field: keyof PopupFormData,
    value: string | boolean,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const uploadImageDirect = async (imageData: UploadedImage) => {
    if (!jsonWebToken || !imageData.file) return;

    try {
      const path = await uploadImageFile({
        file: imageData.file,
        jsonWebToken,
        dataCollectionName: "popups",
        onProgress: (progress) => {
          setImages((prev) =>
            prev.map((img) =>
              img.id === imageData.id ? { ...img, progress } : img,
            ),
          );
        },
      });

      setImages((prev) =>
        prev.map((img) =>
          img.id === imageData.id
            ? { ...img, path, isUploading: false, progress: 100 }
            : img,
        ),
      );
    } catch (error) {
      console.error("Popup image upload error:", error);
      setImages((prev) =>
        prev.map((img) =>
          img.id === imageData.id
            ? { ...img, isUploading: false, error: "업로드 실패" }
            : img,
        ),
      );
      toast.error("팝업 이미지 업로드에 실패했습니다.");
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = Array.from(files).find((item) =>
      item.type.startsWith("image/"),
    );
    if (!file) return;

    const newImage: UploadedImage = {
      id: Date.now().toString() + Math.random().toString(36),
      file,
      progress: 0,
      isUploading: true,
    };

    setImages([newImage]);
    uploadImageDirect(newImage);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jsonWebToken) return;

    const image = images.find((item) => item.path);
    if (!image?.path) {
      toast.error("팝업 이미지는 필수입니다.");
      return;
    }

    if (!formData.displayStartedAt || !formData.displayEndedAt) {
      toast.error("노출 시작/종료 시간을 입력해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      const displayOrder =
        formData.displayOrder === "" ? undefined : Number(formData.displayOrder);

      const body = {
        eventName: formData.eventName,
        displayStartedAt: moment(formData.displayStartedAt).toISOString(),
        displayEndedAt: moment(formData.displayEndedAt).toISOString(),
        ...(displayOrder === undefined || Number.isNaN(displayOrder)
          ? {}
          : { displayOrder }),
        isPublished: formData.isPublished,
        image: {
          name: image.file?.name || "popup-image",
          imageOriginalPath: image.path,
        },
        externalLink:
          formData.externalLink.trim() === ""
            ? null
            : formData.externalLink.trim(),
      };

      const result =
        isUpdateMode && popupId
          ? await putPopup({ id: popupId, body, jsonWebToken })
          : await postPopup({ body, jsonWebToken });

      if (result) {
        toast.success(`팝업이 ${isUpdateMode ? "수정" : "등록"}되었습니다.`);
        router.replace("/dashboard/popups");
      }
    } catch (error) {
      console.error("Save popup error:", error);
      toast.error("팝업 저장 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isUpdateMode && dataLoading) {
    return (
      <div className="container mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">
              팝업 정보를 불러오는 중입니다...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          돌아가기
        </Button>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.replace("/dashboard/popups")}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            취소
          </Button>
          <Button
            type="submit"
            form="popup-form"
            disabled={isLoading || isUploading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isLoading ? "저장 중..." : "저장"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {isUpdateMode ? "팝업 수정" : "팝업 등록"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form id="popup-form" onSubmit={handleSubmit} className="space-y-8">
            <div>
              <Label htmlFor="eventName" className="text-sm font-medium">
                이벤트명 *
              </Label>
              <Input
                id="eventName"
                value={formData.eventName}
                onChange={(e) => handleInputChange("eventName", e.target.value)}
                required
                disabled={isLoading}
                className="mt-1"
                placeholder="이벤트명을 입력하세요"
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">노출 정보</h3>
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4 md:items-end">
                  <div className="flex-shrink-0">
                    <Label
                      htmlFor="displayStartedAt"
                      className="text-sm font-medium"
                    >
                      노출 시작 *
                    </Label>
                    <Input
                      id="displayStartedAt"
                      type="datetime-local"
                      value={formData.displayStartedAt}
                      onChange={(e) =>
                        handleInputChange("displayStartedAt", e.target.value)
                      }
                      required
                      disabled={isLoading}
                      className="mt-1 w-fit"
                    />
                  </div>
                  <div className="flex-shrink-0">
                    <Label
                      htmlFor="displayEndedAt"
                      className="text-sm font-medium"
                    >
                      노출 종료 *
                    </Label>
                    <Input
                      id="displayEndedAt"
                      type="datetime-local"
                      value={formData.displayEndedAt}
                      onChange={(e) =>
                        handleInputChange("displayEndedAt", e.target.value)
                      }
                      required
                      disabled={isLoading}
                      className="mt-1 w-fit"
                    />
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-6 md:items-end">
                  <div>
                    <Label
                      htmlFor="displayOrder"
                      className="text-sm font-medium"
                    >
                      노출 순서
                    </Label>
                    <Input
                      id="displayOrder"
                      type="number"
                      value={formData.displayOrder}
                      onChange={(e) =>
                        handleInputChange("displayOrder", e.target.value)
                      }
                      disabled={isLoading}
                      className="mt-1 w-32"
                      placeholder="0"
                    />
                  </div>
                  <div className="flex items-center gap-2 pb-2">
                    <Label
                      htmlFor="isPublished"
                      className="text-sm font-medium"
                    >
                      공개 여부
                    </Label>
                    <Switch
                      id="isPublished"
                      checked={formData.isPublished}
                      onCheckedChange={(checked) =>
                        handleInputChange("isPublished", checked)
                      }
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="externalLink" className="text-sm font-medium">
                외부 링크
              </Label>
              <Input
                id="externalLink"
                value={formData.externalLink}
                onChange={(e) =>
                  handleInputChange("externalLink", e.target.value)
                }
                disabled={isLoading}
                className="mt-1"
                placeholder="https://example.com"
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">팝업 이미지 *</h3>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  handleFileSelect(e.dataTransfer.files);
                }}
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium mb-2">
                  이미지를 드래그하여 업로드하거나
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    document.getElementById("popup-file-input")?.click()
                  }
                  disabled={isLoading}
                >
                  파일 선택
                </Button>
                <input
                  id="popup-file-input"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e.target.files)}
                  disabled={isLoading}
                  className="hidden"
                />
              </div>

              {images.length > 0 && (
                <div className="mt-6 max-w-sm">
                  {images.map((image) => (
                    <div key={image.id} className="border rounded-lg p-4">
                      <div className="flex justify-center">
                        <Image
                          src={
                            image.file
                              ? URL.createObjectURL(image.file)
                              : image.preview || ""
                          }
                          alt={image.file?.name || "팝업 이미지"}
                          width={0}
                          height={0}
                          sizes="360px"
                          className="w-full h-auto max-h-[320px] object-contain rounded"
                        />
                      </div>
                      {image.isUploading && (
                        <div className="space-y-2 mt-3">
                          <Progress value={image.progress} className="h-2" />
                          <p className="text-xs text-center">
                            업로드 중... {image.progress}%
                          </p>
                        </div>
                      )}
                      {image.error && (
                        <p className="text-xs text-red-500 text-center mt-3">
                          {image.error}
                        </p>
                      )}
                      {image.path && (
                        <div className="flex items-center justify-center mt-3">
                          <span className="text-xs text-green-600 flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            업로드 완료
                          </span>
                        </div>
                      )}
                      <div className="flex justify-center mt-3">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setImages([])}
                          disabled={isLoading}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          제거
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
