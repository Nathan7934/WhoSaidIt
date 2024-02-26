"use client";

import useGetActiveUser from "@/app/hooks/api_access/user/useGetActiveUser";
import useGetGroupChatsInfo from "@/app/hooks/api_access/group_chats/useGetGroupChatsInfo";
import useGetGroupChatLeaderboards from "@/app/hooks/api_access/leaderboards/useGetGroupChatLeaderboards";
import useNavBar from "@/app/hooks/context_imports/useNavBar";
import useAdjustContentHeight from "@/app/hooks/useAdjustContentHeight";
import { User, GroupChatInfo, SurvivalEntry, TimeAttackEntry, QuizLeaderboardInfo } from "@/app/interfaces";
import { renderQuizRows, toggleModal, isTimeAttackEntry, isSurvivalEntry } from "@/app/utilities/miscFunctions";
import GroupChatInfoRow from "@/app/components/data-rows/GroupChatInfoRow";
import CreateQuizModal from "@/app/components/modals/CreateQuizModal";
import NewUserTutorial from "@/app/components/tutorial/NewUserTutorial";

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
    const { refetchDataCounter, setRefetchDataCounter } = useNavBar();

    // API access hooks
    const getActiveUser = useGetActiveUser();
    const getGroupChatsInfo = useGetGroupChatsInfo();
    const getGroupChatLeaderboards = useGetGroupChatLeaderboards();

    // ----------- State (Data) -----------
    const [activeUser, setActiveUser] = useState<User | null>(null);
    const [groupChats, setGroupChats] = useState<Array<GroupChatInfo>>([]);
    const [focusedGroupChat, setFocusedGroupChat] = useState<GroupChatInfo | null>(null);
    const [previewLeaderboards, setPreviewLeaderboards] = useState<Array<NamedQuizLeaderboardInfo>>([]);

    // ----------- State (UI) -------------
    const [loading, setLoading] = useState<boolean>(true);
    const [lNavLeftAnim, setLNavLeftAnim] = useState<boolean>(false);
    const [lNavRightAnim, setLNavRightAnim] = useState<boolean>(false);
    const [selectedLeaderboardIndex, setSelectedLeaderboardIndex] = useState<number>(0); // [0, previewLeaderboards.length)
    const [leaderboardAnimationStatus, setLeaderboardAnimationStatus] = useState<LeaderboardAnimationStatus | null>(null);

    // Adjust the height of the page content area
    useAdjustContentHeight(".navbar", ".page-content", [loading]);

    // ----------- Data Retrieval ---------
    useEffect(() => {
        const getPageData = async () => {
            const activeUser: User | null = await getActiveUser();
            const groupChatsInfo: Array<GroupChatInfo> | null = await getGroupChatsInfo();

            if (activeUser && groupChatsInfo) {
                setActiveUser(activeUser);
                setGroupChats(groupChatsInfo);

                if (groupChatsInfo.length > 0) {
                    // Set the focused group chat to the one matching the user's focusedGroupChatId
                    const focusedGC: GroupChatInfo | undefined = groupChatsInfo.find(gc => gc.id === activeUser.focusedGroupChatId);
                    setFocusedGroupChat(focusedGC || groupChatsInfo[0]);

                    const leaderboards: Array<QuizLeaderboardInfo> | null = await getGroupChatLeaderboards(focusedGC?.id || groupChatsInfo[0].id);
                    if (leaderboards) {
                        setPreviewLeaderboards(convertToNamedQuizLeaderboardInfo(focusedGC || groupChatsInfo[0], leaderboards));
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
    }, [refetchDataCounter]);

    // =============== RENDER FUNCTIONS ===============

    const renderFocusedGroupChat = () => {
        if (!focusedGroupChat) return; // Should never happen

        return (
            <div className="w-full grid grid-cols-1 lg:grid-cols-3 mb-3 lg:mb-0 mt-5 bg-[#050507] py-7 px-5 rounded-xl border border-zinc-800">
                <div className="flex flex-col col-span-2 relative">
                    <div className="text-center sm:text-left text-3xl font-semibold ml-1">
                        {focusedGroupChat.groupChatName}
                    </div>
                    <div className="mt-2 hidden sm:block relative right-1">
                        <div className="badge badge-outline border-zinc-700 mx-1 mt-1 block sm:inline-block">
                            <span className="font-normal mr-2">Uploaded:</span> {formatDate(focusedGroupChat.uploadDate)}
                        </div>
                        <div className="flex justify-center sm:inline-block">
                            <div className="badge badge-outline border-zinc-700 mx-1 mt-2 sm:mt-1 grow flex justify-center sm:inline-block">
                                <span className="font-normal mr-2">Participants:</span> {focusedGroupChat.numParticipants}
                            </div>
                            <div className="badge badge-outline border-zinc-700 mx-1 mt-2 sm:mt-1 grow flex justify-center sm:inline-block">
                                <span className="font-normal mr-2">Messages:</span> {focusedGroupChat.numMessages}
                            </div>
                        </div>
                    </div>
                    <div className={`w-full sm:pb-6 mb-6 sm:mb-0
                    ${focusedGroupChat.quizzes.length < 3 ? "sm:pb-12" : "sm:pb-0"}`}>
                        <div className="hidden lg:block ml-1 mt-5 sm:mt-8 text-lg text-zinc-300 font-light">
                            Quizzes for this chat:
                        </div>
                        <div className="lg:hidden divider divider-horizontal mb-0 mt-5 sm:mt-8 text-zinc-300 font-light">
                            Quizzes for this chat:
                        </div>
                    </div>
                    <div className="mb-6 md:pr-6 md:pl-1 max-h-[320px] overflow-y-scroll">
                        {renderQuizRows(focusedGroupChat, setRefetchDataCounter)}
                    </div>
                    <div className="sm:flex sm:flex-grow sm:items-end justify-center lg:justify-start">
                        <button className="btn mr-2 w-full sm:w-auto bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600
                        text-lg sm:text-base font-medium"
                        onClick={() => toggleModal("create-quiz-modal")}>
                            Create New Quiz
                        </button>
                        <div className="flex items-end">
                            <Link href={`/messages/${focusedGroupChat.id}`} className="grow sm:flex-none mr-2">
                                <div className="p-[1px] mt-2 sm:mt-0 rounded-[9px] sm:rounded-[13px] bg-gradient-to-r from-blue-500 to-indigo-500
                                md:from-blue-500 md:via-indigo-500 md:to-purple-500">
                                    <button className="w-full bg-black py-[6px] sm:py-[7px] px-3 rounded-lg sm:rounded-xl whitespace-nowrap">
                                        View Messages
                                    </button>
                                </div>
                            </Link>
                            <Link href={`/participants/${focusedGroupChat.id}`} className="grow">
                                <div className="p-[1px] mt-2 sm:mt-0 rounded-[9px] sm:rounded-[13px] bg-gradient-to-r from-indigo-500 to-purple-400 mr-[2px]
                                md:from-blue-500 md:via-indigo-500 md:to-purple-500">
                                    <button className="w-full bg-black py-[6px] px-6 sm:px-3 sm:py-[7px] rounded-lg sm:rounded-xl">
                                        <span className="hidden sm:inline-block">Manage</span> Participants
                                    </button>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="mt-10 lg:mt-0 md:max-lg:w-[75%] md:max-lg:flex-col md:max-lg:mx-auto">
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
            <div className="w-full pb-[1px] rounded-lg bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500">
                <div className="flex mt-[2px] mx-[1px] rounded-t-lg shadow-sm bg-zinc-950 relative top-[1px]">
                    <button onClick={lNavLeftButtonClicked} className="grow pt-1 sm:hover:bg-zinc-900 active:bg-zinc-900 
                    active:duration-75 duration-200 active:ease-out ease-in rounded-tl-lg">
                        <span onAnimationEnd={() => {setLNavLeftAnim(false)}}
                        className={"inline-block duration-200 ease-in" + (lNavLeftAnim && " animate-leaderboardNavArrowLeft")}>
                            <Image className="rotate-180 mx-auto" src="nav-arrow.svg" alt="Prev" width={16} height={16} />
                        </span>
                    </button>
                    <button onClick={lNavRightButtonClicked} className="grow pt-1 border-l border-indigo-500
                    sm:hover:bg-zinc-900 active:bg-zinc-900 active:duration-75 duration-200 active:ease-out ease-in rounded-tr-lg">
                        <span onAnimationEnd={() => {setLNavRightAnim(false)}} 
                        className={"inline-block duration-200 ease-in" + (lNavRightAnim && " animate-leaderboardNavArrowRight")}>
                            <Image className="mx-auto" src="nav-arrow.svg" alt="Next" width={16} height={16} />
                        </span>
                    </button>
                </div>
                <div className="flex">
                    <div className="relative top-[1px] grow m-[1px] min-h-[416px] h-max rounded-b-lg shadow-md bg-black overflow-hidden">
                        {renderLeaderboards()}
                    </div>
                </div>
            </div>
        </>);
    }

    const renderLeaderboards = () => {
        if (previewLeaderboards.length === 0) {
            return (
                <div className="absolute top-[50%] translate-y-[-50%] left-[50%] translate-x-[-50%] w-[90%] text-center text-lg text-zinc-600 font-light
                py-24 px-6 border border-dashed border-zinc-800 rounded-xl">
                    Leaderboard previews will appear here once a quiz is created
                </div>
            );
        }
        
        let leaderboardElements: Array<JSX.Element> = [];
        previewLeaderboards.forEach((leaderboardInfo, index) => {
            leaderboardElements.push(
                <div key={index} className={"absolute inset-0 w-full" + determineLeaderboardAnimationClassName(index)}>
                    <div className={`w-full text-xl text-center mt-5 mb-3 font-medium px-4`}>
                        {leaderboardInfo.quizName}
                    </div>
                    {renderLeaderboardEntries(leaderboardInfo.leaderboard)}
                </div>
            );
        });
        return leaderboardElements;
    }

    const renderLeaderboardEntries = (leaderboard: Array<TimeAttackEntry | SurvivalEntry>) => {
        let leaderboardEntries: Array<JSX.Element> = [];
        if (leaderboard.length === 0) {
            leaderboardEntries.push(
                <div key={1} className="flex flex-col items-center mt-8 text-lg font-light text-zinc-700">
                    <div className="border border-dashed border-zinc-800 rounded-xl px-16 py-4">
                        No entries yet
                    </div>
                </div>
            );
        }
        
        leaderboard.forEach((entry, index) => {
            const rank: number = index + 1;
            leaderboardEntries.push(
                <div key={index} className="flex justify-between px-4 md:max-lg:px-10 py-1">
                    <div className="flex items-center">
                        <div className="text-lg text-zinc-600 font-light mr-4 w-5 text-right">
                            {rank}.
                        </div>
                        <div className="text-lg text-zinc-50 font-light">{entry.playerName}</div>
                    </div>
                    <div className="text-lg text-zinc-300">
                        {isTimeAttackEntry(entry) ? entry.score : isSurvivalEntry(entry) ? entry.streak : ""}
                    </div>
                </div>
            );
        });
        return (<>
            <div className="flex justify-between px-4 md:max-lg:px-10 py-1 border-b border-zinc-900 mb-2">
                <div className="flex items-center">
                    <div className="text-zinc-500 mr-4 pr-1 w-5 text-right">
                        #
                    </div>
                    <div className="text-zinc-400 font-light">Player</div>
                </div>
                <div className="font-light text-zinc-400">
                    {leaderboard.length === 0 || isTimeAttackEntry(leaderboard[0]) ? "Score" : "Streak"}
                </div>
            </div>
            <div className="max-h-[310px] overflow-y-scroll">
                {leaderboardEntries}
            </div>
        </>);
    }

    const renderOlderGroupChats = () => {
        if (loading) return (<div className="skeleton h-48 w-full mt-8 py-7 px-5 rounded-xl border border-gray-7 opacity-25" />);

        if (groupChats.length < 2) return (<div className="text-center text-gray-7 font-light text-sm">Nothing here</div>);

        let groupChatRows: Array<JSX.Element> = [];
        groupChats.forEach((groupChat, index) => {
            if (groupChat.id === activeUser?.focusedGroupChatId) return;
            groupChatRows.push(<GroupChatInfoRow key={1000 - index} groupChat={groupChat} setReloadCounter={setRefetchDataCounter} />);
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

    if (loading || !activeUser) {
        return (
            <main className="flex min-h-screen flex-col items-center justify-between p-24">
                <div className="absolute mx-auto flex w-full max-w-sm flex-col gap-6 top-[50%] translate-y-[-50%] items-center">
                    <div className="text-xl">Fetching data</div>
                    <div className="spinner-dot-pulse spinner-lg">
                        <div className="spinner-pulse-dot"></div>
                    </div>
                </div>
            </main>
        ); // Dashboard loading
    }

    // If the user has no group chats, show the new user tutorial
    if (groupChats.length === 0) {
        return (<>
            <div className="navbar h-navbar w-full" /> {/* Navbar spacer */}
            <main className="page-content flex flex-col items-center justify-center overflow-y-scroll py-2">
                <NewUserTutorial userName={activeUser.username} />
            </main>
        </>);
    }

    return (<>
        <div className="navbar h-navbar w-full" /> {/* Navbar spacer */}
        <main className="page-content flex flex-col overflow-y-scroll items-center justify-between">
            <div className={`relative w-[95%] lg:w-[90%] xl:w-[80%] 2xl:w-[70%] 3xl:w-[50%]`}>
                {renderFocusedGroupChat()}
                <div className="hidden lg:block">
                    <div className="divider divider-horizontal mt-10 mb-6 text-gray-9 font-light">Other Group Chats</div>
                    {renderOlderGroupChats()}
                </div>
            </div>
            {/* FIXED POSITION ELEMENTS */}
            {focusedGroupChat && 
                <CreateQuizModal groupChatId={focusedGroupChat.id} groupChatName={focusedGroupChat.groupChatName} 
                modalDomId="create-quiz-modal" setReloadCounter={setRefetchDataCounter} />
            }
        </main>
    </>)
}