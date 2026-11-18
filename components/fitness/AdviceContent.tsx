function AdviceContent({ id }: { id: string }) {
  const content: Record<string,{title:string;items:string[]}> = {
    gym:{title:"Una sesión organizada",items:["Define el objetivo de la sesión antes de comenzar.","Calienta entre 5 y 8 minutos con movilidad y actividad suave.","Ajusta la carga para mantener control del movimiento.","Respeta los descansos y limpia el equipo después de usarlo."]},
    home:{title:"Entrena con lo que tienes",items:["Despeja un espacio estable y utiliza ropa cómoda.","Comienza con movimientos controlados de peso corporal.","Adapta las repeticiones a tu nivel y descansa entre rondas.","Usa una silla o pared firme solo cuando sea seguro."]},
    run:{title:"Sal a tu ritmo",items:["Alterna caminata y trote suave al comenzar.","Aumenta la duración de forma gradual.","Elige una ruta segura, visible y adecuada al clima.","Hidrátate y detente ante dolor o malestar."]},
    warmup:{title:"Calienta progresivamente",items:["Camina o marcha suavemente durante 2–3 minutos.","Añade movilidad de tobillos, caderas, hombros y muñecas.","Realiza movimientos dinámicos relacionados con tu sesión.","Evita forzar estiramientos intensos antes de empezar."]},
    "men-food":{title:"Alimentación variada",items:["Incluye proteína, carbohidratos, frutas y verduras.","Ajusta las porciones a tu hambre y actividad.","Mantén hidratación durante el día.","Evita depender de suplementos o dietas restrictivas."]},
    "women-food":{title:"Nutrición sin restricciones extremas",items:["Prioriza comidas completas y suficientes.","Combina fuentes de proteína con fibra y grasas saludables.","Escucha señales de hambre y saciedad.","Consulta un profesional para necesidades individuales."]},
    food:{title:"Hábitos que se sostienen",items:["Varía colores, texturas y grupos de alimentos.","Planifica opciones sencillas para días ocupados.","Prefiere agua como bebida habitual.","No necesitas perfección: busca consistencia y flexibilidad."]},
  };
  const c=content[id]||content.food;
  return <div className="mt-5"><h3 className="font-extrabold mb-2">{c.title}</h3><ul className="list-disc pl-5 space-y-2 text-sm text-slate-600">{c.items.map(t=><li key={t}>{t}</li>)}</ul></div>;
}

export default AdviceContent;
