"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { User, Mail, Warehouse, LogOut, ShoppingBag, MapPin, Plus, Trash2 } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useWarehouseStore } from "@/store/warehouse.store";
import { useAddresses } from "@/hooks/use-addresses";
import { useOrders } from "@/hooks/use-orders";
import { addressService } from "@/services/address.service";
import { authService } from "@/services/auth.service";
import { PageWrapper, staggerContainer, fadeUp } from "@/components/layout/page-wrapper";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AddressModal } from "@/components/features/address-modal";
import { initials, formatDate } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { ADDRESSES_KEY } from "@/hooks/use-addresses";

export default function ProfilePage() {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const { selectedWarehouse, clearWarehouse } = useWarehouseStore();
  const { data: addresses = [], refetch: refetchAddresses } = useAddresses();
  const { data: orders = [] } = useOrders();
  const queryClient = useQueryClient();
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await authService.logout();
    } finally {
      clearAuth();
      clearWarehouse();
      setLoggingOut(false);
      router.push("/");
      toast.success("Logged out successfully");
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!window.confirm("Delete this address?")) return;
    setDeletingId(id);
    try {
      await addressService.delete(id);
      queryClient.invalidateQueries({ queryKey: ADDRESSES_KEY });
      toast.success("Address deleted");
    } catch {
      toast.error("Failed to delete address");
    } finally {
      setDeletingId(null);
    }
  };

  if (!user) {
    router.push("/auth/login");
    return null;
  }

  return (
    <PageWrapper maxWidth="2xl">
      {}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-2xl font-bold text-white shadow-xl shadow-amber-500/30">
              {initials(user.name)}
            </div>
            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-white bg-emerald-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold gradient-text">{user.name}</h1>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
        <Button
          variant="destructive"
          size="sm"
          loading={loggingOut}
          onClick={handleLogout}
          leftIcon={<LogOut className="h-4 w-4" />}
        >
          Sign Out
        </Button>
      </motion.div>

      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-5">
        {}
        <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-4">Account</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 border border-amber-100">
                <User className="h-4 w-4 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Full Name</p>
                <p className="text-sm font-medium text-gray-800">{user.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 border border-amber-100">
                <Mail className="h-4 w-4 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Email</p>
                <p className="text-sm font-medium text-gray-800">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 border border-amber-100">
                <Warehouse className="h-4 w-4 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Selected Warehouse</p>
                <p className="text-sm font-medium text-gray-800">
                  {selectedWarehouse
                    ? `${selectedWarehouse.city}, ${selectedWarehouse.state}`
                    : "None selected"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 border border-amber-100">
                <ShoppingBag className="h-4 w-4 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Total Orders</p>
                <p className="text-sm font-medium text-gray-800">{orders.length}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {}
        <motion.div variants={fadeUp} className="grid grid-cols-3 gap-4">
          {[
            { label: "Orders", value: orders.length, icon: ShoppingBag },
            { label: "Delivered", value: orders.filter((o) => o.status === "DELIVERED").length, icon: ShoppingBag },
            { label: "Addresses", value: addresses.length, icon: MapPin },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
              <p className="text-2xl font-bold gradient-text">{stat.value}</p>
              <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {}
        <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Saved Addresses</p>
            <button
              onClick={() => setShowAddressModal(true)}
              className="flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-700 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Add New
            </button>
          </div>
          {addresses.length === 0 ? (
            <div className="py-8 text-center">
              <MapPin className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No saved addresses</p>
              <button
                onClick={() => setShowAddressModal(true)}
                className="mt-2 text-xs text-amber-600 hover:text-amber-700"
              >
                Add your first address →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="flex items-start justify-between gap-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-amber-200 hover:shadow-sm hover:shadow-amber-500/5 transition-all p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-amber-50 border border-amber-100 mt-0.5">
                      <MapPin className="h-3.5 w-3.5 text-amber-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-800">{addr.fullName}</p>
                        {addr.isDefault && (
                          <Badge variant="default" className="text-[10px] px-1.5 py-0">Default</Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                        {addr.street}, {addr.city}, {addr.state} – {addr.pincode}
                      </p>
                      <p className="text-xs text-gray-300 mt-0.5">{addr.phone}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteAddress(addr.id)}
                    disabled={deletingId === addr.id}
                    className="text-gray-300 hover:text-red-500 transition-colors mt-0.5 flex-shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {}
        {orders.length > 0 && (
          <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-gray-400 uppercase tracking-wider">Recent Orders</p>
              <button
                onClick={() => router.push("/orders")}
                className="text-xs text-amber-600 hover:text-amber-700 transition-colors"
              >
                View all →
              </button>
            </div>
            <div className="space-y-3">
              {orders.slice(0, 3).map((order) => (
                <div
                  key={order.id}
                  onClick={() => router.push(`/orders/${order.id}`)}
                  className="flex items-center justify-between rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 cursor-pointer hover:border-amber-200 hover:shadow-sm hover:shadow-amber-500/5 transition-all"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">#{order.id.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                  </div>
                  <Badge variant={order.status === "DELIVERED" ? "success" : order.status === "CANCELLED" ? "destructive" : "default"} dot>
                    {order.status}
                  </Badge>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {}
        <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-red-100 p-6 shadow-sm">
          <p className="text-xs text-red-400 uppercase tracking-wider mb-3">Sign Out</p>
          <p className="text-sm text-gray-400 mb-4">
            You will be logged out from all active sessions on this device.
          </p>
          <Button
            variant="destructive"
            loading={loggingOut}
            onClick={handleLogout}
            leftIcon={<LogOut className="h-4 w-4" />}
          >
            Sign Out
          </Button>
        </motion.div>
      </motion.div>

      <AddressModal
        open={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onSuccess={() => {
          refetchAddresses();
          setShowAddressModal(false);
        }}
      />
    </PageWrapper>
  );
}
