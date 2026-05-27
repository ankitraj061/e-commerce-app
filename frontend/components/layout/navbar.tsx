"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  Package2,
  Warehouse,
  ShoppingBag,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Boxes,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";
import { useWarehouseStore } from "@/store/warehouse.store";
import { useActivePendingReservations } from "@/hooks/use-reservations";
import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { initials, cn } from "@/lib/utils";

const navLinks = [
  { href: "/warehouses", label: "Warehouses", icon: Warehouse },
  { href: "/products", label: "Products", icon: Package2 },
  { href: "/reservations", label: "Payments", icon: CreditCard },
  { href: "/orders", label: "My Orders", icon: ShoppingBag },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const { selectedWarehouse } = useWarehouseStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Don't show navbar on auth pages or landing
  const isAuthPage = pathname.startsWith("/auth");
  const isLanding = pathname === "/";

  // Pending payment indicator — only fetch when authenticated
  const { active: pendingReservations } = useActivePendingReservations({ enabled: isAuthenticated });
  const hasPendingPayment = isAuthenticated && pendingReservations.length > 0;

  if (isLanding || isAuthPage) return null;

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await authService.logout();
    } finally {
      clearAuth();
      setLoggingOut(false);
      router.push("/");
      toast.success("Logged out successfully");
    }
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white shadow-sm"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href={isAuthenticated ? "/warehouses" : "/"} className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500">
              <Boxes className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text">Bharat Bazaar</span>
          </Link>

          {/* Desktop nav */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ href, label, icon: Icon }) => {
                const active = pathname.startsWith(href);
                const showPendingDot = href === "/reservations" && hasPendingPayment;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                      active
                        ? "text-amber-600"
                        : "text-gray-500 hover:text-gray-900 hover:bg-amber-50"
                    )}
                  >
                    <span className="relative">
                      <Icon className="h-4 w-4" />
                      {showPendingDot && (
                        <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500 border border-white animate-pulse" />
                      )}
                    </span>
                    {label}
                    {showPendingDot && (
                      <span className="ml-0.5 h-1.5 w-1.5 rounded-full bg-red-500" />
                    )}
                    {active && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute inset-0 rounded-xl bg-amber-500/10 border border-amber-500/20"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Warehouse indicator */}
                {selectedWarehouse && (
                  <Link href="/warehouses">
                    <Badge variant="secondary" className="hidden sm:flex items-center gap-1.5 cursor-pointer hover:border-amber-500/30 transition-colors">
                      <Warehouse className="h-3 w-3" />
                      {selectedWarehouse.city}
                    </Badge>
                  </Link>
                )}

                {/* Profile dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 rounded-xl px-2.5 py-1.5 hover:bg-amber-50 transition-colors"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 text-xs font-semibold text-white">
                      {initials(user?.name ?? "U")}
                    </div>
                    <span className="hidden sm:block text-sm text-gray-700">{user?.name?.split(" ")[0]}</span>
                    <ChevronDown className={cn("h-3.5 w-3.5 text-gray-400 transition-transform", profileOpen && "rotate-180")} />
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.96 }}
                        className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl border border-gray-100 shadow-xl py-1.5 z-50"
                        onMouseLeave={() => setProfileOpen(false)}
                      >
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                          <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                        </div>
                        <Link
                          href="/profile"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                          onClick={() => setProfileOpen(false)}
                        >
                          <User className="h-4 w-4" /> Profile
                        </Link>
                        <button
                          onClick={handleLogout}
                          disabled={loggingOut}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          {loggingOut ? "Logging out…" : "Log Out"}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Mobile menu toggle */}
                <button
                  className="md:hidden rounded-xl p-2 text-gray-500 hover:text-gray-900 hover:bg-amber-50 transition-colors"
                  onClick={() => setMenuOpen(!menuOpen)}
                >
                  {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </>
            ) : (
              !isAuthPage && (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/auth/login">Log In</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href="/auth/register">Get Started</Link>
                  </Button>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && isAuthenticated && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-gray-100 md:hidden bg-white"
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map(({ href, label, icon: Icon }) => {
                const showPendingDot = href === "/reservations" && hasPendingPayment;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                      pathname.startsWith(href)
                        ? "bg-amber-500/10 text-amber-700"
                        : "text-gray-500 hover:text-gray-900 hover:bg-amber-50"
                    )}
                  >
                    <span className="relative">
                      <Icon className="h-4 w-4" />
                      {showPendingDot && (
                        <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500 border border-white animate-pulse" />
                      )}
                    </span>
                    {label}
                    {showPendingDot && (
                      <span className="ml-auto text-xs font-medium text-red-500 bg-red-50 border border-red-200 rounded-full px-2 py-0.5">
                        {pendingReservations.length} pending
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
