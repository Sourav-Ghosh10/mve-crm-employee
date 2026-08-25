import React from 'react';
import { useAppSelector } from '../../store/hooks';
import { selectIsLoading } from '../../store/slices/uiSlice';
import { cn } from '../../lib/utils';

const GlobalLoader: React.FC = () => {
    const isLoading = useAppSelector(selectIsLoading);

    React.useEffect(() => {
        if (isLoading) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isLoading]);

    if (!isLoading) return null;

    return (
        <div className={cn(
            "fixed z-[9999] flex items-center justify-center bg-background/60 transition-all animate-in",
            "top-[64px] left-0 right-0 bottom-0 md:left-[260px]"
        )}>
            <div className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-surface shadow-2xl border border-border/50">
                <div className="relative">
                    {/* Animated rings */}
                    <div className="w-16 h-16 rounded-full border-4 border-primary/20 animate-[spin_3s_linear_infinite]"></div>
                    <div className="absolute inset-0 w-16 h-16 rounded-full border-t-4 border-primary animate-spin"></div>
                    <div className="absolute inset-2 w-12 h-12 rounded-full border-b-4 border-accent animate-[spin_2s_linear_infinite_reverse]"></div>
                </div>

                <div className="flex flex-col items-center">
                    <h3 className="text-lg font-bold text-foreground tracking-tight">CodecIT</h3>
                    <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs text-foreground-secondary font-medium">Processing</span>
                        <span className="flex gap-0.5">
                            <span className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-1 h-1 bg-primary rounded-full animate-bounce"></span>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GlobalLoader;
