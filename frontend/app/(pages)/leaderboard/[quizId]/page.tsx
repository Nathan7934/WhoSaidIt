"use client";

import useGetLeaderboard from "@/app/hooks/api_access/leaderboards/useGetLeaderboard";
import { TimeAttackEntry, SurvivalEntry } from "@/app/interfaces";
import { isTimeAttackEntry, isSurvivalEntry } from "@/app/utilities/miscFunctions";
import StarIcon from "@/app/components/icons/StarIcon";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Leaderboard({ params }: { params: { quizId: string}}) {

    // NextJS route parameters
    const quizId = Number(params.quizId);

    // ----------- Hooks ------------------
    const router = useRouter();
    const getLeaderboard = useGetLeaderboard();

    // ----------- State (Data) -----------
    const [leaderboard, setLeaderboard] = useState<Array<TimeAttackEntry | SurvivalEntry>>([]);

    // ----------- State (UI) -------------
    const [loading, setLoading] = useState<boolean>(true);

    // ----------- Data Retrieval ---------
    useEffect(() => {
        const getPageData = async () => {
            const leaderboard: Array<TimeAttackEntry | SurvivalEntry> | null = await getLeaderboard(quizId);
            if (leaderboard) {
                setLeaderboard(leaderboard);
                setLoading(false);
            } else {
                console.error("Error retrieving leaderboard, redirecting to root");
                router.push("/");
            }
        }
        getPageData();
    }, []);

    // =============== RENDER FUNCTIONS =================

    const renderPodium = () => {
        if (loading) return(<></>);

        const first = leaderboard[0];
        const second = leaderboard[1];
        const third = leaderboard[2];
        return (
            <div className="flex w-full">
                <div className="flex items-end mx-auto w-64 sm:w-96 h-32 sm:h-40">
                    <div className="relative grow rounded-t-xl text-center z-10 animate-podiumGrowThird
                    bg-gradient-to-b from-blue-4 from-70% to-blue-1">
                        <span className="relative top-2 text-4xl font-extrabold text-blue-8
                        animate__animated animate__fadeIn animate__delay-1s">
                            3
                        </span>
                        <div className="absolute flex flex-col top-0 w-full translate-y-[-100%] pb-2 px-[2px] 
                        animate__animated animate__fadeIn animate__delay-1s">
                            <div className="font-light text-sm mb-[2px]">
                                {third.playerName}
                            </div>
                            <div className="flex mx-auto">
                                <StarIcon className="inline w-3 h-3 text-white self-center mr-1" />
                                <span className="text-sm">
                                    {isTimeAttackEntry(third) ? third.score : isSurvivalEntry(third) ? third.streak : ""}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="relative w-[35%] rounded-t-xl drop-shadow-xl text-center z-30 animate-podiumGrowFirst
                    bg-gradient-to-b from-blue-10 from-70% to-blue-3">
                        <span className="relative top-2 text-5xl font-extrabold text-blue-7 
                        animate__animated animate__fadeIn animate__delay-1s">
                            1
                        </span>
                        <div className="absolute flex flex-col top-0 w-full translate-y-[-100%] pb-2 px-[2px] 
                        animate__animated animate__fadeIn animate__delay-1s">
                            <div className="font-light text-lg mb-[2px]">
                                {first.playerName}
                            </div>
                            <div className="flex mx-auto">
                                <StarIcon className="inline w-4 h-4 text-white self-center mr-1" />
                                <span className="text-white">
                                    {isTimeAttackEntry(first) ? first.score : isSurvivalEntry(first) ? first.streak : ""}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="relative grow rounded-t-xl text-center z-10 animate-podiumGrowSecond
                    bg-gradient-to-b from-blue-4 from-80% to-blue-1">
                        <span className="relative top-2 text-4xl font-extrabold text-blue-8 
                        animate__animated animate__fadeIn animate__delay-1s">
                            2
                        </span>
                        <div className="absolute flex flex-col top-0 w-full translate-y-[-100%] pb-2 px-[2px] 
                        animate__animated animate__fadeIn animate__delay-1s">
                            <div className="font-light text-sm mb-[2px] ">
                                {second.playerName}
                            </div>
                            <div className="flex mx-auto">
                                <StarIcon className="inline w-3 h-3 text-white self-center mr-1" />
                                <span className="text-sm">
                                    {isTimeAttackEntry(second) ? second.score : isSurvivalEntry(second) ? second.streak : ""}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <main className="flex flex-col items-center justify-between min-h-screen">
            <div className="absolute top-[50%] translate-y-[-50%] w-[97%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%] 3xl:w-[30%]">
                {renderPodium()}
            </div>
        </main>
    );
}