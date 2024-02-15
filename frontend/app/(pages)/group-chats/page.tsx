"use client";

import useGetActiveUser from "@/app/hooks/api_access/user/useGetActiveUser";
import useGetGroupChatsInfo from "@/app/hooks/api_access/group_chats/useGetGroupChatsInfo";
import useNavBar from "@/app/hooks/context_imports/useNavBar";
import { User, GroupChatInfo } from "@/app/interfaces";
import GroupChatInfoRow from "@/app/components/data-rows/GroupChatInfoRow";
import WrenchIcon from "@/app/components/icons/WrenchIcon";
import GroupChatIcon from "@/app/components/icons/nav-bar/GroupChatIcon";
import UploadIcon from "@/app/components/icons/nav-bar/UploadIcon";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ManageGroupChats() {

    // ----------- Hooks ------------------
    const router = useRouter();
    const getActiveUser = useGetActiveUser();
    const getGroupChatsInfo = useGetGroupChatsInfo();
    const { setNavBarState, setNavBarExpanded, refetchDataCounter, setRefetchDataCounter } = useNavBar();

    // ----------- State (Data) -----------
    const [activeUser, setActiveUser] = useState<User | null>(null);
    const [groupChats, setGroupChats] = useState<GroupChatInfo[]>([]);

    // ----------- State (UI) -------------
    const [loading, setLoading] = useState<boolean>(true);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    // ----------- Data Retrieval ---------
    useEffect(() => {
        const getPageData = async () => {
            const activeUser: User | null = await getActiveUser();
            const groupChatsInfo: Array<GroupChatInfo> | null = await getGroupChatsInfo();
            if (activeUser && groupChatsInfo) {
                setActiveUser(activeUser);
                setGroupChats(groupChatsInfo);

                // We will expand the first group chat by default (Disabled for a less jarring UX)
                // const firstGcCheckbox = document.getElementById(`toggle-${groupChatsInfo[0].id}`) as HTMLInputElement;
                // if (firstGcCheckbox) {
                //     firstGcCheckbox.checked = true;
                // }

                setLoading(false);
            } else {
                console.error("Error retrieving group chats, redirecting to root");
                router.push("/");
            }
        }
        getPageData();
    }, [refetchDataCounter]);

    // =============== RENDER FUNCTIONS ===============

    const renderGroupChats = () => {
        if (loading) {
            return (
                <div className="spinner-dot-pulse spinner-lg absolute top-[50%] left-[50%] translate-y-[-50%] translate-x-[-50%]">
                    <div className="spinner-pulse-dot"></div>
                </div>
            );
        }

        if (groupChats.length === 0) {
            return (
                <div className="w-full mt-10 py-20 px-5 rounded-xl border border-zinc-800 border-dashed text-center">
                    <div className="text-lg font-light text-gray-10">You haven't uploaded any group chats yet</div>
                </div>
            );
        }

        const groupChatRows: JSX.Element[] = [];
        for (const groupChat in groupChats) {
            groupChatRows.push(
                <GroupChatInfoRow key={groupChats[groupChat].id} groupChat={groupChats[groupChat]} 
                setReloadCounter={setRefetchDataCounter} isDeleting={isDeleting} setIsDeleting={setIsDeleting}/>
            );
        }

        return (
            <div className="accordion-group accordion-group-bordered">
                {groupChatRows}
            </div>
        );
    }

    // =============== MAIN RENDER ===============

    const totalMessages = groupChats.reduce((acc, curr) => acc + curr.numMessages, 0);
    const totalParticipants = groupChats.reduce((acc, curr) => acc + curr.numParticipants, 0);
    const totalQuizzes = groupChats.reduce((acc, curr) => acc + curr.quizzes.length, 0);

    return (<>
        <div className="w-full h-navbar" /> {/* Navbar spacer */}
        <main className="flex max-h-content overflow-y-scroll flex-col items-center justify-between">
            <div className="w-[97%] lg:w-[80%] xl:w-[70%] 2xl:w-[60%] 3xl:w-[40%] mt-7 sm:mt-20 mb-[75px]">
                {!loading && 
                    <div className="flex flex-row w-full px-[2px] md:px-1 mb-4 md:mb-4 justify-center items-center">
                        <div className="flex ml-2 items-center text-zinc-100">
                            <GroupChatIcon className="w-6 h-6 md:w-9 md:h-9 mr-2 md:mr-3" />
                            <span className="hidden md:inline-block text-3xl">Your Group Chats</span>
                            <span className="md:hidden text-2xl font-medium">Group Chats</span>
                        </div>
                        <div className="flex ml-auto gap-2">
                            <div className={`flex justify-center items-center px-2 h-[40px] rounded-xl bg-black border cursor-pointer group
                            transition-colors duration-100 ease-in-out 
                            ${isDeleting ? " border-zinc-400 border-2 relative left-[1px]" : " border-zinc-800 md:hover:border-zinc-700"}`}
                            onClick={() => setIsDeleting(!isDeleting)}>
                                <WrenchIcon className={`w-6 h-6 transition-colors duration-100 ease-in-out
                                ${isDeleting ? " text-zinc-300" : " text-zinc-700 md:group-hover:text-zinc-600"}`} />
                            </div>
                            <button className="mr-auto md:ml-0 px-[9px] md:w-[170px] btn btn-md text-[16px] whitespace-nowrap
                            bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" 
                            onClick={() => {
                                setNavBarState("UPLOAD");
                                setTimeout(() => {
                                    setNavBarExpanded(true);
                                }, 150);
                            }}>
                                <UploadIcon className="w-6 h-6 md:mr-[6px]" /><span className="hidden md:inline-block">Upload New</span>
                            </button>
                        </div>
                    </div>
                }
                {renderGroupChats()}
            </div>
            {!loading && 
                <div className="fixed bottom-0 left-0 right-0 flex py-[10px] bg-zinc-950 border-t border-zinc-800 z-20 backdrop-blur-md
                shadow-[0_-5px_15px_1px_rgba(0,0,0,0.5)]">
                    <div className="flex flex-wrap justify-center gap-1 max-w-[300px] mx-auto text-center text-zinc-400 font-light text-xs">
                        <div>Chats: <span className="font-base text-zinc-200">{groupChats.length}</span></div>
                        <div className="ml-2">Messages: <span className="font-base text-zinc-200">{totalMessages}</span></div>
                        <div className="ml-2">Participants: <span className="font-base text-zinc-200">{totalParticipants}</span></div>
                        <div className="ml-2">Quizzes: <span className="font-base text-zinc-200">{totalQuizzes}</span></div>
                    </div>
                </div>
            }
        </main>
    </>)
}