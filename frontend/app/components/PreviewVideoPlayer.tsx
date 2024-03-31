import { useState, useRef, useEffect } from 'react';

import PlayButtonIcon from './icons/landing/PlayButtonIcon';

// A lightweight video player component for the landing page preview videos - plays the video on click

interface PreviewVideoPlayerProps {
    src: string;
    thumbnail: string;
    width: number;
    height: number;
}
export default function PreviewVideoPlayer({ src, thumbnail, width, height }: PreviewVideoPlayerProps) {

    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    // const [loading, setLoading] = useState<boolean>(true);

    const togglePlay = () => {
        const videoElement: HTMLVideoElement | null = videoRef.current;
        if (videoElement) {
            isPlaying ? videoElement.pause() : videoElement.play();
            setIsPlaying(!isPlaying);

            // When we are on mobile sized screens, we want to request fullscreen when the video is played
            if (window.innerWidth < 900 && !isPlaying && videoElement.requestFullscreen) {
                videoElement.requestFullscreen();
            } 
        }
    };

    // Listen for when the user exits fullscreen mode and pause the video
    useEffect(() => {
        const handleFullscreenChange = () => {
            const videoElement: HTMLVideoElement | null = videoRef.current;
            if (videoElement && !document.fullscreenElement) {
                videoElement.pause();
                setIsPlaying(false);
            }
        };
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
    }, []);

    return (
        <div onClick={togglePlay} className='relative cursor-pointer rounded-xl mx-auto overflow-hidden' style={{width: width, height: height}}>
            {/* {loading && 
                <div className='spinner-circle spinner-xl absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]' />
            } */}
            <video 
                ref={videoRef} 
                src={src} 
                poster={thumbnail} 
                className='object-cover h-full w-full' 
                loop 
                muted 
                preload='auto'
            />
            {/* Play button overlay for the video player - appears when paused */}
            <div className={`absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] 
            animate__animated animate__duration-200ms ${isPlaying ? " animate__fadeOut" : " animate__fadeIn"}`}>
                <PlayButtonIcon className='w-24 h-24 text-zinc-300' />
            </div>
        </div>
    );
}