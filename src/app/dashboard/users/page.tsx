import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Filter, MoreHorizontal, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function UsersPage() {
  const users = [
    {
      id: 1,
      username: "kim123",
      email: "kim123@example.com",
      name: "김철수",
      role: "user",
      status: "active",
      joinDate: "2024-01-15",
      avatar: "/placeholder-avatar.jpg",
    },
    {
      id: 2,
      username: "park456",
      email: "park456@example.com",
      name: "박영희",
      role: "premium",
      status: "active",
      joinDate: "2024-02-03",
      avatar: "/placeholder-avatar.jpg",
    },
    {
      id: 3,
      username: "lee789",
      email: "lee789@example.com",
      name: "이민수",
      role: "user",
      status: "inactive",
      joinDate: "2024-03-10",
      avatar: "/placeholder-avatar.jpg",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">사용자 관리</h2>
          <p className="text-muted-foreground">
            등록된 사용자들을 관리할 수 있습니다.
          </p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />새 사용자 추가
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="사용자 검색..." className="pl-8" />
          </div>
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          필터
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 sm:grid-cols-2 min-[320px]:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 사용자</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,350</div>
            <p className="text-xs text-muted-foreground">+10.1% 전월 대비</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">활성 사용자</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,180</div>
            <p className="text-xs text-muted-foreground">+5.2% 전월 대비</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              프리미엄 사용자
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">347</div>
            <p className="text-xs text-muted-foreground">+15.3% 전월 대비</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">신규 가입</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <p className="text-xs text-muted-foreground">이번 달</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>사용자 목록</CardTitle>
          <CardDescription>최근 등록된 사용자들</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{user.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      @{user.username}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          user.role === "premium" ? "default" : "secondary"
                        }
                      >
                        {user.role === "premium" ? "프리미엄" : "일반"}
                      </Badge>
                      <Badge
                        variant={
                          user.status === "active" ? "default" : "secondary"
                        }
                      >
                        {user.status === "active" ? "활성" : "비활성"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      가입일: {user.joinDate}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
