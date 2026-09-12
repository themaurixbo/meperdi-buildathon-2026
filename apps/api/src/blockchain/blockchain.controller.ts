import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ChainService } from './chain.service';
import { CaseOtpService } from './case-otp.service';
import { ApiException } from '../common/api-exception';
import { ethers } from 'ethers';

interface CreateCaseDto {
  itemName: string;
  rewardAmount?: string;
}

interface CompleteReturnDto {
  caseId: string;
  code: string;
  helperAddress: string;
}

@Controller('chain')
export class BlockchainController {
  constructor(
    private readonly chain: ChainService,
    private readonly otp: CaseOtpService,
  ) {}

  @Post('cases')
  @HttpCode(HttpStatus.CREATED)
  async createCase(
    @Query('key') key: string,
    @Body() body: CreateCaseDto,
  ): Promise<{ caseId: string; code: string; txHash: string; explorerUrl: string }> {
    const secret = process.env.CHAIN_DEMO_SECRET;
    if (!secret || key !== secret) {
      throw new ApiException('invalid_key', 'Invalid demo secret.', HttpStatus.FORBIDDEN);
    }

    const { itemName, rewardAmount = '0' } = body;
    if (!itemName?.trim()) {
      throw new ApiException('invalid_item', 'itemName is required.', HttpStatus.BAD_REQUEST);
    }

    const rewardWei = this.chain.parseUnits(rewardAmount);

    const caseId = ethers.keccak256(ethers.toUtf8Bytes(`meperdi:${itemName}:${Date.now()}`));
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60);

    const demoOwnerEscrow = this.chain.getDemoOwnerEscrowContract();
    const mockUsdc = this.chain.getMockUsdcContract();
    const escrowAddress = await (demoOwnerEscrow as any).getAddress();

    if (rewardWei > 0n) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const approveTx = await (mockUsdc as any).approve(escrowAddress, rewardWei);
      await approveTx.wait();
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const tx = await (demoOwnerEscrow as any).createCase(caseId, await (mockUsdc as any).getAddress(), rewardWei, deadline);
    const receipt = await tx.wait();

    const { code } = this.otp.createOtp(caseId);

    return {
      caseId,
      code,
      txHash: receipt.hash,
      explorerUrl: this.chain.buildExplorerUrl(receipt.hash),
    };
  }

  @Post('complete-return')
  @HttpCode(HttpStatus.OK)
  async completeReturn(
    @Body() body: CompleteReturnDto,
  ): Promise<{ txHash: string; explorerUrl: string; rewardAmount: string }> {
    const { caseId, code, helperAddress } = body;

    if (!ethers.isAddress(helperAddress)) {
      throw new ApiException('invalid_helper_address', 'Invalid helper address.', HttpStatus.BAD_REQUEST);
    }

    const valid = this.otp.verifyOtp(caseId, code);
    if (!valid) {
      throw new ApiException('invalid_code', 'Invalid or expired code.', HttpStatus.BAD_REQUEST);
    }

    const caseData = await this.chain.getCase(caseId);

    if (caseData.status === 0n) {
      throw new ApiException('case_not_found', 'Case not found.', HttpStatus.NOT_FOUND);
    }
    if (caseData.status !== 1n) {
      throw new ApiException('case_not_funded', 'Case is not in funded state.', HttpStatus.CONFLICT);
    }

    const escrow = this.chain.getEscrowContract();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const tx = await (escrow as any).completeReturn(caseId, helperAddress);
    const receipt = await tx.wait();

    const rewardAmount = this.chain.formatUnits(caseData.rewardAmount);

    return {
      txHash: receipt.hash,
      explorerUrl: this.chain.buildExplorerUrl(receipt.hash),
      rewardAmount,
    };
  }
}