"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useRequestLogin from "@/app/hooks/api-access/useRequestLogin";

export default function Login() {

    const requestLogin = useRequestLogin();
    const router = useRouter();

    // Login form fields state
    const [loginUsername, setLoginUsername] = useState<string>("");
    const [loginPassword, setLoginPassword] = useState<string>("");

    // The onChange event handler for the login form fields
    const handleLoginChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = event.target;
        if (name === "username") {
            setLoginUsername(value);
        } else if (name === "password") {
            setLoginPassword(value);
        }
    };

    const loginSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        requestLogin(loginUsername, loginPassword)
        .then((error: string | null) => {
            if (!error) {
                // If we successfully logged in, redirect to the dashboard
                router.push("/dashboard");
            } else {
                // If there was an error, log it to the console
                // TODO: Display the error to the user
                console.error(error);
            }
        });
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <div className="absolute mx-auto flex w-full max-w-sm flex-col gap-6 top-[40%] translate-y-[-50%]">
                <div className="flex flex-col items-center">
                    <h1 className="text-3xl font-semibold">Sign In</h1>
                    <p className="text-sm">Sign in to access your account</p>
                </div>
                <form className="form-group" onSubmit={loginSubmit}>
                    <div className="form-field">
                        <label className="form-label">Username</label>
                        {/* Username input field */}
                        <input placeholder="Type here" className="input max-w-full" 
                        name="username" value={loginUsername} onChange={handleLoginChange}/>
                        {/* <label className="form-label">
                        <span className="form-label-alt">Please enter a valid email.</span>
                        </label> */}
                    </div>
                    <div className="form-field">
                        <label className="form-label">Password</label>
                        <div className="form-control">
                            {/* Password input field */}
                            <input placeholder="Type here" type="password" className="input max-w-full" 
                            name="password" value={loginPassword} onChange={handleLoginChange}/>
                        </div>
                    </div>
                    <div className="form-field">
                        <div className="form-control justify-between">
                            <div className="flex gap-2">
                                <input type="checkbox" className="checkbox" />
                                <a href="#">Remember me</a>
                            </div>
                            <label className="form-label">
                                <a className="link link-underline-hover link-primary text-sm">Forgot your password?</a>
                            </label>
                        </div>
                    </div>
                    <div className="form-field pt-5">
                        <div className="form-control justify-between">
                            <button type="submit" className="btn btn-primary w-full">
                                Sign in
                            </button>
                        </div>
                    </div>
                    <div className="form-field">
                        <div className="form-control justify-center">
                            <a className="link link-underline-hover link-primary text-sm">Don't have an account yet? Sign up.</a>
                        </div>
                    </div>
                </form>
            </div>
        </main>
    )
}
