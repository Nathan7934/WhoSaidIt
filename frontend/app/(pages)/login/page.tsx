"use client";

import usePostLogin from "@/app/hooks/api_access/authentication/usePostLogin";
import useNavBar from "@/app/hooks/context_imports/useNavBar";
import UserSmallIcon from "@/app/components/icons/nav-bar/UserSmallIcon";
import PasswordIcon from "@/app/components/icons/nav-bar/PasswordIcon";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {

    const postLogin = usePostLogin();
    const router = useRouter();
    const { setRefetchDataCounter } = useNavBar();

    // Login form fields state
    const [loginUsername, setLoginUsername] = useState<string>("");
    const [loginPassword, setLoginPassword] = useState<string>("");
    const [rememberUser, setRememberUser] = useState<boolean>(true);

    // Login error message state
    const [loginError, setLoginError] = useState<string>(""); // Empty string means no error

    // Login loading state
    const [loginLoading, setLoginLoading] = useState<boolean>(false);

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
        setLoginLoading(true);
        postLogin(loginUsername, loginPassword, rememberUser)
        .then((error: string | null) => {
            if (!error) {
                // If we successfully logged in, redirect to the dashboard
                router.push("/dashboard");
                setRefetchDataCounter(c => c + 1); // This will trigger a refetch of the data in the navbar
            } else {
                // If there was an error
                console.error(error);
                setLoginError(error);
                setLoginLoading(false);
            }
        });
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <div className="absolute mx-auto flex w-full max-w-sm flex-col gap-6 top-[47%] sm:top-[40%] translate-y-[-50%]">
                <div className="relative flex flex-col items-center">
                    <h1 className="text-3xl font-semibold">Sign In</h1>
                    <p className="text-sm">Sign in to access your account</p>
                </div>
                <form className="form-group px-4 sm:px-0" onSubmit={loginSubmit}>
                    <div className="form-field">
                        <label className="form-label">
                            <div className="flex items-end">
                                <UserSmallIcon className="w-[18px] h-[18px] mr-[6px] relative bottom-[2px]" />
                                Username
                            </div>
                        </label>
                        {/* Username input field */}
                        <input placeholder="Type here" name="username" value={loginUsername} onChange={handleLoginChange}
                        className="input max-w-full focus:border-blue-500 border-[1px] bg-black border-zinc-700 placeholder-zinc-600"/>
                    </div>
                    <div className="form-field">
                        <label className="form-label">
                            <div className="flex items-end">
                                <PasswordIcon className="w-[18px] h-[18px] mr-[6px] relative bottom-[2px]" />
                                Password
                            </div>
                        </label>
                        <div className="form-control">
                            {/* Password input field */}
                            <input placeholder="Type here" type="password" name="password" value={loginPassword} onChange={handleLoginChange}
                            className="input max-w-full focus:border-blue-500 border-[1px] bg-black border-zinc-700 placeholder-zinc-600"/>
                        </div>
                    </div>
                    <div className="form-field">
                        <div className="form-control justify-between">
                            <div className="flex gap-2">
                                <input type="checkbox" className="checkbox" checked={rememberUser} onChange={(e) => setRememberUser(e.target.checked)} />
                                <a href="#">Remember me</a>
                            </div>
                            <label className="form-label">
                                <a className="link link-underline-hover text-sm font-semibold
                                text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                                    Forgot your password?
                                </a>
                            </label>
                        </div>
                    </div>
                    <div className="form-field pt-5">
                        <div className="form-control justify-between">
                            <button type="submit" className={`btn w-full 
                            ${loginLoading ? " btn-outline border-zinc-800 bg-black" : " bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"}`}>
                                {loginLoading ? 
                                    <div className="spinner-dot-pulse">
                                        <div className="spinner-pulse-dot"></div>
                                    </div> 
                                    : "Sign In"
                                }
                            </button>
                        </div>
                    </div>
                    <div className="form-field">
                        <div className="form-control justify-center">
                            <Link href="/register" className="link link-underline-hover text-sm font-semibold
                            text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                                Don't have an account yet? Sign up.
                            </Link>
                        </div>
                    </div>
                    {/* Login error alert */}
                    {loginError !== "" &&
                    <div className="alert alert-info w-full py-3 absolute bottom-[-100px] max-w-[350px] sm:max-w-full sm:relative sm:top-0
                    left-[50%] translate-x-[-50%] sm:left-0 sm:translate-x-0">
                        <svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M24 4C12.96 4 4 12.96 4 24C4 35.04 12.96 44 24 44C35.04 44 44 35.04 44 24C44 12.96 35.04 4 24 4ZM24 34C22.9 34 22 33.1 22 32V24C22 22.9 22.9 22 24 22C25.1 22 26 22.9 26 24V32C26 33.1 25.1 34 24 34ZM26 18H22V14H26V18Z" fill="#0085FF" />
                        </svg>
                        <div className="flex flex-col">
                            <span>{loginError}</span>
                        </div>
                    </div>
                    }
                </form>
            </div>
        </main>
    )
}
