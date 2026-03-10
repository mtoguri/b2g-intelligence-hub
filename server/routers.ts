import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  fetchKkjTenders,
  logFetch,
  syncTendersToDb,
  getLastSyncStatus,
  PREFECTURE_CODES,
} from "./kkjApi";
import {
  searchTenders,
  getTenderStats,
  getRecentPersonnelChanges,
  getRecentFetchLogs,
} from "./db";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  tenders: router({
    // DB内の案件を検索（フィルター付き）
    search: publicProcedure
      .input(
        z.object({
          keyword: z.string().optional(),
          prefecture: z.string().optional(),
          category: z.string().optional(),
          status: z.string().optional(),
          limit: z.number().min(1).max(1000).default(100),
          offset: z.number().min(0).default(0),
        })
      )
      .query(async ({ input }) => {
        return await searchTenders(input);
      }),

    // 統計情報（ダッシュボード用）
    stats: publicProcedure.query(async () => {
      return await getTenderStats();
    }),

    // 最終同期ステータス
    syncStatus: publicProcedure.query(async () => {
      return await getLastSyncStatus();
    }),

    // 最近のフェッチログ
    fetchLogs: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(20).default(5) }))
      .query(async ({ input }) => {
        return await getRecentFetchLogs(input.limit);
      }),

    // 官公需APIから手動同期（リアルタイム取得）
    syncFromKkj: publicProcedure
      .input(
        z.object({
          query: z.string().optional().default(""),
          lgCodes: z.array(z.string()).optional(),
          category: z.string().optional(),
          count: z.number().min(1).max(1000).default(100),
        })
      )
      .mutation(async ({ input }) => {
        const startTime = Date.now();
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);
        const dateFrom = thirtyDaysAgo.toISOString().split("T")[0];

        const searchParams = {
          query: input.query || "入札",
          lgCode: input.lgCodes?.length ? input.lgCodes : undefined,
          category: input.category || undefined,
          count: input.count,
          cftIssueDate: `${dateFrom}/`,
        };

        const result = await fetchKkjTenders(searchParams);

        if (result.error) {
          await logFetch({
            source: "kkj",
            status: "error",
            recordsFetched: 0,
            recordsInserted: 0,
            recordsUpdated: 0,
            errorMessage: result.error,
          });
          return {
            success: false,
            error: result.error,
            hits: 0,
            inserted: 0,
            updated: 0,
            durationMs: Date.now() - startTime,
          };
        }

        const { inserted, updated } = await syncTendersToDb(result.tenders);

        await logFetch({
          source: "kkj",
          status: "success",
          recordsFetched: result.hits,
          recordsInserted: inserted,
          recordsUpdated: updated,
        });

        return {
          success: true,
          hits: result.hits,
          inserted,
          updated,
          durationMs: Date.now() - startTime,
        };
      }),

    // 都道府県コード一覧（フロントエンド用）
    prefectures: publicProcedure.query(() => {
      return Object.entries(PREFECTURE_CODES).map(([code, name]) => ({ code, name }));
    }),

    // Gemini APIで案件概要を要約
    summarize: publicProcedure
      .input(
        z.object({
          tenderId: z.number(),
          title: z.string(),
          description: z.string(),
          category: z.string(),
          municipality: z.string().optional(),
          prefecture: z.string().optional(),
          sourceUrl: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const GEMINI_API_KEY = "AIzaSyAJ-jnn_-_nnNZzAuCcGgSlKfAhO1fA8nQ";
        const GEMINI_MODEL = "gemini-2.5-flash-preview-04-17";

        // 元案件ページのHTMLを取得してテキスト抽出
        let pageText = "";
        let pageSource = "公告文";
        if (input.sourceUrl) {
          try {
            const cleanUrl = input.sourceUrl.replace(/<\!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1').trim();
            const urlObj = new URL(cleanUrl);
            if (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') {
              const pageRes = await fetch(cleanUrl, {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (compatible; B2G-Intelligence-Bot/1.0)',
                  'Accept': 'text/html,application/xhtml+xml',
                  'Accept-Language': 'ja,en;q=0.9',
                },
                signal: AbortSignal.timeout(10000),
              });
              if (pageRes.ok) {
                const html = await pageRes.text();
                // HTMLタグを除去してテキストを抽出
                const stripped = html
                  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
                  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
                  .replace(/<[^>]+>/g, ' ')
                  .replace(/&nbsp;/g, ' ')
                  .replace(/&amp;/g, '&')
                  .replace(/&lt;/g, '<')
                  .replace(/&gt;/g, '>')
                  .replace(/&quot;/g, '"')
                  .replace(/\s+/g, ' ')
                  .trim();
                // 最大4000文字に制限
                pageText = stripped.substring(0, 4000);
                pageSource = "元案件ページ";
              }
            }
          } catch {
            // ページ取得失敗時は公告文にフォールバック
          }
        }

        // ページテキストが取れなかった場合は公告文を使用
        const contentToSummarize = pageText || input.description;

        const prompt = `以下は入札案件の${pageSource}です。営業担当者向けに要点を整理してください。

案件名: ${input.title}
発注機関: ${input.municipality ?? ""}（${input.prefecture ?? ""}）
カテゴリ: ${input.category}

${pageSource}の内容:
${contentToSummarize}

以下の形式でJSON形式のみで回答してください（マークダウン・コードブロック不要）:
{
  "summary": "案件の一言要約（40文字以内）",
  "points": [
    "要点1: 案件の具体的な内容・目的",
    "要点2: 契約期間・納期限などの条件",
    "要点3: 参加資格・必要な実績・注意事項"
  ],
  "contractType": "契約形態（単価契約/総価契約/委託/その他）",
  "estimatedScale": "規模感（大規模/中規模/小規模）",
  "dataSource": "${pageSource}"
}`;

        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.2, maxOutputTokens: 600 },
              }),
            }
          );

          if (!response.ok) {
            return { success: false, error: `API error: ${response.status}` };
          }

          const data = await response.json() as {
            candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
          };
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

          // JSONを抽出
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (!jsonMatch) return { success: false, error: "JSON parse failed" };

          const parsed = JSON.parse(jsonMatch[0]) as {
            summary: string;
            points: string[];
            contractType: string;
            estimatedScale: string;
            dataSource: string;
          };
          return { success: true, ...parsed };
        } catch (err) {
          return { success: false, error: String(err) };
        }
      }),
  }),

  personnel: router({
    recent: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(50).default(10) }))
      .query(async ({ input }) => {
        return await getRecentPersonnelChanges(input.limit);
      }),
  }),
});

export type AppRouter = typeof appRouter;
