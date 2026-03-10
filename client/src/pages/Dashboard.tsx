// ============================================================
// Dashboard.tsx — B2G Intelligence Hub
// Design: KPIカード行 + チャート行 + テーブル行の3段構成
// Colors: Navy primary, Blue accent, Orange for scores
// ============================================================

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import {
  TrendingUp, TrendingDown, FileSearch, Building2,
  Target, AlertCircle, ChevronRight, ArrowUpRight, Users,
  RefreshCw, Loader2, Wifi, WifiOff
} from "lucide-react";
import { budgetTrendData, categoryShareData } from "@/lib/mockData";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 800;
    const step = value / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) {
        setDisplayed(value);
        clearInterval(timer);
      } else {
        setDisplayed(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{displayed.toLocaleString()}{suffix}</span>;
}

const COLORS = ["#2563eb", "#1e3a5f", "#16a34a", "#0891b2", "#7c3aed", "#94a3b8"];

export default function Dashboard() {
  // tRPCリアルタイムデータ
  const { data: tenderStats } = trpc.tenders.stats.useQuery();
  const { data: tenderSearch, refetch: refetchTenders } = trpc.tenders.search.useQuery({
    status: "公告中",
    limit: 4,
  });
  const { data: syncStatus, refetch: refetchSync } = trpc.tenders.syncStatus.useQuery();
  const { data: personnelData } = trpc.personnel.recent.useQuery({ limit: 4 });

  const syncMutation = trpc.tenders.syncFromKkj.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(`同期完了: ${data.hits}件取得`);
        refetchTenders();
        refetchSync();
      } else {
        toast.error(`同期エラー: ${data.error}`);
      }
    },
  });

  const [, setLocation] = useLocation();

  const activeTenders = (tenderSearch?.items ?? []) as Array<{
    id: number; title: string; municipality: string; category: string;
    matchScore: number | null; deadline: Date | null;
  }>;
  const activeCount = tenderStats?.active ?? 0;
  const totalCount = tenderStats?.total ?? 0;

  const formatSyncTime = (date: Date | null | undefined) => {
    if (!date) return "未実行";
    try { return format(new Date(date), "MM/dd HH:mm", { locale: ja }); } catch { return "不明"; }
  };

  const formatDeadline = (date: Date | null | undefined) => {
    if (!date) return "—";
    try { return format(new Date(date), "MM/dd", { locale: ja }); } catch { return "—"; }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
            ダッシュボード
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            自治体営業活動のインテリジェンスサマリー — 2026年3月10日現在
          </p>
        </div>
        <Button
          className="text-sm"
          style={{ background: "oklch(0.35 0.10 245)", color: "white" }}
        >
          <FileSearch className="w-4 h-4 mr-2" />
          レポート出力
        </Button>
      </div>

      {/* Hero Banner */}
      <div
        className="relative rounded-xl overflow-hidden"
        style={{ minHeight: "160px" }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/310519663296025230/daGScGP4DuNA5HMALWXwyp/b2g-hero-bg-6eyZEesKJKQN5u4xk3DBxc.webp)`,
          }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, oklch(0.22 0.06 245 / 0.85), oklch(0.35 0.10 245 / 0.70))" }} />
        <div className="relative p-6 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "oklch(0.70 0.15 258)" }}>
              B2G Intelligence Hub
            </div>
            <h2 className="text-xl font-bold text-white mb-1">
              公告中案件: <span style={{ color: "oklch(0.80 0.15 258)" }}>{activeCount}件</span> がリアルタイム取得済み
            </h2>
            <p className="text-sm" style={{ color: "oklch(0.80 0.05 247)" }}>
              官公需情報ポータルから自動取得。最終更新: {formatSyncTime(syncStatus?.lastSyncAt)}
            </p>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold font-mono-data text-white">
                <AnimatedNumber value={activeCount} />
              </div>
              <div className="text-xs mt-1" style={{ color: "oklch(0.70 0.05 247)" }}>公告中案件</div>
            </div>
            <div className="w-px h-12" style={{ background: "oklch(0.50 0.05 247)" }} />
            <div className="text-center">
              <div className="text-3xl font-bold font-mono-data text-white">
                <AnimatedNumber value={totalCount} />
              </div>
              <div className="text-xs mt-1" style={{ color: "oklch(0.70 0.05 247)" }}>総案件数</div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
          {
            title: "公告中案件数",
            value: activeCount,
            change: 0,
            suffix: "件",
            icon: FileSearch,
            accent: "card-accent-blue",
            color: "oklch(0.52 0.22 258)",
          },
          {
            title: "DB総案件数",
            value: totalCount,
            change: 0,
            suffix: "件",
            icon: TrendingUp,
            accent: "card-accent-orange",
            color: "oklch(0.70 0.18 45)",
          },
          {
            title: "受付終了案件",
            value: tenderStats?.closed ?? 0,
            change: 0,
            suffix: "件",
            icon: Building2,
            accent: "card-accent-green",
            color: "oklch(0.65 0.18 145)",
          },
          {
            title: "今月取得件数",
            value: tenderStats?.thisMonth ?? 0,
            change: 0,
            suffix: "件",
            icon: Target,
            accent: "card-accent-purple",
            color: "oklch(0.55 0.20 300)",
          },
        ].map((kpi) => {
          const Icon = kpi.icon;
          const isPositive = kpi.change > 0;
          return (
            <Card key={kpi.title} className={`shadow-sm ${kpi.accent} cursor-pointer hover:opacity-90 transition-opacity`} onClick={() => setLocation("/tender-search")}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
                    {kpi.title}
                  </div>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${kpi.color.replace(")", " / 0.12)")}` }}>
                    <Icon className="w-4 h-4" style={{ color: kpi.color }} />
                  </div>
                </div>
                <div className="text-2xl font-bold font-mono-data count-up" style={{ color: "var(--foreground)" }}>
                  <AnimatedNumber value={kpi.value} suffix={kpi.suffix} />
                </div>
                <div className="flex items-center gap-1 mt-2">
                  {isPositive ? (
                    <TrendingUp className="w-3 h-3" style={{ color: "oklch(0.65 0.18 145)" }} />
                  ) : (
                    <TrendingDown className="w-3 h-3" style={{ color: "oklch(0.577 0.245 27)" }} />
                  )}
                  <span className="text-xs font-medium" style={{ color: isPositive ? "oklch(0.55 0.18 145)" : "oklch(0.577 0.245 27)" }}>
                    {isPositive ? "+" : ""}{kpi.change}{typeof kpi.change === "number" && kpi.change % 1 !== 0 ? "%" : ""}
                  </span>
                  <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>前月比</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Budget Trend Chart */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">分野別予算推移（億円）</CardTitle>
              <Badge variant="outline" className="text-xs">2021〜2026年度</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={budgetTrendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDX" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorEnv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0891b2" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0891b2" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.90 0.008 247)" />
                <XAxis dataKey="year" tick={{ fontSize: 11, fontFamily: "JetBrains Mono" }} />
                <YAxis tick={{ fontSize: 11, fontFamily: "JetBrains Mono" }} />
                <Tooltip
                  contentStyle={{ fontSize: 12, fontFamily: "Noto Sans JP", borderRadius: 8, border: "1px solid oklch(0.90 0.008 247)" }}
                  formatter={(value: number) => [`${value}億円`, ""]}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="DX推進" stroke="#2563eb" fill="url(#colorDX)" strokeWidth={2} />
                <Area type="monotone" dataKey="脱炭素" stroke="#0891b2" fill="url(#colorEnv)" strokeWidth={2} />
                <Area type="monotone" dataKey="子育て福祉" stroke="#16a34a" fill="none" strokeWidth={2} strokeDasharray="4 2" />
                <Area type="monotone" dataKey="防災安全" stroke="#f97316" fill="none" strokeWidth={2} strokeDasharray="4 2" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Share */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">分野別市場シェア</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={categoryShareData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {categoryShareData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ fontSize: 11, fontFamily: "Noto Sans JP", borderRadius: 8 }}
                  formatter={(value: number) => [`${value}%`, ""]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {categoryShareData.map((item, i) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i] }} />
                    <span style={{ color: "var(--foreground)" }}>{item.name}</span>
                  </div>
                  <span className="font-mono-data font-semibold" style={{ color: "var(--muted-foreground)" }}>{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Tenders */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">注目の入札案件</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7 px-2"
                onClick={() => setLocation("/tender-search")}
              >
                すべて見る <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {activeTenders.slice(0, 4).map((tender) => (
              <div
                key={tender.id}
                className="flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer hover:opacity-80"
                style={{ background: "var(--muted)" }}
                onClick={() => setLocation("/tender-search")}
              >
                <div
                  className="score-badge flex-shrink-0 text-xs font-bold text-white"
                  style={{
                    width: "2.2rem",
                    height: "2.2rem",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: (tender.matchScore ?? 0) >= 85
                      ? "linear-gradient(135deg, oklch(0.70 0.18 45), oklch(0.65 0.20 35))"
                      : (tender.matchScore ?? 0) >= 70
                      ? "linear-gradient(135deg, oklch(0.52 0.22 258), oklch(0.42 0.22 258))"
                      : "linear-gradient(135deg, oklch(0.65 0.15 160), oklch(0.58 0.18 160))",
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: "0.7rem",
                  }}
                >
                  {tender.matchScore}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: "var(--foreground)" }}>
                    {tender.title}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                      {tender.municipality}
                    </span>
                    <Badge
                      className="text-xs px-1.5 py-0 h-4"
                      style={{ background: "oklch(0.52 0.22 258 / 0.12)", color: "oklch(0.42 0.22 258)", border: "none" }}
                    >
                      {tender.category}
                    </Badge>
                  </div>
                </div>
                <div className="text-xs flex-shrink-0" style={{ color: "var(--muted-foreground)" }}>
                  〆{formatDeadline(tender.deadline)}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Target className="w-4 h-4" />
                案件サマリー
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7 px-2"
                onClick={() => setLocation("/tender-search")}
              >
                詳細を見る <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "公告中の案件", value: tenderStats?.active ?? 0, unit: "件", color: "oklch(0.45 0.18 145)", bg: "oklch(0.65 0.18 145 / 0.10)" },
              { label: "今月の新規公告", value: tenderStats?.thisMonth ?? 0, unit: "件", color: "oklch(0.42 0.22 258)", bg: "oklch(0.52 0.22 258 / 0.10)" },
              { label: "受付終了", value: tenderStats?.closed ?? 0, unit: "件", color: "oklch(0.55 0.18 45)", bg: "oklch(0.70 0.18 45 / 0.10)" },
              { label: "総取得案件数", value: tenderStats?.total ?? 0, unit: "件", color: "oklch(0.45 0.05 247)", bg: "var(--muted)" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors hover:opacity-80"
                style={{ background: stat.bg }}
                onClick={() => setLocation("/tender-search")}
              >
                <span className="text-sm" style={{ color: "var(--foreground)" }}>{stat.label}</span>
                <span className="text-lg font-bold" style={{ color: stat.color, fontFamily: "JetBrains Mono, monospace" }}>
                  {stat.value.toLocaleString()}{stat.unit}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
