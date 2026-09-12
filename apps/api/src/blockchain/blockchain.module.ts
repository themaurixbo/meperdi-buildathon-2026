import { Module } from '@nestjs/common';
import { ChainService } from './chain.service';
import { CaseOtpService } from './case-otp.service';
import { BlockchainController } from './blockchain.controller';

@Module({
  controllers: [BlockchainController],
  providers: [ChainService, CaseOtpService],
  exports: [ChainService, CaseOtpService],
})
export class BlockchainModule {}