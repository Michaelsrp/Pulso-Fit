"use client";

import { ChevronRight, Home, Search, SlidersHorizontal } from "lucide-react";

export type AdviceCard = {
  id: string;
  title: string;
  desc: string;
  category: string;
  image: string;
  icon: string;
};

type HomeTipsViewProps = {
  cards: AdviceCard[];
  query: string;
  category: string;
  onQueryChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSelectCard: (card: AdviceCard) => void;
};

const categories = ["Todas", "Entrenamiento", "Calentamiento", "Alimentación"];

export default function HomeTipsView({ cards, query, category, onQueryChange, onCategoryChange, onSelectCard }: HomeTipsViewProps) {
  return <>
    <div className="breadcrumb"><Home size={14}/> <span>Inicio</span><ChevronRight size={14}/><span>Consejos</span></div>
    <div className="hero-banner">
      <div className="banner-copy"><div className="eyebrow">PULSO FIT · TU ESPACIO</div><h2>Tu energía, tu ritmo, tu progreso.</h2><p>Encuentra ideas para moverte y cuidarte cada día.</p></div>
      <div className="banner-balls" aria-hidden="true"><span>💪</span><span>🌿</span><span>⚡</span></div>
    </div>
    <h1 className="main-title">¿Cómo quieres entrenar hoy?</h1>
    <p className="main-subtitle">Explora consejos de movimiento, calentamiento y alimentación para acompañar tus objetivos.</p>
    <div className="search-row">
      <div className="searchbox"><Search size={19} className="text-slate-500"/><input aria-label="Buscar consejos" placeholder="Busca una actividad o consejo" value={query} onChange={event => onQueryChange(event.target.value)}/></div>
      <button className="outline-button" onClick={() => onCategoryChange(category === "Todas" ? "Entrenamiento" : "Todas")} aria-label="Filtrar consejos"><SlidersHorizontal size={18}/> Filtrar</button>
    </div>
    <div className="count-row"><span>{cards.length} consejos disponibles</span><span>Explora a tu manera</span></div>
    <div className="category-pills">{categories.map(item => <button key={item} className={`pill ${category === item ? "active" : ""}`} aria-pressed={category === item} onClick={() => onCategoryChange(item)}>{item}</button>)}</div>
    <div className="tips-grid">{cards.map(card => <article className="tip-card" key={card.id}>
      <div className="tip-image"><img src={card.image} alt={`Ilustración original: ${card.title}`} loading="lazy" decoding="async"/><span className="tip-tag">{card.category}</span></div>
      <div className="tip-content"><h3>{card.title}</h3><p>{card.desc}</p><button className="primary-button" onClick={() => onSelectCard(card)}>Ver consejos <ChevronRight size={17}/></button></div>
    </article>)}</div>
    {cards.length === 0 && <div className="empty-state">No encontramos consejos con esa búsqueda.</div>}
  </>;
}
