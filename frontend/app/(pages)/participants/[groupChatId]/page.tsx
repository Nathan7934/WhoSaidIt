"use client";

import useGetGroupChat from "@/app/hooks/api_access/group_chats/useGetGroupChat";
import useGetParticipants from "@/app/hooks/api_access/participants/useGetParticipants";
import usePatchParticipantName from "@/app/hooks/api_access/participants/usePatchParticipantName";
import useDeleteParticipant from "@/app/hooks/api_access/participants/useDeleteParticipant";

import EditIcon from "@/app/components/icons/EditIcon";
import CheckmarkIcon from "@/app/components/icons/CheckmarkIcon";
import MessagesIcon from "@/app/components/icons/MessagesIcon";
import DeleteIcon from "@/app/components/icons/DeleteIcon";

import { GroupChat, Participant, ResponseStatus } from "@/app/interfaces";
import { NAVBAR_HEIGHT } from "@/app/constants";
import Modal from "@/app/components/modals/Modal";
import { toggleModal, renderResponseAlert } from "@/app/utilities/miscFunctions";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ParticipantEdit {
    id: number;
    name: string;
}

export default function Participants({ params }: { params: { groupChatId: string }}) {
    
    // NextJS Route parameters
    const groupChatId = Number(params.groupChatId);

    // ----------- Hooks ------------------
    const router = useRouter();

    // API access hooks
    const getGroupChat = useGetGroupChat();
    const getParticipants = useGetParticipants();
    const patchParticipantName = usePatchParticipantName();
    const deleteParticipant = useDeleteParticipant();

    // ----------- State (Data) -----------
    const [groupChatName, setGroupChatName] = useState<string>("");
    const [participants, setParticipants] = useState<Array<Participant>>([]);
    const [editingParticipant, setEditingParticipant] = useState<ParticipantEdit | null>(null);
    const [deletingParticipant, setDeletingParticipant] = useState<Participant | null>(null);

    // ----------- State (UI) -------------
    const [loading, setLoading] = useState<boolean>(true);
    const [alteringParticipant, setAlteringParticipant] = useState<boolean>(false);
    const [listMaxHeight, setListMaxHeight] = useState<string>('auto');

    const [responseStatus, setResponseStatus] = useState<ResponseStatus>({ message: "", success: false, doAnimate: false });
    
    // UI DOM references
    const titleRef = useRef<HTMLDivElement>(null);
    const blurbRef = useRef<HTMLDivElement>(null);
    const nameInputRef = useRef<HTMLInputElement>(null);

    // ----------- Data Retrieval ---------
    useEffect(() => {
        const getPageData = async () => {
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
        calculateListMaxHeight();
        window.addEventListener("resize", calculateListMaxHeight);
        return () => {
            window.removeEventListener("resize", calculateListMaxHeight);
        }
    }, []);

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

    // Focus the input field when editing a participant's name
    useEffect(() => {
        if (editingParticipant && nameInputRef.current) {
            nameInputRef.current.focus();  // Focus the input
        }
    }, [editingParticipant]);

    // ----------- Data helper functions ---------

    const updateParticipantName = async () => {
        if (!editingParticipant) return; // Should never happen

        // If the name has not changed, do nothing
        if (editingParticipant.name === participants.find((participant: Participant) => {
            return participant.id === editingParticipant?.id;
        })?.name) {
            setEditingParticipant(null);
            return;
        }
        
        // If the name is empty, do nothing and show an error
        if (editingParticipant.name === "") {
            setResponseStatus({
                message: "Name cannot be empty",
                success: false,
                doAnimate: true
            });
            return;
        }
        
        setAlteringParticipant(true);
        const error: string | null = await patchParticipantName(editingParticipant.id, editingParticipant.name);
        if (!error) {
            const updatedParticipants = participants.map((participant: Participant) => {
                if (participant.id === editingParticipant.id) {
                    return { ...participant, name: editingParticipant.name };
                }
                return participant;
            });
            setParticipants(updatedParticipants);
            setResponseStatus({ 
                message: "Name updated successfully", 
                success: true, 
                doAnimate: true 
            });
        } else {
            console.error("Error updating name");
            setResponseStatus({
                message: error,
                success: false,
                doAnimate: true
            });
        }
        setEditingParticipant(null);
        setAlteringParticipant(false);
    }

    const deleteSelectedParticipant = async () => {
        if (!deletingParticipant) return; // Should never happen
        setAlteringParticipant(true);

        const error: string | null = await deleteParticipant(deletingParticipant.id);
        if (!error) {
            const updatedParticipants = participants.filter((participant: Participant) => {
                return participant.id !== deletingParticipant.id;
            });
            setParticipants(updatedParticipants);
            setResponseStatus({ 
                message: "Participant deleted successfully", 
                success: true, 
                doAnimate: true 
            });
        } else {
            console.error("Error deleting participant");
            setResponseStatus({
                message: error,
                success: false,
                doAnimate: true
            });
        }
        toggleModal("delete-modal");
        setDeletingParticipant(null);
        setAlteringParticipant(false);
    }

    // =============== RENDER FUNCTIONS =================

    const renderParticipantRows = () => {
        return participants.map((participant: Participant, index: number) => {
            return (
                <div className="my-[6px] drop-shadow-md p-[1px] rounded-md bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900">
                    <div key={index} className={`flex items-center justify-between w-full py-4 sm:py-3 px-3 
                    rounded-md bg-black`}>
                        <div className="flex items-center">
                            {renderParticipantEditableName(participant)}
                        </div>
                        <div className="flex items-center">
                            <Link href={`/messages/${groupChatId}/nfq/${participant.id}`} 
                            className="group flex items-center hover:cursor-pointer">
                                <div className="ml-1 w-7 text-right text-sm text-zinc-400 font-light 
                                transition duration-400 ease-in-out sm:group-hover:text-gray-10">
                                    ({participant.numberOfMessages})
                                </div>
                                <MessagesIcon className="ml-1 w-6 h-6 text-zinc-400 transition duration-400 
                                ease-in-out sm:group-hover:text-gray-11" />
                            </Link>
                            <button onClick={() => {
                                setDeletingParticipant(participant);
                                toggleModal("delete-modal");
                            }}>
                                <DeleteIcon className="relative bottom-[1px] ml-2 w-[22px] h-[22px] text-zinc-400 
                                transition duration-400 ease-in-out sm:hover:text-red-5 hover:cursor-pointer" />
                            </button>
                        </div>
                    </div>
                </div>
            );
        });
    }

    const renderParticipantEditableName = (participant: Participant) => {
  
        const editClicked = (participant: Participant) => {
            if (editingParticipant?.id === participant.id) {
                setEditingParticipant(null);
            } else {
                setEditingParticipant({ id: participant.id, name: participant.name });
            }
        }

        const editFieldChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
            if (!editingParticipant) return;
            setEditingParticipant({ ...editingParticipant, name: event.target.value });
        }

        if (editingParticipant?.id === participant.id) {
            return (<>
                <button onClick={() => updateParticipantName()} disabled={alteringParticipant}>
                    {alteringParticipant
                        ? <div className="spinner-simple w-5 h-5 mr-[6px]" />
                        : <CheckmarkIcon className="relative bottom-[1px] w-5 h-5 mr-[6px] text-blue-700" />
                    }
                </button>
                <form className="mr-1" 
                onSubmit={(e) => {
                    e.preventDefault();
                    updateParticipantName();
                }}>
                    <input ref={nameInputRef} className="input border-blue-700" value={editingParticipant.name} onChange={editFieldChanged} />
                </form>
            </>);
        }
        return (<>
            <button onClick={() => editClicked(participant)}>
                <EditIcon className="relative bottom-[1px] w-5 h-5 mr-3 text-zinc-400 transition 
                duration-400 ease-in-out sm:hover:text-gray-11 hover:cursor-pointer" />
            </button>
            <div className="sm:text-lg font-medium sm:font-normal overflow-x-hidden text-ellipsis whitespace-nowrap">
                {participant.name}
            </div>
        </>);
    }

    const renderDeleteParticipantModal = () => {
        const modalTitle:string = `Delete ${deletingParticipant?.name || ""}`;
        const modalContent: JSX.Element = alteringParticipant
            ? (<>
                <div className="mx-auto mb-4 text-lg text-gray-11">
                    Deleting Participant...
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
                        Deleting a participant will also delete all of their messages.
                    </div>
                    <div className="text-zinc-400 font-semibold">
                        This cannot be undone.
                    </div>
                </div>
                <div className="flex gap-2 px-6 mb-4">
                    <button className="btn bg-black border border-zinc-800 grow" onClick={() => toggleModal("delete-modal")}>
                        Cancel
                    </button>
                    <button className="btn bg-black border border-zinc-800 grow" onClick={() => deleteSelectedParticipant()}>
                        Delete
                    </button>
                </div>
            </>);
        return (<Modal domId="delete-modal" title={modalTitle} >{modalContent}</Modal>);
    }

    const renderParticipantResponseAlert = () => {
        const positioning = "fixed bottom-12 left-[50%] translate-x-[-50%]";
        return renderResponseAlert(responseStatus, positioning);
    }

    // =============== HELPER FUNCTIONS ===============

    // Determines the maximum height of the list element, so that it does not overflow the screen.
    const calculateListMaxHeight = () => {
        const titleHeight = titleRef.current?.clientHeight || 0;
        const blurbHeight = blurbRef.current?.clientHeight || 0;
        const remainingStaticHeight = 182 + 24 + NAVBAR_HEIGHT; // 182px for the static content, 24px for margins
        const maxHeight = window.innerHeight - titleHeight - blurbHeight - remainingStaticHeight;
        setListMaxHeight(`${Math.min(600, maxHeight)}px`);
    }

    // =============== MAIN RENDER =================

    return (<>
        <div className="w-full h-navbar" /> {/* Navbar spacer */}
        <main className="relative flex flex-col items-center justify-between h-content">
            <div className="absolute top-[50%] translate-y-[-50%] w-[97%] md:w-[80%] lg:w-[70%] xl:w-[60%] 2xl:w-[50%] 3xl:w-[40%]">
                <div className="flex flex-col w-full p-2 sm:p-8 bg-[#050507] rounded-xl border border-zinc-800 overflow-hidden">
                    <div className="text-3xl sm:text-4xl mb-6 sm:mb-5 mt-4 sm:mt-0 mx-auto sm:mx-0 text-center font-semibold">
                        {/* <span className="hidden sm:inline-block font-normal mr-3">Participants for<br/></span>  */}
                        {loading ? <div className=" inline-block ml-3 skeleton w-48 h-8 rounded-xl" /> : <span> {groupChatName}</span>}
                    </div>
                    <div className="hidden sm:block text-zinc-400 mb-6 px-1 max-w-[650px] text-center mx-auto">
                        Here you can see the participants of a group chat, edit their names, view messages they've sent, or delete them and all their messages
                        from the group chat.
                    </div>
                    <div className="p-[1px] rounded-t-md bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500">
                        <div className="w-full py-2 bg-black text-lg rounded-t-md text-center">
                            Manage Participants
                        </div>
                    </div>
                    {loading 
                        ? <div className={`skeleton w-full h-[350px]`} />
                        : <div className="px-1 overflow-y-scroll" style={{maxHeight: listMaxHeight}}>
                            {renderParticipantRows()}
                        </div>
                    }
                    <div className="p-[1px] mb-3 rounded-b-md bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500">
                        <div className="w-full py-[6px] bg-black rounded-b-md border border-zinc-800 text-center text-sm" >
                            Total: 
                            {loading 
                                ? <div className="relative top-[1px] inline-block skeleton ml-1 w-5 h-3 rounded-lg" /> 
                                : <span> {participants.length}</span>
                            }
                        </div>
                    </div>
                    
                </div>
            </div>
            {/* FIXED POSITION ELEMENTS */}
            {renderDeleteParticipantModal()}
            {renderParticipantResponseAlert()}
        </main>
    </>);
}