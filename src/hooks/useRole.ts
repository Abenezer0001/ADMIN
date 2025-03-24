import { useRbac } from '../context/RbacContext';

/**
 * Custom hook to check if the current user has a specific role
 * @param roleName The name of the role to check
 * @returns Boolean indicating if the user has the role
 */
export const useRole = (roleName: string): boolean => {
  const { checkRole } = useRbac();
  return checkRole(roleName);
}; 