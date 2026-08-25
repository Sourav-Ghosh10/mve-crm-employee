import { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatInTimezone } from "../../utils/timezone";
import { Bell, Eye, CheckCircle2 } from "lucide-react";
import { announcementService } from "../../services/announcementService";
import type { Announcement } from "../../types/announcement.types";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState/EmptyState";
import Button from "../../components/common/Button/Button";
import Modal from "../../components/common/Modal/Modal";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { resetAllCounts } from "../../store/slices/notificationSlice";

const Announcements = () => {
    const dispatch = useAppDispatch();
    const [page, setPage] = useState(1);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
    const limit = 10;

    const { refreshTrigger } = useAppSelector((state) => state.notification);
    const hasMarkedRef = useRef(false);

    const {
        data,
        isLoading: loading,
        error,
        refetch
    } = useQuery({
        queryKey: ["announcements-list", page, refreshTrigger],
        queryFn: async () => {
            const result = await announcementService.getEmployeeAnnouncements({ page, limit });
            return result;
        },
        staleTime: 5 * 60 * 1000,
    });

    // Log error if any
    useEffect(() => {
        if (error) {
            console.error("AnnouncementsPage: Error fetching announcements:", error);
        }
    }, [error]);

    const announcements = data?.announcements || [];
    const totalPages = data?.pagination?.totalPages || 1;

    // Handle marking all as read once on initial load
    useEffect(() => {
        if (!loading && announcements.length > 0 && page === 1 && !hasMarkedRef.current) {
            const markItemsRead = async () => {
                try {
                    await announcementService.markAllRead();
                    dispatch(resetAllCounts());
                    hasMarkedRef.current = true;
                } catch (err) {
                    console.error("Failed to mark all as read", err);
                }
            };
            markItemsRead();
        }
    }, [loading, announcements.length, page, dispatch]);

    // Removed redundant declaration

    const handleAcknowledge = async (id: string) => {
        try {
            await announcementService.acknowledge(id);
            // Invalidate queries to refresh the list
            refetch();
        } catch (error) {
            console.error("Failed to acknowledge announcement", error);
        }
    };

    const getExpiryStatus = (expiryDate: string | null) => {
        if (!expiryDate) return "No Expiry";
        const now = new Date();
        const expiry = new Date(expiryDate);

        // Compare only dates, not times
        const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const expiryDateOnly = new Date(expiry.getFullYear(), expiry.getMonth(), expiry.getDate());

        if (expiryDateOnly < todayDate) return "Expired";

        const diffTime = expiryDateOnly.getTime() - todayDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return "Expires Today";

        if (diffDays >= 7) {
            const weeks = Math.floor(diffDays / 7);
            return `Expires in ${weeks} ${weeks === 1 ? 'week' : 'weeks'}`;
        }
        return `Expires in ${diffDays} ${diffDays === 1 ? 'day' : 'days'}`;
    };

    // Helper to determine if an announcement is expired
    const isExpired = (expiryDate: string | null) => {
        if (!expiryDate) return false;
        const now = new Date();
        const expiry = new Date(expiryDate);

        // Compare only dates, not times
        const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const expiryDateOnly = new Date(expiry.getFullYear(), expiry.getMonth(), expiry.getDate());

        return expiryDateOnly < todayDate;
    };

    const getFormattedDate = (dateString?: string) => {
        if (!dateString) return "Recently";
        try {
            return formatInTimezone(new Date(dateString), {
                day: "numeric",
                month: "short",
                year: "numeric"
            });
        } catch (_e) {
            return "Recently";
        }
    };

    if (loading && announcements.length === 0) {
        return <LoadingSpinner fullScreen />;
    }

    return (
        <div className="p-2 sm:p-0 min-h-fit space-y-8 animate-in fade-in duration-700">
            <header className="flex flex-col gap-1">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Announcements</h1>
                <p className="text-slate-500">Stay updated with the latest company news and updates.</p>
            </header>

            {announcements.length === 0 && !loading ? (
                <div className="flex items-center justify-center h-[70dvh]">
                    <EmptyState
                        icon={<Bell className="w-16 h-16 text-slate-300" />}
                        title="No Announcements"
                        description="You are all caught up! There are no new announcements for you."
                    />
                </div>
            ) : (
                <div className="bg-white rounded-[2rem] shadow-[0_4px_20px_0_rgba(0,0,0,0.03)] border border-slate-100/50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-slate-400 text-[13px] font-medium tracking-wide">
                                    <th className="px-10 py-8 font-medium">Announcements</th>
                                    <th className="px-10 py-8 font-medium">Category</th>
                                    <th className="px-10 py-8 font-medium">Priority</th>
                                    <th className="px-10 py-8 font-medium">Status</th>
                                    <th className="px-10 py-8 font-medium">Published By</th>
                                    <th className="px-10 py-8 font-medium">Publication Date</th>
                                    <th className="px-10 py-8 font-medium text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {announcements.map((announcement) => (
                                    <tr key={announcement.id} className="group hover:bg-slate-50/30 transition-all duration-300">
                                        <td className="px-10 py-6">
                                            <div className="flex flex-col gap-1">
                                                <span className="font-semibold text-slate-800 text-[15px] leading-snug">
                                                    {announcement.title}
                                                </span>
                                                <span className="text-xs text-slate-500 line-clamp-1 max-w-[200px]">
                                                    {announcement.content}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 whitespace-nowrap">
                                            <span className={`px-3 py-1.5 rounded-full text-[12px] font-semibold capitalize tracking-tight ${announcement.category === 'holiday' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                                                announcement.category === 'policy' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                                    announcement.category === 'event' ? 'bg-purple-50 text-purple-600 border border-purple-100' :
                                                        'bg-slate-50 text-slate-600 border border-slate-100'
                                                }`}>
                                                {announcement.category}
                                            </span>
                                        </td>
                                        <td className="px-10 py-6 whitespace-nowrap">
                                            <span className={`px-3 py-1.5 rounded-full text-[12px] font-semibold capitalize tracking-tight ${announcement.priority === 'high' ? 'bg-red-50 text-red-600 border border-red-100' :
                                                announcement.priority === 'medium' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                                    'bg-blue-50 text-blue-600 border border-blue-100'
                                                }`}>
                                                {announcement.priority}
                                            </span>
                                        </td>
                                        <td className="px-10 py-6 whitespace-nowrap">
                                            <span className={`text-[13px] font-medium ${getExpiryStatus(announcement.expiryDate) === 'Expired' ? 'text-red-500' : 'text-slate-600'
                                                }`}>
                                                {getExpiryStatus(announcement.expiryDate)}
                                            </span>
                                        </td>
                                        <td className="px-10 py-6 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-[11px] font-bold text-slate-600 shadow-sm">
                                                    {announcement.publishedBy.name.split(' ').map((n: string) => n[0]).join('')}
                                                </div>
                                                <span className="text-[13px] text-slate-600 font-semibold">
                                                    {announcement.publishedBy.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 whitespace-nowrap text-[13px] text-slate-500 font-medium tracking-tight">
                                            {getFormattedDate(announcement.createdAt)}
                                        </td>
                                        <td className="px-10 py-6 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    onClick={() => setSelectedAnnouncement(announcement)}
                                                    className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all duration-200"
                                                    title="View Details"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                {announcement.acknowledgmentRequired && !isExpired(announcement.expiryDate) && (
                                                    <button
                                                        onClick={() => !announcement.isAcknowledged && handleAcknowledge(announcement.id)}
                                                        disabled={announcement.isAcknowledged}
                                                        className={`px-4 py-2 rounded-xl text-[12px] font-bold transition-all duration-300 flex items-center gap-1.5 ${announcement.isAcknowledged
                                                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100 cursor-default"
                                                            : "bg-primary text-white hover:bg-primary/90 active:scale-95 shadow-md shadow-primary/20"
                                                            }`}
                                                    >
                                                        {announcement.isAcknowledged ? (
                                                            <>
                                                                <CheckCircle2 size={14} />
                                                                Acknowledged
                                                            </>
                                                        ) : (
                                                            "Acknowledge"
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {totalPages > 1 && (
                <div className="flex justify-center items-center mt-12 gap-4">
                    <Button
                        variant="ghost"
                        disabled={page === 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className="rounded-2xl px-8 py-6 h-auto text-slate-500 hover:bg-white hover:shadow-sm"
                    >
                        Previous
                    </Button>
                    <div className="flex gap-3">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPage(p)}
                                className={`w-12 h-12 rounded-2xl font-bold transition-all text-sm ${page === p
                                    ? "bg-primary text-white shadow-xl shadow-primary/25"
                                    : "text-slate-400 hover:bg-white hover:text-slate-600 hover:shadow-sm"
                                    }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                    <Button
                        variant="ghost"
                        disabled={page === totalPages}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        className="rounded-2xl px-8 py-6 h-auto text-slate-500 hover:bg-white hover:shadow-sm"
                    >
                        Next
                    </Button>
                </div>
            )}

            <Modal
                open={!!selectedAnnouncement}
                onClose={() => setSelectedAnnouncement(null)}
                title="Announcement Details"
                maxWidth="md"
            >
                {selectedAnnouncement && (
                    <div className="space-y-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold text-slate-900">{selectedAnnouncement.title}</h3>
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <span>Published by {selectedAnnouncement.publishedBy.name}</span>
                                    <span>•</span>
                                    <span>{getFormattedDate(selectedAnnouncement.createdAt)}</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${selectedAnnouncement.priority === 'high' ? 'bg-red-50 text-red-600 border border-red-100' :
                                    selectedAnnouncement.priority === 'medium' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                        'bg-blue-50 text-blue-600 border border-blue-100'
                                    }`}>
                                    {selectedAnnouncement.priority} Priority
                                </span>
                                <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${selectedAnnouncement.category === 'holiday' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                                    selectedAnnouncement.category === 'policy' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                        'bg-slate-50 text-slate-600 border border-slate-100'
                                    }`}>
                                    {selectedAnnouncement.category}
                                </span>
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-slate-700 leading-relaxed whitespace-pre-wrap">
                            {selectedAnnouncement.content}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                            <div className="text-sm">
                                <span className="text-slate-500 font-medium">Status: </span>
                                <span className={getExpiryStatus(selectedAnnouncement.expiryDate) === 'Expired' ? 'text-red-500 font-bold' : 'text-slate-900 font-bold'}>
                                    {getExpiryStatus(selectedAnnouncement.expiryDate)}
                                </span>
                            </div>

                            <div className="flex gap-3">
                                {selectedAnnouncement.acknowledgmentRequired && !selectedAnnouncement.isAcknowledged && !isExpired(selectedAnnouncement.expiryDate) && (
                                    <Button
                                        onClick={() => {
                                            handleAcknowledge(selectedAnnouncement.id);
                                            setSelectedAnnouncement(null);
                                        }}
                                        className="rounded-xl px-6"
                                    >
                                        Acknowledge
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    onClick={() => setSelectedAnnouncement(null)}
                                    className="rounded-xl px-6 border border-slate-200"
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Announcements;
