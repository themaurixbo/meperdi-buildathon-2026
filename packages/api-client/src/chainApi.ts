import { apiRequest } from './http';

export interface CreateCaseResponse {
  caseId: string;
  code: string;
  txHash: string;
  explorerUrl: string;
}

export interface CompleteReturnResponse {
  txHash: string;
  explorerUrl: string;
  rewardAmount: string;
}

export async function createChainCase(
  body: { itemName: string; rewardAmount?: string },
  key: string,
): Promise<CreateCaseResponse> {
  return apiRequest<CreateCaseResponse>(`/api/chain/cases?key=${encodeURIComponent(key)}`, {
    method: 'POST',
    body,
  });
}

export async function completeChainReturn(
  body: { caseId: string; code: string; helperAddress: string },
): Promise<CompleteReturnResponse> {
  return apiRequest<CompleteReturnResponse>('/api/chain/complete-return', {
    method: 'POST',
    body,
  });
}