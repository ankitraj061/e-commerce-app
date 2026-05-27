"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Package2, MapPin, Warehouse, CreditCard, X, CheckCircle2, ArrowLeft, Loader2, ShieldCheck,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { reservationService } from "@/services/reservation.service";
import { useReleaseReservation } from "@/hooks/use-reservations";
import { paymentService } from "@/services/payment.service";
import { useAuthStore } from "@/store/auth.store";
import { useReservationStore } from "@/store/reservation.store";
import { extractErrorMessage } from "@/services/api";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { useCountdown } from "@/hooks/use-countdown";
import { PageWrapper, fadeUp } from "@/components/layout/page-wrapper";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CountdownTimer } from "@/components/features/countdown-timer";
import type { RazorpayOptions, RazorpayPaymentResponse } from "@/types";

declare global {
  interface Window {
    Razorpay: new (opts: RazorpayOptions) => {
      open: () => void;
      on: (event: string, cb: () => void) => void;
    };
  }
}

// Module-level singleton — prevents duplicate <script> tags if called
// concurrently (e.g. while still loading, or after a component remount).
let _razorpayScriptPromise: Promise<void> | null = null;

function loadRazorpayScript(): Promise<void> {
  if (typeof window.Razorpay !== "undefined") return Promise.resolve();
  if (_razorpayScriptPromise) return _razorpayScriptPromise;

  _razorpayScriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = (err) => {
      _razorpayScriptPromise = null; // Allow retry after a network error
      reject(err);
    };
    document.head.appendChild(script);
  });

  return _razorpayScriptPromise;
}

export default function ReservationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuthStore();
  const { setActiveReservation } = useReservationStore();
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const { mutateAsync: releaseReservation, isPending: releasing } = useReleaseReservation();

  const { data: reservation, isLoading, error, refetch } = useQuery({
    queryKey: ["reservation", id],
    queryFn: () => reservationService.getById(id),
    refetchInterval: 30_000, // refresh every 30s to sync status
  });

  const { seconds, isExpired } = useCountdown(reservation?.expiresAt);

  // Expire handling — UI countdown/badge already shows the expired state; no toast needed

  const handlePay = async () => {
    if (!reservation) return;
    setPaymentLoading(true);
    try {
      await loadRazorpayScript();
      const order = await paymentService.createOrder({ reservationId: reservation.id });

      const opts: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "",
        amount: order.amount,
        currency: order.currency,
        name: "Bharat Bazaar",
        description: `${reservation.product.name} × ${reservation.quantity}`,
        order_id: order.id,
        prefill: { name: user?.name, email: user?.email },
        theme: { color: "#f59e0b" },
        handler: async (response: RazorpayPaymentResponse) => {
          try {
            const idempotencyKey = `confirm-${reservation.id}-${response.razorpay_payment_id}`;
            await reservationService.confirm(
              reservation.id,
              {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              },
              idempotencyKey
            );
            setActiveReservation(null);
            toast.success("🎉 Payment successful! Order confirmed.");
            router.push("/orders?success=true");
          } catch (err) {
            // Razorpay modal has already closed here — reset loading so the
            // Pay button becomes clickable again for a retry.
            setPaymentLoading(false);
            toast.error(extractErrorMessage(err));
            refetch();
          }
        },
        modal: {
          ondismiss: () => {
            setPaymentLoading(false);
            toast("Payment paused — your order is saved.", {
              description: "You can resume from the Payments page anytime before expiry.",
              action: {
                label: "View Payments",
                onClick: () => router.push("/reservations"),
              },
              duration: 8000,
            });
          },
        },
      };

      const rzp = new window.Razorpay(opts);
      rzp.open();
    } catch (err) {
      toast.error(extractErrorMessage(err));
      setPaymentLoading(false);
    } finally {
      // Don't reset loading — the payment modal handles it via ondismiss
    }
  };

  const handleRelease = () => setShowCancelDialog(true);

  const handleConfirmRelease = async () => {
    try {
      await releaseReservation(id);
      setActiveReservation(null);
      setShowCancelDialog(false);
      toast.success("Order cancelled. Stock returned.");
      router.push("/products");
    } catch (err) {
      toast.error(extractErrorMessage(err));
      setShowCancelDialog(false);
    }
  };

  if (isLoading) {
    return (
      <PageWrapper maxWidth="2xl">
        <div className="space-y-6">
          <Skeleton className="h-10 w-1/2" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (error || !reservation) {
    return (
      <PageWrapper maxWidth="2xl">
        <div className="text-center py-20">
          <p className="text-gray-400 mb-4">Reservation not found or access denied.</p>
          <Button onClick={() => router.push("/products")}>Browse Products</Button>
        </div>
      </PageWrapper>
    );
  }

  const totalPrice = parseFloat(reservation.product.price) * reservation.quantity;
  const isActive = reservation.status === "PENDING" && !isExpired;
  const isConfirmed = reservation.status === "CONFIRMED";
  const isExpiredOrReleased = reservation.status === "EXPIRED" || reservation.status === "RELEASED" || isExpired;

  return (
    <PageWrapper maxWidth="2xl">
      <ConfirmDialog
        open={showCancelDialog}
        title="Cancel this order?"
        description="Stock will be returned immediately. This action cannot be undone."
        confirmLabel="Yes, cancel order"
        cancelLabel="Keep order"
        variant="destructive"
        loading={releasing}
        onConfirm={handleConfirmRelease}
        onCancel={() => setShowCancelDialog(false)}
      />

      {/* Back */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => {
          // If reservation is still active, remind user they can return
          if (isActive) {
            toast("Order saved — complete payment anytime before expiry.", {
              description: "Find it under Payments in the nav.",
              action: {
                label: "View Payments",
                onClick: () => router.push("/reservations"),
              },
              duration: 6000,
            });
          }
          router.back();
        }}
        className="mb-8 flex items-center gap-1.5 text-sm text-gray-400 hover:text-amber-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </motion.button>

      {/* Confirmed banner */}
      <AnimatePresence>
        {isConfirmed && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 px-5 py-4"
          >
            <CheckCircle2 className="h-6 w-6 text-emerald-500 flex-shrink-0" />
            <div>
              <p className="font-semibold text-emerald-700">Payment Confirmed!</p>
              <p className="text-sm text-emerald-600/80">Your order has been placed successfully.</p>
            </div>
            <Button size="sm" variant="success" className="ml-auto" onClick={() => router.push("/orders")}>
              View Orders
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.h1
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="text-3xl font-bold text-gray-900 mb-1"
      >
        Checkout
      </motion.h1>
      <p className="text-gray-400 mb-10 text-sm">
        Order <span className="font-mono text-gray-600">{reservation.id.slice(0, 8)}…</span>
        {" · "}
        Created {formatDateTime(reservation.createdAt)}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ── Left: countdown + details ─────────────────────────────────────── */}
        <div className="lg:col-span-3 space-y-5">
          {/* Countdown */}
          {!isConfirmed && (
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={1}
              className={`bg-white rounded-2xl border p-6 flex flex-col items-center gap-1 shadow-sm ${
                isExpiredOrReleased
                  ? "border-red-200"
                  : seconds <= 120
                  ? "border-red-300 shadow-lg shadow-red-500/10"
                  : seconds <= 300
                  ? "border-amber-200"
                  : "border-gray-100"
              }`}
            >
              <CountdownTimer expiresAt={reservation.expiresAt} totalSeconds={600} />
              {isExpiredOrReleased && (
                <p className="text-sm text-gray-400 mt-2">
                  This order has {reservation.status === "RELEASED" ? "been cancelled" : "expired"}.
                </p>
              )}
            </motion.div>
          )}

          {/* Product summary */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={2}
            className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
          >
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-4">Item Ordered</p>
            <div className="flex gap-4">
              <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-gray-50 border border-gray-100">
                <img
                  src={reservation.product.image || `https://picsum.photos/seed/${reservation.product.id}/160`}
                  alt={reservation.product.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{reservation.product.name}</h3>
                <p className="text-sm text-gray-400 mt-1 line-clamp-2 leading-relaxed">{reservation.product.description}</p>
                <div className="flex items-center gap-3 mt-3">
                  <Badge variant="secondary">Qty: {reservation.quantity}</Badge>
                  <span className="text-sm text-gray-500">{formatPrice(reservation.product.price)} each</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Warehouse & Address */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={3}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {/* Warehouse */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Warehouse className="h-4 w-4 text-amber-500" />
                <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">Fulfillment Centre</p>
              </div>
              <p className="font-semibold text-gray-800">{reservation.warehouse.name}</p>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                {reservation.warehouse.city}, {reservation.warehouse.state}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{reservation.warehouse.pincode}</p>
            </div>

            {/* Delivery address */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="h-4 w-4 text-amber-500" />
                <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">Delivering To</p>
              </div>
              <p className="font-semibold text-gray-800">{reservation.deliveryAddress.fullName}</p>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">{reservation.deliveryAddress.street}</p>
              <p className="text-sm text-gray-500">{reservation.deliveryAddress.city}, {reservation.deliveryAddress.state}</p>
              <p className="text-xs text-gray-400 mt-0.5">{reservation.deliveryAddress.phone}</p>
            </div>
          </motion.div>
        </div>

        {/* ── Right: order summary + payment ───────────────────────────────── */}
        <div className="lg:col-span-2">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={4}
            className="sticky top-24 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-0"
          >
            <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-5">
              <CreditCard className="h-5 w-5 text-amber-500" />
              Order Summary
            </h2>

            {/* Line items */}
            <div className="divide-y divide-gray-50 text-sm mb-5">
              <div className="flex justify-between text-gray-500 py-2.5">
                <span className="truncate pr-4">{reservation.product.name} × {reservation.quantity}</span>
                <span className="text-gray-800 font-medium whitespace-nowrap">{formatPrice(parseFloat(reservation.product.price) * reservation.quantity)}</span>
              </div>
              <div className="flex justify-between text-gray-500 py-2.5">
                <span>Delivery</span>
                <span className="text-emerald-600 font-medium">Free</span>
              </div>
              <div className="flex justify-between text-gray-500 py-2.5">
                <span>Taxes</span>
                <span className="text-gray-800 font-medium">Included</span>
              </div>
            </div>

            <div className="border-t-2 border-gray-100 pt-4 mb-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-2xl font-bold gradient-text">{formatPrice(totalPrice)}</span>
              </div>
            </div>

            {/* Status badge */}
            <div className="flex justify-between items-center text-sm mb-5 pb-5 border-b border-gray-100">
              <span className="text-gray-400">Status</span>
              <Badge
                variant={
                  isConfirmed ? "success"
                  : isExpiredOrReleased ? "destructive"
                  : seconds <= 120 ? "destructive"
                  : seconds <= 300 ? "warning"
                  : "default"
                }
                dot
              >
                {isConfirmed ? "Confirmed"
                  : reservation.status === "RELEASED" ? "Released"
                  : isExpired ? "Expired"
                  : seconds <= 120 ? "Expiring soon!"
                  : "Active"}
              </Badge>
            </div>

            {/* Actions */}
            {isActive && (
              <div className="space-y-3">
                <Button
                  size="lg"
                  loading={paymentLoading}
                  className="w-full"
                  onClick={handlePay}
                  leftIcon={!paymentLoading ? <ShieldCheck className="h-5 w-5" /> : undefined}
                >
                  {paymentLoading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Opening payment…</>
                  ) : (
                    `Pay ${formatPrice(totalPrice)}`
                  )}
                </Button>
                <Button
                  size="md"
                  variant="ghost"
                  loading={releasing}
                  className="w-full text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={handleRelease}
                  leftIcon={!releasing ? <X className="h-4 w-4" /> : undefined}
                >
                  {releasing ? "Cancelling…" : "Cancel Order"}
                </Button>
              </div>
            )}

            {isConfirmed && (
              <Button size="lg" variant="success" className="w-full" onClick={() => router.push("/orders")}>
                <CheckCircle2 className="h-5 w-5" /> View My Orders
              </Button>
            )}

            {isExpiredOrReleased && !isConfirmed && (
              <Button size="lg" variant="outline" className="w-full" onClick={() => router.push("/products")}>
                <Package2 className="h-5 w-5" /> Browse Products Again
              </Button>
            )}

            {/* Trust badges */}
            <div className="mt-5 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-center gap-3 text-xs text-gray-400 flex-wrap">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" /> Secure
                </span>
                <span>·</span>
                <span>256-bit encrypted</span>
                <span>·</span>
                <span>Razorpay</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
}
