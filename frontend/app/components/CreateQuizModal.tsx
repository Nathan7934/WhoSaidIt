import usePostQuiz from "../hooks/api_access/quizzes/usePostQuiz";
import Modal from "./Modal";
import { toggleModal, isModalOpen, renderModalResponseAlert } from "../utilities/miscFunctions";
import { ResponseStatus, PostSurvivalQuiz, PostTimeAttackQuiz } from "../interfaces";

import AnimateHeight from "react-animate-height";
import { Height } from "react-animate-height";
import { useState } from "react";
import InfoIcon from "./icons/InfoIcon";

const TIME_ATTACK: number = 0;
const SURVIVAL: number = 1;

const DEFAULT_NUM_QUESTIONS: number = 20;
const DEFAULT_INITIAL_QUESTION_SCORE: number = 500;
const DEFAULT_PENALTY_PER_SECOND: number = 50;
const DEFAULT_WRONG_ANSWER_PENALTY: number = 200;
const DEFAULT_NUMBER_OF_SKIPS: number = 0;

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
    const [description, setDescription] = useState<string>("");

    // Survival Quiz Config Fields
    const [numberOfSkips, setNumberOfSkips] = useState<number>(DEFAULT_NUMBER_OF_SKIPS);

    // Time Attack Quiz Config Fields (Initial values are the default values)
    const [numberOfQuestions, setNumberOfQuestions] = useState<number>(DEFAULT_NUM_QUESTIONS);
    const [initialQuestionScore, setInitialQuestionScore] = useState<number>(DEFAULT_INITIAL_QUESTION_SCORE);
    const [penaltyPerSecond, setPenaltyPerSecond] = useState<number>(DEFAULT_PENALTY_PER_SECOND);
    const [wrongAnswerPenalty, setWrongAnswerPenalty] = useState<number>(DEFAULT_WRONG_ANSWER_PENALTY);

    // ----------- State (UI) -------------
    const [creating, setCreating] = useState<boolean>(false);
    const [nameMissing, setNameMissing] = useState<boolean>(false);
    const [responseStatus, setResponseStatus] = useState<ResponseStatus>({ message: "", success: false, doAnimate: false });
    const [advancedOptionsHeight, setAdvancedOptionsHeight] = useState<Height>(0);

    // ----------- Data Helpers -----------

    const createQuiz = async () => {
        if (quizName.length === 0) {
            setNameMissing(true);
            return;
        }

        setCreating(true);
        let quizConfig: PostSurvivalQuiz | PostTimeAttackQuiz;
        if (quizType === TIME_ATTACK) {
            quizConfig = {
                quizName,
                description,
                numberOfQuestions,
                initialQuestionScore,
                penaltyPerSecond,
                wrongAnswerPenalty
            }
        } else {
            quizConfig = {
                quizName,
                description,
                numberOfSkips
            }
        }
        const error: string | null = await postQuiz(groupChatId, quizConfig);
        if (!error) {
            setResponseStatus({
                message: "Quiz created successfully",
                success: true,
                doAnimate: true,
            });
        } else {
            console.error("Error creating quiz: ", error);
            setResponseStatus({
                message: "Error creating quiz",
                success: false,
                doAnimate: true,
            });
        }

        // Display the response message for 3 seconds, then close the modal and re-fetch the data.
        setTimeout(() => {
            if (isModalOpen(modalDomId)) {
                toggleModal(modalDomId);
            }    
            setResponseStatus({
                message: "",
                success: false,
                doAnimate: false,
            });
            if (!error) {
                setTimeout(() => {
                    setReloadCounter(c => c + 1) // Reload the parent page to display the new group chat after 0.5s.
                }, 500);
            }
        }, 3000);

        setCreating(false);
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        switch (e.target.name) {
            case "quizName":
                if (quizName.length <= 50) setQuizName(e.target.value);
                break;
            case "quizDescription":
                if (description.length <= 200) setDescription(e.target.value);
                break;
            case "numberOfSkips":
                const numberOfSkips: number = parseInt(e.target.value);
                if (numberOfSkips < 0) {
                    setNumberOfSkips(0);
                } else if (numberOfSkips > 99) {
                    setNumberOfSkips(99);
                } else {
                    setNumberOfSkips(numberOfSkips);
                }
                break;
            case "numberOfQuestions":
                const numberOfQuestions: number = parseInt(e.target.value);
                if (numberOfQuestions < 1) {
                    setNumberOfQuestions(1);
                } else if (numberOfQuestions > 999) {
                    setNumberOfQuestions(999);
                } else {
                    setNumberOfQuestions(numberOfQuestions);
                }
                break;
            case "initialQuestionScore":
                const initialQuestionScore: number = parseInt(e.target.value);
                if (initialQuestionScore < 100) {
                    setInitialQuestionScore(100);
                } else if (initialQuestionScore > 9999) {
                    setInitialQuestionScore(9999);
                } else {
                    setInitialQuestionScore(initialQuestionScore);
                }
                break;
            case "penaltyPerSecond":
                const penaltyPerSecond: number = parseInt(e.target.value);
                if (penaltyPerSecond < 10) {
                    setPenaltyPerSecond(10);
                } else if (penaltyPerSecond > 999) {
                    setPenaltyPerSecond(999);
                } else {
                    setPenaltyPerSecond(penaltyPerSecond);
                }
                break;
            case "wrongAnswerPenalty":
                const wrongAnswerPenalty: number = parseInt(e.target.value);
                if (wrongAnswerPenalty < 0) {
                    setWrongAnswerPenalty(0);
                } else if (wrongAnswerPenalty > 999) {
                    setWrongAnswerPenalty(999);
                } else {
                    setWrongAnswerPenalty(wrongAnswerPenalty);
                }
                break;
        }
    }

    // =============== RENDER HELPERS ===============

    const renderAdvancedOptions = () => {
        const fields: JSX.Element = quizType === TIME_ATTACK
            ? (<div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <div className="flex gap-4">
                    <div className="grow">
                        <label className="form-label mb-[2px]">Num. questions</label>
                        <input name="numberOfQuestions" className="input input-sm focus:input-primary w-full max-w-none" 
                        type="number" value={numberOfQuestions} onChange={handleInputChange} />
                    </div>
                    <div className="grow">
                        <label className="form-label mb-[2px] whitespace-nowrap">Initial question score</label>
                        <input name="initialQuestionScore" className="input input-sm focus:input-primary w-full max-w-none" 
                        type="number" value={initialQuestionScore} onChange={handleInputChange} />
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="grow">
                        <label className="form-label mb-[2px]">Penalty per second</label>
                        <input name="penaltyPerSecond" className="input input-sm focus:input-primary w-full max-w-none" 
                        type="number" value={penaltyPerSecond} onChange={handleInputChange} />
                    </div>
                    <div className="grow">
                        <label className="form-label mb-[2px]">Incorrect penalty</label>
                        <input name="wrongAnswerPenalty" className="input input-sm focus:input-primary w-full max-w-none" 
                        type="number" value={wrongAnswerPenalty} onChange={handleInputChange} />
                    </div>
                </div>
            </div>)
            : (<div className="flex">
                <div className="grow">
                    <label className="form-label mb-[2px]">Number of Skips</label>
                    <input name="numberOfSkips" className="input input-sm focus:input-primary w-full max-w-none" 
                    type="number" value={numberOfSkips} onChange={handleInputChange} />
                </div>
            </div>);

        return (
            <AnimateHeight duration={300} height={advancedOptionsHeight} className="my-2">
                {fields}
            </AnimateHeight>
        )
    }

    const renderInfoModal = () => {
        // TODO: May want to separate this from the component, since duplicates will be rendered for each group chat.
        // Perfomance loss should be negligible, but it's still not ideal.
        return (
            <Modal domId={`info-modal-${groupChatId}`} title="Defining Your Quiz" maxWidth="400px" margin="24px" darkOverlay>
                <div className="mx-4 mb-4">
                    <div className="text-gray-11 mb-3">
                        You can create two types of quizzes:
                    </div>
                    <div className="mb-2">
                        <span className="text-blue-9 font-bold">Time Attack</span> - Answer a set number of questions as quickly as possible 
                        to get the highest score.
                    </div>
                    <div className="mb-3">
                        <span className="text-red-9 font-bold">Survival</span> - Compete for the longest streak of correct answers.
                    </div>
                    <div className="text-gray-8 text-sm mb-2">
                        Once created, you may specify questions while viewing a group chat's messages.
                    </div>
                    <div className="divider mt-0 mb-1" />
                    <div className="text-gray-11 mb-3">
                        Each quiz type has optional settings you may configure:
                    </div>
                    <div className="max-h-[225px] overflow-y-scroll pr-1">
                        <div className="mb-3">
                            <span className="text-blue-9">(TA)</span> <span className="font-semibold">Num. Questions</span> 
                            <span className="text-gray-11"> - The number of questions in your quiz 
                            <span className="text-gray-7"> (default: {DEFAULT_NUM_QUESTIONS})</span></span> 
                        </div>
                        <div className="mb-3">
                            <span className="text-blue-9">(TA)</span> <span className="font-semibold">Initial question score</span> 
                            <span className="text-gray-11"> - The max earnable points for a question, counts down over time 
                            <span className="text-gray-7"> (default: {DEFAULT_INITIAL_QUESTION_SCORE})</span></span> 
                        </div>
                        <div className="mb-3">
                            <span className="text-blue-9">(TA)</span> <span className="font-semibold">Penalty per sec.</span> 
                            <span className="text-gray-11"> - Score lost per second. How much is speed valued? 
                            <span className="text-gray-7"> (default: {DEFAULT_PENALTY_PER_SECOND})</span></span> 
                        </div>
                        <div className="mb-3">
                            <span className="text-blue-9">(TA)</span> <span className="font-semibold">Incorrect penalty</span> 
                            <span className="text-gray-11"> - The score deducted for wrong answers. Set to '0' to disable penalties. 
                            <span className="text-gray-7"> (default: {DEFAULT_WRONG_ANSWER_PENALTY})</span></span> 
                        </div>
                        <div>
                            <span className="text-red-9">(S)</span> <span className="font-semibold">Number of skips</span> 
                            <span className="text-gray-11"> - Set this value to allow players to skip questions they don't know 
                            <span className="text-gray-7"> (default: {DEFAULT_NUMBER_OF_SKIPS})</span></span> 
                        </div>
                    </div>
                </div>
            </Modal>
        );
    }
    
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
            <div className="text-2xl font-semibold w-full text-center">
                "{groupChatName}"
            </div>
            <div className="grid grid-cols-2 mb-4 mt-3 text-center max-w-[350px] mx-auto">
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
                    <input name="quizName" className={`input w-full max-w-none ${nameMissing ? "input-error" : "focus:input-primary"}`} 
                    placeholder="Enter name" value={quizName} onChange={handleInputChange} />
                </div>
                <div className="sm:grow">
                    <label className="form-label mb-[2px]">Description</label>
                    <input name="quizDescription" className="input focus:input-primary w-full max-w-none" placeholder="(Max 200 Chars)" 
                    value={description} onChange={handleInputChange} />
                </div>
            </div>
            <div className="flex w-full mt-2">
                <div className="text-sm text-gray-7 mx-auto transition-colors duration-300 hover:cursor-pointer sm:hover:text-gray-11 noselect"
                onClick={() => setAdvancedOptionsHeight(advancedOptionsHeight === 'auto' ? 0 : 'auto')}>
                    More options ({advancedOptionsHeight === 'auto' ? '-' : '+'})
                </div>
            </div>
            {renderAdvancedOptions()}
            <div className="flex gap-2 w-full mt-5 justify-center">
                <button className="hidden sm:inline-block grow btn max-w-[200px]" onClick={() => toggleModal(modalDomId)}>
                    Cancel
                </button>
                <button className="grow btn btn-primary" onClick={() => createQuiz()}>
                    Create Quiz
                </button>
                <button className="self-center" onClick={() => toggleModal(`info-modal-${groupChatId}`)}>
                    <InfoIcon className="w-7 h-7 ml-[6px] text-blue-7 transition duration-400 sm:hover:text-blue-9" />
                </button>
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
        {renderInfoModal()}
    </>);
}