"use client";

import { AuthProvider } from "./utilities/AuthContext";

export function Providers({ children }: { children: React.ReactNode }) {
    return(
        <AuthProvider>
            {children}
        </AuthProvider>
    );
}