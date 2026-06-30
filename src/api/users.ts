import { apiClient } from './client';
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
} from '../types/index';

export async function listUsers(orgId?: string): Promise<User[]> {
  const params = orgId ? { org_id: orgId } : {};
  const { data } = await apiClient.get<User[]>('/users', { params });
  return data;
}

export async function getUser(id: string): Promise<User> {
  const { data } = await apiClient.get<User>(`/users/${id}`);
  return data;
}

export async function createUser(payload: CreateUserRequest): Promise<User> {
  const { data } = await apiClient.post<User>('/users', payload);
  return data;
}

export async function updateUser(id: string, payload: UpdateUserRequest): Promise<User> {
  const { data } = await apiClient.put<User>(`/users/${id}`, payload);
  return data;
}

export async function deleteUser(id: string): Promise<void> {
  await apiClient.delete(`/users/${id}`);
}

export async function activateUser(id: string): Promise<{ userStatus: string }> {
  const { data } = await apiClient.post<{ userStatus: string }>(`/users/${id}/activate`);
  return data;
}

export async function deactivateUser(id: string): Promise<{ userStatus: string }> {
  const { data } = await apiClient.post<{ userStatus: string }>(`/users/${id}/deactivate`);
  return data;
}

export async function resetPassword(id: string, newPassword: string): Promise<void> {
  await apiClient.post(`/users/${id}/reset-password`, { newPassword });
}

export async function forceLogout(userId: string): Promise<void> {
  await apiClient.delete(`/auth/sessions/${userId}`);
}
