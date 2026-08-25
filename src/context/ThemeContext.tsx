import React, { createContext, useContext, useEffect, useState } from "react";
import { getItem, setItem } from "../utils/storage";
import { useTranslation } from "react-i18next";

interface AppearanceSettings {
    darkMode: boolean;
    compactMode: boolean;
    accentColor: string;
    language: string;
}

interface ThemeContextType {
    appearance: AppearanceSettings;
    updateAppearance: (key: keyof AppearanceSettings, value: string | boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const SETTINGS_KEY = "user_settings";

const ACCENT_VARIANTS: Record<string, { light: string; fore: string }> = {
    "#1976d2": { light: "#42a5fa", fore: "#ffffff" },
    "#9c27b0": { light: "#ba68c8", fore: "#ffffff" },
    "#f44336": { light: "#ef5350", fore: "#ffffff" },
    "#4caf50": { light: "#66bb6a", fore: "#ffffff" },
    "#ff9800": { light: "#ffb74d", fore: "#ffffff" },
    "#00bcd4": { light: "#26c6da", fore: "#ffffff" },
};

const defaultSettings: AppearanceSettings = {
    darkMode: false,
    compactMode: false,
    accentColor: "#1976d2",
    language: "en",
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { i18n } = useTranslation();
    const [appearance, setAppearance] = useState<AppearanceSettings>(() => {
        const stored = getItem(SETTINGS_KEY);
        if (stored && stored.appearance) {
            return { ...defaultSettings, ...stored.appearance };
        }
        return defaultSettings;
    });

    // Effect for Dark Mode
    useEffect(() => {
        if (appearance.darkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [appearance.darkMode]);

    // Effect for Compact Mode
    useEffect(() => {
        if (appearance.compactMode) {
            document.documentElement.classList.add("compact");
        } else {
            document.documentElement.classList.remove("compact");
        }
    }, [appearance.compactMode]);

    // Effect for Accent Color
    useEffect(() => {
        const color = appearance.accentColor;
        const variant = ACCENT_VARIANTS[color] || { light: color, fore: "#ffffff" };

        document.documentElement.style.setProperty("--accent", color);
        document.documentElement.style.setProperty("--accent-light", variant.light);
        document.documentElement.style.setProperty("--accent-foreground", variant.fore);
        document.documentElement.style.setProperty("--ring", color);

        // Also override primary if accent is supposed to replace primary in some designs,
        // but here we keep them separate as per CSS.

    }, [appearance.accentColor]);

    // Effect for Language
    useEffect(() => {
        if (appearance.language && i18n.language !== appearance.language) {
            i18n.changeLanguage(appearance.language);
        }
    }, [appearance.language, i18n]);

    const updateAppearance = (key: keyof AppearanceSettings, value: string | boolean) => {
        setAppearance((prev) => {
            const next = { ...prev, [key]: value };

            // Persist to localStorage immediately
            const stored = getItem(SETTINGS_KEY) || {};
            const newSettings = {
                ...stored,
                appearance: next,
            };
            setItem(SETTINGS_KEY, newSettings);

            return next;
        });
    };

    // Prevent flash of incorrect theme by rendering updates efficiently, 
    // but initial render must happen.

    return (
        <ThemeContext.Provider value={{ appearance, updateAppearance }}>
            {children}
        </ThemeContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};
