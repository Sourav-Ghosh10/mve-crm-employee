export const getApiBaseUrl = (): string => {
    try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (typeof import.meta !== "undefined" && import.meta?.env?.VITE_API_URL) {
            return import.meta.env.VITE_API_URL;
        }
    } catch {
        // Safe fallback
    }
    return "http://localhost:5000/api";
};
