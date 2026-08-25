import React from "react";
import { cn } from "../../../lib/utils";

interface ToggleProps {
    enabled: boolean;
    onChange: (value: boolean) => void;
    disabled?: boolean;
    size?: "sm" | "md" | "lg";
    className?: string;
}

const Toggle: React.FC<ToggleProps> = ({
    enabled,
    onChange,
    disabled = false,
    size = "md",
    className,
}) => {
    const sizes = {
        sm: {
            track: "w-8 h-4",
            thumb: "w-3 h-3",
            translateOn: "translate-x-4",
            translateOff: "translate-x-0.5",
        },
        md: {
            track: "w-11 h-6",
            thumb: "w-5 h-5",
            translateOn: "translate-x-5",
            translateOff: "translate-x-0.5",
        },
        lg: {
            track: "w-14 h-7",
            thumb: "w-6 h-6",
            translateOn: "translate-x-7",
            translateOff: "translate-x-0.5",
        },
    };

    const config = sizes[size];

    return (
        <button
            type="button"
            role="switch"
            aria-checked={enabled}
            disabled={disabled}
            onClick={() => !disabled && onChange(!enabled)}
            className={cn(
                "relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                config.track,
                enabled ? "bg-primary" : "bg-gray-300 dark:bg-gray-600",
                disabled && "opacity-50 cursor-not-allowed",
                className
            )}
        >
            <span
                aria-hidden="true"
                className={cn(
                    "pointer-events-none inline-block rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                    config.thumb,
                    enabled ? config.translateOn : config.translateOff
                )}
            />
        </button>
    );
};

export default Toggle;
