"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  Package2,
  ChevronDown,
  Warehouse,
  Zap,
  ShoppingCart,
} from "lucide-react";
import { useProducts } from "@/hooks/use-products";
import { useWarehouseStore } from "@/store/warehouse.store";
import { PageWrapper, staggerContainer, fadeUp } from "@/components/layout/page-wrapper";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCardSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { availableStock, formatPrice } from "@/lib/utils";
import type { ProductWithInventory, ProductFilters } from "@/types";
import { cn } from "@/lib/utils";

const sortOptions: { value: ProductFilters["sortBy"]; label: string }[] = [
  { value: "name", label: "Name" },
  { value: "price", label: "Price" },
  { value: "stock", label: "Stock" },
];

function ProductCard({
  product,
  warehouseId,
  index,
}: {
  product: ProductWithInventory;
  warehouseId?: string;
  index: number;
}) {
  const inv = product.inventories.find((i) => i.warehouseId === warehouseId) ??
    product.inventories[0];
  const stock = inv ? availableStock(inv) : 0;
  const inStock = stock > 0;

  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      whileHover={{ y: -6 }}
      className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-amber-400/40 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 shadow-sm"
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden bg-gray-50">
        <img
          src={product.image || `https://picsum.photos/seed/${product.id}/400/300`}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Stock badge */}
        <div className="absolute top-3 left-3">
          <Badge
            variant={inStock ? (stock < 5 ? "warning" : "success") : "destructive"}
            dot
          >
            {inStock ? (stock < 5 ? `Only ${stock} left` : `${stock} in stock`) : "Out of stock"}
          </Badge>
        </div>

        {/* Quick reserve on hover */}
        {inStock && (
          <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <Link href={`/products/${product.id}`}>
              <Button size="sm" className="w-full" leftIcon={<Zap className="h-3.5 w-3.5" />}>
                Order Now
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="mb-1">
          <h3 className="font-semibold text-gray-900 text-base leading-tight line-clamp-1">
            {product.name}
          </h3>
        </div>
        <p className="text-xs text-gray-400 line-clamp-2 mb-4 leading-relaxed">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-xl font-bold gradient-text">
              {formatPrice(product.price)}
            </div>
          </div>

          {inStock ? (
            <Link href={`/products/${product.id}`}>
              <Button
                size="sm"
                variant="glass"
                leftIcon={<ShoppingCart className="h-3.5 w-3.5" />}
              >
                Order
              </Button>
            </Link>
          ) : (
            <Button size="sm" variant="secondary" disabled>
              Out of Stock
            </Button>
          )}
        </div>
      </div>

      {/* Glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </motion.div>
  );
}

export default function ProductsPage() {
  const { selectedWarehouse } = useWarehouseStore();
  const { data: products, isLoading, error } = useProducts();
  const [filters, setFilters] = useState<ProductFilters>({
    search: "",
    sortBy: "name",
    sortOrder: "asc",
    warehouseId: selectedWarehouse?.id,
  });
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    if (!products) return [];
    let result = [...products];

    // Filter by warehouse inventory
    if (selectedWarehouse) {
      result = result.filter((p) =>
        p.inventories.some((i) => i.warehouseId === selectedWarehouse.id)
      );
    }

    // Search
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      const dir = filters.sortOrder === "asc" ? 1 : -1;
      if (filters.sortBy === "name") {
        return a.name.localeCompare(b.name) * dir;
      }
      if (filters.sortBy === "price") {
        return (parseFloat(a.price) - parseFloat(b.price)) * dir;
      }
      if (filters.sortBy === "stock") {
        const aStock = a.inventories.reduce((s, i) => s + availableStock(i), 0);
        const bStock = b.inventories.reduce((s, i) => s + availableStock(i), 0);
        return (aStock - bStock) * dir;
      }
      return 0;
    });

    return result;
  }, [products, filters, selectedWarehouse]);

  return (
    <PageWrapper>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-700 mb-3">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
              Step 2 of 3
            </div>
            <h1 className="text-4xl font-bold gradient-text mb-2">Products</h1>
            {selectedWarehouse ? (
              <p className="text-gray-500 flex items-center gap-2">
                <Warehouse className="h-4 w-4 text-amber-500" />
                Showing inventory from{" "}
                <span className="text-gray-700 font-medium">
                  {selectedWarehouse.name}, {selectedWarehouse.city}
                </span>
              </p>
            ) : (
              <p className="text-gray-500">
                <Link href="/warehouses" className="text-amber-600 hover:underline">
                  Select a warehouse
                </Link>{" "}
                to see localised stock
              </p>
            )}
          </div>

          {filtered.length > 0 && (
            <Badge variant="secondary" className="self-start sm:self-auto">
              {filtered.length} product{filtered.length !== 1 ? "s" : ""}
            </Badge>
          )}
        </div>
      </motion.div>

      {/* Search & filters bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 flex flex-col sm:flex-row gap-3"
      >
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products…"
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            className="w-full h-10 rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all hover:border-gray-300"
          />
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={filters.sortBy}
              onChange={(e) =>
                setFilters((f) => ({ ...f, sortBy: e.target.value as ProductFilters["sortBy"] }))
              }
              className="h-10 rounded-xl border border-gray-200 bg-white pl-3 pr-8 text-sm text-gray-900 focus:border-amber-400 focus:outline-none appearance-none cursor-pointer"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  Sort by {o.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          </div>

          <button
            onClick={() =>
              setFilters((f) => ({
                ...f,
                sortOrder: f.sortOrder === "asc" ? "desc" : "asc",
              }))
            }
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-medium transition-all",
              filters.sortOrder === "asc"
                ? "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                : "border-amber-400/40 bg-amber-500/10 text-amber-700"
            )}
            title="Toggle sort order"
          >
            {filters.sortOrder === "asc" ? "↑" : "↓"}
          </button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? "border-amber-400/40 bg-amber-500/10 text-amber-700" : ""}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {/* Product grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <EmptyState
          icon={Package2}
          title="Failed to load products"
          description="We couldn't fetch the product catalog. Please try again."
          action={
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Package2}
          title={filters.search ? "No products match your search" : "No products available"}
          description={
            filters.search
              ? `No results for "${filters.search}". Try a different keyword.`
              : "This warehouse doesn't have any products yet."
          }
          action={
            filters.search ? (
              <Button
                variant="outline"
                onClick={() => setFilters((f) => ({ ...f, search: "" }))}
              >
                Clear search
              </Button>
            ) : undefined
          }
        />
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filtered.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              warehouseId={selectedWarehouse?.id}
              index={i}
            />
          ))}
        </motion.div>
      )}
    </PageWrapper>
  );
}
