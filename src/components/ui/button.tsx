import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "destructive" | "success";
type Size = "default" | "lg" | "sm" | "icon";

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 active:bg-primary/95",
  secondary:
    "border border-border bg-card text-foreground shadow-sm hover:bg-secondary",
  outline: "border border-border bg-card text-foreground hover:bg-secondary",
  ghost: "text-foreground hover:bg-secondary",
  destructive:
    "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
  success: "bg-success text-success-foreground shadow-sm hover:bg-success/90",
};

const sizes: Record<Size, string> = {
  default: "h-12 px-5 text-base",
  lg: "h-14 px-6 text-lg",
  sm: "h-10 px-4 text-sm",
  icon: "h-12 w-12",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
