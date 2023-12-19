import usePostQuiz from "../hooks/api_access/quizzes/usePostQuiz";
import Modal from "./Modal";
import InfoIcon from "./icons/InfoIcon";
import { toggleModal, isModalOpen, renderModalResponseAlert } from "../utilities/miscFunctions";
import { ResponseStatus, PostSurvivalQuiz, PostTimeAttackQuiz } from "../interfaces";

import { useState } from "react";

const TIME_ATTACK: number = 0;
const SURVIVAL: number = 1;

interface CreateQuizModalProps {
    groupChatId: number;
    groupChatName: string;
    modalDomId: string;
    setReloadCounter: React.Dispatch<React.SetStateAction<number>>;
}
export default function CreateQuizModal({ groupChatId, groupChatName, modalDomId, setReloadCounter }: CreateQuizModalProps) {

    // ----------- Hooks ------------------
    const postQuiz = usePostQuiz();

    // ----------- State (Input) -----------
    const [quizType, setQuizType] = useState<number>(TIME_ATTACK);
    const [quizName, setQuizName] = useState<string>("");
    const [quizDescription, setQuizDescription] = useState<string>("");

    // Survival Quiz Config Fields
    const [numberOfSkips, setNumberOfSkips] = useState<number>(0);

    // Time Attack Quiz Config Fields (Initial values are the default values)
    const [numberOfQuestions, setNumberOfQuestions] = useState<number>(20);
    const [initialQuestionScore, setInitialQuestionScore] = useState<number>(500);
    const [penaltyPerSecond, setPenaltyPerSecond] = useState<number>(50);
    const [wrongAnswerPenalty, setWrongAnswerPenalty] = useState<number>(200);

    // ----------- State (UI) -------------
    const [creating, setCreating] = useState<boolean>(false);
    const [responseStatus, setResponseStatus] = useState<ResponseStatus>({ message: "", success: false, doAnimate: false });


    // =============== RENDER HELPERS ===============


    
    // =============== MAIN RENDER =============== 

    let modalContent: JSX.Element;
    if (responseStatus.doAnimate) {
        modalContent = renderModalResponseAlert(responseStatus);
    } else if (creating) {
        modalContent = (
            <div className="my-6 sm:my-12">
                <div className="mx-auto mb-2 text-lg sm:text-xl text-center text-gray-11">
                        Creating Quiz...
                </div>
                <div className="flex justify-center">
                    <div className="spinner-circle w-10 h-10 sm:w-12 sm:h-12" />
                </div>
            </div>
        );
    } else {
        modalContent = (<>
            <div className="text-gray-11/70 font-light mr-1 w-full text-center">
                Create a new quiz for:
            </div>
            <div className="text-2xl sm:text-xl font-semibold w-full text-center">
                "{groupChatName}"
            </div>
            <div className="grid grid-cols-2 mb-6 mt-5 text-center max-w-[350px] mx-auto">
                <div className={`relative w-full py-[10px] text-lg border-r border-y-2 border-l-2 rounded-l-xl overflow-hidden hover:cursor-pointer 
                transition duration-300 ${quizType === TIME_ATTACK ? 'text-blue-12 border-blue-11' : 'text-gray-11/50 border-gray-3'}`}
                onClick={() => setQuizType(TIME_ATTACK)}>
                    <span className="relative z-50">Time Attack</span>
                    <div className={`absolute right-0 top-0 bottom-0 bg-blue-5 overflow-hidden z-30
                    ${quizType === TIME_ATTACK ? " animate-quizTypeSelectionEntering" : " animate-quizTypeSelectionExiting"}`} />
                </div>
                <div className={`relative w-full py-[10px] text-lg border-l border-y-2 border-r-2 rounded-r-xl overflow-hidden hover:cursor-pointer 
                transition duration-300 ${quizType === SURVIVAL ? 'text-red-12 border-red-11' : 'text-gray-11/50 border-gray-3'}`}
                onClick={() => setQuizType(SURVIVAL)}>
                    <span className="relative z-50">Survival</span>
                    <div className={`absolute left-0 top-0 bottom-0 bg-red-5 overflow-hidden z-30
                    ${quizType === SURVIVAL ? " animate-quizTypeSelectionEntering" : " animate-quizTypeSelectionExiting"}`} />
                </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
                <div>
                    <label className="form-label mb-[2px]">Quiz Name</label>
                    <input className="input focus:input-primary w-full max-w-[400px]" placeholder="Enter name" />
                </div>
                <div className="sm:grow">
                    <label className="form-label mb-[2px]">Description</label>
                    <input className="input focus:input-primary w-full max-w-[400px]" placeholder="(Max 200 Characters)" />
                </div>
            </div>
        </>);
    }

    return(<>
        <Modal domId={modalDomId} title="Quiz Configuration" maxWidth="600px" margin="8px" darkOverlay>
            <div className="mx-4 mb-4">
                {modalContent}
            </div>
        </Modal>
        {/* Input field explanation modals */}
    </>);
}