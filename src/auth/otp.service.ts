import { Injectable } from '@nestjs/common';
import NodeCache from 'node-cache';

@Injectable()
export class OtpService {
  private otpCache: NodeCache;

  constructor() {
    // Set the standard TTL to 5 minutes (300 seconds)
    this.otpCache = new NodeCache({ stdTTL: 180 });
  }

  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  storeOtp(userId: string, otp: string): void {
    this.otpCache.set(userId, otp);
  }

  verifyOtp(userId: string, otp: string): boolean {
    const storedOtp = this.otpCache.get(userId);
    return storedOtp === otp;
  }
}
