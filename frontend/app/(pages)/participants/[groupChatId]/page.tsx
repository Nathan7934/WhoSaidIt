"use client";

import useGetGroupChat from "@/app/hooks/api_access/group_chats/useGetGroupChat";
import useGetParticipants from "@/app/hooks/api_access/participants/useGetParticipants";

import { GroupChat, Participant } from "@/app/interfaces";
import EditIcon from "@/app/components/icons/EditIcon";
import MessagesIcon from "@/app/components/icons/MessagesIcon";
import DeleteIcon from "@/app/components/icons/DeleteIcon";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Messages from "../../messages/[...query]/page";

export default function Participants({ params }: { params: { groupChatId: string }}) {
    
    // NextJS Route parameters
    const groupChatId = Number(params.groupChatId);

    // ----------- Hooks ------------------
    const router = useRouter();

    // API access hooks
    const getGroupChat = useGetGroupChat();
    const getParticipants = useGetParticipants();

    // ----------- State (Data) -----------
    const [groupChatName, setGroupChatName] = useState<string>("");
    const [participants, setParticipants] = useState<Array<Participant>>([]);

    // ----------- State (UI) -------------
    const [loading, setLoading] = useState<boolean>(false);
    const [listMaxHeight, setListMaxHeight] = useState<string>('auto');

    // UI DOM references
    const titleRef = useRef<HTMLDivElement>(null);
    const blurbRef = useRef<HTMLDivElement>(null);

    // ----------- Data Retrieval ---------
    useEffect(() => {
        const getPageData = async () => {
            setLoading(true);
            const groupChat: GroupChat | null = await getGroupChat(groupChatId);
            const participants: Array<Participant> | null = await getParticipants(groupChatId);
            if (groupChat && participants) {
                setGroupChatName(groupChat.groupChatName);
                setParticipants(participants);
                setLoading(false);
            } else {
                console.error("Error retrieving data, redirecting to root");
                router.push("/");
            }
        }
        getPageData();
    }, []);

    // ----------- UI effects ---------
    // We dont want the content to overflow the height of the screen.
    // When overflow would occur, we want the list element to scroll instead of the window.
    useEffect(() => {
        calculateStaticElementHeight();
        window.addEventListener("resize", calculateStaticElementHeight);
        return () => {
            window.removeEventListener("resize", calculateStaticElementHeight);
        }
    }, []);

    // =============== RENDER FUNCTIONS =================

    const renderParticipantRows = () => {
        return participants.map((participant: Participant, index: number) => {
            return (
                // <div key={index} className={`flex items-center justify-between w-full py-3 px-1 border-gray-6 
                // ${index < participants.length - 1 ? " border-b" : ""}`}>
                <div key={index} className="flex items-center justify-between w-full bg-black py-4 px-3 border border-gray-6 rounded-md my-[6px] drop-shadow-md">
                    <div className="flex items-center">
                        <EditIcon className="relative bottom-[1px] w-6 h-6 mr-3 text-gray-7 transition 
                        duration-400 ease-in-out sm:hover:text-gray-11 hover:cursor-pointer" />
                        <div className="sm:text-lg font-light sm:font-normal overflow-x-hidden text-ellipsis whitespace-nowrap">
                            {participant.name}
                        </div>
                    </div>
                    <div className="flex items-center">
                        <MessagesIcon className="ml-1 w-6 h-6 text-gray-7 sm:hover:text-gray-11 hover:cursor-pointer" />
                        <div className="ml-1 w-7 text-sm text-gray-7 font-light">
                            ({participant.numberOfMessages})
                        </div>
                        
                        {/* <button className="hidden lg:inline-block mr-1 ml-2 px-2 py-[6px] bg-gray-2 rounded-lg text-sm text-gray-11
                        transition duration-400 ease-in-out hover:bg-gray-4">
                            Messages
                        </button> */}
                        <DeleteIcon className="ml-2 w-5 h-5 text-gray-2 sm:hover:text-red-5 hover:cursor-pointer" />
                    </div>
                </div>
            );
        });
    }

    // =============== HELPER FUNCTIONS ===============

    const calculateStaticElementHeight = () => {
        console.log("Window resized")
        const titleHeight = titleRef.current?.clientHeight || 0;
        const blurbHeight = blurbRef.current?.clientHeight || 0;
        const remainingStaticHeight = 182 + 24; // 182px for the content, 24px for margins
        const maxHeight = window.innerHeight - titleHeight - blurbHeight - remainingStaticHeight
        setListMaxHeight(`${Math.min(600, maxHeight)}px`);
    }

    // =============== MAIN RENDER =================

    return (
        <main className="flex flex-col items-center justify-between min-h-screen">
            <div className="absolute top-[50%] translate-y-[-50%] w-[97%] lg:w-[80%] xl:w-[70%] 2xl:w-[60%] 3xl:w-[40%]">
                {/* DIV THAT SHOULD NOT EXCEED THE HEIGHT OF THE PAGE */}
                <div className="flex flex-col w-full p-2 sm:p-8 bg-zinc-950 rounded-xl border border-gray-7 overflow-hidden">
                    <div className="text-3xl mb-6 sm:mb-5 mt-4 sm:mt-0 mx-auto sm:mx-0 text-center sm:text-left">
                        <span className="hidden sm:inline-block">Participants for<br/></span> {loading ? "..." : `"${groupChatName}"`}
                    </div>
                    <div className="hidden sm:block text-gray-9 mb-6 px-1 max-w-[650px]">
                        Here you may see the participants of a group chat, edit their names, or delete them and all their messages
                        from the group chat.
                    </div>
                    <div className="w-full py-2 bg-gray-2 text-lg rounded-t-md border border-gray-6 text-center">
                        Manage Participants
                    </div>
                    {/* DIV THAT SHOULD SCROLL */}
                    <div className="px-1 overflow-y-scroll"
                    style={{maxHeight: listMaxHeight}}>
                        {renderParticipantRows()}
                    </div>
                    <div className="mb-3 w-full py-[6px] bg-gray-2 rounded-b-md border border-gray-6 text-center text-sm font-light" >
                        Total: {loading ? "..." : participants.length}
                    </div>
                </div>
            </div>
        </main>
    );
}