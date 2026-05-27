"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-medium",
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2",
    "focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
    "disabled:pointer-events-none disabled:opacity-40 select-none cursor-pointer",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-gradient-to-r from-amber-500 to-orange-500 text-white",
          "hover:from-amber-400 hover:to-orange-400",
          "shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40",
        ].join(" "),
        secondary: [
          "bg-gray-100 text-gray-900 border border-gray-200",
          "hover:bg-gray-200 hover:border-gray-300",
        ].join(" "),
        outline: [
          "border border-gray-200 bg-transparent text-gray-900",
          "hover:bg-amber-50 hover:border-amber-300 hover:text-amber-900",
        ].join(" "),
        ghost: [
          "bg-transparent text-gray-600",
          "hover:bg-amber-50 hover:text-amber-700",
        ].join(" "),
        destructive: [
          "bg-gradient-to-r from-red-500 to-rose-500 text-white",
          "hover:from-red-400 hover:to-rose-400",
          "shadow-lg shadow-red-500/25",
        ].join(" "),
        success: [
          "bg-gradient-to-r from-emerald-500 to-green-500 text-white",
          "hover:from-emerald-400 hover:to-green-400",
          "shadow-lg shadow-emerald-500/25",
        ].join(" "),
        glass: [
          "glass text-gray-800 border border-gray-200",
          "hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/10",
        ].join(" "),
      },
      size: {
        sm: "h-8 px-3 text-sm rounded-lg",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-lg rounded-2xl",
        icon: "h-10 w-10 rounded-xl",
        "icon-sm": "h-8 w-8 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  /** Merge props onto the immediate child element instead of rendering a <button> */
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      loading,
      leftIcon,
      rightIcon,
      children,
      disabled,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const classes = cn(buttonVariants({ variant, size, className }));

    // When asChild, wrap with Slot (merges props onto child link/element)
    if (asChild) {
      return (
        <Slot ref={ref} className={classes} {...props}>
          {children}
        </Slot>
      );
    }

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.02 }}
        className={classes}
        disabled={disabled || loading}
        {...(props as React.ComponentPropsWithoutRef<typeof motion.button>)}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : leftIcon}
        {children}
        {!loading && rightIcon}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
