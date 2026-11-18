import type { RoutineActivity } from "@/lib/routine-content";

function RoutineBlockList({ title, description, items }: { title: string; description: string; items: RoutineActivity[] }) {
  return <section className="panel-card mb-4" aria-label={title}>
    <h2>{title}</h2><p className="text-sm text-slate-600 mb-3">{description}</p>
    <ol className="grid gap-2 sm:grid-cols-2">{items.map((item, index) => <li key={`${item.name}-${index}`} className="rounded-xl bg-slate-50 p-3">
      <div className="flex items-start justify-between gap-2"><strong className="text-sm">{index + 1}. {item.name}</strong><span className="tag shrink-0">{item.duration}</span></div>
      <p className="text-xs text-slate-600 mt-2">{item.steps}</p>
    </li>)}</ol>
  </section>;
}


export default RoutineBlockList;
