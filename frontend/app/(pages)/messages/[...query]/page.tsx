"use client";

import useGetMessages from "@/app/hooks/api_access/messages/useGetMessages";
import useGetGroupChat from "@/app/hooks/api_access/group_chats/useGetGroupChat";
import useGetQuizzes from "@/app/hooks/api_access/quizzes/useGetQuizzes";
import useGetParticipants from "@/app/hooks/api_access/participants/useGetParticipants";
import usePostMessagesInQuiz from "@/app/hooks/api_access/quizzes/usePostMessagesInQuiz";
import useDeleteMessages from "@/app/hooks/api_access/messages/useDeleteMessages";
import useAdjustContentHeight from "@/app/hooks/useAdjustContentHeight";

import { renderQuizTypeBadge, renderResponseAlert, toggleModal, isModalOpen } from "@/app/utilities/miscFunctions";
import { 
    GroupChat, Message, MessagePage, PaginationConfig, SurvivalQuiz,
    TimeAttackQuiz, Participant, ResponseStatus 
} from "@/app/interfaces";
import MessageRow from "@/app/components/data-rows/MessageRow";
import Modal from "@/app/components/modals/Modal";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

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

    // Extracting the NextJS route query parameters "/messages/{groupChatId}/{?quizId}/{?participantId}"
    const groupChatId = Number(params.query[0]);
    let quizId: number | null = null;
    if (params.query.length > 1) {
        // If the second query parameter is "nfq", we set quizId to null to indicate that we don't want to filter by quiz
        // This param is necessary when routing with a participant filter but no quiz filter
        quizId = params.query[1] === "nfq" ? null : Number(params.query[1]);
    }
    const participantId = params.query.length > 2 ? Number(params.query[2]) : null;

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

    const [doAnimateSelectionMenu, setDoAnimateSelectionMenu] = useState<boolean>(false); // For the mobile selection menu animation

    // Loading states
    const [stableDataLoading, setStableDataLoading] = useState<boolean>(true); // Stable data = group chat, quizzes, participants
    const [messagesLoading, setMessagesLoading] = useState<boolean>(true);
    const [alteringMessages, setAlteringMessages] = useState<boolean>(false); // Used for the "Add to Quiz" modal

    // HTTP Request errors for adding/removing messages to/from quizzes, and deleting messages
    const [responseStatus, setResponseStatus] = useState<ResponseStatus>({ message: "", success: false, doAnimate: false });

    // Adjust the height of the page content area
    useAdjustContentHeight(".navbar", ".page-content", [stableDataLoading, messagesLoading]);

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
                if (participantId) setFilterParticipantId(participantId);
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

                if (isModalOpen("participant-modal")) toggleModal("participant-modal");
                if (isModalOpen("quiz-modal")) toggleModal("quiz-modal");
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

    // This avoids triggering the selection menu exit animation when the page first loads
    useEffect(() => {
        if (!doAnimateSelectionMenu && selectedMessageIds.length > 0) {
            setDoAnimateSelectionMenu(true);
        }
    }, [selectedMessageIds])

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
                <div key={message.id} className="border-zinc-800 border-b">
                    <MessageRow message={message} isMobile={isMobile} selectedMessageIds={selectedMessageIds} 
                    setSelectedMessageIds={setSelectedMessageIds}/>
                </div>
            );
        });

        return (
            <div className="w-full noselect">
                {/* Table header */}
                <div className="flex py-2 bg-zinc-950 border border-zinc-800 rounded-md noselect">
                    <div className="flex-none hidden lg:inline-block w-[35px]"></div>
                    <div className="flex-none hidden lg:inline-block w-[150px]">Sender</div>
                    <div className="grow text-center lg:text-left">Message<span className="lg:hidden">s</span></div>
                    <div className="flex-none hidden lg:inline-block w-[140px]">Timestamp</div>
                </div>
                {/* Table rows */}
                {messages.length > 0 ? 
                    messageRows : 
                    <div className="w-full flex-col mt-4 py-12 px-3 border-dashed border border-zinc-800 rounded-xl 
                    text-zinc-500 text-center text-xl">
                        No messages found
                        {filterQuizId && <>
                            <div className="text-sm text-zinc-600 mt-2">
                                This quiz will pull messages from the group chat.
                            </div>
                            <div className="flex flex-col gap-3 items-center mt-10">
                                <div className="text-sm font-medium text-zinc-500">To add messages to the quiz, filter by</div>
                                <div className="flex items-center gap-2 text-zinc-400">
                                    <div className="bg-zinc-950 border border-zinc-700 rounded-xl py-1 px-3 text-white font-light text-base">
                                        {"<Messages>"}
                                    </div>
                                    <div className="text-zinc-600">in</div>
                                    <div className="bg-zinc-950 border border-zinc-700 rounded-xl py-1 px-3 text-white font-medium text-base">
                                        Group Chat
                                    </div>
                                </div>
                                <div className="text-sm font-medium text-zinc-500">where you can then select them.</div>
                            </div>
                        </>}
                    </div>
                }
                <div className="mt-4 mb-5">
                    {renderPaginationControls()}
                </div>
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
        const pageSize = paginationConfig.pageSize;
        const { totalPages, totalMessages } = pageInfo;

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

        const activeBgColor: string = " bg-gradient-to-r from-blue-500 to-violet-500";

        // Generate core page buttons
        const corePageButtons: Array<JSX.Element> = [];
        for (let i = startPage; i <= endPage; i++) {
            corePageButtons.push(
                <button key={i} className={`w-[38px] ${i === pageNumber ? activeBgColor : " bg-zinc-800"}`}
                onClick={() => handlePageChange(i)}>
                    {i}
                </button>
            );
        }

        // Generate page info text
        const startNumber = (pageNumber - 1) * paginationConfig.pageSize + 1;
        const endNumber = Math.min(startNumber + pageSize - 1, totalMessages);
        const pageInfoText = `${startNumber}-${endNumber} of ${totalMessages}`;

        return (<>
            <div className="flex">
                <div className="pagination pagination-compact mx-auto relative">
                    <button className="bg-zinc-800 w-[38px] py-[10px] rounded-l-xl disabled:opacity-50" 
                    onClick={() => handlePageChange(pageNumber - 1)} disabled={pageNumber === 1}>
                        <Image className="mx-auto" src="/chevron-left.svg" alt="<" width={18} height={18} />
                    </button>
                    {totalPages > 0 && 
                        <button className={`w-[38px] ${pageNumber === 1 ? activeBgColor : " bg-zinc-800"}`} 
                        onClick={() => handlePageChange(1)}>
                            1
                        </button>
                    }
                    {!nearStart && <button disabled className="w-[38px] bg-zinc-800 opacity-50">...</button>}
                    {corePageButtons}
                    {!nearEnd && <button disabled className="w-[38px] bg-zinc-800 opacity-50">...</button>}
                    {totalPages > 1 &&
                        <button className={`w-[38px] ${pageNumber === totalPages ? activeBgColor : " bg-zinc-800"}`} 
                        onClick={() => handlePageChange(totalPages)}>
                            {totalPages}
                        </button>
                    }
                    <button className="w-[38px] rounded-r-xl bg-zinc-800 disabled:opacity-50" 
                    onClick={() => handlePageChange(pageNumber + 1)} disabled={pageNumber >= totalPages}>
                        <Image className="mx-auto rotate-180" src="/chevron-left.svg" alt=">" width={18} height={18} />
                    </button>
                    {messagesLoading && <div className="spinner-circle absolute w-5 h-5 lg:w-7 lg:h-7 
                    right-[-28px] lg:right-[-38px] top-[50%] translate-y-[-50%]" />}
                </div>
                
            </div>
            <div className="w-full mt-2 text-center text-xs text-zinc-700 font-extralight noselect">
                {pageInfoText}
            </div>
        </>);
    };

    const renderQueryFilterControls = () => {
        return (
            <fieldset className="px-[6px] lg:px-3 pb-3 pt-1 border border-zinc-900 w-full rounded-lg lg:w-auto">
                <legend className="text-zinc-300 ml-1 noselect">Filters</legend>
                <div className="flex mx">
                    {renderParticipantFilterDropdown()}
                    <div className="self-center mx-[6px] lg:mx-2 text-lg text-zinc-600">
                        in
                    </div>
                    {renderQuizFilterDropdown()}
                </div>
            </fieldset>
        );
    }

    const renderParticipantFilterDropdown = () => {
        const selectionChanged = (e: React.ChangeEvent<HTMLSelectElement>) => {
            const selectedValue = e.target.value;
            setFilterParticipantId(selectedValue === "" ? null : Number(selectedValue));
        }

        if (stableDataLoading) return <div className="skeleton w-[150px] lg:w-48 h-10 rounded-xl" />;
        
        if (isMobile) {
            const getSelectedParticipantName = () => {
                if (filterParticipantId === null) return "Everyone";
                const participant = participants.find(p => p.id === filterParticipantId);
                return participant ? participant.name : "Everyone";
            }

            return (
                <select className="select relative pr-7 text-ellipsis overflow-hidden text-sm bg-zinc-950 border-zinc-700 border-[1px]"
                onMouseDown={(e) => {e.preventDefault()}} onClick={() => toggleModal('participant-modal')}>
                    <option>{getSelectedParticipantName()}</option>
                </select>
            );
        }
        return (
            <select className="select sm:w-48 pr-7 bg-zinc-950 border-zinc-700 border-[1px] text-ellipsis overflow-hidden
            transition duration-300 ease-in-out hover:border-zinc-400" 
            onChange={selectionChanged} defaultValue={participantId ? participantId : ""} >
                <option value={""}>Everyone</option>
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

        if (stableDataLoading) return <div className="skeleton w-[150px] lg:w-48 h-10 rounded-xl" />;

        if (isMobile) {
            const getSelectedQuizName = () => {
                if (filterQuizId === null) return "Group Chat";
                const quiz = quizzes.find(q => q.id === filterQuizId);
                return quiz ? quiz.quizName : "Group Chat";
            }

            return (
                <select className="select relative pr-7 text-ellipsis overflow-hidden text-sm bg-zinc-950 border-zinc-700 border-[1px]"
                onMouseDown={(e) => {e.preventDefault()}} onClick={() => toggleModal('quiz-modal')}>
                    <option>{getSelectedQuizName()}</option>
                </select>
            );
        }
        return (
            <select className="select sm:w-48 pr-7 bg-zinc-950 border-zinc-700 border-[1px] text-ellipsis overflow-hidden 
            transition duration-300 ease-in-out hover:border-zinc-400" 
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

    const renderSelectionActionsMobile = () => {
        const active = selectedMessageIds.length > 0;
        const doAnimate = doAnimateSelectionMenu;

        const determineAnimationClass = () => {
            if (doAnimate) {
                if (active) {
                    return " animate-selectionActionsEntering";
                } else {
                    return " animate-selectionActionsExiting";
                }
            }
            return "";
        }

        return(
            <div className={`fixed flex top-navbar left-0 right-0 translate-y-[-100%] pt-1 bg-zinc-950/90 backdrop-blur-sm border-b border-zinc-800 z-40
            ${determineAnimationClass()}`}>
                <div className="self-center ml-4 text-lg font-semibold">
                    {selectedMessageIds.length} Selected
                </div>
                <div className="ml-auto mr-2 py-2">
                    {!filterQuizId &&
                        <button className="btn btn-solid bg-zinc-800 mr-1" onClick={() => toggleModal('delete-modal')}>
                            Delete
                        </button>
                    }
                    <button className="btn bg-blue-600" onClick={() => toggleModal('add-remove-modal')}>
                        {filterQuizId ? "Remove from Quiz" : "Add to Quiz"}
                    </button>
                </div>
            </div>
        );
    }

    // =============== MODALS =================

    const renderAddRemoveQuizMessagesModal = () => {
        const singular = selectedMessageIds.length === 1;

        const modalTitle: string = isMobile
            ? `${filterQuizId ? "Removing" : "Adding"} ${selectedMessageIds.length} Message${singular ? "" : "s"}`
            : `${filterQuizId ? "Remove" : "Add"} ${selectedMessageIds.length} Message${singular ? "" : "s"} 
               ${filterQuizId ? " from" : " to"} Quiz`;
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
                <div className="mx-auto mb-4 text-lg text-zinc-500 font-medium">
                    Are you sure?
                </div>
                <div className="flex gap-2 px-6 mb-4">
                    <button className="btn grow bg-zinc-800" onClick={() => toggleModal("add-remove-modal")}>
                        Cancel
                    </button>
                    <button className="btn bg-red-4 grow" onClick={() => updateMessagesInQuiz(filterQuizId)}>
                        Remove
                    </button>
                </div>
            </>);
        } else {
            modalContent = (<>
                <div className="mx-6 mb-4 max-h-[500px] px-2 overflow-y-scroll">
                    <div className="flex flex-col gap-2 py-1">
                        {renderQuizModalButtons(false)}
                    </div>
                </div>
            </>);
        }

        return (<Modal domId="add-remove-modal" title={modalTitle}>{modalContent}</Modal>);
    }

    const renderDeleteMessagesModal = () => {
        const singular: boolean = selectedMessageIds.length === 1;

        const modalTitle: string = `Delete ${selectedMessageIds.length} Message${singular ? "" : "s"}`;
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
                    <div className="mb-2 text-2xl text-zinc-400">
                        Are you sure?
                    </div>
                    <div className="mb-2 px-4 max-w-[300px] text-sm text-zinc-500 font-light">
                        Deleting {singular ? "a message" : "messages"} from the group chat will also remove 
                        {singular ? " it" : " them"} from all quizzes.
                    </div>
                    <div className="text-zinc-400 font-semibold">
                        This cannot be undone.
                    </div>
                </div>
                <div className="flex gap-2 px-6 mb-4">
                    <button className="btn grow bg-black border border-zinc-800" onClick={() => toggleModal("delete-modal")}>
                        Cancel
                    </button>
                    <button className="btn grow bg-black border border-zinc-800" onClick={() => deleteSelectedMessages()}>
                        Delete
                    </button>
                </div>
            </>);

        return (<Modal domId="delete-modal" title={modalTitle}>{modalContent}</Modal>);
    }

    const renderMobileParticipantFilterModal = () => {
        const modalTitle: string = "Participant Filter";
        const modalContent: JSX.Element = messagesLoading
        ? (<>
            <div className="mx-auto mb-4 text-lg text-gray-11">
                    Applying Filter...
            </div>
            <div className="flex justify-center mb-6">
                <div className="spinner-circle w-10 h-10" />
            </div>
        </>)
        : (<>
            <button className="btn bg-blue-600 mx-6 mb-2"
            onClick={() => setFilterParticipantId(null)}>
                Everyone
            </button>
            <div className="w-full text-center text-sm text-gray-9 mb-2">
                Or select a participant:
            </div>
            <div className="mx-6 mb-4 max-h-[350px] px-5 overflow-y-scroll">
                <div className="flex flex-col gap-2">
                    {renderParticipantModalButtons()}
                </div>
            </div>
        </>);

        return (<Modal domId="participant-modal" title={modalTitle}>{modalContent}</Modal>);
    }

    const renderMobileQuizFilterModal = () => {
        const modalTitle: string = "Quiz Filter";
        const modalContent: JSX.Element = messagesLoading
        ? (<>
            <div className="mx-auto mb-4 text-lg text-gray-11">
                    Applying Filter...
            </div>
            <div className="flex justify-center mb-6">
                <div className="spinner-circle w-10 h-10" />
            </div>
        </>)
        : (<>
            <button className="btn bg-blue-600 mx-6 mb-3 mt-1"
            onClick={() => setFilterQuizId(null)}>
                Group Chat
            </button>
            <div className="w-full text-center text-sm text-zinc-500 mb-2">
                Or view quiz messages:
            </div>
            <div className="mx-6 mb-4 max-h-[350px] px-2 overflow-y-scroll">
                <div className="flex flex-col gap-2 py-1">
                    {renderQuizModalButtons(true)}
                </div>
            </div>
        </>);

        return (<Modal domId="quiz-modal" title={modalTitle}>{modalContent}</Modal>);
    }

    const renderQuizModalButtons = (filterModal: boolean) => {
        if (quizzes.length === 0) {
            return (
                <div className="w-64 mb-4 py-6 mx-auto border-dashed border-2 border-zinc-800 rounded-xl text-zinc-400 text-center">
                    No quizzes found
                </div>
            );
        }

        return quizzes.map((quiz: TimeAttackQuiz | SurvivalQuiz, index: number) => {
            return (
                <button key={quiz.id} className="bg-black pt-2 pb-3 rounded-2xl border border-zinc-800 transition duration-300 ease-in-out lg:hover:bg-gray-3"
                onClick={() => {
                    if (filterModal) {
                        setFilterQuizId(quiz.id);
                    } else {
                        updateMessagesInQuiz(quiz.id);
                    }
                }}>
                    <div className="flex flex-col items-center">
                        <div className="lg:text-xl">
                            {quiz.quizName}
                        </div>
                        <div className="mt-[4px]">
                            {renderQuizTypeBadge(quiz.type, true)}
                        </div>
                    </div>
                </button>
            );
        });
    }

    const renderParticipantModalButtons = () => {
        return participants.map((participant: Participant) => {
            return (
                <button key={participant.id} className="btn btn-sm bg-zinc-900"
                onClick={() => setFilterParticipantId(participant.id)}>
                    {participant.name}
                </button>
            );
        });
    }

    const renderMessageResponseAlert = () => {
        const positioning: string = isMobile
            ? "fixed bottom-4 left-[50%] translate-x-[-50%]"
            : "ml-auto self-center";
        return renderResponseAlert(responseStatus, positioning);
    }

    // =============== MAIN RENDER =================

    return (<>
        <div className="navbar h-navbar w-full" /> {/* Navbar spacer */}
        <main className="page-content flex flex-col overflow-y-scroll items-center justify-between">
            <div className="relative w-[97%] lg:w-[90%] xl:w-[80%] 2xl:w-[70%] 3xl:w-[50%] mt-5">
                <div className="w-full p-2 mb-3 lg:p-8 bg-[#050507] rounded-xl border border-zinc-800 overflow-x-hidden">
                    <div className="flex mb-2">
                        <div className="text-3xl mb-3 lg:mb-5 mt-4 lg:mt-0 mx-auto lg:mx-0 text-center lg:text-left font-semibold noselect">
                            {stableDataLoading ? "..." : groupChatName}
                        </div>
                        {/* HTTP Response alert */}
                        {!isMobile && renderMessageResponseAlert()}
                    </div>
                    <div className="flex mb-4">
                        {renderQueryFilterControls()}
                        {/* Desktop selection action controls */}
                        {!isMobile &&
                            <fieldset className="ml-auto px-3 pb-3 pt-1 border border-zinc-900 rounded-lg ">
                                <legend className={`text-zinc-400 transition duration-300 ease-in-out noselect
                                ${selectedMessageIds.length === 0 ? "opacity-25" : ""}`}>
                                    Selection Actions
                                </legend>
                                {!filterQuizId &&
                                    <button className="btn mr-2 font-semibold transition duration-300 ease-in-out bg-zinc-900
                                    disabled:opacity-25 hover:bg-zinc-700" 
                                    disabled={selectedMessageIds.length === 0} onClick={() => toggleModal("delete-modal")}>
                                        Delete
                                    </button>
                                }
                                <button className="btn transition duration-300 ease-in-out bg-zinc-900 disabled:opacity-25 hover:bg-zinc-700" 
                                disabled={selectedMessageIds.length === 0} onClick={() => toggleModal("add-remove-modal")}>
                                    {filterQuizId ? "Remove from Quiz" : "Add to Quiz"}
                                </button>
                            </fieldset>
                        }
                    </div>
                    {renderMessagesTable()}
                </div>
            </div>
            {/* FIXED POSITION ELEMENTS */}
            {isMobile && renderSelectionActionsMobile()}
            {/* Modals */}
            {renderAddRemoveQuizMessagesModal()}
            {!filterQuizId && renderDeleteMessagesModal()}
            {isMobile && renderMobileParticipantFilterModal()}
            {isMobile && renderMobileQuizFilterModal()}
            {/* HTTP Response alert  */}
            {isMobile && renderMessageResponseAlert()}
        </main>
    </>);
}