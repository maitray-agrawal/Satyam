import { EventEmitter } from 'events';
import { createServiceLogger } from '../observability/logger';

const log = createServiceLogger('JobQueueService');

export type JobStage =
  | 'UPLOAD'
  | 'QUEUED'
  | 'EXTRACTING'
  | 'VERIFYING'
  | 'EVALUATING'
  | 'RISK_ASSESSMENT'
  | 'AI_RECOMMENDATION'
  | 'COMPLETED'
  | 'FAILED';

export interface BackgroundJob {
  id: string;
  bidId: string;
  tenderId: string;
  type: string;
  stage: JobStage;
  progress: number; // 0 to 100
  message: string;
  startTime: string;
  completedTime?: string;
  error?: string;
  result?: any;
}

export class JobQueueService extends EventEmitter {
  private static instance: JobQueueService;
  private jobs: Map<string, BackgroundJob> = new Map();

  private constructor() {
    super();
  }

  public static getInstance(): JobQueueService {
    if (!JobQueueService.instance) {
      JobQueueService.instance = new JobQueueService();
    }
    return JobQueueService.instance;
  }

  public createJob(bidId: string, tenderId: string, type = 'FULL_BID_EVALUATION'): BackgroundJob {
    const id = `job-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const job: BackgroundJob = {
      id,
      bidId,
      tenderId,
      type,
      stage: 'QUEUED',
      progress: 5,
      message: 'Job submitted to evaluation queue.',
      startTime: new Date().toISOString(),
    };

    this.jobs.set(id, job);
    this.emit('job:created', job);
    log.info(`Created evaluation job [${id}] for Bid ${bidId}`);
    return job;
  }

  public updateJobStage(
    jobId: string,
    stage: JobStage,
    progress: number,
    message: string,
    result?: any
  ): BackgroundJob | undefined {
    const job = this.jobs.get(jobId);
    if (!job) return undefined;

    job.stage = stage;
    job.progress = progress;
    job.message = message;
    if (result) job.result = result;
    if (stage === 'COMPLETED' || stage === 'FAILED') {
      job.completedTime = new Date().toISOString();
    }

    this.emit('job:updated', job);
    log.info(`Job [${jobId}] progressed to ${stage} (${progress}%): ${message}`);
    return job;
  }

  public getJob(jobId: string): BackgroundJob | undefined {
    return this.jobs.get(jobId);
  }

  public getJobsForBid(bidId: string): BackgroundJob[] {
    return Array.from(this.jobs.values()).filter((j) => j.bidId === bidId);
  }

  public getAllJobs(): BackgroundJob[] {
    return Array.from(this.jobs.values());
  }
}
