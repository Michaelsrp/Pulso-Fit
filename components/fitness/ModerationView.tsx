"use client";

import { ShieldCheck } from "lucide-react";

export type ModerationReport = {
  id: string;
  post_id: string;
  reason: string;
  status: "pending" | "reviewed";
  created_at: string;
  reporter_name: string;
  post_text: string;
  post_image: string | null;
  post_image_path: string | null;
};

type ModerationViewProps = {
  reports: ModerationReport[];
  busy: boolean;
  onRefresh: () => void;
  onMarkReviewed: (reportId: string) => void;
  onHideComments: (postId: string) => void;
  onDeleteComments: (postId: string) => void;
  onDeletePost: (report: ModerationReport) => void;
};

export default function ModerationView({ reports, busy, onRefresh, onMarkReviewed, onHideComments, onDeleteComments, onDeletePost }: ModerationViewProps) {
  const pendingCount = reports.filter(report => report.status === "pending").length;
  return <>
    <div className="section-heading"><div><h1>Centro de moderación</h1><p>Revisa reportes y controla publicaciones o comentarios que incumplan las reglas.</p></div><ShieldCheck size={30} className="text-amber-500"/></div>
    <div className="panel-card"><div className="flex flex-wrap items-center justify-between gap-3"><div><strong>{pendingCount} reportes pendientes</strong><p className="text-xs text-slate-500 mt-1">Solo las cuentas autorizadas como moderadoras pueden ver este espacio.</p></div><button className="outline-button" onClick={onRefresh}>Actualizar lista</button></div></div>
    {busy ? <div className="empty-state">Cargando reportes…</div> : reports.length ? <div className="feed-list mt-4">{reports.map(report => <article className="panel-card" key={report.id}>
      <div className="flex flex-wrap items-start justify-between gap-3"><div><span className={`pill ${report.status === "pending" ? "active" : ""}`}>{report.status === "pending" ? "Pendiente" : "Revisado"}</span><h2 className="mt-3">Publicación reportada</h2><p className="text-xs text-slate-500">Reportó: {report.reporter_name} · {new Date(report.created_at).toLocaleString("es-CO")}</p></div>
        <div className="flex flex-wrap gap-2">{report.status === "pending" && <button className="outline-button" onClick={() => onMarkReviewed(report.id)}>Marcar revisado</button>}<button className="outline-button" onClick={() => onHideComments(report.post_id)}>Ocultar comentarios</button><button className="outline-button" onClick={() => onDeleteComments(report.post_id)}>Eliminar comentarios</button><button className="primary-button" onClick={() => onDeletePost(report)}>Eliminar publicación</button></div>
      </div>
      <p className="text-sm mt-3">{report.post_text}</p>{report.post_image && <img className="post-image rounded-xl mt-3" src={report.post_image} alt="Imagen de la publicación reportada"/>}<p className="notice mt-3">Motivo del reporte: {report.reason}</p>
    </article>)}</div> : <div className="empty-state"><ShieldCheck size={36} className="mx-auto mb-3 text-green-600"/><strong>No hay reportes registrados.</strong><p className="text-sm mt-2">Cuando una persona reporte una publicación, aparecerá aquí.</p></div>}
  </>;
}
