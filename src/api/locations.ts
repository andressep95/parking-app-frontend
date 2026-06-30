import { apiClient } from './client';
import type {
  Location,
  CreateLocationRequest,
  UpdateLocationRequest,
} from '../types/index';

export async function listLocations(orgId?: string): Promise<Location[]> {
  const params = orgId ? { orgId } : {};
  const { data } = await apiClient.get<Location[]>('/locations', { params });
  return data;
}

export async function getLocation(id: string): Promise<Location> {
  const { data } = await apiClient.get<Location>(`/locations/${id}`);
  return data;
}

export async function createLocation(payload: CreateLocationRequest): Promise<Location> {
  const { data } = await apiClient.post<Location>('/locations', payload);
  return data;
}

export async function updateLocation(
  id: string,
  payload: UpdateLocationRequest,
): Promise<Location> {
  const { data } = await apiClient.put<Location>(`/locations/${id}`, payload);
  return data;
}

export async function deleteLocation(id: string): Promise<void> {
  await apiClient.delete(`/locations/${id}`);
}

export async function activateLocation(id: string): Promise<{ locationStatus: string }> {
  const { data } = await apiClient.post<{ locationStatus: string }>(
    `/locations/${id}/activate`,
  );
  return data;
}

export async function deactivateLocation(id: string): Promise<{ locationStatus: string }> {
  const { data } = await apiClient.post<{ locationStatus: string }>(
    `/locations/${id}/deactivate`,
  );
  return data;
}
