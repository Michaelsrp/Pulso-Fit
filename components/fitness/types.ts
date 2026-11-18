export type FeedPost = {
  id: string;
  user_id?: string;
  username: string;
  avatar_url?: string | null;
  image_url?: string | null;
  image_path?: string | null;
  text: string;
  created_at: string;
  likes: number;
  liked?: boolean;
  comments?: number;
};

export type ProfilePreview = {
  id?: string;
  username: string;
  avatar_url?: string | null;
};
