export type UserRole = 'member' | 'moderator' | 'admin';
export type PostStatus = 'draft' | 'published' | 'hidden';
export type ReportStatus = 'pending' | 'investigating' | 'resolved' | 'dismissed';

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  website: string | null;
  is_suspended: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserRoleRecord {
  id: string;
  user_id: string;
  role: UserRole;
  granted_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon_name: string | null;
  is_active: boolean;
}

export interface Post {
  id: string;
  author_id: string;
  category_id: string | null;
  title: string;
  slug: string;
  content: string;
  status: PostStatus;
  is_pinned: boolean;
  views_count: number;
  created_at: string;
  updated_at: string;
  author?: Profile;
  category?: Category;
  reactions_count?: number;
  comments_count?: number;
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  parent_id: string | null;
  content: string;
  is_hidden: boolean;
  created_at: string;
  updated_at: string;
  author?: Profile;
  replies?: Comment[];
}

export interface EventItem {
  id: string;
  organizer_id: string;
  title: string;
  slug: string;
  description: string;
  event_time: string;
  location: string;
  cover_image_url: string | null;
  max_attendees: number | null;
  created_at: string;
  organizer?: Profile;
  attendees_count?: number;
  is_user_joined?: boolean;
}

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile };
      user_roles: { Row: UserRoleRecord };
      categories: { Row: Category };
      posts: { Row: Post };
      comments: { Row: Comment };
      events: { Row: EventItem };
    };
  };
}