import useDeleteGroupChat from "../hooks/api_access/group_chats/useDeleteGroupChat";
import { formatDateLong, renderQuizRows, toggleModal, isModalOpen, renderModalResponseAlert } from "../utilities/miscFunctions";
import { GroupChatInfo, ResponseStatus } from "../interfaces"
import CreateQuizModal from "./modals/CreateQuizModal";
import Modal from "./modals/Modal";
import DeleteIcon from "./icons/DeleteIcon";
import WarningIcon from "./icons/WarningIcon";

import Link from "next/link";
import { useState, useEffect } from "react";

// This component renders the information for a group chat as an accordion.
// It displays the group chat name, upload date, number of participants, and number of messages.
// It also renders a list of quizzes for the group chat, including relevant actions for each quiz.

// The group chat itself also has several actions, including generating a new quiz, viewing messages,
// and managing participants.

// The accoridian is implemented using Ripple-UI tailwind classes and the checkbox hack.

interface GroupChatInfoRowProps {
    groupChat: GroupChatInfo;
    isDeleting?: boolean;
    setIsDeleting?: React.Dispatch<React.SetStateAction<boolean>>;
    setReloadCounter: React.Dispatch<React.SetStateAction<number>>;
}
export default function GroupChatInfoRow({ groupChat, isDeleting, setReloadCounter, setIsDeleting }: GroupChatInfoRowProps) {
    // Constants
    const deleteGroupChatModalDomId: string = `delete-group-chat-modal-${groupChat.id}`;

    // ----------- Hooks ------------------
    const deleteGroupChat = useDeleteGroupChat();

    // ----------- State (UI) -------------
    const [doAnimate, setDoAnimate] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteResponseStatus, setDeleteResponseStatus] = useState<ResponseStatus>({ message: "", success: false, doAnimate: false });

    // UI Effects
    useEffect(() => {
        setDoAnimate(true);
    }, [isDeleting]);

    // ----------- Data Helpers -------------

    const handleDelete = async () => {
        setDeleting(true);
        const error: string | null = await deleteGroupChat(groupChat.id);
        if (!error) {
            setDeleteResponseStatus({
                message: "Group Chat Deleted Successfully",
                success: true,
                doAnimate: true
            });
        } else {
            console.error("Error deleting group chat: ", error);
            setDeleteResponseStatus({
                message: error,
                success: false,
                doAnimate: true
            });
        }

        // Display the response message for 3 seconds, then close the modal and re-fetch the data.
        setTimeout(() => {
            if (isModalOpen(deleteGroupChatModalDomId)) toggleModal(deleteGroupChatModalDomId);
            setDeleteResponseStatus({
                message: "",
                success: false,
                doAnimate: false,
            });
            if (!error) {
                setTimeout(() => {
                    setReloadCounter(c => c + 1) // Reload the parent page to display the new group chat after 0.5s.
                    if (setIsDeleting) setIsDeleting(false);
                }, 500);
            }
        }, 3000);

        setDeleting(false);
    }

    // =============== RENDER FUNCTIONS ===============

    const renderDeleteGroupChatModal = () => {
        let modalContent: JSX.Element;
        if (deleteResponseStatus.doAnimate) {
            modalContent = renderModalResponseAlert(deleteResponseStatus, true);
        } else if (deleting) {
            modalContent = (
                <div className="mb-6 mt-4 sm:mb-12 sm:mt-10">
                    <div className="mx-auto mb-2 text-lg sm:text-xl text-center text-zinc-200">
                            Deleting Group Chat...
                    </div>
                    <div className="flex justify-center">
                        <div className="spinner-circle w-10 h-10 sm:w-12 sm:h-12" />
                    </div>
                </div>
            );
        } else {
            modalContent = (<>
                <div className="flex flex-col w-full px-1 mb-5 text-center">
                    <div className="flex gap-[10px] items-center mx-auto mb-5 text-3xl text-zinc-200">
                        <WarningIcon className="w-7 h-7" />
                        <div>Warning</div>
                        <WarningIcon className="w-7 h-7" />
                    </div>
                    <div className="mx-auto mb-5 px-4 max-w-[300px] text-xl text-zinc-400 font-light text-center">
                        You are about to delete:<br/><span className="font-semibold">{groupChat.groupChatName}</span>
                    </div>
                    <div className="text-center text-zinc-500 mb-4">
                        Deleting this group chat will also delete all associated quizzes and messages.
                    </div>
                    <div className="mx-auto text-zinc-400 font-medium">
                        Deletion cannot be undone.
                    </div>
                </div>
                <div className="flex gap-2 px-6 mb-4">
                    <button className="btn bg-black border border-zinc-800 grow" onClick={() => toggleModal(deleteGroupChatModalDomId)}>
                        Cancel
                    </button>
                    <button className="btn bg-red-5 grow" onClick={() => handleDelete()}>
                        Delete
                    </button>
                </div>
            </>);
        }

        return (
            <Modal domId={deleteGroupChatModalDomId} darkOverlay>
                {modalContent}
            </Modal>
        );
    }

    // =============== MAIN RENDER ===============

    return (<>
        <div className="accordion">
            <input type="checkbox" id={`toggle-${groupChat.id}`} className="accordion-toggle" />
            <label htmlFor={isDeleting ? "" : `toggle-${groupChat.id}`} 
            className="accordion-title bg-[#050507] noselect">
                <span className="font-light text-xl pr-6">{groupChat.groupChatName}</span>
                <div className="mt-1 ml-[-4px]">
                    <span className="badge badge-outline mr-2">
                        <span className="font-normal mr-2">Uploaded:</span> {formatDateLong(groupChat.uploadDate)}
                    </span>
                    <span className="badge badge-outline mr-2">
                        <span className="font-normal mr-2">Participants:</span> {groupChat.numParticipants}
                    </span>
                    <span className="badge badge-outline">
                        <span className="font-normal mr-2">Messages:</span> {groupChat.numMessages}
                    </span>
                </div>
                {isDeleting
                    ?
                        <span className="absolute right-[15px] top-[24px] z-10 cursor-pointer"
                        onClick={() => toggleModal(deleteGroupChatModalDomId)}>
                            <DeleteIcon className="w-5 h-5 text-zinc-300 
                            animate__animated animate__fadeIn animate__duration-500ms" />
                        </span>
                    :
                        <span className={`accordion-icon animate__animated animate__duration-500ms
                        ${doAnimate ? isDeleting ? " animate__fadeOut " : " animate__fadeIn" : ""}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                <path d="M13.293 6.293 7.586 12l5.707 5.707 1.414-1.414L10.414 12l4.293-4.293z" />
                            </svg>
                        </span>
                }
            </label>
            <div className="accordion-content bg-[#070606b9]">
                <div className="min-h-0">
                    <div className="hidden lg:block my-2 text-xl text-zinc-500 font-light">
                        Quizzes for this chat:
                    </div>
                    <div className="lg:hidden divider divider-horizontal mb-5 mt-2 text-zinc-300 font-light">
                        Quizzes for this chat:
                    </div>
                    {renderQuizRows(groupChat, setReloadCounter)}
                    <div className="sm:flex sm:flex-grow sm:items-end justify-center sm:justify-start mt-8 sm:mt-3">
                        <button className="btn mr-2 w-full sm:w-auto bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600
                        text-lg sm:text-base font-medium"
                        onClick={() => toggleModal("create-quiz-modal")}>
                            Create New Quiz
                        </button>
                        <div className="flex items-end">
                            <Link href={`/messages/${groupChat.id}`} className="grow sm:flex-none mr-2">
                                <div className="p-[1px] mt-2 sm:mt-0 rounded-[9px] sm:rounded-[13px] bg-gradient-to-r from-blue-500 to-indigo-500
                                md:from-blue-500 md:via-indigo-500 md:to-purple-500">
                                    <button className="w-full bg-black py-[6px] sm:py-[7px] px-3 rounded-lg sm:rounded-xl whitespace-nowrap">
                                        View Messages
                                    </button>
                                </div>
                            </Link>
                            <Link href={`/participants/${groupChat.id}`}>
                                <div className="p-[1px] mt-2 sm:mt-0 rounded-[9px] sm:rounded-[13px] bg-gradient-to-r from-indigo-500 to-purple-400
                                md:from-blue-500 md:via-indigo-500 md:to-purple-500">
                                    <button className="w-full bg-black py-[6px] px-6 sm:px-3 sm:py-[7px] rounded-lg sm:rounded-xl">
                                        <span className="hidden sm:inline-block">Manage</span> Participants
                                    </button>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        {/* Modal for creating a new quiz */}
        <CreateQuizModal groupChatId={groupChat.id} groupChatName={groupChat.groupChatName} 
        modalDomId={`create-quiz-modal-${groupChat.id}`} setReloadCounter={setReloadCounter} />
        {/* Delete group chat modal */}
        {renderDeleteGroupChatModal()}
    </>);
}