"use client";

import Link from "next/link";
import { motion, useScroll, useTransform, useInView, animate } from "framer-motion";
import { useRef, useEffect } from "react";
import {
  ArrowRight,
  Boxes,
  Warehouse,
  Zap,
  Shield,
  BarChart3,
  Clock,
  CheckCircle2,
  Star,
  Globe,
  TrendingUp,
  Package,
  Sparkles,
  MapPin,
  Bell,
  Lock,
  Users,
  Activity,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeUpCustom as fadeUp, staggerContainer as stagger } from "@/lib/animations";

function AnimatedCounter({
  to,
  suffix = "",
  prefix = "",
}: {
  to: number;
  suffix?: string;
  prefix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  useEffect(() => {
    if (!isInView || !ref.current) return;
    const controls = animate(0, to, {
      duration: 2,
      ease: "easeOut",
      onUpdate(v) {
        if (ref.current) {
          ref.current.textContent = prefix + Math.round(v).toLocaleString() + suffix;
        }
      },
    });
    return controls.stop;
  }, [isInView, to, suffix, prefix]);

  return (
    <span ref={ref}>
      {prefix}0{suffix}
    </span>
  );
}

const stats = [
  { to: 99, suffix: ".9%", label: "Uptime SLA", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { to: 50, suffix: "ms", prefix: "<", label: "Reservation Latency", icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10" },
  { label: "Oversells Guaranteed", icon: Shield, color: "text-rose-500", bg: "bg-rose-500/10", special: "Zero" },
  { to: 2847, suffix: "+", label: "Reservations / Day", icon: Activity, color: "text-violet-500", bg: "bg-violet-500/10" },
];

const steps = [
  { step: "01", title: "Select Your Warehouse", desc: "Browse warehouses near you and choose based on delivery speed and stock availability." },
  { step: "02", title: "Discover Products", desc: "View real-time inventory from your selected warehouse. All stock levels are live and accurate." },
  { step: "03", title: "Reserve Instantly", desc: "Click Reserve to atomically hold your items. A 10-minute countdown timer starts." },
  { step: "04", title: "Pay with Razorpay", desc: "Complete payment via UPI, cards, or net banking. Signature verification keeps things secure." },
  { step: "05", title: "Order Confirmed", desc: "Your reservation becomes an order. Track it live from our beautiful orders dashboard." },
];

const testimonials = [
  {
    quote: "Bharat Bazaar cut our oversell incidents to zero. The atomic reservation system is rock-solid.",
    author: "Priya Sharma",
    role: "Head of Logistics, Nykaa",
    avatar: "PS",
    gradient: "from-rose-500 to-pink-500",
  },
  {
    quote: "We manage 12 warehouses from one dashboard. The UI is incredibly polished and our ops team loves it.",
    author: "Rohit Malhotra",
    role: "CTO, Meesho Supply Chain",
    avatar: "RM",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    quote: "The countdown reservation flow drives urgency and our conversion rate jumped 23% in the first month.",
    author: "Ananya Iyer",
    role: "Product Manager, Flipkart Ads",
    avatar: "AI",
    gradient: "from-violet-500 to-purple-500",
  },
];

const marqueeItems = [
  "Nykaa", "Meesho", "Flipkart", "Razorpay", "Swiggy", "Zomato",
  "PhonePe", "Dunzo", "Licious", "SUGAR Cosmetics", "boAt", "Mamaearth",
];

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <div className="relative overflow-x-hidden bg-[#09090b]">
      {}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 lg:px-12 h-16 bg-[#09090b]/80 backdrop-blur-md border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/30">
            <Boxes className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold gradient-text">Bharat Bazaar</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="h-8 px-3 inline-flex items-center rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/8 transition-all duration-200"
          >
            Log In
          </Link>
          <Button size="sm" asChild>
            <Link href="/auth/register">
              Get Started <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </nav>

      {}
      <section
        ref={heroRef}
        className="relative flex min-h-screen items-center justify-center overflow-hidden pt-16"
      >
        {}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            style={{ y: heroY }}
            className="absolute -top-60 -right-40 h-[700px] w-[700px] rounded-full bg-amber-500/20 blur-[140px]"
          />
          <motion.div
            style={{ y: heroY }}
            className="absolute -bottom-40 -left-60 h-[600px] w-[600px] rounded-full bg-orange-600/15 blur-[120px]"
          />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[400px] w-[900px] rounded-full bg-amber-400/8 blur-[100px]" />
          {}
          <div
            className="absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          {}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_-10%,rgba(245,158,11,0.18),transparent)]" />
        </div>

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 mx-auto max-w-5xl px-4 text-center"
        >
          {}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0}
            className="mt-8 mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-sm text-amber-400 animate-border-sweep"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            Multi-Warehouse Inventory Platform
            <ChevronRight className="h-3.5 w-3.5 opacity-60" />
          </motion.div>

          {}
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={1}
            className="mb-6 text-5xl sm:text-6xl lg:text-[80px] font-bold leading-[1.05] tracking-tight"
          >
            <span className="text-white">Reserve Stock.{" "}</span>
            <span className="gradient-text">Fulfil Orders.</span>
            <br />
            <span className="text-gray-500">At Scale.</span>
          </motion.h1>

          {}
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={2}
            className="mb-10 mx-auto max-w-2xl text-lg sm:text-xl text-gray-400 leading-relaxed"
          >
            Bharat Bazaar gives your team atomic inventory reservations, real-time
            countdowns, and seamless Razorpay payments — across every warehouse you operate.
          </motion.p>

          {}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={3}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button size="xl" asChild className="group shadow-2xl shadow-amber-500/30">
              <Link href="/auth/register">
                Start for Free
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Link
              href="/auth/login"
              className="h-14 px-8 inline-flex items-center justify-center gap-2 rounded-2xl text-lg font-medium border border-white/15 bg-white/5 text-white hover:bg-white/10 hover:border-white/25 backdrop-blur-sm transition-all duration-200"
            >
              Sign In
            </Link>
          </motion.div>

          {}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={4}
            className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500"
          >
            {["No credit card required", "Free forever plan", "Setup in minutes"].map((t) => (
              <div key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                {t}
              </div>
            ))}
          </motion.div>

          {}
          <motion.div
            initial={{ opacity: 0, y: 80, scale: 0.93 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.65, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="mt-20 relative mx-auto max-w-4xl"
          >
            {}
            <div className="absolute -inset-8 rounded-3xl bg-amber-500/15 blur-3xl -z-10" />

            <div className="relative rounded-2xl bg-[#111115] border border-white/[0.08] overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)]">
              {}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-[#0c0c10]">
                <div className="h-3 w-3 rounded-full bg-red-500/70" />
                <div className="h-3 w-3 rounded-full bg-amber-500/70" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/70" />
                <div className="ml-4 flex-1 rounded-md bg-white/5 h-6 flex items-center px-3">
                  <span className="text-xs text-gray-600">bharatbazaar.in/dashboard</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-emerald-400 font-medium">Live</span>
                </div>
              </div>

              {}
              <div className="p-5 bg-[#111115]">
                {}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { label: "Total Reservations", value: "2,847", trend: "+12%", icon: "📦" },
                    { label: "Active Orders", value: "186", trend: "+5%", icon: "🚀" },
                    { label: "Stock Utilisation", value: "73%", trend: "+8%", icon: "📊" },
                  ].map((m) => (
                    <div
                      key={m.label}
                      className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-3.5"
                    >
                      <div className="text-xs text-gray-500 mb-1.5">{m.label}</div>
                      <div className="text-xl font-bold text-white">{m.value}</div>
                      <div className="mt-1.5 flex items-center gap-1 text-[11px] text-emerald-400">
                        <TrendingUp className="h-3 w-3" />
                        {m.trend} this week
                      </div>
                    </div>
                  ))}
                </div>

                {}
                <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs text-gray-400 font-medium flex items-center gap-2">
                      <Warehouse className="h-3.5 w-3.5 text-amber-400" />
                      Active Warehouses
                    </div>
                    <span className="text-[10px] text-gray-600">4 locations</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2.5">
                    {[
                      { city: "Delhi NCR", stock: 87, orders: 42 },
                      { city: "Mumbai", stock: 64, orders: 31 },
                      { city: "Bangalore", stock: 92, orders: 58 },
                      { city: "Chennai", stock: 51, orders: 19 },
                    ].map((w) => (
                      <div
                        key={w.city}
                        className="rounded-lg bg-amber-500/[0.08] border border-amber-500/20 p-2.5"
                      >
                        <MapPin className="h-4 w-4 text-amber-400 mb-1.5" />
                        <div className="text-xs font-medium text-gray-300 leading-tight mb-2">
                          {w.city}
                        </div>
                        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mb-1">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
                            style={{ width: `${w.stock}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-amber-400/80">{w.stock}% stocked</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {}
      <div className="py-10 border-y border-white/[0.06] overflow-hidden bg-[#09090b]">
        <p className="text-center text-[11px] font-semibold tracking-[0.2em] text-gray-600 uppercase mb-5">
          Trusted by operations teams at
        </p>
        <div className="relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div className="flex shrink-0 animate-marquee">
            {[...marqueeItems, ...marqueeItems].map((item, i) => (
              <span
                key={i}
                className="mx-8 text-gray-500 font-medium text-sm flex items-center gap-2.5 whitespace-nowrap"
              >
                <span className="h-1 w-1 rounded-full bg-amber-500/60 flex-shrink-0" />
                {item}
              </span>
            ))}
          </div>
          <div className="flex shrink-0 animate-marquee" aria-hidden>
            {[...marqueeItems, ...marqueeItems].map((item, i) => (
              <span
                key={i}
                className="mx-8 text-gray-500 font-medium text-sm flex items-center gap-2.5 whitespace-nowrap"
              >
                <span className="h-1 w-1 rounded-full bg-amber-500/60 flex-shrink-0" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                variants={fadeUp}
                whileHover={{ y: -4, scale: 1.02 }}
                className="relative bg-white rounded-2xl border border-gray-100 p-6 text-center hover:border-amber-200 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 shadow-sm overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-50/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg} mb-3`}
                >
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className={`text-4xl font-bold mb-1 ${stat.color}`}>
                  {stat.special ? (
                    stat.special
                  ) : (
                    <AnimatedCounter to={stat.to!} suffix={stat.suffix} prefix={stat.prefix} />
                  )}
                </div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {}
      <section className="py-24 bg-gray-50/80">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-sm text-amber-700 mb-4"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Features
            </motion.div>
            <motion.h2
              variants={fadeUp}
              className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4"
            >
              Everything you need to{" "}
              <span className="gradient-text">fulfil at scale</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-gray-500 max-w-2xl mx-auto">
              Built for growing ecommerce teams who need reliability, speed, and beautiful tooling.
            </motion.p>
          </motion.div>

          {}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-6 gap-4 auto-rows-auto"
          >
            {}
            <motion.div
              variants={fadeUp}
              whileHover={{ y: -4 }}
              className="md:col-span-4 group bg-white rounded-2xl border border-gray-100 p-7 hover:border-amber-200 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-1">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/30">
                    <Warehouse className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Multi-Warehouse Network
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed mb-4">
                    Distribute inventory across multiple warehouses and serve customers from the
                    nearest fulfillment centre. Real-time sync across all locations.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["Delhi NCR", "Mumbai", "Bangalore", "Chennai"].map((city) => (
                      <span
                        key={city}
                        className="text-xs rounded-full bg-amber-50 border border-amber-100 text-amber-700 px-2.5 py-1 font-medium"
                      >
                        {city}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2 justify-center min-w-[130px]">
                  {[
                    { name: "Delhi NCR", pct: 87 },
                    { name: "Mumbai", pct: 64 },
                    { name: "Bangalore", pct: 92 },
                  ].map(({ name, pct }) => (
                    <div
                      key={name}
                      className="rounded-xl bg-gray-50 border border-gray-100 p-3"
                    >
                      <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                        <span>{name}</span>
                        <span className="text-amber-600 font-medium">{pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {}
            <motion.div
              variants={fadeUp}
              whileHover={{ y: -4 }}
              className="md:col-span-2 group bg-white rounded-2xl border border-gray-100 p-6 hover:border-orange-200 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300 shadow-sm flex flex-col"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-500/30">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-Time Reservations</h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-4 flex-1">
                Atomic stock reservation with built-in countdowns. Never oversell, never
                disappoint a customer.
              </p>
              <div className="rounded-xl bg-gradient-to-br from-orange-50 to-red-50 border border-orange-100 p-4 text-center">
                <div className="text-xs text-orange-500 font-medium mb-1">Reserved for</div>
                <div className="text-3xl font-bold text-orange-600 font-mono tracking-wide animate-tick">
                  09:47
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-orange-100 overflow-hidden">
                  <div className="h-full w-[97%] rounded-full bg-gradient-to-r from-orange-400 to-red-400" />
                </div>
              </div>
            </motion.div>

            {}
            {[
              {
                icon: Zap,
                gradient: "from-sky-500 to-cyan-500",
                shadow: "shadow-sky-500/25",
                hover: "hover:border-sky-200 hover:shadow-sky-500/10",
                title: "Instant Fulfillment",
                desc: "End-to-end from reservation to delivery. Automated workflows that scale with your volume.",
              },
              {
                icon: Shield,
                gradient: "from-emerald-500 to-teal-500",
                shadow: "shadow-emerald-500/25",
                hover: "hover:border-emerald-200 hover:shadow-emerald-500/10",
                title: "Idempotent APIs",
                desc: "Duplicate-safe with idempotency keys. Inventory stays safe even under network failures.",
              },
              {
                icon: Globe,
                gradient: "from-rose-500 to-pink-500",
                shadow: "shadow-rose-500/25",
                hover: "hover:border-rose-200 hover:shadow-rose-500/10",
                title: "Razorpay Integrated",
                desc: "Built-in payment processing with signature verification. Reservations confirm on payment.",
              },
            ].map(({ icon: Icon, gradient, shadow, hover, title, desc }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                className={`md:col-span-2 group bg-white rounded-2xl border border-gray-100 p-6 ${hover} hover:shadow-xl transition-all duration-300 shadow-sm`}
              >
                <div
                  className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-lg ${shadow}`}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
              </motion.div>
            ))}

            {}
            <motion.div
              variants={fadeUp}
              whileHover={{ y: -4 }}
              className="md:col-span-6 group bg-white rounded-2xl border border-gray-100 p-6 hover:border-violet-200 hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-300 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="flex-shrink-0">
                  <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Live Analytics</h3>
                  <p className="text-sm text-gray-400 max-w-xs">
                    Real-time inventory dashboards, reservation metrics, and fulfillment rate
                    tracking per warehouse.
                  </p>
                </div>
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Fulfilment Rate", value: "98.4%", bar: 98 },
                    { label: "Avg. Reserve Time", value: "1.2s", bar: 85 },
                    { label: "Payment Success", value: "96.7%", bar: 97 },
                    { label: "Return Rate", value: "2.1%", bar: 21 },
                  ].map(({ label, value, bar }) => (
                    <div key={label} className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                      <div className="text-xs text-gray-400 mb-1">{label}</div>
                      <div className="text-lg font-bold text-gray-900 mb-2">{value}</div>
                      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-violet-400 to-purple-500"
                          style={{ width: `${bar}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {}
      <section className="py-24 bg-[#09090b] relative overflow-hidden">
        {}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />
        {}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[700px] rounded-full bg-amber-500/8 blur-[100px] pointer-events-none" />
        {}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="mx-auto max-w-4xl px-6 relative">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-sm text-amber-400 mb-4"
            >
              How It Works
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl font-bold text-white mb-3">
              Five steps to fulfilment
            </motion.h2>
            <motion.p variants={fadeUp} className="text-gray-500">
              From browsing to delivery — seamlessly.
            </motion.p>
          </motion.div>

          {}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="relative"
          >
            {steps.map((item, i) => (
              <motion.div
                key={item.step}
                variants={fadeUp}
                custom={i}
                className="relative flex gap-5 mb-8 last:mb-0 group"
              >
                {}
                {i < steps.length - 1 && (
                  <div className="absolute left-5.5 top-12 bottom-[-2rem] w-px bg-gradient-to-b from-amber-500/40 via-amber-500/20 to-transparent" />
                )}
                {}
                <div className="relative z-10 flex-shrink-0 flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 group-hover:bg-amber-500/20 group-hover:border-amber-500/50 transition-all duration-300">
                  <span className="text-xs font-bold gradient-text">{item.step}</span>
                </div>
                {}
                <div className="flex-1 pt-2">
                  <h3 className="text-base font-semibold text-white mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="text-center mb-16">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-sm text-amber-700 mb-4">
                Testimonials
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Trusted by logistics teams
              </h2>
              <p className="text-gray-500">
                See what operations leaders say about Bharat Bazaar.
              </p>
            </motion.div>

            <motion.div
              variants={stagger}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {testimonials.map((t) => (
                <motion.div
                  key={t.author}
                  variants={fadeUp}
                  whileHover={{ y: -6 }}
                  className="relative bg-white rounded-2xl border border-gray-100 p-6 hover:border-amber-200 hover:shadow-2xl hover:shadow-amber-500/8 transition-all duration-300 shadow-sm overflow-hidden group"
                >
                  {}
                  <div className={`absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r ${t.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <blockquote className="text-sm text-gray-600 leading-relaxed mb-5">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <div className="flex items-center gap-3 mt-auto">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${t.gradient} text-sm font-semibold text-white shadow-md`}
                    >
                      {t.avatar}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-800">{t.author}</div>
                      <div className="text-xs text-gray-400">{t.role}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {}
      <section className="py-28 relative overflow-hidden bg-[#09090b]">
        {}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[700px] rounded-full bg-amber-500/20 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 h-[300px] w-[500px] rounded-full bg-orange-600/10 blur-[100px] pointer-events-none" />
        {}
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="mx-auto max-w-3xl px-6 text-center relative">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-sm text-amber-400 mb-6"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Start free today
            </motion.div>

            <motion.h2
              variants={fadeUp}
              className="text-5xl lg:text-6xl font-bold text-white mb-5 leading-tight"
            >
              Ready to{" "}
              <span className="gradient-text">revolutionise</span>
              <br />
              your fulfilment?
            </motion.h2>

            <motion.p variants={fadeUp} className="text-gray-400 mb-10 text-lg leading-relaxed">
              Join hundreds of ecommerce teams that use Bharat Bazaar to ship faster, smarter,
              and with zero oversells.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button size="xl" asChild className="group shadow-2xl shadow-amber-500/30">
                <Link href="/auth/register">
                  Start for Free
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Link
                href="/auth/login"
                className="h-14 px-8 inline-flex items-center justify-center gap-2 rounded-2xl text-lg font-medium border border-white/15 bg-white/5 text-white hover:bg-white/10 hover:border-white/25 backdrop-blur-sm transition-all duration-200"
              >
                Sign in instead
              </Link>
            </motion.div>

            {}
            <motion.div
              variants={fadeUp}
              className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600"
            >
              {[
                { icon: Lock, text: "SOC 2 compliant" },
                { icon: Shield, text: "99.9% uptime SLA" },
                { icon: Users, text: "500+ teams" },
                { icon: Package, text: "∞ warehouse capacity" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5 text-gray-500" />
                  {text}
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {}
      <footer className="border-t border-white/[0.06] py-10 bg-[#09090b]">
        <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-500">
              <Boxes className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold gradient-text">Bharat Bazaar</span>
          </div>
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} Bharat Bazaar. All rights reserved.
          </p>
          <div className="flex items-center gap-5 text-xs text-gray-600">
            {["Privacy", "Terms", "Status"].map((l) => (
              <span
                key={l}
                className="hover:text-gray-400 cursor-pointer transition-colors duration-200"
              >
                {l}
              </span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
