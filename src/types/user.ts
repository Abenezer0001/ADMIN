export interface User {
  _id: string;
  username?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  roles?: string[];
  directPermissions?: string[];
  isActive?: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
} 