import useDeleteQuiz from "../hooks/api_access/quizzes/useDeleteQuiz";

import { Quiz, ResponseStatus } from "../interfaces";
import { renderQuizTypeBadge, renderModalResponseAlert, formatDateLong, toggleModal, isModalOpen } from "../utilities/miscFunctions";
import Modal from "./Modal";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

// This component renders the information for a quiz as a row.
// It displays the quiz name, type, and date created, as well as relevant actions for the quiz.

interface QuizRowProps {
    groupChatId: number;
    quiz: Quiz;
    setReloadCounter: React.Dispatch<React.SetStateAction<number>>;
}
export default function QuizRow({groupChatId, quiz, setReloadCounter}: QuizRowProps) {

    const deleteModalDomId: string = `quiz-delete-${quiz.id}`;

    // ----------- Hooks ------------------
    const deleteQuiz = useDeleteQuiz();

    // ----------- State (UI) -------------
    const [deleting, setDeleting] = useState<boolean>(false);
    const [responseStatus, setResponseStatus] = useState<ResponseStatus>({ message: "", success: false, doAnimate: false });

    const handleDelete = async () => {
        setDeleting(true);
        const error = await deleteQuiz(quiz.id);
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
            if (isModalOpen(deleteModalDomId)) {
                toggleModal(deleteModalDomId);
            }    
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
                <div className="mx-auto mb-5 text-center">
                    <div className="mb-2 text-2xl text-gray-11">
                        Delete {quiz.quizName}?
                    </div>
                    <div className="mb-2 px-4 max-w-[300px] text-sm text-gray-9 font-light">
                        Deleting this quiz will also delete all of its leaderboard entries.
                    </div>
                    <div className="text-gray-10 font-semibold">
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
            <Modal domId={`quiz-delete-${quiz.id}`} title="Delete Quiz" maxWidth="400px" margin="24px" darkOverlay>
                {modalContent}
            </Modal>
        );
    }

    return (<>
        {/* --------------- DESKTOP LAYOUT --------------- */}
        <div className="hidden sm:grid grid-cols-3 grid-rows-2 gap-1">
            <div className="col-span-2">
                <span className="text-xl text-white font-semibold mr-3">{quiz.quizName}</span><wbr />
                {renderQuizTypeBadge(quiz.type)}
            </div>
            <div className="row-span-2 justify-self-end self-center flex items-center">
                <button className="btn btn-solid btn-sm mr-2 whitespace-nowrap hidden sm:block">Copy Link</button>
                {/* Options dropdown */}
                <details className="dropdown">
                    <summary tabIndex={0} className="hover:cursor-pointer list-none"><Image src="menu.svg" alt="Menu" width={44} height={44} /></summary>
                    <div className="dropdown-menu dropdown-menu-left shadow-md">
                        <Link href={`/leaderboard/${quiz.id}`} className="dropdown-item text-sm">Quiz Leaderboard</Link>
                        <Link href={`/messages/${groupChatId}/${quiz.id}`} tabIndex={-1} className="dropdown-item text-sm">Messages in Quiz</Link>
                        <a tabIndex={-1} className="dropdown-item text-sm text-red-9"
                        onClick={() => toggleModal(deleteModalDomId)}>
                            Delete Quiz
                        </a>
                    </div>
                </details>
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
                <label htmlFor={`quiz-actions-${quiz.id}`}><Image src="menu.svg" alt="Menu" width={36} height={36} /></label>
                <Modal domId={`quiz-actions-${quiz.id}`} title="Quiz Actions">
                    <div className="px-4 text-center mb-3">
                        <h2 className="text-xl text-white">{quiz.quizName}</h2>
                        <div className=" mb-4">{renderQuizTypeBadge(quiz.type)}</div>
                    </div>
                    <div className="px-4 mb-4">
                        <button className="btn btn-primary w-full text-lg">Copy Shareable Link</button>
                        <Link href={`/leaderboard/${quiz.id}`}>
                            <button className="btn btn-sm w-full mt-2">Quiz Leaderboard</button>
                        </Link>
                        <Link href={`/messages/${groupChatId}/${quiz.id}`}>
                            <button className="btn btn-sm w-full mt-2">Messages in Quiz</button>
                        </Link>
                        <button className="btn btn-sm w-full mt-2 text-red-8 font-bold"
                        onClick={() => toggleModal(deleteModalDomId)}>
                            Delete Quiz
                        </button>
                    </div>
                </Modal>
            </div>
        </div>
        {/* FIXED POSITION ELEMENTS */}
        {renderDeleteQuizModal()}
    </>);
}