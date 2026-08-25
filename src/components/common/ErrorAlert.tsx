import React from "react";
import { AlertCircle, XCircle } from "lucide-react";

interface ErrorAlertProps {
    error: string | null;
    onClear: () => void;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ error, onClear }) => {
    if (!error) return null;

    return (
        <div className="flex items-center gap-3 p-4 bg-error/10 border border-error/20 rounded-xl text-error animate-in">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium flex-1">{error}</p>
            <button
                onClick={onClear}
                className="text-error hover:text-error-light transition-colors"
            >
                <XCircle className="w-4 h-4" />
            </button>
        </div>
    );
};

export default ErrorAlert;
