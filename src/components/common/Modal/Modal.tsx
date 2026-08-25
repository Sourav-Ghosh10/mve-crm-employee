import React, { useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "../../../lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
  isDismissible?: boolean;
}


const maxWidthClasses = {
  xs: "max-w-xs",
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
};

const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = "sm",
  isDismissible = true,
}) => {

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && isDismissible) {
        onClose();
      }

    },
    [onClose, isDismissible],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [open, handleEscape]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in"
        onClick={isDismissible ? onClose : undefined}
        aria-hidden="true"
      />


      {/* Modal content */}
      <div
        className={cn(
          "relative bg-surface rounded-lg shadow-lg w-full mx-4 animate-in",
          maxWidthClasses[maxWidth],
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2
            id="modal-title"
            className="text-lg font-semibold text-foreground"
          >
            {title}
          </h2>
          {isDismissible && (
            <button
              onClick={onClose}
              className="p-1 rounded-md text-foreground-secondary hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>


        {/* Body */}
        <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          {children}
        </div>

        {/* Footer/Actions */}
        {actions && (
          <div className="flex items-center justify-end gap-2 p-4 border-t border-border">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
