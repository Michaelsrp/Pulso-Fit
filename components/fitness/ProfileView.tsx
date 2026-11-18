"use client";

import { Camera, Dumbbell, Heart, Plus } from "lucide-react";
import PostCard from "@/components/fitness/PostCard";
import type { FeedPost, ProfilePreview } from "@/components/fitness/types";

type ProfileViewProps = {
  profile: ProfilePreview & { goalName: string; placeName: string };
  userId?: string;
  username: string;
  posts: FeedPost[];
  likeBusyIds: Set<string>;
  onUsernameChange: (value: string) => void;
  onProfileFileChange: (file: File | null) => void;
  onSave: () => void;
  onGoSocial: () => void;
  onLike: (post: FeedPost) => void;
  onComment: (postId: string) => void;
  onDelete: (post: FeedPost) => void;
  onReport: (post: FeedPost) => void;
};

export default function ProfileView({ profile, userId, username, posts, likeBusyIds, onUsernameChange, onProfileFileChange, onSave, onGoSocial, onLike, onComment, onDelete, onReport }: ProfileViewProps) {
  const ownPosts = posts.filter(post => userId ? post.user_id === userId : (!post.user_id && post.username === profile.username));
  return <>
    <div className="section-heading"><div><h1>Mi perfil</h1><p>Tu espacio para registrar avances y compartir momentos.</p></div></div>
    <div className="two-col">
      <div className="panel-card"><h2>Información personal</h2>
        <div className="flex items-center gap-4 mb-5"><div className="avatar" style={{ width: 78, height: 78, fontSize: 27 }}>{profile.avatar_url ? <img src={profile.avatar_url} alt={`Foto de perfil de ${profile.username}`}/> : profile.username.slice(0, 1).toUpperCase()}</div><label className="outline-button" htmlFor="avatarUpload"><Camera size={16}/> Cambiar foto</label><input id="avatarUpload" type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={event => onProfileFileChange(event.target.files?.[0] || null)}/></div>
        <div className="field"><label htmlFor="profileName">Nombre de usuario</label><input id="profileName" value={username} onChange={event => onUsernameChange(event.target.value)}/></div>
        <div className="grid grid-cols-2 gap-3 text-sm"><div className="rounded-xl bg-slate-50 p-3"><span className="text-xs text-slate-500">Objetivo</span><div className="font-extrabold mt-1">{profile.goalName}</div></div><div className="rounded-xl bg-slate-50 p-3"><span className="text-xs text-slate-500">Lugar</span><div className="font-extrabold mt-1">{profile.placeName}</div></div></div>
        <button className="primary-button mt-5" onClick={onSave}>Guardar cambios</button>
      </div>
      <div className="panel-card"><h2>Mi actividad</h2><div className="grid grid-cols-2 gap-3"><div className="rounded-2xl bg-amber-50 p-4"><Dumbbell className="text-amber-600"/><strong className="block text-2xl mt-3">5</strong><span className="text-xs text-slate-600">Días sugeridos</span></div><div className="rounded-2xl bg-green-50 p-4"><Heart className="text-green-600"/><strong className="block text-2xl mt-3">1</strong><span className="text-xs text-slate-600">Meta: constancia</span></div></div><p className="notice mt-4">Los indicadores son orientativos para organizar tu experiencia; no representan sesiones completadas automáticamente.</p></div>
    </div>
    <div className="section-heading mt-8"><div><h1 className="text-2xl">Mis publicaciones</h1><p>Lo que compartes con la comunidad.</p></div><button className="primary-button" onClick={onGoSocial}><Plus size={17}/> Publicar</button></div>
    <div className="feed-list">{ownPosts.map(post => <PostCard key={post.id} post={post} profile={profile} onLike={() => onLike(post)} likeBusy={likeBusyIds.has(post.id)} onComment={() => onComment(post.id)} onDelete={() => onDelete(post)} onReport={() => onReport(post)}/>)}</div>
  </>;
}
