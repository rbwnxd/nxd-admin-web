import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart3, Users, Image, FileText } from "lucide-react";

export default function DashboardPage() {
  const stats = [
    {
      title: "총 사용자",
      value: "2,350",
      description: "+10.1% from last month",
      icon: Users,
    },
    {
      title: "포토카드",
      value: "1,247",
      description: "+12.5% from last month",
      icon: Image,
    },
    {
      title: "콘텐츠",
      value: "847",
      description: "+8.2% from last month",
      icon: FileText,
    },
    {
      title: "총 매출",
      value: "₩15,231,000",
      description: "+20.1% from last month",
      icon: BarChart3,
    },
  ];

  return (
    <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">대시보드</h2>
          <p className="text-muted-foreground">
            NXD 관리자 대시보드에 오신 것을 환영합니다.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>최근 활동</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      새로운 포토카드가 등록되었습니다.
                    </p>
                    <p className="text-sm text-muted-foreground">5분 전</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      사용자 kim123이 가입했습니다.
                    </p>
                    <p className="text-sm text-muted-foreground">1시간 전</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      새로운 주문이 들어왔습니다.
                    </p>
                    <p className="text-sm text-muted-foreground">2시간 전</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>빠른 액션</CardTitle>
              <CardDescription>
                자주 사용하는 기능들에 빠르게 접근할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors">
                <div className="text-sm font-medium">포토카드 추가</div>
                <div className="text-xs text-muted-foreground">
                  새 포토카드 등록
                </div>
              </div>
              <div className="p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors">
                <div className="text-sm font-medium">사용자 관리</div>
                <div className="text-xs text-muted-foreground">
                  사용자 목록 보기
                </div>
              </div>
              <div className="p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors">
                <div className="text-sm font-medium">설정</div>
                <div className="text-xs text-muted-foreground">시스템 설정</div>
              </div>
            </CardContent>
          </Card>
        </div>
    </div>
  );
}
