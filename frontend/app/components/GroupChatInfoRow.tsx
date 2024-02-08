import { GroupChatInfo } from "../interfaces"
import { formatDateLong, renderQuizRows, toggleModal } from "../utilities/miscFunctions";
import CreateQuizModal from "./CreateQuizModal";

import Link from "next/link";

// This component renders the information for a group chat as an accordion.
// It displays the group chat name, upload date, number of participants, and number of messages.
// It also renders a list of quizzes for the group chat, including relevant actions for each quiz.

// The group chat itself also has several actions, including generating a new quiz, viewing messages,
// and managing participants.

// The accoridian is implemented using Ripple-UI tailwind classes and the checkbox hack.

interface GroupChatInfoRowProps {
    groupChat: GroupChatInfo;
    setReloadCounter: React.Dispatch<React.SetStateAction<number>>;
}
export default function GroupChatInfoRow({ groupChat, setReloadCounter }: GroupChatInfoRowProps) {

    return (<>
        <div className="accordion">
            <input type="checkbox" id={`toggle-${groupChat.id}`} className="accordion-toggle" />
            <label htmlFor={`toggle-${groupChat.id}`} className="accordion-title bg-[#050507]">
                <span className="font-light text-lg sm:text-xl">{groupChat.groupChatName}</span>
                <div className="mt-1">
                    <span className="badge badge-outline mr-2">
                        <span className="font-normal mr-2">Uploaded:</span> {formatDateLong(groupChat.uploadDate)}
                    </span>
                    <span className="badge badge-outline mr-2">
                        <span className="font-normal mr-2">Participants:</span> {groupChat.numParticipants}
                    </span>
                    <span className="badge badge-outline">
                        <span className="font-normal mr-2">Messages:</span> {groupChat.numMessages}
                    </span>
                </div>
            </label>
            <span className="accordion-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                    <path d="M13.293 6.293 7.586 12l5.707 5.707 1.414-1.414L10.414 12l4.293-4.293z" />
                </svg>
            </span>
            <div className="accordion-content text-content2 bg-[#070606b9]">
                <div className="min-h-0">
                    <div className="mb-3 text-lg text-zinc-300 font-light">
                        Quizzes for this chat:
                    </div>
                    {renderQuizRows(groupChat, setReloadCounter)}
                    <div className="sm:flex sm:flex-grow sm:items-end justify-center lg:justify-start mt-6 sm:mt-3">
                        <button className="btn sm:btn-sm mr-2 w-full sm:w-auto bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500
                        text-base sm:text-sm font-medium rounded-lg px-4 relative bottom-[1px]"
                        onClick={() => toggleModal(`create-quiz-modal-${groupChat.id}`)}>
                            Create New Quiz
                        </button>
                        <div className="flex items-end">
                            <Link href={`/messages/${groupChat.id}`} className="grow sm:flex-none mr-2">
                                <div className="py-[1px] px-[2px] mt-2 sm:mt-0 rounded-[9px] sm:rounded-[13px] bg-gradient-to-r from-blue-500 to-indigo-500
                                md:from-blue-500 md:via-indigo-500 md:to-purple-500">
                                    <button className="bg-black btn btn-sm w-full rounded-lg sm:rounded-xl">
                                        View Messages
                                    </button>
                                </div>
                            </Link>
                            <Link href={`/participants/${groupChat.id}`}>
                                <div className="py-[1px] px-[2px] mt-2 sm:mt-0 rounded-[9px] sm:rounded-[13px] bg-gradient-to-r from-indigo-500 to-purple-400
                                md:from-blue-500 md:via-indigo-500 md:to-purple-500">
                                    <button className="bg-black btn btn-sm w-full rounded-lg sm:rounded-xl">
                                        Manage Participants
                                    </button>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        {/* Modal for creating a new quiz */}
        <CreateQuizModal groupChatId={groupChat.id} groupChatName={groupChat.groupChatName} 
        modalDomId={`create-quiz-modal-${groupChat.id}`} setReloadCounter={setReloadCounter} />
    </>);
}