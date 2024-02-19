import usePostGroupChatUpload from "@/app/hooks/api_access/group_chats/usePostGroupChatUpload";
import useNavBar from "@/app/hooks/context_imports/useNavBar";
import Modal from "../modals/Modal";
import InfoIcon from "../icons/InfoIcon";
import { toggleModal, renderModalResponseAlert } from "@/app/utilities/miscFunctions";
import { ResponseStatus } from "@/app/interfaces";
import WhatsAppIcon from "../icons/WhatsAppIcon";

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
                        in order for it to be imported. This is to prevent short messages like "okay" from being included.
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
        subMenuContent = (
            <div className="absolute w-full top-[45%] translate-y-[-50%]">
                {renderModalResponseAlert(responseStatus)}
            </div>
        );
    } else if (uploading) {
        subMenuContent = (
            <div className="absolute w-full top-[45%] translate-y-[-50%]">
                <div className="mx-auto mb-1 text-lg sm:text-xl text-center text-zinc-200">
                        Upload in Progress.
                </div>
                <div className="mx-auto mb-3 text-lg sm:text-xl text-center text-zinc-200">
                    This may take several minutes...
                </div>
                <div className="flex justify-center">
                    <div className="spinner-circle w-10 h-10 sm:w-12 sm:h-12" />
                </div>
            </div>
        );
    } else {
        subMenuContent = (<>
            <div className="w-full text-center text-2xl font-semibold mb-5">
                Upload Group Chat
            </div>
            <AnimateHeight duration={500} height={helpHeight}>
                <div className="text-zinc-400 mb-6 text-center">
                    Export your <span className="text-zinc-200 font-semibold">WhatsApp<WhatsAppIcon className="w-5 h-5 inline-block mx-1" /></span>
                    group chat as a <span className="text-zinc-200 font-semibold">.txt file</span> and upload it here.
                    Once you have uploaded a group chat, you can create quizzes for it.
                </div>
                <div className="mb-6 text-center">
                    <a className="text-xl text-primary font-semibold text-transparent bg-clip-text
                    bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400" 
                    href="https://faq.whatsapp.com/1180414079177245/?helpref=uf_share" target="_blank">
                        How to export your chat history
                    </a>
                </div>
                <div className="mb-6 text-zinc-400 text-center">
                    Make sure to select <span className="text-zinc-200 font-semibold">"Without Media"</span> when exporting your group chat.
                </div>
                <div className="sm:hidden mb-4 text-zinc-600 text-sm text-center">
                    iPhone users may prefer to email their chat history to themselves and upload it using a PC.
                </div>
            </AnimateHeight>
            <div className="divider divider-horizontal my-0 text-sm text-zinc-500 font-medium" 
            onClick={() => setHelpHeight(helpHeight === 0 ? 'auto' : 0)}>
                {helpHeight === 0 ? "Show" : "Hide"} Help
            </div>
            <div className="flex gap-3 mb-5 pt-5">
                <div className="w-2/3">
                    <label className="text-sm ml-1">Group Chat Name</label>
                    <input name="groupChatName" type="text" placeholder="Enter name" value={groupChatName} onChange={handleInputChange}
                    className={`input mt-[2px] max-w-none focus:border-blue-500 border-[1px] bg-black border-zinc-700 placeholder-zinc-600
                    ${nameMissing ? "input-error" : ""}`}/>
                </div>
                <div className="w-1/3 flex-col">
                    <label className="text-sm">Min. Chars.</label>
                    <div className="flex">
                        <input name="minChars" type="number" value={`${minChars}`} onChange={handleInputChange}
                        className="input mt-[2px] focus:border-blue-500 border-[1px] bg-black border-zinc-700 placeholder-zinc-600"/>
                        <button className="self-center" onClick={() => toggleModal("min-chars-info-modal")}>
                            <InfoIcon className="w-6 h-6 ml-[6px] text-zinc-500 transition duration-400 sm:hover:text-blue-9" />
                        </button>
                    </div>
                </div>
            </div>
            <div className="flex flex-wrap justify-center">
                <div className="flex grow bg-white mb-3 rounded-[13px] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                    <input className={`input-file m-[1px] grow max-w-none  border-none bg-black`} 
                    type="file" accept=".txt" onChange={handleFileChange} />
                </div>
                <button className="grow btn bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" 
                onClick={handleUpload}>
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