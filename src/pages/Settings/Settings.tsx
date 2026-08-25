import React, { useState, useMemo } from "react";
import {
    Bell,
    Moon,
    Sun,
    Globe,
    Lock,
    Eye,
    EyeOff,
    Shield,
    Smartphone,
    Mail,
    Palette,
    Monitor,
    Volume2,
    VolumeX,
    Save,
    AlertCircle,
    CheckCircle,
    XCircle,
    Download,
    Trash2,
    Loader2,
} from "lucide-react";
import Card from "../../components/common/Card/Card";
import Button from "../../components/common/Button/Button";
import Toggle from "../../components/common/Toggle";
import { cn } from "../../lib/utils";
import { getItem, setItem } from "../../utils/storage";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContext";

interface SettingToggleProps {
    label: string;
    description: string;
    enabled: boolean;
    onChange: (value: boolean) => void;
    icon: React.ReactNode;
}

const SettingToggle: React.FC<SettingToggleProps> = ({
    label,
    description,
    enabled,
    onChange,
    icon,
}) => (
    <div className="flex items-center justify-between py-4 border-b border-border last:border-0">
        <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                {icon}
            </div>
            <div className="min-w-0">
                <p className="font-medium text-foreground">{label}</p>
                <p className="text-sm text-foreground-secondary">{description}</p>
            </div>
        </div>
        <div className="ml-4 shrink-0">
            <Toggle enabled={enabled} onChange={onChange} />
        </div>
    </div>
);

// Settings storage key
const SETTINGS_KEY = "user_settings";

interface SettingsState {
    notifications: {
        email: boolean;
        push: boolean;
        sms: boolean;
        sound: boolean;
    };
    security: {
        twoFactorEnabled: boolean;
    };
    // Appearance is handled by ThemeContext
}

const defaultSettings: SettingsState = {
    notifications: {
        email: true,
        push: true,
        sms: false,
        sound: true,
    },
    security: {
        twoFactorEnabled: false,
    },
};

const Settings: React.FC = () => {
    const { t } = useTranslation();
    const { appearance, updateAppearance } = useTheme();

    // Load settings from localStorage (excluding appearance which is managed by Context)
    const loadSettings = (): SettingsState => {
        const stored = getItem(SETTINGS_KEY);
        if (stored) {
            return {
                notifications: stored.notifications || defaultSettings.notifications,
                security: stored.security || defaultSettings.security,
            };
        }
        return defaultSettings;
    };

    const [settings, setSettings] = useState<SettingsState>(loadSettings);

    // Password form states
    const [showPassword, setShowPassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    // Save status
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

    // Data export status
    const [exportStatus, setExportStatus] = useState<"idle" | "exporting" | "done">("idle");

    // Delete confirmation
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Track changes using useMemo
    const hasChanges = useMemo(() => {
        const stored = getItem(SETTINGS_KEY);
        const storedSettings = {
            notifications: stored?.notifications || defaultSettings.notifications,
            security: stored?.security || defaultSettings.security,
        };
        return JSON.stringify(storedSettings) !== JSON.stringify(settings);
    }, [settings]);

    const updateSettings = <K extends keyof SettingsState>(
        category: K,
        key: keyof SettingsState[K],
        value: SettingsState[K][keyof SettingsState[K]]
    ) => {
        setSettings((prev) => ({
            ...prev,
            [category]: {
                ...prev[category],
                [key]: value,
            },
        }));
    };

    const handleSaveSettings = async () => {
        setSaveStatus("saving");
        try {
            // Simulate API call delay
            await new Promise((resolve) => setTimeout(resolve, 800));

            // Save to localStorage
            // We must preserve the 'appearance' key which is managed by Context/Live updates
            const currentStored = getItem(SETTINGS_KEY) || {};
            const newStored = {
                ...currentStored,
                notifications: settings.notifications,
                security: settings.security,
            };

            setItem(SETTINGS_KEY, newStored);

            setSaveStatus("saved");
            setTimeout(() => setSaveStatus("idle"), 2000);
        } catch {
            setSaveStatus("error");
            setTimeout(() => setSaveStatus("idle"), 3000);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError(null);
        setPasswordSuccess(false);

        // Validation
        if (!currentPassword) {
            setPasswordError("Current password is required");
            return;
        }
        if (newPassword.length < 8) {
            setPasswordError("New password must be at least 8 characters");
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError("Passwords don't match");
            return;
        }

        // Simulate API call
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setPasswordSuccess(true);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setTimeout(() => setPasswordSuccess(false), 3000);
        } catch {
            setPasswordError("Failed to update password. Please try again.");
        }
    };

    const handleDataExport = async () => {
        setExportStatus("exporting");

        // Simulate export process
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Create and download a mock data file
        const exportData = {
            profile: {
                exportedAt: new Date().toISOString(),
            },
            settings,
            appearance, // Include appearance in export
            attendance: [
                { date: "2025-12-15", clockIn: "09:00", clockOut: "17:00" },
                { date: "2025-12-14", clockIn: "09:15", clockOut: "17:30" },
            ],
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `codecit-data-export-${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setExportStatus("done");
        setTimeout(() => setExportStatus("idle"), 2000);
    };

    const handleDeleteAccount = () => {
        // In a real app, this would call an API
        alert("Account deletion would be processed here. This is a demo.");
        setShowDeleteConfirm(false);
    };

    const accentColors = [
        { value: "#1976d2", name: "Blue" },
        { value: "#9c27b0", name: "Purple" },
        { value: "#f44336", name: "Red" },
        { value: "#4caf50", name: "Green" },
        { value: "#ff9800", name: "Orange" },
        { value: "#00bcd4", name: "Cyan" },
    ];

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-foreground">{t("settings")}</h1>
                    <p className="text-sm text-foreground-secondary mt-1">
                        {t("manage_preferences")}
                    </p>
                </div>
                <Button
                    onClick={handleSaveSettings}
                    disabled={saveStatus === "saving" || !hasChanges}
                    startIcon={
                        saveStatus === "saving" ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : saveStatus === "saved" ? (
                            <CheckCircle className="w-4 h-4" />
                        ) : saveStatus === "error" ? (
                            <XCircle className="w-4 h-4" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )
                    }
                    className={cn(
                        saveStatus === "saved" && "bg-success hover:bg-success",
                        saveStatus === "error" && "bg-error hover:bg-error"
                    )}
                >
                    {saveStatus === "saving"
                        ? t("saving")
                        : saveStatus === "saved"
                            ? t("saved")
                            : saveStatus === "error"
                                ? t("failed")
                                : hasChanges
                                    ? t("save_changes")
                                    : t("all_saved")}
                </Button>
            </div>

            {/* Unsaved Changes Warning */}
            {hasChanges && (
                <div className="flex items-center gap-3 p-4 bg-warning/10 border border-warning/20 rounded-xl">
                    <AlertCircle className="w-5 h-5 text-warning shrink-0" />
                    <p className="text-sm text-foreground">
                        {t("unsaved_changes")}
                    </p>
                </div>
            )}

            {/* Settings Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Notifications */}
                <Card title={t("notifications")}>
                    <div className="space-y-0">
                        <SettingToggle
                            label="Email Notifications"
                            description="Receive notifications via email"
                            enabled={settings.notifications.email}
                            onChange={(v) => updateSettings("notifications", "email", v)}
                            icon={<Mail className="w-5 h-5" />}
                        />
                        <SettingToggle
                            label="Push Notifications"
                            description="Receive push notifications in browser"
                            enabled={settings.notifications.push}
                            onChange={(v) => updateSettings("notifications", "push", v)}
                            icon={<Bell className="w-5 h-5" />}
                        />
                        <SettingToggle
                            label="SMS Notifications"
                            description="Receive SMS for important alerts"
                            enabled={settings.notifications.sms}
                            onChange={(v) => updateSettings("notifications", "sms", v)}
                            icon={<Smartphone className="w-5 h-5" />}
                        />
                        <SettingToggle
                            label="Sound Effects"
                            description="Play sounds for notifications"
                            enabled={settings.notifications.sound}
                            onChange={(v) => updateSettings("notifications", "sound", v)}
                            icon={settings.notifications.sound ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                        />
                    </div>
                </Card>

                {/* Appearance */}
                <Card title={t("appearance")}>
                    <div className="space-y-4">
                        <SettingToggle
                            label={t("dark_mode")}
                            description="Switch to dark theme"
                            enabled={appearance.darkMode}
                            onChange={(v) => updateAppearance("darkMode", v)}
                            icon={appearance.darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                        />
                        <SettingToggle
                            label="Compact Mode"
                            description="Reduce spacing and padding"
                            enabled={appearance.compactMode}
                            onChange={(v) => updateAppearance("compactMode", v)}
                            icon={<Monitor className="w-5 h-5" />}
                        />

                        {/* Accent Color */}
                        <div className="py-4 border-b border-border">
                            <div className="flex items-start gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                    <Palette className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-medium text-foreground">{t("accent_color")}</p>
                                    <p className="text-sm text-foreground-secondary">
                                        Choose your preferred accent color
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-3 ml-13">
                                {accentColors.map((color) => (
                                    <button
                                        key={color.value}
                                        onClick={() => updateAppearance("accentColor", color.value)}
                                        title={color.name}
                                        className={cn(
                                            "w-10 h-10 rounded-full transition-all hover:scale-110 focus:outline-none",
                                            appearance.accentColor === color.value &&
                                            "ring-2 ring-offset-2 ring-offset-surface ring-current scale-110"
                                        )}
                                        style={{ backgroundColor: color.value }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Language */}
                        <div className="py-4">
                            <div className="flex items-start gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                    <Globe className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-foreground">{t("language")}</p>
                                    <p className="text-sm text-foreground-secondary">
                                        Select your preferred language
                                    </p>
                                </div>
                            </div>
                            <select
                                value={appearance.language}
                                onChange={(e) => updateAppearance("language", e.target.value)}
                                className="w-full px-4 py-2.5 border border-border rounded-xl bg-surface text-foreground focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
                            >
                                <option value="en">English (US)</option>
                                <option value="en-gb">English (UK)</option>
                                <option value="es">Español</option>
                                <option value="fr">Français</option>
                                <option value="de">Deutsch</option>
                                <option value="hi">हिंदी</option>
                            </select>
                        </div>
                    </div>
                </Card>

                {/* Security */}
                <Card title={t("security")}>
                    <div className="space-y-4">
                        <SettingToggle
                            label="Two-Factor Authentication"
                            description="Add an extra layer of security"
                            enabled={settings.security.twoFactorEnabled}
                            onChange={(v) => updateSettings("security", "twoFactorEnabled", v)}
                            icon={<Shield className="w-5 h-5" />}
                        />
                        {/* ... rest of security ... */}
                        {settings.security.twoFactorEnabled && (
                            <div className="p-4 bg-success/5 border border-success/20 rounded-xl animate-in">
                                <div className="flex items-center gap-2 text-success mb-2">
                                    <CheckCircle className="w-5 h-5" />
                                    <span className="font-medium">2FA Enabled</span>
                                </div>
                                <p className="text-sm text-foreground-secondary">
                                    Two-factor authentication is active on your account.
                                </p>
                            </div>
                        )}

                        {/* Change Password */}
                        <div className="pt-4 border-t border-border">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center text-warning shrink-0">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-medium text-foreground">Change Password</p>
                                    <p className="text-sm text-foreground-secondary">
                                        Update your account password
                                    </p>
                                </div>
                            </div>

                            {passwordError && (
                                <div className="flex items-center gap-2 p-3 mb-3 bg-error/10 border border-error/20 rounded-xl text-error text-sm">
                                    <XCircle className="w-4 h-4 shrink-0" />
                                    {passwordError}
                                </div>
                            )}

                            {passwordSuccess && (
                                <div className="flex items-center gap-2 p-3 mb-3 bg-success/10 border border-success/20 rounded-xl text-success text-sm">
                                    <CheckCircle className="w-4 h-4 shrink-0" />
                                    Password updated successfully!
                                </div>
                            )}

                            <form onSubmit={handlePasswordChange} className="space-y-3">
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Current Password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="w-full px-4 py-2.5 pr-10 border border-border rounded-xl bg-surface text-foreground focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-foreground-tertiary"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-tertiary hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="New Password (min 8 characters)"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-border rounded-xl bg-surface text-foreground focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-foreground-tertiary"
                                />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Confirm New Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-border rounded-xl bg-surface text-foreground focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-foreground-tertiary"
                                />
                                <Button
                                    type="submit"
                                    variant="outline"
                                    fullWidth
                                    disabled={!currentPassword || !newPassword || !confirmPassword}
                                >
                                    Update Password
                                </Button>
                            </form>
                        </div>
                    </div>
                </Card>

                {/* Privacy & Data */}
                <Card title={t("privacy_data")}>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 bg-info/5 border border-info/20 rounded-xl">
                            <AlertCircle className="w-5 h-5 text-info shrink-0" />
                            <p className="text-sm text-foreground-secondary">
                                Your data is securely stored and protected according to our privacy policy.
                            </p>
                        </div>

                        {/* Data Export */}
                        <div className="py-4 border-b border-border">
                            <h4 className="font-medium text-foreground mb-3">Data Export</h4>
                            <p className="text-sm text-foreground-secondary mb-3">
                                Download a copy of your data including attendance records, leave history, and profile information.
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDataExport}
                                disabled={exportStatus !== "idle"}
                                startIcon={
                                    exportStatus === "exporting" ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : exportStatus === "done" ? (
                                        <CheckCircle className="w-4 h-4" />
                                    ) : (
                                        <Download className="w-4 h-4" />
                                    )
                                }
                            >
                                {exportStatus === "exporting"
                                    ? "Exporting..."
                                    : exportStatus === "done"
                                        ? "Downloaded!"
                                        : "Request Data Export"}
                            </Button>
                        </div>

                        {/* Connected Devices */}
                        <div className="py-4 border-b border-border">
                            <h4 className="font-medium text-foreground mb-3">Connected Devices</h4>
                            <p className="text-sm text-foreground-secondary mb-3">
                                Manage devices that are currently logged into your account.
                            </p>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between p-3 bg-muted rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <Monitor className="w-5 h-5 text-foreground-secondary" />
                                        <div>
                                            <p className="text-sm font-medium">Windows PC - Chrome</p>
                                            <p className="text-xs text-foreground-tertiary">Current session • Active now</p>
                                        </div>
                                    </div>
                                    <span className="text-xs bg-success/10 text-success px-2.5 py-1 rounded-full font-medium">
                                        Active
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="py-4">
                            <h4 className="font-medium text-error mb-3">Danger Zone</h4>
                            {showDeleteConfirm ? (
                                <div className="p-4 bg-error/5 border border-error/20 rounded-xl">
                                    <p className="text-sm text-foreground mb-4">
                                        Are you sure you want to delete your account? This action cannot be undone.
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={handleDeleteAccount}
                                            startIcon={<Trash2 className="w-4 h-4" />}
                                        >
                                            Yes, Delete
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowDeleteConfirm(false)}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <p className="text-sm text-foreground-secondary mb-3">
                                        Permanently delete your account and all associated data. This action cannot be undone.
                                    </p>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => setShowDeleteConfirm(true)}
                                        startIcon={<Trash2 className="w-4 h-4" />}
                                    >
                                        Delete Account
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Settings;
