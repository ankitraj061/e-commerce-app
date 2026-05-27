"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft, ShoppingBag, MapPin, Warehouse, CreditCard,
  Package2, CheckCircle2, Truck, Clock, XCircle, RotateCcw,
} from "lucide-react";
import { useOrder } from "@/hooks/use-orders";
import { PageWrapper, staggerContainer, fadeUp } from "@/components/layout/page-wrapper";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { formatPrice, formatDateTime, orderStatusLabel } from "@/lib/utils";
import type { OrderStatus } from "@/types";
import { cn } from "@/lib/utils";

const statusConfig: Record<
  OrderStatus,
  { icon: React.ElementType; color: string; bg: string; border: string; badgeVariant: "success" | "default" | "warning" | "destructive" | "blue" }
> = {
  PLACED: { icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100", badgeVariant: "default" },
  PROCESSING: { icon: RotateCcw, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100", badgeVariant: "blue" },
  SHIPPED: { icon: Truck, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100", badgeVariant: "warning" },
  DELIVERED: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", badgeVariant: "success" },
  CANCELLED: { icon: XCircle, color: "text-red-500", bg: "bg-red-50", border: "border-red-100", badgeVariant: "destructive" },
};

const timeline: OrderStatus[] = ["PLACED", "PROCESSING", "SHIPPED", "DELIVERED"];

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: order, isLoading, error } = useOrder(id);

  if (isLoading) {
    return (
      <PageWrapper maxWidth="2xl">
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-40 rounded-2xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </div>
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </PageWrapper>
    );
  }

  if (error || !order) {
    return (
      <PageWrapper maxWidth="2xl">
        <EmptyState
          icon={ShoppingBag}
          title="Order not found"
          description="This order doesn't exist or you don't have access to it."
          action={<Button onClick={() => router.push("/orders")}>Back to Orders</Button>}
        />
      </PageWrapper>
    );
  }

  const cfg = statusConfig[order.status] ?? statusConfig.PLACED;
  const StatusIcon = cfg.icon;
  const currentStep = timeline.indexOf(order.status);

  return (
    <PageWrapper maxWidth="2xl">
      {/* Back */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => router.push("/orders")}
        className="mb-6 flex items-center gap-2 text-sm text-gray-400 hover:text-amber-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Orders
      </motion.button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold mb-1">
            <span className="text-gray-900">Order </span>
            <span className="gradient-text">#{order.id.slice(-8).toUpperCase()}</span>
          </h1>
          <p className="text-sm text-gray-400">{formatDateTime(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={cfg.badgeVariant} dot className="text-sm px-3 py-1">
            {orderStatusLabel(order.status)}
          </Badge>
          {order.paymentStatus === "PAID" && (
            <Badge variant="success">Paid</Badge>
          )}
        </div>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="space-y-5"
      >
        {/* Timeline */}
        {order.status !== "CANCELLED" && (
          <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-5">Order Progress</p>
            <div className="relative flex items-start justify-between">
              {/* connector line background */}
              <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-100" />
              {/* connector line progress */}
              <div
                className="absolute top-5 left-5 h-0.5 bg-gradient-to-r from-amber-400 to-orange-400 transition-all duration-700"
                style={{
                  width: currentStep < 0 ? "0%" : `${(currentStep / (timeline.length - 1)) * 100}%`,
                  right: "auto",
                }}
              />

              {timeline.map((step, i) => {
                const StepIcon = statusConfig[step].icon;
                const isCompleted = i <= currentStep;
                const isCurrent = i === currentStep;
                return (
                  <div key={step} className="relative flex flex-col items-center gap-2 z-10">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all",
                        isCompleted
                          ? isCurrent
                            ? `${statusConfig[step].bg} ${statusConfig[step].border} ring-4 ring-amber-400/20`
                            : "bg-amber-50 border-amber-200"
                          : "bg-white border-gray-200"
                      )}
                    >
                      <StepIcon className={cn("h-4 w-4", isCompleted ? statusConfig[step].color : "text-gray-300")} />
                    </div>
                    <span className={cn(
                      "text-xs font-medium text-center max-w-[60px] leading-tight",
                      isCurrent ? "text-gray-800" : isCompleted ? "text-gray-500" : "text-gray-300"
                    )}>
                      {step === "PLACED" ? "Placed" : step === "PROCESSING" ? "Processing" : step === "SHIPPED" ? "Shipped" : "Delivered"}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Status card */}
        <motion.div
          variants={fadeUp}
          className={cn("bg-white rounded-2xl border p-5 flex items-center gap-4 shadow-sm", cfg.border)}
        >
          <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl flex-shrink-0", cfg.bg, `border ${cfg.border}`)}>
            <StatusIcon className={cn("h-6 w-6", cfg.color)} />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{orderStatusLabel(order.status)}</p>
            <p className="text-sm text-gray-500">
              {order.status === "DELIVERED"
                ? "Your order has been delivered successfully."
                : order.status === "SHIPPED"
                ? "Your order is on its way!"
                : order.status === "PROCESSING"
                ? "Your order is being processed at the warehouse."
                : order.status === "CANCELLED"
                ? "This order has been cancelled."
                : "Your order has been placed and confirmed."}
            </p>
          </div>
        </motion.div>

        {/* Order items */}
        {order.items && order.items.length > 0 && (
          <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-4">Items Ordered</p>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 items-center">
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-gray-50">
                    <img
                      src={item.product.image || `https://picsum.photos/seed/${item.product.id}/128`}
                      alt={item.product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 line-clamp-1">{item.product.name}</p>
                    <p className="text-sm text-gray-400 mt-0.5">Qty: {item.quantity} × {formatPrice(item.unitPrice)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatPrice(parseFloat(item.unitPrice) * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Delivery + Payment info side by side */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Delivery Address */}
          {order.deliveryAddress && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="h-4 w-4 text-amber-500" />
                <p className="text-xs text-gray-400 uppercase tracking-wider">Delivery Address</p>
              </div>
              <p className="font-medium text-gray-800">{order.deliveryAddress.fullName}</p>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                {order.deliveryAddress.street}<br />
                {order.deliveryAddress.city}, {order.deliveryAddress.state} – {order.deliveryAddress.pincode}
              </p>
              <p className="text-xs text-gray-400 mt-1">{order.deliveryAddress.phone}</p>
            </div>
          )}

          {/* Payment info */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="h-4 w-4 text-amber-500" />
              <p className="text-xs text-gray-400 uppercase tracking-wider">Payment Details</p>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Status</span>
                <Badge variant={order.paymentStatus === "PAID" ? "success" : "warning"} dot>
                  {order.paymentStatus}
                </Badge>
              </div>
              {order.razorpayPaymentId && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Payment ID</span>
                  <span className="font-mono text-xs text-gray-600">{order.razorpayPaymentId.slice(-12)}</span>
                </div>
              )}
              {order.razorpayOrderId && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Order ID</span>
                  <span className="font-mono text-xs text-gray-600">{order.razorpayOrderId.slice(-12)}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Order total */}
        <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span className="text-gray-800">{formatPrice(order.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Delivery</span>
              <span className="text-emerald-600">Free</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Taxes</span>
              <span className="text-gray-800">Included</span>
            </div>
            <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
              <span className="font-semibold text-gray-900 text-base">Total Paid</span>
              <span className="text-2xl font-bold gradient-text">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div variants={fadeUp} className="flex gap-3 pt-2">
          <Button variant="outline" onClick={() => router.push("/orders")} leftIcon={<ArrowLeft className="h-4 w-4" />}>
            All Orders
          </Button>
          <Button asChild leftIcon={<Package2 className="h-4 w-4" />}>
            <a href="/products">Browse Products</a>
          </Button>
        </motion.div>
      </motion.div>
    </PageWrapper>
  );
}
