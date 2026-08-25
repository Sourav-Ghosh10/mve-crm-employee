import { getToken, onMessage, type MessagePayload } from "firebase/messaging";
import { messaging } from "../lib/firebase";
import api from "./api";

let messageCallback: ((payload: MessagePayload) => void) | null = null;

const pushNotificationService = {
    /**
     * Set callback for foreground messages
     */
    setOnMessageCallback: (cb: (payload: MessagePayload) => void) => {
        messageCallback = cb;
    },

    /**
     * Request permission and register token
     * // 🔒 NON-BLOCKING — DOES NOT AFFECT EXISTING FLOW
     */
    requestPermissionAndRegister: async () => {
        if (!messaging || !("Notification" in window) || !("serviceWorker" in navigator)) {
            console.warn("Notifications or Service Workers not supported in this browser");
            return;
        }

        try {
            const permission = await Notification.requestPermission();
            if (permission === "granted") {
                // 🛠️ FIX for Edge & Safari: Explicitly register and wait for service worker
                // 🛠️ FIX for import.meta: Pass config via URL params since SW in public/ can't see env vars
                const firebaseConfigParams = new URLSearchParams({
                    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
                    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
                    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
                    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
                    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
                    appId: import.meta.env.VITE_FIREBASE_APP_ID,
                }).toString();

                const registration = await navigator.serviceWorker.register(`/firebase-messaging-sw.js?${firebaseConfigParams}`, {
                    scope: "/",
                });

                const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
                if (!vapidKey) {
                    console.error("❌ Missing VITE_FIREBASE_VAPID_KEY in .env file. Push notifications require this key.");
                    return;
                }

                const token = await getToken(messaging, {
                    vapidKey,
                    serviceWorkerRegistration: registration,
                });

                if (token) {
                    // Register token with backend using our api utility
                    await api.post(
                        "/notifications/register",
                        { token, deviceType: "web" },
                        { skipLoading: true } as never
                    );
                    // console.log("FCM Token registered successfully");
                }
            }
        } catch (error) {
            // 🔒 NON-BLOCKING
            console.error("Error registering push notification:", error);
        }
    },

    /**
     * Unregister token from backend
     * Called when user logs out
     */
    unregisterToken: async () => {
        try {
            await api.post("/notifications/unregister", {}, { skipLoading: true } as never);
            console.log("FCM Token unregistered successfully");
        } catch (error) {
            // 🔒 NON-BLOCKING — Continue logout even if unregister fails
            console.error("Error unregistering push notification token:", error);
        }
    },

    /**
     * Listen for foreground messages
     */
    listenForMessages: () => {
        if (!messaging) return () => { };


        const unsubscribe = onMessage(messaging, (payload) => {
            console.log("Foreground message received:", payload);

            // Trigger the callback if registered
            if (messageCallback) {
                messageCallback(payload);
            }
        });

        // Listen for messages from the Service Worker (background messages)
        const swListener = (event: MessageEvent) => {
            if (event.data && event.data.type === "BACKGROUND_MESSAGE_RECEIVED") {
                // console.log("Background message received via SW broadcast:", event.data.payload);
                if (messageCallback) {
                    messageCallback(event.data.payload);
                }
            }
        };

        navigator.serviceWorker.addEventListener("message", swListener);

        return () => {
            unsubscribe();
            navigator.serviceWorker.removeEventListener("message", swListener);
        };
    },
};

export default pushNotificationService;
