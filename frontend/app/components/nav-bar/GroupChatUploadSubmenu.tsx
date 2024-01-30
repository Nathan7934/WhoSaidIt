import usePostGroupChatUpload from "@/app/hooks/api_access/group_chats/usePostGroupChatUpload";
import useNavBar from "@/app/hooks/context_imports/useNavBar";
import Modal from "../Modal";
import InfoIcon from "../icons/InfoIcon";
import { toggleModal, renderModalResponseAlert } from "@/app/utilities/miscFunctions";
import { ResponseStatus } from "@/app/interfaces";

import AnimateHeight from "react-animate-height";
import { Height } from "react-animate-height";
import { useState } from "react";

interface GroupChatUploadSubmenuProps {
    userId: number | undefined;
}
export default function GroupChatUploadSubmenu({ userId }: GroupChatUploadSubmenuProps) {

    // ----------- Hooks ------------------
    const postGroupChatUpload = usePostGroupChatUpload();
    const {setNavBarState, setNavBarExpanded, setRefetchDataCounter } = useNavBar();

    // ----------- State (Input) -----------
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [groupChatName, setGroupChatName] = useState<string>("");
    const [minChars, setMinChars] = useState<number>(100);

    // ----------- State (UI) -------------
    const [uploading, setUploading] = useState<boolean>(false);
    const [responseStatus, setResponseStatus] = useState<ResponseStatus>({ message: "", success: false, doAnimate: false });
    const [nameMissing, setNameMissing] = useState<boolean>(false);
    const [fileMissing, setFileMissing] = useState<boolean>(false);
    const [helpHeight, setHelpHeight] = useState<Height>('auto');

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
        if (!userId) {
            console.error("Error: No user signed in. This should not happen as the user must be signed in to see this page.");
            return;
        }

        if (!selectedFile || groupChatName.length === 0) {
            setFileMissing(!selectedFile);
            setNameMissing(groupChatName.length === 0);
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

        // Display the response message for 3 seconds, then close the modal and re-fetch the data.
        setTimeout(() => {
            setResponseStatus({
                message: "",
                success: false,
                doAnimate: false,
            });
            setGroupChatName("");
            if (!error) {
                setNavBarExpanded(false);
                setTimeout(() => {
                    setNavBarState("DEFAULT");
                    setRefetchDataCounter(c => c + 1) // Reload the parent page to display the new group chat after 0.5s.
                }, 500);
            }
        }, 3000);

        setUploading(false);
    }

    // =============== RENDER FUNCTIONS ===============

    const renderMinCharsInfoModal = () => {
        return (
            <Modal domId="min-chars-info-modal" title="Minimum Characters" maxWidth="400px" margin="24px" darkOverlay>
                <div className="mx-4 mb-4">
                    <div className="text-gray-11 mb-4">
                        This field sets the minimum number of characters that a message must contain
                        in order to be imported. This is to prevent short messages like "ok" from being included.
                    </div>
                    <div className="text-gray-11 mb-4">
                        For example, if you set the minimum number of characters to 100, then only messages with 100 or more
                        characters will be included in the message set.
                    </div>
                    <div className="mb-1">
                        The default value is 100.
                    </div>
                </div>
            </Modal>
        );
    }

    // =============== MAIN RENDER ===============

    let subMenuContent: JSX.Element;
    if (responseStatus.doAnimate) {
        subMenuContent = renderModalResponseAlert(responseStatus);
    } else if (uploading) {
        subMenuContent = (
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
        subMenuContent = (<>
            <div className="w-full text-center text-3xl font-semibold mb-4">
                Upload Group Chat
            </div>
            <AnimateHeight duration={500} height={helpHeight}>
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
                <div className="sm:hidden mb-4 text-gray-9 text-sm">
                    iPhone users may prefer to email their chat history to themselves and upload it using a PC.
                </div>
            </AnimateHeight>
            <div className="divider divider-horizontal my-0 text-sm text-gray-8 font-semibold" 
            onClick={() => setHelpHeight(helpHeight === 0 ? 'auto' : 0)}>
                {helpHeight === 0 ? "Show" : "Hide"} Help
            </div>
            <div className="flex gap-3 mb-4 pt-5">
                <div className="w-2/3">
                    <label className="text-sm">Group Chat Name</label>
                    <input name="groupChatName" className={`input mt-[2px] max-w-none ${nameMissing ? "input-error" : ""}`} 
                    type="text" placeholder="Enter name" value={groupChatName} onChange={handleInputChange}/>
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
            <div className="flex flex-wrap justify-center">
                <input className={`input-file grow max-w-none mb-2 ${fileMissing ? "input-file-error" : ""}`} 
                type="file" accept=".txt" onChange={handleFileChange} />
                <button className="grow btn btn-primary" onClick={handleUpload}>
                    Upload
                </button>
            </div>
        </>);
    }

    return (<>
        <div className="flex flex-col px-5 mt-6 max-h-content overflow-y-scroll">
            {subMenuContent}
        </div>
        {renderMinCharsInfoModal()}
    </>);
}