import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[#1A1A2E] text-white",
        secondary: "bg-gray-100 text-gray-700",
        outline: "border border-gray-200 text-gray-700",
        success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
        warning: "bg-orange-50 text-orange-700 border border-orange-200",
        destructive: "bg-red-50 text-red-700 border border-red-200",
        easy: "bg-emerald-50 text-emerald-700",
        medium: "bg-amber-50 text-amber-700",
        hard: "bg-red-50 text-red-700",
        accent: "bg-orange-50 text-[#F97316] border border-orange-200",
        processing: "bg-blue-50 text-blue-700 border border-blue-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
