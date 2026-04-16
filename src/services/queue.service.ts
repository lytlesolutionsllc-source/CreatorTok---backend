import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { config } from '../config';
import { QUEUE_NAMES } from '../utils/constants';

// ─── Redis connection ─────────────────────────────────────────────────────────

let connection: IORedis | null = null;

function getConnection(): IORedis | null {
  if (!config.redisUrl) {
    return null;
  }
  if (!connection) {
    connection = new IORedis(config.redisUrl, {
      maxRetriesPerRequest: null,
    });
  }
  return connection;
}

// ─── Queues ───────────────────────────────────────────────────────────────────

function createQueue(name: string): Queue | null {
  const conn = getConnection();
  if (!conn) {
    console.warn(`[Queue] REDIS_URL not set — queue "${name}" is disabled`);
    return null;
  }
  try {
    return new Queue(name, {
      connection: conn,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: 100,
        removeOnFail: 200,
      },
    });
  } catch (err) {
    console.warn(`[Queue] Failed to create queue "${name}":`, err);
    return null;
  }
}

export const postSchedulerQueue: Queue | null = createQueue(QUEUE_NAMES.POST_SCHEDULER);
export const postPublisherQueue: Queue | null = createQueue(QUEUE_NAMES.POST_PUBLISHER);

// ─── Job helpers ──────────────────────────────────────────────────────────────

export interface SchedulePostJobData {
  postId: string;
  userId: string;
  tiktokAccountId: string;
  scheduledAt: string;
}

export async function addSchedulePostJob(data: SchedulePostJobData, delay: number): Promise<void> {
  if (!postSchedulerQueue) return;
  await postSchedulerQueue.add('schedule-post', data, { delay });
}

export async function addPublishPostJob(data: SchedulePostJobData): Promise<void> {
  if (!postPublisherQueue) return;
  await postPublisherQueue.add('publish-post', data);
}

// ─── Graceful shutdown ────────────────────────────────────────────────────────

export async function closeQueues(): Promise<void> {
  await postSchedulerQueue?.close();
  await postPublisherQueue?.close();
  connection?.disconnect();
}
