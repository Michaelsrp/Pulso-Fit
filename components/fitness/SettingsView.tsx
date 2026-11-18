"use client";

import { Accessibility } from "lucide-react";
import Switch from "@/components/fitness/Switch";

type SettingsViewProps = {
  colorblind: boolean;
  highContrast: boolean;
  largeText: boolean;
  onColorblindChange: (value: boolean) => void;
  onHighContrastChange: (value: boolean) => void;
  onLargeTextChange: (value: boolean) => void;
  onDeleteAccount: () => void;
};

export default function SettingsView({ colorblind, highContrast, largeText, onColorblindChange, onHighContrastChange, onLargeTextChange, onDeleteAccount }: SettingsViewProps) {
  return <>
    <div className="section-heading"><div><h1>Ajustes y accesibilidad</h1><p>Personaliza la lectura y la interacción de Pulso Fit.</p></div><Accessibility size={30} className="text-amber-500"/></div>
    <div className="panel-card">
      <div className="settings-row"><div><strong>Modo apto para daltonismo</strong><p className="text-xs text-slate-500">Añade patrones y cambia acentos; la información no depende solo del color.</p></div><Switch label="Modo apto para daltonismo" checked={colorblind} onChange={onColorblindChange}/></div>
      <div className="settings-row"><div><strong>Alto contraste</strong><p className="text-xs text-slate-500">Refuerza bordes, texto y separación de superficies.</p></div><Switch label="Alto contraste" checked={highContrast} onChange={onHighContrastChange}/></div>
      <div className="settings-row"><div><strong>Texto más grande</strong><p className="text-xs text-slate-500">Aumenta el tamaño base para facilitar la lectura.</p></div><Switch label="Texto más grande" checked={largeText} onChange={onLargeTextChange}/></div>
      <div className="settings-row"><div><strong>Etiquetas para lectores de pantalla</strong><p className="text-xs text-slate-500">Los controles e imágenes incluyen nombres accesibles.</p></div><span className="pill active">Activado</span></div>
      <div className="settings-row"><div><strong>Subtítulos y avisos visuales</strong><p className="text-xs text-slate-500">Los avisos importantes se muestran por escrito y sin depender del sonido.</p></div><span className="pill active">Activado</span></div>
      <p className="notice mt-4">Pulso Fit procura facilitar la navegación con TalkBack y VoiceOver. La compatibilidad debe comprobarse con dispositivos y lectores reales antes de considerarse certificada.</p>
      <button className="outline-button mt-5" onClick={() => { onColorblindChange(false); onHighContrastChange(false); onLargeTextChange(false); }}>Restablecer ajustes</button>
      <div className="mt-6 pt-5 border-t border-slate-100"><h2 className="font-extrabold">Privacidad y cuenta</h2><div className="flex flex-wrap gap-3 mt-3"><a className="text-link" href="/terminos">Términos de uso</a><a className="text-link" href="/privacidad">Política de privacidad</a></div><p className="notice mt-4">Puedes solicitar la eliminación de tu cuenta y los datos asociados. La acción es permanente.</p><button className="outline-button mt-3" onClick={onDeleteAccount}>Eliminar mi cuenta y mis datos</button></div>
    </div>
  </>;
}
