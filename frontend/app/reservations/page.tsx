"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  CreditCard,
  Package2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { useReservations } from "@/hooks/use-reservations";
import { PageWrapper, staggerContainer, fadeUp } from "@/components/layout/page-wrapper";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { useCountdown } from "@/hooks/use-countdown";
import { cn } from "@/lib/utils";
import type { ReservationListItem, PaymentStatus, ReservationStatus } from "@/types";

const paymentStatusConfig: Record<
  PaymentStatus,
  { label: string; variant: "success" | "warning" | "destructive" | "secondary"; icon: React.ElementType }
> = {
  PAID: { label: "Paid", variant: "success", icon: CheckCircle2 },
  PENDING: { label: "Awaiting Payment", variant: "warning", icon: Clock },
  FAILED: { label: "Payment Failed", variant: "destructive", icon: XCircle },
  REFUNDED: { label: "Refunded", variant: "secondary", icon: RotateCcw },
};

const reservationStatusConfig: Record<
  ReservationStatus,
  { label: string; variant: "success" | "warning" | "destructive" | "default" | "secondary" }
> = {
  PENDING: { label: "Pending", variant: "warning" },
  CONFIRMED: { label: "Confirmed", variant: "success" },
  RELEASED: { label: "Cancelled", variant: "destructive" },
  EXPIRED: { label: "Expired", variant: "secondary" },
};

function ReservationCard({ reservation, index }: { reservation: ReservationListItem; index: number }) {
  const router = useRouter();
  const isExpired = new Date(reservation.expiresAt) <= new Date();
  const isActive = reservation.status === "PENDING" && !isExpired;
  const isConfirmed = reservation.status === "CONFIRMED";
  const isCancelled = reservation.status === "RELEASED" || reservation.status === "EXPIRED" || isExpired;

  const { seconds } = useCountdown(reservation.status === "PENDING" ? reservation.expiresAt : undefined);

  const totalAmount = parseFloat(reservation.product.price) * reservation.quantity;
  const payStatus = reservation.paymentStatus;
  const paymentCfg = paymentStatusConfig[payStatus];
  const resCfg = reservationStatusConfig[reservation.status];

  
  function getPaymentHistoryMessage(): string {
    if (isConfirmed) return "Payment completed successfully.";
    if (reservation.payment?.status === "PAID") return "Payment recorded.";
    if (reservation.payment?.status === "FAILED") return "Previous payment attempt failed. You can retry.";
    if (reservation.payment?.status === "PENDING" && isActive) return "Payment initiated — continue to complete.";
    if (reservation.payment?.status === "PENDING" && isCancelled) return "Payment was not completed before expiry.";
    if (!reservation.payment && isActive) return "No payment initiated yet. Click to pay.";
    if (!reservation.payment && isCancelled) return "Order expired before payment.";
    return "";
  }

  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      className={cn(
        "bg-white rounded-2xl border shadow-sm overflow-hidden transition-all",
        isActive
          ? "border-amber-300 shadow-amber-500/10"
          : isConfirmed
          ? "border-emerald-200"
          : "border-gray-100"
      )}
    >
      {}
      {isActive && (
        <div className="h-1 w-full bg-gradient-to-r from-amber-400 to-orange-400" />
      )}

      <div className="p-5">
        {}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
          <div className="flex items-start gap-3">
            {}
            <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-gray-50 border border-gray-100">
              <img
                src={
                  reservation.product.image ||
                  `https://picsum.photos/seed/${reservation.product.id}/100`
                }
                alt={reservation.product.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 truncate">{reservation.product.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {reservation.warehouse.name} · {reservation.warehouse.city}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge variant={resCfg.variant} dot>
                  {resCfg.label}
                </Badge>
                <Badge variant={paymentCfg.variant}>
                  <paymentCfg.icon className="h-3 w-3" />
                  {paymentCfg.label}
                </Badge>
              </div>
            </div>
          </div>

          {}
          <div className="text-right flex-shrink-0">
            <p className="text-lg font-bold gradient-text">{formatPrice(totalAmount)}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {reservation.quantity} × {formatPrice(reservation.product.price)}
            </p>
          </div>
        </div>

        {}
        <div
          className={cn(
            "flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm mb-4",
            isActive
              ? "bg-amber-50 border border-amber-100 text-amber-800"
              : isConfirmed
              ? "bg-emerald-50 border border-emerald-100 text-emerald-700"
              : "bg-gray-50 border border-gray-100 text-gray-500"
          )}
        >
          {isActive ? (
            <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5 text-amber-500" />
          ) : isConfirmed ? (
            <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5 text-emerald-500" />
          ) : (
            <XCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-gray-400" />
          )}
          <span>{getPaymentHistoryMessage()}</span>
        </div>

        {}
        <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
          <span>
            Created: <span className="text-gray-600">{formatDateTime(reservation.createdAt)}</span>
          </span>
          {isActive ? (
            <span
              className={cn(
                "font-mono font-semibold",
                seconds <= 120
                  ? "text-red-500"
                  : seconds <= 300
                  ? "text-amber-600"
                  : "text-gray-600"
              )}
            >
              Expires in{" "}
              {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
            </span>
          ) : (
            <span>
              Expired: <span className="text-gray-600">{formatDateTime(reservation.expiresAt)}</span>
            </span>
          )}
        </div>

        {}
        {reservation.payment && (
          <div className="border-t border-gray-100 pt-3 mb-4">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Payment Record</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <span className="text-gray-400">Razorpay Order</span>
              <span className="font-mono text-gray-600 truncate">
                {reservation.payment.razorpayOrderId.slice(-12)}
              </span>
              <span className="text-gray-400">Amount</span>
              <span className="text-gray-600">{formatPrice(reservation.payment.amount)}</span>
              <span className="text-gray-400">Status</span>
              <span
                className={cn(
                  "font-medium",
                  reservation.payment.status === "PAID"
                    ? "text-emerald-600"
                    : reservation.payment.status === "FAILED"
                    ? "text-red-500"
                    : "text-amber-600"
                )}
              >
                {reservation.payment.status}
              </span>
              {reservation.payment.razorpayPaymentId && (
                <>
                  <span className="text-gray-400">Payment ID</span>
                  <span className="font-mono text-gray-600 truncate">
                    {reservation.payment.razorpayPaymentId.slice(-12)}
                  </span>
                </>
              )}
              <span className="text-gray-400">Initiated</span>
              <span className="text-gray-600">{formatDateTime(reservation.payment.createdAt)}</span>
            </div>
          </div>
        )}

        {}
        <div className="flex gap-2">
          {isActive && (
            <Button
              size="sm"
              className="flex-1"
              onClick={() => router.push(`/reservations/${reservation.id}`)}
              leftIcon={<ShieldCheck className="h-4 w-4" />}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Continue to Pay · {formatPrice(totalAmount)}
            </Button>
          )}

          {isConfirmed && (
            <Button
              size="sm"
              variant="success"
              className="flex-1"
              onClick={() => router.push("/orders")}
              leftIcon={<CheckCircle2 className="h-4 w-4" />}
            >
              View Order
            </Button>
          )}

          {isCancelled && !isConfirmed && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => router.push("/products")}
              leftIcon={<Package2 className="h-4 w-4" />}
            >
              Browse Products
            </Button>
          )}

          {}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => router.push(`/reservations/${reservation.id}`)}
          >
            Details
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function ReservationSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3 shadow-sm">
      <div className="flex gap-3">
        <Skeleton className="h-14 w-14 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-6 w-20" />
      </div>
      <Skeleton className="h-12 rounded-xl" />
      <Skeleton className="h-8 w-full rounded-xl" />
    </div>
  );
}

export default function ReservationsPage() {
  const { data: reservations = [], isLoading, error } = useReservations();

  const active = reservations.filter(
    (r) => r.status === "PENDING" && new Date(r.expiresAt) > new Date()
  );
  const history = reservations.filter(
    (r) => !(r.status === "PENDING" && new Date(r.expiresAt) > new Date())
  );

  return (
    <PageWrapper maxWidth="2xl">
      {}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-700 mb-4">
          <Wallet className="h-3.5 w-3.5" />
          Payment Centre
        </div>
        <h1 className="text-4xl font-bold gradient-text mb-2">Reservations & Payments</h1>
        <p className="text-gray-500">
          View your payment history, track reservation status, and resume any pending payments.
        </p>
      </motion.div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <ReservationSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <EmptyState
          icon={CreditCard}
          title="Failed to load reservations"
          description="We couldn't fetch your reservation history. Please try again."
          action={
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
          }
        />
      ) : reservations.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No reservations yet"
          description="Once you reserve a product and start a payment, it will appear here."
          action={
            <Button asChild>
              <Link href="/warehouses">Start Shopping</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-8">
          {}
          {active.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Awaiting Payment ({active.length})
                </h2>
              </div>
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="space-y-4"
              >
                {active.map((r, i) => (
                  <ReservationCard key={r.id} reservation={r} index={i} />
                ))}
              </motion.div>
            </section>
          )}

          {}
          {history.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-4 w-4 text-gray-400" />
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Payment History ({history.length})
                </h2>
              </div>
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="space-y-4"
              >
                {history.map((r, i) => (
                  <ReservationCard key={r.id} reservation={r} index={i} />
                ))}
              </motion.div>
            </section>
          )}
        </div>
      )}
    </PageWrapper>
  );
}
