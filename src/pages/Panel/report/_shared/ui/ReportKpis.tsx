import type { ReportKpi } from './reportUi.types';

export default function ReportKpis({ items }: { items: ReportKpi[] }) {
  if (!items.length) return null;
  const cols = Math.min(Math.max(items.length, 2), 6);
  return (
    <div className={`rs-kpis cols-${cols}`}>
      {items.map((k) => (
        <div key={k.key} className="rs-kpi">
          <span className="rs-kpi-label">{k.label}</span>
          <strong className="rs-kpi-value">{k.value}</strong>
        </div>
      ))}
    </div>
  );
}
