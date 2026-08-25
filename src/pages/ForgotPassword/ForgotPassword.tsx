import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Mail, ArrowLeft, Loader2, CheckCircle, KeyRound, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../../lib/utils";
// import logoAnimated from "../../assets/pulse-ops-logo-animated.mp4";
import logoStatic from "../../assets/codecit-logo.png";
import { authService } from "../../services/authService";

// Validation Schemas
const emailSchema = yup.object({
    email: yup.string().email("Please enter a valid email").required("Email is required"),
});

const otpSchema = yup.object({
    otp: yup.string().length(6, "OTP must be 6 digits").required("OTP is required"),
});

const passwordSchema = yup.object({
    password: yup.string().required("Password is required").min(6, "Password must be at least 6 characters"),
    confirmPassword: yup
        .string()
        .oneOf([yup.ref("password")], "Passwords must match")
        .required("Confirm Password is required"),
});

type EmailFormData = yup.InferType<typeof emailSchema>;
type OtpFormData = yup.InferType<typeof otpSchema>;
type PasswordFormData = yup.InferType<typeof passwordSchema>;

type Step = "EMAIL" | "OTP" | "RESET" | "SUCCESS";

const ForgotPassword: React.FC = () => {
    const [step, setStep] = useState<Step>("EMAIL");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Forms
    const emailForm = useForm<EmailFormData>({
        resolver: yupResolver(emailSchema),
        defaultValues: { email: "" },
    });

    const otpForm = useForm<OtpFormData>({
        resolver: yupResolver(otpSchema),
        defaultValues: { otp: "" },
    });

    const passwordForm = useForm<PasswordFormData>({
        resolver: yupResolver(passwordSchema),
        defaultValues: { password: "", confirmPassword: "" },
    });

    // Handlers
    const onEmailSubmit = async (data: EmailFormData) => {
        setIsLoading(true);
        setError(null);
        try {
            await authService.forgotPassword(data.email);
            setEmail(data.email);
            setStep("OTP");
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            let message = "Failed to send OTP";
            if (err.response && err.response.data) {
                const data = err.response.data;
                if (typeof data === "string") {
                    message = data;
                } else if (data.error?.message) {
                    message = data.error.message;
                } else if (data.message) {
                    message = data.message;
                } else if (data.error && typeof data.error === "string") {
                    message = data.error;
                }
            } else if (err.message) {
                message = err.message;
            }
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    const onOtpSubmit = async (data: OtpFormData) => {
        setIsLoading(true);
        setError(null);
        try {
            await authService.verifyOtp(email, data.otp);
            setOtp(data.otp);
            setStep("RESET");
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            let message = "Invalid OTP";
            if (err.response && err.response.data) {
                const data = err.response.data;
                if (typeof data === "string") {
                    message = data;
                } else if (data.error?.message) {
                    message = data.error.message;
                } else if (data.message) {
                    message = data.message;
                } else if (data.error && typeof data.error === "string") {
                    message = data.error;
                }
            } else if (err.message) {
                message = err.message;
            }
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    const onPasswordSubmit = async (data: PasswordFormData) => {
        setIsLoading(true);
        setError(null);
        try {
            await authService.resetPassword(email, otp, data.password);
            setStep("SUCCESS");
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            let message = "Failed to reset password";
            if (err.response && err.response.data) {
                const data = err.response.data;
                if (typeof data === "string") {
                    message = data;
                } else if (data.error?.message) {
                    message = data.error.message;
                } else if (data.message) {
                    message = data.message;
                } else if (data.error && typeof data.error === "string") {
                    message = data.error;
                }
            } else if (err.message) {
                message = err.message;
            }
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary-dark to-primary-dark relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-white rounded-full translate-x-1/3 translate-y-1/3" />
                    <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
                </div>
                <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
                    <div className="max-w-md text-center">
                        <div className="mb-8">
                            <div className="w-40 h-40 mx-auto mb-6 rounded-3xl overflow-hidden bg-white/10 backdrop-blur-sm p-2">
                                {/* <video
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    className="w-full h-full object-contain rounded-2xl"
                                >
                                    <source src={logoAnimated} type="video/mp4" />
                                    <img src={logoStatic} alt="CodecIT Logo" className="w-full h-full object-contain" />
                                </video> */}
                                <img
                                    src={logoStatic}
                                    alt="CodecIT Logo"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <h1 className="text-4xl font-bold mb-2">CodecIT</h1>
                            <p className="text-white/80 text-lg">Human Resource Management</p>
                        </div>
                        <p className="text-white/70">
                            Recover access to your account securely.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right side - Forms */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="w-24 h-24 mx-auto mb-4 rounded-2xl overflow-hidden shadow-lg">
                            <img src={logoStatic} alt="CodecIT Logo" className="w-full h-full object-cover" />
                        </div>
                        <h1 className="text-2xl font-bold text-primary">CodecIT</h1>
                    </div>

                    <Link to="/login" className="inline-flex items-center text-sm text-foreground-tertiary hover:text-primary transition-colors mb-6">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Login
                    </Link>

                    {/* Error Alert */}
                    {error && (
                        <div className="flex items-center gap-3 p-4 mb-6 bg-error/10 border border-error/20 rounded-xl text-error animate-in fade-in slide-in-from-top-2">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {step === "EMAIL" && (
                        <div className="animate-in fade-in slide-in-from-right-8 duration-300">
                            <div className="mb-8">
                                <h2 className="text-3xl font-bold text-foreground mb-2">Forgot Password?</h2>
                                <p className="text-foreground-secondary">No worries, we'll send you reset instructions.</p>
                            </div>
                            <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-5">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">Email Address</label>
                                    <Controller
                                        name="email"
                                        control={emailForm.control}
                                        render={({ field }) => (
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <Mail className="w-5 h-5 text-foreground-tertiary" />
                                                </div>
                                                <input
                                                    {...field}
                                                    type="email"
                                                    placeholder="Enter your email"
                                                    className={cn(
                                                        "w-full pl-12 pr-4 py-3.5 border rounded-xl transition-all duration-200",
                                                        "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                                                        "placeholder:text-foreground-tertiary bg-surface",
                                                        emailForm.formState.errors.email ? "border-error focus:ring-error" : "border-border hover:border-foreground-secondary"
                                                    )}
                                                />
                                            </div>
                                        )}
                                    />
                                    {emailForm.formState.errors.email && (
                                        <p className="mt-2 text-sm text-error">{emailForm.formState.errors.email.message}</p>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-3.5 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-primary to-primary-dark hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-300"
                                >
                                    {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Sending...</> : "Send OTP"}
                                </button>
                            </form>
                        </div>
                    )}

                    {step === "OTP" && (
                        <div className="animate-in fade-in slide-in-from-right-8 duration-300">
                            <div className="mb-8">
                                <h2 className="text-3xl font-bold text-foreground mb-2">Verify OTP</h2>
                                <p className="text-foreground-secondary">Enter the 6-digit code sent to <span className="font-semibold text-foreground">{email}</span></p>
                            </div>
                            <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-5">
                                <div>
                                    <label htmlFor="otp" className="block text-sm font-medium text-foreground mb-2">One-Time Password</label>
                                    <Controller
                                        name="otp"
                                        control={otpForm.control}
                                        render={({ field }) => (
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <KeyRound className="w-5 h-5 text-foreground-tertiary" />
                                                </div>
                                                <input
                                                    {...field}
                                                    type="text"
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/[^0-9]/g, "");
                                                        field.onChange(val);
                                                    }}
                                                    placeholder="Enter 6-digit OTP"
                                                    maxLength={6}
                                                    className={cn(
                                                        "w-full pl-12 pr-4 py-3.5 border rounded-xl transition-all duration-200",
                                                        "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                                                        "placeholder:text-foreground-tertiary bg-surface tracking-widest",
                                                        otpForm.formState.errors.otp ? "border-error focus:ring-error" : "border-border hover:border-foreground-secondary"
                                                    )}
                                                />
                                            </div>
                                        )}
                                    />
                                    {otpForm.formState.errors.otp && (
                                        <p className="mt-2 text-sm text-error">{otpForm.formState.errors.otp.message}</p>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-3.5 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-primary to-primary-dark hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-300"
                                >
                                    {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Verifying...</> : "Verify OTP"}
                                </button>
                                <div className="text-center">
                                    <button type="button" onClick={() => setStep("EMAIL")} className="text-sm text-primary hover:underline">Change Email</button>
                                </div>
                            </form>
                        </div>
                    )}

                    {step === "RESET" && (
                        <div className="animate-in fade-in slide-in-from-right-8 duration-300">
                            <div className="mb-8">
                                <h2 className="text-3xl font-bold text-foreground mb-2">Reset Password</h2>
                                <p className="text-foreground-secondary">Create a new password for your account.</p>
                            </div>
                            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-5">
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">New Password</label>
                                    <Controller
                                        name="password"
                                        control={passwordForm.control}
                                        render={({ field }) => (
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <Lock className="w-5 h-5 text-foreground-tertiary" />
                                                </div>
                                                <input
                                                    {...field}
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="Enter new password"
                                                    className={cn(
                                                        "w-full pl-12 pr-12 py-3.5 border rounded-xl transition-all duration-200",
                                                        "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                                                        "placeholder:text-foreground-tertiary bg-surface",
                                                        passwordForm.formState.errors.password ? "border-error focus:ring-error" : "border-border hover:border-foreground-secondary"
                                                    )}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-foreground-tertiary hover:text-foreground transition-colors"
                                                >
                                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                </button>
                                            </div>
                                        )}
                                    />
                                    {passwordForm.formState.errors.password && (
                                        <p className="mt-2 text-sm text-error">{passwordForm.formState.errors.password.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">Confirm Password</label>
                                    <Controller
                                        name="confirmPassword"
                                        control={passwordForm.control}
                                        render={({ field }) => (
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <Lock className="w-5 h-5 text-foreground-tertiary" />
                                                </div>
                                                <input
                                                    {...field}
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    placeholder="Confirm new password"
                                                    className={cn(
                                                        "w-full pl-12 pr-12 py-3.5 border rounded-xl transition-all duration-200",
                                                        "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                                                        "placeholder:text-foreground-tertiary bg-surface",
                                                        passwordForm.formState.errors.confirmPassword ? "border-error focus:ring-error" : "border-border hover:border-foreground-secondary"
                                                    )}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-foreground-tertiary hover:text-foreground transition-colors"
                                                >
                                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                </button>
                                            </div>
                                        )}
                                    />
                                    {passwordForm.formState.errors.confirmPassword && (
                                        <p className="mt-2 text-sm text-error">{passwordForm.formState.errors.confirmPassword.message}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-3.5 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-primary to-primary-dark hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-300"
                                >
                                    {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Resetting...</> : "Reset Password"}
                                </button>
                            </form>
                        </div>
                    )}

                    {step === "SUCCESS" && (
                        <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto text-success">
                                <CheckCircle className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-bold text-foreground">Password Reset Successful</h2>
                            <p className="text-foreground-secondary">
                                Your password has been successfully reset. You can now login with your new password.
                            </p>
                            <Link
                                to="/login"
                                className="inline-block mt-4 w-full py-3.5 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-primary to-primary-dark hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 text-center transition-all"
                            >
                                Return to Login
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
