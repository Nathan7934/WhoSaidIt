import usePatchUserPassword from "@/app/hooks/api_access/user/usePatchUserPassword";
import useNavBar from "@/app/hooks/context_imports/useNavBar";
import useHandleLogout from "@/app/hooks/security/useHandleLogout";
import { ResponseStatus } from "@/app/interfaces";
import { validatePassword } from "@/app/utilities/formValidationFunctions";
import { renderResponseAlert } from "@/app/utilities/miscFunctions";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ChangePasswordSubmenuProps {
    username: string;
}
export default function ChangePasswordSubmenu({ username }: ChangePasswordSubmenuProps) {

    // ----------- Hooks ------------------
    const patchUserPassword = usePatchUserPassword();
    const { setNavBarState, setNavBarExpanded, setRefetchDataCounter } = useNavBar();
    const handleLogout = useHandleLogout();
    const router = useRouter();

    // ----------- State (Input) -----------
    const [currentPassword, setCurrentPassword] = useState<string>("");
    const [newPassword, setNewPassword] = useState<string>("");
    const [confirmNewPassword, setConfirmNewPassword] = useState<string>("");

    // ----------- State (UI) -------------
    const [changingPassword, setChangingPassword] = useState<boolean>(false);
    const [responseStatus, setResponseStatus] = useState<ResponseStatus>({ message: "", success: false, doAnimate: false });

    // Form submit failed states
    const [submitFailed, setSubmitFailed] = useState<boolean>(false);
    const [currentPasswordValid, setCurrentPasswordValid] = useState<boolean>(true);
    const [newPasswordValidMessage, setNewPasswordValidMessage] = useState<string>(""); // Empty string means valid
    const [confirmNewPasswordValid, setConfirmNewPasswordValid] = useState<boolean>(true);

    // ----------- Data Helpers -----------
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        switch (name) {
            case "currentPassword":
                setCurrentPassword(value);
                break;
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

    const submitPasswordResetForm = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!isFormValid()) {
            return;
        }
        setChangingPassword(true);

        // Attempt to change the password
        const changePasswordError: string | null = await patchUserPassword(currentPassword, newPassword);
        if (changePasswordError) {
            console.error("Error changing password: ", changePasswordError);
            setResponseStatus({
                message: changePasswordError,
                success: false,
                doAnimate: true
            });
            setTimeout(() => { setResponseStatus({ message: "", success: false, doAnimate: true }) }, 3000);
            setChangingPassword(false);
            return;
        }

        // Attempt to log out
        const logoutError: string | null = await handleLogout();
        if (logoutError) {
            console.error("Error logging out: ", logoutError);
            setResponseStatus({
                message: logoutError,
                success: false,
                doAnimate: true
            });
            setTimeout(() => { setResponseStatus({ message: "", success: false, doAnimate: true }) }, 3000);
            setChangingPassword(false);
            return;
        }

        // If we get here, the password was changed successfully and the user was logged out.
        setResponseStatus({
            message: "Password changed. Logging out",
            success: true,
            doAnimate: true
        });
        setTimeout(() => {
            router.push("/"); // Redirect to the home page
            setNavBarExpanded(false);
            setNavBarState("DEFAULT");
            setRefetchDataCounter(c => c + 1); // Reload NavBar data
            setResponseStatus({ message: "", success: false, doAnimate: false });
        }, 3000);
        setChangingPassword(false);
    }

    const isFormValid = (): boolean => {
        if (currentPasswordValid && newPasswordValidMessage === "" && confirmNewPasswordValid &&
            currentPassword.length > 0 && newPassword.length > 0 && confirmNewPassword.length > 0) {
            return true;
        }
        if (currentPassword === "") setCurrentPasswordValid(false);
        if (newPassword === "") setNewPasswordValidMessage("Password cannot be empty");
        if (confirmNewPassword === "") setConfirmNewPasswordValid(false);
        setSubmitFailed(true);
        return false;
    }

    // =============== MAIN RENDER ===============

    return (<>
        <div className="flex flex-col absolute w-full px-5 mt-12">
            <div className="flex flex-col items-center mb-12">
                <h1 className="text-3xl font-semibold">Change Password</h1>
                <p className="text-sm mt-2 text-center">Once changed, you will be logged out<br/>from all devices.</p>
            </div>
            <form className="form-group gap-1" onSubmit={submitPasswordResetForm}>
                <div className="form-field">
                    <label className="form-label leading-4">
                        Current Password
                        {!currentPasswordValid && <span className="form-label-alt text-error">Incorrect password</span>}
                    </label>
                    {/* Current password field */}
                    <input placeholder="Type here" className={`input max-w-full ${!currentPasswordValid && submitFailed ? " input-error": ""}`}
                    name="currentPassword" type="password" value={currentPassword} onChange={handleInputChange}/>
                </div>
                <div className="form-field mt-4">
                    <label className="form-label leading-4">
                        New Password
                        {newPasswordValidMessage && <span className="form-label-alt text-error">{newPasswordValidMessage}</span>}
                    </label>
                    {/* New password field */}
                    <input placeholder="Type here" className={`input max-w-full ${newPasswordValidMessage && submitFailed ? " input-error": ""}`}
                    name="newPassword" type="password" value={newPassword} onChange={handleInputChange} />
                </div>
                <div className="form-field mt-2">
                    <label className="form-label leading-4">
                        Confirm New Password
                        {!confirmNewPasswordValid && <span className="form-label-alt text-error">Passwords must match</span>}
                    </label>
                    {/* Confirm new password field */}
                    <input placeholder="Type here" className={`input max-w-full ${!confirmNewPasswordValid && submitFailed ? " input-error": ""}`}
                    name="confirmNewPassword" type="password" value={confirmNewPassword} onChange={handleInputChange} />
                </div>
                <div className="form-field pt-6">
                    <div className="form-control justify-between">
                        <button type="submit" className={`btn btn-lg w-full font-semibold
                        ${changingPassword ? " btn-outline-primary" : " btn-primary"}`}>
                            {changingPassword ? 
                                <div className="spinner-dot-pulse">
                                    <div className="spinner-pulse-dot"></div>
                                </div> 
                                : "Change Password"
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
    </>);
}