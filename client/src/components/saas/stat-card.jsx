import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function StatCard({ label, value, helper, icon: Icon, className }) {
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className={cn("saas-card flex items-center justify-between gap-4", className)}>
      <div>
        <p className="card-label">{label}</p>
        <p className="mt-3 font-display text-3xl font-semibold tracking-tight">{value}</p>
        <p className="mt-2 text-sm text-muted-foreground">{helper}</p>
      </div>
      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/25">
          <Icon className="h-5 w-5" />
        </div>
      )}
    </motion.div>
  );
}
