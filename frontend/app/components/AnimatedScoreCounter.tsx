import StarIcon from "@/app/components/icons/StarIcon";
import StreakIcon from "@/app/components/icons/StreakIcon";

import { useState, useEffect, useRef } from 'react';

interface AnimatedScoreProps {
    type: "score" | "streak";
    score: number;
    scoreGained: number;
    delay: number;
    duration: number;
}
export default function AnimatedScoreCounter({ type, score, scoreGained, delay, duration }: AnimatedScoreProps) {

    const [displayScore, setDisplayScore] = useState<number>(score);
    const [displayScoreGained, setDisplayScoreGained] = useState<number>(scoreGained);

    const animationFrame = useRef<number>(0); // Used to cancel the animation frame on unmount
    const screenRefreshRate = useRef<number>(60); // Default to the most common value

    const animateScore = () => {
        const frameDuration = 1000 / screenRefreshRate.current; // Duration of a single frame in ms
        const frameSkipFactor = Math.ceil(screenRefreshRate.current / 24);
        let frame = 0;

        const animate = () => {
            frame++;
            const progress = frame / (duration / frameDuration); // Progress of the animation (0-1)
            const deltaInterpolated = Math.round(scoreGained * progress);
            if (frame % frameSkipFactor === 0) {
                // We only rerender the score once every <frameSkipFactor> frames to approximate 24fps
                setDisplayScore(score - scoreGained + deltaInterpolated);
                setDisplayScoreGained(scoreGained - deltaInterpolated);
            }

            if (frame < duration / frameDuration) {
                animationFrame.current = requestAnimationFrame(animate); // Attach callback to the next render (Loops)
            } else {
                // Animation is finished, break loop, set the display score to the final value
                setDisplayScore(score);
                setDisplayScoreGained(0);
            }
        };

        animate();
    }

    // Gets the screen refresh rate by measuring the time between two frames
    const getScreenRefreshRate = (): Promise<number> =>
        new Promise<number>(resolve => 
            requestAnimationFrame((t1: number) =>
                requestAnimationFrame((t2: number) => resolve(1000 / (t2 - t1)))
            )
        );

    // Sets the screen refresh rate on component mount
    useEffect(() => {
        getScreenRefreshRate().then((refreshRate: number) => {
            screenRefreshRate.current = refreshRate;
        });
    }, []);

    // Trigger the animation after a set delay when the score changes
    useEffect(() => {
        setDisplayScore(score - scoreGained); // Set the score to the value before the score increase
        setDisplayScoreGained(scoreGained);
        if (scoreGained !== 0) {
            const animDelay = type === "score" ? delay : 2000;
            setTimeout(() => {
                if (type === "score") {
                    animationFrame.current = requestAnimationFrame(animateScore);
                } else {
                    setDisplayScore(score);
                    setDisplayScoreGained(0);
                }
            }, animDelay);
        }
        return () => cancelAnimationFrame(animationFrame.current);
    }, [score, scoreGained]);

    // MAIN RENDER
    return (
        <div className="flex relative right-[6px] mx-auto items-center">
            {type === "score" && <StarIcon className="w-7 h-7 mr-[6px]" />}
            {type === "streak" && <StreakIcon className="w-7 h-7 mr-[6px]" />}
            <div className={`text-5xl font-semibold 
            ${displayScore < 0 ? " text-red-500" : ""}`}>
                {displayScore}
            </div>
            {displayScoreGained !== 0 &&
                <div className="absolute flex left-[100%] top-0 bottom-0 items-center
                animate__animated animate__bounceIn animate__duration-500ms">
                    <div className={`ml-2 text-2xl font-semibold
                    ${displayScoreGained < 0 ? " text-red-500" : " text-green-500"}`}>
                        {displayScoreGained > 0 ? "+" : ""}{displayScoreGained}
                    </div>
                </div>
            }
        </div>
    );
}