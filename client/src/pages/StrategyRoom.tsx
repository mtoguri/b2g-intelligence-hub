// ============================================================
// StrategyRoom.tsx — B2G Intelligence Hub
// AI戦略室（壁打ち機能）
// Gemini 2.5 Flash API — APIキーは管理者設定済み
// ============================================================

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  MessageSquareMore, Send, Sparkles, Building2,
  Target, RotateCcw, Copy,
  Loader2, Info,
} from "lucide-react";
import { toast } from "sonner";
import { councilKeywords, scoringWeights } from "@/lib/mockData";

// ============================================================
// Gemini API設定（管理者設定済み）
// ============================================================
const GEMINI_API_KEY = "AIzaSyAJ-jnn_-_nnNZzAuCcGgSlKfAhO1fA8nQ";
const GEMINI_MODEL = "gemini-2.5-flash-preview-04-17";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface CompanyProfile {
  name: string;
  strengths: string;
  products: string;
  targetMunicipality: string;
  targetCategory: string;
}



function ScoreDisplay({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-14 h-14">
        <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
          <circle cx="28" cy="28" r="22" fill="none" stroke="oklch(0.90 0.008 247)" strokeWidth="4" />
          <circle
            cx="28" cy="28" r="22" fill="none"
            stroke={color} strokeWidth="4"
            strokeDasharray={`${2 * Math.PI * 22}`}
            strokeDashoffset={`${2 * Math.PI * 22 * (1 - value / 100)}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s ease-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold font-mono-data" style={{ color }}>{value}</span>
        </div>
      </div>
      <span className="text-xs text-center" style={{ color: "var(--muted-foreground)" }}>{label}</span>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
        style={
          isUser
            ? { background: "oklch(0.35 0.10 245)", color: "white" }
            : { background: "linear-gradient(135deg, oklch(0.52 0.22 258), oklch(0.42 0.22 258))", color: "white" }
        }
      >
        {isUser ? "営" : <Sparkles className="w-4 h-4" />}
      </div>
      <div className={`max-w-[80%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
        <div
          className="px-4 py-3 rounded-xl text-sm leading-relaxed whitespace-pre-wrap"
          style={
            isUser
              ? { background: "oklch(0.35 0.10 245)", color: "white", borderRadius: "12px 12px 4px 12px" }
              : { background: "var(--card)", color: "var(--foreground)", border: "1px solid var(--border)", borderRadius: "12px 12px 12px 4px" }
          }
        >
          {message.content}
        </div>
        <span className="text-xs px-1" style={{ color: "var(--muted-foreground)" }}>
          {message.timestamp.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
}

export default function StrategyRoom() {
  const [profile, setProfile] = useState<CompanyProfile>({
    name: "",
    strengths: "",
    products: "",
    targetMunicipality: "",
    targetCategory: "",
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [scores, setScores] = useState({ demand: 0, match: 0, overall: 0 });
  const [profileSubmitted, setProfileSubmitted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const calculateScores = () => {
    const keywords = councilKeywords[profile.targetMunicipality as keyof typeof councilKeywords] || [];
    const productWords = profile.products.split(/[、,\s]+/);
    const matchCount = keywords.filter(kw =>
      productWords.some(pw => pw.includes(kw) || kw.includes(pw))
    ).length;
    const matchScore = Math.min(95, 50 + matchCount * 15 + (profile.strengths.length > 50 ? 10 : 0));
    const demandScore = Math.min(95,
      60 + (profile.targetCategory === "DX推進" ? 25
        : profile.targetCategory === "脱炭素・環境" ? 20
        : 15)
    );
    const overall = Math.round(
      (matchScore * scoringWeights.productMatch + demandScore * scoringWeights.councilFrequency) * 2.5
    );
    setScores({ demand: demandScore, match: matchScore, overall: Math.min(95, overall) });
  };

  const handleProfileSubmit = () => {
    if (!profile.name || !profile.strengths || !profile.targetMunicipality || !profile.targetCategory) {
      toast.error("必須項目をすべて入力してください");
      return;
    }
    calculateScores();
    setProfileSubmitted(true);
    const keywords = councilKeywords[profile.targetMunicipality as keyof typeof councilKeywords] || [];
    const welcomeMsg: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: `プロフィールを受け取りました。${profile.targetMunicipality}への提案戦略を分析します。\n\n📊 **議会キーワード分析**\n${profile.targetMunicipality}の直近の議会では「${keywords.slice(0, 3).join("」「")}」といったテーマが頻出しています。\n\n💡 **初期アドバイス**\n${profile.products || "貴社製品・サービス"}の強みを「${keywords[0]}」という文脈で語ることで、担当課長の関心を引きやすくなります。\n\n具体的な提案骨子を作成しますか？「提案骨子を作って」と入力してください。`,
      timestamp: new Date(),
    };
    setMessages([welcomeMsg]);
  };

  const callGeminiAPI = async (userMessage: string): Promise<string> => {
    const systemContext = `あなたは自治体向けB2G営業の専門家AIです。以下の企業プロフィールを踏まえて、具体的で実践的な営業支援を行ってください。

企業名: ${profile.name}
自社の強み: ${profile.strengths}
製品・サービス: ${profile.products}
ターゲット自治体: ${profile.targetMunicipality}
ターゲット分野: ${profile.targetCategory}
議会キーワード: ${(councilKeywords[profile.targetMunicipality as keyof typeof councilKeywords] || []).join("、")}

回答は日本語で、具体的かつ実践的に。提案骨子・トークスクリプト・想定Q&Aなど営業に直結する内容を提供してください。`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: systemContext + "\n\n" + userMessage }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || "API呼び出しに失敗しました");
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "応答を取得できませんでした";
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const aiResponse = await callGeminiAPI(inputMessage);
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `⚠️ エラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}\n\nしばらく待ってから再度お試しください。`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
      toast.error("AI応答の取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    "提案骨子を3点で作って",
    "想定Q&Aを5問作って",
    "刺さるトークスクリプトを作って",
    "競合との差別化ポイントは？",
    "予算化のタイミングを教えて",
  ];

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>AI戦略室（壁打ち）</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          自社情報とターゲット自治体を入力し、Gemini AIと提案戦略を構築します
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Profile & Scores */}
        <div className="space-y-4">
          {/* Company Profile Form */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                自社プロフィール入力
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "var(--muted-foreground)" }}>
                  企業名 <span style={{ color: "oklch(0.577 0.245 27)" }}>*</span>
                </label>
                <Input
                  placeholder="例：株式会社テックソリューション"
                  value={profile.name}
                  onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                  className="text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "var(--muted-foreground)" }}>
                  自社の強み・実績 <span style={{ color: "oklch(0.577 0.245 27)" }}>*</span>
                </label>
                <Textarea
                  placeholder="例：官公庁向けシステム開発10年の実績。ISO27001取得。全国50自治体への導入経験あり。"
                  value={profile.strengths}
                  onChange={e => setProfile(p => ({ ...p, strengths: e.target.value }))}
                  className="text-sm min-h-20"
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "var(--muted-foreground)" }}>
                  製品・サービス
                </label>
                <Textarea
                  placeholder="例：行政手続きオンライン化システム、AIチャットボット、電子申請プラットフォーム"
                  value={profile.products}
                  onChange={e => setProfile(p => ({ ...p, products: e.target.value }))}
                  className="text-sm min-h-16"
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "var(--muted-foreground)" }}>
                  ターゲット自治体 <span style={{ color: "oklch(0.577 0.245 27)" }}>*</span>
                </label>
                <Input
                  className="text-sm"
                  placeholder="例：横浜市、大阪府、北海道庁など"
                  value={profile.targetMunicipality}
                  onChange={e => setProfile(p => ({ ...p, targetMunicipality: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "var(--muted-foreground)" }}>
                  ターゲット分野 <span style={{ color: "oklch(0.577 0.245 27)" }}>*</span>
                </label>
                <Input
                  className="text-sm"
                  placeholder="例：DX推進、脱炭素、防災システム、子育て支援など"
                  value={profile.targetCategory}
                  onChange={e => setProfile(p => ({ ...p, targetCategory: e.target.value }))}
                />
              </div>
              <Button
                className="w-full text-sm"
                style={{ background: "oklch(0.35 0.10 245)", color: "white" }}
                onClick={handleProfileSubmit}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                分析開始
              </Button>
            </CardContent>
          </Card>

          {/* Score Display */}
          {profileSubmitted && (
            <Card className="shadow-sm card-accent-blue">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  提案刺さり度スコア
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-around py-2">
                  <ScoreDisplay label="需要スコア" value={scores.demand} color="oklch(0.52 0.22 258)" />
                  <ScoreDisplay label="適合スコア" value={scores.match} color="oklch(0.70 0.18 45)" />
                  <ScoreDisplay label="総合スコア" value={scores.overall} color="oklch(0.55 0.20 300)" />
                </div>
                <div className="mt-3 p-2 rounded text-xs" style={{ background: "oklch(0.52 0.22 258 / 0.08)", color: "oklch(0.40 0.12 258)" }}>
                  <Info className="w-3 h-3 inline mr-1" />
                  Score = (重要度 × 文脈適合度) の積算モデルで算出
                </div>
                {profile.targetMunicipality && (
                  <div className="mt-3">
                    <div className="text-xs font-medium mb-2" style={{ color: "var(--muted-foreground)" }}>
                      {profile.targetMunicipality}の議会キーワード
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {(councilKeywords[profile.targetMunicipality as keyof typeof councilKeywords] || []).map(kw => (
                        <Badge key={kw} className="text-xs" style={{ background: "oklch(0.35 0.10 245 / 0.12)", color: "oklch(0.35 0.10 245)", border: "none" }}>
                          {kw}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Chat Interface */}
        <div className="lg:col-span-2 flex flex-col" style={{ minHeight: "600px" }}>
          <Card className="shadow-sm flex flex-col flex-1">
            <CardHeader className="pb-3 border-b" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <MessageSquareMore className="w-4 h-4" style={{ color: "oklch(0.52 0.22 258)" }} />
                  AI戦略アドバイザー
                  <Badge className="text-xs" style={{ background: "oklch(0.52 0.22 258 / 0.15)", color: "oklch(0.42 0.22 258)", border: "none" }}>
                    Gemini 2.5 Flash
                  </Badge>
                  <Badge className="text-xs" style={{ background: "oklch(0.65 0.18 145 / 0.15)", color: "oklch(0.45 0.18 145)", border: "none" }}>
                    接続済み
                  </Badge>
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => {
                    const text = messages.map(m => `${m.role === "user" ? "営業担当" : "AI"}: ${m.content}`).join("\n\n");
                    navigator.clipboard.writeText(text);
                    toast.success("会話をコピーしました");
                  }}>
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setMessages([])}>
                    <RotateCcw className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ minHeight: "400px", maxHeight: "500px" }}>
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: "linear-gradient(135deg, oklch(0.52 0.22 258 / 0.15), oklch(0.35 0.10 245 / 0.15))" }}
                  >
                    <Sparkles className="w-8 h-8" style={{ color: "oklch(0.52 0.22 258)" }} />
                  </div>
                  <h3 className="text-base font-semibold mb-2" style={{ color: "var(--foreground)" }}>
                    AI戦略アドバイザーへようこそ
                  </h3>
                  <p className="text-sm max-w-sm" style={{ color: "var(--muted-foreground)" }}>
                    左のフォームに自社情報とターゲット自治体を入力し、「分析開始」を押すと、AIが議会キーワードと予算背景を分析して提案戦略を構築します。
                  </p>
                </div>
              )}
              {messages.map(msg => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, oklch(0.52 0.22 258), oklch(0.42 0.22 258))" }}
                  >
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="px-4 py-3 rounded-xl flex items-center gap-2" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                    <Loader2 className="w-4 h-4 animate-spin" style={{ color: "oklch(0.52 0.22 258)" }} />
                    <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>分析中...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            {profileSubmitted && (
              <div className="px-4 py-2 border-t flex gap-2 overflow-x-auto" style={{ borderColor: "var(--border)" }}>
                {quickPrompts.map(prompt => (
                  <button
                    key={prompt}
                    className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full transition-colors"
                    style={{ background: "var(--muted)", color: "var(--muted-foreground)", border: "1px solid var(--border)" }}
                    onClick={() => setInputMessage(prompt)}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t" style={{ borderColor: "var(--border)" }}>
              <div className="flex gap-2">
                <Input
                  placeholder={profileSubmitted ? "提案骨子を作って、Q&Aを作成して、など..." : "先に自社プロフィールを入力してください"}
                  value={inputMessage}
                  onChange={e => setInputMessage(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={!profileSubmitted || isLoading}
                  className="text-sm flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!profileSubmitted || isLoading || !inputMessage.trim()}
                  style={{ background: "oklch(0.35 0.10 245)", color: "white" }}
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
