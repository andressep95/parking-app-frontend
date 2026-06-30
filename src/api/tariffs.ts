import { apiClient } from './client';
import type { Tariff, CreateTariffRequest, VehicleType } from '../types/index';

export async function listTariffs(params?: {
  locationId?: string;
  vehicleType?: VehicleType;
  active?: boolean;
}): Promise<Tariff[]> {
  const { data } = await apiClient.get<Tariff[]>('/tariffs', { params });
  return data;
}

export async function getTariff(id: string): Promise<Tariff> {
  const { data } = await apiClient.get<Tariff>(`/tariffs/${id}`);
  return data;
}

export async function createTariff(payload: CreateTariffRequest): Promise<Tariff> {
  const { data } = await apiClient.post<Tariff>('/tariffs', payload);
  return data;
}

export async function deactivateTariff(id: string): Promise<Tariff> {
  const { data } = await apiClient.post<Tariff>(`/tariffs/${id}/deactivate`);
  return data;
}
