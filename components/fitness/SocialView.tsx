"use client";

import type { FormEvent } from "react";
import { ImagePlus, Send, Users } from "lucide-react";
import PostCard from "@/components/fitness/PostCard";
import type { FeedPost, ProfilePreview } from "@/components/fitness/types";

type SocialViewProps = {
  profile: ProfilePreview;
  posts: FeedPost[];
  postText: string;
  postFile: File | null;
  postBusy: boolean;
  configured: boolean;
  likeBusyIds: Set<string>;
  onTextChange: (value: string) => void;
  onFileChange: (file: File | null) => void;
  onCreatePost: (event: FormEvent<HTMLFormElement>) => void;
  onLike: (post: FeedPost) => void;
  onComment: (postId: string) => void;
  onDelete: (post: FeedPost) => void;
  onReport: (post: FeedPost) => void;
};

export default function SocialView({ profile, posts, postText, postFile, postBusy, configured, likeBusyIds, onTextChange, onFileChange, onCreatePost, onLike, onComment, onDelete, onReport }: SocialViewProps) {
  return <>
    <div className="section-heading"><div><h1>Comunidad Pulso Fit</h1><p>Comparte tus avances, celebra los de otros y motívense juntos.</p></div><span className="pill active"><Users size={14} className="inline mr-1"/> Comunidad</span></div>
    <div className="panel-card mb-5"><h2>Comparte tu momento</h2><form onSubmit={onCreatePost}>
      <div className="flex gap-3"><div className="avatar">{profile.avatar_url ? <img src={profile.avatar_url} alt="Tu foto de perfil"/> : profile.username.slice(0, 1).toUpperCase()}</div><textarea className="field flex-1" style={{ margin: 0 }} placeholder="¿Cómo te fue hoy? Comparte una foto o unas palabras… 💛" value={postText} maxLength={1000} onChange={event => onTextChange(event.target.value.slice(0, 1000))} aria-label="Texto de la publicación"/></div>
      <div className="flex flex-wrap justify-between items-center mt-3 gap-3"><label className="outline-button" htmlFor="postImage"><ImagePlus size={17}/> Añadir foto</label><input id="postImage" className="hidden" type="file" accept="image/jpeg,image/png,image/webp" onChange={event => onFileChange(event.target.files?.[0] || null)}/><span className="text-xs text-slate-500">{postText.length}/1000 caracteres · {postFile?.name || "JPG, PNG o WebP · imagen opcional"}</span><button className="primary-button" disabled={postBusy || (!postText.trim() && !postFile)}>{postBusy ? "Publicando…" : "Publicar"} <Send size={16}/></button></div>
    </form>{!configured && <p className="notice mt-3">En modo demostración las publicaciones son locales. Conecta Supabase para guardarlas y compartirlas entre cuentas.</p>}</div>
    <div className="feed-list">{posts.map(post => <PostCard key={post.id} post={post} profile={profile} onLike={() => onLike(post)} likeBusy={likeBusyIds.has(post.id)} onComment={() => onComment(post.id)} onDelete={() => onDelete(post)} onReport={() => onReport(post)}/>)}</div>
  </>;
}
