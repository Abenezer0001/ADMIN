import { Role, Permission } from '../services/RbacService';

export interface User {
  _id: string;
  username?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  roles?: Role[] | string[];
  businessId?: string;
  businessName?: string;
  isActive?: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
  phoneNumber?: string;
  address?: UserAddress;
  department?: string;
  position?: string;
  employeeId?: string;
  profileImage?: string;
  status?: UserStatus;
  lastModifiedBy?: string;
  notes?: string;
  auditLog?: AuditLogEntry[];
}

export interface UserAddress {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
  DELETED = 'deleted'
}

export interface AuditLogEntry {
  action: string;
  timestamp: string;
  performedBy: string;
  details?: string;
}

export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: UserStatus;
  role?: string;
}

export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  username?: string;
  password?: string;
  role?: string;
  roles?: string[];
  phoneNumber?: string;
  address?: UserAddress;
  department?: string;
  position?: string;
  employeeId?: string;
  isActive?: boolean;
  notes?: string;
}

export interface UpdateUserRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  password?: string;
  phoneNumber?: string;
  address?: UserAddress;
  department?: string;
  position?: string;
  employeeId?: string;
  profileImage?: string;
  isActive?: boolean;
  status?: UserStatus;
  notes?: string;
}

export interface UserResponse {
  success: boolean;
  user?: User;
  message?: string;
}

export interface UserRoleAssignmentRequest {
  userId: string;
  roleIds: string[];
}
