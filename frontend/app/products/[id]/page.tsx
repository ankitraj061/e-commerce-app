"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Package2, MapPin, Warehouse, Clock, ArrowLeft, Minus, Plus, Zap, ShoppingBag,
} from "lucide-react";
import { useProduct, PRODUCTS_KEY } from "@/hooks/use-products";
import { useAddresses } from "@/hooks/use-addresses";
import { useAuthStore } from "@/store/auth.store";
import { useWarehouseStore } from "@/store/warehouse.store";
import { useReservationStore } from "@/store/reservation.store";
import { reservationService } from "@/services/reservation.service";
import { extractErrorMessage } from "@/services/api";
import { useQueryClient } from "@tanstack/react-query";
import { availableStock, formatPrice } from "@/lib/utils";
import { PageWrapper, fadeUp } from "@/components/layout/page-wrapper";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { AddressModal } from "@/components/features/address-modal";

const schema = z.object({
  quantity: z.number().min(1, "Minimum quantity is 1").max(10, "Maximum 10 per order"),
  deliveryAddressId: z.string().min(1, "Select a delivery address"),
});
type FormData = z.infer<typeof schema>;

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { selectedWarehouse } = useWarehouseStore();
  const { setActiveReservation } = useReservationStore();
  const { data: product, isLoading } = useProduct(id);
  const { data: addresses = [] } = useAddresses();
  const [qty, setQty] = useState(1);
  const [showAddressModal, setShowAddressModal] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { quantity: 1, deliveryAddressId: "" },
  });

  const selectedAddressId = watch("deliveryAddressId");

  
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find((a) => a.isDefault) ?? addresses[0];
      setValue("deliveryAddressId", defaultAddr.id);
    }
  }, [addresses, selectedAddressId, setValue]);

  const inv = product?.inventories.find((i) => i.warehouseId === selectedWarehouse?.id);
  const stock = inv ? availableStock(inv) : 0;
  const maxQty = Math.min(stock, 10);

  const handleQtyChange = (delta: number) => {
    const next = Math.max(1, Math.min(maxQty, qty + delta));
    setQty(next);
    setValue("quantity", next);
  };

  const onSubmit = async (data: FormData) => {
    if (!selectedWarehouse) {
      toast.error("Please select a warehouse first");
      router.push("/warehouses");
      return;
    }
    try {
      const idempotencyKey = `reserve-${user!.id}-${id}-${Date.now()}`;
      const reservation = await reservationService.create(
        { productId: id, warehouseId: selectedWarehouse.id, quantity: data.quantity, deliveryAddressId: data.deliveryAddressId },
        idempotencyKey
      );
      setActiveReservation(reservation);
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
      toast.success("Order placed! Complete payment before the timer runs out.");
      router.push(`/reservations/${reservation.id}`);
    } catch (err: unknown) {
      const msg = extractErrorMessage(err);
      if ((err as { response?: { status?: number } })?.response?.status === 409) {
        toast.error("Stock unavailable — another customer reserved it just now.");
      } else {
        toast.error(msg);
      }
    }
  };

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <Skeleton className="h-96 rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (!product) {
    return (
      <PageWrapper>
        <EmptyState
          icon={Package2}
          title="Product not found"
          description="This product doesn't exist or has been removed."
          action={<Button onClick={() => router.back()}>Go Back</Button>}
        />
      </PageWrapper>
    );
  }

  const inStock = stock > 0;

  return (
    <PageWrapper maxWidth="7xl">
      {}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 text-sm text-gray-400 hover:text-amber-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to products
      </motion.button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="relative"
        >
          <div className="relative overflow-hidden rounded-2xl aspect-square bg-gray-50">
            <img
              src={product.image || `https://picsum.photos/seed/${product.id}/600/600`}
              alt={product.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            {}
            {!inStock && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <Badge variant="destructive" className="text-base px-4 py-2">
                  Out of Stock
                </Badge>
              </div>
            )}
          </div>
          {}
          <div className="absolute -inset-4 rounded-3xl bg-amber-500/10 blur-3xl -z-10" />
        </motion.div>

        {}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={1}
          className="flex flex-col gap-6"
        >
          {}
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant={inStock ? "success" : "destructive"} dot>
                {inStock ? `${stock} available` : "Out of stock"}
              </Badge>
              {selectedWarehouse && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Warehouse className="h-3 w-3" />
                  {selectedWarehouse.city}
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold gradient-text mb-2">{product.name}</h1>
            <div className="text-3xl font-bold gradient-text mb-4">
              {formatPrice(product.price)}
            </div>
            <p className="text-gray-500 leading-relaxed">{product.description}</p>
          </div>

          {}
          {product.inventories.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">
                Warehouse Availability
              </p>
              <div className="space-y-2">
                {product.inventories.map((inv) => {
                  const avail = availableStock(inv);
                  return (
                    <div key={inv.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-3.5 w-3.5 text-gray-400" />
                        {inv.warehouse?.city ?? "–"}
                      </div>
                      <Badge
                        variant={avail > 0 ? (avail < 5 ? "warning" : "success") : "destructive"}
                        dot
                      >
                        {avail > 0 ? `${avail} in stock` : "Out of stock"}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {}
          <div className="flex items-center gap-3 rounded-xl bg-amber-50 border border-amber-100 px-4 py-3">
            <Clock className="h-5 w-5 text-amber-500 flex-shrink-0" />
            <p className="text-sm text-amber-800">
              Stock is held for{" "}
              <span className="font-semibold">10 minutes</span> after placing your order. Complete payment before the timer expires.
            </p>
          </div>

          {}
          {inStock && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleQtyChange(-1)}
                    disabled={qty <= 1}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-amber-50 hover:border-amber-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <div className="flex h-10 w-16 items-center justify-center rounded-xl border border-gray-200 bg-white text-lg font-semibold text-gray-900 shadow-sm">
                    {qty}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleQtyChange(1)}
                    disabled={qty >= maxQty}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-amber-50 hover:border-amber-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <span className="text-sm text-gray-400">
                    max {maxQty} per order
                  </span>
                </div>
              </div>

              {}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Delivery Address</label>
                  <button
                    type="button"
                    onClick={() => setShowAddressModal(true)}
                    className="text-xs text-amber-600 hover:text-amber-700 transition-colors"
                  >
                    + Add new
                  </button>
                </div>
                {addresses.length === 0 ? (
                  <button
                    type="button"
                    onClick={() => setShowAddressModal(true)}
                    className="w-full rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-4 text-sm text-gray-400 hover:border-amber-400 hover:text-gray-600 transition-all text-center"
                  >
                    + Add a delivery address
                  </button>
                ) : (
                  <div className="space-y-2">
                    {addresses.map((addr) => (
                      <label
                        key={addr.id}
                        className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-all ${
                          selectedAddressId === addr.id
                            ? "border-amber-400 bg-amber-50"
                            : "border-gray-100 bg-white hover:border-amber-200 hover:shadow-sm shadow-sm"
                        }`}
                      >
                        <input
                          type="radio"
                          value={addr.id}
                          {...register("deliveryAddressId")}
                          className="mt-0.5 accent-amber-500"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-800">
                            {addr.fullName}
                            {addr.isDefault && (
                              <span className="ml-2 text-xs text-amber-600">Default</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {addr.street}, {addr.city}, {addr.state} {addr.pincode}
                          </div>
                          <div className="text-xs text-gray-300">{addr.phone}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
                {errors.deliveryAddressId && (
                  <p className="text-xs text-red-500 mt-1">{errors.deliveryAddressId.message}</p>
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                loading={isSubmitting}
                className="w-full"
                leftIcon={<Zap className="h-5 w-5" />}
              >
                {isSubmitting ? "Placing order…" : `Order ${qty} × ${formatPrice(product.price)}`}
              </Button>
            </form>
          )}

          {!inStock && (
            <div className="bg-white rounded-xl border border-gray-100 p-6 text-center shadow-sm">
              <ShoppingBag className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">
                This product is out of stock at{" "}
                {selectedWarehouse?.city ?? "your selected warehouse"}.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => router.push("/warehouses")}
              >
                Try a different warehouse
              </Button>
            </div>
          )}
        </motion.div>
      </div>

      {}
      <AddressModal
        open={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onSuccess={(addr) => {
          setValue("deliveryAddressId", addr.id);
          setShowAddressModal(false);
        }}
      />
    </PageWrapper>
  );
}
