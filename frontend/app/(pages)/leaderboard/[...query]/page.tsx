"use client";

import useGetLeaderboard from "@/app/hooks/api_access/leaderboards/useGetLeaderboard";
import useGetQuiz from "@/app/hooks/api_access/quizzes/useGetQuiz";
import useValidateUrlToken from "@/app/hooks/security/useValidateUrlToken";
import useAuth from "@/app/hooks/context_imports/useAuth";

import { TimeAttackEntry, SurvivalEntry, TimeAttackQuiz, SurvivalQuiz } from "@/app/interfaces";
import { isTimeAttackEntry, isSurvivalEntry } from "@/app/utilities/miscFunctions";
import StarIcon from "@/app/components/icons/StarIcon";
import StreakIcon from "@/app/components/icons/StreakIcon";

import AnimateHeight from "react-animate-height";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Leaderboard({ params }: { params: { query: string[]}}) {

    // Extracting the NextJS route query parameters "/leaderboard/{quizId}/{?urlToken}"
    const quizId = Number(params.query[0]);
    const urlToken: string | null = params.query.length > 1 ? params.query[1] : null;

    // ----------- Hooks ------------------
    const router = useRouter();
    const getLeaderboard = useGetLeaderboard();
    const getQuiz = useGetQuiz();

    // Security
    const { auth } = useAuth();
    const validateUrlToken = useValidateUrlToken();

    // ----------- State (Data) -----------
    const [leaderboard, setLeaderboard] = useState<Array<TimeAttackEntry | SurvivalEntry>>([]);
    const [quiz, setQuiz] = useState<TimeAttackQuiz | SurvivalQuiz | null>(null);

    // ----------- State (UI) -------------
    const [loading, setLoading] = useState<boolean>(true);
    const [expandedEntry, setExpandedEntry] = useState<number>(-1); // -1 means no entry is expanded

    // ----------- Data Retrieval ---------
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
                }
            }

            const quiz: TimeAttackQuiz | SurvivalQuiz | null = await getQuiz(quizId, shareableToken || undefined);
            const leaderboard: Array<TimeAttackEntry | SurvivalEntry> | null = await getLeaderboard(quizId, shareableToken || undefined);
            if (quiz && leaderboard) {
                setQuiz(quiz);
                setLeaderboard(leaderboard);
                setLoading(false);
            } else {
                console.error("Error retrieving data, redirecting to root");
                router.push("/");
            }
        }
        getPageData();
    }, []);

    // =============== RENDER FUNCTIONS =================

    const ScoreIcon = ({ className }: { className?: string }) => {
        if (!quiz) return null;

        if (quiz.type === "TIME_ATTACK")
            return (<StarIcon className={className} />);
        return (<StreakIcon className={className} />);
    }

    const renderPodium = () => {
        if (loading) return(<div className="flex flex-col justify-center w-full h-32 mt-[90px]" />);

        const first = leaderboard[0];
        const second = leaderboard[1];
        const third = leaderboard[2];
        return (
            <div className="flex w-full">
                <div className="flex items-end mx-auto w-64 sm:w-96 h-32 sm:h-40 mt-[90px]">
                    <div className="relative grow rounded-t-xl text-center z-10 animate-podiumGrowThird
                    bg-gradient-to-b from-blue-4 from-70% to-blue-1">
                        <span className="relative top-2 text-4xl font-extrabold text-blue-8
                        animate__animated animate__fadeIn animate__delay-1s">
                            3
                        </span>
                        {leaderboard.length > 2 &&
                            <div className="absolute flex flex-col top-0 w-full translate-y-[-100%] pb-2 px-[2px] 
                            animate__animated animate__fadeIn animate__delay-1s">
                                <div className="font-light text-sm mb-[2px]">
                                    {third.playerName}
                                </div>
                                <div className="flex mx-auto">
                                    <ScoreIcon className={`inline text-white self-center mr-1
                                    ${quiz && quiz.type == "SURVIVAL" ? " w-4 h-4" : " w-3 h-3" }`} />
                                    <span className="text-sm">
                                        {isTimeAttackEntry(third) ? third.score : isSurvivalEntry(third) ? third.streak : ""}
                                    </span>
                                </div>
                            </div>
                        }
                    </div>
                    <div className="relative w-[35%] h-full rounded-t-xl drop-shadow-xl text-center z-30 animate-podiumGrowFirst
                    bg-gradient-to-b from-blue-10 from-70% to-blue-3">
                        <span className="relative top-2 text-5xl font-extrabold text-blue-7 
                        animate__animated animate__fadeIn animate__delay-1s">
                            1
                        </span>
                        {leaderboard.length > 0 &&
                            <div className="absolute flex flex-col w-[150%] top-0 left-[50%] translate-x-[-50%] translate-y-[-100%] 
                            pb-2 px-[2px] animate__animated animate__fadeIn animate__delay-1s">
                                <div className="font-light text-lg mb-[2px]">
                                    {first.playerName}
                                </div>
                                <div className="flex mx-auto">
                                    <ScoreIcon className="inline w-4 h-4 text-white self-center mr-1" />
                                    <span className="text-white">
                                        {isTimeAttackEntry(first) ? first.score : isSurvivalEntry(first) ? first.streak : ""}
                                    </span>
                                </div>
                            </div>
                        }
                    </div>
                    <div className="relative grow rounded-t-xl text-center z-10 animate-podiumGrowSecond
                    bg-gradient-to-b from-blue-4 from-80% to-blue-1">
                        <span className="relative top-2 text-4xl font-extrabold text-blue-8 
                        animate__animated animate__fadeIn animate__delay-1s">
                            2
                        </span>
                        {leaderboard.length > 1 &&
                            <div className="absolute flex flex-col top-0 w-full translate-y-[-100%] pb-2 px-[2px] 
                            animate__animated animate__fadeIn animate__delay-1s">
                                <div className="font-light text-sm mb-[2px] ">
                                    {second.playerName}
                                </div>
                                <div className="flex mx-auto">
                                    <ScoreIcon className={`inline text-white self-center mr-1
                                    ${quiz && quiz.type == "SURVIVAL" ? " w-4 h-4" : " w-3 h-3" }`} />
                                    <span className="text-sm">
                                        {isTimeAttackEntry(second) ? second.score : isSurvivalEntry(second) ? second.streak : ""}
                                    </span>
                                </div>
                            </div>
                        }
                    </div>
                </div>
            </div>
        );
    }

    const renderLeaderboardEntries = () => {
        if (loading || !quiz) return (
            <div className="flex w-full mt-6">
                <div className="spinner-circle spinner-lg mx-auto" />
            </div>
        );

        if (leaderboard.length === 0) return (
            <div className="w-full flex-col h-52 mt-2 py-20 px-8 border-dashed border-2 border-gray-5 rounded-xl 
            text-gray-10 text-center text-2xl font-light">
                No entries yet!
            </div>
        );

        const entries: Array<JSX.Element> = leaderboard.map((entry, index) => {
            return (
                <div key={index} className={`w-full py-[10px] ${index === 0 ? "" : "border-t border-gray-2"}`}
                onClick={() => setExpandedEntry(expandedEntry === index ? -1 : index)}>
                    <div className="flex">
                        <div className="w-12 text-center text-gray-9 text-lg">
                            {index + 1}
                        </div>
                        <div className="grow text-lg font-light whitespace-nowrap text-ellipsis">
                            {entry.playerName}
                        </div>
                        <div className="flex w-24">
                            <div className="flex mx-auto items-center">
                                <ScoreIcon className={`inline w-4 h-4 text-white self-center mr-[6px]`} />
                                <span className="font-bold">
                                    {isTimeAttackEntry(entry) ? entry.score : isSurvivalEntry(entry) ? entry.streak : ""}
                                </span>
                            </div>
                        </div>
                    </div>
                    <AnimateHeight height={expandedEntry === index ? "auto" : 0} duration={200}>
                        {renderAdditionalEntryInfo(entry)}
                    </AnimateHeight>
                </div>
            );
        });

        return (
            <div className="flex flex-col w-full mt-2 mb-[80px] sm:mb-6 rounded-xl overflow-hidden bg-zinc-950">
                {entries}
            </div>
        );
    }

    const renderAdditionalEntryInfo = (entry: TimeAttackEntry | SurvivalEntry) => {
        return(
            <div className="flex mx-12 mt-1">
                <div className="grow flex gap-3">
                    {isTimeAttackEntry(entry)
                        ? (<>
                            <div className="text-sm text-gray-9">
                                Time: 
                                <span className="ml-2 font-semibold text-white">{entry.timeTaken.toFixed(2)}</span>
                            </div>
                            <div className="text-sm text-gray-9">
                                Avg. Time: 
                                <span className="ml-2 font-semibold text-white">
                                    {entry.averageTimePerQuestion.toFixed(2)}
                                </span>
                            </div>
                        </>)
                        : (
                            <div className="text-sm text-gray-9">
                                Skips Used: 
                                <span className="ml-2 font-semibold text-white">{entry.skipsUsed}</span>
                            </div>
                        )
                    }
                </div>
            </div>
        )
    }

    // =============== MAIN RENDER =============== 

    return (<>
        <div className="w-full h-navbar" /> {/* Navbar spacer */}
        <main className="flex flex-col max-h-content overflow-y-scroll items-center justify-between">
            <div className="mt-7 md:mt-20 lg:mt-36 w-[97%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%] 3xl:w-[30%]">
                <div className="flex justify-center w-full text-3xl sm:text-4xl font-bold whitespace-nowrap">
                    <div className="relative w-[35px] h-[35px] mr-3">
                        <Image src="/sparkles.png" alt="~" fill style={{ objectFit: "contain"}} className="scale-x-[-1]"/>
                    </div>
                    Leaderboard
                    <div className="relative w-[35px] h-[35px] ml-3">
                        <Image src="/sparkles.png" alt="~" fill style={{ objectFit: "contain"}} />
                    </div>
                </div>
                {loading
                    ? (
                        <div className="flex w-full">
                            <div className="skeleton w-32 h-[28px] mx-auto mt-1 rounded-md opacity-50" />
                        </div>
                    )
                    : (
                        <div className="flex justify-center w-full text-lg sm:text-2xl font-extralight text-gray-12 mt-1">
                            {quiz ? quiz.quizName : "..."}
                        </div>
                    )
                }
                {renderPodium()}
                {renderLeaderboardEntries()}
                {!loading && 
                <div className="fixed bottom-0 sm:relative w-full flex bg-gradient-to-t from-black">
                    <button className="mx-auto mb-4 py-3 px-5 rounded-xl bg-black/90 border border-blue-400 text-xl
                    text-blue-50 font-semibold backdrop-blur-sm">
                        Start New Attempt
                    </button>
                </div>
            }
            </div>
            
        </main>
    </>);
}