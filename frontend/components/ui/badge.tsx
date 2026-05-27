import { type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-amber-500/15 text-amber-700 border border-amber-500/30",
        secondary: "bg-gray-100 text-gray-600 border border-gray-200",
        success: "bg-emerald-500/15 text-emerald-700 border border-emerald-500/25",
        warning: "bg-amber-500/15 text-amber-700 border border-amber-500/25",
        destructive: "bg-red-500/15 text-red-600 border border-red-500/25",
        blue: "bg-blue-500/15 text-blue-700 border border-blue-500/25",
        outline: "border border-gray-200 text-gray-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            variant === "success" && "bg-emerald-500",
            variant === "warning" && "bg-amber-500",
            variant === "destructive" && "bg-red-500",
            variant === "default" && "bg-amber-500",
            variant === "blue" && "bg-blue-500",
            variant === "secondary" && "bg-gray-400",
          )}
        />
      )}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
