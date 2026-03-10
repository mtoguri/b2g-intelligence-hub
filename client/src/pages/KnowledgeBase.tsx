// ============================================================
// KnowledgeBase.tsx — B2G Intelligence Hub
// 自治体特有のドメイン知識・成功事例DB
// ============================================================

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BookOpen, Search, Building2, Users, TrendingUp,
  Star, ChevronRight, Tag, Calendar, ExternalLink, Info, RefreshCw
} from "lucide-react";
import { knowledgeItems, type KnowledgeItem } from "@/lib/mockData";

const domainKnowledge = [
  {
    title: "予算書の読み方：款・項・目・節の体系",
    category: "予算・財政",
    content: "自治体予算は「款（かん）→項（こう）→目（もく）→節（せつ）」の4階層で管理される。営業担当者が注目すべきは「目」レベルの事業名と予算額。「款」は総務費・民生費・衛生費などの大分類、「目」が具体的な事業単位となる。",
    importance: "高",
    tags: ["予算", "財政", "基礎知識"],
  },
  {
    title: "入札参加資格の取得と更新サイクル",
    category: "入札制度",
    content: "自治体への入札参加には「競争入札参加資格」の取得が必要。多くの自治体が2年に1度の定期審査を実施（奇数年・偶数年の交互）。格付けランク（A〜D）によって参加可能な案件規模が決まる。資格申請は10〜12月頃が多い。",
    importance: "高",
    tags: ["入札", "参加資格", "手続き"],
  },
  {
    title: "総合計画・実施計画の活用法",
    category: "政策分析",
    content: "自治体は5〜10年の「総合計画」と3年程度の「実施計画」を策定する。実施計画に記載された事業は予算化の可能性が高く、2〜3年先の需要を予測できる。毎年度の「実施計画の見直し」タイミング（9〜11月）が営業の好機。",
    importance: "高",
    tags: ["総合計画", "政策", "先行予測"],
  },
  {
    title: "議会の構造と質疑応答の読み方",
    category: "議会・政治",
    content: "自治体議会は年4回（3月・6月・9月・12月）の定例会が基本。3月議会では予算審議が行われ、首長の施政方針演説が重要。議員の一般質問は自治体の課題を把握する最良の情報源。議事録は各自治体HPで公開されている。",
    importance: "中",
    tags: ["議会", "議事録", "情報収集"],
  },
  {
    title: "デジタル田園都市国家構想と補助金活用",
    category: "補助金・政策",
    content: "デジタル田園都市国家構想推進交付金（デジタル田園都市型）は自治体のDX推進に活用できる国費補助金。自治体の財政負担を軽減できるため、提案時に補助金活用を組み込むことで採択率が向上する。",
    importance: "高",
    tags: ["補助金", "DX", "デジタル田園都市"],
  },
  {
    title: "人事異動の季節と担当者変更への対応",
    category: "営業戦略",
    content: "自治体の大規模人事異動は3月末～4月初旬に集中。課長・係長レベルの異動が多く、担当者が変わると関係構築のやり直しが必要。4月の挨拶回りは最重要営業活動。異動情報は自治体広報誌や公式HP（組織図更新）で確認できる。",
    importance: "高",
    tags: ["人事異動", "関係構築", "営業タイミング"],
  },
  {
    title: "小規模自治体への提案戦略：人口規模別アプローチ",
    category: "営業戦略",
    content: "人口小規模自治体（5万人未満）では財政力が小さく、導入コストの小ささと运用の簡便さが重視される。複数自治体での共同調達（共同発注）や、近隔自治体との連携導入を提案することでコスト分散が可能。小規模自治体専用のサブスクリプションプランも有効。",
    importance: "中",
    tags: ["小規模自治体", "共同調達", "コスト分散"],
  },
  {
    title: "地方創生争議予算と地方交付税の活用",
    category: "補助金・財政",
    content: "地方創生争議予算は地方自治体が自由に使える一般財源で、年度末に余れると翌年度に繰り越せる。地方交付税は国から自治体へ分配される財源で、景気変動により大きく変動する。地方交付税が増加した年度は新規事業化の好機。",
    importance: "中",
    tags: ["地方創生争議予算", "地方交付税", "財源"],
  },
  {
    title: "履行保証・前払い保証の仕組み",
    category: "入札制度",
    content: "自治体入札では履行保証（契約金額の10%前後）と前払い保証（前払い金額の10%前後）が必要な場合が多い。保証会社の保証書で代替可能。小規模案件では保証免除となる場合もあり、事前に入札公告を確認することが重要。",
    importance: "中",
    tags: ["履行保証", "入札手続き", "契約"],
  },
  {
    title: "指名競争入札・随意契約の活用条件",
    category: "入札制度",
    content: "一般競争入札以外に、「指名競争入札」（発注者が指名した複数業者から見積もり彴収）と「随意契約」（発注者が任意の業者と契約）がある。随意契約は130万円未満（物品）・50万円未満（役務）が目安。先行導入実績があれば随意契約の可能性もある。",
    importance: "高",
    tags: ["指名競争", "随意契約", "入札種別"],
  },
  {
    title: "公共調達契約の活用と共同入札戦略",
    category: "入札制度",
    content: "複数自治体が共同で行う入札制度。都道府県が幹事機関となり、市町村の共同調達を一欄に引き受ける。小規模自治体では導入コスト削減になり、導入決定がしやすい。公共調達契約の登録制度を持つ自治体への営業では登録状況を事前に確認すること。",
    importance: "中",
    tags: ["公共調達", "共同入札", "導入コスト"],
  },
  {
    title: "歳入山営業のタイミング・スケジュール",
    category: "営業戦略",
    content: "1月～3月：次年度予算化済み事業の入札公告が集中。入札導内の最終スパート。 4月～5月：新年度の予算正式成立後。新担当者への挨拶回りと関係構築の最重要時期。 6月～8月：次年度予算要求の標的時期。課長・部長への提案が最も効果的。 9月～11月：実施計画見直し・予算要求書提出期限。来年度予算化の最後の機会。",
    importance: "高",
    tags: ["年間スケジュール", "営業タイミング", "予算要求"],
  },
  {
    title: "山屋型プロポーザルの作り方",
    category: "営業戦略",
    content: "自治体向け提案書は「自治体の課題」→「解決策」→「導入後の姿」の流れで構成する。議会議事録から抽出したキーワードを提案書に盛り込むことで「自分たちの言葉で語られている」と感じてもらえる。コスト導入後の貪担軽減を数字で示すことが最重要。",
    importance: "高",
    tags: ["提案書", "プロポーザル", "営業スキル"],
  },
  {
    title: "PFI・指定管理者制度の理解と活用",
    category: "入札制度",
    content: "PFI（Private Finance Initiative）は民間資金で公共施設を整備・運営する機制。指定管理者制度は公共施設の管理・運営を民間に委託する制度。指定管理者は利用料收入を得る権利を持つため、民間が主体的にサービス改善に取り組める。大規模案件では長期契約（15～30年）となることが多い。",
    importance: "中",
    tags: ["PFI", "指定管理者", "民間活用"],
  },
  {
    title: "デジタル庁・各省庁の自治体DX支援施策の活用",
    category: "補助金・政策",
    content: "デジタル庁の「自治体DX推進ロードマップ」に沿った提案は採沢率が高い。各省庁の補助金（総務省・内閣府・各省庁）を組み合わせた複合提案が有効。年度当初に公表される補助金情報を追い、自治体の予算要求に間に合わせることが重要。",
    importance: "高",
    tags: ["デジタル庁", "補助金", "DXロードマップ"],
  },
  {
    title: "情報公開請求・議事録活用の実務",
    category: "情報収集",
    content: "情報公開請求制度を活用することで、入札結果・契約内容・他社の導入実績を入手できる。議事録は各自治体のHPで公開されており、議員の一般質問から地元の課題を把握できる。定期的な議事録チェックを営業ルーティンに組み込むことを推奨。",
    importance: "中",
    tags: ["議事録", "情報公開", "情報収集"],
  },
];

function KnowledgeCard({ item }: { item: KnowledgeItem }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <Card
      className="shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md"
      style={{ border: "1px solid var(--border)" }}
      onClick={() => setExpanded(!expanded)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold text-white"
            style={{
              background: item.successScore >= 90
                ? "linear-gradient(135deg, oklch(0.70 0.18 45), oklch(0.65 0.20 35))"
                : "linear-gradient(135deg, oklch(0.52 0.22 258), oklch(0.42 0.22 258))",
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "0.75rem",
            }}
          >
            {item.successScore}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold leading-snug" style={{ color: "var(--foreground)" }}>
                {item.title}
              </h3>
              <ChevronRight
                className="w-4 h-4 flex-shrink-0 transition-transform"
                style={{
                  color: "var(--muted-foreground)",
                  transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
                }}
              />
            </div>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1 text-xs" style={{ color: "var(--muted-foreground)" }}>
                <Building2 className="w-3 h-3" />
                {item.municipality}
              </div>
              <div className="flex items-center gap-1 text-xs" style={{ color: "var(--muted-foreground)" }}>
                <Users className="w-3 h-3" />
                人口 {(item.population / 10000).toFixed(0)}万人
              </div>
              <div className="flex items-center gap-1 text-xs" style={{ color: "var(--muted-foreground)" }}>
                <Calendar className="w-3 h-3" />
                {item.date}
              </div>
            </div>
            <div className="flex gap-1 mt-2 flex-wrap">
              <Badge className="text-xs px-1.5 py-0 h-4" style={{ background: "oklch(0.35 0.10 245 / 0.12)", color: "oklch(0.35 0.10 245)", border: "none" }}>
                {item.category}
              </Badge>
              {item.tags.map(tag => (
                <Badge key={tag} className="text-xs px-1.5 py-0 h-4" style={{ background: "var(--muted)", color: "var(--muted-foreground)", border: "none" }}>
                  {tag}
                </Badge>
              ))}
            </div>
            {expanded && (
              <div className="mt-3 pt-3 border-t text-sm leading-relaxed" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
                {item.summary}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DomainCard({ item }: { item: typeof domainKnowledge[0] }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <Card
      className="shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md"
      style={{ borderLeft: item.importance === "高" ? "4px solid oklch(0.52 0.22 258)" : "4px solid oklch(0.65 0.15 160)" }}
      onClick={() => setExpanded(!expanded)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge
                className="text-xs px-1.5 py-0 h-4"
                style={{ background: "oklch(0.35 0.10 245 / 0.12)", color: "oklch(0.35 0.10 245)", border: "none" }}
              >
                {item.category}
              </Badge>
              {item.importance === "高" && (
                <Badge className="text-xs px-1.5 py-0 h-4" style={{ background: "oklch(0.70 0.18 45 / 0.15)", color: "oklch(0.55 0.18 45)", border: "none" }}>
                  重要
                </Badge>
              )}
            </div>
            <h3 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{item.title}</h3>
            {expanded && (
              <p className="text-sm mt-2 leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                {item.content}
              </p>
            )}
            <div className="flex gap-1 mt-2 flex-wrap">
              {item.tags.map(tag => (
                <span key={tag} className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                  #{tag}
                </span>
              ))}
            </div>
          </div>
          <ChevronRight
            className="w-4 h-4 flex-shrink-0 transition-transform"
            style={{ color: "var(--muted-foreground)", transform: expanded ? "rotate(90deg)" : "rotate(0deg)" }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default function KnowledgeBase() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"cases" | "domain">("cases");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    // ナレッジベースは静的データのため、更新日時のみ更新
    await new Promise(resolve => setTimeout(resolve, 800));
    setLastUpdated(new Date());
    setIsRefreshing(false);
  }, []);

  const filteredCases = knowledgeItems.filter(item =>
    !searchQuery ||
    item.title.includes(searchQuery) ||
    item.municipality.includes(searchQuery) ||
    item.category.includes(searchQuery) ||
    item.tags.some(t => t.includes(searchQuery))
  );

  const filteredDomain = domainKnowledge.filter(item =>
    !searchQuery ||
    item.title.includes(searchQuery) ||
    item.category.includes(searchQuery) ||
    item.tags.some(t => t.includes(searchQuery))
  );

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>ナレッジベース</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            自治体ビジネスのドメイン知識と成功事例データベース
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-right" style={{ color: "var(--muted-foreground)" }}>
            <div>最終更新</div>
            <div className="font-mono">{lastUpdated.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}</div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-1.5 text-xs h-8"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "更新中..." : "更新"}
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "成功事例", value: knowledgeItems.length, icon: Star, color: "oklch(0.70 0.18 45)" },
          { label: "ドメイン知識", value: domainKnowledge.length, icon: BookOpen, color: "oklch(0.52 0.22 258)" },
          { label: "ドメイン知識カテゴリ", value: "入札制度・営業戦略他", icon: Building2, color: "oklch(0.65 0.18 145)" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${stat.color.replace(")", " / 0.12)")}` }}>
                  <Icon className="w-4 h-4" style={{ color: stat.color }} />
                </div>
                <div>
                  <div className="text-lg font-bold font-mono-data" style={{ color: "var(--foreground)" }}>{stat.value}</div>
                  <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>{stat.label}</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--muted-foreground)" }} />
        <Input
          placeholder="キーワード・自治体名・カテゴリで検索..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-9 text-sm"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-lg" style={{ background: "var(--muted)" }}>
        <button
          className="flex-1 py-2 text-sm font-medium rounded-md transition-all"
          style={activeTab === "cases"
            ? { background: "var(--card)", color: "var(--foreground)", boxShadow: "0 1px 3px oklch(0 0 0 / 0.1)" }
            : { color: "var(--muted-foreground)" }
          }
          onClick={() => setActiveTab("cases")}
        >
          <Star className="w-3.5 h-3.5 inline mr-1.5" />
          成功事例 ({filteredCases.length})
        </button>
        <button
          className="flex-1 py-2 text-sm font-medium rounded-md transition-all"
          style={activeTab === "domain"
            ? { background: "var(--card)", color: "var(--foreground)", boxShadow: "0 1px 3px oklch(0 0 0 / 0.1)" }
            : { color: "var(--muted-foreground)" }
          }
          onClick={() => setActiveTab("domain")}
        >
          <BookOpen className="w-3.5 h-3.5 inline mr-1.5" />
          ドメイン知識 ({filteredDomain.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === "cases" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs p-3 rounded-lg" style={{ background: "oklch(0.52 0.22 258 / 0.08)", color: "oklch(0.40 0.12 258)" }}>
            <Info className="w-3.5 h-3.5 flex-shrink-0" />
            スコアは提案の成功確率を示します。類似規模の自治体への横展開に活用してください。カードをクリックで詳細表示。
          </div>
          {filteredCases.map(item => (
            <KnowledgeCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {activeTab === "domain" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs p-3 rounded-lg" style={{ background: "oklch(0.70 0.18 45 / 0.08)", color: "oklch(0.45 0.15 45)" }}>
            <Info className="w-3.5 h-3.5 flex-shrink-0" />
            自治体ビジネス特有の制度・慣習・タイミングに関する基礎知識です。カードをクリックで詳細表示。
          </div>
          {filteredDomain.map((item, i) => (
            <DomainCard key={i} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
