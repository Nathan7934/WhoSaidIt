"use client";

import { INTERNAL_API_ROOT } from "./constants";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import useAuth from "./hooks/useAuth";

export default function App() {

    const router = useRouter();
    const { setUserId, setAuth } = useAuth();

    useEffect(() => {
        const authRefresh = async () => {
            try {
                const response = await fetch(`${INTERNAL_API_ROOT}/refresh`);
                const {user_id, access_token} = await response.json();
                
                if (access_token && user_id) {
                    // If we successfully refreshed (i.e. user has a stored refresh cookie), redirect to the dashboard
                    setUserId(user_id);
                    setAuth(access_token);
                    router.push("/dashboard");
                } else {
                    // If no token was returned or there was an error, redirect to the login page
                    console.log("No token returned or there was an error");
                    router.push("/login");
                }
            } catch (error) {
                console.error(error);
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