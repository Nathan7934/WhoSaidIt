import { GroupChatInfo } from "../interfaces"
import { formatDateLong, renderQuizRows } from "../utilities/miscFunctions";

import Link from "next/link";

// This component renders the information for a group chat as an accordion.
// It displays the group chat name, upload date, number of participants, and number of messages.
// It also renders a list of quizzes for the group chat, including relevant actions for each quiz.

// The group chat itself also has several actions, including generating a new quiz, viewing messages,
// and managing participants.

// The accoridian is implemented using Ripple-UI tailwind classes and the checkbox hack.

export default function GroupChatInfoRow({ groupChat }: { groupChat: GroupChatInfo}) {

    return (
        <div className="accordion">
            <input type="checkbox" id={`toggle-${groupChat.id}`} className="accordion-toggle" />
            <label htmlFor={`toggle-${groupChat.id}`} className="accordion-title bg-zinc-950">
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
            <div className="accordion-content text-content2 bg-[#09090bb9]">
                <div className="min-h-0">
                    <div className="mb-3 text-lg text-gray-9 font-light">
                        Quizzes for this chat:
                    </div>
                    {renderQuizRows(groupChat)}
                    <div className="sm:flex sm:flex-grow sm:items-end mt-6 sm:mt-3">
                        <button className="btn btn-primary btn-sm mr-2 w-full sm:w-auto">Create New Quiz</button>
                        <div className="flex">
                            <Link href={`/messages/${groupChat.id}`} className="grow sm:flex-none mr-2">
                                <button className="btn btn-sm mt-2 sm:mt-0 w-full">View Messages</button>
                            </Link>
                            <Link href={`/participants/${groupChat.id}`}>
                                <button className="btn btn-sm mt-2 sm:mt-0">Manage Participants</button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}