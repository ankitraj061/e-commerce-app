"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, Suspense } from "react";
import { toast } from "sonner";
import { ShoppingBag, ArrowRight, CheckCircle2, Package2, AlertTriangle, CreditCard } from "lucide-react";
import { useOrders } from "@/hooks/use-orders";
import { useActivePendingReservations } from "@/hooks/use-reservations";
import { PageWrapper, staggerContainer, fadeUp } from "@/components/layout/page-wrapper";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OrderRowSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { formatPrice, formatDate, orderStatusLabel } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types";

const statusStyles: Record<OrderStatus, { variant: "success" | "default" | "warning" | "destructive" | "blue"; label: string }> = {
  PLACED: { variant: "default", label: "Order Placed" },
  PROCESSING: { variant: "blue", label: "Processing" },
  SHIPPED: { variant: "warning", label: "Shipped" },
  DELIVERED: { variant: "success", label: "Delivered" },
  CANCELLED: { variant: "destructive", label: "Cancelled" },
};

const statusTimeline: OrderStatus[] = ["PLACED", "PROCESSING", "SHIPPED", "DELIVERED"];

function OrderCard({ order, index }: { order: Order; index: number }) {
  const status = statusStyles[order.status] ?? { variant: "secondary", label: order.status };
  const currentStep = statusTimeline.indexOf(order.status);

  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      whileHover={{ y: -2 }}
      className="group bg-white rounded-2xl border border-gray-100 hover:border-amber-300 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300 overflow-hidden shadow-sm"
    >
      {}
      {order.status !== "CANCELLED" && (
        <div className="px-5 pt-5 pb-0">
          <div className="flex items-center gap-0">
            {statusTimeline.map((step, i) => {
              const isCompleted = i <= currentStep;
              const isCurrent = i === currentStep;
              return (
                <div key={step} className="flex items-center flex-1 last:flex-none">
                  <div
                    className={cn(
                      "h-2 w-2 rounded-full flex-shrink-0 transition-all",
                      isCompleted
                        ? isCurrent
                          ? "bg-amber-500 ring-2 ring-amber-500/30"
                          : "bg-amber-400"
                        : "bg-gray-200"
                    )}
                  />
                  {i < statusTimeline.length - 1 && (
                    <div
                      className={cn(
                        "h-0.5 flex-1 mx-1 transition-all",
                        i < currentStep ? "bg-amber-400" : "bg-gray-100"
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-1">
            {statusTimeline.map((step, i) => (
              <span
                key={step}
                className={cn(
                  "text-[10px] first:text-left last:text-right flex-1 text-center",
                  i <= currentStep ? "text-gray-500" : "text-gray-300"
                )}
              >
                {step === "PLACED" ? "Placed" : step === "PROCESSING" ? "Processing" : step === "SHIPPED" ? "Shipped" : "Delivered"}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {}
        <div className={cn(
          "flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl",
          order.status === "DELIVERED" ? "bg-emerald-50 border border-emerald-100" :
          order.status === "CANCELLED" ? "bg-red-50 border border-red-100" :
          "bg-amber-50 border border-amber-100"
        )}>
          <ShoppingBag className={cn(
            "h-6 w-6",
            order.status === "DELIVERED" ? "text-emerald-500" :
            order.status === "CANCELLED" ? "text-red-500" : "text-amber-500"
          )} />
        </div>

        {}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-gray-900">
              Order #{order.id.slice(-8).toUpperCase()}
            </span>
            <Badge variant={status.variant} dot>{status.label}</Badge>
            {order.paymentStatus === "PAID" && (
              <Badge variant="success">Paid</Badge>
            )}
          </div>
          <p className="text-xs text-gray-400">
            Placed on {formatDate(order.createdAt)}
            {order.razorpayOrderId && (
              <> · Razorpay: <span className="font-mono">{order.razorpayOrderId.slice(-8)}</span></>
            )}
          </p>
        </div>

        {}
        <div className="flex flex-col sm:items-end gap-2">
          <span className="text-lg font-bold gradient-text">{formatPrice(order.totalAmount)}</span>
          <Link href={`/orders/${order.id}`}>
            <Button size="sm" variant="glass" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
              Details
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function OrdersContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: orders, isLoading, error } = useOrders();
  const { active: pendingReservations } = useActivePendingReservations();

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast.success("🎉 Order placed successfully!", { duration: 6000 });
    }
  }, [searchParams]);

  return (
    <PageWrapper>
      {}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-700 mb-4">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
          Step 3 of 3
        </div>
        <h1 className="text-4xl font-bold gradient-text mb-2">My Orders</h1>
        <p className="text-gray-500">
          Track and manage all your orders in one place.
        </p>
      </motion.div>

      {}
      <AnimatePresence>
        {searchParams.get("success") === "true" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 flex items-center gap-4 bg-white rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4"
          >
            <CheckCircle2 className="h-6 w-6 text-emerald-500 flex-shrink-0" />
            <div>
              <p className="font-semibold text-emerald-700">Order Confirmed!</p>
              <p className="text-sm text-emerald-600/80">
                Your payment was processed and your order has been placed.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {}
      <AnimatePresence>
        {pendingReservations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6"
          >
            {pendingReservations.map((reservation) => {
              const totalAmount =
                parseFloat(reservation.product.price) * reservation.quantity;
              const expiresAt = new Date(reservation.expiresAt);
              const secondsLeft = Math.max(
                0,
                Math.floor((expiresAt.getTime() - Date.now()) / 1000)
              );
              const mins = Math.floor(secondsLeft / 60);
              const secs = secondsLeft % 60;

              return (
                <div
                  key={reservation.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 bg-amber-50 rounded-2xl border border-amber-300 px-5 py-4 shadow-sm shadow-amber-500/10"
                >
                  <AlertTriangle className="h-6 w-6 text-amber-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-amber-800">
                      Unpaid order — complete your payment!
                    </p>
                    <p className="text-sm text-amber-700/80 mt-0.5 truncate">
                      <span className="font-medium">{reservation.product.name}</span>
                      {" · "}
                      {formatPrice(totalAmount)}
                      {" · "}
                      <span
                        className={cn(
                          "font-mono font-semibold",
                          secondsLeft <= 120 ? "text-red-600" : "text-amber-700"
                        )}
                      >
                        Expires in {mins}:{String(secs).padStart(2, "0")}
                      </span>
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => router.push(`/reservations/${reservation.id}`)}
                    leftIcon={<CreditCard className="h-4 w-4" />}
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                    className="flex-shrink-0"
                  >
                    Continue Payment
                  </Button>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => <OrderRowSkeleton key={i} />)}
        </div>
      ) : error ? (
        <EmptyState
          icon={ShoppingBag}
          title="Failed to load orders"
          description="We couldn't fetch your order history. Please try again."
          action={<Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>}
        />
      ) : !orders?.length ? (
        <EmptyState
          icon={Package2}
          title="No orders yet"
          description="Once you complete a reservation and payment, your orders will appear here."
          action={
            <Button asChild>
              <Link href="/warehouses">Start Shopping</Link>
            </Button>
          }
        />
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {orders.map((order, i) => (
            <OrderCard key={order.id} order={order} index={i} />
          ))}
        </motion.div>
      )}
    </PageWrapper>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<PageWrapper><div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <OrderRowSkeleton key={i} />)}</div></PageWrapper>}>
      <OrdersContent />
    </Suspense>
  );
}
