import React, { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-primary to-primary-dark text-white hover:shadow-primary",
        destructive: "bg-error text-white hover:bg-error-light",
        outline:
          "border-2 border-primary bg-transparent text-primary hover:bg-primary/10",
        secondary: "bg-muted text-foreground hover:bg-muted/80",
        secondaryOutline: "border border-border bg-transparent text-foreground hover:bg-muted",
        destructiveOutline: "border border-error bg-transparent text-error hover:bg-error/10",
        ghost: "hover:bg-muted hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2.5 text-sm",
        sm: "h-8 px-3 py-1.5 text-xs",
        lg: "h-12 px-8 py-3 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      startIcon,
      endIcon,
      fullWidth,
      loading,
      isLoading,
      children,
      ...props
    },
    ref,
  ) => {
    const isButtonLoading = loading || isLoading;
    return (
      <button
        ref={ref}
        className={cn(
          buttonVariants({ variant, size }),
          fullWidth && "w-full",
          className,
        )}
        disabled={props.disabled || isButtonLoading}
        {...props}
      >
        {isButtonLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          startIcon && <span className="shrink-0">{startIcon}</span>
        )}
        {children}
        {endIcon && <span className="shrink-0">{endIcon}</span>}
      </button>
    );
  },
);

Button.displayName = "Button";

export default Button;
