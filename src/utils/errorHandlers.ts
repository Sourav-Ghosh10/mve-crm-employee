import axios from "axios";

export const getErrorMessage = (error: unknown, fallback: string = "An unexpected error occurred"): string => {
    if (axios.isAxiosError(error)) {
        // Check for the specific structure: { success: false, error: { message: "..." } }
        const serverError = error.response?.data?.error;
        if (serverError && typeof serverError.message === "string") {
            return serverError.message;
        }

        // Check for { success: false, message: "..." }
        const data = error.response?.data;
        if (data && typeof data.message === "string") {
            return data.message;
        }

        // fallback to axios error message
        return error.message || fallback;
    }

    if (error instanceof Error) {
        return error.message;
    }

    if (typeof error === "string") {
        return error;
    }

    return fallback;
};
