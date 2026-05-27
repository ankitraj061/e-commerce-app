"use client";

import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex flex-col items-center justify-center gap-4 py-20 text-center",
        className
      )}
    >
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-amber-400/15 blur-xl scale-150" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-50 border border-amber-100">
          <Icon className="h-9 w-9 text-amber-500" />
        </div>
      </div>
      <div className="space-y-1.5">
        <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
        {description && (
          <p className="text-sm text-gray-400 max-w-sm">{description}</p>
        )}
      </div>
      {action && <div className="pt-2">{action}</div>}
    </motion.div>
  );
}
