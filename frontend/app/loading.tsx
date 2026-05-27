import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-xl" />
          <Loader2 className="relative h-10 w-10 text-amber-500 animate-spin" />
        </div>
        <p className="text-sm text-gray-400">Loading…</p>
      </div>
    </div>
  );
}
