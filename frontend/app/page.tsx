"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeUpCustom as fadeUp, staggerContainer as stagger } from "@/lib/animations";

const features = [
  {
    icon: Warehouse,
    title: "Multi-Warehouse Network",
    description: "Distribute inventory across multiple warehouses and serve customers from the nearest fulfillment centre.",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: Clock,
    title: "Real-Time Reservations",
    description: "Atomic stock reservation with built-in countdowns. Never oversell, never disappoint a customer.",
    gradient: "from-orange-500 to-red-500",
  },
  {
    icon: Zap,
    title: "Instant Fulfillment",
    description: "End-to-end fulfillment from reservation to delivery. Automated workflows that scale with your volume.",
    gradient: "from-sky-500 to-cyan-600",
  },
  {
    icon: Shield,
    title: "Idempotent Operations",
    description: "Duplicate-safe APIs with idempotency keys. Your inventory is safe even under network failures.",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    icon: BarChart3,
    title: "Live Analytics",
    description: "Real-time inventory dashboards, reservation metrics, and fulfillment rate tracking per warehouse.",
    gradient: "from-amber-500 to-yellow-500",
  },
  {
    icon: Globe,
    title: "Razorpay Integrated",
    description: "Built-in payment processing with signature verification. Reservations confirm on payment success.",
    gradient: "from-rose-500 to-pink-600",
  },
];

const stats = [
  { value: "99.9%", label: "Uptime SLA", icon: TrendingUp },
  { value: "<50ms", label: "Reservation latency", icon: Zap },
  { value: "Zero", label: "Oversells guaranteed", icon: Shield },
  { value: "∞", label: "Warehouse capacity", icon: Package },
];

const testimonials = [
  {
    quote: "Bharat Bazaar cut our oversell incidents to zero. The atomic reservation system is rock-solid.",
    author: "Priya Sharma",
    role: "Head of Logistics, Nykaa",
    avatar: "PS",
  },
  {
    quote: "We manage 12 warehouses from one dashboard. The UI is incredibly polished and our ops team loves it.",
    author: "Rohit Malhotra",
    role: "CTO, Meesho Supply Chain",
    avatar: "RM",
  },
  {
    quote: "The countdown reservation flow drives urgency and our conversion rate jumped 23% in the first month.",
    author: "Ananya Iyer",
    role: "Product Manager, Flipkart Ads",
    avatar: "AI",
  },
];

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="relative overflow-x-hidden bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 lg:px-12 h-16 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500">
            <Boxes className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold gradient-text">Bharat Bazaar</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/auth/login">Log In</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/auth/register">Get Started <ArrowRight className="h-3.5 w-3.5" /></Link>
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section ref={heroRef} className="relative flex min-h-screen items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div style={{ y: heroY }} className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-amber-400/20 blur-[120px] animate-float-glow" />
          <motion.div style={{ y: heroY }} className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-orange-400/15 blur-[100px] animate-float-glow" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-amber-300/10 blur-[120px]" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.5) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        </div>

        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 mx-auto max-w-5xl px-4 text-center">
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0} className="mt-8 mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-sm text-amber-700">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            Multi-Warehouse Inventory Platform
          </motion.div>
          <motion.h1 variants={fadeUp} initial="hidden" animate="show" custom={1} className="mb-6 text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.08] tracking-tight text-gray-900">
            Reserve Stock.{" "}<span className="gradient-text">Fulfil Orders.</span><br />At Scale.
          </motion.h1>
          <motion.p variants={fadeUp} initial="hidden" animate="show" custom={2} className="mb-10 mx-auto max-w-2xl text-lg sm:text-xl text-gray-500 leading-relaxed">
            Bharat Bazaar gives your team atomic inventory reservations, real-time countdowns, and seamless Razorpay payments — across every warehouse you operate.
          </motion.p>
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="xl" asChild className="group">
              <Link href="/auth/register">Start for Free <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" /></Link>
            </Button>
            <Button size="xl" variant="outline" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </motion.div>
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={4} className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
            {["No credit card required", "Free forever plan", "Setup in minutes"].map((t) => (
              <div key={t} className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" />{t}</div>
            ))}
          </motion.div>

          {/* Dashboard mockup */}
          <motion.div initial={{ opacity: 0, y: 60, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="mt-20 relative mx-auto max-w-4xl">
            <div className="relative rounded-2xl bg-white border border-gray-100 overflow-hidden shadow-2xl shadow-gray-200/80">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-amber-400" />
                <div className="h-3 w-3 rounded-full bg-emerald-400" />
                <div className="ml-4 flex-1 rounded-md bg-gray-100 h-6 flex items-center px-3">
                  <span className="text-xs text-gray-400">bharatbazaar.in/products</span>
                </div>
              </div>
              <div className="p-6 grid grid-cols-3 gap-4 bg-gray-50/50">
                {[{ label: "Total Reservations", value: "2,847", trend: "+12%" }, { label: "Active Orders", value: "186", trend: "+5%" }, { label: "Stock Utilisation", value: "73%", trend: "+8%" }].map((m) => (
                  <div key={m.label} className="rounded-xl bg-white p-4 border border-gray-100 shadow-sm">
                    <div className="text-xs text-gray-400 mb-1">{m.label}</div>
                    <div className="text-2xl font-bold text-gray-900">{m.value}</div>
                    <div className="text-xs text-emerald-600 mt-1">{m.trend} this week</div>
                  </div>
                ))}
                <div className="col-span-3 rounded-xl bg-white border border-gray-100 p-4 grid grid-cols-4 gap-3 shadow-sm">
                  {["Delhi NCR", "Mumbai", "Bangalore", "Chennai"].map((city) => (
                    <div key={city} className="rounded-lg bg-amber-50 p-3 text-center border border-amber-100">
                      <Warehouse className="h-5 w-5 text-amber-500 mx-auto mb-2" />
                      <div className="text-xs font-medium text-gray-700">{city}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">Active</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute -inset-4 rounded-3xl bg-amber-400/10 blur-3xl -z-10" />
          </motion.div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <motion.div key={stat.label} variants={fadeUp} className="relative bg-white rounded-2xl border border-gray-100 p-6 text-center hover:border-amber-300 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300 group shadow-sm">
                <div className="absolute inset-0 rounded-2xl bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <stat.icon className="h-6 w-6 text-amber-500 mx-auto mb-3" />
                <div className="text-4xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mb-16">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-sm text-amber-700 mb-4">Features</motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Everything you need to <span className="gradient-text">fulfil at scale</span></motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-gray-500 max-w-2xl mx-auto">Built for growing ecommerce teams who need reliability, speed, and beautiful tooling.</motion.p>
          </motion.div>
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <motion.div key={f.title} variants={fadeUp} whileHover={{ y: -4 }} className="group bg-white rounded-2xl border border-gray-100 p-6 hover:border-amber-300 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 shadow-sm">
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${f.gradient} shadow-lg`}>
                  <f.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 relative bg-gray-50">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-amber-400/10 blur-[120px]" />
        </div>
        <div className="mx-auto max-w-4xl px-6 relative">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-4xl font-bold text-gray-900 mb-4">How Bharat Bazaar Works</motion.h2>
            <motion.p variants={fadeUp} className="text-gray-500">From browsing to delivery in five seamless steps.</motion.p>
          </motion.div>
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="relative">
            <div className="absolute left-8 top-8 bottom-8 w-px bg-gradient-to-b from-amber-400/60 to-transparent hidden md:block" />
            {[
              { step: "01", title: "Select Your Warehouse", desc: "Browse warehouses near you and choose one based on delivery speed and stock availability." },
              { step: "02", title: "Discover Products", desc: "View real-time inventory from your selected warehouse. All stock levels are live and accurate." },
              { step: "03", title: "Reserve Instantly", desc: "Click Reserve to atomically hold your items. A countdown timer starts — you have 15 minutes." },
              { step: "04", title: "Pay with Razorpay", desc: "Complete payment via UPI, cards, or net banking. Signature verification keeps everything secure." },
              { step: "05", title: "Order Confirmed", desc: "Your reservation becomes an order. Track it live from our beautiful orders dashboard." },
            ].map((item, i) => (
              <motion.div key={item.step} variants={fadeUp} custom={i} className="relative flex gap-6 mb-8 last:mb-0">
                <div className="relative z-10 flex-shrink-0 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 border border-amber-100 text-xl font-bold gradient-text shadow-sm">{item.step}</div>
                <div className="flex-1 pt-3">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Trusted by logistics teams</h2>
              <p className="text-gray-500">See what operations leaders say about Bharat Bazaar.</p>
            </motion.div>
            <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <motion.div key={t.author} variants={fadeUp} whileHover={{ y: -4 }} className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-amber-200 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300 shadow-sm">
                  <div className="flex gap-0.5 mb-4">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />)}</div>
                  <blockquote className="text-sm text-gray-600 leading-relaxed mb-5">&ldquo;{t.quote}&rdquo;</blockquote>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-sm font-semibold text-white">{t.avatar}</div>
                    <div>
                      <div className="text-sm font-medium text-gray-800">{t.author}</div>
                      <div className="text-xs text-gray-400">{t.role}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative bg-gradient-to-b from-amber-50 to-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
          <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
        </div>
        <div className="mx-auto max-w-3xl px-6 text-center relative">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <motion.h2 variants={fadeUp} className="text-5xl font-bold text-gray-900 mb-4">Ready to <span className="gradient-text">revolutionise</span><br /> your fulfilment?</motion.h2>
            <motion.p variants={fadeUp} className="text-gray-500 mb-10 text-lg">Join hundreds of ecommerce teams that use Bharat Bazaar to ship faster, smarter, and with zero oversells.</motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="xl" asChild className="group">
                <Link href="/auth/register">Start for Free <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" /></Link>
              </Button>
              <Button size="xl" variant="outline" asChild>
                <Link href="/auth/login">Sign in instead</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-10 bg-white">
        <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-500">
              <Boxes className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold gradient-text">Bharat Bazaar</span>
          </div>
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} Bharat Bazaar. All rights reserved.</p>
          <div className="flex items-center gap-5 text-xs text-gray-400">
            {["Privacy", "Terms", "Status"].map((l) => <span key={l} className="hover:text-gray-600 cursor-pointer transition-colors">{l}</span>)}
          </div>
        </div>
      </footer>
    </div>
  );
}
