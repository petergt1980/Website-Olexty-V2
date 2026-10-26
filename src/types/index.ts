export type UserRole = 'admin' | 'moderator' | 'member';

export interface UserProfile {
  uid: string;
  displayName: string;
  username?: string;
  email?: string;
  avatarUrl?: string;
  bio?: string;
  role?: UserRole;
  badge?: string;
  points?: number;
  lastCheckIn?: any;
  isSuspended?: boolean;

  // Properti Game & Komunitas (Penting untuk MemberCard & Leaderboard)
  gameId?: string;
  gameRole?: string;
  gameNick?: string;

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
  imageUrl?: string; // Properti Gambar Postingan (Penting untuk PostDetailPage)
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