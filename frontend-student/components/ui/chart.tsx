import * as React from "react";
import { cn } from "@/lib/utils";

export type ChartConfig = Record<
  string,
  {
    label: string;
    color: string;
    unit?: string;
  }
>;

export function ChartContainer({
  className,
  children,
  config,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { config: ChartConfig }) {
  const style = Object.fromEntries(
    Object.entries(config).map(([key, value]) => [`--color-${key}`, value.color]),
  ) as React.CSSProperties;

  return (
    <div
      className={cn(
        "relative min-h-[240px] w-full overflow-hidden rounded-2xl bg-white text-slate-900",
        className,
      )}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
}

export function ChartTooltip({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-xs shadow-xl backdrop-blur",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function ChartLegend({
  config,
  activeKey,
  onSelect,
}: {
  config: ChartConfig;
  activeKey: string;
  onSelect: (key: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {Object.entries(config).map(([key, item]) => {
        const active = key === activeKey;

        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(key)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-all",
              active
                ? "border-sky-200 bg-sky-50 text-sky-700 shadow-sm"
                : "border-slate-200 bg-white text-slate-500 hover:border-sky-100 hover:bg-sky-50/60 hover:text-sky-700",
            )}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
