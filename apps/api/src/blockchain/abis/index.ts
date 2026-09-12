import { InterfaceAbi, Contract, ContractRunner } from 'ethers';

export const EscrowAbi: InterfaceAbi = [
  'function createCase(bytes32 caseId, address token, uint256 rewardAmount, uint64 deadline) external',
  'function completeReturn(bytes32 caseId, address helper) external',
  'function refundExpired(bytes32 caseId) external',
  'function pause() external',
  'function unpause() external',
  'function getCase(bytes32 caseId) external view returns (tuple(address owner, address token, uint256 rewardAmount, uint64 deadline, uint8 status))',
  'event CaseCreated(bytes32 indexed caseId, address indexed owner, address indexed token, uint256 rewardAmount, uint64 deadline)',
  'event CaseCompleted(bytes32 indexed caseId, address indexed helper, uint256 rewardAmount)',
  'event CaseRefunded(bytes32 indexed caseId)',
];

export const MockUsdcAbi: InterfaceAbi = [
  'function mint(address to, uint256 amount) external',
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function decimals() external view returns (uint8)',
  'function symbol() external view returns (string)',
];

export interface RecoveryCaseStruct {
  owner: string;
  token: string;
  rewardAmount: bigint;
  deadline: bigint;
  status: bigint;
}

export function createEscrowContract(address: string, runner: ContractRunner): Contract {
  return new Contract(address, EscrowAbi, runner);
}

export function createMockUsdcContract(address: string, runner: ContractRunner): Contract {
  return new Contract(address, MockUsdcAbi, runner);
}