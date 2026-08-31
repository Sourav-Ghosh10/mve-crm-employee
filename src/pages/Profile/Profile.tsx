import React, { useState, useEffect } from "react";
import {
    User,
    Mail,
    Phone,
    Briefcase,
    Building2,
    Calendar,
    Edit2,
    Camera,
    Shield,
    Clock,
    Award,
    Save,
    X,
    Loader2,
    CheckCircle,
    AlertCircle,
} from "lucide-react";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { updateUser } from "../../store/slices/authSlice";
import { userService } from "../../services/userService";
import { organizationService } from "../../services/organizationService";
import type { Department, Designation } from "../../types/organization.types";
import Card from "../../components/common/Card/Card";
import Button from "../../components/common/Button/Button";
import { cn } from "../../lib/utils";

interface StatItem {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
}

interface FormData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    department: string;
    designation: string;
    location: string;
    dateOfBirth: string;
    panNumber: string;
    address: {
        street: string;
        city: string;
        state: string;
        country: string;
        zipCode: string;
    };
    emergencyContact: {
        name: string;
        relationship: string;
        phone: string;
    };
}

const Profile: React.FC = () => {
    const dispatch = useAppDispatch();
    const user = useAppSelector((s) => s.auth.user);

    const [departments, setDepartments] = useState<Department[]>([]);
    const [designations, setDesignations] = useState<Designation[]>([]);

    useEffect(() => {
        const fetchOrgData = async () => {
            try {
                const [deptRes, desigRes] = await Promise.all([
                    organizationService.getDepartments(),
                    organizationService.getDesignations()
                ]);
                setDepartments(deptRes.data);
                setDesignations(desigRes.data);
            } catch (error) {
                console.error("Failed to fetch organization data:", error);
            }
        };
        fetchOrgData();
    }, []);

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    // Form state for editing
    const [formData, setFormData] = useState<FormData>({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        department: "",
        designation: "",
        location: "",
        dateOfBirth: "",
        panNumber: "",
        address: {
            street: "",
            city: "",
            state: "",
            country: "",
            zipCode: "",
        },
        emergencyContact: {
            name: "",
            relationship: "",
            phone: "",
        },
    });

    // Validation errors
    const [errors, setErrors] = useState<any>({});

    // Sync form data with user data
    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                email: user.email || "",
                phone: user.phone || (user as any).phone || "",
                department: user.department || "",
                designation: user.designation || "",
                location: user.location || "",
                dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : "",
                panNumber: user.panNumber || "",
                address: {
                    street: user.address?.street || "",
                    city: user.address?.city || "",
                    state: user.address?.state || "",
                    country: user.address?.country || "",
                    zipCode: user.address?.zipCode || "",
                },
                emergencyContact: {
                    name: user.emergencyContact?.name || "",
                    relationship: user.emergencyContact?.relationship || "",
                    phone: user.emergencyContact?.phone || "",
                },
            });
        }
    }, [user]);

    const stats: StatItem[] = [
        {
            label: "Days Present",
            value: 22,
            icon: <Clock className="w-5 h-5" />,
            color: "text-success bg-success/10",
        },
        {
            label: "Leave Taken",
            value: 5,
            icon: <Calendar className="w-5 h-5" />,
            color: "text-warning bg-warning/10",
        },
        {
            label: "Overtime Hours",
            value: "12h",
            icon: <Award className="w-5 h-5" />,
            color: "text-primary bg-primary/10",
        },
        {
            label: "Performance",
            value: "A+",
            icon: <Shield className="w-5 h-5" />,
            color: "text-info bg-info/10",
        },
    ];

    const getInitials = () => {
        const first = formData.firstName || user?.firstName || "";
        const last = formData.lastName || user?.lastName || "";
        if (first && last) {
            return `${first[0]}${last[0]}`.toUpperCase();
        }
        return "U";
    };

    const getAvatarColor = () => {
        const colors = [
            "from-blue-500 to-blue-600",
            "from-purple-500 to-purple-600",
            "from-emerald-500 to-emerald-600",
            "from-orange-500 to-orange-600",
            "from-pink-500 to-pink-600",
            "from-cyan-500 to-cyan-600",
        ];
        const name = `${formData.firstName || ""}${formData.lastName || ""}`;
        const index = name.length % colors.length;
        return colors[index];
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData((prev: any) => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev: any) => ({ ...prev, [name]: undefined }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: any = {};

        // Personal Info
        if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
        if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Invalid email format";
        }
        if (!formData.phone.trim()) {
            newErrors.phone = "Phone number is required";
        } else if (!/^[\d\s\-+()]*$/.test(formData.phone)) {
            newErrors.phone = "Invalid phone number format";
        }
        if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";

        // Employment - Designation and Department
        if (!formData.designation) newErrors.designation = "Designation is required";
        if (!formData.department) newErrors.department = "Department is required";

        // Address
        if (!formData.address.street.trim()) newErrors["address.street"] = "Street is required";
        if (!formData.address.city.trim()) newErrors["address.city"] = "City is required";
        if (!formData.address.state.trim()) newErrors["address.state"] = "State is required";
        if (!formData.address.country.trim()) newErrors["address.country"] = "Country is required";
        if (!formData.address.zipCode.trim()) newErrors["address.zipCode"] = "Zip Code is required";

        // Emergency Contact
        if (!formData.emergencyContact.name.trim()) newErrors["emergencyContact.name"] = "Contact name is required";
        if (!formData.emergencyContact.relationship.trim()) newErrors["emergencyContact.relationship"] = "Relationship is required";
        if (!formData.emergencyContact.phone.trim()) {
            newErrors["emergencyContact.phone"] = "Emergency phone is required";
        } else if (!/^[\d\s\-+()]*$/.test(formData.emergencyContact.phone)) {
            newErrors["emergencyContact.phone"] = "Invalid phone format";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) return;
        if (!user) return;

        setIsSaving(true);
        setSaveError(null);

        try {
            // Update user via API
            const updatedUser = await userService.update(user.id, formData, { skipLoading: true } as any);

            // Update user in Redux store
            dispatch(updateUser(updatedUser));

            setSaveSuccess(true);
            setIsEditing(false);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            console.error("Failed to update profile:", error);
            setSaveError("Failed to save profile. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        // Reset form to original user data
        if (user) {
            setFormData({
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                email: user.email || "",
                phone: user.phone || "",
                department: user.department || "",
                designation: user.designation || "",
                location: user.location || "",
                dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : "",
                panNumber: user.panNumber || "",
                address: {
                    street: user.address?.street || "",
                    city: user.address?.city || "",
                    state: user.address?.state || "",
                    country: user.address?.country || "",
                    zipCode: user.address?.zipCode || "",
                },
                emergencyContact: {
                    name: user.emergencyContact?.name || "",
                    relationship: user.emergencyContact?.relationship || "",
                    phone: user.emergencyContact?.phone || "",
                },
            });
        }
        setErrors({});
        setIsEditing(false);
    };

    const handleAvatarUpload = () => {
        // Create a file input and trigger click
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                // In a real app, this would upload to a server
                console.log("Uploading file:", file.name);
                alert(`Avatar upload would process: ${file.name}`);
            }
        };
        input.click();
    };

    const getStatusBadge = () => {
        const status = user?.status || "active";
        const statusConfig: Record<string, { label: string; className: string }> = {
            active: { label: "Active", className: "bg-success/10 text-success" },
            inactive: { label: "Inactive", className: "bg-error/10 text-error" },
            on_leave: { label: "On Leave", className: "bg-warning/10 text-warning" },
        };
        const config = statusConfig[status] || statusConfig.active;
        return (
            <span className={cn("px-3 py-1 rounded-full text-xs font-semibold", config.className)}>
                {config.label}
            </span>
        );
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">My Profile</h1>
                <div className="flex gap-2">
                    {isEditing ? (
                        <>
                            <Button
                                variant="outline"
                                onClick={handleCancel}
                                startIcon={<X className="w-4 h-4" />}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={isSaving}
                                startIcon={
                                    isSaving ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Save className="w-4 h-4" />
                                    )
                                }
                            >
                                {isSaving ? "Saving..." : "Save Changes"}
                            </Button>
                        </>
                    ) : (
                        <Button
                            onClick={() => setIsEditing(true)}
                            startIcon={<Edit2 className="w-4 h-4" />}
                        >
                            Edit Profile
                        </Button>
                    )}
                </div>
            </div>

            {/* Success Message */}
            {saveSuccess && (
                <div className="flex items-center gap-3 p-4 bg-success/10 border border-success/20 rounded-xl text-success animate-in">
                    <CheckCircle className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-medium">Profile updated successfully!</p>
                </div>
            )}

            {/* Error Message */}
            {saveError && (
                <div className="flex items-center gap-3 p-4 bg-error/10 border border-error/20 rounded-xl text-error animate-in">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-medium">{saveError}</p>
                </div>
            )}

            {/* Profile Header Card */}
            <div className="bg-gradient-to-br from-primary to-primary-dark p-4 sm:p-8 rounded-2xl shadow-lg text-white">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    {/* Avatar */}
                    <div className="relative">
                        <div
                            className={cn(
                                "w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br flex items-center justify-center text-3xl sm:text-4xl font-bold text-white shadow-lg",
                                getAvatarColor()
                            )}
                        >
                            {getInitials()}
                        </div>
                        <button
                            onClick={handleAvatarUpload}
                            className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-xl shadow-md flex items-center justify-center text-primary hover:bg-gray-50 transition-colors"
                            title="Change avatar"
                        >
                            <Camera className="w-4 h-4" />
                        </button>
                    </div>

                    {/* User Info */}
                    <div className="text-center sm:text-left flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                            <h2 className="text-2xl sm:text-3xl font-bold">
                                {formData.firstName || user?.firstName} {formData.lastName || user?.lastName}
                            </h2>
                            {getStatusBadge()}
                        </div>
                        <p className="text-white/80 text-lg mb-1">
                            {formData.designation || user?.designation || "Employee"}
                        </p>
                        <p className="text-white/60">
                            {formData.department || user?.department || "Department"}
                        </p>
                        <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-4">
                            <div className="flex items-center gap-2 text-sm text-white/70">
                                <Mail className="w-4 h-4" />
                                <span>{formData.email || user?.email}</span>
                            </div>
                            {(formData.phone || user?.phone) && (
                                <div className="flex items-center gap-2 text-sm text-white/70">
                                    <Phone className="w-4 h-4" />
                                    <span>{formData.phone || user?.phone}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-surface p-4 rounded-xl shadow-md">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", stat.color)}>
                            {stat.icon}
                        </div>
                        <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                        <p className="text-xs sm:text-sm text-foreground-secondary">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Personal Information */}
                <Card title="Personal Information">
                    <div className="space-y-4">
                        {isEditing ? (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-foreground mb-1.5 block">
                                            First Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            className={cn(
                                                "w-full px-4 py-2.5 border rounded-xl bg-surface text-foreground focus:ring-2 focus:ring-primary focus:border-transparent",
                                                errors.firstName ? "border-error" : "border-border"
                                            )}
                                        />
                                        {errors.firstName && (
                                            <p className="text-xs text-error mt-1">{errors.firstName}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-foreground mb-1.5 block">
                                            Last Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            className={cn(
                                                "w-full px-4 py-2.5 border rounded-xl bg-surface text-foreground focus:ring-2 focus:ring-primary focus:border-transparent",
                                                errors.lastName ? "border-error" : "border-border"
                                            )}
                                        />
                                        {errors.lastName && (
                                            <p className="text-xs text-error mt-1">{errors.lastName}</p>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className={cn(
                                            "w-full px-4 py-2.5 border rounded-xl bg-surface text-foreground focus:ring-2 focus:ring-primary focus:border-transparent",
                                            errors.email ? "border-error" : "border-border"
                                        )}
                                    />
                                    {errors.email && (
                                        <p className="text-xs text-error mt-1">{errors.email}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                                        Phone Number *
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="+1 234 567 8900"
                                        className={cn(
                                            "w-full px-4 py-2.5 border rounded-xl bg-surface text-foreground focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-foreground-tertiary",
                                            errors.phone ? "border-error" : "border-border"
                                        )}
                                    />
                                    {errors.phone && (
                                        <p className="text-xs text-error mt-1">{errors.phone}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                                        Date of Birth *
                                    </label>
                                    <input
                                        type="date"
                                        name="dateOfBirth"
                                        value={formData.dateOfBirth}
                                        onChange={handleInputChange}
                                        className={cn(
                                            "w-full px-4 py-2.5 border rounded-xl bg-surface text-foreground focus:ring-2 focus:ring-primary focus:border-transparent",
                                            errors.dateOfBirth ? "border-error" : "border-border"
                                        )}
                                    />
                                    {errors.dateOfBirth && (
                                        <p className="text-xs text-error mt-1">{errors.dateOfBirth}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                                        PAN Number
                                    </label>
                                    <input
                                        type="text"
                                        name="panNumber"
                                        value={formData.panNumber}
                                        onChange={handleInputChange}
                                        placeholder="e.g. ABCDE1234F"
                                        className="w-full px-4 py-2.5 border border-border rounded-xl bg-surface text-foreground focus:ring-2 focus:ring-primary focus:border-transparent uppercase"
                                    />
                                </div>
                                {/* <div>
                                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                                        Location
                                    </label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-border rounded-xl bg-surface text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div> */}
                            </>
                        ) : (
                            <>
                                <div className="flex items-center justify-between py-3 border-b border-border">
                                    <div className="flex items-center gap-3">
                                        <User className="w-5 h-5 text-foreground-tertiary" />
                                        <span className="text-sm text-foreground-secondary">Full Name</span>
                                    </div>
                                    <span className="font-medium text-sm">
                                        {formData.firstName} {formData.lastName}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between py-3 border-b border-border">
                                    <div className="flex items-center gap-3">
                                        <Mail className="w-5 h-5 text-foreground-tertiary" />
                                        <span className="text-sm text-foreground-secondary">Email</span>
                                    </div>
                                    <span className="font-medium text-sm">{formData.email}</span>
                                </div>
                                <div className="flex items-center justify-between py-3 border-b border-border">
                                    <div className="flex items-center gap-3">
                                        <Phone className="w-5 h-5 text-foreground-tertiary" />
                                        <span className="text-sm text-foreground-secondary">Phone</span>
                                    </div>
                                    <span className="font-medium text-sm">{formData.phone || "—"}</span>
                                </div>
                                <div className="flex items-center justify-between py-3 border-b border-border">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-5 h-5 text-foreground-tertiary" />
                                        <span className="text-sm text-foreground-secondary">Date of Birth</span>
                                    </div>
                                    <span className="font-medium text-sm">
                                        {formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        }) : "—"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between py-3 border-b border-border">
                                    <div className="flex items-center gap-3">
                                        <Shield className="w-5 h-5 text-foreground-tertiary" />
                                        <span className="text-sm text-foreground-secondary">PAN Number</span>
                                    </div>
                                    <span className="font-medium text-sm uppercase">{formData.panNumber || "—"}</span>
                                </div>
                                {/* <div className="flex items-center justify-between py-3">
                                    <div className="flex items-center gap-3">
                                        <MapPin className="w-5 h-5 text-foreground-tertiary" />
                                        <span className="text-sm text-foreground-secondary">Location</span>
                                    </div>
                                    <span className="font-medium text-sm">{formData.location}</span>
                                </div> */}
                            </>
                        )}
                    </div>
                </Card>

                {/* Employment Details */}
                <Card title="Employment Details">
                    <div className="space-y-4">
                        {isEditing ? (
                            <>
                                <div>
                                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                                        Designation *
                                    </label>
                                    <select
                                        name="designation"
                                        value={formData.designation}
                                        onChange={handleInputChange}
                                        className={cn(
                                            "w-full px-4 py-2.5 border rounded-xl bg-surface text-foreground focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer",
                                            errors.designation ? "border-error" : "border-border"
                                        )}
                                    >
                                        <option value="">Select Designation</option>
                                        {designations.map((desig) => (
                                            <option key={desig._id} value={desig.title}>
                                                {desig.title}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.designation && (
                                        <p className="text-xs text-error mt-1">{errors.designation}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                                        Department *
                                    </label>
                                    <select
                                        name="department"
                                        value={formData.department}
                                        onChange={handleInputChange}
                                        className={cn(
                                            "w-full px-4 py-2.5 border rounded-xl bg-surface text-foreground focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer",
                                            errors.department ? "border-error" : "border-border"
                                        )}
                                    >
                                        <option value="">Select Department</option>
                                        {departments.map((dept) => (
                                            <option key={dept._id} value={dept.name}>
                                                {dept.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.department && (
                                        <p className="text-xs text-error mt-1">{errors.department}</p>
                                    )}
                                </div>
                                <div className="p-4 bg-muted rounded-xl">
                                    <p className="text-sm text-foreground-secondary">
                                        <strong>Note:</strong> Role, Join Date, and Employee ID cannot be changed.
                                        Contact HR for any modifications.
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center justify-between py-3 border-b border-border">
                                    <div className="flex items-center gap-3">
                                        <Briefcase className="w-5 h-5 text-foreground-tertiary" />
                                        <span className="text-sm text-foreground-secondary">Designation</span>
                                    </div>
                                    <span className="font-medium text-sm">{formData.designation || "—"}</span>
                                </div>
                                <div className="flex items-center justify-between py-3 border-b border-border">
                                    <div className="flex items-center gap-3">
                                        <Building2 className="w-5 h-5 text-foreground-tertiary" />
                                        <span className="text-sm text-foreground-secondary">Department</span>
                                    </div>
                                    <span className="font-medium text-sm">{formData.department || "—"}</span>
                                </div>
                                <div className="flex items-center justify-between py-3 border-b border-border">
                                    <div className="flex items-center gap-3">
                                        <Shield className="w-5 h-5 text-foreground-tertiary" />
                                        <span className="text-sm text-foreground-secondary">Role</span>
                                    </div>
                                    <span className={cn(
                                        "px-3 py-1 rounded-full text-xs font-semibold capitalize",
                                        user?.role === "admin" ? "bg-primary/10 text-primary" : "bg-muted text-foreground"
                                    )}>
                                        {user?.role || "Employee"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between py-3 border-b border-border">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-5 h-5 text-foreground-tertiary" />
                                        <span className="text-sm text-foreground-secondary">Join Date</span>
                                    </div>
                                    <span className="font-medium text-sm">
                                        {user?.joinDate ? new Date(user.joinDate).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        }) : "—"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between py-3">
                                    <div className="flex items-center gap-3">
                                        <User className="w-5 h-5 text-foreground-tertiary" />
                                        <span className="text-sm text-foreground-secondary">Employee ID</span>
                                    </div>
                                    <span className="font-medium text-sm font-mono">
                                        EMP-{user?.employeeId?.toString().padStart(4, "0") || "0001"}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Address Information */}
                <Card title="Address Details">
                    <div className="space-y-4">
                        {isEditing ? (
                            <>
                                <div>
                                    <label className="text-sm font-medium text-foreground mb-1.5 block">Street Address *</label>
                                    <input
                                        type="text"
                                        name="address.street"
                                        value={formData.address.street}
                                        onChange={handleInputChange}
                                        className={cn(
                                            "w-full px-4 py-2.5 border rounded-xl bg-surface text-foreground focus:ring-2 focus:ring-primary focus:border-transparent",
                                            errors["address.street"] ? "border-error" : "border-border"
                                        )}
                                    />
                                    {errors["address.street"] && (
                                        <p className="text-xs text-error mt-1">{errors["address.street"]}</p>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-foreground mb-1.5 block">City *</label>
                                        <input
                                            type="text"
                                            name="address.city"
                                            value={formData.address.city}
                                            onChange={handleInputChange}
                                            className={cn(
                                                "w-full px-4 py-2.5 border rounded-xl bg-surface text-foreground focus:ring-2 focus:ring-primary focus:border-transparent",
                                                errors["address.city"] ? "border-error" : "border-border"
                                            )}
                                        />
                                        {errors["address.city"] && (
                                            <p className="text-xs text-error mt-1">{errors["address.city"]}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-foreground mb-1.5 block">State *</label>
                                        <input
                                            type="text"
                                            name="address.state"
                                            value={formData.address.state}
                                            onChange={handleInputChange}
                                            className={cn(
                                                "w-full px-4 py-2.5 border rounded-xl bg-surface text-foreground focus:ring-2 focus:ring-primary focus:border-transparent",
                                                errors["address.state"] ? "border-error" : "border-border"
                                            )}
                                        />
                                        {errors["address.state"] && (
                                            <p className="text-xs text-error mt-1">{errors["address.state"]}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-foreground mb-1.5 block">Country *</label>
                                        <input
                                            type="text"
                                            name="address.country"
                                            value={formData.address.country}
                                            onChange={handleInputChange}
                                            className={cn(
                                                "w-full px-4 py-2.5 border rounded-xl bg-surface text-foreground focus:ring-2 focus:ring-primary focus:border-transparent",
                                                errors["address.country"] ? "border-error" : "border-border"
                                            )}
                                        />
                                        {errors["address.country"] && (
                                            <p className="text-xs text-error mt-1">{errors["address.country"]}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-foreground mb-1.5 block">Zip Code *</label>
                                        <input
                                            type="text"
                                            name="address.zipCode"
                                            value={formData.address.zipCode}
                                            onChange={handleInputChange}
                                            className={cn(
                                                "w-full px-4 py-2.5 border rounded-xl bg-surface text-foreground focus:ring-2 focus:ring-primary focus:border-transparent",
                                                errors["address.zipCode"] ? "border-error" : "border-border"
                                            )}
                                        />
                                        {errors["address.zipCode"] && (
                                            <p className="text-xs text-error mt-1">{errors["address.zipCode"]}</p>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex items-start justify-between py-3 border-b border-border">
                                    <span className="text-sm text-foreground-secondary">Street</span>
                                    <span className="font-medium text-sm text-right">{formData.address.street || "—"}</span>
                                </div>
                                <div className="flex items-center justify-between py-3 border-b border-border">
                                    <span className="text-sm text-foreground-secondary">City & State</span>
                                    <span className="font-medium text-sm">
                                        {formData.address.city || "—"}{formData.address.state ? `, ${formData.address.state}` : ""}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between py-3 border-b border-border">
                                    <span className="text-sm text-foreground-secondary">Country</span>
                                    <span className="font-medium text-sm">{formData.address.country || "—"}</span>
                                </div>
                                <div className="flex items-center justify-between py-3">
                                    <span className="text-sm text-foreground-secondary">Zip Code</span>
                                    <span className="font-medium text-sm">{formData.address.zipCode || "—"}</span>
                                </div>
                            </>
                        )}
                    </div>
                </Card>

                {/* Emergency Contact */}
                <Card title="Emergency Contact">
                    <div className="space-y-4">
                        {isEditing ? (
                            <>
                                <div>
                                    <label className="text-sm font-medium text-foreground mb-1.5 block">Contact Name *</label>
                                    <input
                                        type="text"
                                        name="emergencyContact.name"
                                        value={formData.emergencyContact.name}
                                        onChange={handleInputChange}
                                        className={cn(
                                            "w-full px-4 py-2.5 border rounded-xl bg-surface text-foreground focus:ring-2 focus:ring-primary focus:border-transparent",
                                            errors["emergencyContact.name"] ? "border-error" : "border-border"
                                        )}
                                    />
                                    {errors["emergencyContact.name"] && (
                                        <p className="text-xs text-error mt-1">{errors["emergencyContact.name"]}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-foreground mb-1.5 block">Relationship *</label>
                                    <input
                                        type="text"
                                        name="emergencyContact.relationship"
                                        value={formData.emergencyContact.relationship}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Father, Spouse"
                                        className={cn(
                                            "w-full px-4 py-2.5 border rounded-xl bg-surface text-foreground focus:ring-2 focus:ring-primary focus:border-transparent",
                                            errors["emergencyContact.relationship"] ? "border-error" : "border-border"
                                        )}
                                    />
                                    {errors["emergencyContact.relationship"] && (
                                        <p className="text-xs text-error mt-1">{errors["emergencyContact.relationship"]}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-foreground mb-1.5 block">Phone Number *</label>
                                    <input
                                        type="tel"
                                        name="emergencyContact.phone"
                                        value={formData.emergencyContact.phone}
                                        onChange={handleInputChange}
                                        className={cn(
                                            "w-full px-4 py-2.5 border rounded-xl bg-surface text-foreground focus:ring-2 focus:ring-primary focus:border-transparent",
                                            errors["emergencyContact.phone"] ? "border-error" : "border-border"
                                        )}
                                    />
                                    {errors["emergencyContact.phone"] && (
                                        <p className="text-xs text-error mt-1">{errors["emergencyContact.phone"]}</p>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center justify-between py-3 border-b border-border">
                                    <span className="text-sm text-foreground-secondary">Name</span>
                                    <span className="font-medium text-sm">{formData.emergencyContact.name || "—"}</span>
                                </div>
                                <div className="flex items-center justify-between py-3 border-b border-border">
                                    <span className="text-sm text-foreground-secondary">Relationship</span>
                                    <span className="font-medium text-sm">{formData.emergencyContact.relationship || "—"}</span>
                                </div>
                                <div className="flex items-center justify-between py-3">
                                    <span className="text-sm text-foreground-secondary">Phone</span>
                                    <span className="font-medium text-sm">{formData.emergencyContact.phone || "—"}</span>
                                </div>
                            </>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Profile;
