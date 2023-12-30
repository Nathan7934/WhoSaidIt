"use client";

import useGetActiveUser from "@/app/hooks/api_access/user/useGetActiveUser";
import useGetGroupChatsInfo from "@/app/hooks/api_access/group_chats/useGetGroupChatsInfo";
import useGetGroupChatLeaderboards from "@/app/hooks/api_access/leaderboards/useGetGroupChatLeaderboards";
import { User, GroupChatInfo, SurvivalEntry, TimeAttackEntry, QuizLeaderboardInfo } from "@/app/interfaces";
import { renderQuizRows, toggleModal, isTimeAttackEntry, isSurvivalEntry } from "@/app/utilities/miscFunctions";
import GroupChatInfoRow from "@/app/components/GroupChatInfoRow";
import GroupChatUploadModal from "@/app/components/GroupChatUploadModal";
import CreateQuizModal from "@/app/components/CreateQuizModal";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface NamedQuizLeaderboardInfo {
    quizName: string;
    leaderboard: Array<TimeAttackEntry | SurvivalEntry>;
}
interface LeaderboardAnimationStatus {
    entering: number;
    exiting: number;
    isPrev: boolean;
}

export default function Dashboard() {

    // ----------- Hooks ------------------
    const router = useRouter();
    const getActiveUser = useGetActiveUser();
    const getGroupChatsInfo = useGetGroupChatsInfo();
    const getGroupChatLeaderboards = useGetGroupChatLeaderboards();

    // ----------- State (Data) -----------
    const [activeUser, setActiveUser] = useState<User | null>(null);
    const [groupChats, setGroupChats] = useState<Array<GroupChatInfo>>([]);
    const [previewLeaderboards, setPreviewLeaderboards] = useState<Array<NamedQuizLeaderboardInfo>>([]);

    // ----------- State (UI) -------------
    const [loading, setLoading] = useState<boolean>(true);
    const [lNavLeftAnim, setLNavLeftAnim] = useState<boolean>(false);
    const [lNavRightAnim, setLNavRightAnim] = useState<boolean>(false);
    const [selectedLeaderboardIndex, setSelectedLeaderboardIndex] = useState<number>(0); // [0, previewLeaderboards.length)
    const [leaderboardAnimationStatus, setLeaderboardAnimationStatus] = useState<LeaderboardAnimationStatus | null>(null);

    // Used to trigger a re-fetch for the page data when the user uploads a new group chat
    const [reloadCounter, setReloadCounter] = useState<number>(0); 

    // ----------- Data Retrieval ---------
    useEffect(() => {
        const getPageData = async () => {
            const activeUser: User | null = await getActiveUser();
            const groupChatsInfo: Array<GroupChatInfo> | null = await getGroupChatsInfo();

            if (activeUser && groupChatsInfo) {
                setActiveUser(activeUser);
                setGroupChats(groupChatsInfo);

                if (groupChatsInfo.length > 0) {
                    const leaderboards: Array<QuizLeaderboardInfo> | null = await getGroupChatLeaderboards(groupChatsInfo[0].id);
                    if (leaderboards) {
                        setPreviewLeaderboards(convertToNamedQuizLeaderboardInfo(groupChatsInfo[0], leaderboards));
                    } else {
                        console.log("Error fetching leaderboards");
                    }
                }
                
                setLoading(false);
            } else {
                console.error("Error fetching user data, redirecting to root");
                router.push("/");
            }
        }
        getPageData();
    }, [reloadCounter]);

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
            <div className="w-full grid grid-cols-1 lg:grid-cols-3 mb-3 lg:mb-0 mt-8 bg-zinc-950 py-7 px-5 rounded-xl border border-gray-7">
                <div className="flex flex-col col-span-2 relative">
                    <div className="text-center sm:text-left text-3xl font-medium ml-1">
                        {latestGC.groupChatName} <span className="text-gray-7 font-light ml-2 hidden sm:inline-block">(Latest)</span>
                    </div>
                    <div className="mt-2 hidden sm:block">
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
                    <div className="w-full sm:pb-6 mb-2 sm:mb-0 pr-1 lg:pr-8 max-h-[350px] overflow-y-scroll">
                        <div className="hidden lg:block mb-2 mt-5 sm:mt-8 text-lg text-gray-9 font-light opacity-60">
                            Quizzes for this chat:
                        </div>
                        <div className="lg:hidden divider divider-horizontal mb-2 mt-5 sm:mt-8 text-gray-9 font-light opacity-60">
                            Quizzes for this chat:
                        </div>
                        {renderQuizRows(latestGC, setReloadCounter)}
                    </div>
                    <div className="sm:flex sm:flex-grow sm:items-end justify-center lg:justify-start">
                        <button className="btn btn-primary btn-sm mr-2 w-full sm:w-auto"
                        onClick={() => toggleModal("create-quiz-modal")}>
                            Create New Quiz
                        </button>
                        <div className="flex">
                            <Link href={`/messages/${latestGC.id}`} className="grow sm:flex-none mr-2">
                                <button className="btn btn-sm mt-2 sm:mt-0 w-full">View Messages</button>
                            </Link>
                            <Link href={`/participants/${latestGC.id}`}>
                                <button className="btn btn-sm mt-2 sm:mt-0">Manage Participants</button>
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="mt-6 lg:mt-0 md:max-lg:w-[75%] md:max-lg:flex-col md:max-lg:mx-auto">
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

    const lNavLeftButtonClicked = () => {
        setLNavLeftAnim(true);
        if (selectedLeaderboardIndex > 0) {
            setLeaderboardAnimationStatus({entering: selectedLeaderboardIndex - 1, exiting: selectedLeaderboardIndex, isPrev: true});
            setSelectedLeaderboardIndex(selectedLeaderboardIndex - 1);
        }
    }

    const lNavRightButtonClicked = () => {
        setLNavRightAnim(true);
        if (selectedLeaderboardIndex < previewLeaderboards.length - 1) {
            setLeaderboardAnimationStatus({entering: selectedLeaderboardIndex + 1, exiting: selectedLeaderboardIndex, isPrev: false});
            setSelectedLeaderboardIndex(selectedLeaderboardIndex + 1);
        }
    }

    const renderLeaderboardPreview = () => {
        return (<>
            <div className="w-full">
                <div className="flex rounded-t-lg border-x border-t border-gray-6 shadow-sm bg-gray-1">
                    <button onClick={lNavLeftButtonClicked} className="grow pt-1 sm:hover:bg-gray-2 active:bg-gray-3 
                    active:duration-75 duration-200 active:ease-out ease-in rounded-tl-lg">
                        <span onAnimationEnd={() => {setLNavLeftAnim(false)}}
                        className={"inline-block duration-200 ease-in" + (lNavLeftAnim && " animate-leaderboardNavArrowLeft")}>
                            <Image className="rotate-180 mx-auto" src="nav-arrow.svg" alt="Prev" width={16} height={16} />
                        </span>
                    </button>
                    <button onClick={lNavRightButtonClicked} className="grow pt-1 border-l border-gray-6 sm:hover:bg-gray-2 
                    active:bg-gray-3 active:duration-75 duration-200 active:ease-out ease-in rounded-tr-lg">
                        <span onAnimationEnd={() => {setLNavRightAnim(false)}} 
                        className={"inline-block duration-200 ease-in" + (lNavRightAnim && " animate-leaderboardNavArrowRight")}>
                            <Image className="mx-auto" src="nav-arrow.svg" alt="Next" width={16} height={16} />
                        </span>
                    </button>
                </div>
                <div className="relative w-full min-h-[400px] h-max border border-border rounded-b-lg shadow-md bg-black overflow-x-hidden">
                    {renderLeaderboards()}
                </div>
            </div>
        </>);
    }

    const renderLeaderboards = () => {
        if (previewLeaderboards.length === 0) {
            return (
                <div className="absolute top-[45%] translate-y-[-50%] w-full text-center text-2xl text-gray-9 font-light opacity-60">
                    No quizzes yet
                </div>
            );
        }
        
        let leaderboardElements: Array<JSX.Element> = [];
        previewLeaderboards.forEach((leaderboardInfo, index) => {
            leaderboardElements.push(
                <div key={index} className={"absolute inset-0 w-full" + determineLeaderboardAnimationClassName(index)}>
                    <div className="w-full text-2xl text-center mt-4 mb-2 font-light">
                        {leaderboardInfo.quizName}
                    </div>
                    {renderLeaderboardEntries(leaderboardInfo.leaderboard)}
                </div>
            );
        });
        return leaderboardElements;
    }

    const renderLeaderboardEntries = (leaderboard: Array<TimeAttackEntry | SurvivalEntry>) => {
        if (leaderboard.length === 0) {
            return (<div className="w-full h-full flex flex-col items-center justify-center">
                <div className="text-2xl text-gray-9 font-light">No entries yet</div>
            </div>);
        }
        
        let leaderboardEntries: Array<JSX.Element> = [];
        leaderboard.forEach((entry, index) => {
            const rank: number = index + 1;
            leaderboardEntries.push(
                <div key={index} className="flex justify-between px-4 md:max-lg:px-10 py-1">
                    <div className="flex items-center">
                        <div className="text-lg text-gray-8 font-light mr-4 w-5 text-right">
                            {rank}.
                        </div>
                        <div className="text-lg text-gray-12 font-light">{entry.playerName}</div>
                    </div>
                    <div className="text-lg text-gray-11">
                        {isTimeAttackEntry(entry) ? entry.score : isSurvivalEntry(entry) ? entry.streak : ""}
                    </div>
                </div>
            );
        });
        const isTimeAttack: boolean = isTimeAttackEntry(leaderboard[0]);
        return (<>
            <div className="flex justify-between px-4 md:max-lg:px-10 py-1 border-b border-gray-6 mb-2">
                <div className="flex items-center">
                    <div className="text-gray-8 mr-4 pr-1 w-5 text-right">
                        #
                    </div>
                    <div className="text-gray-9 font-light">Player</div>
                </div>
                <div className="font-light text-gray-9">
                    {isTimeAttack ? "Score" : "Streak"}
                </div>
            </div>
            {leaderboardEntries}
        </>);
    }

    const renderOlderGroupChats = () => {
        if (loading) return (<div className="skeleton h-48 w-full mt-8 py-7 px-5 rounded-xl border border-gray-7 opacity-25" />);

        if (groupChats.length < 2) return (<div className="text-center text-gray-7 font-light text-sm">Nothing here</div>);

        let groupChatRows: Array<JSX.Element> = [];
        groupChats.forEach((groupChat, index) => {
            if (index === 0) return;
            groupChatRows.push(<GroupChatInfoRow key={1000 - index} groupChat={groupChat} setReloadCounter={setReloadCounter} />);
        });
        return(
            <div className="accordion-group accordion-group-bordered mb-5">
                {groupChatRows}
            </div>
        );
    }

    // =============== HELPER FUNCTIONS ===============

    const formatDate = (date: Date): string => {
        const month: string = date.toLocaleString('default', { month: 'long' });
        const day: string = date.getDate().toString();
        const year: string = date.getFullYear().toString();
        const ordinalSuffix = getOrdinalSuffix(date.getDate());
        return `${month} ${day}${ordinalSuffix}, ${year}`;
    }

    const getOrdinalSuffix = (number: number) => {
        if (number > 3 && number < 21) return 'th';
        switch (number % 10) {
            case 1:  return "st";
            case 2:  return "nd";
            case 3:  return "rd";
            default: return "th";
        }
    }

    // The API returns an array of leaderboards, each with a quizId. This function converts the quizId to a quizName
    const convertToNamedQuizLeaderboardInfo = (groupChat: GroupChatInfo, leaderboards: Array<QuizLeaderboardInfo>): Array<NamedQuizLeaderboardInfo> => {

        const getQuizNameById = (groupChat: GroupChatInfo, quizId: number): string | undefined => {
            const quiz = groupChat.quizzes.find(q => q.id === quizId);
            return quiz?.quizName;
        }

        return leaderboards.map((leaderboard: QuizLeaderboardInfo) => {
            const quizName: string | undefined = getQuizNameById(groupChat, leaderboard.quizId);
            if (!quizName) throw new Error("Leaderboards returned from API do not match quizzes in group chat"); // Should never happen
            return { quizName, leaderboard: leaderboard.leaderboard };
        })
    }

    const determineLeaderboardAnimationClassName = (index: number): string => {
        if (leaderboardAnimationStatus) {
            const {entering, exiting, isPrev} = leaderboardAnimationStatus;
            if (index === entering && !isPrev) return " animate-leaderboardEntering";
            if (index === entering && isPrev) return " animate-leaderboardEnteringPrev";
            if (index === exiting && !isPrev) return " animate-leaderboardExiting";
            if (index === exiting && isPrev) return " animate-leaderboardExitingPrev";
        }
        
        // If the leaderboard is not currently animating, determine where it should be offscreen
        if (index > selectedLeaderboardIndex) return " translate-x-[100%]";
        if (index < selectedLeaderboardIndex) return " translate-x-[-100%]";
        
        return "";
    }

    // =============== MAIN RENDER ===============

    return (
        <main className="flex min-h-screen flex-col items-center justify-between">
            <div className="relative w-[95%] lg:w-[90%] xl:w-[80%] 2xl:w-[70%] 3xl:w-[50%] mt-12 sm:mt-24">
                <div className="text-4xl text-center sm:text-left sm:text-5xl font-bold">
                    <span className="sm:mr-4">Welcome,</span>
                    <br className="sm:hidden" /> 
                    {!loading && activeUser ? activeUser.username : 
                    <div className="skeleton h-11 w-60 rounded-md inline-block mt-1 sm:mt-0 opacity-25" />}
                </div>
                <div className="mt-8 flex flex-col sm:flex-row items-center">
                    <div className="btn-group btn-group-scrollable">
                        <Link href="/group-chats" className="btn">
                            <button>Manage Group Chats</button>
                        </Link>
                        <button className="btn">Manage Quizzes</button>
                    </div>
                    <button className="btn btn-primary sm:ml-auto mt-3 sm:mt-0 w-[330px] sm:w-auto"
                    onClick={() => toggleModal("upload-modal")}>
                        Upload New Group Chat
                    </button>
                </div>
                {renderLatestGroupChat()}
                <div className="hidden lg:block">
                    <div className="divider divider-horizontal mt-10 mb-6 text-gray-9 font-light">Older Group Chats</div>
                    {renderOlderGroupChats()}
                </div>
            </div>
            {/* FIXED POSITION ELEMENTS */}
            {activeUser && <GroupChatUploadModal userId={activeUser.id} modalDomId="upload-modal" setReloadCounter={setReloadCounter} />}
            {groupChats.length > 0 && 
                <CreateQuizModal groupChatId={groupChats[0].id} groupChatName={groupChats[0].groupChatName} 
                modalDomId="create-quiz-modal" setReloadCounter={setReloadCounter} />
            }
        </main>
    )
}