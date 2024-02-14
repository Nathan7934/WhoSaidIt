"use client";

import { executeEventSequence } from "@/app/utilities/miscFunctions";
import TutorialPagination from "./TutorialPagination";
import PreviewQuiz from "./PreviewQuiz";

import TouchIcon from "../icons/TouchIcon";
import MenuIcon from "../icons/MenuIcon";
import UploadIcon from "../icons/nav-bar/UploadIcon";
import WhatsAppIcon from "../icons/WhatsAppIcon";
import GroupChatIcon from "../icons/nav-bar/GroupChatIcon";
import HomeIcon from "../icons/HomeIcon";
import MoreIcon from "../icons/MoreIcon";

import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";

import "swiper/css";

export default function NewUserTutorial({ userName } : { userName: string }) {

    const [index, setIndex] = useState(0);
    
    const [quizComplete, setQuizComplete] = useState(false);
    const [welcomeSequenceState, setWelcomeSequenceState] = useState<Array<"WAITING" | "ENTERING" | "EXITING">>(["WAITING", "WAITING", "WAITING"]);
    const [swipeGesturePlaying, setSwipeGesturePlaying] = useState(false);

    useEffect(() => {
        if (!quizComplete) return;
        setWelcomeSequenceState(["ENTERING", "WAITING", "WAITING"]);
        const welcomeEventSequence = [
            { action: () => setWelcomeSequenceState(["EXITING", "WAITING", "WAITING"]), delay: 1500 },
            { action: () => setWelcomeSequenceState(["WAITING", "ENTERING", "WAITING"]), delay: 500 },
            { action: () => setWelcomeSequenceState(["WAITING", "EXITING", "WAITING"]), delay: 2500 },
            { action: () => setWelcomeSequenceState(["WAITING", "WAITING", "ENTERING"]), delay: 500 },
            { action: () => setSwipeGesturePlaying(true), delay: 1000 },
        ];
        executeEventSequence(welcomeEventSequence);
    }, [quizComplete]);

    useEffect(() => {
        if (quizComplete) {
            setSwipeGesturePlaying(index === 0);
        }
    }, [index]);

    const handleIndexChange = (index: number) => {
        setIndex(index);
    };

    const getWelcomeTextAnimation = (index: number) => {
        if (welcomeSequenceState[index] === "ENTERING") {
            return " animate__fadeIn";
        } else if (welcomeSequenceState[index] === "EXITING") {
            return " animate__fadeOut";
        }
        return " hidden";
    }

    const tutorialSlides: Array<JSX.Element> = [];
    // ---------------------- PAGE 1: Welcome -----------------------------
    tutorialSlides.push(
        <SwiperSlide key="welcome">
            <div className="flex flex-col justify-center w-full h-full text-center">
                <div className="mt-2 border-b pb-6 border-zinc-900 shadow-[0_10px_10px_1px_rgba(0,0,0,0.8)]">
                    <div className="w-full text-2xl font-semibold animate__animated animate__fadeIn">
                        Welcome!
                    </div>
                    <div className="text-4xl mt-[6px] text-transparent bg-clip-text font-bold overflow-hidden
                    bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 whitespace-nowrap text-ellipsis
                    animate__animated animate__fadeIn">
                        {userName}
                    </div>
                </div>
                <div className="my-auto relative">
                    <PreviewQuiz setQuizComplete={setQuizComplete} />
                    {quizComplete && <>
                        <div className="absolute top-[45%] translate-y-[-50%] left-0 right-0 flex flex-col px-2">
                            <div className={`mt-4 mb-10 text-4xl font-bold animate__animated animate__duration-500ms
                            ${getWelcomeTextAnimation(0)}`}>
                                Correct!
                            </div>
                        </div>
                        <div className="absolute top-[45%] translate-y-[-50%] left-0 right-0 flex flex-col px-2">
                            <div className={`mt-4 mb-10 text-2xl text-zinc-100 animate__animated animate__duration-500ms 
                            ${getWelcomeTextAnimation(1)}`}>
                                But can you guess quotes from your <span className="font-bold">friends</span>?
                            </div>
                        </div>
                        <div className="absolute top-[43%] translate-y-[-50%] left-0 right-0 flex flex-col px-2">
                            <div className={`mt-4 mb-2 text-3xl font-semibold text-zinc-100 animate__animated animate__duration-500ms 
                            ${getWelcomeTextAnimation(2)}`}>
                                Let's find out
                            </div>
                            <div className={`mb-10 text-5xl font-bold animate__animated animate__duration-500ms animate__delay-1250ms
                            ${getWelcomeTextAnimation(2)}`}>
                                WhoSaidIt?
                            </div>
                        </div>
                        {swipeGesturePlaying &&
                            <div className="flex absolute bottom-6 w-full">
                                <TouchIcon className="w-12 h-12 mx-auto animate-swipeLeftIndicator" />
                            </div>
                        }
                    </>}
                </div>
            </div>
            
        </SwiperSlide>
    );
    // ---------------------- PAGE 2: Upload ------------------------------
    tutorialSlides.push(
        <SwiperSlide key="upload">
            <div className="flex flex-col h-full w-full text-center">
                <div className="mt-2 pb-6 shadow-[0_10px_10px_1px_rgba(0,0,0,0.8)] border-b border-zinc-900">
                    <div className="w-full text-4xl font-semibold">Step 1</div>
                    <div className="text-2xl mt-[6px] text-transparent bg-clip-text font-bold
                    bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                        Upload Your Group Chat
                    </div>
                </div>
                <div className={`my-auto flex flex-col items-center relative bottom-2 px-2 animate__animated animate__duration-500ms
                ${index === 1 ? " animate__fadeIn" : " animate__fadeOut"}`}>
                    <div className="text-lg text-zinc-200">
                        On your top right, you will find the
                    </div>
                    <div className="flex items-center gap-2 mt-[2px]">
                        <div className="text-xl font-semibold">Menu Button</div>
                        <MenuIcon className="w-9 h-9 p-1 border border-zinc-800 rounded-lg" />
                    </div>
                    <div className="mt-6 text-lg text-zinc-200">
                        Expand it to display options, including
                    </div>
                    <div className="flex items-center gap-2 mt-1 bg-black border border-zinc-900 rounded-lg py-1 px-3">
                        <UploadIcon className="w-6 h-6" />
                        <div className="text-lg font-semibold">Upload New</div>
                    </div>
                    <div className="mt-10 text-zinc-200 max-w-[450px]">
                        There you will find directions to export and upload your 
                        <span className="mx-1 font-bold">WhatsApp <WhatsAppIcon className="w-6 h-6 inline-block" /></span>
                        group chat.
                    </div>
                </div>
            </div>
        </SwiperSlide>
    );
    // ---------------------- PAGE 3: Create a Quiz -----------------------
    tutorialSlides.push(
        <SwiperSlide key="create">
            <div className="flex flex-col h-full w-full text-center">
                <div className="mt-2 border-b pb-6 border-zinc-900 shadow-[0_10px_10px_1px_rgba(0,0,0,0.8)]">
                    <div className="w-full text-4xl font-semibold">Step 2</div>
                    <div className="text-2xl mt-[6px] text-transparent bg-clip-text font-bold
                    bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                        Create a Quiz
                    </div>
                </div>
                <div className={`my-auto flex flex-col items-center relative bottom-2 px-2 animate__animated animate__duration-500ms
                ${index === 2 ? " animate__fadeIn" : " animate__fadeOut"}`}>
                    <div className="text-[23px] font-medium text-zinc-100">
                        After uploading, you can
                    </div>
                    <div className="btn btn-lg mt-4 mr-2 w-[60%] sm:w-auto bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600
                    text-lg sm:text-base font-medium">
                        Create New Quiz
                    </div>
                    <div className="flex flex-wrap justify-center items-center mt-12 text-lg gap-[6px]">
                        <div className="whitespace-nowrap">This can be done in</div> 
                        <div className="flex items-center gap-2">
                            <span className="font-semibold">dashboard</span>
                            <HomeIcon className="w-7 h-7 p-1 border border-zinc-800 rounded-md" />
                        </div>
                    </div>
                    <div className="flex items-center mt-2 text-lg gap-2">
                        or in <span className="font-semibold">manage group chats</span>
                        <GroupChatIcon className="w-7 h-7 p-1 border border-zinc-800 rounded-md" />
                    </div>
                    <div className="text-2xl font-bold mt-12 text-transparent bg-clip-text
                    bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                        It's quick and easy!
                    </div>
                </div>
            </div>
        </SwiperSlide>
    );
    // ---------------------- PAGE 4: Select Messages ---------------------
    tutorialSlides.push(
        <SwiperSlide key="messages">
            <div className="flex flex-col h-full w-full text-center overflow-hidden">
                <div className="mt-2 border-b pb-6 border-zinc-900 shadow-[0_10px_10px_1px_rgba(0,0,0,0.8)] z-10">
                    <div className="w-full text-4xl font-semibold">Step 3</div>
                    <div className="text-2xl mt-[6px] text-transparent bg-clip-text font-bold
                    bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                        Select Messages
                    </div>
                </div>
                <div className={`grow flex flex-col w-full animate__animated animate__duration-500ms
                ${index === 3 ? " overflow-y-scroll animate__fadeIn" : " overflow-y-hidden animate__fadeOut"}`}>
                    <div className="my-auto pt-14 pb-6 flex flex-col items-center relative bottom-4 px-2">
                        <div className="text-xl max-w-[500px] font-medium">
                            You have the option to pick which messages will appear in your quiz.
                        </div>
                        <div className="flex items-center mt-10">
                            <div className="text-lg font-medium mr-2">First, click on</div>
                            <div className="p-[1px] sm:mt-0 rounded-[9px] sm:rounded-[13px] bg-gradient-to-r from-blue-500 to-indigo-500
                            md:from-blue-500 md:via-indigo-500 md:to-purple-500">
                                <div className="w-full bg-black py-[6px] sm:py-[7px] px-3 rounded-lg sm:rounded-xl whitespace-nowrap">
                                    View Messages
                                </div>
                            </div>
                        </div>
                        <div className="mt-10 text-zinc-100">
                            On mobile, select by holding down a message.
                        </div>
                        <div className="px-4">
                            <video autoPlay loop muted playsInline className="mt-2 border-y border-zinc-700">
                                <source src="/select_message.mp4" type="video/mp4" />
                                Playback not supported
                            </video>
                        </div>
                        <div className="flex items-center gap-3 mt-10">
                            <div className="font-semibold text-lg">After selecting, click</div>
                            <div className="btn bg-blue-600">Add To Quiz</div>
                        </div>
                        <div className="mt-14 text-xl bg-clip-text text-transparent font-bold
                        bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                            Choose your favorite quotes!
                        </div>
                        <div className="mt-14 text-zinc-200 px-2 max-w-[450px]">
                            When viewing messages, you can also filter by <b>participant</b> (sender) and by <b>quiz</b>:
                        </div>
                        <div className="w-full px-4 max-w-[500px] mt-6">
                            <fieldset className="px-[6px] lg:px-3 pb-3 pt-1 border border-zinc-900 w-full rounded-lg lg:w-auto">
                                <legend className="text-zinc-300">Filters</legend>
                                <div className="flex">
                                    <select className="select relative pr-7 text-ellipsis overflow-hidden text-sm bg-zinc-950 border-zinc-700 border-[1px]"
                                    onMouseDown={(e) => {e.preventDefault()}}>
                                        <option>{"<Participant>"}</option>
                                    </select>
                                    <div className="self-center mx-[6px] lg:mx-2 text-lg text-zinc-600">
                                        in
                                    </div>
                                    <select className="select relative pr-7 text-ellipsis overflow-hidden text-sm bg-zinc-950 border-zinc-700 border-[1px]"
                                    onMouseDown={(e) => {e.preventDefault()}}>
                                        <option>{"<Quiz>"}</option>
                                    </select>
                                </div>
                            </fieldset>
                        </div>
                        <div className="mt-6 text-zinc-200 px-2 max-w-[500px]">
                            This way, you can view any messages sent by a specific person, or any messages you've included in a quiz.
                        </div>
                    </div>
                </div>
            </div>
        </SwiperSlide>
    );
    // ---------------------- PAGE 5: Share -------------------------------
    tutorialSlides.push(
        <SwiperSlide key="share">
            <div className="flex flex-col items-center h-full w-full text-center">
                <div className="mt-2 w-full border-b pb-6 border-zinc-900 shadow-[0_10px_10px_1px_rgba(0,0,0,0.8)]">
                    <div className="w-full text-4xl font-semibold">Step 4</div>
                    <div className="text-2xl mt-[6px] text-transparent bg-clip-text font-bold
                    bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                        Share Your Quiz
                    </div>
                </div>
                <div className={`my-auto px-2 animate__animated animate__duration-500ms
                ${index === 4 ? " animate__fadeIn" : " animate__fadeOut"}`}>
                    <div className="text-2xl">
                        Select a quiz to view its
                    </div>
                    <div className="flex w-full justify-center items-center gap-2 mt-1 text-2xl relative left-2">
                        <div>available <b>options</b></div>
                        <MoreIcon className="w-9 h-9 p-1 border border-zinc-800 rounded-lg" />
                    </div>
                    <div className="flex items-center gap-3 w-full mt-8">
                        <div className="ml-auto text-lg">Then, click on</div>
                        <div className="mr-auto btn btn-md text-base font-medium 
                        bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 text-blue-50">
                            Copy Shareable Link
                        </div>
                    </div>
                    <div className="mt-8 text-lg text-zinc-100 font-medium max-w-[400px]">
                        This will generate a link that you can send to your friends.
                    </div>
                    <div className="mt-12 text-xl bg-clip-text text-transparent font-bold
                    bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                        Anyone with the link can play!
                    </div>
                </div>
            </div>
        </SwiperSlide>
    );
    // ---------------------- PAGE 6: Compete -----------------------------
    tutorialSlides.push(
        <SwiperSlide key="compete">
            <div className="flex flex-col h-full w-full text-center">
                <div className="mt-2 border-b pb-6 border-zinc-900 shadow-[0_10px_10px_1px_rgba(0,0,0,0.8)] z-10">
                    <div className="w-full text-4xl font-semibold">Step 5</div>
                    <div className="text-2xl mt-[6px] text-transparent bg-clip-text font-bold
                    bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                        Compete for High Scores!
                    </div>
                </div>
                {/* Animated podium preview */}
                <div className={`my-auto px-4 animate__animated animate__duration-500ms overflow-y-scroll
                ${index === 5 ? " animate__fadeIn" : " animate__fadeOut"}`}>
                    <div className="flex w-full mt-6">
                        <div className="flex items-end mx-auto w-64 h-[100px]">
                            <div className={`relative grow rounded-t-xl text-center z-10 border-x-2 border-t-2 border-zinc-400
                            ${index === 5 ? " animate-podiumGrowThird" : " opacity-25"}`}>
                                <span className={`relative top-2 text-4xl font-bold text-zinc-300
                                ${index === 5 ? " animate__animated animate__fadeIn animate__delay-1s" : ""}`}>
                                    3
                                </span>
                            </div>
                            <div className={`relative w-[35%] h-full rounded-t-xl drop-shadow-xl text-center z-30 border-x-2 border-t-2 border-zinc-400
                            ${index === 5 ? " animate-podiumGrowFirst" : " opacity-25"}`}>
                                <span className={`relative top-2 text-5xl font-bold text-zinc-300
                                ${index === 5 ? " animate__animated animate__fadeIn animate__delay-1s" : ""}`}>
                                    1
                                </span>
                            </div>
                            <div className={`relative grow rounded-t-xl text-center z-10 border-x-2 border-t-2 border-zinc-400
                            ${index === 5 ? " animate-podiumGrowSecond" : " opacity-25"}`}>
                                <span className={`relative top-2 text-4xl font-bold text-zinc-300
                                ${index === 5 ? " animate__animated animate__fadeIn animate__delay-1s" : ""}`}>
                                    2
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 text-lg text-zinc-200">
                        Submit your results to the
                    </div>
                    <div className="w-full text-3xl mb-2 mt-1 font-medium flex justify-center">
                        <div className="relative w-[30px] h-[30px] mr-3 top-[3px]">
                            <Image src="/sparkles.png" alt="~" fill style={{ objectFit: "contain"}} className="scale-x-[-1]"/>
                        </div>
                        Leaderboard
                        <div className="relative w-[30px] h-[30px] ml-3 top-[3px]">
                            <Image src="/sparkles.png" alt="~" fill style={{ objectFit: "contain"}} />
                        </div>
                    </div>
                    <div className="mt-9 text-xl bg-clip-text text-transparent font-bold
                    bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                        You and your friends can see each other's scores!
                    </div>
                    <div className={`text-2xl mt-9 font-medium
                    ${index === 5 ? " animate__animated animate__fadeIn animate__delay-2s" : ""}`}>
                        Get started now!
                    </div>
                    {/* <div className="mt-9 text-lg text-zinc-200">
                        To see who's in the lead, click on
                    </div>
                    <div className="flex items-center w-full justify-center mt-2 mb-6">
                        <div className="p-[1px] sm:mt-0 rounded-[9px] sm:rounded-[13px] bg-gradient-to-r from-blue-500 to-indigo-500
                        md:from-blue-500 md:via-indigo-500 md:to-purple-500">
                            <div className="w-full bg-black py-[6px] sm:py-[7px] px-3 rounded-lg sm:rounded-xl whitespace-nowrap">
                                Quiz Leaderboard
                            </div>
                        </div>
                    </div> */}
                </div>
            </div>
        </SwiperSlide>
    );

    return (
        <div className="relative w-[98%] max-h-[650px] md:w-[80%] lg:w-[70%] xl:w-[50%] 2xl:w-[40%] 3xl:w-[30%] mt-5 mb-3 mx-auto
        bg-[#050507] pt-4 pb-8 rounded-xl border border-zinc-800 overflow-y-scroll">
            <Swiper className="h-full" onSlideChange={(swiper) => setIndex(swiper.activeIndex)}>
                {tutorialSlides}
            </Swiper>
            <div className="absolute bottom-3 left-0 right-0">
                <TutorialPagination index={index} totalPages={tutorialSlides.length} />
            </div>
        </div>
    )
}