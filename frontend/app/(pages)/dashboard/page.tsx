"use client";

import useAuth from "@/app/hooks/useAuth";
import { GroupChatInfo, Quiz } from "@/app/interfaces";
import { demoGroupChats } from "@/app/utilities/demoData";

import Image from "next/image";
import { useState } from "react";

export default function Dashboard() {

    const { userId } = useAuth();

    const [groupChats, setGroupChats] = useState<Array<GroupChatInfo>>(demoGroupChats);
    const [latestGroupChat, setLatestGroupChat] = useState<GroupChatInfo>(groupChats[0]);

    const renderLatestGroupChat = () => {
        const latestGC: GroupChatInfo = groupChats[0]; // TODO: Determine latest group chat by date

        return (
            <div className="w-full grid grid-cols-1 md:grid-cols-3 mt-8 bg-zinc-950 py-7 px-5 rounded-xl border border-gray-7">
                <div className="flex flex-col col-span-2 relative">
                    <div className="text-center sm:text-left text-3xl font-medium ml-1">
                        {latestGC.name} <span className="text-gray-7 font-light ml-2 hidden sm:inline-block">(Latest)</span>
                    </div>
                    <div className="mt-2">
                        <div className="badge badge-outline mx-1 mt-1 block sm:inline-block">
                            <span className="font-normal mr-2">Uploaded:</span> {latestGC.uploadDate.toDateString()}
                        </div>
                        <div className="flex justify-center sm:inline-block">
                            <div className="badge badge-outline mx-1 mt-1 grow flex justify-center sm:inline-block">
                                <span className="font-normal mr-2">Participants:</span> {latestGC.numParticipants}
                            </div>
                            <div className="badge badge-outline mx-1 mt-1 grow flex justify-center sm:inline-block">
                                <span className="font-normal mr-2">Messages:</span> {latestGC.numMessages}
                            </div>
                        </div>
                    </div>
                    <div className="mt-5 sm:mt-8 text-lg underline decoration-1 underline-offset-2 text-gray-9 font-light">
                        Quizzes for this chat:
                    </div>
                    <div className="w-full mt-4 mb-6 md:pr-8">
                        {renderQuizRows(latestGC)}
                    </div>
                    <div className="sm:flex sm:flex-grow sm:items-end">
                        <button className="btn btn-primary btn-sm mr-2 w-full sm:w-auto">Generate New Quiz</button>
                        <div className="flex">
                            <button className="btn mr-2 btn-sm mt-2 sm:mt-0 grow">View Messages</button>
                            <button className="btn btn-sm mt-2 sm:mt-0">Manage Participants</button>
                        </div>
                    </div>
                </div>
                <div className="mt-6 md:mt-0">
                    <div className="w-full text-xl mb-2 font-medium flex justify-center">
                        <div className="relative w-[20px] h-[20px] mr-3 top-[3px]">
                            <Image src="/sparkles.png" alt="~" fill style={{ objectFit: "contain"}} className="scale-x-[-1]"/>
                        </div>
                        Leaderboards
                        <div className="relative w-[20px] h-[20px] ml-3 top-[3px]">
                            <Image src="/sparkles.png" alt="~" fill style={{ objectFit: "contain"}} />
                        </div>
                    </div>
                    <div className="w-full min-h-[400px] h-max bg-gray-1 border border-border rounded-lg shadow-md">
                        {/* Implement leaderboard preview component here */}
                    </div>
                </div>
            </div>
        );
    }

    const renderOlderGroupChats = () => {
        let groupChatRows: Array<JSX.Element> = [];
        let startIdx: number = latestGroupChat.quizzes.length;
        groupChats.forEach((groupChat, index) => {
            if (groupChat === latestGroupChat) return;
            groupChatRows.push(
                <div className="accordion" key={index}>
                    <input type="checkbox" id={`toggle-${index}`} className="accordion-toggle" />
                    <label htmlFor={`toggle-${index}`} className="accordion-title bg-zinc-950">
                        <span className="font-light text-lg sm:text-xl">{groupChat.name}</span>
                        <div className="mt-1">
                            <span className="badge badge-outline mr-2">
                                <span className="font-normal mr-2">Uploaded:</span> {groupChat.uploadDate.toDateString()}
                            </span>
                            <span className="badge badge-outline mr-2">
                                <span className="font-normal mr-2">Participants:</span> {groupChat.numParticipants}
                            </span>
                            <span className="badge badge-outline">
                                <span className="font-normal mr-2">Messages:</span> {groupChat.numMessages}
                            </span>
                        </div>
                    </label>
                    <span className="accordion-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                            <path d="M13.293 6.293 7.586 12l5.707 5.707 1.414-1.414L10.414 12l4.293-4.293z" />
                        </svg>
                    </span>
                    <div className="accordion-content text-content2 bg-[#09090bb9]">
                        <div className="min-h-0">
                            <div className="mb-4 text-lg underline decoration-1 underline-offset-2 text-gray-9 font-light">
                                Quizzes for this chat:
                            </div>
                            {renderQuizRows(groupChat, startIdx)}
                            <div className="sm:flex sm:flex-grow sm:items-end mt-8">
                                <button className="btn btn-primary btn-sm mr-2 w-full sm:w-auto">Generate New Quiz</button>
                                <div className="flex">
                                    <button className="btn mr-2 btn-sm mt-2 sm:mt-0 grow">View Messages</button>
                                    <button className="btn btn-sm mt-2 sm:mt-0">Manage Participants</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
            startIdx += groupChat.quizzes.length;
        });
        return(
            <div className="accordion-group accordion-group-bordered mb-5">
                {groupChatRows}
            </div>
        );
    }

    const renderQuizRows = (groupChat: GroupChatInfo, startIdx:number = 0) => {
        const quizzes: Array<Quiz> = groupChat.quizzes;

        const renderTypeBadge = (type: string) => {
            if (type === "TIME_ATTACK") {
                return (<span className="py-[2px] px-2 bg-blue-4 rounded-lg text-blue-12 text-sm
                    font-semibold relative bottom-[1px] whitespace-nowrap">Time Attack</span>);
            }
            return (<span className="py-[2px] px-2 bg-red-4 rounded-lg text-red-12 text-sm
                font-semibold relative bottom-[1px] whitespace-nowrap">Survival</span>);
        }

        return quizzes.map((quiz, index) => (<div key={index}>
            {/* =============== DESKTOP LAYOUT =============== */}
            <div className="hidden sm:grid grid-cols-3 grid-rows-2 gap-1">
                <div className="col-span-2">
                    <span className="text-xl font-semibold mr-3">{quiz.name}</span><wbr />
                    {renderTypeBadge(quiz.type)}
                </div>
                <div className="row-span-2 justify-self-end self-center flex items-center">
                    <button className="btn btn-outline btn-sm mr-2 whitespace-nowrap hidden sm:block">Copy Link</button>
                    {/* Options dropdown */}
                    <div className="dropdown">
                        <label tabIndex={0} className="hover:cursor-pointer"><Image src="menu.svg" alt="Menu" width={44} height={44} /></label>
                        <div className="dropdown-menu dropdown-menu-left shadow-md">
                            <a className="dropdown-item text-sm">Quiz Leaderboard</a>
                            <a tabIndex={-1} className="dropdown-item text-sm">Messages in Quiz</a>
                            <a tabIndex={-1} className="dropdown-item text-sm text-red-9">Delete Quiz</a>
                        </div>
                    </div>
                </div>
                <div className="col-span-2 text-sm text-gray-9 self-center">
                    Created: {quiz.createdDate.toDateString()}
                </div>
            </div>
            {/* =============== MOBILE LAYOUT =============== */}
            <div className="flex sm:hidden">
                <div className="block">
                    <div className="text-lg font-semibold">{quiz.name}</div>
                    <div className="text-xs text-gray-9">Created: {quiz.createdDate.toDateString()}</div>
                    <div className="mt-1">{renderTypeBadge(quiz.type)}</div>
                </div>
                {/* Options modal */}
                <div className="ml-auto mr-1 self-center">
                    <label htmlFor={`modal-${startIdx + index}`}><Image src="menu.svg" alt="Menu" width={36} height={36} /></label>
                    <input className="modal-state" id={`modal-${startIdx + index}`} type="checkbox" />
                    <div className="modal w-screen">
                        <label className="modal-overlay" htmlFor={`modal-${startIdx + index}`}></label>
                        <div className="modal-content flex flex-col w-full mx-6 p-0 bg-zinc-950 border-[1px] border-gray-3">
                            <div className="flex w-full mt-1">
                                <div className="relative bottom-[2px] self-center text-lg text-gray-11 font-extralight ml-4">Actions</div>
                                <label htmlFor={`modal-${startIdx + index}`} className="btn btn-sm btn-circle btn-ghost text-lg ml-auto mr-1">✕</label>
                            </div>
                            <div className="divider my-0 mx-3 relative bottom-2"></div>
                            <div className="px-4 text-center mb-3">
                                <h2 className="text-xl text-white">{quiz.name}</h2>
                                <div className=" mb-4">{renderTypeBadge(quiz.type)}</div>
                            </div>
                            {/* <div className="divider my-0 mx-3 relative bottom-1 mb-2"></div> */}
                            <div className="px-4 mb-4">
                                <button className="btn w-full text-lg">Copy Shareable Link</button>
                                <button className="btn btn-sm w-full mt-2">Quiz Leaderboard</button>
                                <button className="btn btn-sm w-full mt-2">Messages in Quiz</button>
                                <button className="btn btn-sm w-full mt-2 text-red-8 font-bold">Delete Quiz</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {index !== quizzes.length - 1 && <div className="divider my-0"></div>}
        </div>));
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-between">
            <div className="relative w-[95%] lg:w-[90%] xl:w-[70%] 2xl:w-[60%] mt-12 sm:mt-24">
                <div className="text-4xl text-center sm:text-left sm:text-5xl font-bold">
                    Welcome,<br className="sm:hidden" /> Nathan7934!
                </div>
                <div className="mt-8 flex flex-col sm:flex-row items-center">
                    <div className="btn-group btn-group-scrollable">
                        <button className="btn">Manage Group Chats</button>
                        <button className="btn">Manage Quizzes</button>
                    </div>
                    <button className="btn btn-primary sm:ml-auto mt-3 sm:mt-0 w-[330px] sm:w-auto">Upload New Group Chat</button>
                </div>
                {renderLatestGroupChat()}
                <div className="divider divider-horizontal mt-10 mb-6 text-gray-9 font-light">Older Group Chats</div>
                {renderOlderGroupChats()}
            </div>
        </main>
    )
}