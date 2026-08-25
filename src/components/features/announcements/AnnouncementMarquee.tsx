import React, { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppSelector } from "../../../store/hooks";
import { Megaphone } from "lucide-react";
import { announcementService } from "../../../services/announcementService";
import { cn } from "../../../lib/utils";

const AnnouncementMarquee: React.FC = () => {
    const { refreshTrigger } = useAppSelector((state) => state.notification);
    const containerRef = useRef<HTMLDivElement>(null);

    const {
        data: announcements = [],
        isLoading: loading,
        error
    } = useQuery({
        queryKey: ["announcements-marquee", refreshTrigger],
        queryFn: async () => {
            const response = await announcementService.getEmployeeAnnouncements({
                limit: 10,
                page: 1,
            });
            // Filter out expired announcements
            return (response.announcements || []).filter(a => !a.isExpired);
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Log error if any
    useEffect(() => {
        if (error) {
            console.error("AnnouncementMarquee: Error fetching announcements:", error);
        }
    }, [error]);

    const [containerWidth, setContainerWidth] = useState(0);

    // Measure container width for seamless looping
    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.offsetWidth);
            }
        };

        // Initial measure
        updateWidth();

        // Listen for resize
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, [loading]); // Re-run if loading changes (content appears)

    if (loading) return null;
    if (error) return null;
    if (!announcements.length) return null;

    return (
        <div className="w-full bg-surface border border-primary/20 rounded-xl overflow-hidden shadow-sm relative mb-4">
            <div className="flex items-center h-12">
                {/* Label Section */}
                <div className="bg-primary/10 h-full px-4 flex items-center justify-center gap-2 z-10 border-r border-primary/20 shrink-0">
                    <Megaphone className="w-4 h-4 text-primary animate-pulse" />
                    <span className="text-sm font-bold text-primary hidden sm:inline-block">Announcements</span>
                </div>

                {/* Marquee Content */}
                <div ref={containerRef} className="flex-1 overflow-hidden relative h-full flex items-center bg-surface">
                    {/* Only render marquee if we have measured the container width/it's ready */}
                    {containerWidth > 0 && (
                        <div
                            className="flex whitespace-nowrap animate-marquee hover:pause-animation"
                            // Make speed dependent on total scroll width to keep visual speed consistent
                            style={{ animationDuration: `${Math.max(30, (announcements.length * 200 + containerWidth) / 50)}s` }}
                        >
                            {[0, 1].map((iteration) => (
                                <div key={iteration} className="flex items-center shrink-0">
                                    {/* Content Block */}
                                    <div className="flex items-center">
                                        {announcements.map((announcement, index) => (
                                            <div key={`${iteration}-${announcement.id}`} className="flex items-center">
                                                <div className="flex items-center px-6">
                                                    <span className={cn(
                                                        "w-2 h-2 rounded-full mr-3 shrink-0",
                                                        announcement.priority === 'high' ? "bg-error" :
                                                            announcement.priority === 'medium' ? "bg-warning" : "bg-info"
                                                    )} />
                                                    📢
                                                    <span className="text-sm font-medium text-foreground mr-2">
                                                        {announcement.title}:
                                                    </span>
                                                    <span className="text-sm text-foreground-secondary">
                                                        {announcement.content.length > 80 ? announcement.content.substring(0, 80) + "..." : announcement.content}
                                                    </span>
                                                </div>
                                                {/* Divider between items in the same iteration */}
                                                {index < announcements.length - 1 && (
                                                    <div className="h-4 w-px bg-border/60"></div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Spacer equal to container width to ensure "wait till it disappears" effect */}
                                    <div style={{ width: containerWidth }} className="shrink-0" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnnouncementMarquee;
