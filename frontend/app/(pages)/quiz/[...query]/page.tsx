"use client";

import useValidateUrlToken from "@/app/hooks/security/useValidateUrlToken";
import useAuth from "@/app/hooks/context_imports/useAuth";

import { SurvivalQuizInfo, TimeAttackQuizInfo, Message, Participant, ResponseStatus, 
    PostTimeAttackEntry, PostSurvivalEntry, TimeAttackEntry, SurvivalEntry } from "@/app/interfaces";
import AnimatedScoreCounter from "@/app/components/AnimatedScoreCounter";
import Modal from "@/app/components/modals/Modal";
import { toggleModal, isModalOpen, applyTextMarkup, renderModalResponseAlert, 
    playSoundEffect, executeEventSequence, isTimeAttackEntry } from "@/app/utilities/miscFunctions";
import VolumeOnIcon from "@/app/components/icons/VolumeOnIcon";
import VolumeOffIcon from "@/app/components/icons/VolumeOffIcon";

import useGetQuizInfo from "@/app/hooks/api_access/quizzes/useGetQuizInfo";
import useGetRandomQuizMessage from "@/app/hooks/api_access/messages/useGetRandomQuizMessage";
import usePostLeaderboardEntry from "@/app/hooks/api_access/leaderboards/usePostLeaderboardEntry";
import useAdjustContentHeight from "@/app/hooks/useAdjustContentHeight";
import useGetPastPlayerLeaderboardEntry from "@/app/hooks/api_access/leaderboards/useGetPastPlayerLeaderboardEntry";
import usePatchLeaderboardEntry from "@/app/hooks/api_access/leaderboards/usePatchLeaderboardEntry";

import AnimateHeight from "react-animate-height";
import { Height } from "react-animate-height";
import {v4 as uuidv4} from "uuid";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useReducer, useRef } from "react";

// The page state is used to determine what to render on the level of the page.
// Transitional states are used for animations, etc.
type PageState = "LANDING" | "QUIZ_STARTING" | "QUIZ" | "QUIZ_ENDING" | "RESULTS" | "RESTARTING";
type PageStateReducer = (state: PageState, action: PageStateReducerAction) => PageState;
interface PageStateReducerAction {
    type: PageStateReducerActionType;
}
type PageStateReducerActionType = "init_start_quiz" | "start_quiz" | "init_end_quiz" | "end_quiz" | "restart_quiz";

// The game state is used to determine what to render on the level of the game.
type GameState = "QUESTION_STARTING" | "QUESTION" | "CORRECT_ANSWER" | "INCORRECT_ANSWER";
type GameStateReducer = (state: GameState, action: GameStateReducerAction) => GameState;
interface GameStateReducerAction {
    type: GameStateReducerActionType;
}
type GameStateReducerActionType = "init_next_question" | "next_question" |  "correct_answer" | "incorrect_answer";

// Custom type guard
const isTimeAttack = (quizInfo: TimeAttackQuizInfo | SurvivalQuizInfo): quizInfo is TimeAttackQuizInfo => {
    return quizInfo.type === "TIME_ATTACK";
}

export default function Quiz({ params }: { params: { query: string[] } }) {

    // Extracting the NextJS route query parameters "/quiz/{quizId}/{?urlToken}/{?noa}"
    const quizId = Number(params.query[0]);
    let urlToken: string | null = null;
    let doAnimateIntro: boolean = true;
    if (params.query.length === 2) {
        if (params.query[1] === "noa") {
            doAnimateIntro = false;
        } else {
            urlToken = params.query[1];
        }
    } else if (params.query.length > 2) {
        urlToken = params.query[1];
        if (params.query[2] === "noa") {
            doAnimateIntro = false;
        }
    }

    // ----------- Hooks ------------------
    const router = useRouter();

    // API access hooks
    const getQuizInfo = useGetQuizInfo();
    const getRandomQuizMessage = useGetRandomQuizMessage();
    const postLeaderboardEntry = usePostLeaderboardEntry();
    const getPastPlayerLeaderboardEntry = useGetPastPlayerLeaderboardEntry();
    const patchLeaderboardEntry = usePatchLeaderboardEntry();

    // Security
    const { auth } = useAuth();
    const validateUrlToken = useValidateUrlToken();
    // This is the jwt that is used to authenticate the user if they are not logged in. It is retrieved from the urlToken.
    const [shareableToken, setShareableToken] = useState<string | null>(null);

    // ----------- State (Data) -----------
    const [quizInfo, setQuizInfo] = useState<TimeAttackQuizInfo | SurvivalQuizInfo | null>(null);
    const [currentMessage, setCurrentMessage] = useState<Message | null>(null);
    const [nextMessage, setNextMessage] = useState<Message | null>(null);
    const [seenMessageIds, setSeenMessageIds] = useState<Array<number>>([]); // Prevent repeats
    const [playerName, setPlayerName] = useState<string>(""); // The name of the player (for submitting to the leaderboard)
    const [playerUUID, setPlayerUUID] = useState<string | null>(null); // The UUID of the player (for updating previous leaderboard submissions)
    const [previousLeaderboardEntry, setPreviousLeaderboardEntry] = useState<TimeAttackEntry | SurvivalEntry | null>(null); // The player's previous leaderboard entry [if any]
    const [scoreSubmitted, setScoreSubmitted] = useState<boolean>(false); // Whether the score has been submitted to the leaderboard
    const [playSFX, setPlaySFX] = useState<boolean>(true); // Whether sound effects are enabled [default: true]

    // ----------- State (Game) -----------
    const [score, setScore] = useState<number>(0); // For Survival Quizzes, this state records the streak instead.
    const [scoreGained, setScoreGained] = useState<number>(0); // The score gained for a specific question
    const [participantOptions, setParticipantOptions] = useState<Array<Participant>>([]); // The options for the current message
    const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
    const [questionNumber, setQuestionNumber] = useState<number>(1); // The current question number [1, ...
    const [skipsUsed, setSkipsUsed] = useState<number>(0); // The number of skips used (for Survival Quizzes only)

    // ----------- State (UI) -------------
    const [staticDataLoading, setStaticDataLoading] = useState<boolean>(true);
    const [submitting, setSubmitting] = useState<boolean>(false); // Whether the score is being submitted to the leaderboard
    const [noResubmit, setNoResubmit] = useState<boolean>(false); // Whether the user has decided not to update their previous leaderboard entry
    // The response status of the leaderboard submission
    const [responseStatus, setResponseStatus] = useState<ResponseStatus>({ message: "", success: false, doAnimate: false });

    const [introSplashTextEntering, setIntroSplashTextEntering] = useState<Array<"WAITING" | "ENTERING" | "EXITING">>(["WAITING", "WAITING"]);
    const [landingActionsHeight, setLandingActionsHeight] = useState<Height>(0); // The height of the landing page actions [Begin Quiz, Leaderboard, Info]
    const [landingActionsVisible, setLandingActionsVisible] = useState<boolean>(false); // Whether the landing page actions are visible
    const [resultsActionsHeight, setResultsActionsHeight] = useState<Height>(0); // The height of the results page actions [Submit Score, Play Again]
    const [resultsActionsVisible, setResultsActionsVisible] = useState<boolean>(false); // Whether the results page actions are visible

    // Timing
    const [quizStartTime, setQuizStartTime] = useState<Date>(new Date());
    const [questionStartTime, setQuestionStartTime] = useState<Date>(new Date());
    const [totalTimeTaken, setTotalTimeTaken] = useState<number | null>(null); // In milliseconds

    // Sound effect refs
    const correctAudioRef = useRef<HTMLAudioElement>(new Audio("/correct.mp3"));
    const incorrectAudioRef = useRef<HTMLAudioElement>(new Audio("/incorrect.mp3"));

    // Adjust the height of the page content area
    useAdjustContentHeight(".navbar", ".page-content", [staticDataLoading]);

    // ----- Data Retrieval/Authentication & Initial animation triggers -----
    useEffect(() => {
        const getPageData = async () => {
            
            // If the user is not logged in, we need to extract the urlToken and authenticate them
            let shareableToken: string | null = null;
            if (urlToken) {
                shareableToken = await validateUrlToken(quizId, urlToken);
                if (!shareableToken && !auth) {
                    // If the urlToken is invalid (and user is not logged in), redirect to the home page
                    console.error("Error authenticating user, redirecting to root");
                    router.push("/");
                    return;
                } else {
                    setShareableToken(shareableToken);
                }
            }

            // Once authentication is verified, retrieve the static data and the first two messages
            const quiz: TimeAttackQuizInfo | SurvivalQuizInfo | null = await getQuizInfo(quizId, shareableToken || undefined);
            const currentMessage: Message | null = await getRandomQuizMessage(quizId, [], shareableToken || undefined);
            if (quiz && currentMessage) {
                setQuizInfo(quiz);
                setCurrentMessage(currentMessage);
                setParticipantOptions(generateParticipantOptions(quiz, currentMessage.sender));
                let excludedMessageIds = [currentMessage.id];
                const nextMessage: Message | null = await getRandomQuizMessage(quizId, excludedMessageIds, shareableToken || undefined);
                if (nextMessage) {
                    setNextMessage(nextMessage);
                    excludedMessageIds.push(nextMessage.id);
                }
                setSeenMessageIds(excludedMessageIds);
            } else {
                console.error("Error retrieving data, redirecting to root");
                router.push("/");
            }

            // See if the player has a stored preference for playing SFX in local storage
            let sfxPref: string | null = localStorage.getItem("quizSFX");
            if (!sfxPref) {
                localStorage.setItem("quizSFX", "true");
                sfxPref = "true";
            }
            setPlaySFX(sfxPref === "true");

            setStaticDataLoading(false);
            
            // Begin the intro splash timing sequence
            let introSplashSequence: Array<{ action: () => void, delay: number }>;
            if (doAnimateIntro) {
                introSplashSequence = [
                    { action: () => setIntroSplashTextEntering(["ENTERING", "WAITING"]), delay: 1800 },
                    { action: () => setIntroSplashTextEntering(["EXITING", "WAITING"]), delay: 2250 },
                    { action: () => setIntroSplashTextEntering(["WAITING", "ENTERING"]), delay: 500 },
                    { action: () => setIntroSplashTextEntering(["WAITING", "EXITING"]), delay: 2500},
                    { action: () => setLandingActionsHeight("auto"), delay: 500 },
                    { action: () => setLandingActionsVisible(true), delay: 500 }
                ];
            } else {
                introSplashSequence = [
                    { action: () => setLandingActionsHeight("auto"), delay: 1800 },
                    { action: () => setLandingActionsVisible(true), delay: 500 }
                ];
            }
            executeEventSequence(introSplashSequence);
        }
        getPageData();
    }, []);

    // Handles the generation/retrieval of the player's UUID and previous leaderboard entry (for updating)
    // Runs on component mount and whenever a quiz is restarted after a score is submitted.
    useEffect(() => {
        const setUuidAndGetPreviousEntry = async () => {

            if (scoreSubmitted) return;
            // When scoreSubmitted changes from true to false, the player submitted a score and clicked "Play Again".
            // This means they will have a new previous entry, and we need to update the state accordingly.

            // See if the player has a UUID in local storage, if not, create one and store it
            let uuid: string | null = localStorage.getItem("quizPlayerUUID");
            if (uuid) {
                // If there is a UUID, retrieve the player's previous leaderboard entry (if any)
                const entry: TimeAttackEntry | SurvivalEntry | null = await getPastPlayerLeaderboardEntry(quizId, uuid, shareableToken || undefined);
                if (entry) setPreviousLeaderboardEntry(entry);
            } else {
                uuid = uuidv4(); // Generate a new one
                localStorage.setItem("quizPlayerUUID", uuid);
            }
            setPlayerUUID(uuid);
        }
        setUuidAndGetPreviousEntry();
    }, [scoreSubmitted]);

    // ----- DATA HELPERS -----

    const getNextMessage = async () => {
        if (nextMessage) {
            setCurrentMessage(nextMessage);
            setParticipantOptions(generateParticipantOptions(quizInfo, nextMessage.sender));
        }
        const newNextMessage: Message | null = await getRandomQuizMessage(quizId, seenMessageIds, shareableToken || undefined);
        if (newNextMessage) {
            setNextMessage(newNextMessage);
            setSeenMessageIds([...seenMessageIds, newNextMessage.id]);
        } else {
            // If there are no more messages, end the quiz
            pageStateDispatch({ type: "init_end_quiz" });
        }
    }

    const submitLeaderboardEntry = async (isUpdate: boolean = false) => {
        if (!quizInfo || !totalTimeTaken || (!isUpdate && playerName === "") || !playerUUID) {
            console.error("Error submitting leaderboard entry: Missing required data");
            return;
        }
        if (isUpdate && !previousLeaderboardEntry) {
            console.error("Error submitting leaderboard entry: No previous entry found");
            return;
        }
        setSubmitting(true);

        // Build the request object
        let postRequest: PostTimeAttackEntry | PostSurvivalEntry;
        if (isTimeAttack(quizInfo)) {
            postRequest = {
                playerName: (isUpdate && previousLeaderboardEntry) ? previousLeaderboardEntry.playerName : playerName,
                score: score,
                timeTaken: totalTimeTaken,
                playerUUID: playerUUID
            };
        } else {
            postRequest = {
                playerName: (isUpdate && previousLeaderboardEntry) ? previousLeaderboardEntry.playerName : playerName,
                streak: score,
                skipsUsed: skipsUsed,
                playerUUID: playerUUID
            };
        }

        // Make the API request
        let error: string | null;
        if (isUpdate && previousLeaderboardEntry) {
            error = await patchLeaderboardEntry(quizId, previousLeaderboardEntry.id, postRequest, shareableToken || undefined);
        } else {
            error = await postLeaderboardEntry(quizId, postRequest, shareableToken || undefined);
        }

        if (!error) {
            setResponseStatus({ message: "Entry submitted!", success: true, doAnimate: true });
            setScoreSubmitted(true);
        } else {
            console.error("Error submitting leaderboard entry:", error);
            setResponseStatus({ message: error, success: false, doAnimate: true });
        }

        // Display the response message for 1.5 seconds, then close the modal
        setTimeout(() => {
            if (isModalOpen("leaderboard-submit-modal")) {
                toggleModal("leaderboard-submit-modal");
            }
            setSubmitting(false);
            setResponseStatus({ message: "", success: false, doAnimate: false });
        }, 1500);
    }

    // Gets a random selection of 4 or 3 (depending on type) participants to choose from, including the correct participant.
    const generateParticipantOptions = (
        quizInfo: SurvivalQuizInfo | TimeAttackQuizInfo | null, 
        currentSender: Participant | undefined
    ): Array<Participant> => {
        if (!quizInfo || !currentSender) return [];
        let potentialParticipants: Array<Participant> = quizInfo.participants.filter(p => p.id !== currentSender.id);
        const options = [currentSender];
        const numOptions = isTimeAttack(quizInfo) ? 4 : 3;
        while (options.length < Math.min(numOptions, quizInfo.participants.length)) {
            const randomParticipant = potentialParticipants[Math.floor(Math.random() * potentialParticipants.length)];
            potentialParticipants = potentialParticipants.filter(p => p.id !== randomParticipant.id);
            options.push(randomParticipant);
        }
        
        // Shuffle the options
        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * i);
            const temp = options[i];
            options[i] = options[j];
            options[j] = temp;
        }

        return options;
    }

    // ----- STATE CHANGE HANDLERS/REDUCERS -----

    // This reducer handles state changes specific to the page. I.e., transitions between the landing page, quiz, and results.
    const pageStateReducer = (state: PageState, action: PageStateReducerAction): PageState => {
        switch (action.type) {
            case "init_start_quiz": // Animations: Fade out the landing page
                setTimeout(() => {
                    pageStateDispatch({ type: "start_quiz" });
                }, 800);
                return "QUIZ_STARTING";

            case "start_quiz":
                const startTime = new Date();
                setQuizStartTime(startTime);
                setQuestionStartTime(startTime); // The first question starts at the same time as the quiz
                return "QUIZ";

            case "init_end_quiz": // Animations: Fade out the quiz
                setTotalTimeTaken(Date.now() - quizStartTime.getTime());
                setTimeout(() => {
                    pageStateDispatch({ type: "end_quiz" });
                }, 1500);
                return "QUIZ_ENDING";

            case "end_quiz":
                return "RESULTS";

            case "restart_quiz":
                // Lots of state resets need to happen on restart
                setQuestionNumber(0); // This is incremented to 1 in the gameStateReducer
                setSkipsUsed(0);
                setTimeout(() => {
                    setScore(0);
                    setScoreSubmitted(false);
                    setResultsActionsHeight(0);
                    setResultsActionsVisible(false);
                    pageStateDispatch({ type: "start_quiz" }); // Go straight to the quiz
                    gameStateDispatch({ type: "next_question" });
                }, 500);
                return "RESTARTING";

            default: // This should never happen
                return state;
        }
    }

    // This reducer handles state changes specific to the game/quiz. I.e., correctness of answers, question transitions, etc.
    const gameStateReducer = (state: GameState, action: GameStateReducerAction): GameState => {
        if (!quizInfo || !currentMessage) return state;

        switch (action.type) {
            case "init_next_question": // Animations: Slide off the current message to reveal the next message; Fade out participant options
                setTimeout(() => {
                    gameStateDispatch({ type: "next_question" });
                }, 500);
                return "QUESTION_STARTING";

            case "next_question":
                getNextMessage();
                setQuestionNumber(questionNumber + 1);
                setSelectedParticipant(null);
                setScoreGained(0);
                setQuestionStartTime(new Date());
                return "QUESTION";

            case "correct_answer":
                if (isTimeAttack(quizInfo)) {
                    const { initialQuestionScore, penaltyPerSecond } = quizInfo;
                    const secondsTaken = Math.floor((Date.now() - questionStartTime.getTime()) / 1000); // Convert to seconds (rounded down)
                    const qScore = Math.max(initialQuestionScore - (secondsTaken * penaltyPerSecond), 150);
                    setScoreGained(qScore);
                    setScore(score + qScore);
                } else {
                    setScoreGained(1);
                    setScore(score + 1);
                }

                if (playSFX) {
                    if (navigator.vibrate) navigator.vibrate(100); // Vibrate on correct answer (if supported by the device)
                    playSoundEffect(correctAudioRef);
                }

                setTimeout(() => {
                    if (isTimeAttack(quizInfo) && questionNumber >= quizInfo.numberOfQuestions) {
                        // If Time Attack, quiz ends if it's the last question.
                        pageStateDispatch({ type: "init_end_quiz" });
                    } else {
                        gameStateDispatch({ type: "init_next_question" });
                    }
                }, 2000);
                return "CORRECT_ANSWER";
            
            case "incorrect_answer":
                if (isTimeAttack(quizInfo)) {
                    const { wrongAnswerPenalty } = quizInfo;
                    setScoreGained(-wrongAnswerPenalty);
                    setScore(score - wrongAnswerPenalty);
                }

                if (playSFX) {
                    if (navigator.vibrate) navigator.vibrate(400); // Vibrate on incorrect answer (if supported by the device)
                    playSoundEffect(incorrectAudioRef);
                }

                setTimeout(() => {
                    if (!isTimeAttack(quizInfo) || questionNumber >= quizInfo.numberOfQuestions) {
                        // If Survival, quiz ends on wrong answer. If Time Attack, quiz ends if it's the last question.
                        pageStateDispatch({ type: "init_end_quiz" });
                    } else {
                        gameStateDispatch({ type: "init_next_question" });
                    }
                }, 2000);
                return "INCORRECT_ANSWER";

            default: // This should never happen
                return state;
        }
    }

    // ----------- Reducer declarations -----------
    const [pageState, pageStateDispatch] = useReducer<PageStateReducer>(pageStateReducer, "LANDING");
    const [gameState, gameStateDispatch] = useReducer<GameStateReducer>(gameStateReducer, "QUESTION");

    // =============== MAIN RENDER ===============

    let renderContent: JSX.Element = <></>;
    // =+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+==+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+= LOADING VIEW =+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+==+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=
    if (staticDataLoading || !quizInfo || !currentMessage) {
        renderContent = (
            <div className="absolute flex flex-col left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
                <svg className="spinner-ring spinner-lg mx-auto mt-3" viewBox="25 25 50 50" strokeWidth="5">
                    <circle cx="50" cy="50" r="20" />
                </svg>
            </div>
        );
    // =+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+==+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+= LANDING VIEW =+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+==+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=
    } else if (pageState === "LANDING" || pageState === "QUIZ_STARTING") {
        
        const getSplashTextAnimClass = (index: number): string => {
            switch (introSplashTextEntering[index]) {
                case "WAITING":
                    return "invisible";
                case "ENTERING":
                    return `animate__animated animate__flipInX`;
                case "EXITING":
                    return "animate__animated animate__flipOutX animate__duration-800ms";
            }
        }

        const renderDetailsModal = () => {
            return (
                <Modal domId="quiz-details-modal" margin="8px">
                    <div className={`w-full mb-2 text-center text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r
                    ${isTimeAttack(quizInfo) ? " from-blue-400 via-blue-300 to-blue-400" : " from-purple-400 via-pink-400 to-purple-400"}`}>
                        {isTimeAttack(quizInfo) ? "Time Attack Quiz" : "Survival Quiz"}
                    </div>
                    <div className="w-full mb-3 text-center text-sm">
                        {isTimeAttack(quizInfo) 
                            ? (<>Answer a set number of questions as quickly<br/>as possible. Faster answers earn more points.</>)
                            : (<>Aim for the longest streak of correct answers.<br/>One wrong answer ends your run.</>)
                        }
                    </div>
                    <div className="w-full px-3 mb-4 text-center text-white">
                        Created by <span className="font-semibold">{quizInfo.username}</span>
                    </div>
                    {quizInfo.description.length > 0 && (<>
                        <div className="divider px-3 mt-[-7px] mb-2" />
                        <label className={`w-full text-center mb-1 text-sm text-blue-300 font-semibold
                        ${isTimeAttack(quizInfo) ? " text-blue-300" : " text-pink-400"}`}>
                            Description
                        </label>
                        <div className="w-full px-3 mb-4 text-center text-sm">
                            {quizInfo.description}
                        </div>
                    </>)}
                </Modal>
            );
        }

        renderContent = (<>
            <div className={`w-full ${pageState === "QUIZ_STARTING" ? "animate__animated animate__fadeOut animate__duration-500ms" : ""}`}>
                <div className="relative bottom-8 flex justify-center mb-4 text-5xl font-bold noselect">
                    <div className="animate__animated animate__bounceInDown">Who</div>
                    <div className="animate__animated animate__bounceInUp animate__delay-150ms">Said</div>
                    <div className="animate__animated animate__bounceInDown animate__delay-300ms">It</div>
                    <div className="animate__animated animate__fadeIn animate__delay-1s">?</div>
                </div>
                <div className="relative bottom-8 w-full">
                    <div className={`absolute left-0 right-0 flex flex-col items-center text-center ${getSplashTextAnimClass(0)}`}>
                        <div className="text-2xl font-semibold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 
                        text-transparent bg-clip-text w-full">
                            Test your knowledge of<br/><span className="font-extrabold">{quizInfo.groupChatName}</span>
                        </div>
                    </div>
                    <div className={`absolute left-0 right-0 flex flex-col items-center text-center ${getSplashTextAnimClass(1)} `}>
                        <div className="text-2xl bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 
                        text-transparent bg-clip-text font-semibold">
                            See how well you know<br/>your friends
                        </div>
                    </div>
                </div>
                <AnimateHeight duration={500} height={landingActionsHeight}>
                    <div className={`flex flex-col w-full items-center pt-8 
                    ${landingActionsVisible ? " animate__animated animate__fadeIn" : "invisible"}`}>
                        <div className={`text-3xl font-bold text-transparent bg-clip-text text-center bg-gradient-to-r px-10
                        ${isTimeAttack(quizInfo) ? " from-blue-400 via-blue-300 to-blue-400" : " from-purple-400 via-pink-400 to-purple-400"}`}>
                            {quizInfo.quizName}
                        </div>
                        <div className="mt-2 text-gray-12 text-2xl">
                            {isTimeAttack(quizInfo) ? "Time Attack Quiz" : "Survival Quiz"}
                        </div>
                        <button className={`mt-10 py-3 bg-gradient-to-r rounded-2xl w-[280px] sm:w-[350px] font-medium text-2xl active:scale-[98%] transition duration-100 ease-in-out
                            ${isTimeAttack(quizInfo)
                                ? " from-blue-500 from-0% via-blue-400 to-blue-500 to-100% text-indigo-100 border border-blue-400"
                                : " from-purple-500 from-0% via-pink-500 to-purple-500 to-100% text-purple-100 border border-pink-400"}`
                        } onClick={() => pageStateDispatch({ type: "init_start_quiz" })}>
                            Begin Quiz
                        </button>
                        <Link href={`/leaderboard/${quizId}${shareableToken ? `/${urlToken}` : ""}`}>
                            <button className={`mt-3 py-[10px] w-[280px] sm:w-[350px] rounded-xl font-semibold bg-zinc-950 border
                            ${isTimeAttack(quizInfo) ? " border-blue-400" : " border-pink-400"}`}>
                                Leaderboard
                            </button>
                        </Link>
                        <button className={`mt-3 py-[10px] w-[280px] sm:w-[350px] rounded-xl font-semibold bg-zinc-950 border
                        ${isTimeAttack(quizInfo) ? " border-blue-400" : " border-pink-400"}`}
                        onClick={() => { toggleModal("quiz-details-modal") }}>
                            Quiz Info
                        </button>
                        <div className="fixed bottom-5 mt-3 px-[6px] py-[5px] rounded-lg bg-black cursor-pointer border border-zinc-900"
                        onClick={() => {
                            localStorage.setItem("quizSFX", (!playSFX).toString());
                            setPlaySFX(!playSFX);
                        }}>
                            {playSFX ? <VolumeOnIcon className="w-6 h-6 text-zinc-700" /> : <VolumeOffIcon className="w-6 h-6 text-zinc-700" />}
                        </div>
                    </div>
                </AnimateHeight>
            </div>
            {renderDetailsModal()}
        </>);
    // =+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+==+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+= QUIZ VIEW =+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+==+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=
    } else if (pageState === "QUIZ" || pageState === "QUIZ_ENDING") {

        const renderParticipantOptions = () => {
            const options: Array<JSX.Element> = participantOptions.map((participant) => {
                const isCorrect = participant.id === currentMessage.sender.id;
                const isSelected = selectedParticipant?.id === participant.id;
                const correctAnswerBg = isTimeAttack(quizInfo) 
                    ? " bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600" 
                    : " bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500";
                let bgStyling: string;
                let animationClass: string;
                switch (gameState) {
                    case "QUESTION_STARTING":
                        animationClass = " animate__animated animate__flipOutX animate__duration-500ms";
                        bgStyling = `${isSelected && isCorrect 
                            ? correctAnswerBg : "bg-zinc-950"}`; 
                        break;
                    case "QUESTION":
                        animationClass = " animate__animated animate__flipInX animate__duration-500ms";
                        bgStyling = " bg-zinc-950"; 
                        break;
                    case "CORRECT_ANSWER":
                        animationClass = isCorrect ? " animate-correctAnswer" : "";
                        bgStyling = isCorrect ? correctAnswerBg : " bg-zinc-950"; 
                        break;
                    case "INCORRECT_ANSWER":
                        animationClass = !isCorrect && isSelected ? " animate-incorrectAnswer" : "";
                        bgStyling = "bg-zinc-950"; 
                        break;
                }
                return (
                    <div key={participant.id}
                    className={`w-full py-[1px] px-[2px] my-1 rounded-xl bg-gradient-to-r ${animationClass}
                    ${isTimeAttack(quizInfo) ? " from-blue-500 via-blue-400 to-blue-500" : " from-purple-500 via-pink-500 to-purple-500"}`}>
                        <button className={`w-full py-[10px] rounded-xl font-semibold text-lg ${bgStyling}`}
                        onClick={() => {
                            if (gameState === "QUESTION") {
                                setSelectedParticipant(participant);
                                if (isCorrect) {
                                    gameStateDispatch({ type: "correct_answer" });
                                } else {
                                    gameStateDispatch({ type: "incorrect_answer" });
                                }
                            }
                        }}>
                            {participant.name}
                        </button>
                    </div>
                );
            });
            // Add the skip button if it's a Survival Quiz
            if (!isTimeAttack(quizInfo)) {
                const styling: string = skipsUsed >= quizInfo.numberOfSkips 
                    ? " text-zinc-800 border border-dashed border-zinc-900 cursor-default" 
                    : " bg-zinc-950/30 text-zinc-300 border border-zinc-900";
                options.push(
                    <button key="skip" className={`w-[50%] py-[10px] mx-auto mt-2 mb-1 rounded-2xl text-lg animate__animated animate__duration-500ms ${styling}
                    ${gameState === "QUESTION_STARTING" ? " animate__flipOutX" : " animate__flipInX"}
                    `} 
                    onClick={() => {
                        if (gameState === "QUESTION" && skipsUsed < quizInfo.numberOfSkips) {
                            setSkipsUsed(skipsUsed + 1);
                            gameStateDispatch({ type: "init_next_question" });
                        }
                    }}>
                        Skip <span className="font-extralight">({quizInfo.numberOfSkips - skipsUsed})</span>
                    </button>
                );
            }
            return options;
        }

        const getCardAnimClass = (): string => {
            if (questionNumber % 2 === 0)
                return " animate-messageCardSlideOutUpLeft";
            return " animate-messageCardSlideOutUpRight";
        }

        const renderQuestionCard = (isNext: boolean) => {
            let message: Message;
            if (isNext) {
                if (!nextMessage) return <></>; // Should never happen
                message = nextMessage;
            } else {
                if (!currentMessage) return <></>;
                message = currentMessage;
            }
            return (
                <div className={`absolute p-[1px] left-0 top-0 m-[-1px] w-full h-full rounded-xl bg-gradient-to-r overflow-hidden
                ${!isNext ? gameState === "QUESTION_STARTING" ? getCardAnimClass() : "" : ""}
                ${isTimeAttack(quizInfo) ? " from-blue-500 via-blue-400 to-blue-500" : " from-purple-500 via-pink-500 to-purple-500"}`}>
                    <div className={`w-full h-full flex bg-zinc-950 rounded-xl px-3 ${isTimeAttack(quizInfo) ? "pt-5 pb-8" : "py-5"}`}>
                        <div className="grow px-2 w-full h-full text-xl font-medium overflow-y-scroll overflow-x-hidden">
                            {applyTextMarkup(message.content)}
                        </div>
                        {isTimeAttack(quizInfo) && (
                            <div className="absolute bottom-[6px] right-3 text-center text-sm font-light text-zinc-600">
                                {isNext ? questionNumber + 1 : questionNumber}/{quizInfo.numberOfQuestions}
                            </div>
                        )}
                    </div>
                </div>
            )
        }

        renderContent = (
            <div className={`flex flex-col h-full items-center py-4 min-w-[270px] w-[90%] max-w-[500px] animate__animated
            ${pageState === "QUIZ_ENDING" ? " animate__fadeOut" : " animate__fadeIn animate__duration-500ms"}`}>
                <div className="mt-auto">
                    <AnimatedScoreCounter type={isTimeAttack(quizInfo) ? "score" : "streak"} score={score} scoreGained={scoreGained} 
                    delay={isTimeAttack(quizInfo) ? 1000 : 2000} duration={800} isAnimated={isTimeAttack(quizInfo)} />
                </div>
                <div className={`relative w-full grow max-h-[400px] mt-4 mb-4 sm:my-6 bg-zinc-950 rounded-xl border 
                ${isTimeAttack(quizInfo) ? " border-blue-500" : " border-purple-500"}`}>
                    {/* We render the next message underneath the current message */}
                    {renderQuestionCard(true)}
                    {/* Current message */}
                    {renderQuestionCard(false)}
                </div>
                <div className="flex flex-col w-full mb-auto">
                    {renderParticipantOptions()}
                </div>
            </div>
        );
    }
    // =+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+==+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+= RESULTS VIEW =+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+==+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=
    else if (pageState === "RESULTS" || pageState === "RESTARTING") {
        const resultsSequence = [
            { action: () => setResultsActionsHeight('auto'), delay: 2000 },
            { action: () => setResultsActionsVisible(true), delay: 500 },
        ]
        executeEventSequence(resultsSequence);

        const leaderboardRoute: string = `/leaderboard/${quizId}${shareableToken ? `/${urlToken}` : ""}`;

        const renderLeaderboardNavCheckModal = () => {
            return (
                <Modal domId="leaderboard-nav-check-modal" darkOverlay>
                    <div className="w-full mt-[6px] text-center text-2xl font-semibold">
                        {isTimeAttack(quizInfo) ? "Score" : "Streak"} not submitted
                    </div>
                    <div className="w-full text-center mt-1 text-gray-11">
                        Are you sure you want to leave?
                    </div>
                    <div className="grid grid-cols-2 gap-2 my-4 mx-7">
                        <button className="grow btn btn-lg"
                        onClick={() => { toggleModal("leaderboard-nav-check-modal") }}>
                            Cancel
                        </button>
                        <button className="grow btn btn-lg"
                        onClick={() => { router.push(leaderboardRoute) }}>
                            Yes
                        </button>
                    </div>
                </Modal>
            );
        }

        const leaderboardClicked = () => {
            if (!scoreSubmitted) {
                toggleModal("leaderboard-nav-check-modal");
            } else {
                router.push(leaderboardRoute);
            }
        }

        const renderLeaderboardSubmitModal = () => {
            let modalContent: JSX.Element;
            if (responseStatus.doAnimate) {
                modalContent = (<>
                    <div className="mt-[-12px]" />
                    {renderModalResponseAlert(responseStatus, true)}
                </>);
            } else if (submitting) {
                modalContent = (<>
                    <div className="mt-[-12px]" />
                    <div className="mb-6 mt-4 sm:mb-12 sm:mt-10">
                        <div className="mx-auto mb-2 text-xl text-center">
                                Submitting...
                        </div>
                        <div className="flex justify-center">
                            <div className="spinner-circle w-12 h-12 sm:w-14 sm:h-14" />
                        </div>
                    </div>
                </>);
            } else if (previousLeaderboardEntry && !noResubmit) {
                modalContent = (<>
                    <div className="w-full mt-5 text-center text-2xl font-semibold">
                        Update previous entry?
                    </div>
                    <div className="w-full text-center text-lg mt-3 text-zinc-300 font-light">
                        You had a {isTimeAttack(quizInfo) ? "score" : "streak"} of: 
                        <span className="ml-2 text-white font-medium">
                            {isTimeAttackEntry(previousLeaderboardEntry) ? previousLeaderboardEntry.score : previousLeaderboardEntry.streak}
                        </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-6 mb-5 mx-7">
                        <button className="grow btn btn-lg bg-black border border-zinc-900 text-zinc-400 font-light whitespace-nowrap"
                        onClick={() => setNoResubmit(true)}>
                            No Thanks
                        </button>
                        <button className={`grow btn btn-lg bg-gradient-to-r font-semibold
                        ${isTimeAttack(quizInfo)
                            ? " from-blue-500 from-0% via-blue-400 to-blue-500 to-100% text-indigo-100"
                            : " from-purple-500 from-0% via-pink-500 to-purple-500 to-100% text-purple-100"}`}
                        onClick={() => submitLeaderboardEntry(true)}>
                            Update
                        </button>
                    </div>
                </>);
            } else {
                modalContent = (<>
                    <div className={`w-full mt-2 text-center text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r
                    ${isTimeAttack(quizInfo) ? " from-blue-400 via-blue-300 to-blue-400" : " from-purple-400 via-pink-400 to-purple-400"}`}>
                        Submit Results
                    </div>
                    <div className="w-full text-center mt-3 text-gray-12">
                        Post your {isTimeAttack(quizInfo) ? "score" : "streak"} to the leaderboard<br/>
                        and compare with your friends!
                    </div>
                    <form className="flex flex-col mt-4 mb-5 mx-6" onSubmit={() => submitLeaderboardEntry()}>
                        <label className="w-full text-center mb-1 text-lg font-bold">
                            Enter Name
                        </label>
                        <div className={`flex w-full p-[1px] rounded-[0.75rem] bg-gradient-to-r
                        ${isTimeAttack(quizInfo)
                            ? " from-blue-500 from-0% via-blue-400 to-blue-500 to-100% text-indigo-100 border border-blue-400"
                            : " from-purple-500 from-0% via-pink-500 to-purple-500 to-100% text-purple-100 border border-pink-400"}`}
                        >
                            <input className="input input-lg grow bg-black border-2 border-transparent text-lg text-center placeholder-white"
                            id="submitName" value={playerName} onChange={playerNameChanged} />
                        </div>
                    </form>
                    <div className="flex mx-6 mb-6">
                        <button className={`py-2 bg-gradient-to-r rounded-xl w-[280px] font-semibold text-xl max-w-none grow
                            ${isTimeAttack(quizInfo)
                                ? " from-blue-500 from-0% via-blue-400 to-blue-500 to-100% text-indigo-100 border border-blue-400"
                                : " from-purple-500 from-0% via-pink-500 to-purple-500 to-100% text-purple-100 border border-pink-400"}`}
                        onClick={() => submitLeaderboardEntry()}>
                            Submit
                        </button>
                    </div>
                </>);
            }

            return (
                <Modal domId="leaderboard-submit-modal" darkOverlay>
                    {modalContent}
                </Modal>
            );
        }

        const playerNameChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.value.length > 15) return;
            setPlayerName(e.target.value);
        }

        const getLeaderboardButtonStyling = (): string => {
            let styling: string;
            if (scoreSubmitted) {
                styling = `py-3 text-xl rounded-2xl font-medium bg-gradient-to-r 
                ${isTimeAttack(quizInfo)
                    ? " from-blue-500 from-0% via-blue-400 to-blue-500 to-100% text-indigo-100"
                    : " from-purple-500 from-0% via-pink-500 to-purple-500 to-100% text-purple-100"
                }`;
            } else {
                styling = `py-[10px] bg-zinc-950 font-semibold border rounded-xl
                ${isTimeAttack(quizInfo) ? " border-blue-400" : " border-pink-400"}`;
            }
            return styling;
        }

        renderContent = (<>
            <div className={`flex flex-col items-center w-full animate__animated animate__duration-500ms
            ${pageState === "RESULTS" ? " animate__fadeIn" : " animate__fadeOut"}`}>
                <div className="flex flex-col mb-6">
                    <div className={`w-full mb-2 text-center text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r
                    ${isTimeAttack(quizInfo) ? " from-blue-400 via-blue-300 to-blue-400" : " from-purple-400 via-pink-400 to-purple-400"}`}>
                        Your {isTimeAttack(quizInfo) ? "Score" : "Streak"}
                    </div>
                    <AnimatedScoreCounter type={isTimeAttack(quizInfo) ? "score" : "streak"} score={score} scoreGained={score} 
                    delay={500} duration={1000} isLarge hideScoreGained />
                </div>
                <AnimateHeight duration={500} height={resultsActionsHeight}>
                    <div className={`flex flex-col pt-3 w-full items-center 
                    ${resultsActionsVisible ? " animate__animated animate__fadeIn" : " invisible"}`}>
                        {!scoreSubmitted &&
                            <button className={`py-[12px] bg-gradient-to-r rounded-xl w-[280px] sm:w-[350px] text-2xl font-medium
                            ${isTimeAttack(quizInfo)
                                ? " from-blue-500 from-0% via-blue-400 to-blue-500 to-100% text-indigo-100"
                                : " from-purple-500 from-0% via-pink-500 to-purple-500 to-100% text-purple-100"}`}
                            onClick={() => { 
                                setNoResubmit(false);
                                toggleModal("leaderboard-submit-modal");
                            }}>
                                Submit
                            </button>
                        }
                        <button className={`mt-3 w-[280px] sm:w-[350px] ${getLeaderboardButtonStyling()}`}
                        onClick={() => { leaderboardClicked() }}>
                            Leaderboard
                        </button>
                        <button className={`mt-3 py-[10px] w-[280px] sm:w-[350px] rounded-xl font-semibold bg-zinc-950 border
                        ${isTimeAttack(quizInfo) ? " border-blue-400" : " border-pink-400"}`}
                        onClick={() => { pageStateDispatch({ type: 'restart_quiz' }) }}>
                            Play Again
                        </button>
                    </div>
                </AnimateHeight>
            </div>
            {renderLeaderboardSubmitModal()}
            {renderLeaderboardNavCheckModal()}
        </>);
    }

    return (<>
        <div className="navbar h-0 p-0 w-full" /> {/* Unrendered navbar ref for useAdjustContentHeight */}
        <main className="page-content flex flex-col items-center justify-center overflow-x-hidden overflow-y-scroll
        bg-gradient-to-b from-black via-zinc-950 to-black">
            {renderContent}
        </main>
    </>);
}