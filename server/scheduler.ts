/**
 * 自動更新スケジューラ
 * 官公需情報ポータルAPIから30分ごとに最新案件を取得してDBに保存する
 */

import { fetchKkjTenders, logFetch, syncTendersToDb } from "./kkjApi";

const INTERVAL_MS = 30 * 60 * 1000; // 30分

// 主要都道府県コード（全国を複数回に分けて取得）
const PREFECTURE_BATCHES = [
  // 関東
  ["13", "14", "11", "12", "08", "09", "10"],
  // 近畿
  ["27", "28", "26", "29", "30", "25", "24"],
  // 東海・中部
  ["23", "22", "21", "20", "19", "15", "16", "17", "18"],
  // 九州・沖縄
  ["40", "41", "42", "43", "44", "45", "46", "47"],
  // 東北・北海道
  ["01", "02", "03", "04", "05", "06", "07"],
  // 中国・四国
  ["31", "32", "33", "34", "35", "36", "37", "38", "39"],
];

let currentBatchIndex = 0;
let isRunning = false;
let schedulerTimer: ReturnType<typeof setInterval> | null = null;
let lastRunAt: Date | null = null;
let nextRunAt: Date | null = null;

/**
 * 1バッチ分の同期を実行する
 */
export async function runSyncBatch(): Promise<void> {
  if (isRunning) {
    console.log("[Scheduler] Sync already in progress, skipping...");
    return;
  }

  isRunning = true;
  lastRunAt = new Date();
  const batch = PREFECTURE_BATCHES[currentBatchIndex];
  currentBatchIndex = (currentBatchIndex + 1) % PREFECTURE_BATCHES.length;

  console.log(`[Scheduler] Starting sync batch ${currentBatchIndex}/${PREFECTURE_BATCHES.length}, prefectures: ${batch?.join(",")}`);

  try {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    const dateFrom = thirtyDaysAgo.toISOString().split("T")[0];

    const result = await fetchKkjTenders({
      query: "入札",
      lgCode: batch,
      count: 200,
      cftIssueDate: `${dateFrom}/`,
    });

    if (result.error) {
      console.error(`[Scheduler] Fetch error: ${result.error}`);
      await logFetch({
        source: "kkj-scheduler",
        status: "error",
        recordsFetched: 0,
        recordsInserted: 0,
        recordsUpdated: 0,
        errorMessage: result.error,
      });
      return;
    }

    const { inserted, updated } = await syncTendersToDb(result.tenders);

    console.log(`[Scheduler] Sync complete: hits=${result.hits}, inserted=${inserted}, updated=${updated}`);

    await logFetch({
      source: "kkj-scheduler",
      status: "success",
      recordsFetched: result.hits,
      recordsInserted: inserted,
      recordsUpdated: updated,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[Scheduler] Unexpected error: ${message}`);
    await logFetch({
      source: "kkj-scheduler",
      status: "error",
      recordsFetched: 0,
      recordsInserted: 0,
      recordsUpdated: 0,
      errorMessage: message,
    });
  } finally {
    isRunning = false;
    nextRunAt = new Date(Date.now() + INTERVAL_MS);
  }
}

/**
 * スケジューラを開始する（サーバー起動時に呼び出す）
 */
export function startScheduler(): void {
  if (schedulerTimer) {
    console.log("[Scheduler] Already started");
    return;
  }

  console.log(`[Scheduler] Starting auto-sync every ${INTERVAL_MS / 60000} minutes`);

  // 起動時に1回即実行（5秒後）
  setTimeout(() => {
    runSyncBatch().catch(console.error);
  }, 5000);

  // 30分ごとに実行
  schedulerTimer = setInterval(() => {
    runSyncBatch().catch(console.error);
  }, INTERVAL_MS);

  nextRunAt = new Date(Date.now() + INTERVAL_MS);
}

/**
 * スケジューラを停止する
 */
export function stopScheduler(): void {
  if (schedulerTimer) {
    clearInterval(schedulerTimer);
    schedulerTimer = null;
    console.log("[Scheduler] Stopped");
  }
}

/**
 * スケジューラの状態を取得する
 */
export function getSchedulerStatus(): {
  isRunning: boolean;
  lastRunAt: Date | null;
  nextRunAt: Date | null;
  intervalMinutes: number;
} {
  return {
    isRunning,
    lastRunAt,
    nextRunAt,
    intervalMinutes: INTERVAL_MS / 60000,
  };
}
