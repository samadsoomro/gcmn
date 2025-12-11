import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow-[0_1px_3px_hsl(217_91%_60%/0.2)] hover:bg-primary/90",
        secondary: "border-border bg-card text-foreground shadow-[0_1px_2px_hsl(0_0%_0%/0.04)] hover:bg-muted",
        destructive: "border-transparent bg-destructive text-destructive-foreground shadow-[0_1px_3px_hsl(0_84%_60%/0.2)] hover:bg-destructive/90",
        outline: "text-foreground border-border",
        success: "border-transparent bg-green-500 text-white shadow-[0_1px_3px_hsl(142_76%_36%/0.2)]",
        warning: "border-transparent bg-amber-500 text-white shadow-[0_1px_3px_hsl(38_92%_50%/0.2)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
