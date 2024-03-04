import useGenerateShareableLink from "../../hooks/security/useGenerateShareableLink";
import useDeleteQuiz from "../../hooks/api_access/quizzes/useDeleteQuiz";

import { TimeAttackQuiz, SurvivalQuiz, ResponseStatus } from "../../interfaces";
import { renderQuizTypeBadge, renderModalResponseAlert, isTimeAttackQuiz, toggleModal, isModalOpen } from "../../utilities/miscFunctions";
import Modal from "../modals/Modal";
import MoreIcon from "../icons/MoreIcon";
import ShareIcon from "../icons/nav-bar/ShareIcon";

import Link from "next/link";
import { useState, useEffect } from "react";

// This component renders the information for a quiz as a row.
// It displays the quiz name, type, and date created, as well as relevant actions for the quiz.

interface QuizRowProps {
    groupChatId: number;
    quiz: TimeAttackQuiz | SurvivalQuiz;
    setReloadCounter: React.Dispatch<React.SetStateAction<number>>;
    dropdownPosition: "dropdown-menu-left" | "dropdown-menu-left-top" | "dropdown-menu-left-bottom"; 
}
export default function QuizRow({groupChatId, quiz, setReloadCounter, dropdownPosition}: QuizRowProps) {

    const linkModalDomId: string = `quiz-link-${quiz.id}`;
    const deleteModalDomId: string = `quiz-delete-${quiz.id}`;
    const quizActionsModalDomId: string = `quiz-actions-${quiz.id}`;

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
                message: error,
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
            modalContent = renderModalResponseAlert(responseStatus, true);
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
                <div className="flex flex-col w-full px-4 mt-[-4px]">
                    <div className="flex w-full gap-2 items-center mb-3">
                        <ShareIcon className="ml-auto w-5 h-5" />
                        <div className="px-1 text-2xl text-white font-light">
                            Shareable Link
                        </div>
                        <ShareIcon className="mr-auto w-5 h-5 scale-x-[-1]" />
                    </div>
                    <div className="w-full text-center text-zinc-200 mb-7 font-light">
                        Anyone with the link below can play this quiz. Copy and send it to your friends!
                    </div>
                    <div className={`flex mb-6 bg-gradient-to-r rounded-[13px]
                    ${isTimeAttackQuiz(quiz) ? " from-blue-600 via-blue-400 to-blue-600" : " from-purple-500/75 via-pink-400/75 to-purple-500/75"}`}>
                        <div className="grow flex m-[1px] rounded-xl overflow-hidden">
                            <input type="text" value={shareableLink} readOnly 
                            className="grow px-2 text-sm text-white py-3 bg-black focus:outline-none" />
                            <button className={`w-20 font-medium text-white
                            ${isTimeAttackQuiz(quiz) ? " text-blue-50" : " text-purple-50"}`}
                            onClick={() => {
                                navigator.clipboard.writeText(shareableLink);
                                setLinkCopied(true);
                            }}>
                                {linkCopied ? <span className="animate__animated animate__fadeIn animate__duration-500ms">Copied!</span> : "Copy"}
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <Modal domId={linkModalDomId} maxWidth="450px" margin="6px" darkOverlay>
                {modalContent}
            </Modal>
        );
    }

    const renderDeleteQuizModal = () => {
        let modalContent: JSX.Element;
        if (responseStatus.doAnimate) {
            modalContent = renderModalResponseAlert(responseStatus, true);
        } else if (deleting) {
            modalContent = (
                <div className="my-6 sm:my-12">
                    <div className="mx-auto mb-2 text-lg sm:text-xl text-center text-zinc-200">
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
                    <div className="mx-auto mb-2 text-2xl text-zinc-400">
                        Delete Quiz?
                    </div>
                    <div className="mx-auto mb-2 px-4 max-w-[300px] text-sm text-zinc-500 font-light">
                        Deleting this quiz will also delete all of its leaderboard entries.
                    </div>
                    <div className="mx-auto text-zinc-400 font-semibold">
                        This cannot be undone.
                    </div>
                </div>
                <div className="flex gap-2 px-6 mb-4">
                    <button className="btn bg-black border border-zinc-800 grow" onClick={() => toggleModal("delete-modal")}>
                        Cancel
                    </button>
                    <button className="btn bg-black border border-zinc-800 grow" onClick={handleDelete}>
                        Delete
                    </button>
                </div>
            </>);
        }

        return (
            <Modal domId={deleteModalDomId} maxWidth="400px" margin="24px" darkOverlay>
                {modalContent}
            </Modal>
        );
    }

    const renderQuizOptionsModal = () => {
        return (
            <Modal domId={quizActionsModalDomId}>
                <div className="flex flex-col items-center px-4 text-center mt-4 mb-2">
                    <h2 className="text-xl text-white mb-1">{quiz.quizName}</h2>
                    <div className="mb-4">{renderQuizTypeBadge(quiz.type, true)}</div>
                </div>
                <div className="px-4 mb-4">
                    <button className={`btn btn-lg w-full text-lg bg-gradient-to-r font-medium
                    ${isTimeAttackQuiz(quiz) ? " from-blue-600 via-blue-500 to-blue-600 text-blue-50" : " from-purple-500/75 via-pink-400/75 to-purple-500/75 text-pink-50"}`}
                    onClick={() => {
                        getShareableLink();
                        toggleModal(linkModalDomId);
                        toggleModal(quizActionsModalDomId);
                    }}>
                        Copy Shareable Link
                    </button>
                    <Link href={`/quiz/${quiz.id}/noa`}>
                        <div className={`flex w-full mt-2 rounded-xl bg-gradient-to-r
                        ${isTimeAttackQuiz(quiz) ? " from-blue-500 via-blue-400 to-blue-500 text-blue-50" : " from-purple-400/75 via-pink-300/75 to-purple-400/75 text-pink-50"}`}>
                            <button className="btn grow m-[1px] text-lg bg-black font-medium">Play Quiz</button>
                        </div>
                    </Link>
                    <Link href={`/leaderboard/${quiz.id}`}>
                        <div className={`flex w-full mt-2 rounded-xl bg-gradient-to-r
                        ${isTimeAttackQuiz(quiz) ? " from-blue-500 via-blue-400 to-blue-500 text-blue-50" : " from-purple-400/75 via-pink-300/75 to-purple-400/75 text-pink-50"}`}>
                            <button className="btn grow m-[1px] bg-black font-semibold">Quiz Leaderboard</button>
                        </div>
                    </Link>
                    <Link href={`/messages/${groupChatId}/${quiz.id}`}>
                        <div className={`flex w-full mt-2 rounded-xl bg-gradient-to-r
                        ${isTimeAttackQuiz(quiz) ? " from-blue-500 via-blue-400 to-blue-500 text-blue-50" : " from-purple-400/75 via-pink-300/75 to-purple-400/75 text-pink-50"}`}>
                            <button className="btn grow m-[1px] bg-black font-semibold">Add Messages to Quiz</button>
                        </div>
                    </Link>
                    <button className="btn btn-sm w-full mt-2 bg-black border border-zinc-800 text-zinc-200 font-light
                    rounded-xl"
                    onClick={() => {
                        toggleModal(deleteModalDomId);
                        toggleModal(quizActionsModalDomId);
                    }}>
                        Delete Quiz
                    </button>
                </div>
            </Modal>
        );
    }

    // =============== MAIN RENDER ===============

    return (<>
        {/* --------------- DESKTOP LAYOUT --------------- */}
        <div className="hidden sm:grid grid-cols-3 gap-1">
            <div className="col-span-2">
                <div className="text-xl text-white font-semibold mr-3 mb-1">{quiz.quizName}</div>
                {renderQuizTypeBadge(quiz.type)}
            </div>
            <div className="row-span-2 justify-self-end self-center flex items-center">
                <Link href={`/quiz/${quiz.id}/noa`}>
                    <button className="btn btn-outline border-[1px] border-zinc-700 btn-sm mr-3 whitespace-nowrap hidden sm:block">
                        Play Quiz
                    </button>
                </Link>
                {/* Options dropdown */}
                <div className="self-center cursor-pointer" onClick={() => toggleModal(quizActionsModalDomId)}>
                    <MoreIcon className=" text-zinc-300 sm:text-zinc-400 w-9 h-9" />
                </div>
            </div>
            {/* If we wanted a date to be shown, we'd uncomment this */}
            {/* <span className="tooltip tooltip-right w-min" data-tooltip="date created">
                <label className="col-span-2 text-sm text-gray-9 self-center whitespace-nowrap mr-1">
                    {formatDateLong(quiz.createdDate)}
                </label>
            </span> */}
        </div>
        {/* --------------- MOBILE LAYOUT --------------- */}
        <div className={`sm:hidden p-[1px] rounded-2xl bg-gradient-to-r hover:cursor-pointer
        ${isTimeAttackQuiz(quiz) ? " from-blue-500 via-blue-400 to-blue-500" : " from-purple-400 via-purple-300 to-purple-400"}`}
        onClick={() => toggleModal(quizActionsModalDomId)}>
            <div className="flex rounded-2xl py-3 px-4 bg-black">
                <div className="flex flex-col">
                    <div className="text-xl font-light text-white">{quiz.quizName}</div>
                    {/* <div className="text-xs text-gray-9">{formatDateLong(quiz.createdDate)}</div> */}
                    <div className="mt-[2px]">{renderQuizTypeBadge(quiz.type)}</div>
                </div>
                {/* Options modal */}
                <div className="ml-auto self-center">
                    <MoreIcon className=" text-zinc-300 sm:text-zinc-400 w-[26px] h-[26px]" />
                </div>
            </div>
        </div>
        {/* FIXED POSITION ELEMENTS */}
        {renderQuizLinkModal()}
        {renderDeleteQuizModal()}
        {renderQuizOptionsModal()}
    </>);
}