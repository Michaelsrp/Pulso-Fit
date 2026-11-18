import featured from "@/data/exercises_featured.json";
import exerciseNames from "@/lib/exercise-names-es.json";

export type ExerciseMotion = "push" | "pull" | "squat" | "hinge" | "core" | "cardio" | "stretch" | "curl" | "raise";
export type Exercise = {
  id: string;
  source_id?: string;
  name: string;
  name_es?: string | null;
  category: string;
  body_part: string;
  equipment: string;
  target: string;
  secondary_muscles: string[];
  steps_es: string[];
  media_id?: string;
  place_options?: string[];
  media_url?: string | null;
  level?: string;
};

export const featuredExercises = featured as Exercise[];
const translatedById = exerciseNames as Record<string, string>;

export const targetLabels: Record<string, string> = {
  abs: "Abdominales", pectorals: "Pectorales", biceps: "Bíceps", triceps: "Tríceps",
  glutes: "Glúteos", delts: "Hombros", lats: "Dorsales", "upper back": "Espalda alta",
  quads: "Cuádriceps", hamstrings: "Isquiotibiales", calves: "Pantorrillas",
  forearms: "Antebrazos", traps: "Trapecios", "cardiovascular system": "Sistema cardiovascular",
  spine: "Espalda", obliques: "Oblicuos", "lower back": "Zona lumbar", shoulders: "Hombros",
  abductors: "Abductores", adductors: "Aductores", "levator scapulae": "Elevador de la escápula",
  "serratus anterior": "Serrato anterior", abdominals: "Abdominales", "ankle stabilizers": "Estabilizadores del tobillo",
  ankles: "Tobillos", brachialis: "Braquial", chest: "Pecho", core: "Zona media", deltoids: "Deltoides",
  feet: "Pies", "grip muscles": "Músculos de agarre", groin: "Ingle", hands: "Manos",
  "hip flexors": "Flexores de cadera", "inner thighs": "Muslo interno", "latissimus dorsi": "Dorsal ancho",
  "lower abs": "Abdominales inferiores", "rear deltoids": "Deltoides posteriores", rhomboids: "Romboides",
  "rotator cuff": "Manguito rotador", shins: "Espinillas", soleus: "Sóleo",
  sternocleidomastoid: "Esternocleidomastoideo", trapezius: "Trapecio", "upper chest": "Pecho superior",
  "wrist extensors": "Extensores de muñeca", "wrist flexors": "Flexores de muñeca", wrists: "Muñecas",
  back: "Espalda", cardio: "Cardio", "lower arms": "Antebrazos", "lower legs": "Pantorrillas",
  neck: "Cuello", "upper arms": "Brazos", "upper legs": "Muslos", waist: "Cintura",
};
export const equipmentLabels: Record<string, string> = {
  "body weight": "Peso corporal", dumbbell: "Mancuernas", band: "Banda elástica",
  "resistance band": "Banda elástica", cable: "Polea", barbell: "Barra",
  "leverage machine": "Máquina", "stability ball": "Balón de estabilidad", kettlebell: "Pesa rusa",
  assisted: "Asistido", "medicine ball": "Balón medicinal", "bosu ball": "Bosu", "elliptical machine": "Máquina elíptica",
  "ez barbell": "Barra Z", hammer: "Martillo", "olympic barbell": "Barra olímpica", roller: "Rodillo",
  rope: "Cuerda", "skierg machine": "Máquina SkiErg", "sled machine": "Trineo", "smith machine": "Máquina Smith",
  "stationary bike": "Bicicleta estática", "stepmill machine": "Escaladora", tire: "Neumático", "trap bar": "Barra hexagonal",
  "upper body ergometer": "Ergómetro de tren superior", weighted: "Con peso", "wheel roller": "Rueda abdominal",
};

const movementPatterns: Array<[RegExp, ExerciseMotion]> = [
  [/stretch|circle|toe touch|side bend|mobility/i, "stretch"],
  [/sit.?up|crunch|v.?up|leg raise|russian twist|pallof|rollerout|heel toucher/i, "core"],
  [/jump|step|bike|bicycle|cycle|run|boxing|hook|cross trainer/i, "cardio"],
  [/squat|lunge|split squat|step.?up|calf raise|glute.?ham/i, "squat"],
  [/deadlift|good morning|hip extension|hip lift|back extension|back lever/i, "hinge"],
  [/curl/i, "curl"],
  [/row|pull.?up|chin.?up|pulldown|pull down|pulldown/i, "pull"],
  [/press|push.?up|dip/i, "push"],
  [/raise|fly|shrug/i, "raise"],
];

export const motionLabels: Record<ExerciseMotion, string> = {
  push: "empuje", pull: "tracción", squat: "sentadilla y pierna", hinge: "bisagra de cadera",
  core: "estabilidad del abdomen", cardio: "movimiento cardiovascular", stretch: "movilidad y estiramiento",
  curl: "flexión de brazo", raise: "elevación controlada",
};

export function exerciseMotion(exercise: Pick<Exercise, "name" | "target" | "category">): ExerciseMotion {
  const found = movementPatterns.find(([pattern]) => pattern.test(exercise.name));
  if (found) return found[1];
  if (exercise.category === "cardio" || exercise.target === "cardiovascular system") return "cardio";
  if (["abs", "obliques"].includes(exercise.target)) return "core";
  if (["quads", "hamstrings", "glutes", "calves"].includes(exercise.target)) return "squat";
  if (["lats", "upper back", "biceps", "traps"].includes(exercise.target)) return "pull";
  if (["pectorals", "triceps"].includes(exercise.target)) return "push";
  return "raise";
}

function translateUnknownName(name: string, target?: string): string {
  const muscle = targetLabels[target || ""] || "el cuerpo completo";
  const clean = name.toLowerCase();
  const patterns: Array<[RegExp, string]> = [
    [/stretch/, "Estiramiento de"], [/squat|lunge/, "Sentadilla para"], [/deadlift|good morning/, "Bisagra de cadera para"],
    [/row/, "Remo para"], [/pull.?up|chin.?up/, "Dominada para"], [/pulldown|pull down/, "Jalón para"],
    [/push.?up/, "Flexión de brazos para"], [/press/, "Press para"], [/curl/, "Curl de"],
    [/raise|fly|shrug/, "Elevación para"], [/jump|step|cycle|bike|run|cross trainer/, "Trabajo cardiovascular de"],
    [/crunch|sit.?up|v.?up|twist|leg raise/, "Ejercicio de abdomen para"],
  ];
  const match = patterns.find(([pattern]) => pattern.test(clean));
  if (match) return `${match[1]} ${muscle.toLowerCase()}`;
  return `Ejercicio para ${muscle.toLowerCase()}`;
}

export function exerciseNameEs(name: string, sourceId?: string, nameEs?: string | null, target?: string): string {
  if (nameEs?.trim()) return nameEs.trim();
  if (sourceId && translatedById[sourceId]) return translatedById[sourceId];
  const normalized = name.toLowerCase().replace(/\s+/g, " ").trim();
  const byName = Object.entries(translatedById).find(([id]) => featuredExercises.find((item) => item.id === id)?.name.toLowerCase() === normalized);
  if (byName) return byName[1];
  return translateUnknownName(name, target);
}

export function mediaUrl(exercise: Exercise): string | null {
  if (exercise.media_url) return exercise.media_url;
  const base = process.env.NEXT_PUBLIC_EXERCISE_MEDIA_BASE_URL;
  if (base && exercise.media_id) return `${base.replace(/\/$/, "")}/${encodeURIComponent(exercise.media_id)}.mp4`;
  return null;
}


export function commonExerciseMistakes(exercise: Pick<Exercise, "name" | "target" | "category">): string[] {
  const motion = exerciseMotion(exercise);
  const mistakes: Record<ExerciseMotion, string[]> = {
    push: ["Abrir los codos en exceso o perder la alineación de muñecas y hombros.", "Arquear la zona lumbar o dejar caer la cadera.", "Rebotar al bajar en lugar de controlar el movimiento."],
    pull: ["Impulsar el cuerpo para completar la repetición.", "Elevar los hombros hacia las orejas y perder el control escapular.", "Redondear la espalda o tirar con movimientos bruscos."],
    squat: ["Dejar que las rodillas colapsen hacia adentro.", "Levantar los talones o perder el apoyo estable de los pies.", "Bajar más de lo que permite la movilidad sin perder la postura."],
    hinge: ["Redondear la espalda al inclinar el tronco.", "Convertir la bisagra de cadera en una sentadilla profunda.", "Alejar demasiado la carga o perder el control al regresar."],
    core: ["Arquear la zona lumbar o compensar con el cuello.", "Contener la respiración durante todo el esfuerzo.", "Usar impulso en lugar de activar y controlar la zona media."],
    cardio: ["Aumentar la velocidad antes de dominar el ritmo y la técnica.", "Aterrizar con rigidez o dar zancadas demasiado largas.", "Ignorar señales de dolor, mareo o falta de aire inusual."],
    stretch: ["Rebotar o forzar el rango para llegar más lejos.", "Contener la respiración durante el estiramiento.", "Mantener una posición que produzca dolor o entumecimiento."],
    curl: ["Balancear el tronco para levantar la carga.", "Separar los codos del cuerpo sin necesidad.", "Dejar caer el peso rápido en la fase de regreso."],
    raise: ["Usar impulso o balanceo para iniciar la elevación.", "Encoger los hombros o elevar por encima del rango cómodo.", "Perder el control durante el descenso."],
  };
  return mistakes[motion];
}
