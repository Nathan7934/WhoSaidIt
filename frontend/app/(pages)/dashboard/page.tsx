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
            <div className="w-full grid grid-cols-3 mt-8 bg-zinc-950 py-7 px-5 rounded-md border border-gray-7">
                <div className="flex-grow col-span-2 relative">
                    <div className="text-3xl font-medium ml-1">
                        {latestGC.name} <span className="text-gray-7 font-light ml-2">(Latest)</span>
                    </div>
                    <div className="mt-3">
                        <span className="badge badge-outline">
                            <span className="font-normal mr-2">Uploaded:</span> {latestGC.uploadDate.toDateString()}
                        </span>
                        <span className="badge badge-outline ml-2">
                            <span className="font-normal mr-2">Participants:</span> {latestGC.numParticipants}
                        </span>
                        <span className="badge badge-outline ml-2">
                            <span className="font-normal mr-2">Messages:</span> {latestGC.numMessages}
                        </span>
                    </div>
                    <div className="mt-8 text-lg underline decoration-1 underline-offset-2 text-gray-9 font-light">
                        Your quizzes:
                    </div>
                    <div className="w-full mt-4 pr-8">
                        {renderQuizRows(latestGC)}
                    </div>
                    <div className="absolute bottom-0">
                        <button className="btn btn-primary btn-sm mr-2">Generate New Quiz</button>
                        <button className="btn mr-2 btn-sm">View Messages</button>
                        <button className="btn btn-sm mr-2">Manage Participants</button>
                    </div>
                </div>
                <div>
                    <div className="w-full text-center text-xl mb-2 font-medium">
                        ~ Leaderboards ~
                    </div>
                    <div className="w-full h-[400px] bg-gray-1 border border-border rounded-lg shadow-md">
                        
                    </div>
                </div>
            </div>
        );
    }

    const renderOlderGroupChats = () => {
        let groupChatRows: Array<JSX.Element> = [];
        groupChats.forEach((groupChat, index) => {
            if (groupChat === latestGroupChat) return;
            groupChatRows.push(
                <div className="accordion" key={index}>
                    <input type="checkbox" id={`toggle-${index}`} className="accordion-toggle" />
                    <label htmlFor={`toggle-${index}`} className="accordion-title bg-zinc-950">
                        <span className="font-light">{groupChat.name}</span>
                        <div className="mt-0">
                            <span className="badge badge-outline">
                                <span className="font-normal mr-2">Uploaded:</span> {groupChat.uploadDate.toDateString()}
                            </span>
                            <span className="badge badge-outline ml-2">
                                <span className="font-normal mr-2">Participants:</span> {groupChat.numParticipants}
                            </span>
                            <span className="badge badge-outline ml-2">
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
                                Your Quizzes:
                            </div>
                            {renderQuizRows(groupChat)}
                            <div className="mt-8">
                                <button className="btn btn-primary btn-sm mr-2">Generate New Quiz</button>
                                <button className="btn mr-2 btn-sm">View Messages</button>
                                <button className="btn btn-sm mr-2">Manage Participants</button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        });
        return(
            <div className="accordion-group accordion-group-bordered mb-5">
                {groupChatRows}
            </div>
        );
    }

    const renderQuizRows = (groupChat: GroupChatInfo) => {
        const quizzes: Array<Quiz> = groupChat.quizzes;

        const renderTypeBadge = (type: string) => {
            if (type === "TIME_ATTACK") {
                return (<span className="ml-3 py-[2px] px-2 bg-blue-4 rounded-lg text-blue-12 text-sm
                font-semibold relative bottom-[1px]">Time Attack</span>);
            }
            return (<span className="ml-3 py-[2px] px-2 bg-red-4 rounded-lg text-red-12 text-sm
            font-semibold relative bottom-[1px]">Survival</span>);
        }

        return quizzes.map((quiz, index) => (<div key={index}>
            <div className="grid grid-cols-3 grid-rows-2 gap-1">
                <div className="col-span-2">
                    <span className="text-xl font-semibold">{quiz.name}</span>
                    {renderTypeBadge(quiz.type)}
                </div>
                <div className="row-span-2 justify-self-end self-center flex items-center">
                    <button className="btn btn-outline btn-sm mr-2">Copy Link</button>
                    <div className="dropdown">
                        <label tabIndex={0} className="hover:cursor-pointer"><Image src="menu.svg" alt="Menu" width={44} height={44} /></label>
                        <div className="dropdown-menu dropdown-menu-left">
                            <a className="dropdown-item text-sm">Quiz Leaderboard</a>
                            <a tabIndex={-1} className="dropdown-item text-sm">Messages in Quiz</a>
                            <a tabIndex={-1} className="dropdown-item text-sm text-red-9">Delete Quiz</a>
                        </div>
                    </div>
                </div>
                <div className="text-sm text-gray-9 self-center">
                    Created: {quiz.createdDate.toDateString()}
                </div>
            </div>
            {index !== quizzes.length - 1 && <div className="divider my-0"></div>}
        </div>));
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-between">
            <div className="relative w-[95%] lg:w-[90%] xl:w-[70%] 2xl:w-[60%] mt-24">
                <div className="text-5xl font-bold">Welcome, Nathan7934!</div>
                <div className="w-full flow-root mt-8">
                    <div className="float-left btn-group btn-group-scrollable">
                        <button className="btn">Manage Group Chats</button>
                        <button className="btn">Manage Quizzes</button>
                    </div>
                    <button className="float-right btn btn-primary">Upload New Group Chat</button>
                </div>
                {renderLatestGroupChat()}
                <div className="divider divider-horizontal mt-10 mb-6 text-gray-9 font-light">Older Group Chats</div>
                {renderOlderGroupChats()}
            </div>
        </main>
    )
}