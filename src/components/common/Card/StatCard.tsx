import React from "react";
import { TrendingUp } from "lucide-react";
import { cn } from "../../../lib/utils";

export interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: { value: string; positive: boolean };
    borderColor: string;
    bgColor?: string;
    className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    icon,
    trend,
    borderColor,
    bgColor = "bg-primary/10",
    className,
}) => (
    <div
        className={cn(
            "bg-surface p-4 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border-t-4",
            borderColor,
            className
        )}
    >
        <div className="flex justify-between items-start mb-3 sm:mb-4">
            <div className={cn("w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-primary", bgColor)}>
                {icon}
            </div>
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">{value}</div>
        <div className="text-xs sm:text-sm text-foreground-secondary">{title}</div>
        {trend && (
            <div
                className={cn(
                    "flex items-center gap-1 mt-2 text-xs",
                    trend.positive ? "text-success" : "text-error"
                )}
            >
                <TrendingUp
                    className={cn("w-3 h-3", !trend.positive && "rotate-180")}
                />
                {trend.value}
            </div>
        )}
    </div>
);

export default StatCard;
