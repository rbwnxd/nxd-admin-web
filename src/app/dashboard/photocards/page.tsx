import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function PhotocardsPage() {
  // 임시 데이터
  const photocards = [
    {
      id: 1,
      title: "NewJeans - Get Up",
      artist: "NewJeans",
      status: "active",
      price: "15,000원",
      stock: 25,
      image: "/placeholder-card.jpg",
    },
    {
      id: 2,
      title: "LE SSERAFIM - UNFORGIVEN",
      artist: "LE SSERAFIM",
      status: "active",
      price: "18,000원",
      stock: 12,
      image: "/placeholder-card.jpg",
    },
    {
      id: 3,
      title: "IVE - I AM",
      artist: "IVE",
      status: "inactive",
      price: "16,000원",
      stock: 0,
      image: "/placeholder-card.jpg",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">포토카드 관리</h2>
          <p className="text-muted-foreground">
            포토카드를 등록하고 관리할 수 있습니다.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />새 포토카드 추가
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="포토카드 검색..." className="pl-8" />
          </div>
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          필터
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>포토카드 목록</CardTitle>
          <CardDescription>
            현재 등록된 포토카드 {photocards.length}개
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {photocards.map((card) => (
              <div
                key={card.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-20 bg-muted rounded-lg flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">
                      이미지
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{card.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {card.artist}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge
                        variant={
                          card.status === "active" ? "default" : "secondary"
                        }
                      >
                        {card.status === "active" ? "판매중" : "비활성"}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        재고: {card.stock}개
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-semibold">{card.price}</div>
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
