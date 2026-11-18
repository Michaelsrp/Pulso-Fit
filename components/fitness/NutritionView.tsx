"use client";

import { mealsByGoal, type NutritionGoal } from "@/lib/nutrition";

type NutritionViewProps = {
  goal: NutritionGoal;
  goalName: string;
  calories: number | null;
  calorieFloor: number | null;
  caloriesClamped: boolean;
  weightKg: number;
  heightCm: number;
  age: number;
};

export default function NutritionView({ goal, goalName, calories, calorieFloor, caloriesClamped, weightKg, heightCm, age }: NutritionViewProps) {
  const mealPlan = mealsByGoal[goal];
  return <>
    <div className="section-heading"><div><h1>Alimentación</h1><p>Ideas para acompañar tu actividad sin dietas extremas.</p></div><span className="pill active">{goalName}</span></div>
    <div className="two-col">
      <div className="panel-card"><span className="eyebrow">ESTIMACIÓN ORIENTATIVA</span><div className="flex items-end gap-2 mt-2"><strong className="text-5xl font-black text-amber-500">{calories?.toLocaleString("es-CO") ?? "—"}</strong><span className="text-sm text-slate-500 mb-2">kcal / día aprox.</span></div>
        <p className="text-sm text-slate-600 mt-2">Estimación general calculada con edad, peso, estatura y objetivo. No es una prescripción individual y puede variar según actividad, salud y contexto.</p>
        {caloriesClamped && <p className="nutrition-banner mt-3" role="status">El cálculo quedó por debajo de un piso orientativo de seguridad, por eso se muestra el mínimo de {calorieFloor?.toLocaleString("es-CO")} kcal/día. Consulta a un médico o nutricionista para recibir orientación personalizada.</p>}
        <div className="grid grid-cols-3 gap-2 mt-5"><div className="rounded-xl bg-amber-50 p-3"><span className="text-xs text-slate-500">Peso</span><strong className="block">{weightKg} kg</strong></div><div className="rounded-xl bg-blue-50 p-3"><span className="text-xs text-slate-500">Estatura</span><strong className="block">{heightCm} cm</strong></div><div className="rounded-xl bg-green-50 p-3"><span className="text-xs text-slate-500">Edad</span><strong className="block">{age} años</strong></div></div>
      </div>
      <div className="panel-card"><h2>Un plato equilibrado</h2><div className="rounded-2xl bg-gradient-to-br from-green-50 to-amber-50 p-5 text-center"><div className="text-6xl mb-2" aria-hidden="true">🥦 🥚 🍚</div><strong>{mealPlan.name}</strong><p className="text-sm text-slate-600 mt-2">Incluye alimentos variados y porciones suficientes para tus necesidades.</p></div><p className="notice mt-4">Esta información es orientativa y no reemplaza a un médico o nutricionista.</p></div>
    </div>
    <div className="section-heading mt-8"><div><h1 className="text-2xl">Ideas de comidas para tu objetivo</h1><p>Ejemplos con alimentos comunes en Colombia; adapta porciones y preparaciones a tus preferencias.</p></div></div>
    <div className="tips-grid">{mealPlan.meals.map(meal => <div className="panel-card" key={meal.title}><div className="text-4xl" aria-hidden="true">{meal.icon}</div><h2 className="mt-3">{meal.title}</h2><p className="text-sm text-slate-600">{meal.description}</p></div>)}</div>
    <p className="notice mt-5">No se recomiendan restricciones severas ni cambios bruscos. El cálculo aplica un ajuste moderado y nunca muestra una estimación inferior a 1.500 kcal/día para hombres ni 1.200 kcal/día para mujeres o personas que prefieren no decirlo. Si tienes una condición de salud, alergias, embarazo o necesidades especiales, consulta a un profesional.</p>
  </>;
}
