import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Save, Bell, Shield, Database, Mail } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">설정</h2>
        <p className="text-muted-foreground">
          시스템 및 계정 설정을 관리할 수 있습니다.
        </p>
      </div>

      <div className="grid gap-6">
        {/* 일반 설정 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              일반 설정
            </CardTitle>
            <CardDescription>기본 시스템 설정을 관리합니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="site-name">사이트 이름</Label>
              <Input
                id="site-name"
                defaultValue="NXD Admin"
                placeholder="사이트 이름을 입력하세요"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="site-description">사이트 설명</Label>
              <Input
                id="site-description"
                defaultValue="NXD 프로젝트 관리자 대시보드"
                placeholder="사이트 설명을 입력하세요"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="admin-email">관리자 이메일</Label>
              <Input
                id="admin-email"
                type="email"
                defaultValue="admin@nxd.com"
                placeholder="관리자 이메일을 입력하세요"
              />
            </div>
          </CardContent>
        </Card>

        {/* 테마 설정 */}
        <Card>
          <CardHeader>
            <CardTitle>테마 설정</CardTitle>
            <CardDescription>사이트의 테마를 설정합니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>다크/라이트 모드</Label>
                <div className="text-sm text-muted-foreground">
                  테마를 변경할 수 있습니다.
                </div>
              </div>
              <ThemeToggle />
            </div>
          </CardContent>
        </Card>

        {/* 알림 설정 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              알림 설정
            </CardTitle>
            <CardDescription>시스템 알림 설정을 관리합니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>이메일 알림</Label>
                <div className="text-sm text-muted-foreground">
                  중요한 알림을 이메일로 받습니다.
                </div>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>신규 사용자 가입 알림</Label>
                <div className="text-sm text-muted-foreground">
                  새로운 사용자가 가입했을 때 알림을 받습니다.
                </div>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>새 주문 알림</Label>
                <div className="text-sm text-muted-foreground">
                  새로운 주문이 들어왔을 때 알림을 받습니다.
                </div>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>시스템 업데이트 알림</Label>
                <div className="text-sm text-muted-foreground">
                  시스템 업데이트 소식을 받습니다.
                </div>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* API 설정 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              API 설정
            </CardTitle>
            <CardDescription>
              외부 API 연동 설정을 관리합니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="api-url">API 서버 URL</Label>
              <Input
                id="api-url"
                defaultValue={
                  process.env.NEXT_PUBLIC_API_URL ||
                  "http://localhost:8000/api"
                }
                placeholder="API 서버 URL을 입력하세요"
              />
              <p className="text-xs text-muted-foreground">
                백엔드 API 서버의 URL을 설정합니다.
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="api-timeout">API 타임아웃 (초)</Label>
              <Input
                id="api-timeout"
                type="number"
                defaultValue="10"
                placeholder="10"
              />
              <p className="text-xs text-muted-foreground">
                API 요청의 타임아웃 시간을 설정합니다.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 이메일 설정 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              이메일 설정
            </CardTitle>
            <CardDescription>
              이메일 발송 관련 설정을 관리합니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="smtp-host">SMTP 서버</Label>
              <Input id="smtp-host" placeholder="smtp.gmail.com" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="smtp-port">SMTP 포트</Label>
              <Input id="smtp-port" type="number" placeholder="587" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="smtp-username">SMTP 사용자명</Label>
              <Input
                id="smtp-username"
                type="email"
                placeholder="your-email@gmail.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="smtp-password">SMTP 비밀번호</Label>
              <Input
                id="smtp-password"
                type="password"
                placeholder="앱 비밀번호를 입력하세요"
              />
            </div>
          </CardContent>
        </Card>

        {/* 저장 버튼 */}
        <div className="flex justify-end">
          <Button>
            <Save className="mr-2 h-4 w-4" />
            설정 저장
          </Button>
        </div>
      </div>
    </div>
  );
}
