"use client";

import useRequestMessages from "@/app/hooks/api_access/messages/useRequestMessages";
import useRequestGroupChat from "@/app/hooks/api_access/group_chats/useRequestGroupChat";
import { GroupChat, Message, MessagePage, PaginationConfig } from "@/app/interfaces";
import { useRouter } from "next/navigation";

import { useState, useEffect } from "react";

interface PageInfo {
    totalPages: number;
    totalMessages: number;
    hasNext: boolean;
    hasPrevious: boolean;
}

export default function Messages({ params }: { params: { query: string[] }}) {

    // Extracting the NextJS route query parameters
    const groupChatId = Number(params.query[0]);
    const quizId = params.query.length > 1 ? Number(params.query[1]) : null;

    // ----------- Hooks ------------------
    const router = useRouter();
    const requestGroupChat = useRequestGroupChat();
    const requestMessages = useRequestMessages();

    // ----------- State (Data) -----------
    const [groupChatName, setGroupChatName] = useState<string>("");
    const [messages, setMessages] = useState<Array<Message>>([]);
    const [paginationConfig, setPaginationConfig] = useState<PaginationConfig>({
        pageNumber: 0,
        pageSize: 20,
        ascending: false
    });
    const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);

    // ----------- State (UI) -------------
    const [loading, setLoading] = useState<boolean>(true);

    // ----------- Data Retrieval ---------
    useEffect(() => {
        const getPageData = async () => {
            setLoading(true);
            const groupChat: GroupChat | null = await requestGroupChat(groupChatId);
            const messagePage: MessagePage | null = await requestMessages(groupChatId, paginationConfig);

            if (groupChat && messagePage) {
                setGroupChatName(groupChat.groupChatName);
                setMessages(messagePage.messages);
                setPageInfo({
                    totalPages: messagePage.totalPages,
                    totalMessages: messagePage.totalMessages,
                    hasNext: messagePage.hasNext,
                    hasPrevious: messagePage.hasPrevious
                });
                setLoading(false);
            } else {
                console.error("Error fetching message data, redirecting to root");
                router.push("/");
            }
        }
        getPageData();
    }, [paginationConfig]);

    // =============== RENDER FUNCTIONS =================

    const renderMessageRows = () => {
        return messages.map((message: Message) => {
            return (
                <tr key={message.id}>
                    <td>
                        <input type="checkbox" className="checkbox"/>
                    </td>
                    <td>{message.sender.name}</td>
                    <td className="whitespace-nowrap overflow-x-hidden text-ellipsis">{message.content}</td>
                    <td>{message.timestamp.toDateString()}</td>
                </tr>
            );
        });
    }

    const renderPaginationControls = () => {
        if (!pageInfo) return null;
        const pageNumber = paginationConfig.pageNumber + 1; // API is 0-indexed, while UI is 1-indexed
        const { totalPages } = pageInfo;
    
        const coreButtons = 5; // Total core page buttons
    
        // Determine visibility of ellipses and adjust page ranges
        const nearStart = pageNumber <= 3;
        const nearEnd = pageNumber >= totalPages - 2;
        let startPage, endPage;
        if (nearStart) {
            startPage = 2;
            endPage = Math.min(coreButtons, totalPages - 1);
        } else if (nearEnd) {
            startPage = Math.max(totalPages - coreButtons + 1, 2);
            endPage = totalPages - 1;
        } else {
            startPage = pageNumber - 1;
            endPage = pageNumber + 1;
        }
    
        // Generate core page buttons
        const corePageButtons = [];
        for (let i = startPage; i <= endPage; i++) {
            corePageButtons.push(
                <button key={i} className={`btn ${i === pageNumber ? "btn-active" : ""}`}
                onClick={() => handlePageChange(i)}>
                    {i}
                </button>
            );
        }
    
        return (
            <div className="flex mt-4">
                <div className="pagination pagination-compact mx-auto">
                    <button className="btn" onClick={() => handlePageChange(pageNumber - 1)}>
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M12.2574 5.59165C11.9324 5.26665 11.4074 5.26665 11.0824 5.59165L7.25742 9.41665C6.93242 9.74165 6.93242 10.2667 7.25742 10.5917L11.0824 14.4167C11.4074 14.7417 11.9324 14.7417 12.2574 14.4167C12.5824 14.0917 12.5824 13.5667 12.2574 13.2417L9.02409 9.99998L12.2574 6.76665C12.5824 6.44165 12.5741 5.90832 12.2574 5.59165Z" fill="#969696" />
                        </svg>
                    </button>
                    <button className={`btn ${pageNumber === 1 ? "btn-active" : ""}`} 
                    onClick={() => handlePageChange(1)}>
                        1
                    </button>
                    {!nearStart && <button disabled className="btn">...</button>}
                    {corePageButtons}
                    {!nearEnd && <button disabled className="btn">...</button>}
                    <button className={`btn ${pageNumber === totalPages ? "btn-active" : ""}`} 
                    onClick={() => handlePageChange(totalPages)}>
                        {totalPages}
                    </button>
                    <button className="btn" onClick={() => handlePageChange(pageNumber + 1)}>
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M7.74375 5.2448C7.41875 5.5698 7.41875 6.0948 7.74375 6.4198L10.9771 9.65314L7.74375 12.8865C7.41875 13.2115 7.41875 13.7365 7.74375 14.0615C8.06875 14.3865 8.59375 14.3865 8.91875 14.0615L12.7437 10.2365C13.0687 9.91147 13.0687 9.38647 12.7437 9.06147L8.91875 5.23647C8.60208 4.9198 8.06875 4.9198 7.74375 5.2448Z" fill="#969696" />
                        </svg>
                    </button>
                </div>
            </div>
        );
    };
    
    // ---------- Event Handlers ----------

    const handlePageChange = (pageNumber: number) => {
        if (!pageInfo) return;
        const { totalPages } = pageInfo;
        if (pageNumber < 1 || pageNumber > totalPages) return;
        setPaginationConfig({
            ...paginationConfig,
            pageNumber: pageNumber - 1
        });
    }

    // =============== MAIN RENDER =================

    return (
        <main className="flex min-h-screen flex-col items-center justify-between">
            <div className="relative w-[95%] lg:w-[90%] xl:w-[80%] 2xl:w-[70%] 3xl:w-[50%] mt-12 sm:mt-24">
                <div className="w-full p-8 bg-zinc-950 rounded-xl border border-gray-7 overflow-x-hidden">
                    <div className="w-full text-3xl mb-4">
                        Messages for "{groupChatName}"
                    </div>
                    <div className="flex">
                        <div>
                            <div className="mb-1">
                                Filter by Participant
                            </div>
                            <select className="select w-48">
                                <option>Everyone</option>
                                <option>Only Me</option>
                            </select>
                        </div>
                        <div className="ml-auto">
                            <div className="mb-1">
                                Actions for Selected
                            </div>
                            <div>
                                <button className="btn mr-2">Add to Quiz</button>
                                <button className="btn">Delete</button>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4">
                        <table className="w-full table table-compact table-fixed">
                            <thead>
                                <tr>
                                    <th className="w-[35px]"></th>
                                    <th className="w-[150px]">Sender</th>
                                    <th className="">Message</th>
                                    <th className="w-[150px]">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody>
                                {renderMessageRows()}
                            </tbody>
                        </table>
                    </div>
                    {renderPaginationControls()}
                </div>
            </div>
        </main>
    );
}