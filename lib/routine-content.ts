export type RoutineActivity = { name: string; duration: string; steps: string };

const content = {
  gimnasio: {
    warmup: [
      { name: "Bicicleta o caminadora suave", duration: "4 minutos", steps: "Aumenta el ritmo gradualmente, sin llegar al agotamiento." },
      { name: "Círculos de hombros", duration: "10 por dirección", steps: "Haz círculos controlados sin forzar el cuello." },
      { name: "Movilidad de cadera", duration: "8 por lado", steps: "Realiza aperturas de cadera lentas." },
      { name: "Sentadillas sin carga", duration: "10 repeticiones", steps: "Mantén las rodillas alineadas con los pies." },
      { name: "Series de aproximación", duration: "1–2 series ligeras", steps: "Ensaya el primer ejercicio con poca carga." },
    ],
    cooldown: [
      { name: "Caminata lenta", duration: "2 minutos", steps: "Reduce el ritmo poco a poco." },
      { name: "Estiramiento de pectoral", duration: "20 s por lado", steps: "Apoya el antebrazo y gira suavemente el torso." },
      { name: "Estiramiento de cuádriceps", duration: "20 s por lado", steps: "Sujeta el tobillo sin forzar." },
      { name: "Estiramiento de espalda", duration: "20–30 s", steps: "Lleva las manos al frente y relaja la espalda." },
      { name: "Respiración tranquila", duration: "5 ciclos", steps: "Inhala y exhala lentamente." },
    ],
  },
  casa: {
    warmup: [
      { name: "Marcha en el sitio", duration: "3 minutos", steps: "Eleva los pies de forma alterna." },
      { name: "Círculos de hombros", duration: "10 por dirección", steps: "Muévete suavemente." },
      { name: "Movilidad de tobillos", duration: "10 por lado", steps: "Rota cada tobillo lentamente." },
      { name: "Bisagra de cadera", duration: "10 repeticiones", steps: "Lleva las caderas atrás con espalda larga." },
      { name: "Sentadillas cómodas", duration: "8–10 repeticiones", steps: "Usa peso corporal y rango sin dolor." },
    ],
    cooldown: [
      { name: "Marcha lenta", duration: "2 minutos", steps: "Baja la intensidad de forma gradual." },
      { name: "Estiramiento de pantorrilla", duration: "20 s por lado", steps: "Lleva una pierna atrás y apoya el talón." },
      { name: "Estiramiento de muslo anterior", duration: "20 s por lado", steps: "Sujeta el tobillo con apoyo." },
      { name: "Estiramiento de glúteos", duration: "20 s por lado", steps: "Cruza un tobillo sobre la rodilla opuesta." },
      { name: "Respiración diafragmática", duration: "5 ciclos", steps: "Relaja hombros y respira sin prisa." },
    ],
  },
  aire_libre: {
    warmup: [
      { name: "Caminata suave", duration: "5 minutos", steps: "Empieza sobre una ruta plana y segura." },
      { name: "Movilidad de tobillos", duration: "10 por lado", steps: "Haz círculos lentos." },
      { name: "Balanceo de piernas", duration: "8 por lado", steps: "Sujétate de un apoyo y balancea corto." },
      { name: "Marcha activa", duration: "60 segundos", steps: "Aumenta el ritmo sin correr." },
      { name: "Movilidad de cadera", duration: "8 por lado", steps: "Realiza aperturas sin rebotes." },
    ],
    cooldown: [
      { name: "Caminata muy suave", duration: "5 minutos", steps: "Recupera una respiración cómoda." },
      { name: "Estiramiento de pantorrilla", duration: "20 s por lado", steps: "Apoya las manos en una superficie estable." },
      { name: "Estiramiento de cuádriceps", duration: "20 s por lado", steps: "Sujeta un apoyo y acerca el talón al glúteo." },
      { name: "Estiramiento de isquiotibiales", duration: "20 s por lado", steps: "Apoya el talón y flexiona la cadera." },
      { name: "Respiración y relajación", duration: "5 ciclos", steps: "Inhala y exhala despacio." },
    ],
  },
} satisfies Record<string, { warmup: RoutineActivity[]; cooldown: RoutineActivity[] }>;

export function routineActivities(place: keyof typeof content) { return content[place]; }
