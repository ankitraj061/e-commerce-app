"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import {
  Warehouse,
  MapPin,
  Package,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { useWarehouses } from "@/hooks/use-warehouses";
import { useAuthStore } from "@/store/auth.store";
import { useWarehouseStore } from "@/store/warehouse.store";
import { warehouseService } from "@/services/warehouse.service";
import { extractErrorMessage } from "@/services/api";
import { PageWrapper, staggerContainer, fadeUp } from "@/components/layout/page-wrapper";
import { Button } from "@/components/ui/button";
import { WarehouseCardSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import type { Warehouse as WarehouseType } from "@/types";
import { cn } from "@/lib/utils";

const warehouseImages: Record<string, string> = {
  Delhi: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80",
  Mumbai: "https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=800&q=80",
  Bangalore: "https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&q=80",
  Chennai: "https://images.unsplash.com/photo-1544986581-efac024faf62?w=800&q=80",
  Hyderabad: "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=800&q=80",
  Kolkata: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80",
};

const fallbackImage =
  "https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&q=80";

function getWarehouseImage(warehouse: WarehouseType): string {
  if (warehouse.image) return warehouse.image;
  const cityKey = Object.keys(warehouseImages).find((k) =>
    warehouse.city.includes(k)
  );
  return cityKey ? warehouseImages[cityKey] : fallbackImage;
}

function getDeliveryEstimate(city: string): string {
  const estimates: Record<string, string> = {
    Delhi: "Same day", Mumbai: "Same day", Bangalore: "Next day",
    Chennai: "Next day", Hyderabad: "2 days", Kolkata: "2-3 days",
  };
  const key = Object.keys(estimates).find((k) => city.includes(k));
  return key ? estimates[key] : "2-4 days";
}

export default function WarehousesPage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const { selectedWarehouse, setSelectedWarehouse } = useWarehouseStore();
  const { data: warehouses, isLoading, error } = useWarehouses();
  const [selectingId, setSelectingId] = useState<string | null>(null);

  const handleSelect = async (warehouse: WarehouseType) => {
    if (selectingId) return;
    if (selectedWarehouse?.id === warehouse.id) return; 
    setSelectingId(warehouse.id);
    try {
      await warehouseService.selectWarehouse(warehouse.id);
      setSelectedWarehouse(warehouse);
      if (user) setUser({ ...user, selectedWarehouseId: warehouse.id });
      toast.success(`Switched to ${warehouse.name}!`);
      router.push("/products");
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSelectingId(null);
    }
  };

  return (
    <PageWrapper>
      {}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-700 mb-4">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
          Step 1 of 3
        </div>
        <h1 className="text-4xl font-bold gradient-text mb-3">
          Choose a Warehouse
        </h1>
        <p className="text-gray-500 text-lg max-w-xl">
          Select the fulfillment centre closest to your customers. Products and
          stock levels update based on your selection.
        </p>
        {selectedWarehouse && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-sm text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            Currently: {selectedWarehouse.name}, {selectedWarehouse.city}
          </div>
        )}
      </motion.div>

      {}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <WarehouseCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <EmptyState
          icon={Warehouse}
          title="Failed to load warehouses"
          description="We couldn't fetch the warehouse list. Please try again."
          action={
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
          }
        />
      ) : !warehouses?.length ? (
        <EmptyState
          icon={Warehouse}
          title="No warehouses available"
          description="No warehouses have been set up yet. Check back soon."
        />
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {warehouses.map((warehouse) => {
            const isSelected = selectedWarehouse?.id === warehouse.id;
            const isSelecting = selectingId === warehouse.id;
            const imgSrc = getWarehouseImage(warehouse);
            const delivery = getDeliveryEstimate(warehouse.city);

            return (
              <motion.div
                key={warehouse.id}
                variants={fadeUp}
                whileHover={{ y: -6, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleSelect(warehouse)}
                className={cn(
                  "group relative bg-white rounded-2xl border overflow-hidden cursor-pointer transition-all duration-300 shadow-sm",
                  isSelected
                    ? "border-amber-400 shadow-xl shadow-amber-500/15"
                    : "border-gray-100 hover:border-amber-300 hover:shadow-xl hover:shadow-amber-500/10"
                )}
              >
                {}
                {isSelected && (
                  <div className="absolute inset-0 rounded-2xl border-2 border-amber-400 pointer-events-none z-10" />
                )}

                {}
                {isSelected && (
                  <div className="absolute top-3 right-3 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 shadow-lg">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                )}

                {}
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={imgSrc}
                    alt={warehouse.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  {}
                  <div className="absolute bottom-3 left-3">
                    <span className="inline-flex items-center gap-1 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10 px-2.5 py-1 text-xs text-white">
                      🚚 {delivery} delivery
                    </span>
                  </div>
                </div>

                {}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                        {warehouse.name}
                      </h3>
                      <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                        <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                        {warehouse.city}, {warehouse.state}
                      </div>
                    </div>
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-amber-50 border border-amber-100">
                      <Warehouse className="h-5 w-5 text-amber-500" />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-5">
                    <Package className="h-3.5 w-3.5" />
                    {warehouse.pincode} · {warehouse.country}
                  </div>

                  <Button
                    variant={isSelected ? "success" : "default"}
                    size="sm"
                    className="w-full"
                    loading={isSelecting}
                    rightIcon={!isSelecting && !isSelected ? <ArrowRight className="h-3.5 w-3.5" /> : undefined}
                  >
                    {isSelecting ? (
                      "Selecting…"
                    ) : isSelected ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Selected
                      </>
                    ) : (
                      "Select Warehouse"
                    )}
                  </Button>
                </div>

                {}
                <div className="absolute inset-0 rounded-2xl bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </PageWrapper>
  );
}
