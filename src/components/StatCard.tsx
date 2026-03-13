import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  gradient: "primary" | "accent" | "success" | "warning";
  change?: string;
  delay?: number;
}

const gradientMap = {
  primary: "gradient-primary",
  accent: "gradient-accent",
  success: "gradient-success",
  warning: "gradient-warning",
};

export default function StatCard({ title, value, icon: Icon, gradient, change, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1, duration: 0.4 }}
      className="rounded-xl bg-card p-6 shadow-card hover:shadow-card-hover transition-shadow duration-300"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-bold text-card-foreground">{value}</p>
          {change && (
            <p className="mt-1 text-xs font-medium text-success">{change}</p>
          )}
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${gradientMap[gradient]}`}>
          <Icon className="h-6 w-6 text-primary-foreground" />
        </div>
      </div>
    </motion.div>
  );
}
