import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function DashboardCard({ id, title, description, label, action, className, children }) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      whileHover={{ y: -4 }}
      className={cn("saas-card soft-ring", className)}
    >
      {(title || description || label || action) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {label && <p className="card-label mb-2">{label}</p>}
            {title && <h3 className="section-title">{title}</h3>}
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </motion.section>
  );
}
