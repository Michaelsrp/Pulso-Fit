import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

type RoutineRow = { id: string; gender: string; routine_preference: string | null; goal: string; place: string };
type DayRow = { id: string; routine_id: string; weekday: string };
type RoutineExerciseRow = { routine_day_id: string; exercise_id: string };
type ExerciseRow = { id: string; source_id: string | null; is_custom: boolean; is_featured: boolean; equipment: string | null; name: string };

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const email = process.env.SUPABASE_USER_EMAIL;
  const password = process.env.SUPABASE_USER_PASSWORD;
  if (!url || !anonKey || !email || !password) {
    throw new Error("Define NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_USER_EMAIL y SUPABASE_USER_PASSWORD para verificar con una cuenta normal. Este script no usa service_role.");
  }

  const client = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error: authError } = await client.auth.signInWithPassword({ email, password });
  if (authError) throw new Error(`No fue posible iniciar sesión para la verificación: ${authError.message}`);

  try {
    const sourcePath = path.join(process.cwd(), "data", "exercises_es_slim.json");
    const source = JSON.parse(fs.readFileSync(sourcePath, "utf8")) as Array<{ id: string }>;
    const sourceIds = new Set(source.map(item => item.id));
    const featuredSource = JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", "exercises_featured.json"), "utf8")) as Array<{ id: string }> ;
    const featuredIds = new Set(featuredSource.map(item => item.id));
    if (featuredSource.length !== 60 || featuredIds.size !== 60) throw new Error("El archivo de selección debe contener exactamente 60 ejercicios únicos.");
    const featuredMissingFromSource = [...featuredIds].filter(id => !sourceIds.has(id));
    if (featuredMissingFromSource.length) throw new Error(`La selección incluye ejercicios que no existen en el JSON: ${featuredMissingFromSource.slice(0, 12).join(", ")}`);

    const [routineResult, dayResult] = await Promise.all([
      client.from("routines").select("id,gender,routine_preference,goal,place"),
      client.from("routine_days").select("id,routine_id,weekday"),
    ]);
    if (routineResult.error) throw routineResult.error;
    if (dayResult.error) throw dayResult.error;
    const routines = (routineResult.data || []) as RoutineRow[];
    const days = (dayResult.data || []) as DayRow[];
    if (routines.length !== 60) throw new Error(`Se esperaban 60 plantillas y se encontraron ${routines.length}.`);
    if (days.length !== 300) throw new Error(`Se esperaban 300 jornadas y se encontraron ${days.length}.`);

    const expectedWeekdays = new Set(["lunes", "martes", "miercoles", "jueves", "viernes"]);
    const daysByRoutine = new Map<string, Set<string>>();
    for (const day of days) {
      const existing = daysByRoutine.get(day.routine_id) || new Set<string>();
      existing.add(day.weekday);
      daysByRoutine.set(day.routine_id, existing);
    }
    for (const routine of routines) {
      const weekdaySet = daysByRoutine.get(routine.id);
      if (!weekdaySet || weekdaySet.size !== 5 || [...expectedWeekdays].some(day => !weekdaySet.has(day))) {
        throw new Error(`La plantilla ${routine.gender}/${routine.goal}/${routine.place} no tiene exactamente lunes a viernes.`);
      }
    }

    // Supabase puede limitar filas por petición; se pagina para comprobar el catálogo completo.
    const exercises: ExerciseRow[] = [];
    for (let offset = 0; ; offset += 500) {
      const { data, error } = await client.from("exercises")
        .select("id,source_id,is_custom,is_featured,equipment,name")
        .order("id")
        .range(offset, offset + 499);
      if (error) throw error;
      const page = (data || []) as ExerciseRow[];
      exercises.push(...page);
      if (page.length < 500) break;
    }
    const importedSourceIds = new Set(exercises.flatMap(row => row.source_id ? [row.source_id] : []));
    const databaseFeaturedIds = new Set(exercises.filter(row => row.is_featured && row.source_id).map(row => row.source_id as string));
    if (databaseFeaturedIds.size !== 60 || [...featuredIds].some(id => !databaseFeaturedIds.has(id))) {
      throw new Error(`La tabla exercises debe marcar como destacados los mismos 60 source_id del archivo exercises_featured.json; encontrados: ${databaseFeaturedIds.size}.`);
    }
    const missingSourceIds = [...sourceIds].filter(id => !importedSourceIds.has(id));
    const unknownSourceIds = [...importedSourceIds].filter(id => !sourceIds.has(id));
    if (missingSourceIds.length) {
      throw new Error(`Faltan ${missingSourceIds.length} source_id del JSON en Supabase. Primeros: ${missingSourceIds.slice(0, 12).join(", ")}`);
    }
    if (unknownSourceIds.length) {
      throw new Error(`Hay source_id que no existen en exercises_es_slim.json: ${unknownSourceIds.slice(0, 12).join(", ")}`);
    }

    const routinePlace = new Map(routines.map(row => [row.id, row.place]));
    const dayPlace = new Map(days.map(row => [row.id, routinePlace.get(row.routine_id)]));
    const mappings: RoutineExerciseRow[] = [];
    for (let offset = 0; ; offset += 500) {
      const { data, error } = await client.from("routine_exercises")
        .select("routine_day_id,exercise_id")
        .order("routine_day_id")
        .range(offset, offset + 499);
      if (error) throw error;
      const page = (data || []) as RoutineExerciseRow[];
      mappings.push(...page);
      if (page.length < 500) break;
    }
    const exerciseById = new Map(exercises.map(row => [row.id, row]));
    const invalid: string[] = [];
    for (const mapping of mappings) {
      const place = dayPlace.get(mapping.routine_day_id);
      const exercise = exerciseById.get(mapping.exercise_id);
      if (!exercise) {
        invalid.push(`Ejercicio inexistente en rutina: ${mapping.exercise_id}`);
        continue;
      }
      const equipment = (exercise.equipment || "").toLowerCase();
      if (place === "casa" && equipment !== "body weight") {
        invalid.push(`Casa: ${exercise.name} (${equipment || "sin equipo"}); se esperaba solo peso corporal.`);
      }
      if (place === "aire_libre" && (!exercise.is_custom || !["body weight", "running"].includes(equipment))) {
        invalid.push(`Aire libre: ${exercise.name} (${equipment || "sin equipo"}); se esperaba una sesión propia de carrera o peso corporal para parque.`);
      }
    }
    if (invalid.length) throw new Error(`Asignaciones incompatibles:\n${invalid.slice(0, 30).join("\n")}`);

    console.log(`Verificación superada: ${routines.length} plantillas, ${days.length} jornadas (lunes a viernes en cada una), ${sourceIds.size} ejercicios fuente presentes y ${mappings.length} asignaciones revisadas.`);
  } finally {
    await client.auth.signOut();
  }
}

main().catch(error => {
  const message = error instanceof Error ? error.message : "Error desconocido";
  console.error(message);
  process.exitCode = 1;
});
