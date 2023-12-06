"use client";

import useGetActiveUser from "@/app/hooks/api_access/user/useGetActiveUser";
import useGetGroupChatsInfo from "@/app/hooks/api_access/group_chats/useGetGroupChatsInfo";
import { User, GroupChatInfo } from "@/app/interfaces";
import { toggleModal } from "@/app/utilities/miscFunctions";
import GroupChatInfoRow from "@/app/components/GroupChatInfoRow";
import GroupChatUploadModal from "@/app/components/GroupChatUploadModal";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ManageGroupChats() {

    // ----------- Hooks ------------------
    const router = useRouter();
    const getActiveUser = useGetActiveUser();
    const getGroupChatsInfo = useGetGroupChatsInfo();

    // ----------- State (Data) -----------
    const [activeUser, setActiveUser] = useState<User | null>(null);
    const [groupChats, setGroupChats] = useState<GroupChatInfo[]>([]);

    // ----------- State (UI) -------------
    const [loading, setLoading] = useState<boolean>(true);

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

                // We will expand the first group chat by default.
                const firstGcCheckbox = document.getElementById(`toggle-${groupChatsInfo[0].id}`) as HTMLInputElement;
                if (firstGcCheckbox) {
                    firstGcCheckbox.checked = true;
                }

                setLoading(false);
            } else {
                console.error("Error retrieving group chats, redirecting to root");
                router.push("/");
            }
        }
        getPageData();
    }, [reloadCounter]);

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
                <div className="w-full mt-8 bg-zinc-950 py-24 px-5 rounded-xl border border-gray-7 text-center">
                    <div className="text-2xl font-light text-gray-10">You haven't uploaded any group chats yet</div>
                    <div className="flex mt-5">
                        <button className="btn btn-primary mx-auto">Upload New Group Chat</button>
                    </div>
                </div>
            );
        }

        const groupChatRows: JSX.Element[] = [];
        for (const groupChat in groupChats) {
            groupChatRows.push(
                <GroupChatInfoRow key={groupChats[groupChat].id} groupChat={groupChats[groupChat]} />
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

    return (
        <main className="flex min-h-screen flex-col items-center justify-between">
            <div className="w-[97%] lg:w-[80%] xl:w-[70%] 2xl:w-[60%] 3xl:w-[40%] mt-8 sm:mt-24">
                {!loading && <>
                    <div className="text-2xl sm:text-3xl text-center font-bold mb-3">
                        Uploaded Group Chats
                    </div>
                    <div className="flex w-full mb-8">
                        <button className="w-56 btn btn-primary btn-md mx-auto" onClick={() => toggleModal("upload-modal")}>
                            Upload New
                        </button>
                    </div>
                </>}
                <div className="max-w-[1000px]">
                    {renderGroupChats()}
                </div>
                {!loading && 
                    <div className="flex w-full mt-8 mb-4">
                        <div className="flex flex-wrap justify-center gap-1 max-w-[300px] mx-auto text-center text-gray-9 font-light text-xs">
                            <div>Chats: <span className="font-base text-gray-11">{groupChats.length}</span></div>
                            <div className="ml-2">Messages: <span className="font-base text-gray-11">{totalMessages}</span></div>
                            <div className="ml-2">Participants: <span className="font-base text-gray-11">{totalParticipants}</span></div>
                            <div className="ml-2">Quizzes: <span className="font-base text-gray-11">{totalQuizzes}</span></div>
                        </div>
                    </div>
                }
            </div>
            {/* FIXED POSITION ELEMENTS */}
            {activeUser && <GroupChatUploadModal userId={activeUser.id} modalDomId="upload-modal" setReloadCounter={setReloadCounter} />}
        </main>
    )
}