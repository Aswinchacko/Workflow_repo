import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "h-12 w-full rounded-lg border border-input bg-card px-4 text-base outline-none transition focus-visible:ring-2 focus-visible:ring-ring placeholder:text-muted-foreground",
        className
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "min-h-[88px] w-full rounded-lg border border-input bg-card px-4 py-3 text-base outline-none transition focus-visible:ring-2 focus-visible:ring-ring placeholder:text-muted-foreground",
        className
      )}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={cn(
        "h-12 w-full rounded-lg border border-input bg-card px-4 text-base outline-none transition focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
});
Select.displayName = "Select";

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("mb-1.5 block text-sm font-semibold text-foreground", className)}
      {...props}
    />
  );
}
