import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  FileText,
  Image,
  Video,
} from "lucide-react";
import { Input } from "@/components/ui/input";

export default function ContentsPage() {
  const contents = [
    {
      id: 1,
      title: "뉴진스 컴백 소식",
      type: "article",
      status: "published",
      author: "관리자",
      createdAt: "2024-03-15",
      views: 1250,
    },
    {
      id: 2,
      title: "르세라핌 신곡 뮤직비디오",
      type: "video",
      status: "draft",
      author: "에디터1",
      createdAt: "2024-03-14",
      views: 0,
    },
    {
      id: 3,
      title: "IVE 포토카드 이벤트",
      type: "image",
      status: "published",
      author: "마케팅팀",
      createdAt: "2024-03-13",
      views: 892,
    },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "article":
        return FileText;
      case "image":
        return Image;
      case "video":
        return Video;
      default:
        return FileText;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "article":
        return "기사";
      case "image":
        return "이미지";
      case "video":
        return "비디오";
      default:
        return "기타";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">컨텐츠 관리</h2>
          <p className="text-muted-foreground">
            사이트에 게시될 컨텐츠를 관리할 수 있습니다.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />새 컨텐츠 추가
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="컨텐츠 검색..." className="pl-8" />
          </div>
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          필터
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 컨텐츠</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">847</div>
            <p className="text-xs text-muted-foreground">+8.2% 전월 대비</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">게시된 컨텐츠</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">623</div>
            <p className="text-xs text-muted-foreground">+12.1% 전월 대비</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">임시저장</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">224</div>
            <p className="text-xs text-muted-foreground">검토 대기 중</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 조회수</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">125,347</div>
            <p className="text-xs text-muted-foreground">이번 달</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>컨텐츠 목록</CardTitle>
          <CardDescription>최근 작성된 컨텐츠들</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {contents.map((content) => {
              const Icon = getTypeIcon(content.type);
              return (
                <div
                  key={content.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                      <Icon className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{content.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        작성자: {content.author}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline">
                          {getTypeLabel(content.type)}
                        </Badge>
                        <Badge
                          variant={
                            content.status === "published"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {content.status === "published"
                            ? "게시됨"
                            : "임시저장"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="font-semibold">
                        조회수: {content.views.toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {content.createdAt}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
