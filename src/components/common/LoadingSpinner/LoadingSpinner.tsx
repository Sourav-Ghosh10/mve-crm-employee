import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../../lib/utils";

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-8 h-8",
  lg: "w-12 h-12",
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message,
  fullScreen = false,
  size = "md",
}) => {
  return (
    <div
      className={cn(
        "flex flex-col justify-center items-center gap-3",
        fullScreen ? "h-screen w-full" : "h-full w-full min-h-[200px]",
      )}
    >
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {message && (
        <p className="text-sm text-foreground-secondary">{message}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
