import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

interface OtpRecord {
  hash: string;
  expiresAt: number;
  attempts: number;
  used: boolean;
}

@Injectable()
export class CaseOtpService {
  private readonly store = new Map<string, OtpRecord>();
  private readonly ttlMs = 24 * 60 * 60 * 1000;
  private readonly maxAttempts = 5;

  generateCode(): string {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  private hashCode(code: string): string {
    return crypto.createHash('sha256').update(code).digest('hex');
  }

  createOtp(caseId: string): { code: string; expiresAt: string } {
    const code = this.generateCode();
    const hash = this.hashCode(code);
    const expiresAt = Date.now() + this.ttlMs;

    this.store.set(caseId, {
      hash,
      expiresAt,
      attempts: 0,
      used: false,
    });

    return { code, expiresAt: new Date(expiresAt).toISOString() };
  }

  verifyOtp(caseId: string, code: string): boolean {
    const record = this.store.get(caseId);
    if (!record) return false;
    if (record.used) return false;
    if (Date.now() > record.expiresAt) return false;
    if (record.attempts >= this.maxAttempts) return false;

    record.attempts += 1;
    const hash = this.hashCode(code);
    if (hash !== record.hash) return false;

    record.used = true;
    return true;
  }

  isUsed(caseId: string): boolean {
    const record = this.store.get(caseId);
    return record?.used ?? false;
  }

  cleanup(): void {
    const now = Date.now();
    for (const [caseId, record] of this.store.entries()) {
      if (now > record.expiresAt) this.store.delete(caseId);
    }
  }
}