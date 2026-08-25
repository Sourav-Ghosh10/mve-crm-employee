import { store } from "../store/store";

export const DEFAULT_TIMEZONE = "Asia/Kolkata";

/**
 * Gets the current user's timezone from the Redux store
 */
export const getUserTimezone = (): string => {
    try {
        const state = store.getState();
        return state.auth.user?.timezone || DEFAULT_TIMEZONE;
    } catch (_error) {
        return DEFAULT_TIMEZONE;
    }
};

/**
 * Formats a date string or object according to the user's timezone
 */
export const formatInTimezone = (
    date: Date | string | number,
    options: Intl.DateTimeFormatOptions = {},
    _timezone?: string
): string => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "Invalid Date";

    // Use browser default timezone
    return new Intl.DateTimeFormat("en-US", {
        ...options,
    }).format(d);
};

/**
 * Helper to get a date object.
 * Simply returns the Date object which is already UTC-timestamp based but browser interprets as local.
 */
export const getDateInTimezone = (date: Date | string | number, _timezone?: string): Date => {
    return new Date(date);
};
