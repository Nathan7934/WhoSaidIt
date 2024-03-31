"use client";

import useAdjustContentHeight from "@/app/hooks/useAdjustContentHeight";
import TutorialPagination from "@/app/components/tutorial/TutorialPagination";
import { NAVBAR_HEIGHT } from "@/app/constants";

import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from 'swiper/react';
import { SwiperClass } from "swiper/react";
import PreviewVideoPlayer from "@/app/components/PreviewVideoPlayer";
import PreviewNavArrowIcon from "@/app/components/icons/landing/PreviewNavArrowIcon";

import { useState, useEffect, useRef } from "react";

// Import Swiper styles
import 'swiper/css';

export default function Landing() {

    useAdjustContentHeight(".navbar", ".page-content");

    const [widthBreakpoint, setWidthBreakpoint] = useState<"SM" | "MD" | "LG">("LG");
    const [index, setIndex] = useState<number>(0);
    const [videoDimensions, setVideoDimensions] = useState<{ width: number, height: number }>({ width: 370, height: 800 });

    const [navLeftAnim, setNavLeftAnim] = useState<boolean>(false);
    const [navRightAnim, setNavRightAnim] = useState<boolean>(false);

    const swiperRef = useRef<SwiperClass | null>(null);

    useEffect(() => {
        const handleResize = () => {
            setWidthBreakpoint(window.innerWidth < 900 ? "SM" : window.innerWidth < 1280 ? "MD" : "LG");
            setVideoDimensions(determineVideoDimensions());
        }
        handleResize();
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const getSlidesPerView = () => {
        switch (widthBreakpoint) {
            case "SM": return 1;
            case "MD": return 2;
            case "LG": return 3;
        }
    }

    const getSpaceBetween = () => {
        switch (widthBreakpoint) {
            case "SM": return 0;
            case "MD": return 20;
            case "LG": return 30;
        }
    }

    const getNumberOfPages = () => {
        switch (widthBreakpoint) {
            case "SM": return 5;
            case "MD": return 4;
            case "LG": return 3;
        }
    }

    const determineVideoDimensions = (): {width: number, height: number} => {
        // We want to ensure that the video maintains a consistent aspect ratio.
        // We want to make sure the height of the video does not overflow the screen.
        // Preview video dimensions are 1242x2688. Have max height be 800px.

        const widthFactor = 1242 / 2688;
        const height = Math.min(800, window.innerHeight - NAVBAR_HEIGHT - 60);
        const width = Math.round(height * widthFactor);

        return { width, height };
    }

    const goToNextSlide = () => {
        const swiperElement: SwiperClass | null = swiperRef.current;
        if (swiperElement) {
            if (index < getNumberOfPages() - 1) setNavRightAnim(true);
            swiperElement.slideNext();
        }
    }

    const goToPrevSlide = () => {
        const swiperElement: SwiperClass | null = swiperRef.current;
        if (swiperElement) {
            if (index > 0) setNavLeftAnim(true);
            swiperElement.slidePrev();
        }
    }

    return (<>
        <div className="navbar h-navbar w-full" /> {/* Navbar spacer */}
        <main className="page-content flex flex-col overflow-y-scroll items-center">
            {/* Landing Header Banner */}
            <div className="flex w-full lg:h-[600px] justify-center items-center bg-gradient-to-t from-blue-800 to-purple-800">
                <div className="flex flex-col items-center lg:flex-row gap-6">
                    <div className="mt-20 mb-6 lg:ml-4 lg:mt-auto md:mb-auto max-w-[700px] lg:max-w-[600px]">
                        <div className="text-4xl md:text-5xl text-center lg:text-left font-extrabold mb-12">
                            How well do your friends know each other?
                        </div>
                        <div className="text-base md:text-lg lg:text-xl font-light text-center lg:text-left px-4 lg:px-0">
                            Easily create and share custom quizzes using the messages from your WhatsApp group chats.
                        </div>
                    </div>
                    <Image className="relative md:top-3" src="/landing/landing-header-devices.png" alt="Device Preview" width={600} height={600} />
                </div>
            </div>
            {/* Register & Sign Up buttons */}
            <div className="w-full flex flex-col items-center py-10 bg-zinc-950 gap-7 border-y border-zinc-700">
                <div className="text-3xl font-bold text-center">
                    Get started now with <span className="font-extrabold">WhoSaidIt!</span>
                </div>
                <div className="flex flex-col items-center">
                    <Link href="/register">
                        <button className="font-semibold rounded-[30px] text-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-4 px-16">
                            Create Account
                        </button>
                    </Link>
                    <Link href="/login" className="mt-4 font-semibold transition-colors duration-200 ease-in-out
                        text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 sm:hover:text-zinc-300">
                        Sign in with existing account
                    </Link>
                </div>
            </div>
            {/* Preview Screenshots */}
            <div className="w-full flex flex-col items-center py-10">
                <div className="text-xl font-medium text-center noselect">
                    What's better than some friendly competition?
                </div>
                <div className="w-full flex justify-center gap-4 mt-8 mb-4 md:mb-6">
                    {widthBreakpoint !== "SM" &&
                        <div onClick={goToPrevSlide} onAnimationEnd={() => setNavLeftAnim(false)}
                        className={`self-center ${navLeftAnim ? " animate-leaderboardNavArrowLeft" : ""}`}>
                            <PreviewNavArrowIcon className={`w-10 h-10 scale-y-150 scale-x-75 transition duration-200
                            ${index < 1 ? " text-zinc-800/30" : " cursor-pointer text-zinc-500 hover:text-white"}`} />
                        </div>
                    }
                    <div className="w-[98%] sm:w-[95%] md:w-[85%] lg:w-[95%] xl:w-[85%] 2xl:w-[75%] 
                    lg:max-w-[830px] xl:max-w-[1200px] rounded-xl overflow-hidden">
                        <Swiper slidesPerView={getSlidesPerView()} spaceBetween={getSpaceBetween()} onSlideChange={(swiper) => setIndex(swiper.activeIndex)}
                        className="w-full h-full noselect flex justify-center" onSwiper={(swiper) => (swiperRef.current = swiper)}>
                            <SwiperSlide>
                                <PreviewVideoPlayer src="/landing/prev-1.mp4" thumbnail="/landing/preview-thumbnails/prev-1-tn.png" 
                                width={videoDimensions.width} height={videoDimensions.height} />
                            </SwiperSlide>
                            <SwiperSlide>
                                <PreviewVideoPlayer src="/landing/prev-2.mp4" thumbnail="/landing/preview-thumbnails/prev-2-tn.png" 
                                width={videoDimensions.width} height={videoDimensions.height} />
                            </SwiperSlide>
                            <SwiperSlide>
                                <PreviewVideoPlayer src="/landing/prev-3.mp4" thumbnail="/landing/preview-thumbnails/prev-3-tn.png" 
                                width={videoDimensions.width} height={videoDimensions.height} />
                            </SwiperSlide>
                            <SwiperSlide>
                                <PreviewVideoPlayer src="/landing/prev-4.mp4" thumbnail="/landing/preview-thumbnails/prev-4-tn.png" 
                                width={videoDimensions.width} height={videoDimensions.height} />
                            </SwiperSlide>
                            <SwiperSlide>
                                <PreviewVideoPlayer src="/landing/prev-5.mp4" thumbnail="/landing/preview-thumbnails/prev-5-tn.png" 
                                width={videoDimensions.width} height={videoDimensions.height} />
                            </SwiperSlide>
                        </Swiper>
                    </div>
                    {widthBreakpoint !== "SM" &&
                        <div onClick={goToNextSlide} onAnimationEnd={() => setNavRightAnim(false)}
                        className={`self-center ${navRightAnim ? " animate-leaderboardNavArrowRight" : ""}`}>
                            <PreviewNavArrowIcon className={`w-10 h-10 scale-y-150 scale-x-75 transition duration-200 rotate-180
                            ${index >= getNumberOfPages() - 1 ? " text-zinc-800/30" : " cursor-pointer text-zinc-500 hover:text-white"}`} />
                        </div>
                    }
                </div>
                <TutorialPagination index={index} totalPages={getNumberOfPages()} large />
            </div>
            <div className="w-full flex flex-col items-center gap-3 py-6 border-t border-zinc-800/50 bg-zinc-950/25">
                <div className="flex gap-6 text-zinc-700 font-light underline underline-offset-2">
                    <a href="https://github.com/Nathan7934/WhoSaidIt" target="_blank"
                    className="transition duration-200 hover:text-zinc-300">
                        GitHub
                    </a>
                    <a href="https://nathanraymant.com" target="_blank"
                    className="transition duration-200 hover:text-zinc-300">
                        About Me
                    </a>
                    <a href="https://www.gnu.org/licenses/gpl-3.0.en.html" target="_blank"
                    className="transition duration-200 hover:text-zinc-300">
                        License
                    </a>
                </div>
                <div className="text-xs text-zinc-800 font-light">
                    Copyright © 2024 Nathan Raymant
                </div>
            </div>
        </main>
    </>);
}