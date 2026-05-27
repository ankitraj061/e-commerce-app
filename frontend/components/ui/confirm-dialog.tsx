"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
    variant?: "destructive" | "default";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Go Back",
  variant = "destructive",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />

          {}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.35 }}
            className="fixed inset-x-4 top-1/2 z-50 -translate-y-1/2 mx-auto max-w-md bg-white rounded-2xl border border-gray-100 shadow-2xl shadow-gray-400/20 overflow-hidden"
          >
            {}
            <button
              onClick={onCancel}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="p-6">
              {}
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 border border-red-100 mb-4">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>

              {}
              <h2 className="text-lg font-semibold text-gray-900 mb-1">{title}</h2>
              <p className="text-sm text-gray-500 leading-relaxed">{description}</p>

              {}
              <div className="flex gap-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={onCancel}
                  disabled={loading}
                >
                  {cancelLabel}
                </Button>
                <Button
                  type="button"
                  className={
                    variant === "destructive"
                      ? "flex-1 bg-red-500 hover:bg-red-600 text-white border-transparent"
                      : "flex-1"
                  }
                  onClick={onConfirm}
                  loading={loading}
                  disabled={loading}
                >
                  {loading ? "Cancelling…" : confirmLabel}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
