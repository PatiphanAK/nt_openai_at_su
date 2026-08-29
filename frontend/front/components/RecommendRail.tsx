import type { CardItem } from "./SummaryCard";
import { SummaryCard } from "./SummaryCard";

export function RecommendRail({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle?: string;
  items: CardItem[];
}) {
  if (items.length === 0) return null;
  return (
    <section aria-label={title}>
      <div className="mb-4 flex flex-wrap items-baseline gap-x-3">
        <h2 className="text-xl font-bold tracking-tight">{title}</h2>
        {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <SummaryCard key={item.summary.id} item={item} />
        ))}
      </div>
    </section>
  );
}
