import { Heart, MessageCircle, MoreHorizontal, ShieldAlert } from "lucide-react";

type PostCardPost = {
  id: string; user_id?: string; username: string; avatar_url?: string | null;
  image_url?: string | null; text: string; created_at: string; likes: number; liked?: boolean; comments?: number;
};
type ProfileSummary = { id?: string; username: string };

function PostCard({ post, profile, onLike, likeBusy, onComment, onDelete, onReport }: { post: PostCardPost; profile: ProfileSummary; onLike:()=>void; likeBusy: boolean; onComment:()=>void; onDelete:()=>void; onReport:()=>void }) {
  const mine = post.user_id ? post.user_id === profile.id : post.username === profile.username;
  return <article className="post-card"><div className="post-head"><div className="avatar">{post.avatar_url?<img src={post.avatar_url} alt={`Foto de ${post.username}`}/>:post.username.slice(0,1).toUpperCase()}</div><div className="flex-1 min-w-0"><strong className="text-sm">{post.username}</strong><p className="text-xs text-slate-500">{new Date(post.created_at).toLocaleDateString("es-CO",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}</p></div><button className="icon-button" onClick={mine?onDelete:onReport} aria-label={mine?"Eliminar publicación":"Reportar publicación"}>{mine?<MoreHorizontal/>:<ShieldAlert size={18}/>}</button></div>{post.image_url&&<img className="post-image" src={post.image_url} alt={`Publicación de ${post.username}`}/>}<div className="px-4 pt-3 text-sm leading-relaxed">{post.text}</div><div className="post-actions"><button onClick={onLike} disabled={likeBusy} aria-label={post.liked?"Quitar me gusta":"Dar me gusta"} aria-pressed={!!post.liked}><Heart size={18} fill={post.liked?"#ff7b75":"none"} color={post.liked?"#ff7b75":"currentColor"}/> {post.likes} Me gusta</button><button onClick={onComment}><MessageCircle size={18}/> {post.comments||0} Comentarios</button></div></article>;
}


export default PostCard;
