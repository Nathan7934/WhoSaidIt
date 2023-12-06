import usePostGroupChatUpload from "../hooks/api_access/group_chats/usePostGroupChatUpload";
import Modal from "./Modal";
import SuccessIcon from "./icons/SuccessIcon";
import AlertIcon from "./icons/AlertIcon";
import InfoIcon from "./icons/InfoIcon";
import { toggleModal, isModalOpen } from "../utilities/miscFunctions";
import { ResponseStatus } from "../interfaces";

import { useState } from "react";

interface GroupChatUploadModalProps {
    userId: number;
    modalDomId: string;
    setReloadCounter: React.Dispatch<React.SetStateAction<number>>;
}
export default function GroupChatUploadModal({ userId, modalDomId, setReloadCounter }: GroupChatUploadModalProps) {

    // ----------- Hooks ------------------
    const postGroupChatUpload = usePostGroupChatUpload();

    // ----------- State (Data) -----------
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [groupChatName, setGroupChatName] = useState<string>("");
    const [minChars, setMinChars] = useState<number>(100);

    // ----------- State (UI) -------------
    const [uploading, setUploading] = useState<boolean>(false);
    const [responseStatus, setResponseStatus] = useState<ResponseStatus>({ message: "", success: false, doAnimate: false });
    const [nameMissing, setNameMissing] = useState<boolean>(false);
    const [fileMissing, setFileMissing] = useState<boolean>(false);

    // ----------- Data Helpers -----------
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        } else {
            setSelectedFile(null);
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        switch (e.target.name) {
            case "groupChatName":
                setGroupChatName(e.target.value);
                break;
            case "minChars":
                const minChars: number = parseInt(e.target.value);
                if (minChars < 5) {
                    setMinChars(5);
                } else if (minChars > 999) {
                    setMinChars(999);
                } else {
                    setMinChars(minChars);
                }
                break;
        }
    }

    const handleUpload = async () => {
        if (!selectedFile) {
            setFileMissing(true);
            return;
        }
        if (groupChatName.length === 0) {
            setNameMissing(true);
            return;
        }
        
        setUploading(true);
        const error: string | null = await postGroupChatUpload(userId, selectedFile, groupChatName, minChars);
        if (!error) {
            setResponseStatus({
                message: "Group chat uploaded successfully",
                success: true,
                doAnimate: true,
            });
        } else {
            console.error("Error uploading group chat: ", error);
            setResponseStatus({
                message: "Error uploading group chat",
                success: false,
                doAnimate: true,
            });
        }

        // Display the response message for 4 seconds, then close the modal and re-fetch the data.
        setTimeout(() => {
            if (isModalOpen(modalDomId)) {
                toggleModal(modalDomId);
            }    
            setResponseStatus({
                message: "",
                success: false,
                doAnimate: false,
            });
            setGroupChatName("");
            if (!error) {
                setTimeout(() => {
                    setReloadCounter(c => c + 1) // Reload the parent page to display the new group chat after 0.5s.
                }, 500);
            }
        }, 4000);

        setUploading(false);
    }

    // =============== RENDER FUNCTIONS ===============

    const renderResponseAlert = () => {
        const success: boolean = responseStatus.success;
        return (
            <div className="my-6 sm:my-12">
                <div className={`mx-auto mb-[2px] text-lg sm:text-xl text-center ${success ? "text-green-12" : "text-blue-12"}`}>
                    {responseStatus.message}
                </div>
                <div className="flex justify-center animate__animated animate__fadeIn">
                    {success
                        ? <SuccessIcon className="w-12 h-12 sm:w-14 sm:h-14" />
                        : <AlertIcon className="w-12 h-12 sm:w-14 sm:h-14" />
                    }
                </div>
            </div>
        )
    }

    const renderMinCharsInfoModal = () => {
        return (
            <Modal domId="min-chars-info-modal" title="Minimum Characters" maxWidth="400px" margin="24px" darkOverlay>
                <div className="mx-4 mb-4">
                    <div className="text-gray-11 mb-4">
                        This field sets the minimum number of characters that a message must contain
                        in order to be used. This is to prevent short messages like "ok" from being included.
                    </div>
                    <div className="text-gray-11 mb-4">
                        For example, if you set the minimum number of characters to 100, then only messages with 100 or more
                        characters will be included in the quiz.
                    </div>
                    <div className="mb-1">
                        The default value is 100.
                    </div>
                </div>
            </Modal>
        );
    }
            
    // =============== MAIN RENDER ===============

    let modalContent: JSX.Element;
    if (responseStatus.doAnimate) {
        modalContent = renderResponseAlert();
    } else if (uploading) {
        modalContent = (
            <div className="my-6 sm:my-12">
                <div className="mx-auto mb-2 text-lg sm:text-xl text-center text-gray-11">
                        Upload in Progress...
                </div>
                <div className="flex justify-center">
                    <div className="spinner-circle w-10 h-10 sm:w-12 sm:h-12" />
                </div>
            </div>
        );
    } else {
        modalContent = (<>
            <div className="text-gray-11 mb-4">
                Export your group chat from WhatsApp as a text file and upload it here.
                Once you have uploaded a group chat, you can create quizzes for it.
            </div>
            <div className="mb-4">
                <a className="text-lg text-primary font-semibold" 
                href="https://faq.whatsapp.com/1180414079177245/?helpref=uf_share" target="_blank">
                    How to export your WhatsApp chat history
                </a>
            </div>
            <div className="mb-3 sm:mb-6 text-gray-11">
                Make sure to select <span className="text-white font-bold">"Without Media"</span> when exporting your chat.
            </div>
            <div className="sm:hidden mb-6 text-gray-9 text-sm">
                iPhone users may prefer to email their chat history to themselves and upload it using a PC.
            </div>
            <div className="flex gap-3 mb-5 sm:mb-4 pt-5 border-t border-gray-1">
                <div className="w-2/3">
                    <label className="text-sm">Group Chat Name</label>
                    <input name="groupChatName" className="input mt-[2px] max-w-none" type="text" placeholder="Enter name"
                    value={groupChatName} onChange={handleInputChange}/>
                </div>
                <div className="w-1/3 flex-col">
                    <label className="text-sm">Min. Chars.</label>
                    <div className="flex">
                        <input name="minChars" className="input mt-[2px]" type="number" 
                        value={`${minChars}`} onChange={handleInputChange}/>
                        <button className="self-center" onClick={() => toggleModal("min-chars-info-modal")}>
                            <InfoIcon className="w-6 h-6 ml-[6px] text-blue-7 transition duration-400 sm:hover:text-blue-9" />
                        </button>
                    </div>
                </div>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
                <input className="input-file input-file-primary" type="file" accept=".txt" onChange={handleFileChange} />
                <button className="grow btn btn-primary max-w-[320px]" onClick={handleUpload}>
                    Upload
                </button>
            </div>
        </>);
    }

    return(<>
        <Modal domId={modalDomId} title="Upload Group Chat" maxWidth={uploading ? "400px" : "575px"} margin="8px" darkOverlay>
            <div className="mx-4 mb-4">
                {modalContent}
            </div>
        </Modal>
        {/* Min Chars Explanation Modal */}
        {renderMinCharsInfoModal()}
    </>);
}