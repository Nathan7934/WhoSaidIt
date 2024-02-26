"use client";

import usePostRegistration from "@/app/hooks/api_access/authentication/usePostRegistration";
import useNavBar from "@/app/hooks/context_imports/useNavBar";
import useAdjustContentHeight from "@/app/hooks/useAdjustContentHeight";
import { validateUsername, validateEmail, validatePassword } from "@/app/utilities/formValidationFunctions";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import UserSmallIcon from "@/app/components/icons/nav-bar/UserSmallIcon";
import EmailIcon from "@/app/components/icons/nav-bar/EmailIcon";
import PasswordIcon from "@/app/components/icons/nav-bar/PasswordIcon";

export default function Register() {

    const postRegistration = usePostRegistration();
    const { setRefetchDataCounter } = useNavBar();
    const router = useRouter();

    // Register form fields states
    const [registerUsername, setRegisterUsername] = useState<string>("");
    const [registerPassword, setRegisterPassword] = useState<string>("");
    const [registerConfirmPassword, setRegisterConfirmPassword] = useState<string>("");
    const [registerEmail, setRegisterEmail] = useState<string>("");

    // Form validation states
    const [submitFailed, setSubmitFailed] = useState<boolean>(false);
    const [usernameValid, setUsernameValid] = useState<boolean>(true);
    const [emailValid, setEmailValid] = useState<boolean>(true);
    const [passwordValidMessage, setPasswordValidMessage] = useState<string>(""); // Empty string means valid
    const [confirmPasswordValid, setConfirmPasswordValid] = useState<boolean>(true);

    // Registration loading state
    const [registerLoading, setRegisterLoading] = useState<boolean>(false);

    // Registration error message
    const [registerError, setRegisterError] = useState<string>(""); // Empty string means no error

    // Adjust the height of the page content area
    useAdjustContentHeight(".navbar", ".page-content");

    const handleRegisterChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = event.target;
        if (name === "username") {
            setRegisterUsername(value);
            setUsernameValid(validateUsername(value));
        } else if (name === "password") {
            setRegisterPassword(value);
            setPasswordValidMessage(validatePassword(value));
        } else if (name === "confirmPassword") {
            setRegisterConfirmPassword(value);
            setConfirmPasswordValid(value === registerPassword);
        } else if (name === "email") {
            setRegisterEmail(value);
            setEmailValid(validateEmail(value));
        }
    }

    const registerSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        if (!isFormValid()) {
            return;
        }
        setRegisterLoading(true);
        postRegistration(registerUsername, registerPassword, registerEmail)
        .then((error: string | null) => {
            if (!error) {
                // If we successfully registered, redirect to the dashboard
                router.push("/dashboard");
                setRefetchDataCounter(c => c + 1); // This will trigger a refetch of the data in the navbar
            } else {
                // If there was an error
                console.error(error);
                setRegisterError(error);
                setRegisterLoading(false);
            }
        });
    }

    const isFormValid = (): boolean => {
        if (
            (usernameValid && emailValid && passwordValidMessage === "" && confirmPasswordValid) &&
            (registerUsername !== "" && registerEmail !== "" && registerPassword !== "" && registerConfirmPassword !== "")
        ) {
            return true;
        }
        if (registerUsername === "") setUsernameValid(false);
        if (registerEmail === "") setEmailValid(false);
        if (registerPassword === "") setPasswordValidMessage("Password cannot be empty");
        if (registerConfirmPassword === "") setConfirmPasswordValid(false);
        setSubmitFailed(true);
        return false;
    }

    // ========================================================================================================================

    return(<>
        <div className="navbar h-navbar w-full" /> {/* Navbar spacer */}
        <main className="page-content flex flex-col overflow-y-scroll items-center justify-center">
            <div className="relative bottom-3 md:bottom-12 mx-auto flex w-full max-w-sm flex-col">
                <div className="flex flex-col items-center mb-8">
                    <h1 className="text-3xl font-semibold">Register</h1>
                    <p className="text-sm mt-1">Enter your information to create an account</p>
                </div>
                <form className="form-group gap-[10px] px-4 sm:px-0" onSubmit={registerSubmit}>
                    <div className="form-field gap-1">
                        <label className="form-label">
                            <div className="flex items-end">
                                <UserSmallIcon className="w-[18px] h-[18px] mr-[6px] relative bottom-[2px]" />
                                Username
                            </div>
                            {!usernameValid && <span className="form-label-alt text-zinc-500">Must be at least 4 characters</span>}
                        </label>
                        {/* Username input field */}
                        <input placeholder="Type here" name="username" value={registerUsername} onChange={handleRegisterChange}
                        className={`input max-w-full focus:border-blue-500 border-[1px] bg-black border-zinc-700 placeholder-zinc-600
                        ${!usernameValid && submitFailed ? " input-error" : ""}`}/>
                    </div>
                    <div className="form-field gap-1">
                        <label className="form-label">
                            <div className="flex items-end">
                                <EmailIcon className="w-[18px] h-[18px] mr-[6px] relative bottom-[1px]" />
                                Email Address
                            </div>
                            {!emailValid && <span className="form-label-alt text-zinc-500">Must be a valid email</span>}
                        </label>
                        {/* Email input field */}
                        <input placeholder="Type here" type="email" name="email" value={registerEmail} onChange={handleRegisterChange}
                        className={`input max-w-full focus:border-blue-500 border-[1px] bg-black border-zinc-700 placeholder-zinc-600
                        ${!emailValid && submitFailed ? " input-error" : ""}`}/>
                    </div>
                    <div className="form-field mt-5 gap-1">
                        <label className="form-label">
                            <div className="flex items-end">
                                <PasswordIcon className="w-[18px] h-[18px] mr-[6px] relative bottom-[2px]" />
                                Password
                            </div>
                            {passwordValidMessage && <span className="form-label-alt text-zinc-500">{passwordValidMessage}</span>}
                        </label>
                        <div className="form-control">
                            {/* Password input field */}
                            <input placeholder="Type here" type="password"  name="password" value={registerPassword} onChange={handleRegisterChange}
                            className={`input max-w-full focus:border-blue-500 border-[1px] bg-black border-zinc-700 placeholder-zinc-600
                            ${passwordValidMessage && submitFailed ? " input-error" : ""}`}/>
                        </div>
                    </div>
                    <div className="form-field gap-1">
                        <label className="form-label">
                            <div className="flex items-end">
                                <PasswordIcon className="w-[18px] h-[18px] mr-[6px] relative bottom-[2px]" />
                                Confirm Password
                            </div>
                            {!confirmPasswordValid && <span className="form-label-alt text-zinc-500">Passwords must match</span>}
                        </label>
                        <div className="form-control">
                            {/* Confirm Password input field */}
                            <input placeholder="Type here" type="password" name="confirmPassword" value={registerConfirmPassword} onChange={handleRegisterChange}
                            className={`input max-w-full focus:border-blue-500 border-[1px] bg-black border-zinc-700 placeholder-zinc-600
                            ${!confirmPasswordValid && submitFailed ? " input-error" : ""}`}/>
                        </div>
                    </div>
                    <div className="form-field pt-5">
                        <div className="form-control justify-between">
                            <button type="submit" className={`btn w-full 
                            ${registerLoading ? " btn-outline bg-black" : " bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"}`}>
                                {registerLoading ? 
                                    <div className="spinner-dot-pulse">
                                        <div className="spinner-pulse-dot"></div>
                                    </div> 
                                    : "Register"
                                }
                            </button>
                        </div>
                    </div>
                    <div className="form-field">
                        <div className="form-control justify-center">
                            <Link href="/login" className="link link-underline-hover text-blue-500 text-sm font-semibold
                            text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                                Already have an account? Sign in.
                            </Link>
                        </div>
                    </div>
                    {/* Registration error alert */}
                    {registerError !== "" &&
                    <div className="alert alert-info w-full py-3 absolute bottom-[-100px] max-w-[350px] sm:max-w-full sm:relative sm:top-0
                    left-[50%] translate-x-[-50%] sm:left-0 sm:translate-x-0">
                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M24 4C12.96 4 4 12.96 4 24C4 35.04 12.96 44 24 44C35.04 44 44 35.04 44 24C44 12.96 35.04 4 24 4ZM24 34C22.9 34 22 33.1 22 32V24C22 22.9 22.9 22 24 22C25.1 22 26 22.9 26 24V32C26 33.1 25.1 34 24 34ZM26 18H22V14H26V18Z" fill="#0085FF" />
                        </svg>
                        <div className="flex flex-col">
                            <span>{registerError}</span>
                        </div>
                    </div>
                    }
                </form>
            </div>
        </main>
    </>);
}