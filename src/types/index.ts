export type UserRole = 'member' | 'moderator' | 'admin';

export interface UserProfile {
  id?: string;
  uid: string;
  email: string;
  displayName: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
  role: UserRole;
  isSuspended?: boolean;
  gameNick?: string;
  gameId?: string;
  gameRole?: string;
  createdAt?: any;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  imageUrl?: string;
  category: 'General' | 'Showcase' | 'Tutorial' | 'Discussion';
  likes: string[];
  commentCount: number;
  createdAt: any;
}

export interface Comment {
  id: string;
  postId?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: any;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  content: string;
  type: 'message' | 'like' | 'comment' | 'system';
  isRead: boolean;
  createdAt: any;
  link?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: any;
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
  likes: string[];
  createdAt: any;
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
}