import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function ChatPanel({ id, title, description, children, className }) {
  return (
    <section id={id} className={cn("saas-card flex h-full flex-col", className)}>
      <div>
        <h3 className="section-title">{title}</h3>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 flex-1">
        {children}
      </motion.div>
    </section>
  );
}
