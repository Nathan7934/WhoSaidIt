import usePatchUserEmail from "@/app/hooks/api_access/user/usePatchUserEmail";
import useNavBar from "@/app/hooks/context_imports/useNavBar";
import { ResponseStatus } from "@/app/interfaces";
import { validateEmail } from "@/app/utilities/formValidationFunctions";
import { renderResponseAlert } from "@/app/utilities/miscFunctions";

import { useState } from "react";

export default function ChangeEmailSubmenu() {

    // ----------- Hooks ------------------
    const patchUserEmail = usePatchUserEmail();
    const { setRefetchDataCounter, setNavBarExpanded, setNavBarState } = useNavBar();

    // ----------- State (Input) -----------
    const [password, setPassword] = useState<string>("");
    const [newEmail, setNewEmail] = useState<string>("");
    const [confirmNewEmail, setConfirmNewEmail] = useState<string>("");

    // ----------- State (UI) -------------
    const [changingEmail, setChangingEmail] = useState<boolean>(false);
    const [responseStatus, setResponseStatus] = useState<ResponseStatus>({ message: "", success: false, doAnimate: false });

    // Form submit failed states
    const [submitFailed, setSubmitFailed] = useState<boolean>(false);
    const [passwordValid, setPasswordValid] = useState<boolean>(true);
    const [newEmailValid, setNewEmailValid] = useState<boolean>(true);
    const [confirmNewEmailValid, setConfirmNewEmailValid] = useState<boolean>(true);

    // ----------- Data Helpers -----------
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        switch (name) {
            case "password":
                setPassword(value);
                break;
            case "newEmail":
                setNewEmail(value);
                setNewEmailValid(validateEmail(value));
                break;
            case "confirmNewEmail":
                setConfirmNewEmail(value);
                setConfirmNewEmailValid(value === newEmail);
                break;
        }
    }

    const submitEmailChangeForm = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!isFormValid()) {
            return;
        }
        setChangingEmail(true);
        
        const error: string | null = await patchUserEmail(password, newEmail);
        if (error) {
            console.error("Error changing email: ", error);
            setResponseStatus({ 
                message: error, 
                success: false, 
                doAnimate: true 
            });
        } else {
            setResponseStatus({ 
                message: "Email changed successfully", 
                success: true, 
                doAnimate: true 
            });
            // Clear the form
            setPassword("");
            setNewEmail("");
            setConfirmNewEmail("");
        }
        setChangingEmail(false);

        // Clear the response status and refetch navbar data after 3 seconds
        setTimeout(() => {
            setResponseStatus({ message: "", success: !error, doAnimate: true });
            setRefetchDataCounter(c => c + 1);
        }, 3000)
    }

    const isFormValid = (): boolean => {
        if (passwordValid && newEmailValid && confirmNewEmailValid
            && password.length > 0 && newEmail.length > 0 && confirmNewEmail.length > 0)  {
            return true;
        }
        if (password === "") setPasswordValid(false);
        if (newEmail === "") setNewEmailValid(false);
        if (confirmNewEmail === "") setConfirmNewEmailValid(false);
        setSubmitFailed(true);
        return false;
    }

    // =============== MAIN RENDER ===============

    return (
        <div className="flex flex-col absolute w-full px-5 mt-12">
            <div className="flex flex-col items-center mb-12">
                <h1 className="text-3xl font-semibold text-center">Change Email</h1>
                <p className="text-sm mt-2 text-center">Your email is only used in case of password reset</p>
            </div>
            <form className="form-group gap-1" onSubmit={submitEmailChangeForm}>
                <div className="form-field">
                    <label className="form-label leading-4">
                        Password
                        {!passwordValid && <span className="form-label-alt text-error">Incorrect password</span>}
                    </label>
                    {/* Current password field */}
                    <input placeholder="Type here" name="password" type="password" value={password} onChange={handleInputChange}
                    className={`input max-w-full focus:border-blue-500 border-[1px] bg-black border-zinc-700 placeholder-zinc-600
                    ${!passwordValid && submitFailed ? " input-error": ""}`}/>
                </div>
                <div className="form-field mt-4">
                    <label className="form-label leading-4">
                        New Email
                        {!newEmailValid && <span className="form-label-alt text-zinc-500">Must be a valid email</span>}
                    </label>
                    {/* New password field */}
                    <input placeholder="Type here" name="newEmail" value={newEmail} onChange={handleInputChange}
                    className={`input max-w-full focus:border-blue-500 border-[1px] bg-black border-zinc-700 placeholder-zinc-600
                    ${!newEmailValid && submitFailed ? " input-error": ""}`}/>
                </div>
                <div className="form-field mt-2">
                    <label className="form-label leading-4">
                        Confirm New Email
                        {!confirmNewEmailValid && <span className="form-label-alt text-zinc-500">Emails must match</span>}
                    </label>
                    {/* Confirm new password field */}
                    <input placeholder="Type here" name="confirmNewEmail" value={confirmNewEmail} onChange={handleInputChange}
                    className={`input max-w-full focus:border-blue-500 border-[1px] bg-black border-zinc-700 placeholder-zinc-600
                    ${!confirmNewEmailValid && submitFailed ? " input-error": ""}`}/>
                </div>
                <div className="form-field pt-6">
                    <div className="form-control justify-between">
                        <button type="submit" className={`btn btn-lg w-full font-medium
                        ${changingEmail ? " btn-outline-primary" : " bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"}`}>
                            {changingEmail ? 
                                <div className="spinner-dot-pulse">
                                    <div className="spinner-pulse-dot"></div>
                                </div> 
                                : "Change Email"
                            }
                        </button>
                    </div>
                </div>
            </form>
            {responseStatus.doAnimate && 
                <div className="flex w-full mt-8 justify-center items-center">
                    {renderResponseAlert(responseStatus, "")}
                </div>
            }
        </div>
    )

}