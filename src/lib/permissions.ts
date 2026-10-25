import { UserProfile } from '../types';

export const isAdminOrModerator = (profile: UserProfile | null): boolean => {
  if (!profile) return false;
  return profile.role === 'admin' || profile.role === 'moderator';
};

export const isAdmin = (profile: UserProfile | null): boolean => {
  if (!profile) return false;
  return profile.role === 'admin';
};

export const canManageContent = (profile: UserProfile | null, authorId: string): boolean => {
  if (!profile) return false;
  if (profile.uid === authorId) return true;
  return isAdminOrModerator(profile);
};