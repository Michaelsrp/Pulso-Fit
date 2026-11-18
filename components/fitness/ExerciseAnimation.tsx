"use client";

import { useEffect, useRef, useState } from "react";
import { exerciseMotion, exerciseNameEs, mediaUrl, motionLabels, type Exercise } from "@/lib/exercises";

function formatVttTime(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${remainder.toFixed(3).padStart(6, "0")}`;
}

function ExerciseAnimation({ exercise }: { exercise: Exercise }) {
  const src = mediaUrl(exercise);
  const motion = exerciseMotion(exercise);
  const exerciseTitle = exerciseNameEs(exercise.name, exercise.source_id || exercise.id, exercise.name_es, exercise.target);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadMedia, setLoadMedia] = useState(false);
  const [captionsUrl, setCaptionsUrl] = useState<string | null>(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!src || !node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        setLoadMedia(true);
        observer.disconnect();
      }
    }, { rootMargin: "180px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, [src]);

  useEffect(() => {
    if (!src || !loadMedia) return;
    const steps = exercise.steps_es?.length ? exercise.steps_es : [`Demostración orientativa: ${exerciseTitle}. Consulta la técnica escrita antes de comenzar.`];
    const cues = steps.map((step, index) => {
      const start = index * 6;
      const end = start + 6;
      return `${formatVttTime(start)} --> ${formatVttTime(end)}\n${step}`;
    });
    const blob = new Blob([`WEBVTT\n\n${cues.join("\n\n")}\n`], { type: "text/vtt;charset=utf-8" });
    const objectUrl = URL.createObjectURL(blob);
    setCaptionsUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [src, loadMedia, exercise.id, exerciseTitle, exercise.steps_es]);

  return <div ref={containerRef} className={src && loadMedia ? "media-holder" : `exercise-animation motion-${motion}`} {...(src && loadMedia ? {} : { role: "img", "aria-label": `Ilustración animada esquemática de ${exerciseTitle}; patrón de ${motionLabels[motion]}` })}>
    {src && loadMedia ? <video src={src} autoPlay muted loop playsInline preload="none" aria-label={`Video de referencia para ${exerciseTitle}`}>
      {captionsUrl && <track kind="captions" src={captionsUrl} srcLang="es" label="Pasos e indicaciones en español" default/>}
    </video> : <><div className="stick-person"><span className="stick-head"/><span className="stick-torso"/><span className="stick-arm left"/><span className="stick-arm right"/><span className="stick-leg left"/><span className="stick-leg right"/></div><span className="motion-caption">{motionLabels[motion]}</span></>}
  </div>;
}

export default ExerciseAnimation;
