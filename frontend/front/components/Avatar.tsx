const SIZES = {
  sm: "h-7 w-7 text-[10px]",
  md: "h-9 w-9 text-xs",
  lg: "h-16 w-16 text-xl",
} as const;

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part[0] ?? "")
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Avatar({
  name,
  color,
  size = "md",
}: {
  name: string;
  color: string; // gradient classes, e.g. "from-indigo-500 to-violet-500"
  size?: keyof typeof SIZES;
}) {
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 select-none items-center justify-center rounded-full bg-gradient-to-br ${color} ${SIZES[size]} font-semibold text-white`}
    >
      {initials(name)}
    </span>
  );
}
