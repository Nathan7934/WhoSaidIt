"use client";

import useGetMessages from "@/app/hooks/api_access/messages/useGetMessages";
import useGetGroupChat from "@/app/hooks/api_access/group_chats/useGetGroupChat";
import useGetQuizzes from "@/app/hooks/api_access/quizzes/useGetQuizzes";
import useGetParticipants from "@/app/hooks/api_access/participants/useGetParticipants";
import { GroupChat, Message, MessagePage, PaginationConfig, SurvivalQuiz, TimeAttackQuiz, Participant } from "@/app/interfaces";

import AnimateHeight from "react-animate-height";
import { Height } from "react-animate-height";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

interface PageInfo {
    totalPages: number;
    totalMessages: number;
    hasNext: boolean;
    hasPrevious: boolean;
}

const DEFAULT_PAGE_CONFIG: PaginationConfig = {
    pageNumber: 0,
    pageSize: 20,
    ascending: false
}

export default function Messages({ params }: { params: { query: string[] }}) {

    // Extracting the NextJS route query parameters
    const groupChatId = Number(params.query[0]);
    const quizId = params.query.length > 1 ? Number(params.query[1]) : null;

    // ----------- Hooks ------------------
    const router = useRouter();
    const getGroupChat = useGetGroupChat();
    const getMessages = useGetMessages();
    const getQuizzes = useGetQuizzes();
    const getParticipants = useGetParticipants();

    // ----------- State (Data) -----------
    const [groupChatName, setGroupChatName] = useState<string>("");
    const [messages, setMessages] = useState<Array<Message>>([]);
    const [quizzes, setQuizzes] = useState<Array<TimeAttackQuiz | SurvivalQuiz>>([]);
    const [participants, setParticipants] = useState<Array<Participant>>([]);

    const [paginationConfig, setPaginationConfig] = useState<PaginationConfig>(DEFAULT_PAGE_CONFIG);
    const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);

    // Filters and selections
    const [selectedMessageIds, setSelectedMessageIds] = useState<Array<number>>([]);
    const [filterQuizId, setFilterQuizId] = useState<number | null>(null);
    const [filterParticipantId, setFilterParticipantId] = useState<number | null>(null);

    // Refs for determining the useEffect trigger when fetching messages
    const prevFilterQuizId = useRef<number | null>(null);
    const prevFilterParticipantId = useRef<number | null>(null);

    // ----------- State (UI) -------------
    const [stableDataLoading, setStableDataLoading] = useState<boolean>(true); // Stable data = group chat, quizzes, participants
    const [messagesLoading, setMessagesLoading] = useState<boolean>(true);

    // ----------- Data Retrieval ---------

    // Fetch stable data (group chat, quizzes, participants) - data we don't need to refresh
    useEffect(() => {
        const getStableData = async () => {
            setStableDataLoading(true);
            const groupChat: GroupChat | null = await getGroupChat(groupChatId);
            const quizzes: Array<TimeAttackQuiz | SurvivalQuiz> | null = await getQuizzes(groupChatId);
            const participants: Array<Participant> | null = await getParticipants(groupChatId);
            if (groupChat && quizzes && participants) {
                setGroupChatName(groupChat.groupChatName);
                setQuizzes(quizzes);
                setParticipants(participants);
                setStableDataLoading(false);
            } else {
                console.error("Error fetching group chat, quiz, and participant data, redirecting to root");
                router.push("/");
            }
        }
        getStableData();
    }, []);

    // Fetch messages - PAGE CHANGE
    useEffect(() => {
        // We don't want redundant API calls if this update was due to a filter change
        if (didFiltersChange()) {
            prevFilterQuizId.current = filterQuizId;
            prevFilterParticipantId.current = filterParticipantId;
            return;
        }
        getMessageData(paginationConfig);
    }, [paginationConfig]);

    // Fetch messages - FILTER CHANGE
    useEffect(() => { getMessageData(DEFAULT_PAGE_CONFIG); }
    , [filterQuizId, filterParticipantId]);


    const getMessageData = async (config: PaginationConfig) => {
        setMessagesLoading(true);
        let messagePage: MessagePage | null;
        if (filterQuizId) {
            messagePage = await getMessages(groupChatId, config, filterQuizId);
        } else if (filterParticipantId) {
            messagePage = await getMessages(groupChatId, config, null, filterParticipantId);
        } else {
            messagePage = await getMessages(groupChatId, config);
        }

        if (messagePage) {
            setMessages(messagePage.messages);
            setPageInfo({
                totalPages: messagePage.totalPages,
                totalMessages: messagePage.totalMessages,
                hasNext: messagePage.hasNext,
                hasPrevious: messagePage.hasPrevious
            });
            if (didFiltersChange()) {
                setPaginationConfig(DEFAULT_PAGE_CONFIG);
            }
            setMessagesLoading(false);
        } else {
            console.error("Error fetching message data, redirecting to root");
            router.push("/"); // Redirect to root if we encounter an error
        }
    }

    // ---------- Data Helper Functions --------
    const didFiltersChange = () => {
        return (
            (filterQuizId !== prevFilterQuizId.current) ||
            (filterParticipantId !== prevFilterParticipantId.current)
        );
    };

    // =============== RENDER FUNCTIONS =================

    const MessageCell = ({ message }: { message: Message }) => {
        const ref = useRef<HTMLSpanElement>(null);
        const resizeTimeout = useRef<NodeJS.Timeout | null>(null);

        const [height, setHeight] = useState<Height>(0);
        const [contentWrapped, setContentWrapped] = useState<boolean>(false);
        const [hasOverflow, setHasOverflow] = useState<boolean>(false);

        // Close the message cell if the user clicks outside of it
        // Also determine if the message content is overflowing
        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (ref.current && !(ref.current.contains(event.target as Node))) {
                    setHeight(0);
                }
            };
            document.addEventListener('mousedown', handleClickOutside);

            determineOverflow();
            const handleResize = () => {
                if (resizeTimeout.current) {
                    clearTimeout(resizeTimeout.current);
                }
                resizeTimeout.current = setTimeout(() => {
                    determineOverflow();
                }, 100)
            }
            window.addEventListener('resize', handleResize);

            // Cleanup
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
                window.removeEventListener('resize', handleResize);
                if (resizeTimeout.current) {
                    clearTimeout(resizeTimeout.current);
                }
            };
        }, []);

        const determineOverflow = () => {
            setHasOverflow(ref.current ? ref.current.scrollWidth > ref.current.clientWidth : false);
        }

        return (
            <div className={`grow relative overflow-hidden ${hasOverflow ? "cursor-pointer" : "cursor-default"}`}
            onClick={() => setHeight(height === 0 ? 'auto' : 0)}>
                <span ref={ref} className={`absolute max-w-full overflow-hidden text-ellipsis ${contentWrapped ? "" : "whitespace-nowrap"}`}>
                    {message.content}
                </span>
                <AnimateHeight height={height} duration={300} className="invisible"
                onHeightAnimationStart={() => setContentWrapped(true)} onHeightAnimationEnd={() => setContentWrapped(height !== 0)}>
                    {message.content} {/* This is a hack to get the height of the message cell to expand properly. */}
                </AnimateHeight>
            </div>
        );
    };

    const renderMessagesTable = () => {
        if (stableDataLoading && messages.length === 0) return (<div className="skeleton w-full h-[862px] rounded-md" />)

        const messageRows = messages.map((message: Message, index: number) => {
            return (
                <div key={message.id} className="flex py-2 border-b border-gray-6">
                    <div className="flex-none w-[35px]">
                        <input type="checkbox" className="checkbox"/>
                    </div>
                    <div className="flex-none w-[150px] pr-2 whitespace-nowrap overflow-x-hidden text-ellipsis text-gray-11">
                        {message.sender.name}
                    </div>
                    <MessageCell message={message}/>
                    <div className="flex-none w-[140px] ml-5 text-gray-9">
                        {formatDate(message.timestamp)}
                    </div>
                </div>
            );
        });

        return (
            <div className="w-full">
                {/* Table header */}
                <div className="flex py-2 bg-gray-3 rounded-md border border-gray-6">
                    <div className="flex-none w-[35px]"></div>
                    <div className="flex-none w-[150px]">Sender</div>
                    <div className="grow">Message</div>
                    <div className="flex-none w-[140px]">Timestamp</div>
                </div>
                {/* Table rows */}
                {messages.length > 0 ? 
                    messageRows : 
                    <div className="w-full mt-4 py-6 px-8 border-dashed border-2 border-gray-5 rounded-xl text-gray-9 text-center">
                        No messages found
                    </div>
                }
            </div>
        );
    }

    const renderPaginationControls = (isMobile: boolean) => {

        const handlePageChange = (pageNumber: number) => {
            if (!pageInfo || pageNumber < 1 || pageNumber > pageInfo.totalPages) return;
            setPaginationConfig({
                ...paginationConfig,
                pageNumber: pageNumber - 1
            });
        }

        if (!pageInfo) return null;
        const pageNumber = paginationConfig.pageNumber + 1; // API is 0-indexed, while UI is 1-indexed
        const { totalPages } = pageInfo;
        if (totalPages <= 1) return renderStaticPaginationControls(); // Don't render pagination controls if there's only one or zero pages
    
        const coreButtons = isMobile ? 3 : 5; // Total core page buttons
    
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
            startPage = isMobile ? pageNumber : pageNumber - 1;
            endPage = isMobile ? pageNumber : pageNumber + 1;
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
                <div className="pagination pagination-compact mx-auto relative">
                    <button className="btn" onClick={() => handlePageChange(pageNumber - 1)}>
                        <Image className="" src="/chevron-left.svg" alt="<" width={18} height={18} />
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
                        <Image className="rotate-180" src="/chevron-left.svg" alt=">" width={18} height={18} />
                    </button>
                    {messagesLoading && <div className="spinner-circle absolute w-7 h-7 right-[-38px] top-[50%] translate-y-[-50%]" />}
                </div>
            </div>
        );
    };

    const renderQuizFilterDropdown = () => {

        const selectionChanged = (e: React.ChangeEvent<HTMLSelectElement>) => {
            if (e.target.value === "None") {
                setFilterQuizId(null);
            } else {
                setFilterQuizId(Number(e.target.value));
            }
        }

        return (
            <select className="select w-48" onChange={selectionChanged}>
                <option value={"None"}>None</option>
                {quizzes.map((quiz: TimeAttackQuiz | SurvivalQuiz) => {
                    return (
                        <option key={quiz.id} value={quiz.id}>
                            {quiz.quizName}
                        </option>
                    );
                })}
            </select>
        );
    };

    const renderParticipantFilterDropdown = () => {
            
            const selectionChanged = (e: React.ChangeEvent<HTMLSelectElement>) => {
                if (e.target.value === "Everyone") {
                    setFilterParticipantId(null);
                } else {
                    setFilterParticipantId(Number(e.target.value));
                }
            }
    
            return (
                <select className="select w-48" onChange={selectionChanged}>
                    <option value={"Everyone"}>Everyone</option>
                    {participants.map((participant: Participant) => {
                        return (
                            <option key={participant.id} value={participant.id}>
                                {participant.name}
                            </option>
                        );
                    })}
                </select>
            );
        }

    // ---------- Rendering Helper Functions --------

    // Formats a date object into a string of type "MM/DD/YY h:mm am/pm"
    const formatDate = (date: Date) => {
        const hours = date.getHours();
        const ampm = hours >= 12 ? 'pm' : 'am';
        const formattedHours = hours % 12 || 12; // If hours % 12 is 0, use 12
        const formattedMinutes = `0${date.getMinutes()}`.slice(-2); // Ensure two digits
        const shortYear = date.getFullYear().toString().slice(-2); // Last two digits of year
    
        return `${date.getMonth() + 1}/${date.getDate()}/${shortYear} ${formattedHours}:${formattedMinutes} ${ampm}`;
    }

    // Renders pagination controls when they are not interactive (only one or zero pages)
    const renderStaticPaginationControls = () => {
        // Precondition: totalPages <= 1

        if (!pageInfo) return null;
        const { totalPages } = pageInfo;
    
        return (
            <div className="flex mt-4">
                <div className="pagination pagination-compact mx-auto relative">
                    <button className="btn" disabled>
                        <Image className="" src="/chevron-left.svg" alt="<" width={18} height={18} />
                    </button>
                    {totalPages === 1 && <button className="btn btn-active">1</button>}
                    <button className="btn" disabled>
                        <Image className="rotate-180" src="/chevron-left.svg" alt=">" width={18} height={18} />
                    </button>
                </div>
            </div>
        );
    }

    // =============== MAIN RENDER =================

    return (
        <main className="flex min-h-screen flex-col items-center justify-between">
            <div className="relative w-[95%] lg:w-[90%] xl:w-[80%] 2xl:w-[70%] 3xl:w-[50%] mt-12 sm:mt-24">
                <div className="w-full p-8 bg-zinc-950 rounded-xl border border-gray-7 overflow-x-hidden">
                    <div className="w-full text-3xl mb-5">
                        Messages for {stableDataLoading ? "..." : `"${groupChatName}"`}
                    </div>
                    <div className="flex mb-4">
                        <div className="mr-3">
                            <div className="mb-1">
                                Filter by Quiz
                            </div>
                            {renderQuizFilterDropdown()}
                        </div>
                        <div>
                            <div className="mb-1">
                                Filter by Participant
                            </div>
                            {renderParticipantFilterDropdown()}
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
                    {renderMessagesTable()}
                    {renderPaginationControls(false)}
                </div>
            </div>
        </main>
    );
}