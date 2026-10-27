import React, { useState, useEffect } from "react";
import Button from "../common/Button";
import Input from "../common/Input";
import type { Announcement } from "../../types/announcement.types";

export interface AnnouncementFormProps {
    initialValues?: Announcement | null;
    isEditMode?: boolean;
    onSubmit: (data: any) => Promise<void> | void;
    onCancel: () => void;
    isLoading?: boolean;
    departmentOptions?: { value: string; label: string }[];
    locationOptions?: { value: string; label: string }[];
    isLoadingOptions?: boolean;
    error?: string | string[] | null;
}

const AnnouncementForm: React.FC<AnnouncementFormProps> = ({
    initialValues,
    isEditMode = false,
    onSubmit,
    onCancel,
    isLoading = false,
    departmentOptions = [],
    locationOptions = [],
    isLoadingOptions = false,
    error,
}) => {
    const [title, setTitle] = useState(initialValues?.title || "");
    const [content, setContent] = useState(initialValues?.content || "");
    const [priority, setPriority] = useState<string>(initialValues?.priority || "medium");
    const [category, setCategory] = useState<string>(initialValues?.category || "general");
    const [publishDate, setPublishDate] = useState(initialValues?.publishDate ? initialValues.publishDate.split("T")[0] : "");
    const [publishTime, setPublishTime] = useState("");
    const [expiryDate, setExpiryDate] = useState(initialValues?.expiryDate ? initialValues.expiryDate.split("T")[0] : "");
    const [deadlineTime, setDeadlineTime] = useState(initialValues?.deadlineTime || "");
    const [acknowledgmentRequired, setAcknowledgmentRequired] = useState(initialValues?.acknowledgmentRequired ?? false);
    const [isGlobalEvent, setIsGlobalEvent] = useState(initialValues?.isGlobalEvent ?? false);
    const [selectedDepartments, setSelectedDepartments] = useState<string[]>(initialValues?.targetAudience?.departments || []);
    const [selectedLocations, setSelectedLocations] = useState<string[]>(initialValues?.targetAudience?.locations || []);

    useEffect(() => {
        if (initialValues) {
            setTitle(initialValues.title || "");
            setContent(initialValues.content || "");
            setPriority(initialValues.priority || "medium");
            setCategory(initialValues.category || "general");
            setPublishDate(initialValues.publishDate ? initialValues.publishDate.split("T")[0] : "");
            setExpiryDate(initialValues.expiryDate ? initialValues.expiryDate.split("T")[0] : "");
            setDeadlineTime(initialValues.deadlineTime || "");
            setAcknowledgmentRequired(initialValues.acknowledgmentRequired ?? false);
            setIsGlobalEvent(initialValues.isGlobalEvent ?? false);
            setSelectedDepartments(initialValues.targetAudience?.departments || []);
            setSelectedLocations(initialValues.targetAudience?.locations || []);
        }
    }, [initialValues]);

    const handleDepartmentToggle = (value: string) => {
        setSelectedDepartments((prev) =>
            prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value]
        );
    };

    const handleLocationToggle = (value: string) => {
        setSelectedLocations((prev) =>
            prev.includes(value) ? prev.filter((l) => l !== value) : [...prev, value]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            title,
            content,
            priority,
            category,
            publishDate: publishDate || undefined,
            publishTime: publishTime || undefined,
            expiryDate: expiryDate || undefined,
            deadlineTime: deadlineTime || undefined,
            acknowledgmentRequired,
            isGlobalEvent,
            targetAudience: {
                departments: selectedDepartments,
                locations: selectedLocations,
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 rounded-lg text-sm">
                    {Array.isArray(error) ? error.join(", ") : error}
                </div>
            )}

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Title *</label>
                    <Input
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Announcement Title"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Content *</label>
                    <textarea
                        required
                        rows={4}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Write your announcement content here..."
                        className="w-full px-3 py-2 border rounded-md bg-background border-border focus:ring-1 focus:ring-primary outline-none"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Priority</label>
                        <select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md bg-background border-border focus:ring-1 focus:ring-primary outline-none"
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Category</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md bg-background border-border focus:ring-1 focus:ring-primary outline-none"
                        >
                            <option value="general">General</option>
                            <option value="holiday">Holiday</option>
                            <option value="event">Event</option>
                            <option value="policy">Policy</option>
                            <option value="emergency">Emergency</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Publish Date</label>
                        <Input
                            type="date"
                            value={publishDate}
                            onChange={(e) => setPublishDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Publish Time</label>
                        <Input
                            type="time"
                            value={publishTime}
                            onChange={(e) => setPublishTime(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Expiry Date</label>
                        <Input
                            type="date"
                            value={expiryDate}
                            onChange={(e) => setExpiryDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Deadline Time</label>
                        <Input
                            type="time"
                            value={deadlineTime}
                            onChange={(e) => setDeadlineTime(e.target.value)}
                        />
                    </div>
                </div>

                {!isGlobalEvent && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Target Departments {isLoadingOptions && "(Loading...)"}
                            </label>
                            <div className="max-h-36 overflow-y-auto border rounded-md p-2 space-y-1 bg-background border-border">
                                {departmentOptions.map((opt) => (
                                    <label key={opt.value} className="flex items-center gap-2 text-xs cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedDepartments.includes(opt.value)}
                                            onChange={() => handleDepartmentToggle(opt.value)}
                                        />
                                        <span>{opt.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Target Locations {isLoadingOptions && "(Loading...)"}
                            </label>
                            <div className="max-h-36 overflow-y-auto border rounded-md p-2 space-y-1 bg-background border-border">
                                {locationOptions.map((opt) => (
                                    <label key={opt.value} className="flex items-center gap-2 text-xs cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedLocations.includes(opt.value)}
                                            onChange={() => handleLocationToggle(opt.value)}
                                        />
                                        <span>{opt.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={acknowledgmentRequired}
                            onChange={(e) => setAcknowledgmentRequired(e.target.checked)}
                            className="rounded border-border text-primary focus:ring-primary"
                        />
                        <span className="text-sm font-medium">Require Employee Acknowledgment</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={isGlobalEvent}
                            onChange={(e) => setIsGlobalEvent(e.target.checked)}
                            className="rounded border-border text-primary focus:ring-primary"
                        />
                        <span className="text-sm font-medium">Global Announcement (All Employees)</span>
                    </label>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" isLoading={isLoading} disabled={isLoading}>
                    {isEditMode ? "Update Announcement" : "Create Announcement"}
                </Button>
            </div>
        </form>
    );
};

export default AnnouncementForm;
