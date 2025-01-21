import { Root } from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";

import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
} from "react";

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
);

const Label = forwardRef<
  ElementRef<typeof Root>,
  ComponentPropsWithoutRef<typeof Root> & VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <Root ref={ref} className={`${labelVariants()} ${className}`} {...props} />
));
Label.displayName = Root.displayName;

export { Label };
