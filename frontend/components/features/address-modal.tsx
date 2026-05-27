"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useCreateAddress } from "@/hooks/use-addresses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Address } from "@/types";

const schema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().min(10, "Enter a valid phone number"),
  street: z.string().min(5, "Street address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().length(6, "Enter a 6-digit pincode"),
  country: z.string().min(1),
  isDefault: z.boolean(),
});
type FormData = z.infer<typeof schema>;

interface AddressModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (address: Address) => void;
}

export function AddressModal({ open, onClose, onSuccess }: AddressModalProps) {
  const { mutateAsync: createAddress } = useCreateAddress();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { country: "India", isDefault: false },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const addr = await createAddress(data);
      toast.success("Address saved!");
      reset();
      onSuccess(addr);
    } catch {
      toast.error("Failed to save address");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />

          {}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
            className="fixed inset-x-4 top-1/2 z-50 -translate-y-1/2 mx-auto max-w-lg bg-white rounded-2xl border border-gray-100 shadow-2xl shadow-gray-400/20"
          >
            {}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-amber-500" />
                <h2 className="text-lg font-semibold text-gray-900">Add Delivery Address</h2>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {}
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Full name" placeholder="Ankit Raj" error={errors.fullName?.message} {...register("fullName")} />
                <Input label="Phone" placeholder="9876543210" error={errors.phone?.message} {...register("phone")} />
              </div>
              <Input label="Street address" placeholder="123, MG Road, Apt 4B" error={errors.street?.message} {...register("street")} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="City" placeholder="Bangalore" error={errors.city?.message} {...register("city")} />
                <Input label="State" placeholder="Karnataka" error={errors.state?.message} {...register("state")} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Pincode" placeholder="560001" error={errors.pincode?.message} {...register("pincode")} />
                <Input label="Country" placeholder="India" error={errors.country?.message} {...register("country")} />
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input type="checkbox" {...register("isDefault")} className="accent-amber-500 h-4 w-4" />
                Set as default address
              </label>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" loading={isSubmitting}>
                  {isSubmitting ? "Saving…" : "Save Address"}
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
