"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    ReactNode,
} from "react";

interface ReCaptchaContextType {
    executeRecaptcha: (action: string) => Promise<string>;
    isLoaded: boolean;
}

const ReCaptchaContext = createContext<ReCaptchaContextType | undefined>(
    undefined
);

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";

declare global {
    interface Window {
        grecaptcha: {
            ready: (cb: () => void) => void;
            execute: (
                siteKey: string,
                options: { action: string }
            ) => Promise<string>;
        };
    }
}

export function ReCaptchaProvider({ children }: { children: ReactNode }) {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (!SITE_KEY) {
            console.warn("NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not set");
            return;
        }

        // Don't load twice
        if (document.querySelector('script[src*="recaptcha/api.js"]')) {
            if (window.grecaptcha) {
                window.grecaptcha.ready(() => setIsLoaded(true));
            }
            return;
        }

        const script = document.createElement("script");
        script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
            window.grecaptcha.ready(() => setIsLoaded(true));
        };
        document.head.appendChild(script);
    }, []);

    const executeRecaptcha = useCallback(
        async (action: string): Promise<string> => {
            if (!SITE_KEY) {
                throw new Error("reCAPTCHA site key not configured");
            }

            if (!window.grecaptcha) {
                throw new Error("reCAPTCHA not loaded yet");
            }

            return window.grecaptcha.execute(SITE_KEY, { action });
        },
        []
    );

    return (
        <ReCaptchaContext.Provider value={{ executeRecaptcha, isLoaded }}>
            {children}
        </ReCaptchaContext.Provider>
    );
}

export function useReCaptcha() {
    const context = useContext(ReCaptchaContext);
    if (context === undefined) {
        throw new Error("useReCaptcha must be used within a ReCaptchaProvider");
    }
    return context;
}
