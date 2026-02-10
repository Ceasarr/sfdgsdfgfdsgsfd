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
            enterprise: {
                ready: (cb: () => void) => void;
                execute: (
                    siteKey: string,
                    options: { action: string }
                ) => Promise<string>;
            };
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
        if (document.querySelector('script[src*="recaptcha/enterprise.js"]')) {
            if (window.grecaptcha?.enterprise) {
                window.grecaptcha.enterprise.ready(() => setIsLoaded(true));
            }
            return;
        }

        const script = document.createElement("script");
        script.src = `https://www.google.com/recaptcha/enterprise.js?render=${SITE_KEY}`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
            window.grecaptcha.enterprise.ready(() => setIsLoaded(true));
        };
        script.onerror = () => {
            console.error("Failed to load reCAPTCHA Enterprise script");
        };
        document.head.appendChild(script);
    }, []);

    const executeRecaptcha = useCallback(
        async (action: string): Promise<string> => {
            if (!SITE_KEY) {
                throw new Error("reCAPTCHA site key not configured");
            }

            if (!window.grecaptcha?.enterprise) {
                throw new Error("reCAPTCHA Enterprise not loaded yet");
            }

            return window.grecaptcha.enterprise.execute(SITE_KEY, { action });
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
