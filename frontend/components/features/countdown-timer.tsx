"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Clock, AlertTriangle, XCircle } from "lucide-react";
import { useCountdown } from "@/hooks/use-countdown";
import { formatCountdown } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface CountdownTimerProps {
  expiresAt: string;
  totalSeconds?: number;
  className?: string;
}

export function CountdownTimer({ expiresAt, totalSeconds = 900, className }: CountdownTimerProps) {
  const { seconds, isExpired, isWarning, isDanger } = useCountdown(expiresAt);
  const progress = Math.max(0, seconds / totalSeconds);
  const circumference = 2 * Math.PI * 54; 
  const strokeDashoffset = circumference * (1 - progress);

  const ringColor = isExpired
    ? "#ef4444"
    : isDanger
    ? "#ef4444"
    : isWarning
    ? "#f59e0b"
    : "#f59e0b";

  const glowColor = isExpired
    ? "rgba(239,68,68,0.4)"
    : isDanger
    ? "rgba(239,68,68,0.3)"
    : isWarning
    ? "rgba(245,158,11,0.3)"
    : "rgba(245,158,11,0.25)";

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      {}
      <div className="relative">
        {}
        <motion.div
          animate={{ boxShadow: `0 0 40px ${glowColor}` }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 rounded-full"
        />

        <svg width="128" height="128" className="-rotate-90">
          {}
          <circle
            cx="64"
            cy="64"
            r="54"
            fill="none"
            stroke="rgba(0,0,0,0.08)"
            strokeWidth="8"
          />
          {}
          <motion.circle
            cx="64"
            cy="64"
            r="54"
            fill="none"
            stroke={ringColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: "linear" }}
            style={{ filter: `drop-shadow(0 0 6px ${ringColor})` }}
          />
        </svg>

        {}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {isExpired ? (
              <motion.div
                key="expired"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex flex-col items-center"
              >
                <XCircle className="h-8 w-8 text-red-500" />
                <span className="text-xs text-red-500 font-medium mt-1">Expired</span>
              </motion.div>
            ) : (
              <motion.div
                key="timer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={cn(
                  "flex flex-col items-center",
                  isDanger && "animate-tick"
                )}
              >
                <span
                  className={cn(
                    "text-2xl font-bold font-mono tabular-nums",
                    isDanger ? "text-red-500" : isWarning ? "text-amber-600" : "text-gray-800"
                  )}
                >
                  {formatCountdown(seconds)}
                </span>
                <span className="text-[10px] text-gray-400 mt-0.5">remaining</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {}
      <AnimatePresence mode="wait">
        {isExpired ? (
          <motion.div
            key="exp-msg"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-2"
          >
            <XCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm text-red-600 font-medium">Reservation expired</span>
          </motion.div>
        ) : isDanger ? (
          <motion.div
            key="danger-msg"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-2"
          >
            <AlertTriangle className="h-4 w-4 text-red-500 animate-pulse" />
            <span className="text-sm text-red-600 font-medium">Hurry! Less than 2 minutes left</span>
          </motion.div>
        ) : isWarning ? (
          <motion.div
            key="warn-msg"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-2"
          >
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span className="text-sm text-amber-700 font-medium">Less than 5 minutes remaining</span>
          </motion.div>
        ) : (
          <motion.div
            key="normal-msg"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-sm text-gray-400"
          >
            <Clock className="h-4 w-4" />
            Stock held for you
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
