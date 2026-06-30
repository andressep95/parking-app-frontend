import { apiClient } from './client';
import type {
  Organization,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
} from '../types/index';

export async function listOrganizations(): Promise<Organization[]> {
  const { data } = await apiClient.get<Organization[]>('/organizations');
  return data;
}

export async function getOrganization(id: string): Promise<Organization> {
  const { data } = await apiClient.get<Organization>(`/organizations/${id}`);
  return data;
}

export async function createOrganization(
  payload: CreateOrganizationRequest,
): Promise<Organization> {
  const { data } = await apiClient.post<Organization>('/organizations', payload);
  return data;
}

export async function updateOrganization(
  id: string,
  payload: UpdateOrganizationRequest,
): Promise<{ message: string }> {
  const { data } = await apiClient.put<{ message: string }>(`/organizations/${id}`, payload);
  return data;
}

export async function deleteOrganization(id: string): Promise<void> {
  await apiClient.delete(`/organizations/${id}`);
}

export async function activateOrganization(id: string): Promise<{ orgStatus: string }> {
  const { data } = await apiClient.post<{ orgStatus: string }>(`/organizations/${id}/activate`);
  return data;
}

export async function deactivateOrganization(id: string): Promise<{ orgStatus: string }> {
  const { data } = await apiClient.post<{ orgStatus: string }>(
    `/organizations/${id}/deactivate`,
  );
  return data;
}
