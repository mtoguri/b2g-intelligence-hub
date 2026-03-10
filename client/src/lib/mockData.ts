// ============================================================
// B2G Intelligence Hub — Mock Data
// 自治体営業支援のためのサンプルデータ
// ============================================================

export interface TenderItem {
  id: string;
  title: string;
  municipality: string;
  prefecture: string;
  category: string;
  budget: number;
  deadline: string;
  publishedAt: string;
  status: "公告中" | "受付終了" | "落札済み";
  demandScore: number;
  matchScore: number;
  tags: string[];
  description: string;
}

export interface BudgetItem {
  municipality: string;
  prefecture: string;
  category: string;
  amount: number;
  change: number;
  year: number;
}

export interface KnowledgeItem {
  id: string;
  title: string;
  municipality: string;
  category: string;
  summary: string;
  tags: string[];
  successScore: number;
  date: string;
  population: number;
}

export interface PersonnelChange {
  id: string;
  name: string;
  municipality: string;
  newPosition: string;
  oldPosition: string;
  date: string;
  importance: "高" | "中" | "低";
}

// 入札案件データ
export const tenderItems: TenderItem[] = [
  {
    id: "T001",
    title: "行政手続きオンライン化推進業務委託",
    municipality: "横浜市",
    prefecture: "神奈川県",
    category: "DX推進",
    budget: 45000000,
    deadline: "2026-03-25",
    publishedAt: "2026-03-01",
    status: "公告中",
    demandScore: 92,
    matchScore: 88,
    tags: ["DX", "電子申請", "住民サービス"],
    description: "市民向け行政手続きのデジタル化を推進するシステム構築および運用管理業務。マイナポータル連携対応必須。"
  },
  {
    id: "T002",
    title: "脱炭素社会実現に向けた省エネ診断業務",
    municipality: "名古屋市",
    prefecture: "愛知県",
    category: "脱炭素・環境",
    budget: 12000000,
    deadline: "2026-03-30",
    publishedAt: "2026-03-05",
    status: "公告中",
    demandScore: 78,
    matchScore: 65,
    tags: ["脱炭素", "省エネ", "環境"],
    description: "市有施設における省エネルギー診断および改善提案業務。2030年カーボンニュートラル目標に向けた取り組み。"
  },
  {
    id: "T003",
    title: "防災情報システム更新・保守業務",
    municipality: "仙台市",
    prefecture: "宮城県",
    category: "防災・安全",
    budget: 28000000,
    deadline: "2026-04-10",
    publishedAt: "2026-03-08",
    status: "公告中",
    demandScore: 85,
    matchScore: 72,
    tags: ["防災", "情報システム", "緊急対応"],
    description: "既存防災情報システムのリプレース及び5年間の保守管理業務。J-ALERTとの連携機能強化が求められる。"
  },
  {
    id: "T004",
    title: "子育て支援アプリ開発・運用業務",
    municipality: "福岡市",
    prefecture: "福岡県",
    category: "子育て・福祉",
    budget: 18500000,
    deadline: "2026-04-15",
    publishedAt: "2026-03-10",
    status: "公告中",
    demandScore: 81,
    matchScore: 90,
    tags: ["子育て", "アプリ開発", "住民サービス"],
    description: "子育て世帯向けスマートフォンアプリの開発および3年間の運用保守。保育所検索・申請機能を含む。"
  },
  {
    id: "T005",
    title: "AIを活用した道路損傷検知システム導入",
    municipality: "札幌市",
    prefecture: "北海道",
    category: "インフラ管理",
    budget: 35000000,
    deadline: "2026-04-20",
    publishedAt: "2026-03-12",
    status: "公告中",
    demandScore: 88,
    matchScore: 76,
    tags: ["AI", "インフラ", "道路管理"],
    description: "ドローンおよびカメラ映像をAI解析し、道路損傷を自動検知するシステムの導入。維持管理コスト削減が目的。"
  },
  {
    id: "T006",
    title: "高齢者見守りサービス実証実験業務",
    municipality: "京都市",
    prefecture: "京都府",
    category: "高齢者・福祉",
    budget: 8000000,
    deadline: "2026-04-05",
    publishedAt: "2026-03-03",
    status: "受付終了",
    demandScore: 74,
    matchScore: 68,
    tags: ["高齢者", "IoT", "見守り"],
    description: "IoTセンサーを活用した独居高齢者の見守りサービスの実証実験。6ヶ月間の試験運用を含む。"
  },
  {
    id: "T007",
    title: "図書館システム更新業務",
    municipality: "川崎市",
    prefecture: "神奈川県",
    category: "教育・文化",
    budget: 22000000,
    deadline: "2026-03-20",
    publishedAt: "2026-02-20",
    status: "落札済み",
    demandScore: 62,
    matchScore: 55,
    tags: ["図書館", "システム更新", "教育"],
    description: "市立図書館の蔵書管理・貸出システムのリプレース。電子書籍サービスとの連携機能を含む。"
  },
  {
    id: "T008",
    title: "GIS活用都市計画支援システム構築",
    municipality: "大阪市",
    prefecture: "大阪府",
    category: "都市計画・GIS",
    budget: 52000000,
    deadline: "2026-05-01",
    publishedAt: "2026-03-15",
    status: "公告中",
    demandScore: 95,
    matchScore: 82,
    tags: ["GIS", "都市計画", "データ分析"],
    description: "地理情報システムを活用した都市計画立案支援システムの構築。3D都市モデル（PLATEAU）との連携を想定。"
  }
];

// 予算推移データ（グラフ用）
export const budgetTrendData = [
  { year: "2021", DX推進: 280, 防災安全: 320, 脱炭素: 120, 子育て福祉: 450, インフラ: 380 },
  { year: "2022", DX推進: 380, 防災安全: 310, 脱炭素: 180, 子育て福祉: 470, インフラ: 360 },
  { year: "2023", DX推進: 520, 防災安全: 350, 脱炭素: 260, 子育て福祉: 490, インフラ: 340 },
  { year: "2024", DX推進: 680, 防災安全: 380, 脱炭素: 340, 子育て福祉: 510, インフラ: 370 },
  { year: "2025", DX推進: 820, 防災安全: 420, 脱炭素: 450, 子育て福祉: 530, インフラ: 390 },
  { year: "2026", DX推進: 950, 防災安全: 460, 脱炭素: 580, 子育て福祉: 560, インフラ: 410 },
];

// カテゴリ別市場シェア
export const categoryShareData = [
  { name: "DX推進", value: 28, color: "#2563eb" },
  { name: "防災・安全", value: 18, color: "#1e3a5f" },
  { name: "子育て・福祉", value: 22, color: "#16a34a" },
  { name: "脱炭素・環境", value: 15, color: "#0891b2" },
  { name: "インフラ管理", value: 12, color: "#7c3aed" },
  { name: "その他", value: 5, color: "#94a3b8" },
];

// KPIデータ
export const kpiData = {
  activeTenders: 247,
  activeTendersChange: +18,
  totalBudget: 1240,
  totalBudgetChange: +12.4,
  targetMunicipalities: 38,
  targetMunicipalitiesChange: +5,
  avgMatchScore: 76,
  avgMatchScoreChange: +3.2,
};

// 人事異動データ
export const personnelChanges: PersonnelChange[] = [
  {
    id: "P001",
    name: "田中 誠一",
    municipality: "横浜市",
    newPosition: "DX推進局 局長",
    oldPosition: "総務局 次長",
    date: "2026-04-01",
    importance: "高"
  },
  {
    id: "P002",
    name: "佐藤 美咲",
    municipality: "名古屋市",
    newPosition: "環境局 脱炭素推進課 課長",
    oldPosition: "企画局 政策推進課 係長",
    date: "2026-04-01",
    importance: "高"
  },
  {
    id: "P003",
    name: "鈴木 健太",
    municipality: "福岡市",
    newPosition: "こども局 保育・子育て支援課 課長",
    oldPosition: "市民局 区政課 課長補佐",
    date: "2026-04-01",
    importance: "中"
  },
  {
    id: "P004",
    name: "山田 洋子",
    municipality: "札幌市",
    newPosition: "建設局 道路管理部 部長",
    oldPosition: "建設局 道路管理部 次長",
    date: "2026-04-01",
    importance: "中"
  },
  {
    id: "P005",
    name: "伊藤 浩二",
    municipality: "仙台市",
    newPosition: "危機管理局 防災計画課 課長",
    oldPosition: "消防局 予防課 課長",
    date: "2026-04-01",
    importance: "高"
  }
];

// ナレッジベース（成功事例）
export const knowledgeItems: KnowledgeItem[] = [
  {
    id: "K001",
    title: "電子申請システム導入による窓口業務削減事例",
    municipality: "さいたま市",
    category: "DX推進",
    summary: "住民票・印鑑証明等のオンライン申請システム導入により、窓口来庁者数を年間約30%削減。導入後1年でコスト回収を達成。提案時のポイントは「職員負担軽減」と「住民満足度向上」の両立を数値で示したこと。",
    tags: ["DX", "電子申請", "業務効率化"],
    successScore: 94,
    date: "2025-08-15",
    population: 1340000
  },
  {
    id: "K002",
    title: "防災IoTセンサーネットワーク構築事例",
    municipality: "浜松市",
    category: "防災・安全",
    summary: "河川氾濫リスクの高い地域へのIoTセンサー設置と、リアルタイム監視ダッシュボードの構築。議会での防災強化要求を背景に、首長の強いコミットメントを得て予算化。類似規模自治体への横展開が容易な事例。",
    tags: ["防災", "IoT", "リアルタイム監視"],
    successScore: 88,
    date: "2025-06-20",
    population: 790000
  },
  {
    id: "K003",
    title: "AIチャットボットによる住民問い合わせ対応自動化",
    municipality: "千葉市",
    category: "DX推進",
    summary: "24時間対応のAIチャットボット導入により、コールセンターへの問い合わせ件数を約40%削減。導入コストの低さと即効性が評価され、6ヶ月の実証実験から本格導入へ移行。",
    tags: ["AI", "チャットボット", "住民対応"],
    successScore: 91,
    date: "2025-11-10",
    population: 980000
  },
  {
    id: "K004",
    title: "再生可能エネルギー導入による市有施設の電力コスト削減",
    municipality: "熊本市",
    category: "脱炭素・環境",
    summary: "市有施設への太陽光パネル設置とPPA（電力購入契約）モデルの採用により、初期投資ゼロで電力コストを15%削減。2030年カーボンニュートラル宣言との整合性を前面に出した提案が奏功。",
    tags: ["脱炭素", "再生可能エネルギー", "PPA"],
    successScore: 85,
    date: "2025-09-05",
    population: 740000
  },
  {
    id: "K005",
    title: "子育て支援統合アプリによる保護者満足度向上",
    municipality: "川口市",
    category: "子育て・福祉",
    summary: "保育所申請・学童保育・子育て情報を一元化したスマートフォンアプリの導入。子育て世帯の転入促進施策と連動させた提案が評価された。アプリ利用率は対象世帯の68%に到達。",
    tags: ["子育て", "アプリ", "転入促進"],
    successScore: 89,
    date: "2025-07-22",
    population: 600000
  },
  {
    id: "K006",
    title: "GISシステム導入による道路・橋梁老朽化対策の導入事例",
    municipality: "富山市",
    category: "インフラ管理",
    summary: "市内全道路・橋梁のGISデータ化と点検履歴管理システムを導入。老朽化対策の優先順位付けを自動化し、年間修繕費を約15%削減。国土交通省のインフラ長寿命化交付金を活用した提案が成功の鍵。",
    tags: ["GIS", "インフラ", "老朽化対策"],
    successScore: 82,
    date: "2025-10-03",
    population: 410000
  },
  {
    id: "K007",
    title: "高齢者見守りサービスへのIoTセンサー活用事例",
    municipality: "長野市",
    category: "高齢者・福祉",
    summary: "独居高齢者宅への生活リズムセンサー設置と異常検知システムの導入。孤独死防止を議会で繰り返し要求されていた議員の賛同を得て予算化。導入後の経済効果分析を提案時に一体化したことが差別化要因。",
    tags: ["IoT", "高齢者見守り", "孤独死防止"],
    successScore: 87,
    date: "2025-05-18",
    population: 370000
  },
  {
    id: "K008",
    title: "議会・審議資料のAI自動生成システム導入事例",
    municipality: "宮崎市",
    category: "DX推進",
    summary: "議会資料作成に要する職員の時間を年間約800時間削減。AIが過去の議会資料を学習し、質問内容に応じた資料を自動生成。議会事務局の負担軽減を前面に出した提案が導入の決め手に。",
    tags: ["AI", "議会支援", "業務効率化"],
    successScore: 90,
    date: "2025-12-01",
    population: 400000
  },
  {
    id: "K009",
    title: "ベトナム市場開拓支援システムによる地域産業活性化事例",
    municipality: "鹿児島市",
    category: "産業振興",
    summary: "地元中小企業の海外展示会参加・商談マッチングを支援するプラットフォームを導入。市の産業政策と連動し、国際展開沿市村への横展開を導いた。輸出促進予算との整合性を設計段階から意識した提案。",
    tags: ["産業振興", "輸出支援", "プラットフォーム"],
    successScore: 83,
    date: "2025-04-10",
    population: 590000
  },
  {
    id: "K010",
    title: "水道パイプ老朽化モニタリングシステム導入事例",
    municipality: "岐阜市",
    category: "インフラ管理",
    summary: "市内水道管渠のIoTセンサーによるリアルタイム漏水検知システムを導入。年間漏水損失を約20%削減。小規模自治体でも導入可能なサブスクリプション型料金体系を提案したことが成功要因。",
    tags: ["水道", "IoT", "老朽化対策"],
    successScore: 86,
    date: "2025-08-29",
    population: 190000
  },
  {
    id: "K011",
    title: "小中学校へのタブレット・クラウド導入による教育DX事例",
    municipality: "広島市",
    category: "教育・DX",
    summary: "市内全公立小中学校への1人1台タブレット配布とクラウド型学習管理システムの導入。GIGAスクール構想の要件を満たしつつ、教員のデジタルリテラシー向上研修をセットで提案。",
    tags: ["GIGAスクール", "教育DX", "タブレット"],
    successScore: 92,
    date: "2025-03-15",
    population: 1200000
  },
  {
    id: "K012",
    title: "スマート農業支援システムによる農家所得向上事例",
    municipality: "帯広市",
    category: "産業振興",
    summary: "ドローン・センサーを用いた生育データ収集とAIによる収穫予測システムを導入。参加農家の平均所得が18%向上。農林水産省のスマート農業事業と連携した複合提案が導入決定の分水嶺に。",
    tags: ["スマート農業", "ドローン", "AI"],
    successScore: 80,
    date: "2025-06-05",
    population: 160000
  },
  {
    id: "K013",
    title: "行政文書電子化によるペーパーレス推進事例",
    municipality: "相模市",
    category: "DX推進",
    summary: "内部文書・申請書類の電子化により年間印刷コストを約千万円削減。電子入札システムと連携し、入札標準記載減を実現。デジタル庁市町村推進計画との整合性を設計段階から意識した提案。",
    tags: ["ペーパーレス", "電子入札", "行政文書"],
    successScore: 88,
    date: "2025-09-20",
    population: 220000
  },
  {
    id: "K014",
    title: "公共施設のエネルギーマネジメントシステム導入事例",
    municipality: "大分市",
    category: "脱炭素・環境",
    summary: "市内公共施設のエネルギー使用量をリアルタイム監視し、AIによる異常検知・最適化を実現。年間エネルギーコストを約12%削減。カーボンニュートラル宣言自治体への提案に有効。",
    tags: ["エネルギー管理", "脱炭素", "AI最適化"],
    successScore: 84,
    date: "2025-11-25",
    population: 480000
  },
  {
    id: "K015",
    title: "観光DXによる外国人観光客向け情報発信システム導入事例",
    municipality: "金沢市",
    category: "観光・地域振興",
    summary: "多言語対応のAI翻訳機能付き観光情報発信システムを導入。外国人観光客数が前年比135%に増加。観光庁のインバウンド強化施策と連動した提案が導入の決め手に。",
    tags: ["観光DX", "多言語対応", "インバウンド"],
    successScore: 81,
    date: "2025-10-15",
    population: 460000
  }
];

// 議会議事録キーワード（壁打ち機能用）
export const councilKeywords = {
  横浜市: ["DX推進", "行政効率化", "デジタル格差", "マイナンバー活用", "スマートシティ"],
  名古屋市: ["脱炭素", "カーボンニュートラル", "省エネ", "EV普及", "環境教育"],
  仙台市: ["防災強化", "復興", "地域コミュニティ", "避難所整備", "情報伝達"],
  福岡市: ["子育て支援", "少子化対策", "保育士不足", "待機児童", "移住促進"],
  札幌市: ["インフラ老朽化", "除雪DX", "観光DX", "人口減少", "地域経済"],
};

// 提案スコアリングモデル用データ
export const scoringWeights = {
  budgetSize: 0.25,
  councilFrequency: 0.30,
  productMatch: 0.25,
  competitorPresence: 0.10,
  personnelTiming: 0.10,
};
