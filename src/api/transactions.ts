import { apiClient } from './client';
import type { Transaction } from '../types/index';

export async function listTransactions(locationId: string): Promise<Transaction[]> {
  const { data } = await apiClient.get<Transaction[]>('/transactions', {
    params: { locationId },
  });
  return data;
}
