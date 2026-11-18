export type NutritionGoal = "bajar_peso" | "mantener" | "subir_peso" | "ganar_masa_muscular";
export type NutritionGender = "hombre" | "mujer" | "prefiero_no_decirlo";

export function estimateDailyCalories(input: {
  gender: NutritionGender;
  goal: NutritionGoal;
  weightKg: number;
  heightCm: number;
  age: number;
}) {
  const sexAdjustment = input.gender === "hombre" ? 5 : input.gender === "mujer" ? -161 : -78;
  const basalEstimate = 10 * input.weightKg + 6.25 * input.heightCm - 5 * input.age + sexAdjustment;
  const maintenanceEstimate = basalEstimate * 1.35;
  const proposed = input.goal === "bajar_peso" ? maintenanceEstimate - 250
    : input.goal === "subir_peso" || input.goal === "ganar_masa_muscular" ? maintenanceEstimate + 200
    : maintenanceEstimate;
  const floor = input.gender === "hombre" ? 1500 : 1200;
  const rounded = Math.round(proposed / 50) * 50;
  return { calories: Math.max(floor, rounded), floor, clamped: rounded < floor };
}

export const mealsByGoal: Record<NutritionGoal, { name: string; meals: { icon: string; title: string; description: string }[] }> = {
  bajar_peso: { name: "Hábitos y porciones sostenibles", meals: [
    { icon: "🌞", title: "Desayuno", description: "Huevos pericos, arepa de maíz y una porción de papaya." },
    { icon: "🥗", title: "Almuerzo", description: "Lentejas o pollo, arroz, ensalada abundante y aguacate en porción moderada." },
    { icon: "🍎", title: "Media tarde", description: "Yogur natural con fruta o una porción pequeña de maní sin sal." },
    { icon: "🌙", title: "Cena", description: "Pescado, atún o huevo con papa cocida y verduras salteadas." },
  ] },
  mantener: { name: "Variedad para mantener energía", meals: [
    { icon: "🌞", title: "Desayuno", description: "Avena con leche, banano y huevo acompañado de arepa." },
    { icon: "🥗", title: "Almuerzo", description: "Arroz, fríjoles, pollo o tofu, ensalada y tajadas de plátano asado." },
    { icon: "🍌", title: "Media tarde", description: "Fruta de temporada con yogur o queso fresco." },
    { icon: "🌙", title: "Cena", description: "Tortilla de verduras, papa criolla y una porción de aguacate." },
  ] },
  subir_peso: { name: "Comidas completas y suficientes", meals: [
    { icon: "🌞", title: "Desayuno", description: "Arepa con huevos, queso, aguacate y un vaso de leche." },
    { icon: "🥗", title: "Almuerzo", description: "Arroz, fríjoles, pollo o pescado, plátano maduro y ensalada." },
    { icon: "🥜", title: "Media tarde", description: "Batido casero de leche, banano y avena, o yogur con frutos secos." },
    { icon: "🌙", title: "Cena", description: "Papa o yuca, huevos o atún y verduras con aceite de oliva." },
  ] },
  ganar_masa_muscular: { name: "Energía y proteína repartidas durante el día", meals: [
    { icon: "🌞", title: "Desayuno", description: "Avena con leche, banano, huevos y arepa." },
    { icon: "🥗", title: "Almuerzo", description: "Arroz, pechuga de pollo o legumbres, fríjoles y ensalada." },
    { icon: "💪", title: "Después de entrenar", description: "Yogur natural con fruta y maní, o sándwich de huevo." },
    { icon: "🌙", title: "Cena", description: "Pescado, carne magra o tofu con papa, yuca o arroz y verduras." },
  ] },
};
