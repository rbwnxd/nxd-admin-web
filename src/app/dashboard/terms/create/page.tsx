"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2, FileText } from "lucide-react";
import { createTerms } from "../actions";
import { TermsFormData, TermsType } from "@/lib/types";
import { toast } from "sonner";

const TERMS_TYPE_LABELS: Record<TermsType, string> = {
  PRIVACY_POLICY: "개인정보 처리방침",
  TERMS_OF_SERVICE: "서비스 이용약관",
};

export default function TermsCreatePage() {
  const router = useRouter();
  const jsonWebToken = useAuthStore((state) => state.token);

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<TermsFormData>({
    type: "PRIVACY_POLICY",
    title: "",
    content: "",
    version: "",
  });

  const handleInputChange = (
    field: keyof TermsFormData,
    value: string | TermsType
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!jsonWebToken) {
      toast.error("인증이 필요합니다.");
      return;
    }

    // 유효성 검사
    if (!formData.type || !formData.title || !formData.content || !formData.version) {
      toast.error("모든 필드를 입력해주세요.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await createTerms({
        body: formData,
        jsonWebToken,
      });

      if (result) {
        toast.success("약관이 성공적으로 생성되었습니다.");
        router.push(`/dashboard/terms/${result._id}`);
      } else {
        toast.error("약관 생성에 실패했습니다.");
      }
    } catch (error) {
      console.error("약관 생성 실패:", error);
      toast.error(
        error instanceof Error ? error.message : "약관 생성에 실패했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard/terms")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6" />
          <h1 className="text-2xl font-bold">약관 생성</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>약관 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 약관 타입 */}
            <div className="space-y-2">
              <Label htmlFor="type">약관 타입 *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  handleInputChange("type", value as TermsType)
                }
                disabled={isLoading}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRIVACY_POLICY">
                    {TERMS_TYPE_LABELS.PRIVACY_POLICY}
                  </SelectItem>
                  <SelectItem value="TERMS_OF_SERVICE">
                    {TERMS_TYPE_LABELS.TERMS_OF_SERVICE}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 제목 */}
            <div className="space-y-2">
              <Label htmlFor="title">제목 *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="약관 제목을 입력하세요"
                required
                disabled={isLoading}
              />
            </div>

            {/* 버전 */}
            <div className="space-y-2">
              <Label htmlFor="version">버전 *</Label>
              <Input
                id="version"
                value={formData.version}
                onChange={(e) => handleInputChange("version", e.target.value)}
                placeholder="예: 1.0.0"
                required
                disabled={isLoading}
              />
              <p className="text-sm text-muted-foreground">
                버전 형식: 예) 1.0.0, 2.1.0
              </p>
            </div>

            {/* 내용 */}
            <div className="space-y-2">
              <Label htmlFor="content">내용 *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => handleInputChange("content", e.target.value)}
                placeholder="약관 내용을 입력하세요"
                required
                disabled={isLoading}
                className="min-h-[400px]"
              />
            </div>

            {/* 저장 버튼 */}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/terms")}
                disabled={isLoading}
              >
                취소
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    생성 중...
                  </>
                ) : (
                  "생성"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
