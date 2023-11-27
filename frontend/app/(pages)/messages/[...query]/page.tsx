"use client";

import useGetMessages from "@/app/hooks/api_access/messages/useGetMessages";
import useGetGroupChat from "@/app/hooks/api_access/group_chats/useGetGroupChat";
import useGetQuizzes from "@/app/hooks/api_access/quizzes/useGetQuizzes";
import useGetParticipants from "@/app/hooks/api_access/participants/useGetParticipants";
import usePostMessagesInQuiz from "@/app/hooks/api_access/quizzes/usePostMessagesInQuiz";
import useDeleteMessages from "@/app/hooks/api_access/messages/useDeleteMessages";

import renderQuizTypeBadge from "@/app/utilities/quizTypeBadge";
import { GroupChat, Message, MessagePage, PaginationConfig, SurvivalQuiz, TimeAttackQuiz, Participant } from "@/app/interfaces";
import MessageRow from "@/app/components/MessageRow";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

interface PageInfo {
    totalPages: number;
    totalMessages: number;
    hasNext: boolean;
    hasPrevious: boolean;
}

interface ResponseStatus {
    message: string;
    success: boolean;
    doAnimate: boolean;
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

    // API access hooks
    const getGroupChat = useGetGroupChat();
    const getMessages = useGetMessages();
    const getQuizzes = useGetQuizzes();
    const getParticipants = useGetParticipants();
    const postMessagesInQuiz = usePostMessagesInQuiz();
    const deleteMessages = useDeleteMessages();

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
    const [filterChangeCounter, setFilterChangeCounter] = useState<number>(0); // Used to trigger useEffect when filters change

    // ----------- State (UI) -------------
    const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 1024);

    const [stableDataLoading, setStableDataLoading] = useState<boolean>(true); // Stable data = group chat, quizzes, participants
    const [messagesLoading, setMessagesLoading] = useState<boolean>(true);
    const [alteringMessages, setAlteringMessages] = useState<boolean>(false); // Used for the "Add to Quiz" modal

    // Request errors for adding/removing messages to/from quizzes, and deleting messages
    const [responseStatus, setResponseStatus] = useState<ResponseStatus>({ message: "", success: false, doAnimate: false });

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
                if (quizId) setFilterQuizId(quizId);
                setStableDataLoading(false);
            } else {
                console.error("Error fetching group chat, quiz, and participant data, redirecting to root");
                router.push("/");
            }
        }
        getStableData();
    }, []);

    // Fetch messages - triggered by page change or filter change
    useEffect(() => {
        console.log("Page change detected, fetching messages")
        const getMessageData = async () => {
            setMessagesLoading(true);
            let messagePage: MessagePage | null;
            if (filterQuizId && filterParticipantId) {
                messagePage = await getMessages(groupChatId, paginationConfig, filterQuizId, filterParticipantId);
            } else if (filterQuizId) {
                messagePage = await getMessages(groupChatId, paginationConfig, filterQuizId);
            } else if (filterParticipantId) {
                messagePage = await getMessages(groupChatId, paginationConfig, null, filterParticipantId);
            } else {
                messagePage = await getMessages(groupChatId, paginationConfig);
            }
    
            if (messagePage) {
                setMessages(messagePage.messages);
                setPageInfo({
                    totalPages: messagePage.totalPages,
                    totalMessages: messagePage.totalMessages,
                    hasNext: messagePage.hasNext,
                    hasPrevious: messagePage.hasPrevious
                });
                setMessagesLoading(false);
            } else {
                console.error("Error fetching message data, redirecting to root");
                router.push("/"); // Redirect to root if we encounter an error
            }
        }
        getMessageData();

    }, [paginationConfig, filterChangeCounter]);

    // When the filters change, reset the pagination config and trigger useEffect
    useEffect(() => { 
        setPaginationConfig(DEFAULT_PAGE_CONFIG);
        setFilterChangeCounter(c => c + 1);
    }, [filterQuizId, filterParticipantId]);

    // Deselect all messages only when quiz filter is changed
    useEffect(() => {
        setSelectedMessageIds([]);
    }, [filterQuizId]);

    // ----------- UI effects ---------

    // Clear the request status message after 4 seconds
    useEffect(() => {
        if (responseStatus.message !== "") {
            const timeout = setTimeout(() => {
                setResponseStatus({ 
                    message: "", 
                    success: responseStatus.success, 
                    doAnimate: true 
                });
            }, 4000);
            return () => clearTimeout(timeout);
        }
    }, [responseStatus]);

    // DOM event handlers
    useEffect(() => {
        // If the viewport width is less than 1024px (TailwindCSS 'lg' breakpoint), we switch to the mobile layouts determined by isMobile
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
        }
        handleResize();
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
        }
    }, []);

    // ----------- Data helper functions ---------
    
    const updateMessagesInQuiz = async (quizId: number) => {
        setAlteringMessages(true);
        const removing = filterQuizId !== null; // If we have a quiz selected, we are removing messages from it instead
        const singular = selectedMessageIds.length === 1;

        const error = await postMessagesInQuiz(quizId, selectedMessageIds, removing);
        if (!error) {
            setSelectedMessageIds([]);
            setResponseStatus({
                message: `Message${singular ? "" : "s"} ${removing ? "removed" : "added"} successfully`,
                success: true,
                doAnimate: true
            })
            if (removing) {
                setFilterChangeCounter(c => c + 1); // Trigger useEffect to refetch messages
            }
        } else {
            console.error("Error updating quiz messages");
            setResponseStatus({
                message: error,
                success: false,
                doAnimate: true
            });
        }
        toggleModal("add-remove-modal");
        setAlteringMessages(false);
    }

    const deleteSelectedMessages = async () => {
        setAlteringMessages(true);
        const singular = selectedMessageIds.length === 1;

        const error = await deleteMessages(groupChatId, selectedMessageIds);
        if (!error) {
            setSelectedMessageIds([]);
            setResponseStatus({
                message: `Message${singular ? "" : "s"} deleted successfully`,
                success: true,
                doAnimate: true
            });
            setFilterChangeCounter(c => c + 1); // Trigger useEffect to refetch messages
        } else {
            console.error("Error deleting messages");
            setResponseStatus({
                message: error,
                success: false,
                doAnimate: true
            });
        }
        toggleModal("delete-modal");
        setAlteringMessages(false);
    }

    // =============== RENDER FUNCTIONS =================

    const renderMessagesTable = () => {
        if (stableDataLoading && messages.length === 0) return (<div className="skeleton w-full h-[862px] rounded-md" />)

        const messageRows = messages.map((message: Message, index: number) => {
            return (
                <MessageRow key={message.id} message={message} isMobile={isMobile} selectedMessageIds={selectedMessageIds} 
                setSelectedMessageIds={setSelectedMessageIds}/>
            );
        });

        return (
            <div className="w-full">
                {/* Table header */}
                <div className="flex py-2 bg-gray-3 rounded-md border border-gray-6">
                    <div className="flex-none hidden lg:inline-block w-[35px]"></div>
                    <div className="flex-none hidden lg:inline-block w-[150px]">Sender</div>
                    <div className="grow text-center lg:text-left">Message<span className="lg:hidden">s</span></div>
                    <div className="flex-none hidden lg:inline-block w-[140px]">Timestamp</div>
                </div>
                {/* Table rows */}
                {messages.length > 0 ? 
                    messageRows : 
                    <div className="w-full flex-col mt-4 py-6 px-8 border-dashed border-2 border-gray-5 rounded-xl 
                    text-gray-10 text-center text-xl">
                        No messages found
                        {filterQuizId && 
                            <div className="text-sm text-gray-8 mt-2">
                                This quiz will use all messages in the group chat
                            </div>
                        }
                    </div>
                }
            </div>
        );
    }

    const renderPaginationControls = () => {

        const handlePageChange = (pageNumber: number) => {
            if (!pageInfo || pageNumber < 1 || pageNumber > pageInfo.totalPages) {
                return;
            } 
            setPaginationConfig({
                ...paginationConfig,
                pageNumber: pageNumber - 1
            });
        }

        if (!pageInfo) return null;
        const pageNumber = paginationConfig.pageNumber + 1; // API is 0-indexed, while UI is 1-indexed
        const { totalPages } = pageInfo;
        // if (totalPages <= 1) return renderStaticPaginationControls(); // Don't render pagination controls if there's only one or zero pages
    
        const coreButtons = isMobile ? 3 : 5; // Total core page buttons
    
        // Determine visibility of ellipses and adjust page ranges
        let nearStart = pageNumber <= 3;
        let nearEnd = pageNumber >= totalPages - 2;
        let startPage, endPage;
        if (totalPages <= (isMobile ? 5 : 7)) {
            // If total pages is less than or equal to 5 (mobile) or 7 (desktop), don't show ellipses
            startPage = 2;
            endPage = totalPages - 1;
            // Set both nearStart and nearEnd to true so that ellipses are not rendered
            nearStart = true; 
            nearEnd = true;
        }
        else if (nearStart) {
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
        const corePageButtons: Array<JSX.Element> = [];
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
                    <button className="btn" onClick={() => handlePageChange(pageNumber - 1)} disabled={pageNumber === 1}>
                        <Image className="" src="/chevron-left.svg" alt="<" width={18} height={18} />
                    </button>
                    {totalPages > 0 && 
                        <button className={`btn ${pageNumber === 1 ? "btn-active" : ""}`} 
                        onClick={() => handlePageChange(1)}>
                            1
                        </button>
                    }
                    {!nearStart && <button disabled className="btn">...</button>}
                    {corePageButtons}
                    {!nearEnd && <button disabled className="btn">...</button>}
                    {totalPages > 1 &&
                        <button className={`btn ${pageNumber === totalPages ? "btn-active" : ""}`} 
                        onClick={() => handlePageChange(totalPages)}>
                            {totalPages}
                        </button>
                    }
                    <button className="btn" onClick={() => handlePageChange(pageNumber + 1)} disabled={pageNumber >= totalPages}>
                        <Image className="rotate-180" src="/chevron-left.svg" alt=">" width={18} height={18} />
                    </button>
                    {messagesLoading && <div className="spinner-circle absolute w-7 h-7 right-[-38px] top-[50%] translate-y-[-50%]" />}
                </div>
            </div>
        );
    };

    const renderParticipantFilterDropdown = () => {
        const selectionChanged = (e: React.ChangeEvent<HTMLSelectElement>) => {
            const selectedValue = e.target.value;
            setFilterParticipantId(selectedValue === "" ? null : Number(selectedValue));
        }

        if (stableDataLoading) return <div className="skeleton w-48 h-10 rounded-xl" />;

        return (
            <select className="select w-48 pr-7 text-ellipsis transition duration-300 ease-in-out hover:border-gray-8" 
            onChange={selectionChanged} >
                <option value={""}>All Messages</option>
                {participants.map((participant: Participant) => {
                    return (
                        <option key={participant.id} value={participant.id}>
                            {participant.name}
                        </option>
                    );
                })}
            </select>
        );
    };

    const renderQuizFilterDropdown = () => {
        const selectionChanged = (e: React.ChangeEvent<HTMLSelectElement>) => {
            const selectedValue = e.target.value;
            setFilterQuizId(selectedValue === "" ? null : Number(selectedValue));
        };

        if (stableDataLoading) return <div className="skeleton w-48 h-10 rounded-xl" />;

        return (
            <select className="select w-48 pr-7 text-ellipsis transition duration-300 ease-in-out hover:border-gray-8" 
            onChange={selectionChanged} defaultValue={quizId ? quizId : ""}>
                <option value={""}>Group Chat</option>
                {quizzes.map((quiz: TimeAttackQuiz | SurvivalQuiz) => {
                    return (
                        <option key={quiz.id} value={quiz.id}>
                            "{quiz.quizName}"
                        </option>
                    );
                })}
            </select>
        );
    };

    const renderAddRemoveQuizMessagesModal = () => {
        const singular = selectedMessageIds.length === 1;

        let modalContent: JSX.Element;
        if (alteringMessages) {
            modalContent = (<>
                <div className="mx-auto mb-4 text-lg text-gray-11">
                    {filterQuizId ? "Removing" : "Adding"} Message{singular ? "" : "s"}...
                </div>
                <div className="flex justify-center mb-6">
                    <div className="spinner-circle w-10 h-10" />
                </div>
            </>);
        } else if (filterQuizId) {
            modalContent = (<>
                <div className="mx-auto mb-4 text-lg text-gray-11">
                    Are you sure?
                </div>
                <div className="flex gap-2 px-6 mb-4">
                    <button className="btn grow" onClick={() => toggleModal("add-remove-modal")}>
                        Cancel
                    </button>
                    <button className="btn btn-solid-error grow" onClick={() => updateMessagesInQuiz(filterQuizId)}>
                        Remove
                    </button>
                </div>
            </>);
        } else {
            modalContent = (<>{renderQuizModalButtons()}</>);
        }

        return (<>
            <input className="modal-state" id="add-remove-modal" type="checkbox" />
            <div className="modal">
                <label className="modal-overlay" htmlFor="add-remove-modal"></label>
                <div className="modal-content flex flex-col w-full max-w-[375px] mx-6 p-0 bg-zinc-950 border-[1px] border-gray-3">
                    <div className="flex w-full mt-1">
                        <div className="relative bottom-[2px] self-center text-xl font-light ml-4 mr-3">
                            {filterQuizId ? "Remove" : "Add"} {selectedMessageIds.length} Message{singular ? "" : "s"} 
                            {filterQuizId ? " from" : " to"} Quiz
                        </div>
                        <label htmlFor="add-remove-modal" className="btn btn-sm btn-circle btn-ghost text-lg ml-auto mr-1">✕</label>
                    </div>
                    <div className="divider mt-1 mb-0 mx-3 relative bottom-2"></div>
                    {modalContent}
                </div>
            </div>
        </>);
    }

    const renderDeleteMessagesModal = () => {
        const singular: boolean = selectedMessageIds.length === 1;

        const modalContent: JSX.Element = alteringMessages 
            ? (<>
                <div className="mx-auto mb-4 text-lg text-gray-11">
                    Deleting Message{singular ? "" : "s"}...
                </div>
                <div className="flex justify-center mb-6">
                    <div className="spinner-circle w-10 h-10" />
                </div>
            </>)
            : (<>
                <div className="mx-auto mb-5 text-center">
                    <div className="mb-2 text-2xl text-gray-11">
                        Are you sure?
                    </div>
                    <div className="mb-2 px-2 max-w-[300px] text-sm text-gray-9 font-light">
                        Deleting {singular ? "a message" : "messages"} from the group chat will also remove 
                        {singular ? " it" : " them"} from all quizzes.
                    </div>
                    <div className="text-gray-10 font-semibold">
                        This cannot be undone.
                    </div>
                </div>
                <div className="flex gap-2 px-6 mb-4">
                    <button className="btn grow" onClick={() => toggleModal("delete-modal")}>
                        Cancel
                    </button>
                    <button className="btn btn-error grow" onClick={() => deleteSelectedMessages()}>
                        Delete
                    </button>
                </div>
            </>);

        return (<>
            <input className="modal-state" id="delete-modal" type="checkbox" />
            <div className="modal">
                <label className="modal-overlay" htmlFor="delete-modal"></label>
                <div className="modal-content flex flex-col w-full max-w-[375px] mx-6 p-0 bg-zinc-950 border-[1px] border-gray-3">
                    <div className="flex w-full mt-1">
                        <div className="relative bottom-[2px] self-center text-xl font-light ml-4 mr-3">
                            Delete {selectedMessageIds.length} Message{singular ? "" : "s"}
                        </div>
                        <label htmlFor="delete-modal" className="btn btn-sm btn-circle btn-ghost text-lg ml-auto mr-1">✕</label>
                    </div>
                    <div className="divider mt-1 mb-0 mx-3 relative bottom-2"></div>
                    {modalContent}
                </div>
            </div>
        </>);
    }

    const renderQuizModalButtons = () => {
        if (quizzes.length === 0) {
            return (
                <div className="w-64 mb-4 py-6 mx-auto border-dashed border-2 border-gray-5 rounded-xl text-gray-9 text-center">
                    No quizzes found
                </div>
            );
        }

        return quizzes.map((quiz: TimeAttackQuiz | SurvivalQuiz, index: number) => {
            return (
                <button key={quiz.id} className={`bg-gray-1 py-2 rounded-2xl mx-8 transition duration-300 ease-in-out hover:bg-gray-3
                 ${index < quizzes.length - 1 ? "mb-[10px]" : "mb-4"}`}
                onClick={() => updateMessagesInQuiz(quiz.id)}>
                    <div className="flex-col">
                        <div className="text-xl">
                            {quiz.quizName}
                        </div>
                        <div className="mt-[4px]">
                            {renderQuizTypeBadge(quiz.type)}
                        </div>
                    </div>
                </button>
            );
        });
    }

    // ---------- Rendering Helper Functions --------

    // This is a workaround for triggering the Ripple-UI hidden modal checkboxes to change state using a button
    const toggleModal = (modalId: string) => {
        const modalCheckbox = document.getElementById(modalId) as HTMLInputElement;
        if (modalCheckbox) {
            modalCheckbox.checked = !modalCheckbox.checked;
        }
    }

    const determineAlertAnimationClassName = () => {
        const color = responseStatus.success ? " bg-green-2" : " bg-blue-2";
        if (responseStatus.doAnimate) {
            if (responseStatus.message === "") {
                return " animate-alertExiting" + color;
            } else {
                return " animate-alertEntering" + color;
            }
        }
        return "opacity-0";
    }

    // =============== MAIN RENDER =================

    return (
        <main className="flex min-h-screen flex-col items-center justify-between">
            <div className="relative w-[95%] lg:w-[90%] xl:w-[80%] 2xl:w-[70%] 3xl:w-[50%] mt-12 sm:mt-24">
                <div className="w-full p-2 mb-3 lg:p-8 bg-zinc-950 rounded-xl border border-gray-7 overflow-x-hidden">
                    <div className="flex mb-2">
                        <div className="text-3xl mb-5">
                            Messages for {stableDataLoading ? "..." : `"${groupChatName}"`}
                        </div>
                        <div className={`flex ml-auto self-center p-2 rounded-2xl overflow-hidden
                        ${determineAlertAnimationClassName()}`}>
                            {responseStatus.success
                                ? <Image src="/success.svg" alt="Success" width={36} height={36} />
                                : <Image src="/alert.svg" alt="Alert" width={36} height={36} />
                            }
                            <div className="self-center mx-2 text-green-100 whitespace-nowrap">
                                {responseStatus.message}
                            </div>
                        </div>
                    </div>
                    <div className="flex mb-4">
                        <fieldset className="px-3 pb-3 pt-1 border border-gray-3 rounded-lg">
                            <legend className="text-gray-11">Query Filters</legend>
                            <div className="flex">
                                {renderParticipantFilterDropdown()}
                                <div className="self-center mx-2 text-lg text-gray-8">
                                    in
                                </div>
                                {renderQuizFilterDropdown()}
                            </div>
                        </fieldset>
                        <fieldset className="ml-auto px-3 pb-3 pt-1 border border-gray-3 rounded-lg ">
                            <legend className={`text-gray-11 transition duration-300 ease-in-out 
                            ${selectedMessageIds.length === 0 ? "opacity-25" : ""}`}>
                                Selection Actions
                            </legend>
                            {!filterQuizId &&
                                <button className="btn mr-2 font-semibold transition duration-300 ease-in-out 
                                disabled:opacity-25 hover:bg-gray-4" 
                                disabled={selectedMessageIds.length === 0} onClick={() => toggleModal("delete-modal")}>
                                    Delete
                                </button>
                            }
                            <button className="btn transition duration-300 ease-in-out disabled:opacity-25 hover:bg-gray-4" 
                            disabled={selectedMessageIds.length === 0} onClick={() => toggleModal("add-remove-modal")}>
                                {filterQuizId ? "Remove from Quiz" : "Add to Quiz"}
                            </button>
                        </fieldset>
                    </div>
                    {renderMessagesTable()}
                    {renderPaginationControls()}
                </div>
            </div>
            {/* MODAL - ADD/REMOVE MESSAGES TO QUIZ */}
            {renderAddRemoveQuizMessagesModal()}
            {!filterQuizId && renderDeleteMessagesModal()}
        </main>
    );
}