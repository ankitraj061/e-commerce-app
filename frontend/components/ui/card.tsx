"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "bg-white rounded-2xl border border-gray-100 shadow-sm",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

type MotionCardProps = HTMLMotionProps<"div"> & {
  glowOnHover?: boolean;
};

const MotionCard = forwardRef<HTMLDivElement, MotionCardProps>(
  ({ className, glowOnHover = false, ...props }, ref) => (
    <motion.div
      ref={ref}
      className={cn(
        "bg-white rounded-2xl border border-gray-100 shadow-sm",
        glowOnHover && "transition-shadow duration-300 hover:shadow-amber-500/15 hover:border-amber-300",
        className
      )}
      {...props}
    />
  )
);
MotionCard.displayName = "MotionCard";

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-1.5 p-6", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

const CardTitle = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-xl font-semibold leading-tight text-gray-900", className)}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-gray-500", className)} {...props} />
  )
);
CardDescription.displayName = "CardDescription";

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";

export { Card, MotionCard, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
