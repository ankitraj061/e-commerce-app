import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Inventory } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: string | number, currency = "INR"): string {
  const num = typeof price === "string" ? parseFloat(price) : price;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr));
}

export function formatDateTime(dateStr: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

export function formatCountdown(seconds: number): string {
  const m = Math.floor(Math.max(0, seconds) / 60);
  const s = Math.max(0, seconds) % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function secondsUntil(dateStr: string): number {
  return Math.max(0, Math.floor((new Date(dateStr).getTime() - Date.now()) / 1000));
}

export function truncate(str: string, n: number): string {
  return str.length > n ? `${str.slice(0, n)}…` : str;
}

export const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/** Clamp a number between min and max */
export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

/** Map order status → label */
export function orderStatusLabel(status: string): string {
  const map: Record<string, string> = {
    PLACED: "Order Placed",
    PROCESSING: "Processing",
    SHIPPED: "Shipped",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
  };
  return map[status] ?? status;
}

export function reservationStatusLabel(status: string): string {
  const map: Record<string, string> = {
    PENDING: "Awaiting Payment",
    CONFIRMED: "Confirmed",
    RELEASED: "Released",
    EXPIRED: "Expired",
  };
  return map[status] ?? status;
}

export function availableStock(inv: Pick<Inventory, "totalStock" | "reservedStock">): number {
  return Math.max(0, inv.totalStock - inv.reservedStock);
}
