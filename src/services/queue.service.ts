import { Queue, Worker, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';
import { config } from '../config';
import { QUEUE_NAMES } from '../utils/constants';

// ─── Redis connection ─────────────────────────────────────────────────────────

let connection: IORedis | null = null;

function getConnection(): IORedis {
  if (!connection) {
    connection = new IORedis(config.redisUrl, {
      maxRetriesPerRequest: null,
    });
  }
  return connection;
}

// ─── Queues ───────────────────────────────────────────────────────────────────

export const postSchedulerQueue = new Queue(QUEUE_NAMES.POST_SCHEDULER, {
  connection: getConnection(),
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 200,
  },
});

export const postPublisherQueue = new Queue(QUEUE_NAMES.POST_PUBLISHER, {
  connection: getConnection(),
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 200,
  },
});

// ─── Job helpers ──────────────────────────────────────────────────────────────

export interface SchedulePostJobData {
  postId: string;
  userId: string;
  tiktokAccountId: string;
  scheduledAt: string;
}

export async function addSchedulePostJob(data: SchedulePostJobData, delay: number): Promise<void> {
  await postSchedulerQueue.add('schedule-post', data, { delay });
}

export async function addPublishPostJob(data: SchedulePostJobData): Promise<void> {
  await postPublisherQueue.add('publish-post', data);
}

// ─── Graceful shutdown ────────────────────────────────────────────────────────

export async function closeQueues(): Promise<void> {
  await postSchedulerQueue.close();
  await postPublisherQueue.close();
  connection?.disconnect();
}
