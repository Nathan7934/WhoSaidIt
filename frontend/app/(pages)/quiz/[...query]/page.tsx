"use client";

import useValidateUrlToken from "@/app/hooks/security/useValidateUrlToken";
import useAuth from "@/app/hooks/security/useAuth";

import { SurvivalQuizInfo, TimeAttackQuizInfo, Message, Participant } from "@/app/interfaces";
import AnimatedScoreCounter from "@/app/components/AnimatedScoreCounter";

import useGetQuizInfo from "@/app/hooks/api_access/quizzes/useGetQuizInfo";
import useGetRandomQuizMessage from "@/app/hooks/api_access/messages/useGetRandomQuizMessage";

import AnimateHeight from "react-animate-height";
import { Height } from "react-animate-height";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useReducer } from "react";

// The page state is used to determine what to render on the level of the page.
// Transitional states are used for animations, etc.
type PageState = "LANDING" | "QUIZ_STARTING" | "QUIZ" | "QUIZ_ENDING" | "RESULTS";
type PageStateReducer = (state: PageState, action: PageStateReducerAction) => PageState;
interface PageStateReducerAction {
    type: PageStateReducerActionType;
}
type PageStateReducerActionType = "init_start_quiz" | "start_quiz" | "init_end_quiz" | "end_quiz";

// The game state is used to determine what to render on the level of the game.
type GameState = "QUESTION_STARTING" | "QUESTION" | "CORRECT_ANSWER" | "INCORRECT_ANSWER";
type GameStateReducer = (state: GameState, action: GameStateReducerAction) => GameState;
interface GameStateReducerAction {
    type: GameStateReducerActionType;
}
type GameStateReducerActionType = "init_next_question" | "next_question" |  "correct_answer" | "incorrect_answer";

// Custom type guard
const isTimeAttackQuizInfo = (quizInfo: TimeAttackQuizInfo | SurvivalQuizInfo): quizInfo is TimeAttackQuizInfo => {
    return quizInfo.type === "TIME_ATTACK";
}

export default function Quiz({ params }: { params: { query: string[] } }) {

    // Extracting the NextJS route query parameters "/quiz/{quizId}/{?urlToken}"
    const quizId = Number(params.query[0]);
    const urlToken: string | null = params.query.length > 1 ? params.query[1] : null;

    // ----------- Hooks ------------------
    const router = useRouter();

    // API access hooks
    const getQuizInfo = useGetQuizInfo();
    const getRandomQuizMessage = useGetRandomQuizMessage();

    // Security
    const { auth } = useAuth();
    const validateUrlToken = useValidateUrlToken();
    // This is the jwt that is used to authenticate the user if they are not logged in. It is retrieved from the urlToken.
    const [shareableToken, setShareableToken] = useState<string | null>(null);

    // ----------- State (Data) -----------
    const [quizInfo, setQuizInfo] = useState<TimeAttackQuizInfo | SurvivalQuizInfo | null>(null);
    const [currentMessage, setCurrentMessage] = useState<Message | null>(null);
    const [nextMessage, setNextMessage] = useState<Message | null>(null);
    const [seenMessageIds, setSeenMessageIds] = useState<Array<number>>([]);

    // ----------- State (Game) -----------
    const [score, setScore] = useState<number>(0); // For Survival Quizzes, this state records the streak instead.
    const [scoreGained, setScoreGained] = useState<number>(0); // The score gained for a specific question
    // The options for the current message. Max 4 options, including the correct answer.
    const [participantOptions, setParticipantOptions] = useState<Array<Participant>>([]);
    const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
    const [questionNumber, setQuestionNumber] = useState<number>(1); // The current question number [1, ...

    // ----------- State (UI) -------------
    const [staticDataLoading, setStaticDataLoading] = useState<boolean>(true);
    const [introSplashTextEntering, setIntroSplashTextEntering] = useState<Array<"WAITING" | "ENTERING" | "EXITING">>(["WAITING", "WAITING"]);
    const [landingActionsHeight, setLandingActionsHeight] = useState<Height>(0); // The height of the landing page actions [Begin Quiz, Leaderboard, Info]
    const [landingActionsVisible, setLandingActionsVisible] = useState<boolean>(false); // Whether the landing page actions are visible

    // Timing
    const [quizStartTime, setQuizStartTime] = useState<Date>(new Date());
    const [questionStartTime, setQuestionStartTime] = useState<Date>(new Date());
    const [totalTimeTaken, setTotalTimeTaken] = useState<number | null>(null); // In milliseconds

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
            setStaticDataLoading(false);
            
            // Begin the intro splash timing sequence
            const introSplashSequence = [
                { action: () => setIntroSplashTextEntering(["ENTERING", "WAITING"]), delay: 1800 },
                { action: () => setIntroSplashTextEntering(["EXITING", "WAITING"]), delay: 2250 },
                { action: () => setIntroSplashTextEntering(["WAITING", "ENTERING"]), delay: 500 },
                { action: () => setIntroSplashTextEntering(["WAITING", "EXITING"]), delay: 2500},
                { action: () => setLandingActionsHeight("auto"), delay: 500 },
                { action: () => setLandingActionsVisible(true), delay: 500 }
            ];
            executeEventSequence(introSplashSequence);
        }
        getPageData();
    }, []);

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

    // Gets a random selection of 4 participants to choose from, including the correct participant.
    const generateParticipantOptions = (
        quizInfo: SurvivalQuizInfo | TimeAttackQuizInfo | null, 
        currentSender: Participant | undefined
    ): Array<Participant> => {
        if (!quizInfo || !currentSender) return [];
        let potentialParticipants: Array<Participant> = quizInfo.participants.filter(p => p.id !== currentSender.id);
        const options = [currentSender];
        while (options.length < Math.min(4, potentialParticipants.length)) {
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

    // ----- UI HELPERS -----

    const executeEventSequence = (sequence: { action: () => void, delay: number }[]) => {
        let index = 0;
        const executeNext = () => {
            const event = sequence[index];
            setTimeout(() => {
                event.action();
                index++;
                if (index < sequence.length) executeNext();
            }, event.delay);
        };
        executeNext();
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
                }, 3000);
                return "QUIZ_ENDING";

            case "end_quiz":
                return "RESULTS";

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
                setQuestionStartTime(new Date());
                setScoreGained(0);
                return "QUESTION";

            case "correct_answer":
                if (isTimeAttackQuizInfo(quizInfo)) {
                    const { initialQuestionScore, penaltyPerSecond } = quizInfo;
                    const secondsTaken = Math.floor((Date.now() - questionStartTime.getTime()) / 1000); // Convert to seconds (rounded down)
                    const qScore = Math.max(initialQuestionScore - (secondsTaken * penaltyPerSecond), 150);
                    setScoreGained(qScore);
                    setScore(score + qScore);
                } else {
                    setScore(score + 1);
                }

                setTimeout(() => {
                    gameStateDispatch({ type: "init_next_question" });
                }, 2000);
                return "CORRECT_ANSWER";
            
            case "incorrect_answer":
                if (isTimeAttackQuizInfo(quizInfo)) {
                    const { wrongAnswerPenalty } = quizInfo;
                    setScoreGained(-wrongAnswerPenalty);
                    setScore(score - wrongAnswerPenalty);
                } else {
                    // In Survival Quizzes, an incorrect answer ends the quiz
                    pageStateDispatch({ type: "init_end_quiz" });
                }

                setTimeout(() => {
                    gameStateDispatch({ type: "init_next_question" });
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
    // =+=+=+=+=+=+=+=+= LOADING PAGE =+=+=+=+=+=+=+=+=
    if (staticDataLoading || !quizInfo || !currentMessage) {
        renderContent = (
            <div className="absolute flex flex-col left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
                <svg className="spinner-ring spinner-lg mx-auto mt-3" viewBox="25 25 50 50" strokeWidth="5">
                    <circle cx="50" cy="50" r="20" />
                </svg>
            </div>
        );
    // =+=+=+=+=+=+=+=+= LANDING PAGE =+=+=+=+=+=+=+=+=
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

        renderContent = (<div className={`w-full ${pageState === "QUIZ_STARTING" ? "animate__animated animate__fadeOut animate__duration-500ms" : ""}`}>
            <div className="relative bottom-8 flex justify-center mb-4 text-gray-12 text-5xl font-bold noselect">
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
                    <div className={`text-3xl font-bold text-transparent bg-clip-text text-center bg-gradient-to-r
                        ${isTimeAttackQuizInfo(quizInfo) 
                            ? " from-blue-400 via-blue-300 to-blue-400" 
                            : " from-purple-400 via-pink-400 to-purple-400"}`
                    }>
                        {quizInfo.quizName}
                    </div>
                    <div className="mt-2 text-gray-12 text-2xl">
                        {isTimeAttackQuizInfo(quizInfo) ? "Time Attack Quiz" : "Survival Quiz"}
                    </div>
                    <button className={`mt-10 py-3 bg-gradient-to-r rounded-2xl w-[280px] font-semibold text-2xl active:scale-[98%] transition duration-100 ease-in-out
                        ${isTimeAttackQuizInfo(quizInfo)
                            ? " from-blue-500 from-0% via-blue-400 to-blue-500 to-100% text-indigo-100 border border-blue-400"
                            : " from-purple-500 from-0% via-pink-500 to-purple-500 to-100% text-purple-100 border border-pink-400"}`
                    } onClick={() => pageStateDispatch({ type: "init_start_quiz" })}>
                        Begin Quiz
                    </button>
                    <Link href={`/leaderboard/${quizId}${shareableToken ? `/${shareableToken}` : ""}`}>
                        <button className={`mt-3 py-[10px] w-[280px] rounded-xl font-semibold bg-zinc-950 border
                        ${isTimeAttackQuizInfo(quizInfo) ? " border-blue-400" : " border-pink-400"}`}>
                            Leaderboard
                        </button>
                    </Link>
                    <button className={`mt-3 py-[10px] w-[280px] rounded-xl font-semibold bg-zinc-950 border
                    ${isTimeAttackQuizInfo(quizInfo) ? " border-blue-400" : " border-pink-400"}`}>
                        Details
                    </button>
                </div>
            </AnimateHeight>
        </div>);
    // =+=+=+=+=+=+=+=+= QUIZ PAGE =+=+=+=+=+=+=+=+=
    } else if (pageState === "QUIZ" || pageState === "QUIZ_ENDING") {

        const renderParticipantOptions = () => {
            return participantOptions.map((participant) => {
                const isCorrect = participant.id === currentMessage.sender.id;
                const isSelected = selectedParticipant?.id === participant.id;
                let extraClasses: string;
                switch (gameState) {
                    case "QUESTION_STARTING":
                        extraClasses = `animate__animated animate__flipOutX animate__duration-500ms 
                        ${isCorrect ? " bg-green-400" : !isCorrect && isSelected ? " bg-red-400" : " bg-zinc-950"}`; 
                        break;
                    case "QUESTION":
                        extraClasses = "bg-zinc-950 animate__animated animate__flipInX animate__duration-500ms"; break;
                    case "CORRECT_ANSWER":
                        extraClasses = isCorrect ? "bg-green-400" : "bg-zinc-950"; break;
                    case "INCORRECT_ANSWER":
                        extraClasses = isCorrect ? "bg-green-400" : isSelected ? "bg-red-400" : "bg-zinc-950"; break;
                }
                return (
                    <button key={participant.id} 
                    className={`w-full py-[10px] my-1 rounded-xl font-semibold text-lg 
                    ${extraClasses}`} onClick={() => {
                        if (gameState === "QUESTION") {
                            setSelectedParticipant(participant);
                            if (isCorrect) {
                                gameStateDispatch({ type: "correct_answer" });
                            } else {
                                gameStateDispatch({ type: "incorrect_answer" });
                            }
                        }
                    }}>
                        {participant.name} {isCorrect ? "(*)" : ""}
                    </button>
                );
            });
        }

        const getCardAnimClass = (): string => {
            if (questionNumber % 2 === 0)
                return " animate-messageCardSlideOutUpLeft";
            return " animate-messageCardSlideOutUpRight";
        }

        renderContent = (
            <div className="flex flex-col items-center min-w-[270px] w-[90%] max-w-[500px] animate__animated animate__fadeIn animate__duration-500ms">
                <AnimatedScoreCounter type={isTimeAttackQuizInfo(quizInfo) ? "score" : "streak"} 
                score={score} scoreGained={scoreGained} delay={1000} duration={800} />
                <div className="relative w-full h-[320px] sm:h-[350px] mt-4 mb-4 sm:my-6 bg-zinc-950 rounded-xl border border-[#858585]
                shadow-[1px_1px_0px_1px_#858585]">
                    {/* We render the next message underneath the current message */}
                    {nextMessage && (
                        <div className="absolute flex left-0 top-0 m-[-1px] w-full h-[320px] sm:h-[350px] bg-zinc-950 rounded-xl border border-[#858585]
                        py-5 px-3">
                            <div className="grow px-2 w-full h-full text-xl font-semibold overflow-y-scroll overflow-x-hidden">
                                {nextMessage.content}
                            </div>
                        </div>
                    )}
                    {/* Current message */}
                    <div className={`absolute flex left-0 top-0 m-[-1px] w-full h-[320px] sm:h-[350px] bg-zinc-950 rounded-xl border border-[#858585] py-5 px-3
                    ${gameState === "QUESTION_STARTING" ? getCardAnimClass() : ""}`}>
                        <div className="grow px-2 w-full h-full text-xl font-semibold overflow-y-scroll overflow-x-hidden">
                            {currentMessage.content}
                        </div>
                    </div>
                </div>
                <div className="flex flex-col w-full">
                    {renderParticipantOptions()}
                </div>
            </div>
        );
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center overflow-hidden
        bg-gradient-to-b from-black via-zinc-950 to-black">
            {renderContent}
        </main>
    );
}