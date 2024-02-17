"use client";

import usePostRequestPasswordReset from "@/app/hooks/api_access/authentication/usePostRequestPasswordReset";
import { validateEmail } from "@/app/utilities/formValidationFunctions";

import { useState } from "react";
import Link from "next/link";

export default function Recover() {

    const postRequestPasswordReset = usePostRequestPasswordReset();

    // Recover form fields state
    const [recoverEmail, setRecoverEmail] = useState<string>("");

    // UI States
    const [recoverResponse, setRecoverResponse] = useState<string>(""); // Empty string means no error
    const [emailValid, setEmailValid] = useState<boolean>(true);
    const [recoverLoading, setRecoverLoading] = useState<boolean>(false);

    const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const { value } = event.target;
        setRecoverEmail(value);
        setEmailValid(validateEmail(value));
    }

    const recoverSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        if (!emailValid || recoverEmail === "") return;

        setRecoverLoading(true);
        postRequestPasswordReset(recoverEmail)
        .then((error: string | null) => {
            if (!error) {
                // If we successfully requested a password reset
                setRecoverResponse("Password reset email sent. Check your email for further instructions.");
            } else {
                // If there was an error
                console.error(error);
                setRecoverResponse(error);
            }
            setRecoverLoading(false);
        });
    }

    return (<>
        <div className="w-full h-navbar" /> {/* Navbar spacer */}
        <main className="flex flex-col min-h-content max-h-content overflow-y-scroll items-center justify-center">
            <div className="relative bottom-3 md:bottom-12 mx-auto flex w-full max-w-sm flex-col">
                <div className="relative flex flex-col items-center mb-12 gap-2">
                    <h1 className="text-3xl font-semibold">Account Recovery</h1>
                    <p className="text-sm">Enter the email associated with your account</p>
                </div>
                <form className="form-group px-4 sm:px-0" onSubmit={recoverSubmit}>
                    <div className="form-field">
                        <label className="form-label leading-5">
                            Email Address
                            {!emailValid && <span className="form-label-alt text-zinc-500">Must be a valid email</span>}
                        </label>
                        {/* Username input field */}
                        <input placeholder="Type here" name="username" value={recoverEmail} onChange={handleEmailChange}
                        className="input max-w-full focus:border-blue-500 border-[1px] bg-black border-zinc-700 placeholder-zinc-600"/>
                    </div>
                    <div className="form-field mt-2 mb-[2px]">
                        <div className="form-control justify-between">
                            <button type="submit" className={`btn w-full 
                            ${recoverLoading ? " btn-outline border-zinc-800 bg-black" : " bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"}`}>
                                {recoverLoading ? 
                                    <div className="spinner-dot-pulse">
                                        <div className="spinner-pulse-dot"></div>
                                    </div> 
                                    : "Request Password Reset"
                                }
                            </button>
                        </div>
                    </div>
                    <div className="form-field">
                        <div className="form-control justify-center">
                            <Link href="/login" className="link link-underline-hover text-sm font-semibold
                            text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                                Go back to Sign In
                            </Link>
                        </div>
                    </div>
                    {recoverResponse !== "" &&
                    <div className="alert alert-info w-full py-3 absolute bottom-[-100px] max-w-[350px] sm:max-w-full sm:relative sm:top-0
                    left-[50%] translate-x-[-50%] sm:left-0 sm:translate-x-0">
                        <svg width="36" height="36" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M24 4C12.96 4 4 12.96 4 24C4 35.04 12.96 44 24 44C35.04 44 44 35.04 44 24C44 12.96 35.04 4 24 4ZM24 34C22.9 34 22 33.1 22 32V24C22 22.9 22.9 22 24 22C25.1 22 26 22.9 26 24V32C26 33.1 25.1 34 24 34ZM26 18H22V14H26V18Z" fill="#0085FF" />
                        </svg>
                        <div className="flex flex-col">
                            <span>{recoverResponse}</span>
                        </div>
                    </div>
                    }
                </form>
            </div>
        </main>
    </>);
}