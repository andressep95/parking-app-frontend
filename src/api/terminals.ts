import { apiClient } from './client';
import type {
  Terminal,
  CreateTerminalRequest,
  UpdateTerminalRequest,
} from '../types/index';

export async function listTerminals(params?: {
  orgId?: string;
  locationId?: string;
}): Promise<Terminal[]> {
  const { data } = await apiClient.get<Terminal[]>('/terminals', { params });
  return data;
}

export async function getTerminal(id: string): Promise<Terminal> {
  const { data } = await apiClient.get<Terminal>(`/terminals/${id}`);
  return data;
}

export async function createTerminal(payload: CreateTerminalRequest): Promise<Terminal> {
  const { data } = await apiClient.post<Terminal>('/terminals', payload);
  return data;
}

export async function updateTerminal(
  id: string,
  payload: UpdateTerminalRequest,
): Promise<Terminal> {
  const { data } = await apiClient.put<Terminal>(`/terminals/${id}`, payload);
  return data;
}

export async function deleteTerminal(id: string): Promise<void> {
  await apiClient.delete(`/terminals/${id}`);
}

export async function setTerminalMaintenance(id: string): Promise<Terminal> {
  const { data } = await apiClient.post<Terminal>(`/terminals/${id}/maintenance`);
  return data;
}

export async function setTerminalOffline(id: string): Promise<Terminal> {
  const { data } = await apiClient.post<Terminal>(`/terminals/${id}/offline`);
  return data;
}
