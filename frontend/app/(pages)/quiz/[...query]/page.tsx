"use client";

import useValidateUrlToken from "@/app/hooks/security/useValidateUrlToken";
import useAuth from "@/app/hooks/security/useAuth";

import { SurvivalQuizInfo, TimeAttackQuizInfo, Message, Participant } from "@/app/interfaces";

import useGetQuizInfo from "@/app/hooks/api_access/quizzes/useGetQuizInfo";
import useGetRandomQuizMessage from "@/app/hooks/api_access/messages/useGetRandomQuizMessage";

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

// Custom type guards
const isTimeAttackQuizInfo = (quizInfo: TimeAttackQuizInfo | SurvivalQuizInfo): quizInfo is TimeAttackQuizInfo => {
    return quizInfo.type === "TIME_ATTACK";
}
const isSurvivalQuizInfo = (quizInfo: TimeAttackQuizInfo | SurvivalQuizInfo): quizInfo is SurvivalQuizInfo => {
    return quizInfo.type === "SURVIVAL";
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

    // ----------- State (Game/UI) -----------
    const [score, setScore] = useState<number>(0); // For Survival Quizzes, this state records the streak instead.
    const [scoreGained, setScoreGained] = useState<number>(0); // The score gained for a specific question
    // The options for the current message. Max 4 options, including the correct answer.
    const [participantOptions, setParticipantOptions] = useState<Array<Participant>>([]);

    // Timing
    const [quizStartTime, setQuizStartTime] = useState<Date>(new Date());
    const [questionStartTime, setQuestionStartTime] = useState<Date>(new Date());
    const [totalTimeTaken, setTotalTimeTaken] = useState<number | null>(null); // In milliseconds

    // ----- Data Retrieval/Authentication -----
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
                setParticipantOptions(generateParticipantOptions(currentMessage.sender));
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
        }
        getPageData();
    }, []);

    // ----- Data Helpers -----
    const getNextMessage = async () => {
        if (nextMessage) setCurrentMessage(nextMessage);
        setParticipantOptions(generateParticipantOptions(currentMessage?.sender));
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
    const generateParticipantOptions = (currentSender: Participant | undefined): Array<Participant> => {
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

    // ----- State Change Handlers/Reducers -----

    // This reducer handles state changes specific to the page. I.e., transitions between the landing page, quiz, and results.
    const pageStateReducer = (state: PageState, action: PageStateReducerAction): PageState => {
        switch (action.type) {
            case "init_start_quiz": // Animations: Fade out the landing page
                setTimeout(() => {
                    pageStateDispatch({ type: "start_quiz" });
                }, 3000);
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
                }, 1000);
                return "QUESTION_STARTING";

            case "next_question":
                getNextMessage();
                setQuestionStartTime(new Date());
                setScoreGained(0);
                return "QUESTION";

            case "correct_answer":
                if (isTimeAttackQuizInfo(quizInfo)) {
                    const { initialQuestionScore, penaltyPerSecond } = quizInfo;
                    const secondsTaken = Math.floor((Date.now() - questionStartTime.getTime()) / 1000); // Convert to seconds (rounded down)
                    const qScore = initialQuestionScore - (secondsTaken * penaltyPerSecond);
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

    // ----------- REDUCERS -----------
    const [pageState, pageStateDispatch] = useReducer<PageStateReducer>(pageStateReducer, "LANDING");
    const [gameState, gameStateDispatch] = useReducer<GameStateReducer>(gameStateReducer, "QUESTION");

    return (<>
        <div>Quiz Id: {quizId}</div>
        <div>Participants:</div>
        <div className="flex flex-col">
            {quizInfo?.participants.map((participant, index) => {
                return <div key={index}>{participant.name}</div>
            })};
        </div>
    </>);
}