import useGetActiveUser from "@/app/hooks/api_access/user/useGetActiveUser";
import useGetGroupChats from "@/app/hooks/api_access/group_chats/useGetGroupChats";
import usePatchFocusedGroupChat from "@/app/hooks/api_access/user/usePatchFocusedGroupChat";
import useNavBar from "@/app/hooks/context_imports/useNavBar";
import { User, GroupChat, ResponseStatus } from "@/app/interfaces";
import { renderResponseAlert } from "@/app/utilities/miscFunctions";

import { useEffect, useState } from "react";

export default function DashboardFocusSubmenu() {

    // ----------- Hooks ------------------
    const getActiveUser = useGetActiveUser();
    const getGroupChats = useGetGroupChats();
    const patchFocusedGroupChat = usePatchFocusedGroupChat();
    const { refetchDataCounter, setRefetchDataCounter } = useNavBar();

    // ----------- State (Data) -----------
    const [user, setUser] = useState<User | null>(null);
    const [groupChats, setGroupChats] = useState<Array<GroupChat> | null>(null);

    // ----------- State (UI) -------------
    const [selectedGroupChatId, setSelectedGroupChatId] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [changingFocus, setChangingFocus] = useState<boolean>(false);
    const [responseStatus, setResponseStatus] = useState<ResponseStatus>({ message: "", success: false, doAnimate: false });

    // ----------- Data Retrieval -----------
    useEffect(() => {
        const getComponentData = async () => {
            let groupChats: Array<GroupChat> | null = null;
            const user: User | null = await getActiveUser();
            if (user) {
                setUser(user);
                groupChats = await getGroupChats();
                if (groupChats) {
                    setGroupChats(groupChats);
                    setSelectedGroupChatId(user.focusedGroupChatId);
                }
            }
            if (!user || !groupChats) {
                console.error("Error retrieving component data.");
            }
            setLoading(false);
        }
        getComponentData();
    }, [refetchDataCounter]);

    // ----------- Data Helpers -----------

    const handleFocusChange = async (groupChatId: number) => {
        if (!user || !groupChats) return;

        setChangingFocus(true);
        setSelectedGroupChatId(groupChatId);
        const error: string | null = await patchFocusedGroupChat(groupChatId);
        if (error) {
            setResponseStatus({ message: error, success: false, doAnimate: true });
            setTimeout(() => {
                setResponseStatus({ message: "", success: false, doAnimate: true });
            }, 3000);
        } else {
            setRefetchDataCounter(c => c + 1);
        }
        setChangingFocus(false);
    }

    // =============== RENDER FUNCTIONS ===============

    // Response alerts only appear when a failed response is received
    const renderFocusChangeResponseAlert = () => {
        const positioning: string = "fixed bottom-6 left-[50%] translate-x-[-50%]";
        return renderResponseAlert(responseStatus, positioning);
    }

    const renderGroupChatOptions = () => {
        if (loading || !groupChats || !user) { // Loading skeletons
            return (<>
                <div className="skeleton h-12 rounded-2xl w-full opacity-75" />
                <div className="skeleton h-12 rounded-2xl w-full opacity-75" />
                <div className="skeleton h-12 rounded-2xl w-full opacity-75" />
            </>);
        }
        if (groupChats.length === 0) {
            return (
                <div className="w-full py-16 text-center text-xl border-2 border-gray-6 border-dashed text-gray-9 rounded-2xl">
                    No group chats found<br/>
                    <span className="text-sm">Upload a chat to get started!</span>
                </div>
            );
        }

        return groupChats.map((groupChat: GroupChat, index: number) => {
            const isChecked: boolean = user.focusedGroupChatId === groupChat.id;
            return (
                <div key={groupChat.id} onClick={() => handleFocusChange(groupChat.id)}
                className={`flex items-center w-full py-4 px-4 bg-zinc-950 rounded-xl border transition-colors duration-300 hover:cursor-pointer
                ${isChecked ? " border-[rgb(0,114,245)]" : " border-gray-3"}`}>
                    <div className="grow text-lg font-semibold whitespace-nowrap text-ellipsis overflow-hidden">
                        {groupChat.groupChatName}
                    </div>
                    <div className="flex items-center ml-2">
                        <div className={`spinner-circle spinner-xs ${(changingFocus && selectedGroupChatId === groupChat.id ? "" : " hidden")}`} />
                        <input type="checkbox" className="switch ml-2" checked={isChecked} readOnly/>
                    </div>
                </div>
            );
        })
    }

    // =============== MAIN RENDER ===============

    return (<>
        <div className="flex flex-col px-5 max-h-content overflow-y-scroll">
            <div className="w-full mt-8 text-3xl font-semibold text-center">
                Dashboard Focus
            </div>
            <div className="mt-6 text-sm text-center text-gray-12">
                Select a chat to appear on your dashboard:
            </div>
            <div className="flex flex-col gap-2 items-center w-full mt-3">
                {renderGroupChatOptions()}
            </div>
        </div>
        {responseStatus.doAnimate && renderFocusChangeResponseAlert()}
    </>);
}