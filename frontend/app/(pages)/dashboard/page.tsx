"use client";

import useAuth from "@/app/hooks/useAuth";

export default function Dashboard() {

    const { userId } = useAuth();

    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <div className="absolute mx-auto flex w-full max-w-sm flex-col gap-6 top-[40%] translate-y-[-50%]">
                <div className="flex flex-col items-center">
                    <h1 className="text-3xl font-semibold">Dashboard</h1>
                    <p className="text-sm">User with id: {userId} currently authenticated</p>
                </div>
            </div>
        </main>
    )
}