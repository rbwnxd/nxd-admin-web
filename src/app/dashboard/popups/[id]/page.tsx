"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import moment from "moment";
import {
  ArrowLeft,
  CalendarDays,
  Edit,
  ExternalLink,
  ImageIcon,
  Loader2,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/dialog";
import { STORAGE_URL } from "@/lib/api";
import { Popup } from "@/lib/types";
import { useAuthStore } from "@/store/authStore";
import { deletePopup, getPopup } from "../actions";
import { toast } from "sonner";

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

const DetailRow = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div>
    <p className="text-sm text-muted-foreground mb-1">{label}</p>
    <div className="font-medium">{children}</div>
  </div>
);

export default function PopupDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const jsonWebToken = useAuthStore((state) => state.token);
  const [popup, setPopup] = useState<Popup | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!jsonWebToken || !params.id) return;

    const fetchPopup = async () => {
      try {
        setIsFetching(true);
        const data = await getPopup({ id: params.id, jsonWebToken });
        setPopup(data);
      } catch (error) {
        console.error("Fetch popup detail error:", error);
        toast.error("팝업 정보를 불러오는데 실패했습니다.");
      } finally {
        setIsFetching(false);
      }
    };

    fetchPopup();
  }, [jsonWebToken, params.id]);

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      const result = await deletePopup({ id: params.id, jsonWebToken });

      if (result) {
        setPopup((prev) =>
          prev ? { ...prev, deletedAt: new Date().toISOString() } : prev,
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
    }
  };

  if (isFetching || !popup) {
    return (
      <div className="container mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>로딩 중...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>팝업 정보를 불러오는 중입니다.</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = getPopupStatus(popup);

  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          돌아가기
        </Button>

        {!popup.deletedAt && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() =>
                router.push(
                  `/dashboard/popups/create?isUpdate=true&id=${params.id}`,
                )
              }
              className="flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              수정하기
            </Button>
            <Button
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              삭제하기
            </Button>
          </div>
        )}
      </div>

      <p className="text-sm text-muted-foreground mb-4 pl-2">{popup._id}</p>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <CardTitle className="text-2xl">{popup.eventName}</CardTitle>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">팝업 이미지</h3>
            {popup.image?.image512Path ? (
              <Image
                src={`${STORAGE_URL}/${popup.image.image512Path}`}
                alt={popup.eventName}
                width={0}
                height={0}
                sizes="(max-width: 768px) 100vw, 640px"
                className="w-auto h-auto max-h-[520px] object-contain rounded border"
              />
            ) : (
              <div className="w-full h-48 rounded border bg-muted flex items-center justify-center">
                <ImageIcon className="h-10 w-10 text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DetailRow label="노출 순서">{popup.displayOrder ?? "-"}</DetailRow>
            <DetailRow label="공개 여부">
              {popup.isPublished ? "공개" : "비공개"}
            </DetailRow>
            <DetailRow label="노출 시작">
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="w-4 h-4" />
                {moment(popup.displayStartedAt).format("YYYY-MM-DD HH:mm")}
              </span>
            </DetailRow>
            <DetailRow label="노출 종료">
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="w-4 h-4" />
                {moment(popup.displayEndedAt).format("YYYY-MM-DD HH:mm")}
              </span>
            </DetailRow>
            <DetailRow label="생성일">
              {moment(popup.createdAt).format("YYYY-MM-DD HH:mm")}
            </DetailRow>
            <DetailRow label="수정일">
              {moment(popup.updatedAt).format("YYYY-MM-DD HH:mm")}
            </DetailRow>
            {popup.deletedAt && (
              <DetailRow label="삭제일">
                {moment(popup.deletedAt).format("YYYY-MM-DD HH:mm")}
              </DetailRow>
            )}
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">외부링크:</p>
            {popup.externalLink ? (
              <a
                href={popup.externalLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline break-all"
              >
                {popup.externalLink}
                <ExternalLink className="w-4 h-4 flex-shrink-0" />
              </a>
            ) : (
              <p className="font-medium">-</p>
            )}
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="팝업 삭제"
        description="정말로 이 팝업을 삭제하시겠습니까?"
        confirmText="삭제"
        cancelText="취소"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
        isLoading={isDeleting}
        variant="destructive"
      />
    </div>
  );
}
