import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function NotificationToast({ show, title, description, variant = "success" }) {
  const Icon = variant === "success" ? CheckCircle2 : Info;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          className={cn(
            "fixed right-5 top-5 z-50 flex max-w-sm items-start gap-3 rounded-2xl border bg-card/95 p-4 shadow-soft backdrop-blur-xl",
            variant === "success" ? "border-primary/30" : "border-border"
          )}
        >
          <Icon className={cn("mt-0.5 h-5 w-5", variant === "success" ? "text-primary" : "text-foreground")} />
          <div>
            <p className="text-sm font-semibold">{title}</p>
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
