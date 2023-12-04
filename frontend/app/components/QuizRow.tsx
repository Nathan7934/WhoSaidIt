import { Quiz, GroupChatInfo } from "../interfaces";
import { renderQuizTypeBadge, toggleModal, isModalOpen, formatDateLong } from "../utilities/miscFunctions";
import Modal from "./Modal";

import Link from "next/link";
import Image from "next/image";

// This component renders the information for a quiz as a row.
// It displays the quiz name, type, and date created, as well as relevant actions for the quiz.

interface QuizRowProps {
    groupChatId: number;
    quiz: Quiz;
}
export default function QuizRow({groupChatId, quiz}: QuizRowProps) {
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
                        <a className="dropdown-item text-sm">Quiz Leaderboard</a>
                        <Link href={`/messages/${groupChatId}/${quiz.id}`} tabIndex={-1} className="dropdown-item text-sm">Messages in Quiz</Link>
                        <a tabIndex={-1} className="dropdown-item text-sm text-red-9">Delete Quiz</a>
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
                        <button className="btn btn-sm w-full mt-2">Quiz Leaderboard</button>
                        <Link href={`/messages/${groupChatId}/${quiz.id}`}>
                            <button className="btn btn-sm w-full mt-2">Messages in Quiz</button>
                        </Link>
                        <button className="btn btn-sm w-full mt-2 text-red-8 font-bold">Delete Quiz</button>
                    </div>
                </Modal>
            </div>
        </div>
    </>);
}