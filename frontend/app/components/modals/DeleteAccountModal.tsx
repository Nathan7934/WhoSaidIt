import useDeleteUser from "@/app/hooks/api_access/user/useDeleteUser";
import useNavBar from "@/app/hooks/context_imports/useNavBar";
import Modal from "./Modal";
import WarningIcon from "../icons/WarningIcon";
import { toggleModal, isModalOpen, renderModalResponseAlert } from "@/app/utilities/miscFunctions";
import { ResponseStatus, User } from "@/app/interfaces";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface DeleteAccountModalProps {
    modalDomId: string;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
}
export default function DeleteAccountModal({ modalDomId, setUser }: DeleteAccountModalProps) {

    // ----------- Hooks ------------------
    const deleteUser = useDeleteUser();
    const { setNavBarExpanded } = useNavBar();
    const router = useRouter();

    // ----------- State -----------
    const [confirmDeleteInput, setConfirmDeleteInput] = useState("");
    const [deleting, setDeleting] = useState(false);
    const [responseStatus, setResponseStatus] = useState<ResponseStatus>({ message: "", success: false, doAnimate: false });

    // ----------- Data Helpers -----------
    const handleDeleteAccount = async () => {
        if (confirmDeleteInput !== "DELETE") return;

        setDeleting(true);
        const error: string | null = await deleteUser();
        if (!error) {
            setResponseStatus({
                message: "Account Deleted Successfully",
                success: true,
                doAnimate: true
            });
            setConfirmDeleteInput("");
            setTimeout(() => {
                if (isModalOpen(modalDomId)) toggleModal(modalDomId);
                router.push("/"); // Redirect to home page
                setNavBarExpanded(false);
                setResponseStatus({ message: "", success: false, doAnimate: false });
                setTimeout(() => {
                    setUser(null);
                }, 150);
            }, 1000);
        } else {
            console.error("Error deleting account: ", error);
            setResponseStatus({
                message: "Error deleting account. Please try again or contact developer.",
                success: false,
                doAnimate: true
            });
            setTimeout(() => {
                if (isModalOpen(modalDomId)) toggleModal(modalDomId);
                setResponseStatus({ message: "", success: false, doAnimate: false });
            }, 3000);
        }
        setDeleting(false);
    }

    // =============== MAIN RENDER =============== 

    let modalContent: JSX.Element;
    if (responseStatus.doAnimate) {
        modalContent = renderModalResponseAlert(responseStatus);
    } else if (deleting) {
        modalContent = (
            <div className="mb-6 mt-4 sm:mb-12 sm:mt-10">
                <div className="mx-auto mb-2 text-lg sm:text-xl text-center text-gray-11">
                        Deleting Account...
                </div>
                <div className="flex justify-center">
                    <div className="spinner-circle w-10 h-10 sm:w-12 sm:h-12" />
                </div>
            </div>
        );
    } else {
        modalContent = (<>
            <div className="flex w-full mt-1 items-center">
                <WarningIcon className="w-10 h-10 ml-auto text-red-400" />
                <div className="text-3xl font-medium mx-4 text-red-400">DANGER</div>
                <WarningIcon className="w-10 h-10 mr-auto text-red-400" />
            </div>
            <div className="w-full mt-3 px-4 text-center text-zinc-300">
                Deleting your account is permanent and cannot be undone. All your data will be lost.
            </div>
            <div className="w-full text-center mt-3 text-lg font-semibold text-zinc-300">
                Are you sure you wish to continue?
            </div>
            <div className="w-full text-center mt-6 text-red-400 font-medium">
                If yes, type <span className="font-bold">"DELETE"</span> in the box below:
            </div>
            <div className="flex mx-8 mt-2">
                <input className="grow input bg-black border-[1px] border-red-400 max-w-none text-center" 
                value={confirmDeleteInput} onChange={(e) => setConfirmDeleteInput(e.target.value)}/>
            </div>
            <div className="flex mx-8 mt-3 mb-6">
                <button className="grow btn text-lg font-light bg-black border border-zinc-800 py-5"
                onClick={() => handleDeleteAccount()}>
                    Delete Account
                </button>
            </div>
        </>);
    }

    return (
        <Modal domId={modalDomId} darkOverlay>
            {modalContent}
        </Modal>
    );
}