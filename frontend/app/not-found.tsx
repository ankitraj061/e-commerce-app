"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Boxes } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute -top-40 -right-40 h-[400px] w-[400px] rounded-full bg-amber-400/15 blur-[120px]" />
      <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-orange-400/10 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 text-center px-6"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-xl shadow-amber-500/30">
            <Boxes className="h-7 w-7 text-white" />
          </div>
        </div>

        {/* 404 */}
        <div className="text-[10rem] font-bold leading-none gradient-text mb-2 select-none">
          404
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Page not found
        </h1>
        <p className="text-gray-500 mb-10 max-w-sm mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild leftIcon={<Home className="h-4 w-4" />}>
            <Link href="/">Back to Home</Link>
          </Button>
          <Button
            variant="glass"
            onClick={() => typeof window !== "undefined" && window.history.back()}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Go Back
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
