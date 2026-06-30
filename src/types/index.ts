export type UserRole = 'ADMIN' | 'CUSTOMER' | 'OPERATOR';
export type UserStatus = 'ACTIVE' | 'INACTIVE';
export type OrgStatus = 'ACTIVE' | 'INACTIVE';
export type LocationStatus = 'ACTIVE' | 'INACTIVE';
export type TerminalStatus = 'ONLINE' | 'OFFLINE' | 'MAINTENANCE';
export type VehicleType = 'CAR' | 'MOTORCYCLE' | 'PICKUP' | 'BUS';

export interface User {
  id: string;
  cognitoSub?: string;
  rut: string;
  email: string;
  givenName: string;
  familyName: string;
  phoneNumber?: string;
  role: UserRole;
  userStatus: UserStatus;
  orgId?: string;
  locationId?: string;
  createdAt: string;
}

export interface CreateUserRequest {
  rut: string;
  password: string;
  email: string;
  givenName: string;
  familyName: string;
  phoneNumber?: string;
  role: UserRole;
  orgId?: string;
  locationId?: string;
}

export interface UpdateUserRequest {
  email?: string;
  givenName?: string;
  familyName?: string;
  phoneNumber?: string;
  locationId?: string;
}

export interface Organization {
  id: string;
  orgName: string;
  rutCompany: string;
  orgEmail: string;
  phoneNumber?: string;
  orgStatus: OrgStatus;
  adminUserId: string;
  createdAt: string;
}

export interface CreateOrganizationRequest {
  orgName: string;
  rutCompany: string;
  orgEmail: string;
  phoneNumber?: string;
  adminUserId: string;
}

export interface UpdateOrganizationRequest {
  orgName?: string;
  rutCompany?: string;
  orgEmail?: string;
  phoneNumber?: string;
}

export interface Location {
  id: string;
  orgId: string;
  locationName: string;
  address: string;
  city: string;
  timezone: string;
  capacity: number;
  locationStatus: LocationStatus;
  createdAt: string;
}

export interface CreateLocationRequest {
  orgId: string;
  locationName: string;
  address: string;
  city: string;
  timezone?: string;
  capacity: number;
}

export interface UpdateLocationRequest {
  locationName?: string;
  address?: string;
  city?: string;
  timezone?: string;
  capacity?: number;
}

export interface Terminal {
  id: string;
  serialNumber: string;
  model: string;
  orgId: string;
  status: TerminalStatus;
  activeOperatorId?: string;
  appVersion?: string;
  lastHeartbeat?: string;
}

export interface CreateTerminalRequest {
  serialNumber: string;
  model: string;
  orgId: string;
  appVersion?: string;
}

export interface UpdateTerminalRequest {
  model?: string;
  appVersion?: string;
}

export interface Tariff {
  id: string;
  locationId: string;
  vehicleType: VehicleType;
  name: string;
  pricePerHour: number;
  minimumCharge: number;
  graceMinutes: number;
  isActive: boolean;
  validFrom: string;
  validUntil?: string;
}

export interface CreateTariffRequest {
  locationId: string;
  vehicleType: VehicleType;
  name: string;
  pricePerHour: number;
  minimumCharge?: number;
  graceMinutes?: number;
}

export interface ApiError {
  status: number;
  code?: string;
  message: string;
}

export interface AuthUser {
  sub: string;
  username: string;
  email?: string;
  givenName?: string;
  familyName?: string;
  groups: string[];
  role: UserRole | null;
}
