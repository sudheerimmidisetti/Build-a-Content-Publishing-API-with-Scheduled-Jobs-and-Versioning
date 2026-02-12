require("dotenv").config();
const { Worker, Queue } = require("bullmq");
const IORedis = require("ioredis");
const pool = require("./config/db");

const connection = new IORedis({
  host: process.env.REDIS_HOST || "redis",
  port: 6379,
  maxRetriesPerRequest: null
});

const publishQueue = new Queue("publishQueue", { connection });

(async () => {
  await publishQueue.add(
    "checkScheduledPosts",
    {},
    {
      repeat: { every: 60000 },
      removeOnComplete: true
    }
  );
})();

const worker = new Worker(
  "publishQueue",
  async () => {
    console.log("Checking scheduled posts...");

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      await client.query(`
        UPDATE posts
        SET status='published',
            published_at=NOW()
        WHERE status='scheduled'
        AND scheduled_for <= NOW()
      `);

      await client.query("COMMIT");
      console.log("Scheduled posts updated");
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Worker error:", err.message);
    } finally {
      client.release();
    }
  },
  { connection }
);

console.log("🚀 Background worker started...");
