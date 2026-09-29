import { cn } from "@/lib/utils";

export function Card({ className, ...props }) {
  return <div className={cn("glass-card rounded-2xl p-5 soft-ring", className)} {...props} />;
}

export function CardHeader({ className, ...props }) {
  return <div className={cn("mb-4 flex items-start justify-between gap-4", className)} {...props} />;
}

export function CardTitle({ className, ...props }) {
  return <h3 className={cn("font-display text-lg font-semibold tracking-tight", className)} {...props} />;
}

export function CardDescription({ className, ...props }) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

export function CardContent({ className, ...props }) {
  return <div className={cn("", className)} {...props} />;
}
