import { playSoundEffect } from "@/app/utilities/miscFunctions";

import { useState, useRef } from "react";

interface PreviewQuizProps {
    setQuizComplete: React.Dispatch<React.SetStateAction<boolean>>;
}
export default function PreviewQuiz({ setQuizComplete }: PreviewQuizProps) {
    // Renders a preview quiz to entice the user during the tutorial

    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [isExiting, setIsExiting] = useState<boolean>(false);

    // Sound effect refs
    const correctAudioRef = useRef<HTMLAudioElement>(new Audio("/correct.mp3"));
    const incorrectAudioRef = useRef<HTMLAudioElement>(new Audio("/incorrect.mp3"));

    const handleAnswerSelection = (option: number) => {
        setSelectedAnswer(option);
        setIsCorrect(option === 1);
        if (option === 1) {
            playSoundEffect(correctAudioRef);
            setTimeout(() => {
                setIsExiting(true);
                setTimeout(() => {
                    setQuizComplete(true);
                }, 500);
            }, 2000);
        } else {
            playSoundEffect(incorrectAudioRef);
            setTimeout(() => {
                setSelectedAnswer(null);
                setIsCorrect(null);
            }, 300);
        }
    }

    const determineOptionColor = (option: number): string => {
        if (selectedAnswer === option) {
            if (isCorrect === true) {
                return `bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500`;
            } else {
                return "bg-black";
            }
        } else {
            return "bg-black";
        }
    }

    const determineAnimation = (option: number): string => {
        if (selectedAnswer === option) {
            if (isCorrect === true) {
                return "animate-correctAnswer";
            } else {
                return "animate-incorrectAnswer";
            }
        } else {
            return "";
        }
    }

    return (
        <div className={`flex flex-col mx-auto w-full px-2 max-w-[450px] animate__animated
        ${isExiting ? " animate__duration-500ms animate__fadeOut" : " animate__fadeIn animate__delay-1500ms"}`}>
            <div className="mb-6 text-[20px] font-medium text-zinc-100">
                Can you guess who said this quote?
            </div>
            <div className="p-[1px] rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                <div className="w-full rounded-xl bg-black py-6 px-3 text-xl font-medium text-zinc-300">
                    "I know very little about acting,<br/>I'm just an incredibly gifted faker."
                </div>
            </div>
            <div className={`p-[1px] mt-4 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500
            ${determineAnimation(0)}`}>
                <button className={`w-full rounded-xl py-2 text-center text-lg font-semibold text-zinc-200
                ${determineOptionColor(0)}`} disabled={isExiting}
                onClick={() => handleAnswerSelection(0)}>
                    Samuel L. Jackson
                </button>
            </div>
            <div className={`p-[1px] mt-2 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500
            ${determineAnimation(1)}`}>
                <button className={`w-full rounded-xl py-2 text-center text-lg font-semibold text-zinc-200
                ${determineOptionColor(1)}`} disabled={isExiting}
                onClick={() => handleAnswerSelection(1)}>
                    Robert Downy Jr.
                </button>
            </div>
            <div className={`p-[1px] mt-2 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500
            ${determineAnimation(2)}`}>
                <button className={`w-full rounded-xl py-2 text-center text-lg font-semibold text-zinc-200
                ${determineOptionColor(2)}`} disabled={isExiting}
                onClick={() => handleAnswerSelection(2)}>
                    Morgan Freeman
                </button>
            </div>
        </div>
    );
}