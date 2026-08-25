import React, { useState, useEffect, useCallback } from "react";
import {
    Receipt,
    Plus,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    RefreshCw,
    Trash2,
    Wallet,
    FileText,
    Upload,
    X,
    Sparkles,
    Edit2,
    Eye,
} from "lucide-react";
import Card from "../../components/common/Card/Card";
import StatCard from "../../components/common/Card/StatCard";
import Button from "../../components/common/Button/Button";
import Modal from "../../components/common/Modal/Modal";
import Input from "../../components/common/Input/Input";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import { cn, formatCurrency } from "../../lib/utils";
import { getErrorMessage } from "../../utils/errorHandlers";
import reimbursementService from "../../services/reimbursementService";
import {
    type Reimbursement,
    type ReimbursementStatus,
    type CreateReimbursementPayload,
    type ReimbursementType,
    type ReimbursementAttachment,
} from "../../types/reimbursement.types";

const ReimbursementPage: React.FC = () => {
    // State
    const [requests, setRequests] = useState<Reimbursement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Reimbursement Types
    const [reimbursementTypes, setReimbursementTypes] = useState<ReimbursementType[]>([]);
    const [selectedTypeData, setSelectedTypeData] = useState<ReimbursementType | null>(null);

    // Form Fields
    const [formType, setFormType] = useState<string>("");
    const [formTitle, setFormTitle] = useState("");
    const [formDescription, setFormDescription] = useState("");
    const [formAmount, setFormAmount] = useState("");
    const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);
    const [existingAttachments, setExistingAttachments] = useState<ReimbursementAttachment[]>([]);
    const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Delete & Edit State
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const isMounted = React.useRef(false);

    // Fetch Data
    const fetchTypes = useCallback(async () => {
        try {
            const response = await reimbursementService.getTypes();
            if (response.success) {
                setReimbursementTypes(response.data);
            }
        } catch (err) {
            console.error("Error fetching reimbursement types:", err);
        }
    }, []);

    const fetchRequests = useCallback(async () => {
        setError(null);
        try {
            const response = await reimbursementService.getMyRequests();
            if (response.success) {
                setRequests(response.data);
            } else {
                setError(response.message || "Failed to load reimbursements");
            }
        } catch (err) {
            console.error("Error fetching reimbursements:", err);
            setError("Unable to load reimbursements. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!isMounted.current) {
            fetchRequests();
            fetchTypes();
            isMounted.current = true;
        }
    }, [fetchRequests, fetchTypes]);

    const resetForm = () => {
        setFormType("");
        setFormTitle("");
        setFormDescription("");
        setFormAmount("");
        setFormDate(new Date().toISOString().split("T")[0]);
        setExistingAttachments([]);
        setAttachedFiles([]);
        if (fileInputRef.current) fileInputRef.current.value = "";
        setSubmitError(null);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        resetForm();
    };

    const handleEdit = (request: Reimbursement) => {
        setEditingId(request._id);
        const typeId = request.reimbursementTypeId || request.reimbursementType;
        setFormType(typeId);
        // Find and set the selected type data for validation rules
        const typeData = reimbursementTypes.find(t => t._id === typeId || t.name === typeId);
        setSelectedTypeData(typeData || null);

        setFormTitle(request.title);
        setFormDescription(request.description);
        setFormAmount(request.amount.toString());
        setFormDate(new Date(request.expenseDate).toISOString().split("T")[0]);
        setExistingAttachments(request.attachments || []);
        setIsModalOpen(true);
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTypeData || !formTitle || !formAmount || !formDate) {
            setSubmitError("Please fill in all required fields and select a valid category");
            return;
        }

        setIsSubmitting(true);
        setSubmitError(null);

        try {
            // Convert files to base64 to send in JSON body
            const base64Attachments = await Promise.all(
                attachedFiles.map(async (file) => ({
                    fileName: file.name,
                    fileUrl: await fileToBase64(file),
                }))
            );

            // Business rule validation
            if (selectedTypeData) {
                if (selectedTypeData.maxAmount && parseFloat(formAmount) > selectedTypeData.maxAmount) {
                    setSubmitError(`Maximum amount for ${selectedTypeData.name} is ${formatCurrency(selectedTypeData.maxAmount)}`);
                    setIsSubmitting(false);
                    return;
                }
                if (selectedTypeData.requiresReceipt && (attachedFiles.length + existingAttachments.length) === 0) {
                    setSubmitError(`A receipt/attachment is required for ${selectedTypeData.name} reimbursements`);
                    setIsSubmitting(false);
                    return;
                }
            }

            const payload: CreateReimbursementPayload = {
                reimbursementTypeId: selectedTypeData._id,
                reimbursementType: selectedTypeData.name,
                title: formTitle,
                description: formDescription,
                amount: parseFloat(formAmount),
                expenseDate: formDate,
                attachments: [
                    ...existingAttachments,
                    ...base64Attachments
                ].length > 0 ? [...existingAttachments, ...base64Attachments] : undefined,
            };

            const response = editingId
                ? await reimbursementService.update(editingId, payload)
                : await reimbursementService.create(payload);

            if (response.success) {
                handleCloseModal();
                fetchRequests();
            } else {
                // Safely check for nested error message from server
                const res = response as { error?: { message?: string }; message?: string };
                const errorMessage = res.error?.message || res.message || `Failed to ${editingId ? 'update' : 'submit'} reimbursement`;
                setSubmitError(errorMessage);
            }
        } catch (err) {
            console.error("Error submitting reimbursement:", err);
            setSubmitError(getErrorMessage(err, "An error occurred. Please try again."));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            // Validate file sizes (e.g., max 5MB per file)
            const oversized = newFiles.find(f => f.size > 1 * 1024 * 1024);
            if (oversized) {
                setSubmitError(`File ${oversized.name} exceeds 1MB limit`);
                return;
            }
            setAttachedFiles(prev => [...prev, ...newFiles]);
            setSubmitError(null);
        }
    };

    const removeFile = (index: number) => {
        setAttachedFiles(prev => prev.filter((_, i) => i !== index));
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const removeExistingFile = (index: number) => {
        setExistingAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleDelete = async () => {
        if (!deletingId) return;

        setIsDeleting(true);
        try {
            const response = await reimbursementService.delete(deletingId);
            if (response.success) {
                setRequests(requests.filter((r) => r._id !== deletingId));
                setDeletingId(null);
            }
        } catch (err) {
            console.error("Error deleting reimbursement:", err);
        } finally {
            setIsDeleting(false);
        }
    };

    const getStatusConfig = (status: ReimbursementStatus) => {
        switch (status) {
            case "approved":
                return {
                    icon: <CheckCircle className="w-4 h-4" />,
                    className: "bg-success/10 text-success",
                    label: "Approved",
                };
            case "rejected":
                return {
                    icon: <XCircle className="w-4 h-4" />,
                    className: "bg-error/10 text-error",
                    label: "Rejected",
                };
            case "cancelled":
                return {
                    icon: <Trash2 className="w-4 h-4" />,
                    className: "bg-muted text-foreground-secondary",
                    label: "Cancelled",
                };
            default:
                return {
                    icon: <Clock className="w-4 h-4" />,
                    className: "bg-warning/10 text-warning",
                    label: "Pending",
                };
        }
    };

    // Stats calculation
    const stats = {
        total: requests.length,
        pending: requests.filter((r) => r.status === "pending").length,
        approved: requests.filter((r) => r.status === "approved").length,
        totalAmount: requests
            .filter((r) => r.status === "approved")
            .reduce((sum, r) => sum + r.amount, 0),
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Reimbursements</h1>
                    <p className="text-foreground-secondary mt-1">
                        Manage and track your expense reimbursement requests.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={fetchRequests}
                        className="bg-surface/50 backdrop-blur-sm border-white/20 text-foreground hover:bg-white/20"
                        startIcon={<RefreshCw className="w-4 h-4" />}
                    >
                        Refresh
                    </Button>
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className="shadow-lg shadow-primary/20"
                        startIcon={<Plus className="w-4 h-4" />}
                    >
                        New Request
                    </Button>
                </div>
            </div>

            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-primary-dark p-6 sm:p-8 rounded-3xl text-white shadow-xl shadow-primary/20">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-xs font-medium backdrop-blur-md border border-white/20 mb-4">
                            <Sparkles className="w-3 h-3 text-accent" />
                            Expense Tracker
                        </div>
                        <h2 className="text-2xl sm:text-4xl font-bold mb-2">Need a Refund?</h2>
                        <p className="text-white/90 max-w-md text-sm sm:text-base font-medium">
                            Quickly submit your business expenses for reimbursement. Track your claims in real-time.
                        </p>
                    </div>
                    <div className="flex items-center gap-4 bg-white/20 p-4 rounded-2xl backdrop-blur-md border border-white/20 shadow-lg shrink-0">
                        <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
                            <Wallet className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-white/80 text-[10px] uppercase tracking-wider font-bold mb-1">Total Settled</p>
                            <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalAmount)}</p>
                        </div>
                    </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-48 h-48 bg-accent/20 rounded-full blur-3xl"></div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Requests"
                    value={stats.total}
                    icon={<FileText className="w-5 h-5 sm:w-6 sm:h-6" />}
                    borderColor="border-primary"
                    bgColor="bg-primary/10"
                />
                <StatCard
                    title="Pending Approvals"
                    value={stats.pending}
                    icon={<Clock className="w-5 h-5 sm:w-6 sm:h-6" />}
                    borderColor="border-warning"
                    bgColor="bg-warning/10"
                />
                <StatCard
                    title="Approved Claims"
                    value={stats.approved}
                    icon={<CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />}
                    borderColor="border-success"
                    bgColor="bg-success/10"
                />
                <StatCard
                    title="Rejected/Cancelled"
                    value={requests.length - stats.pending - stats.approved}
                    icon={<XCircle className="w-5 h-5 sm:w-6 sm:h-6" />}
                    borderColor="border-error"
                    bgColor="bg-error/10"
                />
            </div>

            <Card title="My Reimbursement Requests">
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <LoadingSpinner />
                    </div>
                ) : error ? (
                    <div className="text-center py-8">
                        <AlertCircle className="w-12 h-12 text-error mx-auto mb-3" />
                        <p className="text-error mb-4">{error}</p>
                        <Button variant="outline" onClick={fetchRequests}>Try Again</Button>
                    </div>
                ) : requests.length === 0 ? (
                    <EmptyState
                        icon={<Receipt className="w-16 h-16" />}
                        title="No reimbursements found"
                        description="You haven't submitted any reimbursement requests yet."
                        action={<Button onClick={() => setIsModalOpen(true)}>Create Request</Button>}
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="py-4 px-4 text-sm font-semibold text-foreground">Date</th>
                                    <th className="py-4 px-4 text-sm font-semibold text-foreground">Title & Type</th>
                                    <th className="py-4 px-4 text-sm font-semibold text-foreground">Amount</th>
                                    <th className="py-4 px-4 text-sm font-semibold text-foreground">Status</th>
                                    <th className="py-4 px-4 text-sm font-semibold text-foreground text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map((request) => {
                                    const status = getStatusConfig(request.status);
                                    return (
                                        <tr key={request._id} className="border-b border-border hover:bg-muted/30 transition-colors">
                                            <td className="py-4 px-4 text-sm text-foreground">
                                                {new Date(request.expenseDate).toLocaleDateString()}
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-foreground">{request.title}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-foreground-secondary capitalize">{request.reimbursementType}</span>
                                                        {request.attachments && request.attachments.length > 0 && (
                                                            <span className="inline-flex items-center gap-1 text-[10px] bg-muted px-1.5 py-0.5 rounded text-foreground-tertiary">
                                                                <FileText className="w-3 h-3" />
                                                                {request.attachments.length}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-sm font-bold text-foreground">
                                                {formatCurrency(request.amount)}
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className={cn(
                                                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium relative group",
                                                    status.className
                                                )}>
                                                    {status.icon}
                                                    {status.label}
                                                    {request.status === "rejected" && (request.approval?.rejectionReason || request.rejectionReason) && (
                                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-white text-[10px] rounded-lg shadow-xl opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-center border border-white/10 backdrop-blur-md">
                                                            <p className="font-bold mb-1 border-b border-white/10 pb-1">Rejection Reason</p>
                                                            {request.approval?.rejectionReason || request.rejectionReason}
                                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
                                                        </div>
                                                    )}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                {request.status === "pending" && (
                                                    <div className="flex justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleEdit(request)}
                                                            className="text-primary hover:bg-primary/10 p-2"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setDeletingId(request._id)}
                                                            className="text-error hover:bg-error/10 p-2"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            <Modal
                open={isModalOpen}
                onClose={handleCloseModal}
                title={editingId ? "Edit Reimbursement Request" : "Request Reimbursement"}
                maxWidth="md"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    {submitError && (
                        <div className="p-4 bg-error/10 border border-error/20 rounded-lg flex items-center gap-3 text-error text-sm">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            {submitError}
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground">Title *</label>
                            <Input
                                placeholder="Business Lunch with Client"
                                value={formTitle}
                                onChange={(e) => setFormTitle(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground">Type *</label>
                            <select
                                className="w-full flex h-11 rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer disabled:opacity-50 disabled:bg-muted"
                                value={formType}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setFormType(val);
                                    const typeData = reimbursementTypes.find(t => t._id === val || t.name === val);
                                    setSelectedTypeData(typeData || null);
                                }}
                                required
                                disabled={reimbursementTypes.length === 0}
                            >
                                <option value="">Select Type</option>
                                {reimbursementTypes.map((type) => (
                                    <option key={type._id} value={type._id}>{type.name}</option>
                                ))}
                            </select>
                            {reimbursementTypes.length === 0 && !isLoading && (
                                <p className="text-xs text-error mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    No reimbursement types available. Please contact admin.
                                </p>
                            )}
                            {selectedTypeData && (
                                <div className="mt-2 p-2 bg-info/5 border border-info/10 rounded-lg space-y-1">
                                    {selectedTypeData.description && (
                                        <p className="text-[11px] text-foreground-secondary italic">
                                            {selectedTypeData.description}
                                        </p>
                                    )}
                                    <div className="flex flex-wrap gap-2">
                                        {selectedTypeData.maxAmount && (
                                            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
                                                Max: {formatCurrency(selectedTypeData.maxAmount)}
                                            </span>
                                        )}
                                        {selectedTypeData.requiresReceipt && (
                                            <span className="text-[10px] bg-warning/10 text-warning px-1.5 py-0.5 rounded font-medium">
                                                Receipt Required
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground">
                                Amount * {selectedTypeData?.maxAmount && <span className="text-[10px] text-primary">(Max: {formatCurrency(selectedTypeData.maxAmount)})</span>}
                            </label>
                            <Input
                                type="number"
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                max={selectedTypeData?.maxAmount}
                                value={formAmount}
                                onChange={(e) => setFormAmount(e.target.value)}
                                className={cn(
                                    selectedTypeData?.maxAmount && parseFloat(formAmount) > selectedTypeData.maxAmount && "border-error focus:ring-error"
                                )}
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground">Expense Date *</label>
                            <Input
                                type="date"
                                value={formDate}
                                onChange={(e) => setFormDate(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">Description</label>
                        <textarea
                            className="w-full flex min-h-[100px] rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                            placeholder="Provide more details about the expense..."
                            value={formDescription}
                            onChange={(e) => setFormDescription(e.target.value)}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">
                            Attachments (Max 1MB per file) {selectedTypeData?.requiresReceipt && <span className="text-error">*</span>}
                        </label>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            multiple
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        />

                        <div className="grid grid-cols-1 gap-3">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-border rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all group"
                            >
                                <Upload className="w-5 h-5 text-foreground-tertiary group-hover:text-primary transition-colors" />
                                <span className="text-sm text-foreground-secondary group-hover:text-primary font-medium">
                                    Add Receipts
                                </span>
                            </button>

                            {/* Existing Attachments */}
                            {existingAttachments.map((file, idx) => (
                                <div key={`existing-${idx}`} className="flex items-center justify-between p-3 border border-border rounded-xl bg-primary/5">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                            <FileText className="w-5 h-5 text-primary" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-medium text-foreground truncate">
                                                {file.fileName}
                                            </p>
                                            <p className="text-[10px] text-primary">
                                                Previously uploaded
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <a
                                            href={file.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-1.5 hover:bg-muted rounded-full text-primary transition-colors"
                                            title="View Attachment"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </a>
                                        <button
                                            type="button"
                                            onClick={() => removeExistingFile(idx)}
                                            className="p-1.5 hover:bg-muted rounded-full text-foreground-tertiary hover:text-error transition-colors"
                                            title="Remove"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {/* New Uploads */}
                            {attachedFiles.map((file, idx) => (
                                <div key={`new-${idx}`} className="flex items-center justify-between p-3 border border-border rounded-xl bg-muted/30">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                            <FileText className="w-5 h-5 text-primary" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-medium text-foreground truncate">
                                                {file.name}
                                            </p>
                                            <p className="text-[10px] text-foreground-secondary">
                                                {(file.size / 1024).toFixed(1)} KB
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeFile(idx)}
                                        className="p-1.5 hover:bg-muted rounded-full text-foreground-tertiary hover:text-error transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <Button variant="outline" type="button" onClick={handleCloseModal} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || (reimbursementTypes.length === 0 && !editingId)}
                        >
                            {isSubmitting ? (editingId ? "Updating..." : "Submitting...") : (editingId ? "Update Request" : "Submit Request")}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                open={!!deletingId}
                onClose={() => setDeletingId(null)}
                title="Cancel Request"
                maxWidth="sm"
            >
                <div className="text-center py-4">
                    <div className="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <p className="text-foreground-secondary mb-6">
                        Are you sure you want to cancel this reimbursement request? This action cannot be undone.
                    </p>
                    <div className="flex justify-center gap-3">
                        <Button variant="outline" onClick={() => setDeletingId(null)} disabled={isDeleting}>
                            No, Keep It
                        </Button>
                        <Button
                            className="bg-error hover:bg-error/90 text-white"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Cancelling..." : "Yes, Cancel"}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ReimbursementPage;
