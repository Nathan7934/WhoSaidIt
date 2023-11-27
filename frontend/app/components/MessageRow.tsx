import { useEffect, useRef, useState } from "react";
import { Message } from "../interfaces";
import { MOBILE_HOLD_DURATION } from "../constants";
import AnimateHeight, { Height } from "react-animate-height";

// This component represents a row of content in a message list.
// Contains information for a single message, as well as actions for selecting the message.

interface TouchPosition {
    x: number;
    y: number;
}

interface MessageRowProps {
    message: Message;
    isMobile: boolean;
    selectedMessageIds: Array<number>; // State from Messages page
    setSelectedMessageIds: React.Dispatch<React.SetStateAction<Array<number>>>;
}
export default function MessageRow({ message, isMobile, selectedMessageIds, setSelectedMessageIds }: MessageRowProps) {
    // UI states
    const [height, setHeight] = useState<Height>(0);
    const [contentWrapped, setContentWrapped] = useState<boolean>(false);
    const [hasOverflow, setHasOverflow] = useState<boolean>(false);
    
    // Refs for DOM elements
    const mobileDOMref = useRef<HTMLDivElement>(null);
    const desktopDOMref = useRef<HTMLSpanElement>(null);
    const holdWaveDOMref = useRef<HTMLDivElement>(null);

    // Refs for timeouts
    const resizeTimeout = useRef<NodeJS.Timeout | null>(null);
    const holdTimeout = useRef<NodeJS.Timeout | null>(null);
    
    // State refs for use in event handlers (to avoid stale state closures)
    const selectedMessageIdsRef = useRef<Array<number>>(selectedMessageIds);
    const selectedRef = useRef<boolean>(selectedMessageIds.includes(message.id));
    const heightRef = useRef<Height>(height);

    useEffect(() => {
        // Mobile layout touch event handlers
        if (isMobile) {
            let touchStartPosition: TouchPosition = { x: 0, y: 0 };

            const handleTouchStart = (event: TouchEvent) => {
                if (mobileDOMref.current && mobileDOMref.current.contains(event.target as Node)
                ) {
                    if (holdTimeout.current) {
                        clearTimeout(holdTimeout.current);
                    }
                    // Record the starting position of the touch
                    if (event.touches.length > 0) {
                        touchStartPosition = {
                            x: event.touches[0].clientX,
                            y: event.touches[0].clientY,
                        };
                        // Show the hold wave effect, set its origin to the touch position
                        if (holdWaveDOMref.current) {
                            holdWaveDOMref.current.classList.add('animate-holdWave');
                            const effectX = touchStartPosition.x - mobileDOMref.current.getBoundingClientRect().left;
                            const effectY = touchStartPosition.y - mobileDOMref.current.getBoundingClientRect().top;
                            holdWaveDOMref.current.style.left = `${effectX}px`;
                            holdWaveDOMref.current.style.top = `${effectY}px`;
                        }
                    }

                    // This timeout function only executes after the hold duration, if user lifts their finger before then, it is cleared
                    holdTimeout.current = setTimeout(() => {
                        console.log('Hold event triggered');
                        messageSelectionChanged(!selectedRef.current);
                        holdTimeout.current = null;
                    }, MOBILE_HOLD_DURATION);
                } else {
                    // If the user touches outside of the message row, collapse the message
                    setHeight(0);
                }
            };
            
            // If the user starts moving their finger while holding, cancel the hold event
            const handleTouchMove = (event: TouchEvent) => {
                if (event.touches.length > 0) {
                    const touchCurrentPosition = {
                        x: event.touches[0].clientX,
                        y: event.touches[0].clientY,
                    };
    
                    if (isTouchScroll(touchStartPosition, touchCurrentPosition)) {
                        if (holdTimeout.current) {
                            clearTimeout(holdTimeout.current);
                            holdTimeout.current = null;
                            if (holdWaveDOMref.current) {
                                holdWaveDOMref.current.classList.remove('animate-holdWave');
                            }
                        }
                    }
                }
            };

            // Regular 'tap' actions, such as expanding messages, happen when the user lifts their finger
            const handleTouchEnd = (event: TouchEvent) => {
                if (holdWaveDOMref.current) {
                    holdWaveDOMref.current.classList.remove('animate-holdWave');
                }

                // If the user lifted their finger fast enough, cancel the hold timer
                if (holdTimeout.current) {
                    clearTimeout(holdTimeout.current);
                    holdTimeout.current = null;
                    if (event.changedTouches.length > 0) {
                        const touchEndPosition = {
                            x: event.changedTouches[0].clientX,
                            y: event.changedTouches[0].clientY,
                        };
                        // We dont want messages to expand while the user is scrolling
                        if (!isTouchScroll(touchStartPosition, touchEndPosition)) {
                            setHeight(heightRef.current === 0 ? 'auto' : 0);
                        }
                    }
                }
            };

            document.addEventListener('touchstart', handleTouchStart);
            document.addEventListener('touchmove', handleTouchMove);
            document.addEventListener('touchend', handleTouchEnd);

            // We want to remove the ability to bring up the context menu in mobile layout since messages are selected by holding
            const preventContextMenu = (e: MouseEvent) => { e.preventDefault(); };
            document.addEventListener("contextmenu", preventContextMenu, false);

            return () => {
                document.removeEventListener('touchstart', handleTouchStart);
                document.removeEventListener('touchend', handleTouchEnd);
                document.removeEventListener("contextmenu", preventContextMenu, false);
            }
        } 

        // Desktop layout click event handlers
        else {
            const handleClick = (event: MouseEvent) => {
                if (desktopDOMref.current && !desktopDOMref.current.contains(event.target as Node)) {
                    // If the user clicks outside of the message row, collapse the message
                    setHeight(0);
                }
            }
            document.addEventListener('mousedown', handleClick);

            return () => document.removeEventListener('mousedown', handleClick);
        }
    }, [isMobile]);

    // Determines if the message content is overflowing
    useEffect(() => {
        determineOverflow();
        const handleResize = () => {
            if (resizeTimeout.current) {
                clearTimeout(resizeTimeout.current);
            }
            resizeTimeout.current = setTimeout(() => {
                determineOverflow();
            }, 100)
        }
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Update the height ref when the height state changes
    useEffect(() => {
        heightRef.current = height;
    }, [height]);

    // Use the callback function to notify the Messages page of a change in selection
    useEffect(() => {
        selectedMessageIdsRef.current = selectedMessageIds;
        selectedRef.current = selectedMessageIds.includes(message.id);
    }, [selectedMessageIds]);

    // ----------------- Helper functions -----------------

    const messageSelectionChanged = (checked: boolean) => {
        const oldIds = selectedMessageIdsRef.current;
        if (checked) {
            console.log('Message selected');
            setSelectedMessageIds([...oldIds, message.id]);
        } else {
            console.log('Message deselected');
            setSelectedMessageIds(oldIds.filter(id => id !== message.id));
        }
    }

    const determineOverflow = () => {
        setHasOverflow(desktopDOMref.current ? desktopDOMref.current.scrollWidth > desktopDOMref.current.clientWidth : false);
    }

    const isTouchScroll = (touchStartPosition: TouchPosition, touchEndPosition: TouchPosition) => {
        const dx = touchEndPosition.x - touchStartPosition.x;
        const dy = touchEndPosition.y - touchStartPosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const SCROLL_THRESHOLD = 10; // Threshold in pixels for considering it a scroll

        return distance > SCROLL_THRESHOLD;
    }

    // Formats a date object into a string of type "MM/DD/YY h:mm am/pm"
    const formatDate = (date: Date) => {
        const hours = date.getHours();
        const ampm = hours >= 12 ? 'pm' : 'am';
        const formattedHours = hours % 12 || 12; // If hours % 12 is 0, use 12
        const formattedMinutes = `0${date.getMinutes()}`.slice(-2); // Ensure two digits
        const shortYear = date.getFullYear().toString().slice(-2); // Last two digits of year
    
        if (isMobile) return `${date.getMonth() + 1}/${date.getDate()}/${shortYear}`;
        return `${date.getMonth() + 1}/${date.getDate()}/${shortYear} ${formattedHours}:${formattedMinutes} ${ampm}`;
    }

   // =============== MAIN RENDER =================

    if (isMobile) { // Mobile layout
        return (
            <div ref={mobileDOMref} className={`flex flex-col relative px-1 py-2 border-b border-gray-6 overflow-hidden 
            transition-colors duration-100 ${selectedMessageIds.includes(message.id) ? "bg-blue-6/40" : ""}`}>
                {/* div for hold wave effect */}
                <div ref={holdWaveDOMref} className="absolute w-[0%] translate-x-[-50%] translate-y-[-50%] 
                bg-blue-3 pointer-events-none rounded-[50%] aspect-square" />
                <div className="flex z-10">
                    <div className="mr-2 whitespace-nowrap overflow-x-hidden text-ellipsis noselect">
                        {message.sender.name}
                    </div>
                    <div className="ml-auto text-gray-7 text-sm self-center noselect">
                        {formatDate(message.timestamp)}
                    </div>
                </div>
                <div className="flex mt-1 text-gray-11">
                    <div className={`grow relative overflow-hidden ${hasOverflow ? "cursor-pointer" : "cursor-default"}`}
                    onClick={() => {if (!isMobile) setHeight(height === 0 ? 'auto' : 0)}}>
                        <span className={`absolute max-w-full overflow-hidden text-ellipsis noselect ${contentWrapped ? "" : "whitespace-nowrap"}`}>
                            {message.content}
                        </span>
                        <AnimateHeight height={height} duration={300} className="invisible"
                        onHeightAnimationStart={() => setContentWrapped(true)} onHeightAnimationEnd={() => setContentWrapped(height !== 0)}>
                            {message.content} {/* This is a hack to get the height of the message cell to expand properly. */}
                        </AnimateHeight>
                    </div>
                    <div className="flex-none w-[0px] overflow-hidden" >|</div>
                </div>
            </div>
        );
    } else { // Desktop layout
        return (
            <div className="flex py-2 border-b border-gray-6">
                <div className="flex-none w-[35px]">
                    <input type="checkbox" className="checkbox ml-1 relative top-[2px]"
                    onChange={(e) => messageSelectionChanged(e.target.checked)}
                    checked={selectedMessageIds.includes(message.id)}/>
                </div>
                <div className="flex-none w-[150px] pr-2 whitespace-nowrap overflow-x-hidden text-ellipsis text-gray-11">
                    {message.sender.name}
                </div>    
                <div className={`grow relative overflow-hidden ${hasOverflow ? "cursor-pointer" : "cursor-default"}`}
                onClick={() => {if (!isMobile) setHeight(height === 0 ? 'auto' : 0)}}>
                    <span ref={desktopDOMref} className={`absolute max-w-full overflow-hidden text-ellipsis noselect ${contentWrapped ? "" : "whitespace-nowrap"}`}>
                        {message.content}
                    </span>
                    <AnimateHeight height={height} duration={300} className="invisible"
                    onHeightAnimationStart={() => setContentWrapped(true)} onHeightAnimationEnd={() => setContentWrapped(height !== 0)}>
                        {message.content} {/* This is a hack to get the height of the message cell to expand properly. */}
                    </AnimateHeight>
                </div>
                <div className="flex-none w-[140px] ml-5 text-gray-9">
                    {formatDate(message.timestamp)}
                </div>
            </div>
        );
    }
    
};