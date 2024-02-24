"use client";

import usePatchPasswordReset from "@/app/hooks/api_access/authentication/usePatchPasswordReset";
import useValidatePasswordResetToken from "@/app/hooks/security/useValidatePasswordResetToken";
import useAdjustContentHeight from "@/app/hooks/useAdjustContentHeight";
import { validatePassword } from "@/app/utilities/formValidationFunctions";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ResetPassword({ params }: { params: { userId: string, token: string } }) {

    // Extracting the NextJS route parameters
    const { userId, token } = params;

    // ----------- Hooks ------------------
    const router = useRouter();
    const patchPasswordReset = usePatchPasswordReset();
    const validatePasswordResetToken = useValidatePasswordResetToken();

    // ----------- State (Data) -----------
    const [newPassword, setNewPassword] = useState<string>("");
    const [confirmNewPassword, setConfirmNewPassword] = useState<string>("");

    // ----------- State (UI) -------------
    const [validating, setValidating] = useState<boolean>(true);
    const [validationResponse, setValidationResponse] = useState<string | null>(null);
    const [resetting, setResetting] = useState<boolean>(false);
    const [resetResponse, setResetResponse] = useState<string | null>(null);
    const [newPasswordValidMessage, setNewPasswordValidMessage] = useState<string>("");
    const [confirmNewPasswordValid, setConfirmNewPasswordValid] = useState<boolean>(true);

    // Adjust the height of the page content area
    useAdjustContentHeight(".navbar", ".page-content");

    // Initial token validation. If successful, the user will be able to reset their password.
    // If the token is invalid, the user will be redirected to the login page after a delay.
    useEffect(() => {
        const validateToken = async () => {
            const error: string | null = await validatePasswordResetToken(userId, token);
            if (error) {
                setValidationResponse(`${error}.Redirecting to login page...`);
                setTimeout(() => {
                    router.push("/login");
                }, 3000)
            }
            setValidating(false);
        }
        validateToken();
    }, []);

    // ----------- Data Helpers -----------

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        switch (name) {
            case "newPassword":
                setNewPassword(value);
                setNewPasswordValidMessage(validatePassword(value));
                break;
            case "confirmNewPassword":
                setConfirmNewPassword(value);
                setConfirmNewPasswordValid(value === newPassword);
                break;
        }
    }

    const submitPasswordReset = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!isFormValid()) {
            return;
        }
        setResetting(true);

        // Attempt the password reset
        const error: string | null = await patchPasswordReset(userId, newPassword, token);
        if (error) {
            console.error("Error resetting password: ", error);
            setResetResponse(error);
            setResetting(false);
            return;
        }

        // If we get here, the password was reset successfully
        setResetting(false);
        setResetResponse("Password reset successfully. Redirecting to login page...");
        setTimeout(() => {
            router.push("/login");
        }, 3000);
    }

    const isFormValid = (): boolean => {
        if (newPasswordValidMessage === "" && confirmNewPasswordValid && 
            newPassword.length > 0 && confirmNewPassword.length > 0) {
            return true;
        }
        if (newPassword === "") setNewPasswordValidMessage("Password cannot be empty");
        if (confirmNewPassword === "") setConfirmNewPasswordValid(false);
        return false;
    }

    // ----------- Render ---------------

    if (validating) {
        return (
            <main className="flex min-h-screen flex-col items-center justify-between p-24">
                <div className="absolute mx-auto flex w-full max-w-sm flex-col gap-6 top-[50%] translate-y-[-50%] items-center">
                    <div className="text-xl">Validating Password Reset Link</div>
                    <div className="spinner-dot-pulse spinner-lg">
                        <div className="spinner-pulse-dot"></div>
                    </div>
                </div>
            </main>
        );
    }

    if (validationResponse) {
        return (
            <main className="flex min-h-screen flex-col items-center justify-between p-24">
                <div className="absolute mx-auto flex w-full max-w-sm flex-col gap-6 top-[50%] translate-y-[-50%] items-center">
                    <div className="text-xl text-center">{validationResponse}</div>
                </div>
            </main>
        );
    }

    return (<>
        <div className="navbar h-navbar w-full" /> {/* Navbar spacer */}
        <main className="page-content flex flex-col overflow-y-scroll items-center justify-center">
            <div className="relative bottom-3 md:bottom-12 mx-auto flex w-full max-w-sm flex-col">
                <div className="relative flex flex-col items-center mb-12 gap-2">
                    <h1 className="text-3xl font-semibold">Reset Password</h1>
                    <p className="text-sm">Enter your new password below</p>
                </div>
                <form className="form-group px-4 sm:px-0 gap-1" onSubmit={submitPasswordReset}>
                    <div className="form-field">
                        <label className="form-label leading-4">
                            New Password
                            {newPasswordValidMessage && <span className="form-label-alt text-zinc-500">{newPasswordValidMessage}</span>}
                        </label>
                        {/* New password field */}
                        <input placeholder="Type here" name="newPassword" type="password" value={newPassword} onChange={handleInputChange}
                        className="input max-w-full focus:border-blue-500 border-[1px] bg-black border-zinc-700 placeholder-zinc-600"/>
                    </div>
                    <div className="form-field mt-1">
                        <label className="form-label leading-4">
                            Confirm New Password
                            {!confirmNewPasswordValid && <span className="form-label-alt text-zinc-500">Passwords must match</span>}
                        </label>
                        {/* Confirm new password field */}
                        <input placeholder="Type here" name="confirmNewPassword" type="password" value={confirmNewPassword} onChange={handleInputChange}
                        className="input max-w-full focus:border-blue-500 border-[1px] bg-black border-zinc-700 placeholder-zinc-600"/>
                    </div>
                    <div className="form-field pt-6">
                        <div className="form-control justify-between">
                            <button type="submit" className={`btn btn-lg w-full font-medium
                            ${resetting ? " btn-outline-primary" : " bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"}`}>
                                {resetting ? 
                                    <div className="spinner-dot-pulse">
                                        <div className="spinner-pulse-dot"></div>
                                    </div> 
                                    : "Reset Password"
                                }
                            </button>
                        </div>
                    </div>
                    {resetResponse &&
                        <div className="mt-3 alert bg-blue-500/25 w-full py-3 absolute bottom-[-100px] max-w-[350px] sm:max-w-full sm:relative sm:top-0
                        left-[50%] translate-x-[-50%] sm:left-0 sm:translate-x-0">
                            <svg width="36" height="36" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" clipRule="evenodd" d="M24 4C12.96 4 4 12.96 4 24C4 35.04 12.96 44 24 44C35.04 44 44 35.04 44 24C44 12.96 35.04 4 24 4ZM24 34C22.9 34 22 33.1 22 32V24C22 22.9 22.9 22 24 22C25.1 22 26 22.9 26 24V32C26 33.1 25.1 34 24 34ZM26 18H22V14H26V18Z" fill="#0085FF" />
                            </svg>
                            <div className="flex flex-col">
                                <span>{resetResponse}</span>
                            </div>
                        </div>
                    }
                </form>
            </div>
            
        </main>
    </>);
}