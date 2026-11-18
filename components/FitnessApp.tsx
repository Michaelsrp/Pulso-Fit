"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ComponentType, FormEvent } from "react";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import {
  ArrowLeft, ArrowRight, Check, Dumbbell, LogOut, Menu, MessageCircle, Salad, Settings,
  Send, ShieldCheck, UserRound, Users, X,
  ExternalLink,
} from "lucide-react";
import { getSupabaseBrowser, isSupabaseConfigured } from "@/lib/supabase/client";
import { Exercise, commonExerciseMistakes, equipmentLabels, exerciseNameEs, targetLabels } from "@/lib/exercises";
import { estimateDailyCalories } from "@/lib/nutrition";
import { routineActivities, type RoutineActivity } from "@/lib/routine-content";
import { makePlan, type DayPlan } from "@/lib/plan-builder";
import ExerciseAnimation from "@/components/fitness/ExerciseAnimation";
import AdviceContent from "@/components/fitness/AdviceContent";
import ProfileView from "@/components/fitness/ProfileView";
import SocialView from "@/components/fitness/SocialView";
import type { FeedPost } from "@/components/fitness/types";
import HomeTipsView, { type AdviceCard } from "@/components/fitness/HomeTipsView";
import TrainingView from "@/components/fitness/TrainingView";
import NutritionView from "@/components/fitness/NutritionView";
import SettingsView from "@/components/fitness/SettingsView";
import ModerationView, { type ModerationReport } from "@/components/fitness/ModerationView";

type Gender = "hombre" | "mujer" | "prefiero_no_decirlo";
type Goal = "bajar_peso" | "mantener" | "subir_peso" | "ganar_masa_muscular";
type Place = "gimnasio" | "casa" | "aire_libre";
type RoutinePreference = "fuerza" | "tonificacion" | "equilibrada";
type Profile = {
  id?: string; username: string; avatar_url?: string | null; avatar_storage_path?: string | null; gender: Gender; routine_preference?: RoutinePreference | null;
  weight_kg: number; height_cm: number; birth_date: string; goal: Goal; training_place: Place;
};
type Section = "inicio" | "perfil" | "entrenamiento" | "alimentacion" | "social" | "ajustes" | "consejos" | "moderacion";
type Post = FeedPost;
type ReportView = ModerationReport;

type ReportRecord = { id: string; post_id: string; reporter_id: string; reason: string; status: "pending" | "reviewed"; created_at: string };
type ReportPostRecord = { id: string; text: string; image_url: string | null };
type PublicAuthorRecord = { id: string; username: string; avatar_url?: string | null };
type PostQueryRecord = { id: string; user_id: string; image_url: string | null; text: string; created_at: string; likes: Array<{ count: number }> | null; comments: Array<{ count: number }> | null };
type CommentRecord = { id: string; text: string; user_id: string; created_at: string; is_hidden: boolean };
type RoutineExerciseRecord = { order_index: number; sets: number; reps: string; rest_seconds: number; exercise: ExerciseDbRecord | ExerciseDbRecord[] | null };
type ExerciseDbRecord = { id: string; source_id: string | null; name: string; name_es: string | null; category: string; body_part: string; equipment: string; target: string; secondary_muscles: string[] | null; instructions: string[] | null; media_id: string | null; media_url: string | null };
type RoutineDayRecord = { id: string; weekday: string; focus: string; warmup: RoutineActivity[] | null; cooldown: RoutineActivity[] | null; routine_exercises: RoutineExerciseRecord[] | null };

const WHATSAPP = "https://wa.me/573118042681";
const images = {
  gym: "/images/consejo-gimnasio.svg",
  home: "/images/consejo-casa.svg",
  run: "/images/consejo-correr.svg",
  warmup: "/images/consejo-calentar.svg",
  menFood: "/images/consejo-alimentacion-hombres.svg",
  womenFood: "/images/consejo-alimentacion-mujeres.svg",
  food: "/images/consejo-alimentacion-general.svg",
};
const cards: AdviceCard[] = [
  { id: "gym", title: "Entrenar en el gimnasio", desc: "Organiza tu sesión y aprovecha cada estación.", category: "Entrenamiento", image: images.gym, icon: "🏋️" },
  { id: "home", title: "Entrenar en casa", desc: "Muévete con ejercicios prácticos y poco equipo.", category: "Entrenamiento", image: images.home, icon: "🏠" },
  { id: "run", title: "Salir a correr", desc: "Empieza progresivamente y encuentra tu ritmo.", category: "Entrenamiento", image: images.run, icon: "🏃" },
  { id: "warmup", title: "Cómo calentar antes de cualquier actividad", desc: "Prepara articulaciones y músculos antes de entrenar.", category: "Calentamiento", image: images.warmup, icon: "🌤️" },
  { id: "men-food", title: "Alimentación para hombres", desc: "Ideas equilibradas para acompañar tu actividad.", category: "Alimentación", image: images.menFood, icon: "🥗" },
  { id: "women-food", title: "Alimentación para mujeres", desc: "Opciones variadas, suficientes y fáciles de combinar.", category: "Alimentación", image: images.womenFood, icon: "🍓" },
  { id: "food", title: "Alimentación general", desc: "Hábitos sostenibles y platos completos.", category: "Alimentación", image: images.food, icon: "🍎" },
];
const navItems: { id: Section | "whatsapp"; label: string; icon: ComponentType<{ size?: number }> }[] = [
  { id: "perfil", label: "Perfil", icon: UserRound }, { id: "entrenamiento", label: "Entrenamiento", icon: Dumbbell },
  { id: "alimentacion", label: "Alimentación", icon: Salad }, { id: "social", label: "Social", icon: Users },
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle }, { id: "ajustes", label: "Ajustes", icon: Settings },
];
const goalNames: Record<Goal, string> = { bajar_peso: "Bajar de peso", mantener: "Mantenerme", subir_peso: "Subir de peso", ganar_masa_muscular: "Ganar masa muscular" };
const placeNames: Record<Place, string> = { gimnasio: "Gimnasio", casa: "Casa", aire_libre: "Aire libre" };
const genderNames: Record<Gender, string> = { hombre: "Hombre", mujer: "Mujer", prefiero_no_decirlo: "Prefiero no decirlo" };
const demoPosts: Post[] = [
  { id: "demo-1", username: "Laura Fit", text: "Hoy elegí una rutina corta en casa. ¡La constancia también se construye con 20 minutos! 💛💪", image_url: images.home, created_at: new Date().toISOString(), likes: 18, comments: 3 },
  { id: "demo-2", username: "Andrés", text: "Primer trote de la semana. Paso a paso y sin compararme con nadie. 🏃‍♂️🌿", image_url: images.run, created_at: new Date(Date.now() - 3600_000).toISOString(), likes: 12, comments: 2 },
];

function calcAge(date: string) { if (!date) return 0; const d = new Date(`${date}T00:00:00`); const now = new Date(); let age = now.getFullYear() - d.getFullYear(); if (now < new Date(now.getFullYear(), d.getMonth(), d.getDate())) age--; return age; }

function Logo() { return <div className="brand" aria-label="Pulso Fit"><span>Pulso</span><span className="pulse">Fit</span></div>; }

function WhatsAppButton() { return <a className="whatsapp-float" href={WHATSAPP} target="_blank" rel="noreferrer" aria-label="Abrir conversación de WhatsApp"><MessageCircle size={27}/></a>; }

export default function FitnessApp() {
  const supabase = useMemo(() => getSupabaseBrowser(), []);
  const configured = isSupabaseConfigured();
  const [section, setSection] = useState<Section>("inicio");
  const [drawer, setDrawer] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userId, setUserId] = useState<string | undefined>();
  const [authMode, setAuthMode] = useState<"registro" | "login">("registro");
  const [loading, setLoading] = useState(true);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authUsername, setAuthUsername] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [resetView, setResetView] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [passwordRecovery, setPasswordRecovery] = useState(false);
  const [demo, setDemo] = useState(false);
  const [gender, setGender] = useState<Gender>("prefiero_no_decirlo");
  const [routinePreference, setRoutinePreference] = useState<RoutinePreference>("equilibrada");
  const [weight, setWeight] = useState("70");
  const [height, setHeight] = useState("170");
  const [birthDate, setBirthDate] = useState("");
  const [goal, setGoal] = useState<Goal>("mantener");
  const [place, setPlace] = useState<Place>("gimnasio");
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todas");
  const [selectedCard, setSelectedCard] = useState<(typeof cards)[number] | null>(null);
  const [routineDay, setRoutineDay] = useState(0);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [posts, setPosts] = useState<Post[]>(demoPosts);
  const [dbPlan, setDbPlan] = useState<DayPlan[] | null>(null);
  const [postText, setPostText] = useState("");
  const [postFile, setPostFile] = useState<File | null>(null);
  const [postBusy, setPostBusy] = useState(false);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [newUsername, setNewUsername] = useState("");
  const [commentsFor, setCommentsFor] = useState<string | null>(null);
  const [isModerator, setIsModerator] = useState(false);
  const [reportRows, setReportRows] = useState<ReportView[]>([]);
  const [reportsBusy, setReportsBusy] = useState(false);
  const [reportsRefresh, setReportsRefresh] = useState(0);
  const [signedUrlTick, setSignedUrlTick] = useState(0);
  const [likeBusyIds, setLikeBusyIds] = useState<Set<string>>(new Set());
  const likeBusyRef = useRef<Set<string>>(new Set());
  const [comments, setComments] = useState<{ id: string; user_id?: string; username: string; text: string }[]>([]);
  const [commentText, setCommentText] = useState("");
  const [colorblind, setColorblind] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [showExerciseDetails, setShowExerciseDetails] = useState(false);
  const [toast, setToast] = useState("");

  const notify = useCallback((message: string) => { setToast(message); window.setTimeout(() => setToast(""), 3200); }, []);
  const resolveStorageUrls = useCallback(async (bucket: "avatars" | "post-images", values: Array<string | null | undefined>): Promise<Array<string | null>> => {
    const normalized = values.map(value => {
      if (!value) return null;
      if (/^https?:\/\//i.test(value)) {
        const legacy = value.match(new RegExp(`/object/(?:public|sign|authenticated)/${bucket}/(.+?)(?:\\?|$)`));
        return legacy ? decodeURIComponent(legacy[1]) : null;
      }
      return value;
    });
    const paths = [...new Set(normalized.filter((path): path is string => Boolean(path)))];
    if (!supabase || paths.length === 0) return values.map(value => value && /^https?:\/\//i.test(value) ? value : null);
    const { data, error } = await supabase.storage.from(bucket).createSignedUrls(paths, 60 * 60);
    if (error || !data) return values.map(value => value && /^https?:\/\//i.test(value) ? value : null);
    const signedItems = data as unknown as Array<{ path: string; signedUrl: string }>;
    const signed = new Map<string, string>(signedItems.map((item: { path: string; signedUrl: string }) => [item.path, item.signedUrl]));
    return normalized.map((path, index) => {
      const original = values[index];
      if (!path) return original && /^https?:\/\//i.test(original) ? original : null;
      return signed.get(path) || null;
    });
  }, [supabase]);
  const resolveStorageUrl = useCallback(async (bucket: "avatars" | "post-images", value?: string | null): Promise<string | null> => {
    const [url] = await resolveStorageUrls(bucket, [value]);
    return typeof url === "string" ? url : null;
  }, [resolveStorageUrls]);

  const loadProfile = useCallback(async (uid: string) => {
    if (!supabase) return;
    const { data } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
    if (data) {
      const storedPath = (data.avatar_url as string | null) || null;
      const signedAvatar = await resolveStorageUrl("avatars", storedPath);
      const p = { ...(data as Profile), avatar_storage_path: storedPath, avatar_url: signedAvatar };
      setProfile(p); setNewUsername(p.username || "");
    }
  }, [supabase, resolveStorageUrl]);
  const refreshModeratorRole = useCallback(async () => {
    if (!supabase) { setIsModerator(false); return; }
    const { data, error } = await supabase.rpc("is_pulso_moderator");
    setIsModerator(!error && data === true);
  }, [supabase]);

  useEffect(() => {
    let alive = true;
    async function boot() {
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (alive && session?.user) { setUserId(session.user.id); setNewUsername(session.user.user_metadata?.username || ""); await loadProfile(session.user.id); await refreshModeratorRole(); }
        const { data: listener } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, sessionNow: Session | null) => {
          if (event === "PASSWORD_RECOVERY") setPasswordRecovery(true);
          if (sessionNow?.user) { setUserId(sessionNow.user.id); void loadProfile(sessionNow.user.id); void refreshModeratorRole(); }
          else { setUserId(undefined); setProfile(null); setIsModerator(false); setReportRows([]); }
        });
        if (alive) setLoading(false);
        return () => listener.subscription.unsubscribe();
      }
      try {
        const raw = localStorage.getItem("pulsofit_demo_profile");
        if (raw && alive) { const p = JSON.parse(raw) as Profile; setProfile(p); setDemo(true); setNewUsername(p.username); }
      } catch { /* ignored */ }
      if (alive) setLoading(false);
    }
    let cleanup: (() => void) | undefined;
    void boot().then(fn => { cleanup = fn; });
    return () => { alive = false; cleanup?.(); };
  }, [supabase, loadProfile, refreshModeratorRole]);


  useEffect(() => {
    const timer = window.setInterval(() => setSignedUrlTick(value => value + 1), 50 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    if (!profile?.avatar_storage_path) return;
    void resolveStorageUrl("avatars", profile.avatar_storage_path).then(url => {
      setProfile(current => current ? { ...current, avatar_url: url } : current);
    });
  }, [signedUrlTick, profile?.avatar_storage_path, resolveStorageUrl]);
  useEffect(() => {
    const syncSectionFromHistory = () => {
      const fragment = window.location.hash.replace(/^#/, "");
      if (!fragment) { setSection("inicio"); return; }
      const candidate = fragment as Section;
      const allowed: Section[] = ["inicio", "perfil", "entrenamiento", "alimentacion", "social", "ajustes", "consejos", "moderacion"];
      if (allowed.includes(candidate)) setSection(candidate);
    };
    syncSectionFromHistory();
    window.addEventListener("popstate", syncSectionFromHistory);
    window.addEventListener("hashchange", syncSectionFromHistory);
    return () => {
      window.removeEventListener("popstate", syncSectionFromHistory);
      window.removeEventListener("hashchange", syncSectionFromHistory);
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("a11y-colorblind", colorblind);
    document.documentElement.classList.toggle("a11y-high", highContrast);
    document.documentElement.classList.toggle("a11y-large", largeText);
  }, [colorblind, highContrast, largeText]);

  // Mantiene el teclado dentro de diálogos y devuelve el foco al control que los abrió.
  useEffect(() => {
    const dialog = document.querySelector<HTMLElement>('[role="dialog"][aria-modal="true"]');
    if (!dialog) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const getFocusable = () => Array.from(dialog.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )).filter(node => node.offsetParent !== null);
    getFocusable()[0]?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDrawer(false); setSelectedCard(null); setSelectedExercise(null); setCommentsFor(null);
        return;
      }
      if (event.key !== "Tab") return;
      const nodes = getFocusable();
      if (!nodes.length) { event.preventDefault(); dialog.focus(); return; }
      const first = nodes[0]; const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    dialog.addEventListener("keydown", onKeyDown);
    return () => { dialog.removeEventListener("keydown", onKeyDown); previousFocus?.focus(); };
  }, [drawer, selectedCard, selectedExercise, commentsFor]);

  useEffect(() => {
    if (!supabase || !profile) return;
    let active = true;
    void (async () => {
      const { data, error } = await supabase.from("posts").select("id,user_id,image_url,text,created_at,likes(count),comments(count)").order("created_at", { ascending: false }).limit(30);
      if (error || !data || !active) return;
      const postRows = data as unknown as PostQueryRecord[];
      const ids = [...new Set(postRows.map(row => row.user_id))];
      const { data: authors } = await supabase.from("profiles_public").select("id,username,avatar_url").in("id", ids);
      const authorRows = (authors || []) as PublicAuthorRecord[];
      const [avatarUrls, postUrls] = await Promise.all([
        resolveStorageUrls("avatars", authorRows.map(row => row.avatar_url ?? null)),
        resolveStorageUrls("post-images", postRows.map(row => row.image_url)),
      ]);
      const authorMap = new Map(authorRows.map((author, index) => [author.id, { username: author.username, avatar_url: avatarUrls[index] || null }]));
      const { data: likedRows } = userId ? await supabase.from("likes").select("post_id").eq("user_id", userId) : { data: [] };
      const likedPostIds = ((likedRows || []) as Array<{ post_id: string }>).map((row: { post_id: string }) => row.post_id);
      const likedIds = new Set<string>(likedPostIds);
      const displayPosts: Post[] = postRows.map((row: PostQueryRecord, index: number): Post => {
        const author = authorMap.get(row.user_id);
        return {
          id: row.id, user_id: row.user_id, image_path: row.image_url,
          image_url: postUrls[index] || null, text: row.text, created_at: row.created_at,
          likes: row.likes?.[0]?.count || 0, comments: row.comments?.[0]?.count || 0,
          liked: likedIds.has(row.id), username: author?.username || "Usuario", avatar_url: author?.avatar_url || null,
        };
      });
      if (active) setPosts(displayPosts);
    })();
    return () => { active = false; };
  }, [supabase, profile, userId, resolveStorageUrls, signedUrlTick]);

  useEffect(() => {
    if (!supabase || !isModerator || section !== "moderacion") return;
    let active = true;
    setReportsBusy(true);
    void (async () => {
      const { data: reports, error } = await supabase.from("reports")
        .select("id,post_id,reporter_id,reason,status,created_at")
        .order("created_at", { ascending: false }).limit(100);
      if (error || !reports?.length) {
        if (active) { setReportRows([]); setReportsBusy(false); }
        return;
      }
      const reportRecords = reports as ReportRecord[];
      const postIds = [...new Set(reportRecords.map(report => report.post_id))];
      const reporterIds = [...new Set(reportRecords.map(report => report.reporter_id))];
      const [{ data: relatedPosts }, { data: reporters }] = await Promise.all([
        supabase.from("posts").select("id,text,image_url").in("id", postIds),
        supabase.from("profiles_public").select("id,username").in("id", reporterIds),
      ]);
      const postRecords = (relatedPosts || []) as ReportPostRecord[];
      const reporterRecords = (reporters || []) as Array<{ id: string; username: string }>;
      const postMap = new Map(postRecords.map(post => [post.id, post]));
      const userMap = new Map(reporterRecords.map(reporter => [reporter.id, reporter.username]));
      const imagePaths = reportRecords.map(report => postMap.get(report.post_id)?.image_url || null);
      const signedImages = await resolveStorageUrls("post-images", imagePaths);
      const rows = reportRecords.map((report, index) => {
        const post = postMap.get(report.post_id);
        return { id: report.id, post_id: report.post_id, reason: report.reason, status: report.status, created_at: report.created_at,
          reporter_name: userMap.get(report.reporter_id) || "Usuario", post_text: post?.text || "La publicación ya no está disponible",
          post_image: signedImages[index] || null, post_image_path: post?.image_url || null } as ReportView;
      });
      if (active) {
        setReportRows(rows);
        setReportsBusy(false);
      }
    })();
    return () => { active = false; };
  }, [supabase, isModerator, section, reportsRefresh, resolveStorageUrls, signedUrlTick]);

  const markReportReviewed = async (reportId: string) => {
    if (!supabase || !isModerator || !userId) return;
    const { error } = await supabase.from("reports").update({ status: "reviewed", reviewed_at: new Date().toISOString(), reviewed_by: userId }).eq("id", reportId);
    if (error) { notify(`No se pudo actualizar el reporte: ${error.message}`); return; }
    setReportRows(rows => rows.map(row => row.id === reportId ? { ...row, status: "reviewed" } : row));
    notify("Reporte marcado como revisado.");
  };

  const deleteReportedPost = async (report: ReportView) => {
    if (!supabase || !isModerator) return;
    if (!window.confirm("¿Eliminar definitivamente esta publicación reportada y su fotografía?")) return;
    if (report.post_image_path) {
      const { error: storageError } = await supabase.storage.from("post-images").remove([report.post_image_path]);
      if (storageError) { notify(`No se pudo eliminar la imagen: ${storageError.message}`); return; }
    }
    const { error } = await supabase.from("posts").delete().eq("id", report.post_id);
    if (error) { notify(`No se pudo eliminar la publicación: ${error.message}`); return; }
    setReportRows(rows => rows.filter(row => row.post_id !== report.post_id));
    setPosts(rows => rows.filter(row => row.id !== report.post_id));
    notify("Publicación reportada eliminada.");
  };
  const hideReportedComments = async (postId: string) => {
    if (!supabase || !isModerator) return;
    const { error } = await supabase.from("comments").update({ is_hidden: true }).eq("post_id", postId);
    if (error) { notify(`No se pudieron ocultar los comentarios: ${error.message}`); return; }
    notify("Comentarios ocultados para la comunidad.");
  };
  const deleteReportedComments = async (postId: string) => {
    if (!supabase || !isModerator) return;
    if (!window.confirm("¿Eliminar todos los comentarios de esta publicación?")) return;
    const { error } = await supabase.from("comments").delete().eq("post_id", postId);
    if (error) { notify(`No se pudieron eliminar los comentarios: ${error.message}`); return; }
    notify("Comentarios eliminados.");
  };
  const deleteMyAccount = async () => {
    if (!window.confirm("Esta acción es permanente. Se eliminarán tu perfil, publicaciones, comentarios, likes y fotografías. ¿Deseas continuar?")) return;
    if (demo || !supabase) {
      localStorage.removeItem("pulsofit_demo_profile");
      setProfile(null); setDemo(false); setPosts(demoPosts); setSection("inicio");
      notify("Se eliminó el perfil local de demostración."); return;
    }
    if (!userId) { notify("No encontramos una sesión activa. Vuelve a iniciar sesión e inténtalo de nuevo."); return; }
    const listOwnStoragePaths = async (bucket: "avatars" | "post-images") => {
      const paths: string[] = [];
      for (let offset = 0; ; offset += 100) {
        const { data, error } = await supabase.storage.from(bucket).list(userId, { limit: 100, offset, sortBy: { column: "name", order: "asc" } });
        if (error) throw new Error(`No se pudieron listar tus archivos de ${bucket}: ${error.message}`);
        const listedFiles = (data || []) as Array<{ id: string | null; metadata: Record<string, unknown> | null; name: string }>;
        const page = listedFiles
          .filter((file: { id: string | null; metadata: Record<string, unknown> | null; name: string }) => Boolean(file.id) || Boolean(file.metadata))
          .map((file: { id: string | null; metadata: Record<string, unknown> | null; name: string }) => `${userId}/${file.name}`);
        paths.push(...page);
        if ((data || []).length < 100) break;
      }
      return paths;
    };
    try {
      // Se listan las carpetas del usuario para eliminar también archivos huérfanos sin fila asociada.
      for (const bucket of ["avatars", "post-images"] as const) {
        const ownedPaths = await listOwnStoragePaths(bucket);
        for (let index = 0; index < ownedPaths.length; index += 100) {
          const { error: storageError } = await supabase.storage.from(bucket).remove(ownedPaths.slice(index, index + 100));
          if (storageError) throw new Error(`No se pudieron eliminar todos tus archivos de ${bucket}: ${storageError.message}`);
        }
      }
    } catch (error: unknown) {
      notify(error instanceof Error ? error.message : "No se pudieron eliminar tus fotografías. La cuenta no se ha eliminado.");
      return;
    }
    const { error } = await supabase.rpc("delete_my_pulso_account");
    if (error) { notify(`Se eliminaron los archivos de imagen, pero no se pudo eliminar la cuenta: ${error.message}`); return; }
    await supabase.auth.signOut();
    localStorage.removeItem("pulsofit_demo_profile");
    setProfile(null); setUserId(undefined); setIsModerator(false); setReportRows([]); setSection("inicio");
    notify("Tu cuenta y los datos asociados fueron eliminados.");
  };

  const handleAuth = async (e: FormEvent) => {
    e.preventDefault(); setAuthError(""); setAuthMessage("");
    if (!supabase) { setAuthError("Configura Supabase en .env.local o usa la demostración local."); return; }
    setAuthBusy(true);
    try {
      if (authMode === "registro") {
        if (!termsAccepted) throw new Error("Debes aceptar los términos de uso y la política de privacidad.");
        const { data, error } = await supabase.auth.signUp({ email: authEmail, password: authPassword, options: { data: { username: authUsername, terms_accepted: true, terms_version: "2026-11-18" } } });
        if (error) throw error;
        if (data.user) {
          setNewUsername(authUsername);
          if (data.session) setUserId(data.user.id);
          setAuthMessage(data.session ? "Cuenta creada. Completa tu perfil para continuar." : "Cuenta creada. Confirma tu correo y luego inicia sesión para completar tu perfil.");
          setAuthMode(data.session ? "registro" : "login");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
        if (error) throw error;
        if (data.user) { setUserId(data.user.id); setNewUsername(data.user.user_metadata?.username || "Atleta"); await loadProfile(data.user.id); await refreshModeratorRole(); }
      }
    } catch (err: unknown) { setAuthError(err instanceof Error ? err.message : "No fue posible autenticarte."); }
    finally { setAuthBusy(false); }
  };

  const sendPasswordReset = async () => {
    setAuthError(""); setAuthMessage("");
    if (!supabase || !authEmail.trim()) { setAuthError("Escribe primero tu correo electrónico."); return; }
    setAuthBusy(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(authEmail.trim(), { redirectTo: `${window.location.origin}/` });
      if (error) throw error;
      setAuthMessage("Si el correo está registrado, recibirás un enlace para crear una contraseña nueva.");
    } catch (error: unknown) { setAuthError(error instanceof Error ? error.message : "No se pudo enviar el enlace."); }
    finally { setAuthBusy(false); }
  };
  const updatePassword = async () => {
    if (!supabase || newPassword.length < 8) { setAuthError("La contraseña debe tener al menos 8 caracteres."); return; }
    setAuthBusy(true); setAuthError("");
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setPasswordRecovery(false); setNewPassword(""); setAuthMessage("Tu contraseña se actualizó. Ya puedes continuar.");
    } catch (error: unknown) { setAuthError(error instanceof Error ? error.message : "No se pudo actualizar la contraseña."); }
    finally { setAuthBusy(false); }
  };

  const enterDemo = () => { setDemo(true); setOnboardingStep(1); setAuthError(""); };
  const saveProfile = async () => {
    const p: Profile = { id: userId || "demo-user", username: newUsername.trim() || authUsername || "Atleta", gender, routine_preference: gender === "prefiero_no_decirlo" ? routinePreference : null,
      weight_kg: Number(weight), height_cm: Number(height), birth_date: birthDate, goal, training_place: place };
    if (!p.username || !p.weight_kg || !p.height_cm || !p.birth_date || calcAge(p.birth_date) < 18) { notify("Revisa tus datos. El registro es solo para personas mayores de 18 años."); return; }
    if (supabase && userId) {
      const { error } = await supabase.from("profiles").upsert({ ...p, id: userId, terms_accepted_at: new Date().toISOString() }, { onConflict: "id" });
      if (error) { notify(`No se pudo guardar el perfil: ${error.message}`); return; }
    } else { localStorage.setItem("pulsofit_demo_profile", JSON.stringify(p)); }
    setProfile(p); setNewUsername(p.username); window.history.replaceState({ section: "inicio" }, "", "#inicio"); setSection("inicio"); notify("¡Perfil guardado! Tu experiencia ya está personalizada.");
  };
  const logout = async () => { if (supabase) await supabase.auth.signOut(); localStorage.removeItem("pulsofit_demo_profile"); setProfile(null); setIsModerator(false); setReportRows([]); setDemo(false); setOnboardingStep(1); window.history.replaceState({ section: "inicio" }, "", "#inicio"); setSection("inicio"); setDrawer(false); };

  const filteredCards = cards.filter(c => (category === "Todas" || c.category === category) && `${c.title} ${c.desc}`.toLowerCase().includes(query.toLowerCase()));
  useEffect(() => {
    let active = true;
    if (!supabase || !profile) { setDbPlan(null); return; }
    void (async () => {
      let routineQuery = supabase.from("routines").select("id")
        .eq("gender", profile.gender).eq("goal", profile.goal).eq("place", profile.training_place);
      routineQuery = profile.gender === "prefiero_no_decirlo"
        ? routineQuery.eq("routine_preference", profile.routine_preference || "equilibrada")
        : routineQuery.is("routine_preference", null);
      const { data: routine } = await routineQuery.maybeSingle();
      if (!routine) { if (active) setDbPlan(null); return; }
      const { data: dayRows } = await supabase.from("routine_days")
        .select("id,weekday,focus,warmup,cooldown,routine_exercises(order_index,sets,reps,rest_seconds,exercise:exercises(id,source_id,name,name_es,category,body_part,equipment,target,secondary_muscles,instructions,media_id,media_url,place))")
        .eq("routine_id", routine.id);
      if (!active || !dayRows?.length) { if (active) setDbPlan(null); return; }
      const order = ["lunes", "martes", "miercoles", "jueves", "viernes"];
      const dayRecords = dayRows as unknown as RoutineDayRecord[];
      const mapped: DayPlan[] = dayRecords.map(day => ({
        day: day.weekday === "miercoles" ? "Miércoles" : day.weekday.charAt(0).toUpperCase() + day.weekday.slice(1),
        title: day.focus,
        warmup: day.warmup || routineActivities(profile.training_place).warmup,
        cooldown: day.cooldown || routineActivities(profile.training_place).cooldown,
        exercises: (day.routine_exercises || []).slice().sort((a, b) => a.order_index - b.order_index).flatMap(row => {
          const ex = Array.isArray(row.exercise) ? row.exercise[0] : row.exercise;
          if (!ex) return [];
          const exercise: Exercise = { id: ex.id || ex.source_id || `exercise-${row.order_index}`, source_id: ex.source_id || undefined, name: ex.name, name_es: ex.name_es,
            category: ex.category, body_part: ex.body_part, equipment: ex.equipment, target: ex.target, secondary_muscles: ex.secondary_muscles || [],
            steps_es: ex.instructions || [], media_id: ex.media_id || undefined, media_url: ex.media_url,
            level: `${row.sets} series · ${row.reps} repeticiones · ${row.rest_seconds}s descanso` };
          return [exercise];
        }),
      })).sort((a, b) => order.indexOf(a.day.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,""))-order.indexOf(b.day.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")));
      if (active) setDbPlan(mapped);
    })();
    return () => { active = false; };
  }, [supabase, profile]);

  const plan = useMemo(() => dbPlan ?? (profile ? makePlan(profile) : []), [profile, dbPlan]);
  const nutritionEstimate = useMemo(() => {
    if (!profile) return null;
    return estimateDailyCalories({ gender: profile.gender, goal: profile.goal, weightKg: profile.weight_kg, heightCm: profile.height_cm, age: calcAge(profile.birth_date) });
  }, [profile]);
  const estimateCalories = nutritionEstimate?.calories ?? null;
  const caloriesClamped = nutritionEstimate?.clamped ?? false;

  const uploadPhoto = async (file: File, bucket: "avatars" | "post-images") => {
    if (!supabase || !userId) return null;
    const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
    const maxBytes = bucket === "avatars" ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
    if (!allowedTypes.has(file.type)) throw new Error("Usa una imagen JPG, PNG o WebP.");
    if (file.size > maxBytes) throw new Error(`La imagen supera el límite de ${bucket === "avatars" ? "5 MB" : "10 MB"}.`);
    const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false, contentType: file.type });
    if (error) throw error;
    return path;
  };
  const saveProfileDetails = async () => {
    if (!profile) return;
    let avatarStoragePath = profile.avatar_storage_path || null;
    let avatar = profile.avatar_url || null;
    try {
      if (profileFile && supabase && userId) {
        avatarStoragePath = await uploadPhoto(profileFile, "avatars");
        avatar = await resolveStorageUrl("avatars", avatarStoragePath);
      } else if (profileFile) {
        avatar = URL.createObjectURL(profileFile);
      }
    }
    catch (err: unknown) { notify(`No se pudo cargar la foto: ${err instanceof Error ? err.message : "Error desconocido"}`); return; }
    const updated = { ...profile, username: newUsername.trim() || profile.username, avatar_url: avatar, avatar_storage_path: avatarStoragePath };
    if (supabase && userId) {
      const { error } = await supabase.from("profiles").update({ username: updated.username, avatar_url: avatarStoragePath }).eq("id", userId);
      if (error) { notify(error.message); return; }
      if (profile.avatar_storage_path && avatarStoragePath && profile.avatar_storage_path !== avatarStoragePath) {
        const { error: oldAvatarError } = await supabase.storage.from("avatars").remove([profile.avatar_storage_path]);
        if (oldAvatarError) notify(`Perfil actualizado, pero no se pudo retirar la fotografía anterior: ${oldAvatarError.message}`);
      }
    } else localStorage.setItem("pulsofit_demo_profile", JSON.stringify(updated));
    setProfile(updated); setProfileFile(null); notify("Perfil actualizado.");
  };
  const createPost = async (e: FormEvent) => {
    e.preventDefault();
    const authorProfile = profile;
    if (!authorProfile) { notify("Completa tu perfil antes de publicar."); return; }
    const text = postText.trim();
    if (text.length > 1000) { notify("La publicación no puede superar 1.000 caracteres."); return; }
    if (!text && !postFile) return;
    setPostBusy(true);
    let uploadedPath: string | null = null;
    try {
      if (postFile && supabase && userId) uploadedPath = await uploadPhoto(postFile, "post-images");
      if (supabase && userId) {
        const { data, error } = await supabase.from("posts")
          .insert({ user_id: userId, image_url: uploadedPath, text })
          .select("id,user_id,image_url,text,created_at")
          .single();
        if (error) throw error;
        const displayImage = await resolveStorageUrl("post-images", data.image_url);
        setPosts(prev => [{ ...data, image_path: data.image_url, image_url: displayImage, username: authorProfile.username, avatar_url: authorProfile.avatar_url || null, likes: 0, comments: 0 }, ...prev]);
      } else {
        const localUrl = postFile ? URL.createObjectURL(postFile) : undefined;
        setPosts(prev => [{ id: `local-${Date.now()}`, username: authorProfile.username, avatar_url: authorProfile.avatar_url, image_url: localUrl, text, created_at: new Date().toISOString(), likes: 0, comments: 0 }, ...prev]);
      }
      setPostText(""); setPostFile(null); notify("¡Publicación compartida!");
    } catch (error: unknown) {
      if (uploadedPath && supabase) await supabase.storage.from("post-images").remove([uploadedPath]);
      notify(error instanceof Error ? error.message : "No se pudo publicar.");
    } finally { setPostBusy(false); }
  };
  const toggleLike = async (post: Post) => {
    if (likeBusyRef.current.has(post.id)) return;
    likeBusyRef.current.add(post.id);
    setLikeBusyIds(new Set(likeBusyRef.current));
    try {
      if (supabase && userId && !post.id.startsWith("demo-") && !post.id.startsWith("local-")) {
        const result = post.liked
          ? await supabase.from("likes").delete().eq("post_id", post.id).eq("user_id", userId)
          : await supabase.from("likes").insert({ post_id: post.id, user_id: userId });
        if (result.error) throw result.error;
      }
      setPosts(previous => previous.map(item => item.id === post.id ? { ...item, liked: !item.liked, likes: Math.max(0, item.likes + (item.liked ? -1 : 1)) } : item));
    } catch (error: unknown) { notify(error instanceof Error ? error.message : "No se pudo actualizar el me gusta."); }
    finally {
      likeBusyRef.current.delete(post.id);
      setLikeBusyIds(new Set(likeBusyRef.current));
    }
  };
  const deletePost = async (post: Post) => {
    if (post.user_id && userId && post.user_id !== userId) return;
    if (supabase && userId && !post.id.startsWith("local-") && !post.id.startsWith("demo-")) {
      const imagePath = post.image_path || null;
      if (imagePath) {
        const { error: storageError } = await supabase.storage.from("post-images").remove([imagePath]);
        if (storageError) { notify(`No se pudo eliminar la fotografía: ${storageError.message}`); return; }
      }
      const { error } = await supabase.from("posts").delete().eq("id", post.id).eq("user_id", userId);
      if (error) { notify(error.message); return; }
    }
    setPosts(previous => previous.filter(item => item.id !== post.id)); notify("Publicación eliminada.");
  };
  const reportPost = async (post: Post) => {
    if (supabase && userId && !post.id.startsWith("demo-") && !post.id.startsWith("local-")) {
      const { error } = await supabase.from("reports").insert({ post_id: post.id, reporter_id: userId, reason: "Contenido reportado por la comunidad" });
      if (error) {
        if (error.code === "23505") { notify("Ya reportaste esta publicación. Gracias por ayudar a cuidar la comunidad."); return; }
        notify(`No fue posible registrar el reporte: ${error.message}`); return;
      }
      notify("Reporte enviado. El equipo de moderación podrá revisarlo.");
      return;
    }
    notify("En modo demostración los reportes no se guardan en una base compartida.");
  };
  const openComments = async (postId: string) => {
    setCommentsFor(postId); setComments([]);
    if (supabase) {
      const { data, error } = await supabase.from("comments").select("id,text,user_id,created_at,is_hidden").eq("post_id", postId).eq("is_hidden", false).order("created_at");
      if (error) { notify(error.message); return; }
      const commentRows = (data || []) as CommentRecord[];
      const ids = [...new Set(commentRows.map(comment => comment.user_id))];
      const { data: authors } = ids.length ? await supabase.from("profiles_public").select("id,username").in("id", ids) : { data: [] };
      const authorRows = (authors || []) as Array<{ id: string; username: string }>;
      const authorsById = new Map(authorRows.map(author => [author.id, author.username]));
      setComments(commentRows.map(comment => ({ id: comment.id, user_id: comment.user_id, username: authorsById.get(comment.user_id) || "Usuario", text: comment.text })));
    } else setComments([{ id: "c1", username: "Comunidad", text: "¡Qué buena energía! Sigue a tu ritmo 🙌" }]);
  };
  const addComment = async () => {
    const commentAuthor = profile;
    if (!commentsFor || !commentText.trim() || !commentAuthor) return;
    if (supabase && userId) {
      const { error } = await supabase.from("comments").insert({ post_id: commentsFor, user_id: userId, text: commentText.trim() });
      if (error) { notify(error.message); return; }
    }
    setComments(prev => [...prev, { id: `c-${Date.now()}`, user_id: userId, username: commentAuthor.username, text: commentText.trim() }]);
    setCommentText("");
  };
  const deleteComment = async (commentId: string) => {
    const target = comments.find(comment => comment.id === commentId);
    if (!target || !userId || target.user_id !== userId) return;
    if (supabase) {
      const { error } = await supabase.from("comments").delete().eq("id", commentId).eq("user_id", userId);
      if (error) { notify(error.message); return; }
    }
    setComments(previous => previous.filter(comment => comment.id !== commentId));
    notify("Comentario eliminado.");
  };

  if (passwordRecovery) return <div className="auth-wrap"><div className="auth-art"><Logo/><h1>Una nueva contraseña.</h1><p>Elige una contraseña segura para volver a Pulso Fit.</p></div><div className="auth-card"><h2>Actualizar contraseña</h2><div className="field"><label htmlFor="newPassword">Nueva contraseña</label><input id="newPassword" type="password" minLength={8} autoComplete="new-password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} required/></div>{authError && <p role="alert" className="text-sm text-red-600">{authError}</p>}<button className="primary-button w-full" disabled={authBusy} onClick={()=>void updatePassword()}>Guardar contraseña</button></div><WhatsAppButton/></div>;
  if (resetView && !profile) return <div className="auth-wrap"><div className="auth-art"><Logo/><h1>Recupera tu acceso.</h1><p>Te enviaremos un enlace a tu correo para crear una contraseña nueva.</p></div><div className="auth-card"><h2>Restablecer contraseña</h2><div className="field"><label htmlFor="resetEmail">Correo electrónico</label><input id="resetEmail" type="email" value={authEmail} onChange={e=>setAuthEmail(e.target.value)} required/></div>{authError && <p role="alert" className="text-sm text-red-600">{authError}</p>}{authMessage && <p role="status" className="text-sm text-green-700">{authMessage}</p>}<button className="primary-button w-full" disabled={authBusy} onClick={()=>void sendPasswordReset()}>Enviar enlace de recuperación</button><button className="auth-switch w-full" onClick={()=>{setResetView(false);setAuthError("");}}>Volver al inicio de sesión</button></div><WhatsAppButton/></div>;

  if (loading) return <div className="min-h-screen grid place-items-center"><div className="text-center"><Logo/><p className="text-sm text-slate-500 mt-4">Preparando tu espacio de bienestar…</p></div><WhatsAppButton/></div>;
  if (!profile && !userId && !demo) {
    if (configured) return <div className="auth-wrap"><div className="auth-art"><Logo/><span className="eyebrow mt-8">Tu bienestar, a tu ritmo</span><h1>Un paso a la vez.<br/>Un progreso real.</h1><p>Encuentra una rutina que encaje con tu día, sin presión y con opciones para avanzar.</p></div><div className="auth-card"><h2>{authMode === "registro" ? "Crea tu cuenta" : "Qué bueno verte"}</h2><p>{authMode === "registro" ? "Únete a una comunidad que celebra cada avance." : "Ingresa para continuar con tu entrenamiento."}</p><form onSubmit={handleAuth}>
      {authMode === "registro" && <div className="field"><label htmlFor="username">Nombre de usuario</label><input id="username" value={authUsername} onChange={e=>setAuthUsername(e.target.value)} required placeholder="¿Cómo te llamamos?" minLength={2}/></div>}
      <div className="field"><label htmlFor="email">Correo electrónico</label><input id="email" type="email" value={authEmail} onChange={e=>setAuthEmail(e.target.value)} required autoComplete="email" placeholder="tu@correo.com"/></div>
      <div className="field"><label htmlFor="password">Contraseña</label><input id="password" type="password" value={authPassword} onChange={e=>setAuthPassword(e.target.value)} required minLength={8} autoComplete={authMode === "registro" ? "new-password" : "current-password"} placeholder="Mínimo 8 caracteres"/></div>
      {authMode === "registro" && <div className="field"><label className="checkbox-line"><input type="checkbox" checked={termsAccepted} onChange={e=>setTermsAccepted(e.target.checked)} required/><span>He leído y acepto los <a className="text-link" href="/terminos" target="_blank">Términos de uso</a> y la <a className="text-link" href="/privacidad" target="_blank">Política de privacidad</a>.</span></label></div>}
      {authError && <p className="text-sm text-red-600" role="alert">{authError}</p>}{authMessage && <p className="text-sm text-green-700" role="status">{authMessage}</p>}
      <button className="primary-button w-full mt-3" type="submit" disabled={authBusy}>{authBusy ? "Un momento…" : authMode === "registro" ? "Crear cuenta" : "Iniciar sesión"} <ArrowRight size={17}/></button>
    </form>{authMode === "login" && <button className="auth-switch w-full" onClick={()=>setResetView(true)}>¿Olvidaste tu contraseña?</button>}<button className="auth-switch w-full" onClick={()=>{setAuthMode(authMode === "registro" ? "login" : "registro");setAuthError("");setTermsAccepted(false);}}>{authMode === "registro" ? "¿Ya tienes cuenta? Inicia sesión" : "¿Aún no tienes cuenta? Regístrate"}</button></div><WhatsAppButton/></div>;
    return <div className="auth-wrap"><div className="auth-art"><Logo/><span className="eyebrow mt-8">Tu bienestar, a tu ritmo</span><h1>Empieza donde estás.<br/>Avanza a tu manera.</h1><p>Personaliza tu experiencia de actividad física y bienestar, con pequeñas metas sostenibles.</p><span className="text-sm font-extrabold mt-8">✨ Cada avance cuenta.</span></div><div className="auth-card"><h2>Bienvenido a Pulso Fit</h2><p>{configured ? "Inicia sesión o crea tu cuenta para configurar tu perfil." : "Estás viendo una vista previa. Puedes recorrer el onboarding sin conectar todavía Supabase."}</p>{configured ? <><button className="primary-button w-full" onClick={()=>{setDemo(false);setAuthMode("registro");}}>Crear cuenta</button><button className="outline-button w-full mt-3" onClick={()=>{setDemo(false);setAuthMode("login");}}>Iniciar sesión</button></> : <button className="primary-button w-full" onClick={enterDemo}>Explorar demostración <ArrowRight size={17}/></button>}<p className="notice mt-5">{configured ? "Tus credenciales las gestiona Supabase Auth. Pulso Fit no almacena contraseñas." : "Modo demostración local: los datos no se sincronizan ni se consideran una cuenta real."}</p></div><WhatsAppButton/></div>;
  }

  if (!profile && (userId || demo)) {
    return <div className="auth-wrap"><div className="auth-art"><Logo/><span className="eyebrow mt-8">Personaliza tu plan</span><h1>Tu punto de partida es único.</h1><p>Cuéntanos un poco sobre ti para preparar una experiencia más útil.</p></div><div className="auth-card"><div className="flex justify-between text-xs font-extrabold text-slate-500"><span>PASO {onboardingStep} DE 2</span><span>{onboardingStep === 1 ? "Preferencias" : "Datos y objetivo"}</span></div><div className="stepper"><span style={{width:`${onboardingStep*50}%`}}/></div>
      {onboardingStep === 1 ? <><h2>¿Cómo te identificas?</h2><p>Usaremos esta preferencia para personalizar el contenido, sin limitar tus posibilidades.</p><div className="choice-grid" style={{gridTemplateColumns:"1fr"}}>{(["hombre","mujer","prefiero_no_decirlo"] as Gender[]).map(g=><button key={g} type="button" className={`choice ${gender===g?"active":""}`} onClick={()=>setGender(g)}><span>{g === "hombre" ? "👨" : g === "mujer" ? "👩" : "🌈"} {genderNames[g]}</span></button>)}</div>{gender === "prefiero_no_decirlo" && <div className="field"><label htmlFor="routinePref">¿Qué tipo de rutina prefieres?</label><select id="routinePref" value={routinePreference} onChange={e=>setRoutinePreference(e.target.value as RoutinePreference)}><option value="fuerza">Fuerza</option><option value="tonificacion">Tonificación</option><option value="equilibrada">Equilibrada</option></select></div>}</> : <><h2>Cuéntanos sobre ti</h2><p>Solo para mayores de 18 años. Puedes cambiar tus preferencias después.</p><div className="grid grid-cols-2 gap-3"><div className="field"><label htmlFor="weight">Peso (kg)</label><input id="weight" type="number" min="30" max="300" step="0.1" value={weight} onChange={e=>setWeight(e.target.value)} required/></div><div className="field"><label htmlFor="height">Estatura (cm)</label><input id="height" type="number" min="120" max="230" value={height} onChange={e=>setHeight(e.target.value)} required/></div></div><div className="field"><label htmlFor="birth">Fecha de nacimiento</label><input id="birth" type="date" max={new Date(new Date().setFullYear(new Date().getFullYear()-18)).toISOString().slice(0,10)} value={birthDate} onChange={e=>setBirthDate(e.target.value)} required/><small className="text-slate-500">Debes tener 18 años o más.</small></div><div className="field"><label htmlFor="goal">¿Cuál es tu objetivo?</label><select id="goal" value={goal} onChange={e=>setGoal(e.target.value as Goal)}>{Object.entries(goalNames).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></div><div className="field"><label htmlFor="place">¿Dónde entrenas?</label><select id="place" value={place} onChange={e=>setPlace(e.target.value as Place)}>{Object.entries(placeNames).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></div></>}
      <div className="form-actions">{onboardingStep === 2 ? <button className="outline-button" onClick={()=>setOnboardingStep(1)}><ArrowLeft size={17}/> Atrás</button> : <span/>}{onboardingStep === 1 ? <button className="primary-button" onClick={()=>setOnboardingStep(2)}>Continuar <ArrowRight size={17}/></button> : <button className="primary-button" onClick={()=>void saveProfile()}>Guardar perfil <Check size={17}/></button>}</div></div><WhatsAppButton/></div>;
  }

  if (!profile) return null;

  const go = (to: Section | "whatsapp") => {
    if (to === "whatsapp") window.open(WHATSAPP, "_blank", "noopener,noreferrer");
    else { window.history.pushState({ section: to }, "", `#${to}`); setSection(to); }
    setDrawer(false);
  };
  return <div className="app-shell"><a className="skip-link" href="#main-content">Saltar al contenido principal</a><header className="topbar"><button className="icon-button" onClick={()=>go("inicio")} aria-label="Ir al inicio"><Logo/></button><div className="flex items-center gap-2"><span className="hidden sm:inline text-xs font-bold text-slate-500">Hola, {profile.username}</span><button className="icon-button" onClick={()=>setDrawer(true)} aria-label="Abrir menú de navegación"><Menu size={27}/></button></div></header><main id="main-content" className="page-wrap">{section === "moderacion" && isModerator && <ModerationView reports={reportRows} busy={reportsBusy} onRefresh={() => setReportsRefresh(value => value + 1)} onMarkReviewed={reportId => void markReportReviewed(reportId)} onHideComments={postId => void hideReportedComments(postId)} onDeleteComments={postId => void deleteReportedComments(postId)} onDeletePost={report => void deleteReportedPost(report)}/>}
      {(section === "inicio" || section === "consejos") && <HomeTipsView cards={filteredCards} query={query} category={category} onQueryChange={setQuery} onCategoryChange={setCategory} onSelectCard={setSelectedCard}/>}
      {section === "perfil" && <ProfileView profile={{ ...profile, goalName: goalNames[profile.goal], placeName: placeNames[profile.training_place] }} userId={userId} username={newUsername} posts={posts} likeBusyIds={likeBusyIds} onUsernameChange={setNewUsername} onProfileFileChange={setProfileFile} onSave={() => void saveProfileDetails()} onGoSocial={() => go("social")} onLike={post => void toggleLike(post)} onComment={postId => void openComments(postId)} onDelete={post => void deletePost(post)} onReport={post => void reportPost(post)}/> }
      {section === "entrenamiento" && <TrainingView place={profile.training_place} goalName={goalNames[profile.goal]} plan={plan} selectedDay={routineDay} onSelectDay={setRoutineDay} onSelectExercise={setSelectedExercise}/>}
      {section === "alimentacion" && <NutritionView goal={profile.goal} goalName={goalNames[profile.goal]} calories={estimateCalories} calorieFloor={nutritionEstimate?.floor ?? null} caloriesClamped={caloriesClamped} weightKg={profile.weight_kg} heightCm={profile.height_cm} age={calcAge(profile.birth_date)}/>}
      {section === "social" && <SocialView profile={profile} posts={posts} postText={postText} postFile={postFile} postBusy={postBusy} configured={configured} likeBusyIds={likeBusyIds} onTextChange={setPostText} onFileChange={setPostFile} onCreatePost={createPost} onLike={post => void toggleLike(post)} onComment={postId => void openComments(postId)} onDelete={post => void deletePost(post)} onReport={post => void reportPost(post)}/> }
      {section === "ajustes" && <SettingsView colorblind={colorblind} highContrast={highContrast} largeText={largeText} onColorblindChange={setColorblind} onHighContrastChange={setHighContrast} onLargeTextChange={setLargeText} onDeleteAccount={() => void deleteMyAccount()}/>}
      <div className="footer-note">Pulso Fit · Tu ritmo. Tu tiempo. Tu progreso. {demo ? "· Modo demostración" : ""}</div></main><WhatsAppButton/>
    {drawer&&<div className="drawer-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setDrawer(false);}}><aside className="drawer" role="dialog" aria-modal="true" aria-label="Menú principal"><div className="drawer-head"><Logo/><button className="icon-button" onClick={()=>setDrawer(false)} aria-label="Cerrar menú"><X/></button></div><div className="flex items-center gap-3 p-3 rounded-2xl bg-amber-50 mb-4"><div className="avatar">{profile.avatar_url?<img src={profile.avatar_url} alt=""/>:profile.username.slice(0,1).toUpperCase()}</div><div><strong>{profile.username}</strong><p className="text-xs text-slate-500">Tu espacio Pulso Fit</p></div></div>{[...navItems, ...(isModerator ? [{ id: "moderacion" as Section, label: "Moderación", icon: ShieldCheck as ComponentType<{ size?: number }> }] : [])].map(item=>{const Icon=item.icon;return <button key={item.id} className={`drawer-link ${section===item.id?"active":""}`} onClick={()=>go(item.id)}><Icon size={19}/>{item.label}{item.id==="whatsapp"&&<ExternalLink size={14} className="push"/>}</button>;})}<button className="drawer-link mt-5" onClick={()=>void logout()}><LogOut size={19}/> Cerrar sesión</button><p className="notice mt-4">{demo?"Modo demostración local. Configura Supabase para sincronizar tus datos.":"Tu cuenta usa autenticación segura gestionada por Supabase."}</p></aside></div>}
    {selectedCard&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setSelectedCard(null);}}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="advice-title"><div className="modal-head"><span className="pill active">{selectedCard.category}</span><button className="icon-button" onClick={()=>setSelectedCard(null)} aria-label="Cerrar consejos"><X/></button></div><img src={selectedCard.image} alt={`Ilustración: ${selectedCard.title}`} className="w-full h-48 object-cover rounded-2xl mt-3"/><h2 id="advice-title" className="mt-4">{selectedCard.title}</h2><p className="text-sm text-slate-600 mt-2">{selectedCard.desc}</p><AdviceContent id={selectedCard.id}/><button className="primary-button mt-5" onClick={()=>{setSelectedCard(null);go(selectedCard.category==="Alimentación"?"alimentacion":"entrenamiento");}}>Ir a {selectedCard.category.toLowerCase()} <ArrowRight size={16}/></button></div></div>}
    {selectedExercise&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setSelectedExercise(null);}}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="exercise-title"><div className="modal-head"><div><span className="eyebrow">TÉCNICA DEL EJERCICIO</span><h2 id="exercise-title" className="mt-1">{exerciseNameEs(selectedExercise.name, selectedExercise.source_id || selectedExercise.id, selectedExercise.name_es, selectedExercise.target)}</h2></div><button className="icon-button" onClick={()=>setSelectedExercise(null)} aria-label="Cerrar detalle"><X/></button></div><div className="rounded-2xl bg-amber-50 flex justify-center p-3 mt-4 min-h-[150px]"><ExerciseAnimation exercise={selectedExercise}/></div><div className="flex flex-wrap gap-1 mt-4"><span className="tag">{targetLabels[selectedExercise.target]||selectedExercise.target}</span><span className="tag">{equipmentLabels[selectedExercise.equipment]||selectedExercise.equipment}</span>{selectedExercise.secondary_muscles.map(m=><span className="tag" key={m}>{targetLabels[m]||m}</span>)}</div><h3 className="font-extrabold mt-4 mb-2">Pasos para hacerlo</h3><ol className="list-decimal pl-5 space-y-2 text-sm text-slate-600">{selectedExercise.steps_es.map((s,i)=><li key={i}>{s}</li>)}</ol><div className="nutrition-banner mt-4"><strong>Errores comunes que debes evitar:</strong><ul className="list-disc pl-5 mt-2 space-y-1">{commonExerciseMistakes(selectedExercise).map(mistake => <li key={mistake}>{mistake}</li>)}</ul></div><p className="notice mt-3">La ilustración animada representa el patrón de movimiento del ejercicio y es esquemática; no sustituye una demostración técnica exacta. Puedes conectar una animación específica con licencia desde <code>media_url</code>.</p></div></div>}
    {commentsFor&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setCommentsFor(null);}}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="comments-title"><div className="modal-head"><h2 id="comments-title">Comentarios</h2><button className="icon-button" onClick={()=>setCommentsFor(null)} aria-label="Cerrar comentarios"><X/></button></div><div className="space-y-3 my-5">{comments.length?comments.map(c=><div key={c.id} className="rounded-xl bg-slate-50 p-3"><div className="flex items-center justify-between gap-2"><strong className="text-sm">{c.username}</strong>{userId && c.user_id===userId && <button className="text-link" onClick={()=>void deleteComment(c.id)}>Eliminar mi comentario</button>}</div><p className="text-sm text-slate-600 mt-1">{c.text}</p></div>):<p className="text-sm text-slate-500">Sé la primera persona en comentar.</p>}</div><div className="comment-row" style={{padding:0}}><input value={commentText} onChange={e=>setCommentText(e.target.value)} placeholder="Escribe un comentario…" aria-label="Escribe un comentario"/><button className="primary-button" onClick={()=>void addComment()} disabled={!commentText.trim()} aria-label="Enviar comentario"><Send size={16}/></button></div></div></div>}
    {toast&&<div role="status" aria-live="polite" className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-800 text-white rounded-full px-5 py-3 shadow-xl text-sm font-bold z-[90] max-w-[90vw]">{toast}</div>}
  </div>;
}

