"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/ui/auth-context";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isLoading, isAdmin } = useAuth();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        if (!isLoading) {
            if (!user || !isAdmin) {
                router.push("/login");
            } else {
                setIsAuthorized(true);
            }
        }
    }, [user, isLoading, isAdmin, router]);

    if (isLoading || !isAuthorized) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="relative w-12 h-12 mx-auto mb-4">
                        <div className="absolute inset-0 rounded-full border-4 border-muted"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-600 animate-spin"></div>
                    </div>
                    <p className="text-muted-foreground">Verifying admin access...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
