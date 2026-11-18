import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import exerciseNames from "../lib/exercise-names-es.json";

type SourceExercise = {
  id: string; name: string; category?: string; body_part?: string; equipment?: string; target?: string;
  secondary_muscles?: string[]; steps_es?: string[]; media_id?: string; place_options?: string[];
};

async function main() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Define SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY solo en tu terminal local. Nunca los publiques ni uses el prefijo NEXT_PUBLIC_ para la service_role.");
  }
  const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const file = path.join(process.cwd(), "data", "exercises_es_slim.json");
  const source = JSON.parse(fs.readFileSync(file, "utf8")) as SourceExercise[];
  const featured = new Set((JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", "exercises_featured.json"), "utf8")) as SourceExercise[]).map(x => x.id));
  const rows = source.map(x => ({
    source_id: x.id,
    name: x.name,
    name_es: (exerciseNames as Record<string, string>)[x.id] ?? `Ejercicio para ${({ abs: "abdominales", pectorals: "pectorales", biceps: "bíceps", triceps: "tríceps", glutes: "glúteos", delts: "hombros", lats: "dorsales", "upper back": "espalda alta", quads: "cuádriceps", hamstrings: "isquiotibiales", calves: "pantorrillas", "cardiovascular system": "el sistema cardiovascular", traps: "trapecios", forearms: "antebrazos", abductors: "abductores", adductors: "aductores", "levator scapulae": "elevador de la escápula", "serratus anterior": "serrato anterior", spine: "espalda" } as Record<string, string>)[x.target || ""] || "el cuerpo completo"}`,
    category: x.category ?? null,
    body_part: x.body_part ?? null,
    equipment: x.equipment ?? null,
    target: x.target ?? null,
    secondary_muscles: x.secondary_muscles ?? [],
    instructions: x.steps_es ?? [],
    media_id: x.media_id ?? null,
    // Deliberadamente nulo: media_id no demuestra por sí mismo derechos de uso comercial.
    media_url: null,
    level: "principiante",
    place: ["body weight"].includes((x.equipment || "").toLowerCase()) ? ["gimnasio", "casa", "aire_libre"] : ["gimnasio"],
    is_featured: featured.has(x.id),
  }));
  for (let i = 0; i < rows.length; i += 100) {
    const { error } = await supabase.from("exercises").upsert(rows.slice(i, i + 100), { onConflict: "source_id" });
    if (error) throw new Error(`Error importando el lote ${i / 100 + 1}: ${error.message}`);
    console.log(`Importados ${Math.min(i + 100, rows.length)} / ${rows.length}`);
  }
  console.log(`Importación finalizada: ${rows.length} ejercicios (${featured.size} destacados).`);
}
main().catch(err => { console.error(err); process.exit(1); });
