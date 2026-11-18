"use client";

import { Zap, ChevronRight } from "lucide-react";
import type { Exercise } from "@/lib/exercises";
import { equipmentLabels, exerciseNameEs, targetLabels } from "@/lib/exercises";
import { routineActivities } from "@/lib/routine-content";
import type { DayPlan } from "@/lib/plan-builder";
import ExerciseAnimation from "@/components/fitness/ExerciseAnimation";
import RoutineBlockList from "@/components/fitness/RoutineBlockList";

type TrainingViewProps = {
  place: "gimnasio" | "casa" | "aire_libre";
  goalName: string;
  plan: DayPlan[];
  selectedDay: number;
  onSelectDay: (index: number) => void;
  onSelectExercise: (exercise: Exercise) => void;
};

const placeNames = { gimnasio: "Gimnasio", casa: "Casa", aire_libre: "Aire libre" };

export default function TrainingView({ place, goalName, plan, selectedDay, onSelectDay, onSelectExercise }: TrainingViewProps) {
  const day = plan[selectedDay];
  const defaults = routineActivities(place);
  return <>
    <div className="section-heading"><div><h1>Tu entrenamiento</h1><p>Rutina de lunes a viernes · {placeNames[place]}</p></div><span className="pill active">{goalName}</span></div>
    <div className="panel-card mb-4"><div className="flex items-start gap-3"><div className="rounded-2xl bg-amber-100 p-3 text-amber-700"><Zap size={22}/></div><div><h2 className="mb-1">Plan adaptado a tus preferencias</h2><p className="text-sm text-slate-600">La propuesta cambia según el lugar, el objetivo y la preferencia de rutina. Ajusta la dificultad y descansa cuando lo necesites.</p></div></div></div>
    <div className="routine-tabs">{plan.map((item, index) => <button key={item.day} className={`routine-day ${selectedDay === index ? "active" : ""}`} aria-pressed={selectedDay === index} onClick={() => onSelectDay(index)}>{item.day}</button>)}</div>
    <div className="panel-card mb-4"><div className="flex flex-wrap justify-between gap-3 items-center"><div><span className="text-xs text-slate-500 uppercase font-extrabold">{day?.day}</span><h2 className="mt-1">{day?.title}</h2></div><span className="pill">{day?.exercises.length || 0} ejercicios</span></div></div>
    <RoutineBlockList title="Calentamiento" description="Prepara el cuerpo con movimientos progresivos antes de la rutina." items={day?.warmup || defaults.warmup}/>
    <div className="exercise-list">{day?.exercises.map(exercise => <article className="exercise-card" key={exercise.id}>
      <div className="exercise-media"><ExerciseAnimation exercise={exercise}/></div>
      <div className="exercise-info"><h3>{exerciseNameEs(exercise.name, exercise.source_id || exercise.id, exercise.name_es, exercise.target)}</h3><p>{targetLabels[exercise.target] || "Grupo muscular"} · {equipmentLabels[exercise.equipment] || "Equipo no especificado"}</p><p className="font-bold text-slate-700">{exercise.level || "3 series · 10–12 repeticiones"}</p><button className="text-link" onClick={() => onSelectExercise(exercise)}>Ver técnica y detalles <ChevronRight size={13} className="inline"/></button></div>
    </article>)}</div>
    <RoutineBlockList title="Vuelta a la calma y estiramiento" description="Reduce el ritmo y mantén cada estiramiento suave, sin rebotes ni dolor." items={day?.cooldown || defaults.cooldown}/>
    <p className="notice mt-4">La rutina es orientativa y no sustituye la valoración de un profesional. Detén la actividad ante dolor, mareo o malestar. Adapta la intensidad a tu experiencia.</p>
  </>;
}
