"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Mail, Lock, ArrowRight, Boxes, Warehouse, Package2, ShoppingBag } from "lucide-react";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { extractErrorMessage } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
type FormData = z.infer<typeof schema>;

import { fadeUpCustom as fadeUp } from "@/lib/animations";

const floatingIcons = [
  { icon: Warehouse, x: "10%", y: "20%", delay: 0 },
  { icon: Package2, x: "80%", y: "15%", delay: 1.2 },
  { icon: ShoppingBag, x: "15%", y: "75%", delay: 0.6 },
  { icon: Boxes, x: "75%", y: "70%", delay: 1.8 },
];

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const result = await authService.login(data);
      setAuth(result.user, result.accessToken);
      toast.success(`Welcome back, ${result.user.name.split(" ")[0]}!`);
      router.push(result.user.selectedWarehouseId ? "/products" : "/warehouses");
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* ── Left panel — branding ───────────────────────────────────────────── */}
      <div className="relative hidden lg:flex flex-1 flex-col items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 overflow-hidden border-r border-amber-100">
        {/* Background blobs */}
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-amber-400/20 blur-[100px] animate-float-glow" />
        <div className="absolute -bottom-40 -right-40 h-[400px] w-[400px] rounded-full bg-orange-400/15 blur-[100px] animate-float-glow" style={{ animationDelay: "3s" }} />

        {/* Floating icons */}
        {floatingIcons.map(({ icon: Icon, x, y, delay }) => (
          <motion.div
            key={`${x}-${y}`}
            className="absolute flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-amber-100 shadow-md"
            style={{ left: x, top: y }}
            animate={{ y: [0, -12, 0], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, delay, repeat: Infinity, ease: "easeInOut" }}
          >
            <Icon className="h-5 w-5 text-amber-500" />
          </motion.div>
        ))}

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.5) 1px, transparent 1px)", backgroundSize: "50px 50px" }} />

        <div className="relative z-10 max-w-sm text-center px-8">
          <div className="mb-8 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-2xl shadow-amber-500/30">
              <Boxes className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Welcome back to <span className="gradient-text">Bharat Bazaar</span>
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Your multi-warehouse inventory platform. Reserve stock, fulfil orders, and scale your ecommerce operations.
          </p>

          <div className="mt-10 space-y-3">
            {[
              "Atomic inventory reservations",
              "Real-time countdown timers",
              "Razorpay payment integration",
              "Multi-warehouse network",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3 text-sm text-gray-600">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                {feature}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel — form ──────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 relative bg-white">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8 flex flex-col items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500">
            <Boxes className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold gradient-text">Bharat Bazaar</span>
        </div>

        <motion.div
          initial="hidden"
          animate="show"
          className="w-full max-w-md"
        >
          <motion.div variants={fadeUp} custom={0} className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign in</h1>
            <p className="text-gray-500 text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/auth/register" className="text-amber-600 hover:text-amber-700 font-medium transition-colors">
                Create one free
              </Link>
            </p>
          </motion.div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <motion.div variants={fadeUp} custom={1}>
              <Input
                label="Email address"
                type="email"
                placeholder="you@company.com"
                leftIcon={<Mail className="h-4 w-4" />}
                error={errors.email?.message}
                {...register("email")}
              />
            </motion.div>

            <motion.div variants={fadeUp} custom={2}>
              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                leftIcon={<Lock className="h-4 w-4" />}
                error={errors.password?.message}
                {...register("password")}
              />
            </motion.div>

            <motion.div variants={fadeUp} custom={3} className="flex items-center justify-end">
              <button type="button" className="text-sm text-amber-600 hover:text-amber-700 transition-colors">
                Forgot password?
              </button>
            </motion.div>

            <motion.div variants={fadeUp} custom={4}>
              <Button
                type="submit"
                size="lg"
                loading={isSubmitting}
                className="w-full"
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                {isSubmitting ? "Signing in…" : "Sign In"}
              </Button>
            </motion.div>
          </form>

          {/* Divider */}
          <motion.div variants={fadeUp} custom={5} className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-gray-100" />
            <span className="text-xs text-gray-400">OR CONTINUE WITH</span>
            <div className="h-px flex-1 bg-gray-100" />
          </motion.div>

          {/* Demo credentials hint */}
          <motion.div variants={fadeUp} custom={6} className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-center">
            <p className="text-xs text-gray-400 mb-1">Demo credentials</p>
            <p className="text-xs text-gray-600">
              <span className="text-gray-800 font-mono">demo@allo.dev</span>
              {" / "}
              <span className="text-gray-800 font-mono">Demo@1234</span>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
