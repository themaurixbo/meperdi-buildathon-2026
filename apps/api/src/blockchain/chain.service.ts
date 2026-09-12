import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers, Contract } from 'ethers';
import {
  RecoveryCaseStruct,
  createEscrowContract,
  createMockUsdcContract,
} from './abis';

@Injectable()
export class ChainService implements OnModuleInit {
  private provider!: ethers.JsonRpcProvider;
  private verifierWallet!: ethers.Wallet;
  private demoOwnerWallet!: ethers.Wallet;
  private escrowContract!: Contract;
  private demoOwnerEscrowContract!: Contract;
  private mockUsdcContract!: Contract;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const rpcUrl = this.config.getOrThrow<string>('HSK_RPC_URL');
    const escrowAddress = this.config.getOrThrow<string>('RECOVERY_ESCROW_ADDRESS');
    const mockUsdcAddress = this.config.getOrThrow<string>('MOCK_USDC_ADDRESS');
    const verifierPk = this.config.getOrThrow<string>('VERIFIER_PRIVATE_KEY');
    const demoOwnerPk = this.config.getOrThrow<string>('DEMO_OWNER_PRIVATE_KEY');

    this.provider = new ethers.JsonRpcProvider(rpcUrl);

    this.verifierWallet = new ethers.Wallet(verifierPk, this.provider);
    this.demoOwnerWallet = new ethers.Wallet(demoOwnerPk, this.provider);

    this.escrowContract = createEscrowContract(escrowAddress, this.verifierWallet);
    this.demoOwnerEscrowContract = createEscrowContract(escrowAddress, this.demoOwnerWallet);
    this.mockUsdcContract = createMockUsdcContract(mockUsdcAddress, this.demoOwnerWallet);
  }

  getProvider(): ethers.JsonRpcProvider {
    return this.provider;
  }

  getVerifierWallet(): ethers.Wallet {
    return this.verifierWallet;
  }

  getDemoOwnerWallet(): ethers.Wallet {
    return this.demoOwnerWallet;
  }

  getEscrowContract(): Contract {
    return this.escrowContract;
  }

  getDemoOwnerEscrowContract(): Contract {
    return this.demoOwnerEscrowContract;
  }

  getMockUsdcContract(): Contract {
    return this.mockUsdcContract;
  }

  async getCase(caseId: string): Promise<RecoveryCaseStruct> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const result = await (this.escrowContract as any).getCase(caseId);
    return {
      owner: result[0],
      token: result[1],
      rewardAmount: result[2],
      deadline: result[3],
      status: result[4],
    };
  }

  buildExplorerUrl(txHash: string): string {
    return `https://testnet-explorer.hsk.xyz/tx/${txHash}`;
  }

  parseUnits(amount: string, decimals = 6): bigint {
    return ethers.parseUnits(amount, decimals);
  }

  formatUnits(amount: bigint, decimals = 6): string {
    return ethers.formatUnits(amount, decimals);
  }
}