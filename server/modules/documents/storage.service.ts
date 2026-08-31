import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { createServiceLogger } from '../../observability/logger';

const log = createServiceLogger('DocumentStorageService');

export interface StorageSaveResult {
  storagePath: string;
  provider: 'LOCAL' | 'GCS';
  sha256Hash: string;
  fileSize: number;
}

export interface IStorageProvider {
  readonly providerName: 'LOCAL' | 'GCS';
  save(fileName: string, buffer: Buffer, mimeType: string): Promise<StorageSaveResult>;
  get(storagePath: string): Promise<Buffer>;
  delete(storagePath: string): Promise<void>;
}

export class LocalStorageProvider implements IStorageProvider {
  readonly providerName = 'LOCAL' as const;
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async save(fileName: string, buffer: Buffer, mimeType: string): Promise<StorageSaveResult> {
    const sha256Hash = crypto.createHash('sha256').update(buffer).digest('hex');
    const ext = path.extname(fileName);
    const sanitizedBase = path.basename(fileName, ext).replace(/[^a-zA-Z0-9-_]/g, '_');
    const storedFileName = `${Date.now()}_${sanitizedBase}_${sha256Hash.substring(0, 8)}${ext}`;
    const destinationPath = path.join(this.uploadDir, storedFileName);

    await fs.promises.writeFile(destinationPath, buffer);
    log.info(`Document securely written to local storage: ${storedFileName} (SHA-256: ${sha256Hash})`);

    return {
      storagePath: destinationPath,
      provider: 'LOCAL',
      sha256Hash,
      fileSize: buffer.length,
    };
  }

  async get(storagePath: string): Promise<Buffer> {
    return await fs.promises.readFile(storagePath);
  }

  async delete(storagePath: string): Promise<void> {
    if (fs.existsSync(storagePath)) {
      await fs.promises.unlink(storagePath);
      log.info(`Document deleted from local storage: ${storagePath}`);
    }
  }
}

export class CloudStorageProvider implements IStorageProvider {
  readonly providerName = 'GCS' as const;
  private bucketName: string;

  constructor(bucketName?: string) {
    this.bucketName = bucketName || process.env.GCS_BUCKET_NAME || 'gev-verify-tender-documents';
  }

  async save(fileName: string, buffer: Buffer, mimeType: string): Promise<StorageSaveResult> {
    const sha256Hash = crypto.createHash('sha256').update(buffer).digest('hex');
    const destinationObject = `tenders/${Date.now()}_${sha256Hash.substring(0, 12)}_${fileName}`;

    log.info(`[GCS Simulation] Document staged for Google Cloud Storage: gs://${this.bucketName}/${destinationObject}`);

    return {
      storagePath: `gs://${this.bucketName}/${destinationObject}`,
      provider: 'GCS',
      sha256Hash,
      fileSize: buffer.length,
    };
  }

  async get(storagePath: string): Promise<Buffer> {
    log.info(`[GCS Simulation] Streaming document from Google Cloud Storage: ${storagePath}`);
    return Buffer.from('SIMULATED_GCS_DOCUMENT_PAYLOAD');
  }

  async delete(storagePath: string): Promise<void> {
    log.info(`[GCS Simulation] Removed object from Google Cloud Storage: ${storagePath}`);
  }
}

export class DocumentStorageService {
  private static instance: DocumentStorageService;
  private provider: IStorageProvider;

  private constructor() {
    const useGcs = process.env.STORAGE_PROVIDER === 'GCS' || !!process.env.GCS_BUCKET_NAME;
    this.provider = useGcs ? new CloudStorageProvider() : new LocalStorageProvider();
    log.info(`Document Storage Service initialized with provider: ${this.provider.providerName}`);
  }

  public static getInstance(): DocumentStorageService {
    if (!DocumentStorageService.instance) {
      DocumentStorageService.instance = new DocumentStorageService();
    }
    return DocumentStorageService.instance;
  }

  public getProvider(): IStorageProvider {
    return this.provider;
  }

  public async storeDocument(fileName: string, buffer: Buffer, mimeType: string): Promise<StorageSaveResult> {
    return await this.provider.save(fileName, buffer, mimeType);
  }

  public async retrieveDocument(storagePath: string): Promise<Buffer> {
    return await this.provider.get(storagePath);
  }
}
