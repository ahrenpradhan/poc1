/**
 * Custom Button Component
 *
 * Wraps the shadcn primitive button with custom styling/behavior
 * Import primitives from ../primitives and customize here
 */

import { Button as PrimitiveButton } from "../primitives/button";
import type { ButtonProps as PrimitiveButtonProps } from "../primitives/button";

export interface ButtonProps extends PrimitiveButtonProps {
  // Add custom props here if needed
}

export function Button({ variant = "default", ...props }: ButtonProps) {
  return <PrimitiveButton variant={variant} {...props} />;
}

// Re-export types if needed
export type { PrimitiveButtonProps as ButtonVariant };
