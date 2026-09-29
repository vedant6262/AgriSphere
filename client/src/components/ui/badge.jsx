import { cn } from "@/lib/utils";

const variants = {
  default: "bg-primary/15 text-primary",
  secondary: "bg-secondary/15 text-secondary",
  outline: "border border-border bg-background/70 text-foreground",
  destructive: "bg-red-500/15 text-red-600 dark:text-red-300"
};

export function Badge({ className, variant = "default", ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
