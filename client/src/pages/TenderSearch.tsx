// ============================================================
// TenderSearch.tsx — B2G Intelligence Hub
// 官公需情報ポータルAPIとリアルタイム連携した入札・予算リサーチ機能
// ============================================================

import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search, RefreshCw, ExternalLink, TrendingUp,
  Calendar, Building2, Target, ChevronRight,
  CheckCircle2, AlertCircle, Clock, Database,
  Loader2, Wifi, WifiOff
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

// ============================================================
// 型定義
// ============================================================
interface TenderItem {
  id: number;
  externalId: string | null;
  title: string;
  municipality: string;
  prefecture: string;
  category: string;
  status: string;
  budget: string | null;
  publishedAt: Date | null;
  deadline: Date | null;
  demandScore: number | null;
  matchScore: number | null;
  description: string | null;
  sourceUrl: string | null;
}

// ============================================================
// スコアバッジ
// ============================================================
function ScoreBadge({ score, label }: { score: number | null; label: string }) {
  const s = score ?? 0;
  const color = s >= 85
    ? { bg: "oklch(0.70 0.18 45)", text: "white" }
    : s >= 70
    ? { bg: "oklch(0.52 0.22 258)", text: "white" }
    : { bg: "oklch(0.65 0.15 160)", text: "white" };

  return (
    <div className="flex flex-col items-center gap-0.5">
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs"
        style={{ background: color.bg, color: color.text, fontFamily: "JetBrains Mono, monospace" }}
      >
        {s}
      </div>
      <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{label}</span>
    </div>
  );
}

// ============================================================
// 案件行コンポーネント
// ============================================================
function TenderRow({ tender, onClick }: { tender: TenderItem; onClick: () => void }) {
  const statusColor = tender.status === "公告中"
    ? { bg: "oklch(0.65 0.18 145 / 0.15)", text: "oklch(0.45 0.18 145)" }
    : tender.status === "受付終了"
    ? { bg: "oklch(0.70 0.18 45 / 0.15)", text: "oklch(0.55 0.18 45)" }
    : { bg: "oklch(0.55 0.05 247 / 0.15)", text: "oklch(0.45 0.05 247)" };

  const formatDate = (date: Date | null) => {
    if (!date) return "—";
    try {
      return format(new Date(date), "MM/dd", { locale: ja });
    } catch {
      return "—";
    }
  };

  return (
    <div
      className="flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-all duration-150 hover:shadow-sm"
      style={{ background: "var(--card)", border: "1px solid var(--border)" }}
      onClick={onClick}
    >
      {/* Scores */}
      <div className="flex gap-3 flex-shrink-0">
        <ScoreBadge score={tender.demandScore} label="需要" />
        <ScoreBadge score={tender.matchScore} label="適合" />
      </div>

      {/* Main Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 mb-1">
          <span className="text-sm font-semibold leading-snug" style={{ color: "var(--foreground)" }}>
            {tender.title}
          </span>
          <Badge
            className="text-xs px-1.5 py-0 h-5 flex-shrink-0"
            style={{ background: statusColor.bg, color: statusColor.text, border: "none" }}
          >
            {tender.status}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs" style={{ color: "var(--muted-foreground)" }}>
          <span className="flex items-center gap-1">
            <Building2 size={11} />
            {tender.municipality}（{tender.prefecture}）
          </span>
          <span className="flex items-center gap-1">
            <Target size={11} />
            {tender.category}
          </span>
          {tender.publishedAt && (
            <span className="flex items-center gap-1">
              <Calendar size={11} />
              公告: {formatDate(tender.publishedAt)}
            </span>
          )}
          {tender.deadline && (
            <span className="flex items-center gap-1">
              <Clock size={11} />
              締切: {formatDate(tender.deadline)}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {(() => {
          const safeUrl = cleanSourceUrl(tender.sourceUrl);
          if (safeUrl) {
            return (
              <a
                href={safeUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="p-1.5 rounded hover:bg-accent transition-colors"
                title="元ページを開く"
              >
                <ExternalLink size={14} style={{ color: "var(--muted-foreground)" }} />
              </a>
            );
          }
          // 有効なURLがない場合は官公需サイトで検索
          const kkjFallback = `https://www.kkj.go.jp/search?q=${encodeURIComponent(tender.title)}`;
          return (
            <a
              href={kkjFallback}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="p-1.5 rounded hover:bg-accent transition-colors"
              title="官公需サイトで検索"
            >
              <ExternalLink size={14} style={{ color: "var(--muted-foreground)" }} />
            </a>
          );
        })()}
        <ChevronRight size={16} style={{ color: "var(--muted-foreground)" }} />
      </div>
    </div>
  );
}

// ============================================================
// CDATA・URLクリーニング（フロントエンド用）
// ============================================================
function cleanSourceUrl(url: string | null): string | null {
  if (!url) return null;
  // CDATAタグを除去
  const cleaned = url.replace(/<\!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1').trim();
  // 有効なhttp/https URLか確認
  try {
    const u = new URL(cleaned);
    if (u.protocol === 'http:' || u.protocol === 'https:') return cleaned;
    return null;
  } catch {
    return null;
  }
}

// ============================================================
// 案件詳細モーダル
// ============================================================
interface SummaryResult {
  summary: string;
  points: string[];
  contractType: string;
  estimatedScale: string;
  dataSource?: string;
}

function TenderDetailModal({ tender, onClose }: { tender: TenderItem; onClose: () => void }) {
  const [descExpanded, setDescExpanded] = useState(false);
  const [summaryData, setSummaryData] = useState<SummaryResult | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  const summarizeMutation = trpc.tenders.summarize.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        const d = data as { success: true; summary: string; points: string[]; contractType: string; estimatedScale: string; dataSource?: string };
        setSummaryData({
          summary: d.summary ?? "",
          points: d.points ?? [],
          contractType: d.contractType ?? "",
          estimatedScale: d.estimatedScale ?? "",
          dataSource: d.dataSource,
        });
      }
      setIsSummarizing(false);
    },
    onError: () => setIsSummarizing(false),
  });

  // モーダル表示時に自動要約
  useEffect(() => {
    setIsSummarizing(true);
    summarizeMutation.mutate({
      tenderId: tender.id,
      title: tender.title,
      description: tender.description ?? "",
      category: tender.category,
      municipality: tender.municipality,
      prefecture: tender.prefecture,
      sourceUrl: tender.sourceUrl ?? undefined,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tender.id]);

  const formatDateFull = (date: Date | null) => {
    if (!date) return "不明";
    try {
      return format(new Date(date), "yyyy年MM月dd日", { locale: ja });
    } catch {
      return "不明";
    }
  };

  // 安全なURLを取得
  const safeUrl = cleanSourceUrl(tender.sourceUrl);

  // 自治体名でGoogle検索リンクを生成
  const municipalitySearchUrl = `https://www.google.com/search?q=${encodeURIComponent(tender.municipality + ' ' + tender.prefecture + ' 公式サイト')}`;

  // 官公需ポータルの案件検索URL
  const kkjSearchUrl = `https://www.kkj.go.jp/cgi-bin/search.cgi?Query=${encodeURIComponent(tender.title.substring(0, 30))}`;

  // 概要テキストの表示制御
  const descText = tender.description ?? "";
  const descShort = descText.length > 200 ? descText.substring(0, 200) + "..." : descText;
  const showExpandBtn = descText.length > 200;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden"
        style={{ background: "var(--card)", border: "1px solid var(--border)", maxHeight: "90vh", display: "flex", flexDirection: "column" }}
        onClick={e => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="p-5 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge style={{
                  background: tender.status === "公告中" ? "oklch(0.65 0.18 145 / 0.15)" : "oklch(0.70 0.18 45 / 0.15)",
                  color: tender.status === "公告中" ? "oklch(0.45 0.18 145)" : "oklch(0.55 0.18 45)",
                  border: "none"
                }}>
                  {tender.status}
                </Badge>
                <span className="text-xs px-2 py-0.5 rounded" style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}>
                  {tender.category}
                </span>
              </div>
              <h2 className="text-base font-bold leading-snug" style={{ color: "var(--foreground)" }}>
                {tender.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center hover:bg-accent transition-colors"
              style={{ color: "var(--muted-foreground)" }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* コンテンツ（スクロール可） */}
        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {/* 基本情報グリッド */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg p-3" style={{ background: "var(--muted)" }}>
              <div className="text-xs font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>発注機関</div>
              <div className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>{tender.municipality}</div>
              <div className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{tender.prefecture}</div>
            </div>
            <div className="rounded-lg p-3" style={{ background: "var(--muted)" }}>
              <div className="text-xs font-medium mb-2" style={{ color: "var(--muted-foreground)" }}>参考スコア</div>
              <div className="flex gap-4 mb-2">
                <div className="text-center">
                  <div className="text-xl font-bold" style={{ color: "oklch(0.52 0.22 258)", fontFamily: "JetBrains Mono, monospace" }}>
                    {tender.demandScore ?? "—"}
                  </div>
                  <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>需要度</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold" style={{ color: "oklch(0.70 0.18 45)", fontFamily: "JetBrains Mono, monospace" }}>
                    {tender.matchScore ?? "—"}
                  </div>
                  <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>適合度</div>
                </div>
              </div>
              <div className="text-xs leading-relaxed" style={{ color: "var(--muted-foreground)", borderTop: "1px solid var(--border)", paddingTop: "6px" }}>
                <span className="font-medium">需要度</span>：案件の公告頻度・予算規模から算出した市場の切実さ指標。高いほど自治体のニーズが大きい。
                <br />
                <span className="font-medium">適合度</span>：案件カテゴリ・地域・規模から算出した自社の得意領域との一致度。現時点ではランダム値です。AI戦略室で自社情報を入力すると実際の適合度を計算できます。
              </div>
            </div>
            <div className="rounded-lg p-3" style={{ background: "var(--muted)" }}>
              <div className="text-xs font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>公告日</div>
              <div className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>{formatDateFull(tender.publishedAt)}</div>
            </div>
            <div className="rounded-lg p-3" style={{ background: "var(--muted)" }}>
              <div className="text-xs font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>入札締切日</div>
              <div className="font-semibold text-sm" style={{
                color: tender.deadline && new Date(tender.deadline) < new Date()
                  ? "oklch(0.577 0.245 27)"
                  : "var(--foreground)"
              }}>
                {formatDateFull(tender.deadline)}
              </div>
            </div>
          </div>

          {/* 案件概要（Gemini要約表示） */}
          <div className="rounded-lg p-3" style={{ background: "var(--muted)" }}>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>案件概要</div>
              {summaryData && (
                <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "oklch(0.52 0.22 258 / 0.12)", color: "oklch(0.42 0.22 258)" }}>
                  AI要約（{summaryData.dataSource ?? "公告文"}より）
                </span>
              )}
            </div>

            {isSummarizing ? (
              <div className="flex items-center gap-2 py-2">
                <Loader2 size={14} className="animate-spin" style={{ color: "oklch(0.52 0.22 258)" }} />
                <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>Gemini AIが要点を整理中...</span>
              </div>
            ) : summaryData ? (
              <div className="space-y-2">
                <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{summaryData.summary}</p>
                <ul className="space-y-1">
                  {summaryData.points.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "var(--foreground)" }}>
                      <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ background: "oklch(0.52 0.22 258 / 0.15)", color: "oklch(0.42 0.22 258)" }}>
                        {i + 1}
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
                <div className="flex gap-2 mt-1">
                  {summaryData.contractType && (
                    <span className="text-xs px-2 py-0.5 rounded" style={{ background: "var(--background)", color: "var(--muted-foreground)", border: "1px solid var(--border)" }}>
                      {summaryData.contractType}
                    </span>
                  )}
                  {summaryData.estimatedScale && (
                    <span className="text-xs px-2 py-0.5 rounded" style={{ background: "var(--background)", color: "var(--muted-foreground)", border: "1px solid var(--border)" }}>
                      {summaryData.estimatedScale}
                    </span>
                  )}
                </div>
                {/* 元の説明文も開ける */}
                {descText && (
                  <div className="mt-2 pt-2" style={{ borderTop: "1px solid var(--border)" }}>
                    <button
                      onClick={() => setDescExpanded(!descExpanded)}
                      className="text-xs font-medium"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      {descExpanded ? "↑ 元の公告文を折りたたむ" : "↓ 元の公告文を表示"}
                    </button>
                    {descExpanded && (
                      <p className="mt-2 text-xs leading-relaxed" style={{ color: "var(--muted-foreground)", whiteSpace: "pre-wrap" }}>
                        {descText}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : descText ? (
              <div>
                <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)", whiteSpace: "pre-wrap" }}>
                  {descExpanded ? descText : descShort}
                </p>
                {showExpandBtn && (
                  <button
                    onClick={() => setDescExpanded(!descExpanded)}
                    className="mt-2 text-xs font-medium"
                    style={{ color: "oklch(0.52 0.22 258)" }}
                  >
                    {descExpanded ? "↑ 折りたたむ" : "↓ 全文を表示"}
                  </button>
                )}
              </div>
            ) : (
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>概要情報なし</p>
            )}
          </div>

          {/* リンクセクション */}
          <div className="rounded-lg p-3" style={{ background: "var(--muted)" }}>
            <div className="text-xs font-medium mb-2" style={{ color: "var(--muted-foreground)" }}>関連リンク</div>
            <div className="space-y-2">
              {safeUrl ? (
                <a
                  href={safeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm py-1.5 px-3 rounded-lg transition-colors hover:opacity-80"
                  style={{ background: "oklch(0.52 0.22 258 / 0.12)", color: "oklch(0.42 0.22 258)" }}
                >
                  <ExternalLink size={13} />
                  元案件ページを開く
                </a>
              ) : (
                <a
                  href={kkjSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm py-1.5 px-3 rounded-lg transition-colors hover:opacity-80"
                  style={{ background: "oklch(0.52 0.22 258 / 0.12)", color: "oklch(0.42 0.22 258)" }}
                >
                  <ExternalLink size={13} />
                  官公需ポータルで検索
                </a>
              )}
              <a
                href={municipalitySearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm py-1.5 px-3 rounded-lg transition-colors hover:opacity-80"
                style={{ background: "var(--background)", color: "var(--muted-foreground)", border: "1px solid var(--border)" }}
              >
                <Building2 size={13} />
                {tender.municipality}の公式サイトを検索
              </a>
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="p-4 border-t flex justify-end" style={{ borderColor: "var(--border)" }}>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-80"
            style={{ background: "var(--muted)", color: "var(--foreground)" }}
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// メインコンポーネント
// ============================================================
export default function TenderSearch() {
  const [keyword, setKeyword] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedPrefecture, setSelectedPrefecture] = useState("すべて");
  const [selectedCategory, setSelectedCategory] = useState("すべて");
  const [selectedStatus, setSelectedStatus] = useState("すべて");
  const [selectedTender, setSelectedTender] = useState<TenderItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 50;

  // 都道府県一覧取得
  const { data: prefectureList } = trpc.tenders.prefectures.useQuery();

  // 案件検索
  const { data: searchResult, isLoading: isSearching, refetch } = trpc.tenders.search.useQuery({
    keyword: searchKeyword || undefined,
    prefecture: selectedPrefecture !== "すべて" ? selectedPrefecture : undefined,
    category: selectedCategory !== "すべて" ? selectedCategory : undefined,
    status: selectedStatus !== "すべて" ? selectedStatus : undefined,
    limit: PAGE_SIZE,
    offset: (currentPage - 1) * PAGE_SIZE,
  });

  // 同期ステータス
  const { data: syncStatus, refetch: refetchStatus } = trpc.tenders.syncStatus.useQuery();

  // 手動同期ミューテーション
  const syncMutation = trpc.tenders.syncFromKkj.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(`同期完了: ${data.hits}件取得、${data.inserted}件追加 (${(data.durationMs / 1000).toFixed(1)}秒)`, {
          description: "官公需情報ポータルから最新データを取得しました",
        });
        refetch();
        refetchStatus();
      } else {
        toast.error(`同期エラー: ${data.error}`, {
          description: "官公需情報ポータルへの接続に失敗しました",
        });
      }
    },
    onError: (err) => {
      toast.error(`同期失敗: ${err.message}`);
    },
  });

  const handleSearch = useCallback(() => {
    setSearchKeyword(keyword);
    setCurrentPage(1); // 検索時はページをリセット
  }, [keyword]);

  const handleSync = useCallback(() => {
    const lgCodes = selectedPrefecture !== "すべて"
      ? prefectureList?.filter(p => p.name === selectedPrefecture).map(p => p.code)
      : undefined;

    syncMutation.mutate({
      query: keyword || "入札",
      lgCodes: lgCodes,
      category: selectedCategory !== "すべて" ? selectedCategory : undefined,
      count: 200,
    });
  }, [selectedPrefecture, selectedCategory, keyword, prefectureList, syncMutation]);

  const tenderList = (searchResult?.items ?? []) as TenderItem[];
  const totalCount = searchResult?.total ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const categories = ["すべて", "物品", "工事", "役務"];
  const statuses = ["すべて", "公告中", "受付終了", "落札済み"];

  const formatSyncTime = (date: Date | null | undefined) => {
    if (!date) return "未実行";
    try {
      return format(new Date(date), "MM/dd HH:mm", { locale: ja });
    } catch {
      return "不明";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
            入札・案件リサーチ
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            官公需情報ポータルサイトのリアルタイムデータ
          </p>
        </div>

        {/* 同期ステータスと更新ボタン */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
            style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}>
            {syncStatus?.status === "成功" ? (
              <Wifi size={12} className="text-green-500" />
            ) : syncStatus?.status === "未実行" ? (
              <WifiOff size={12} className="text-gray-400" />
            ) : (
              <AlertCircle size={12} className="text-yellow-500" />
            )}
            <span>最終更新: {formatSyncTime(syncStatus?.lastSyncAt)}</span>
            <span className="font-mono">{syncStatus?.recordsFetched ?? 0}件取得</span>
          </div>

          <Button
            onClick={handleSync}
            disabled={syncMutation.isPending}
            className="flex items-center gap-2 text-sm"
            style={{ background: "oklch(0.52 0.22 258)", color: "white" }}
          >
            {syncMutation.isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <RefreshCw size={14} />
            )}
            {syncMutation.isPending ? "取得中..." : "最新情報に更新"}
          </Button>
        </div>
      </div>

      {/* 検索フィルター */}
      <Card style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-48 flex gap-2">
              <Input
                placeholder="キーワード検索（案件名・自治体名）"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                className="flex-1"
                style={{ background: "var(--background)", borderColor: "var(--border)" }}
              />
              <Button onClick={handleSearch} style={{ background: "oklch(0.52 0.22 258)", color: "white" }}>
                <Search size={14} />
              </Button>
            </div>

            <Select value={selectedPrefecture} onValueChange={setSelectedPrefecture}>
              <SelectTrigger className="w-36" style={{ background: "var(--background)", borderColor: "var(--border)" }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="すべて">すべての都道府県</SelectItem>
                {prefectureList?.map(p => (
                  <SelectItem key={p.code} value={p.name}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-28" style={{ background: "var(--background)", borderColor: "var(--border)" }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-28" style={{ background: "var(--background)", borderColor: "var(--border)" }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statuses.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 結果サマリー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database size={14} style={{ color: "var(--muted-foreground)" }} />
          <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            {isSearching ? "検索中..." : `全${totalCount.toLocaleString()}件中 ${((currentPage - 1) * PAGE_SIZE + 1).toLocaleString()}〜${Math.min(currentPage * PAGE_SIZE, totalCount).toLocaleString()}件を表示`}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs" style={{ color: "var(--muted-foreground)" }}>
          <CheckCircle2 size={12} className="text-green-500" />
          <span>自動更新: 30分ごと</span>
        </div>
      </div>

      {/* 案件リスト */}
      {isSearching ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={32} className="animate-spin" style={{ color: "oklch(0.52 0.22 258)" }} />
            <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>案件を検索中...</span>
          </div>
        </div>
      ) : tenderList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: "var(--muted)" }}>
            <Search size={24} style={{ color: "var(--muted-foreground)" }} />
          </div>
          <div className="text-center">
            <p className="font-semibold" style={{ color: "var(--foreground)" }}>案件が見つかりません</p>
            <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
              「最新情報に更新」ボタンを押して官公需ポータルから最新データを取得してください
            </p>
          </div>
          <Button
            onClick={handleSync}
            disabled={syncMutation.isPending}
            className="flex items-center gap-2"
            style={{ background: "oklch(0.52 0.22 258)", color: "white" }}
          >
            {syncMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            今すぐ取得する
          </Button>
        </div>
      ) : (
        <>
        <div className="space-y-2">
          {tenderList.map(tender => (
            <TenderRow
              key={tender.id}
              tender={tender}
              onClick={() => setSelectedTender(tender)}
            />
          ))}
        </div>

        {/* ページネーション */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              className="px-3 py-1.5 rounded text-sm transition-colors disabled:opacity-40"
              style={{ background: "var(--muted)", color: "var(--foreground)" }}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1 || isSearching}
            >
              ← 前へ
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let page: number;
                if (totalPages <= 7) {
                  page = i + 1;
                } else if (currentPage <= 4) {
                  page = i + 1;
                } else if (currentPage >= totalPages - 3) {
                  page = totalPages - 6 + i;
                } else {
                  page = currentPage - 3 + i;
                }
                return (
                  <button
                    key={page}
                    className="w-8 h-8 rounded text-sm font-medium transition-colors"
                    style={{
                      background: page === currentPage ? "oklch(0.52 0.22 258)" : "var(--muted)",
                      color: page === currentPage ? "white" : "var(--foreground)",
                    }}
                    onClick={() => setCurrentPage(page)}
                    disabled={isSearching}
                  >
                    {page}
                  </button>
                );
              })}
            </div>
            <button
              className="px-3 py-1.5 rounded text-sm transition-colors disabled:opacity-40"
              style={{ background: "var(--muted)", color: "var(--foreground)" }}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || isSearching}
            >
              次へ →
            </button>
            <span className="text-xs ml-2" style={{ color: "var(--muted-foreground)" }}>
              {currentPage} / {totalPages}ページ
            </span>
          </div>
        )}
        </>
      )}

      {/* 案件詳細モーダル */}
      {selectedTender && (
        <TenderDetailModal
          tender={selectedTender}
          onClose={() => setSelectedTender(null)}
        />
      )}
    </div>
  );
}
