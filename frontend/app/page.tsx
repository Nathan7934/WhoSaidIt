"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import useRefreshToken from "./hooks/useRefreshToken";

export default function App() {

    const router = useRouter();
    const refreshToken = useRefreshToken();

    useEffect(() => {
        const authRefresh = async () => {
            if (await refreshToken()) {
                // If we successfully refreshed (i.e. user has a stored refresh cookie), redirect to the dashboard
                router.push("/dashboard");
            } else {
                // If no token was returned or there was an error, redirect to the login page
                console.log("No token returned or there was an error");
                router.push("/login");
            }
        }
        authRefresh();
    }, []);

    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <div className="absolute mx-auto flex w-full max-w-sm flex-col gap-6 top-[40%] translate-y-[-50%] items-center">
                <div className="text-xl">Verifying authentication status</div>
                <div className="spinner-dot-pulse spinner-lg">
                    <div className="spinner-pulse-dot"></div>
                </div>
            </div>
        </main>
    )
}