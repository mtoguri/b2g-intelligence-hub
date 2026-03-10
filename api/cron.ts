import { runSyncBatch } from "../server/scheduler.js";

// Vercel Serverless Function handler for Cron Jobs
export default async function handler(req: any, res: any) {
    // Verify that the request came from Vercel Cron
    const authHeader = req.headers.authorization;
    if (
        process.env.VERCEL &&
        process.env.CRON_SECRET &&
        authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        await runSyncBatch();
        res.status(200).json({ success: true, message: "Sync batch completed" });
    } catch (err: any) {
        console.error("Cron Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
}
