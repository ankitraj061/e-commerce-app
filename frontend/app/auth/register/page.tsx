"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Mail, Lock, User, ArrowRight, Boxes, CheckCircle2 } from "lucide-react";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { extractErrorMessage } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[0-9]/, "Must contain a number"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

import { fadeUpCustom as fadeUp } from "@/lib/animations";

const perks = [
  "Free forever — no credit card needed",
  "Unlimited warehouses",
  "Real-time inventory tracking",
  "Razorpay payment integration",
  "Idempotent reservations",
  "Beautiful mobile-first UI",
];

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const password = watch("password", "");

  // Password strength indicator
  const strength = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "bg-red-500", "bg-amber-500", "bg-blue-500", "bg-emerald-500"][strength];

  const onSubmit = async (data: FormData) => {
    try {
      const result = await authService.register({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      setAuth(result.user, result.accessToken);
      toast.success(`Welcome to Bharat Bazaar, ${result.user.name.split(" ")[0]}!`);
      router.push("/warehouses");
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 bg-white">
        {}
        <div className="lg:hidden mb-8 flex flex-col items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500">
            <Boxes className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold gradient-text">Bharat Bazaar</span>
        </div>

        <motion.div initial="hidden" animate="show" className="w-full max-w-md">
          <motion.div variants={fadeUp} custom={0} className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h1>
            <p className="text-gray-500 text-sm">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-amber-600 hover:text-amber-700 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </motion.div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <motion.div variants={fadeUp} custom={1}>
              <Input
                label="Full name"
                type="text"
                placeholder="Ankit Raj"
                leftIcon={<User className="h-4 w-4" />}
                error={errors.name?.message}
                {...register("name")}
              />
            </motion.div>

            <motion.div variants={fadeUp} custom={2}>
              <Input
                label="Email address"
                type="email"
                placeholder="you@company.com"
                leftIcon={<Mail className="h-4 w-4" />}
                error={errors.email?.message}
                {...register("email")}
              />
            </motion.div>

            <motion.div variants={fadeUp} custom={3}>
              <Input
                label="Password"
                type="password"
                placeholder="Min. 8 chars, 1 uppercase, 1 number"
                leftIcon={<Lock className="h-4 w-4" />}
                error={errors.password?.message}
                {...register("password")}
              />
              {}
              {password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i <= strength ? strengthColor : "bg-gray-100"
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs ${["", "text-red-500", "text-amber-600", "text-blue-500", "text-emerald-500"][strength]}`}>
                    {strengthLabel} password
                  </p>
                </div>
              )}
            </motion.div>

            <motion.div variants={fadeUp} custom={4}>
              <Input
                label="Confirm password"
                type="password"
                placeholder="Repeat your password"
                leftIcon={<Lock className="h-4 w-4" />}
                error={errors.confirmPassword?.message}
                {...register("confirmPassword")}
              />
            </motion.div>

            <motion.div variants={fadeUp} custom={5} className="pt-1">
              <Button
                type="submit"
                size="lg"
                loading={isSubmitting}
                className="w-full"
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                {isSubmitting ? "Creating account…" : "Create Account"}
              </Button>
            </motion.div>
          </form>

          <motion.div variants={fadeUp} custom={6} className="mt-5 text-center">
            <p className="text-[11px] text-gray-400">
              By creating an account, you agree to our{" "}
              <span className="text-gray-500 hover:text-gray-700 cursor-pointer transition-colors">Terms of Service</span>
              {" "}and{" "}
              <span className="text-gray-500 hover:text-gray-700 cursor-pointer transition-colors">Privacy Policy</span>
            </p>
          </motion.div>
        </motion.div>
      </div>

      {}
      <div className="relative hidden lg:flex flex-1 flex-col items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 overflow-hidden border-l border-amber-100">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-amber-400/20 blur-[100px] animate-float-glow" />
        <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-orange-400/15 blur-[100px] animate-float-glow" style={{ animationDelay: "4s" }} />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.5) 1px, transparent 1px)", backgroundSize: "50px 50px" }} />

        <div className="relative z-10 max-w-sm px-8">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-xl shadow-amber-500/30">
              <Boxes className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">Bharat Bazaar</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Everything you need, free.
          </h2>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">
            Start managing your warehouse inventory today. No limits, no hidden fees.
          </p>

          <div className="space-y-3">
            {perks.map((perk, i) => (
              <motion.div
                key={perk}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.4, ease: "easeOut" }}
                className="flex items-center gap-3"
              >
                <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-amber-500/20">
                  <CheckCircle2 className="h-3.5 w-3.5 text-amber-600" />
                </div>
                <span className="text-sm text-gray-700">{perk}</span>
              </motion.div>
            ))}
          </div>

          {}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="mt-10 bg-white rounded-2xl border border-amber-100 p-5 shadow-md"
          >
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              &ldquo;We went from spreadsheets to real-time warehouse management in one afternoon. The UI is stunning.&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 text-xs font-semibold text-white">
                SK
              </div>
              <div>
                <div className="text-xs font-medium text-gray-800">Saurav Kumar</div>
                <div className="text-[11px] text-gray-400">VP Operations, QuickShip</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
