"use client";

import useRequestActiveUser from "@/app/hooks/api-access/useRequestActiveUser";
import useRequestGroupChatsInfo from "@/app/hooks/api-access/useRequestGroupChatsInfo";
import { GroupChatInfo, SurvivalQuiz, TimeAttackQuiz, User } from "@/app/interfaces";
import { demoGroupChats } from "@/app/utilities/demoData";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {

    // ----------- Hooks ------------------
    const router = useRouter();
    const requestActiveUser = useRequestActiveUser();
    const requestGroupChatsInfo = useRequestGroupChatsInfo();

    // ----------- State (Data) -----------
    const [activeUsername, setActiveUsername] = useState<string>("");
    const [groupChats, setGroupChats] = useState<Array<GroupChatInfo>>([]);

    // ----------- State (UI) -------------
    const [loading, setLoading] = useState<boolean>(true);
    const [lNavLeftAnim, setLNavLeftAnim] = useState<boolean>(false);
    const [lNavRightAnim, setLNavRightAnim] = useState<boolean>(false);

    useEffect(() => {
        const getPageData = async () => {
            const activeUser: User | null = await requestActiveUser();
            const groupChatsInfo: Array<GroupChatInfo> | null = await requestGroupChatsInfo();

            if (activeUser && groupChatsInfo) {
                setActiveUsername(activeUser.username);
                setGroupChats(sortGroupChatsByDate(groupChatsInfo));
                setLoading(false);
            } else {
                console.log("Error fetching user data, redirecting to root");
                router.push("/");
            }
        }
        getPageData();
    }, []);

    // =============== RENDER FUNCTIONS ===============

    const renderLatestGroupChat = () => {

        if (loading) return (<div className="skeleton h-[495px] w-full mt-8 py-7 px-5 rounded-xl border border-gray-7 opacity-25" />);

        // In the case where the user hasn't uploaded any group chats yet
        if (groupChats.length === 0) {
            return (
                <div className="w-full mt-8 bg-zinc-950 py-24 px-5 rounded-xl border border-gray-7 text-center">
                    <div className="text-2xl font-light text-gray-10">You haven't uploaded any group chats yet</div>
                    <div className="mt-6">Click "Upload New Group Chat" to get started!</div>
                </div>
            );
        }

        const latestGC: GroupChatInfo = groupChats[0]; // The latest group chat is the first element in the array

        return (
            <div className="w-full grid grid-cols-1 md:grid-cols-3 mt-8 bg-zinc-950 py-7 px-5 rounded-xl border border-gray-7">
                <div className="flex flex-col col-span-2 relative">
                    <div className="text-center sm:text-left text-3xl font-medium ml-1">
                        {latestGC.groupChatName} <span className="text-gray-7 font-light ml-2 hidden sm:inline-block">(Latest)</span>
                    </div>
                    <div className="mt-2">
                        <div className="badge badge-outline mx-1 mt-1 block sm:inline-block">
                            <span className="font-normal mr-2">Uploaded:</span> {formatDate(latestGC.uploadDate)}
                        </div>
                        <div className="flex justify-center sm:inline-block">
                            <div className="badge badge-outline mx-1 mt-2 sm:mt-1 grow flex justify-center sm:inline-block">
                                <span className="font-normal mr-2">Participants:</span> {latestGC.numParticipants}
                            </div>
                            <div className="badge badge-outline mx-1 mt-2 sm:mt-1 grow flex justify-center sm:inline-block">
                                <span className="font-normal mr-2">Messages:</span> {latestGC.numMessages}
                            </div>
                        </div>
                    </div>
                    <div className="mt-5 sm:mt-8 text-lg text-gray-9 font-light">
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
                    {renderLeaderboardPreview()}
                </div>
            </div>
        );
    }

    const renderLeaderboardPreview = () => {
        return (<>
            <div className="w-full">
                <div className="flex rounded-t-lg border-x border-t border-gray-6 shadow-sm bg-gray-1">
                    <button onClick={() => {setLNavLeftAnim(true)}} className="grow pt-1 hover:bg-gray-2 active:bg-gray-3 
                    active:duration-75 duration-200 active:ease-out ease-in rounded-tl-lg">
                        <span onAnimationEnd={() => {setLNavLeftAnim(false)}}
                        className={"inline-block duration-200 ease-in" + (lNavLeftAnim && " animate-leaderboardNavArrowLeft")}>
                            <Image className="rotate-180 mx-auto" src="nav-arrow.svg" alt="Prev" width={16} height={16} />
                        </span>
                    </button>
                    <button onClick={() => {setLNavRightAnim(true)}} className="grow pt-1 border-l border-gray-6 hover:bg-gray-2 
                    active:bg-gray-3 active:duration-75 duration-200 active:ease-out ease-in rounded-tr-lg">
                        <span onAnimationEnd={() => {setLNavRightAnim(false)}} 
                        className={"inline-block duration-200 ease-in" + (lNavRightAnim && " animate-leaderboardNavArrowRight")}>
                            <Image className="mx-auto" src="nav-arrow.svg" alt="Next" width={16} height={16} />
                        </span>
                    </button>
                </div>
                <div className="w-full min-h-[400px] h-max border border-border rounded-b-lg shadow-md bg-black">
                    <div className="w-full text-xl text-center py-3 mb-2 font-extralight border-b border-gray-6">
                        Quiz title here
                    </div>
                </div>
            </div>
        </>);
    }

    const renderOlderGroupChats = () => {
        if (loading) return (<div className="skeleton h-48 w-full mt-8 py-7 px-5 rounded-xl border border-gray-7 opacity-25" />);

        if (groupChats.length < 2) return (<div className="text-center text-gray-7 font-light text-sm">Nothing here</div>);

        let groupChatRows: Array<JSX.Element> = [];
        let startIdx: number = groupChats[0].quizzes.length;
        groupChats.forEach((groupChat, index) => {
            if (index === 0) return;
            groupChatRows.push(
                <div className="accordion" key={index}>
                    <input type="checkbox" id={`toggle-${index}`} className="accordion-toggle" />
                    <label htmlFor={`toggle-${index}`} className="accordion-title bg-zinc-950">
                        <span className="font-light text-lg sm:text-xl">{groupChat.groupChatName}</span>
                        <div className="mt-1">
                            <span className="badge badge-outline mr-2">
                                <span className="font-normal mr-2">Uploaded:</span> {formatDate(groupChat.uploadDate)}
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
        const quizzes: Array<TimeAttackQuiz | SurvivalQuiz> = groupChat.quizzes;

        return quizzes.map((quiz, index) => (<div key={index}>
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
                            <a tabIndex={-1} className="dropdown-item text-sm">Messages in Quiz</a>
                            <a tabIndex={-1} className="dropdown-item text-sm text-red-9">Delete Quiz</a>
                        </div>
                    </details>
                </div>
                <span className="tooltip tooltip-right w-min" data-tooltip="date created">
                    <label className="col-span-2 text-sm text-gray-9 self-center whitespace-nowrap mr-1">
                        {formatDate(quiz.createdDate)}
                    </label>
                </span>
            </div>
            {/* --------------- MOBILE LAYOUT --------------- */}
            <div className="flex sm:hidden">
                <div className="block">
                    <div className="text-lg font-semibold">{quiz.quizName}</div>
                    <div className="text-xs text-gray-9">Created: {formatDate(quiz.createdDate)}</div>
                    <div className="mt-1">{renderQuizTypeBadge(quiz.type)}</div>
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
                                <h2 className="text-xl text-white">{quiz.quizName}</h2>
                                <div className=" mb-4">{renderQuizTypeBadge(quiz.type)}</div>
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

    // =============== HELPER FUNCTIONS ===============

    const renderQuizTypeBadge = (type: string) => {
        if (type === "TIME_ATTACK") {
            return (<span className="py-[2px] px-2 bg-blue-4 rounded-lg text-blue-12 text-sm
                font-semibold relative bottom-[1px] whitespace-nowrap">Time Attack</span>);
        }
        return (<span className="py-[2px] px-2 bg-red-4 rounded-lg text-red-12 text-sm
            font-semibold relative bottom-[1px] whitespace-nowrap">Survival</span>);
    }

    const sortGroupChatsByDate = (groupChats: Array<GroupChatInfo>) => {
        return groupChats.sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime());
    }

    const formatDate = (date: Date): string => {

        const getOrdinalSuffix = (day: number) => {
            if (day > 3 && day < 21) return 'th';
            switch (day % 10) {
                case 1:  return "st";
                case 2:  return "nd";
                case 3:  return "rd";
                default: return "th";
            }
        }
        const month: string = date.toLocaleString('default', { month: 'long' });
        const day: string = date.getDate().toString();
        const year: string = date.getFullYear().toString();
        const ordinalSuffix = getOrdinalSuffix(date.getDate());
        return `${month} ${day}${ordinalSuffix}, ${year}`;
    }

    // =============== MAIN RENDER ===============

    return (
        <main className="flex min-h-screen flex-col items-center justify-between">
            <div className="relative w-[95%] lg:w-[90%] xl:w-[70%] 2xl:w-[60%] mt-12 sm:mt-24">
                <div className="text-4xl text-center sm:text-left sm:text-5xl font-bold">
                    <span className="sm:mr-4">Welcome,</span>
                    <br className="sm:hidden" /> 
                    {!loading ? activeUsername : 
                    <div className="skeleton h-11 w-60 rounded-md inline-block mt-1 sm:mt-0 opacity-25" />}
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