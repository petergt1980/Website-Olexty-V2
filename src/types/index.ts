export type UserRole = 'admin' | 'moderator' | 'member';

export interface UserProfile {
  uid: string;
  displayName: string;
  username?: string;
  email?: string;
  avatarUrl?: string;
  bio?: string;
  role?: UserRole;
  badge?: string;      // Atribut badge gelar
  points?: number;     // Atribut poin check-in
  lastCheckIn?: any;
  isSuspended?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userBadge?: string;
  content: string;
  category?: string;
  likes?: string[];
  commentsCount?: number;
  createdAt?: any;
}

export interface EventItem {
  id: string;
  title: string;
  game: string;
  date: string;
  time: string;
  type: 'Scrim' | 'Turnamen' | 'Mabar' | 'Latihan';
  slots: string;
  link?: string;
  createdAt?: any;
}

export interface ClipItem {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  title: string;
  videoUrl: string;
  game: string;
  likes?: string[];
  createdAt?: any;
}

export interface SocialLinks {
  logoUrl?: string;
  siteName?: string;
  siteSubName?: string;
  siteTagline?: string;
  discordUrl?: string;
  waChannelUrl?: string;
  tiktokUrl?: string;
  youtubeUrl?: string;
  announcementText?: string;
  discordWebhookUrl?: string;
  liveStreamUrl?: string;
  donateUrl?: string;
}