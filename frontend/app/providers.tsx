"use client";

import { AuthProvider } from "./utilities/AuthContext";
import { NavBarProvider } from "./utilities/NavBarContext";

export function Providers({ children }: { children: React.ReactNode }) {
    return(
        <AuthProvider>
            <NavBarProvider>
                {children}
            </NavBarProvider>
        </AuthProvider>
    );
}