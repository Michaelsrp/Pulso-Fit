import { featuredExercises, type Exercise } from "@/lib/exercises";
import { routineActivities, type RoutineActivity } from "@/lib/routine-content";

export type PlanProfile = {
  gender: "hombre" | "mujer" | "prefiero_no_decirlo";
  routine_preference?: "fuerza" | "tonificacion" | "equilibrada" | null;
  goal: "bajar_peso" | "mantener" | "subir_peso" | "ganar_masa_muscular";
  training_place: "gimnasio" | "casa" | "aire_libre";
};
export type DayPlan = { day: string; title: string; exercises: Exercise[]; warmup: RoutineActivity[]; cooldown: RoutineActivity[] };

const weekdays = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
const dayGroups = [
  { title: "Pecho, hombros y tríceps", targets: ["pectorals", "delts", "triceps"] },
  { title: "Piernas y glúteos", targets: ["glutes", "quads", "hamstrings", "calves"] },
  { title: "Espalda y bíceps", targets: ["lats", "upper back", "biceps", "traps"] },
  { title: "Core y cardio", targets: ["abs", "cardiovascular system"] },
  { title: "Cuerpo completo", targets: ["pectorals", "glutes", "back", "abs", "cardiovascular system"] },
];

type OutdoorDefinition = { name: string; reps: string; steps: string[] };
const outdoorDays: OutdoorDefinition[] = [
  { name: "Intervalos de caminata y trote · inicio", reps: "6 rondas: 1 min de trote suave + 2 min caminando", steps: ["Elige una ruta plana, iluminada y sin obstáculos.", "Camina con ritmo cómodo durante 2 minutos.", "Trota suavemente durante 1 minuto; debes poder hablar en frases cortas.", "Vuelve a caminar 2 minutos y repite hasta completar 6 rondas.", "Finaliza con caminata suave; detente si aparece dolor, mareo o malestar.", "Progresión semanal: si completas las tres sesiones sin dolor ni fatiga excesiva, la semana siguiente puedes sumar 15 segundos a cada intervalo de trote; si no, repite el mismo nivel."] },
  { name: "Caminata activa de recuperación", reps: "20 minutos a ritmo cómodo", steps: ["Camina sobre una ruta segura durante 5 minutos a ritmo suave.", "Mantén una caminata activa pero cómoda durante 10 minutos.", "Reduce el ritmo durante los últimos 5 minutos.", "Mantén una respiración controlada y detente ante dolor o malestar."] },
  { name: "Intervalos de caminata y trote · progresión", reps: "6 rondas: 90 s de trote suave + 2 min caminando", steps: ["Comienza con 5 minutos de caminata.", "Trota suavemente durante 90 segundos sin buscar velocidad.", "Camina 2 minutos para recuperar la respiración.", "Repite 6 rondas y termina caminando 5 minutos.", "Si la sesión anterior se sintió exigente, repite el nivel inicial en lugar de aumentar.", "Aumenta solo si terminaste las sesiones anteriores con comodidad; de lo contrario conserva los intervalos actuales."] },
  { name: "Caminata suave y movilidad", reps: "25 minutos suaves", steps: ["Camina 15–20 minutos en un terreno estable.", "Haz pausas para movilidad suave de tobillos y caderas.", "Termina con caminata lenta y respiración tranquila.", "No fuerces rangos de movimiento ni continúes ante dolor."] },
  { name: "Intervalos de caminata y trote · consolidación", reps: "6 rondas: 2 min de trote suave + 2 min caminando", steps: ["Inicia con 5 minutos caminando.", "Trota suavemente durante 2 minutos, sin acelerar.", "Camina 2 minutos para recuperar.", "Repite 6 rondas únicamente si los niveles anteriores fueron cómodos.", "Finaliza con 5 minutos de caminata lenta.", "Al iniciar una nueva semana, aumenta el trote solo 15 segundos por ronda cuando el nivel actual sea cómodo; nunca avances si aparece dolor."] },
];

const parkExercises = [
  { id: "park-squat", name: "Sentadilla con peso corporal en parque", target: "quads", category: "upper legs", reps: "2 series · 10–12 repeticiones", steps: ["Párate con pies al ancho de caderas.", "Lleva la cadera atrás y flexiona rodillas en un rango cómodo.", "Mantén el pecho abierto y las rodillas alineadas con los pies.", "Empuja el suelo para volver a la posición inicial."] },
  { id: "park-pushup", name: "Flexión inclinada en banca estable", target: "pectorals", category: "chest", reps: "2 series · 8–10 repeticiones", steps: ["Apoya las manos sobre una banca firme que no se mueva.", "Alinea cabeza, tronco y piernas.", "Flexiona codos y acerca el pecho a la banca.", "Empuja suavemente para regresar sin arquear la espalda."] },
  { id: "park-plank", name: "Plancha frontal en superficie estable", target: "abs", category: "waist", reps: "2 series · 15–30 segundos", steps: ["Apoya antebrazos y puntas de los pies en una superficie estable.", "Mantén el cuerpo alineado y el abdomen activo.", "Respira de forma continua sin hundir la cadera.", "Termina la serie si pierdes la postura."] },
  { id: "park-lunge", name: "Zancada alterna con peso corporal", target: "glutes", category: "upper legs", reps: "2 series · 8 por lado", steps: ["Da un paso cómodo hacia adelante.", "Flexiona ambas rodillas sin perder el equilibrio.", "Empuja con el pie delantero para regresar.", "Alterna las piernas con control."] },
  { id: "park-bird-dog", name: "Extensión alterna de brazo y pierna", target: "abs", category: "waist", reps: "2 series · 8 por lado", steps: ["Colócate en cuatro apoyos sobre una esterilla.", "Extiende brazo derecho y pierna izquierda sin girar la cadera.", "Mantén un instante y vuelve con control.", "Alterna los lados manteniendo la espalda neutra."] },
];

function makeOutdoorPlan(): DayPlan[] {
  return weekdays.map((day, index) => {
    const run = outdoorDays[index];
    const runningExercise: Exercise = {
      id: `outdoor-${index}`, name: run.name, name_es: run.name, category: "cardio", body_part: "cardio",
      equipment: "running", target: "cardiovascular system", secondary_muscles: ["piernas", "pantorrillas"],
      steps_es: run.steps, level: run.reps,
    };
    const extraIndexes = index === 0 || index === 2 ? [0, 1]
      : index === 1 ? [2, 3]
        : index === 3 ? [4, 2] : [0, 2];
    const extras = extraIndexes.map(itemIndex => {
      const item = parkExercises[itemIndex];
      return {
        id: item.id, name: item.name, name_es: item.name, category: item.category, body_part: item.category,
        equipment: "body weight", target: item.target, secondary_muscles: [], steps_es: item.steps, level: item.reps,
      } satisfies Exercise;
    });
    return {
      day,
      title: index === 0 || index === 2 || index === 4 ? "Caminata y trote progresivo" : "Recuperación activa y parque",
      exercises: [runningExercise, ...extras],
      ...routineActivities("aire_libre"),
    };
  });
}

export function makePlan(profile: PlanProfile): DayPlan[] {
  const place = profile.training_place;
  if (place === "aire_libre") return makeOutdoorPlan();
  const safePool = place === "gimnasio" ? featuredExercises : featuredExercises.filter(exercise => exercise.equipment.toLowerCase() === "body weight");
  const repConfig = profile.routine_preference === "fuerza" || profile.goal === "ganar_masa_muscular" || profile.goal === "subir_peso"
    ? { reps: "8–10", sets: 4 }
    : profile.routine_preference === "tonificacion" || profile.goal === "bajar_peso"
      ? { reps: "12–15", sets: 3 }
      : { reps: "10–12", sets: 3 };
  const used = new Set<string>();
  return weekdays.map((day, index) => {
    const wantedTargets = dayGroups[index].targets;
    const matches = safePool.filter(exercise => wantedTargets.some(target => exercise.target === target || exercise.category === target || (target === "back" && exercise.body_part === "back")));
    const picked: Exercise[] = [];
    for (const exercise of [...matches, ...safePool]) {
      if (picked.length >= 4) break;
      if (!used.has(exercise.id)) { picked.push(exercise); used.add(exercise.id); }
    }
    return { day, title: dayGroups[index].title, exercises: picked, ...routineActivities(place) };
  }).map(day => ({
    ...day,
    exercises: day.exercises.map(exercise => ({ ...exercise, level: `${repConfig.sets} series · ${repConfig.reps} repeticiones` })),
  }));
}
