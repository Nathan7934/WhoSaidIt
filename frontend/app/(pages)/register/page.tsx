"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import usePostRegistration from "@/app/hooks/api_access/authentication/usePostRegistration";

export default function Register() {

    const postRegistration = usePostRegistration();
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
            } else {
                // If there was an error
                console.error(error);
                setRegisterError(error);
                setRegisterLoading(false);
            }
        });
    }

    // Validation functions:
    // TODO: Add identical validation to the backend
    // ========================================================================================================================
    const isFormValid = (): boolean => {
        if (
            (usernameValid && emailValid && passwordValidMessage === "" && confirmPasswordValid) &&
            (registerUsername !== "" && registerEmail !== "" && registerPassword !== "" && registerConfirmPassword !== "")
        ) {
            return true;
        }
        if (registerUsername === "") {
            setUsernameValid(false);
        }
        if (registerEmail === "") {
            setEmailValid(false);
        }
        if (registerPassword === "") {
            setPasswordValidMessage("Password cannot be empty");
        }
        if (registerConfirmPassword === "") {
            setConfirmPasswordValid(false);
        }
        setSubmitFailed(true);
        return false;
    }

    const validateUsername = (username: string): boolean => {
        return username.length > 3;
    }

    const validateEmail = (email: string): boolean => {
        const eReg: RegExp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return eReg.test(email.toLowerCase());
    }

    const validatePassword = (password: string): string => {
        let invalidMessage: string = "";
        if (password.length <= 8) {
            invalidMessage = "Must be at least 8 characters";
        } else if (!/[A-Za-z]/.test(password)) {
            invalidMessage = "Must contain at least one letter";
        } else if (!/[A-Z]/.test(password)) {
            invalidMessage = "At least one letter must be uppercase";
        } else if (!/\d/.test(password)) {
            invalidMessage = "Must contain at least one number";
        } else if (!/[.,!@#$%^&*]/.test(password)) {
            invalidMessage = "Must contain at least one of .,!@#$%^&*";
        }
        return invalidMessage;
    }
    // ========================================================================================================================

    return(
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <div className="absolute mx-auto flex w-full max-w-sm flex-col gap-6 top-[40%] translate-y-[-50%]">
                <div className="flex flex-col items-center">
                    <h1 className="text-3xl font-semibold">Register</h1>
                    <p className="text-sm mt-1">Enter your credentials to create an account</p>
                </div>
                <form className="form-group" onSubmit={registerSubmit}>
                    <div className="form-field">
                        <label className="form-label">
                            Username
                            {!usernameValid && <span className="form-label-alt text-error">Must be at least 4 characters</span>}
                        </label>
                        {/* Username input field */}
                        <input placeholder="Type here" className={"input max-w-full" + (!usernameValid && submitFailed ? " input-error" : "")} 
                        name="username" value={registerUsername} onChange={handleRegisterChange}/>
                    </div>
                    <div className="form-field">
                        <label className="form-label">
                            Email address
                            {!emailValid && <span className="form-label-alt text-error">Must be a valid email</span>}
                        </label>
                        {/* Email input field */}
                        <input placeholder="Type here" className={"input max-w-full" + (!usernameValid && submitFailed ? " input-error" : "")} 
                        type="email" name="email" value={registerEmail} onChange={handleRegisterChange}/>
                        
                    </div>
                    <div className="form-field mt-5">
                        <label className="form-label">
                            Password
                            {passwordValidMessage && <span className="form-label-alt text-error">{passwordValidMessage}</span>}
                        </label>
                        <div className="form-control">
                            {/* Password input field */}
                            <input placeholder="Type here" type="password" className={"input max-w-full" + (!usernameValid && submitFailed ? " input-error" : "")} 
                            name="password" value={registerPassword} onChange={handleRegisterChange}/>
                        </div>
                    </div>
                    <div className="form-field">
                        <label className="form-label">
                            Confirm Password
                            {!confirmPasswordValid && <span className="form-label-alt text-error">Passwords must match</span>}
                        </label>
                        <div className="form-control">
                            {/* Confirm Password input field */}
                            <input placeholder="Type here" type="password" className={"input max-w-full" + (!usernameValid && submitFailed ? " input-error" : "")} 
                            name="confirmPassword" value={registerConfirmPassword} onChange={handleRegisterChange}/>
                        </div>
                    </div>
                    <div className="form-field pt-5">
                        <div className="form-control justify-between">
                            <button type="submit" className={"btn w-full" + (registerLoading ? " btn-outline-primary" : " btn-primary")}>
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
                            <Link href="/login" className="link link-underline-hover link-primary text-sm">Already have an account? Sign in.</Link>
                        </div>
                    </div>
                    {/* Registration error alert */}
                    {registerError !== "" &&
                    <div className="alert alert-error mt-2">
                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M24 4C12.96 4 4 12.96 4 24C4 35.04 12.96 44 24 44C35.04 44 44 35.04 44 24C44 12.96 35.04 4 24 4ZM24 26C22.9 26 22 25.1 22 24V16C22 14.9 22.9 14 24 14C25.1 14 26 14.9 26 16V24C26 25.1 25.1 26 24 26ZM26 34H22V30H26V34Z" fill="#E92C2C" />
                        </svg>
                        <div className="flex flex-col">
                            <span>Error occurred during registration</span>
                            <span className="text-content2">{registerError}</span>
                        </div>
                    </div>
                    }
                </form>
            </div>
        </main>
    );
}