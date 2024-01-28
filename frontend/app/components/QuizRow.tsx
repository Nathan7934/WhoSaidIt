import useGenerateShareableLink from "../hooks/security/useGenerateShareableLink";
import useDeleteQuiz from "../hooks/api_access/quizzes/useDeleteQuiz";

import { Quiz, ResponseStatus } from "../interfaces";
import { renderQuizTypeBadge, renderModalResponseAlert, formatDateLong, toggleModal, isModalOpen } from "../utilities/miscFunctions";
import Modal from "./Modal";
import MoreIcon from "./icons/MoreIcon";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

// This component renders the information for a quiz as a row.
// It displays the quiz name, type, and date created, as well as relevant actions for the quiz.

interface QuizRowProps {
    groupChatId: number;
    quiz: Quiz;
    setReloadCounter: React.Dispatch<React.SetStateAction<number>>;
    dropdownPosition: "dropdown-menu-left" | "dropdown-menu-left-top" | "dropdown-menu-left-bottom"; 
}
export default function QuizRow({groupChatId, quiz, setReloadCounter, dropdownPosition}: QuizRowProps) {

    const linkModalDomId: string = `quiz-link-${quiz.id}`;
    const deleteModalDomId: string = `quiz-delete-${quiz.id}`;
    const mobileActionsModalDomId: string = `quiz-actions-${quiz.id}`;

    // ----------- Hooks --------------------
    const generateShareableLink = useGenerateShareableLink();
    const deleteQuiz = useDeleteQuiz();

    // ----------- State (Data) -------------
    const [shareableLink, setShareableLink] = useState<string>(""); // TODO: [Optimization] Use a cache to store the shareable link for each quiz. [Low Priority]

    // ----------- State (UI) ---------------
    const [deleting, setDeleting] = useState<boolean>(false);
    const [generatingLink, setGeneratingLink] = useState<boolean>(false);
    const [linkCopied, setLinkCopied] = useState<boolean>(false);
    const [responseStatus, setResponseStatus] = useState<ResponseStatus>({ message: "", success: false, doAnimate: false });

    // ----------- Effects ------------------

    // If the shareable link has been copied, we change the text of the copy button for 3 seconds.
    useEffect(() => {
        if (linkCopied) {
            setTimeout(() => {
                setLinkCopied(false);
            }, 3000);
        }
    }, [linkCopied]);

    // ----------- Data Helpers -------------

    const getShareableLink = async () => {
        setGeneratingLink(true);
        const response: string = await generateShareableLink(quiz.id);
        if (response.substring(0, 7) === "Success") {
            const link = response.substring(9);
            setShareableLink(link);
        } else {
            console.error("Error generating shareable link: ", response);
            setResponseStatus({
                message: "Error generating shareable link",
                success: false,
                doAnimate: true,
            });

            setTimeout(() => {
                if (isModalOpen(linkModalDomId)) toggleModal(linkModalDomId);
                setResponseStatus({
                    message: "",
                    success: false,
                    doAnimate: false,
                });
            }, 3000);
        }
        setGeneratingLink(false);
    }

    const handleDelete = async () => {
        setDeleting(true);
        const error: string | null = await deleteQuiz(quiz.id);
        if (!error) {
            setResponseStatus({
                message: "Quiz Deleted successfully",
                success: true,
                doAnimate: true,
            });
        } else {
            console.error("Error deleting quiz: ", error);
            setResponseStatus({
                message: "Error deleting quiz",
                success: false,
                doAnimate: true,
            });
        }

        // Display the response message for 3 seconds, then close the modal and re-fetch the data.
        setTimeout(() => {
            if (isModalOpen(deleteModalDomId)) toggleModal(deleteModalDomId);
            setResponseStatus({
                message: "",
                success: false,
                doAnimate: false,
            });
            if (!error) {
                setTimeout(() => {
                    setReloadCounter(c => c + 1) // Reload the parent page to display the new group chat after 0.5s.
                }, 500);
            }
        }, 3000);

        setDeleting(false);
    }

    // =============== RENDER FUNCTIONS ===============

    const renderQuizLinkModal = () => {
        let modalContent: JSX.Element;
        if (responseStatus.doAnimate) {
            modalContent = renderModalResponseAlert(responseStatus);
        } else if (generatingLink) {
            modalContent = (
                <div className="my-6 sm:my-12">
                    <div className="mx-auto mb-2 text-lg sm:text-xl text-center text-gray-11">
                            Generating Link...
                    </div>
                    <div className="flex justify-center">
                        <div className="spinner-circle w-10 h-10 sm:w-12 sm:h-12" />
                    </div>
                </div>
            );
        } else {
            modalContent = (
                <div className="flex flex-col w-full px-4">
                    <div className="w-full text-center px-1 mb-3 mt-1 text-2xl text-white font-light">
                        {quiz.quizName}
                    </div>
                    <div className="w-full text-center text-gray-11 mb-5">
                        Anyone with the link below can play this quiz. Copy and send it to your friends!
                    </div>
                    <div className="flex w-full mb-6 rounded-xl border-2 border-primary overflow-hidden">
                        <input type="text" value={shareableLink} readOnly 
                        className="grow px-2 text-sm text-white py-3 bg-transparent focus:outline-none" />
                        <button className="w-20 font-semibold bg-primary text-white"
                        onClick={() => {
                            navigator.clipboard.writeText(shareableLink);
                            setLinkCopied(true);
                        }}>
                            {linkCopied ? <span className="animate__animated animate__fadeIn">Copied!</span> : "Copy"}
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <Modal domId={linkModalDomId} title="Share Your Quiz" maxWidth="450px" margin="6px" darkOverlay>
                {modalContent}
            </Modal>
        );
    }

    const renderDeleteQuizModal = () => {
        let modalContent: JSX.Element;
        if (responseStatus.doAnimate) {
            modalContent = renderModalResponseAlert(responseStatus);
        } else if (deleting) {
            modalContent = (
                <div className="my-6 sm:my-12">
                    <div className="mx-auto mb-2 text-lg sm:text-xl text-center text-gray-11">
                            Deleting Quiz...
                    </div>
                    <div className="flex justify-center">
                        <div className="spinner-circle w-10 h-10 sm:w-12 sm:h-12" />
                    </div>
                </div>
            );
        } else {
            modalContent = (<>
                <div className="flex flex-col w-full px-1 mb-5 text-center">
                    <div className="mx-auto mb-2 text-2xl text-gray-11">
                        Delete {quiz.quizName}?
                    </div>
                    <div className="mx-auto mb-2 px-4 max-w-[300px] text-sm text-gray-9 font-light">
                        Deleting this quiz will also delete all of its leaderboard entries.
                    </div>
                    <div className="mx-auto text-gray-10 font-semibold">
                        This cannot be undone.
                    </div>
                </div>
                <div className="flex gap-2 px-6 mb-4">
                    <button className="btn grow" onClick={() => toggleModal("delete-modal")}>
                        Cancel
                    </button>
                    <button className="btn btn-error grow" onClick={handleDelete}>
                        Delete
                    </button>
                </div>
            </>);
        }

        return (
            <Modal domId={deleteModalDomId} title="Delete Quiz" maxWidth="400px" margin="24px" darkOverlay>
                {modalContent}
            </Modal>
        );
    }

    // =============== MAIN RENDER ===============

    return (<>
        {/* --------------- DESKTOP LAYOUT --------------- */}
        <div className="hidden sm:grid grid-cols-3 grid-rows-2 gap-1">
            <div className="col-span-2">
                <span className="text-xl text-white font-semibold mr-3">{quiz.quizName}</span>
                <wbr />
                {renderQuizTypeBadge(quiz.type)}
            </div>
            <div className="row-span-2 justify-self-end self-center flex items-center">
                <Link href={`/quiz/${quiz.id}`}>
                    <button className="btn btn-solid btn-sm mr-2 whitespace-nowrap hidden sm:block">Play Quiz</button>
                </Link>
                {/* Options dropdown */}
                <div className="dropdown">
                    <label tabIndex={0} className="hover:cursor-pointer list-none"><MoreIcon className="text-gray-8 w-10 h-10" /></label>
                    <div className={`dropdown-menu shadow-md ${dropdownPosition}`}>
                        <a tabIndex={-1} className="dropdown-item text-sm font-semibold" 
                        onClick={() => {
                            getShareableLink();
                            toggleModal(linkModalDomId);
                        }}>
                            Share Quiz
                        </a>
                        <Link href={`/leaderboard/${quiz.id}`} className="dropdown-item text-sm">Quiz Leaderboard</Link>
                        <Link href={`/messages/${groupChatId}/${quiz.id}`} tabIndex={-1} className="dropdown-item text-sm">Messages in Quiz</Link>
                        <a tabIndex={-1} className="dropdown-item text-sm text-red-9"
                        onClick={() => toggleModal(deleteModalDomId)}>
                            Delete Quiz
                        </a>
                    </div>
                </div>
            </div>
            <span className="tooltip tooltip-right w-min" data-tooltip="date created">
                <label className="col-span-2 text-sm text-gray-9 self-center whitespace-nowrap mr-1">
                    {formatDateLong(quiz.createdDate)}
                </label>
            </span>
        </div>
        {/* --------------- MOBILE LAYOUT --------------- */}
        <div className="flex sm:hidden">
            <div className="block">
                <div className="text-lg font-semibold">{quiz.quizName}</div>
                <div className="text-xs text-gray-9">Created: {formatDateLong(quiz.createdDate)}</div>
                <div className="mt-1">{renderQuizTypeBadge(quiz.type)}</div>
            </div>
            {/* Options modal */}
            <div className="ml-auto mr-1 self-center">
                <label htmlFor={mobileActionsModalDomId}><MoreIcon className="text-gray-8 w-8 h-8" /></label>
                <Modal domId={mobileActionsModalDomId} title="Quiz Actions">
                    <div className="px-4 text-center mb-3">
                        <h2 className="text-xl text-white">{quiz.quizName}</h2>
                        <div className="mb-4">{renderQuizTypeBadge(quiz.type)}</div>
                    </div>
                    <div className="px-4 mb-4">
                        <button className="btn btn-lg btn-primary w-full text-lg"
                        onClick={() => {
                            getShareableLink();
                            toggleModal(linkModalDomId);
                            toggleModal(mobileActionsModalDomId);
                        }}>
                            Copy Shareable Link
                        </button>
                        <Link href={`/quiz/${quiz.id}`}>
                            <button className="btn w-full mt-2 font-semibold">Play Quiz</button>
                        </Link>
                        <Link href={`/leaderboard/${quiz.id}`}>
                            <button className="btn btn-sm w-full mt-2">Quiz Leaderboard</button>
                        </Link>
                        <Link href={`/messages/${groupChatId}/${quiz.id}`}>
                            <button className="btn btn-sm w-full mt-2">Messages in Quiz</button>
                        </Link>
                        <button className="btn btn-sm w-full mt-2 text-red-8 font-bold"
                        onClick={() => {
                            toggleModal(deleteModalDomId);
                            toggleModal(mobileActionsModalDomId);
                        }}>
                            Delete Quiz
                        </button>
                    </div>
                </Modal>
            </div>
        </div>
        {/* FIXED POSITION ELEMENTS */}
        {renderQuizLinkModal()}
        {renderDeleteQuizModal()}
    </>);
}