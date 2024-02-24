import type { Config } from 'tailwindcss'
import { MOBILE_HOLD_DURATION, NAVBAR_HEIGHT } from './app/constants';

const config: Config = {
    content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            screens: { '3xl': '2000px', },
            height: { 
                'navbar': `${NAVBAR_HEIGHT}px`, 
                'content': `calc(100vh - ${NAVBAR_HEIGHT}px)`
            },
            maxHeight: { 'content': `calc(100vh - ${NAVBAR_HEIGHT}px)`, },
            minHeight: { 'content': `calc(100vh - ${NAVBAR_HEIGHT}px)`, },
            spacing: { 'navbar': `${NAVBAR_HEIGHT}px`, },
            keyframes: {
                // DASHBOARD (Leaderboard preview): Navigation arrows keyframes
                leaderboardNavArrowLeft: {
                    '0%, 100%': { transform: 'translateX(0)' },
                    '50%': { transform: 'translateX(-4px)' },
                },
                leaderboardNavArrowRight: {
                    '0%, 100%': { transform: 'translateX(0)' },
                    '50%': { transform: 'translateX(4px)' },
                },
                
                // GLOBAL: Keyframes for cycling elements left and right
                slideInFromRight: {
                    from: { transform: 'translateX(100%) translateZ(0)' },
                    to: { transform: 'translateX(0) translateZ(0)' },
                },
                slideOutToLeft: {
                    from: { transform: 'translateX(0) translateZ(0)' },
                    to: { transform: 'translateX(-100%) translateZ(0)' },
                },
                slideInFromLeft: {
                    from: { transform: 'translateX(-100%) translateZ(0)' },
                    to: { transform: 'translateX(0) translateZ(0)' },
                },
                slideOutToRight: {
                    from: { transform: 'translateX(0) translateZ(0)' },
                    to: { transform: 'translateX(100%) translateZ(0)' },
                },

                // MESSAGES: Keyframes for response status alerts
                alertEntering: {
                    '0%': {
                        width: '56px',
                        opacity: '0',
                    },
                    '25%': { opacity: '1' },
                    '50%': { width: '56px' },
                    '100%': { width: '310px' },
                },
                alertExiting: {
                    '0%': { 
                        width: '310px',
                        opacity: '1',
                    },
                    '50%': { width: '56px' },
                    '75%': { opacity: '1' },
                    '100%': { 
                        opacity: '0',
                        width: '56px',
                    },
                },

                // MESSAGES: Mobile message select hold wave keyframes
                holdWave: {
                    '0%': {
                        width: '0%',
                        opacity: '0.1',
                    },
                    '50%': {opacity: '0.3'},
                    '99%': {opacity: '0.3'},
                    '100%': {
                        width: '200%',
                        opacity: '0',
                    },
                },

                // MESSAGES: Mobile selection actions control keyframes
                selectionActionsEntering: {
                    '0%': {
                        transform: 'translateY(-100%)',
                        opacity: '0',
                    },
                    '100%': {
                        transform: 'translateY(0)',
                        opacity: '1',
                    },
                },
                selectionActionsExiting: {
                    '0%': {
                        transform: 'translateY(0)',
                        opacity: '1',
                    },
                    '100%': {
                        transform: 'translateY(-100%)',
                        opacity: '0',
                    },
                },

                // QUIZ CREATION: Quiz type selection control keyframes
                quizTypeSelectionEntering: {
                    '0%': {
                        width: '0%',
                        opacity: '1',
                    },
                    '100%': { width: '100%', },
                },
                quizTypeSelectionExiting: {
                    '0%': {
                        opacity: '1',
                        width: '100%',
                    },
                    '99%': {
                        opacity: '0',
                        width: '100%',
                    },
                    '100%': { width: '0%', },
                },

                // LEADERBOARD: Podium grow keyframes
                podiumGrowFirst: {
                    from: { height: '0%' },
                    to: { height: '100%' },
                },
                podiumGrowSecond: {
                    from: { height: '0%' },
                    to: { height: '70%' },
                },
                podiumGrowThird: {
                    from: { height: '0%' },
                    to: { height: '45%' },
                },

                // QUIZ: Message card slide out keyframes
                messageCardSlideOutUpLeft: {
                    '0%': { 
                        transform: 'translate(0, 0) rotate(0deg)', 
                        opacity: '1',
                    },
                    '25%': {
                        opacity: '1',
                    },
                    '100%': { 
                        transform: 'translate(-125%, -25%) rotate(-75deg)', 
                        opacity: '0',
                    },
                },
                messageCardSlideOutUpRight: {
                    '0%': { 
                        transform: 'translate(0, 0) rotate(0deg)', 
                        opacity: '1',
                    },
                    '25%': {
                        opacity: '1',
                    },
                    '100%': { 
                        transform: 'translate(125%, -25%) rotate(75deg)', 
                        opacity: '0',
                    },
                },

                // QUIZ: Correct and incorrect answer keyframes
                correctAnswer: {
                    '0%': { transform: 'scale(1)' },
                    '33%': { transform: 'scale(1.03)' },
                    '66%': { transform: 'scale(0.99)' },
                    '100%': { transform: 'scale(1)' },
                },
                incorrectAnswer: {
                    '0%': { transform: 'translate(0, 0)' },
                    '25%': { transform: 'translate(-2%, 0)' },
                    '50%': { transform: 'translate(2%, 0)' },
                    '75%': { transform: 'translate(-2%, 0)' },
                    '100%': { transform: 'translate(0, 0)' },
                },

                // NAVBAR: Submenu entering and exiting keyframes
                subMenuEnteringFromRight: {
                    from: { 
                        transform: 'translateX(100%)',
                        visibility: 'visible',
                    },
                    to: { transform: 'translateX(0)' },
                },
                subMenuExitingToLeft: {
                    from: { transform: 'translateX(0)' },
                    to: { 
                        transform: 'translateX(-100%)',
                        visibility: 'hidden',
                    },
                },
                subMenuEnteringFromLeft: {
                    from: { 
                        transform: 'translateX(-100%)',
                        visibility: 'visible',
                    },
                    to: { transform: 'translateX(0)' },
                },
                subMenuExitingToRight: {
                    from: { transform: 'translateX(0)' },
                    to: { 
                        transform: 'translateX(100%)',
                        visibility: 'hidden',
                    },
                },

                // NAVBAR: Home/Close button slideover for desktop keyframes
                homeCloseExpand: {
                    from: { transform: 'translateX(0)' },
                    to: { transform: 'translateX(-310px)' },
                },
                homeCloseCollapse: {
                    from: { transform: 'translateX(-310px)' },
                    to: { transform: 'translateX(0)' },
                },

                // TUTORIAL: Swipe Left Idicator Keyframes
                swipeLeftIndicator: {
                    '0%': {
                        transform: 'translateX(200%)',
                        opacity: '0',
                    },
                    '42%' : { // We are simulating a delay between animation repetitions
                        transform: 'translateX(200%)',
                        opacity: '0',
                    },
                    '49%': { opacity: '1' },
                    '51%': { opacity: '1' },
                    '58%' : {
                        transform: 'translateX(-200%)',
                        opacity: '0',
                    },
                    '100%': {
                        transform: 'translateX(-200%)',
                        opacity: '0',
                    },
                }
            },
            animation: {
                // DASHBOARD (Leaderboard preview): Navigation arrows animations
                leaderboardNavArrowLeft: 'leaderboardNavArrowLeft 0.3s ease-in-out 1',
                leaderboardNavArrowRight: 'leaderboardNavArrowRight 0.3s ease-in-out 1',
                
                // DASHBOARD (Leaderboard preview): Leaderboard cycling animations
                leaderboardEntering: 'slideInFromRight 0.3s ease-in-out 0s 1 forwards',
                leaderboardExiting: 'slideOutToLeft 0.3s ease-in-out 0s 1 forwards',
                leaderboardEnteringPrev: 'slideInFromLeft 0.3s ease-in-out 0s 1 forwards',
                leaderboardExitingPrev: 'slideOutToRight 0.3s ease-in-out 0s 1 forwards',

                // MESSAGES: Response status alerts animations
                alertEntering: 'alertEntering 1s ease-in-out 0s 1 forwards',
                alertExiting: 'alertExiting 1s ease-in-out 0s 1 forwards',

                // MESSAGES: Mobile message select click wave animation
                holdWave: `holdWave ${MOBILE_HOLD_DURATION - 100}ms cubic-bezier(.8,0,.65,1) 0.2s 1 forwards`,

                // MESSAGES: Mobile selection actions control animations
                selectionActionsEntering: 'selectionActionsEntering 0.4s ease-in-out 0s 1 forwards',
                selectionActionsExiting: 'selectionActionsExiting 0.4s ease-in-out 0s 1 forwards',

                // QUIZ CREATION: Quiz type selection control keyframes
                quizTypeSelectionEntering: 'quizTypeSelectionEntering 0.3s ease-in-out 0s 1 forwards',
                quizTypeSelectionExiting: 'quizTypeSelectionExiting 0.2s ease-in-out 0s 1 forwards',

                // LEADERBOARD: Podium grow animations
                podiumGrowFirst: 'podiumGrowFirst 1s ease-in-out 0s 1 forwards',
                podiumGrowSecond: 'podiumGrowSecond 1s ease-in-out 0s 1 forwards',
                podiumGrowThird: 'podiumGrowThird 1s ease-in-out 0s 1 forwards',

                // QUIZ: Message card slide out animations
                messageCardSlideOutUpLeft: 'messageCardSlideOutUpLeft 0.5s cubic-bezier(.69,-0.14,.38,1.51) 0s 1 forwards',
                messageCardSlideOutUpRight: 'messageCardSlideOutUpRight 0.5s cubic-bezier(.69,-0.14,.38,1.51) 0s 1 forwards',

                // QUIZ: Correct and incorrect answer animations
                incorrectAnswer: 'incorrectAnswer 0.3s ease-in-out 0s 1 forwards',
                correctAnswer: 'correctAnswer 0.3s ease-in-out 0s 1 forwards',

                // NAVBAR: Menu expansion animations
                menuEntering: 'slideInFromRight 0.15s ease-in-out 0s 1 forwards',
                menuExiting: 'slideOutToRight 0.15s ease-in-out 0s 1 forwards',

                // NAVBAR: Submenu entering and exiting animations
                subMenuEnteringFromRight: 'subMenuEnteringFromRight 0.25s ease-in-out 0s 1 forwards',
                subMenuEnteringFromLeft: 'subMenuEnteringFromLeft 0.25s ease-in-out 0s 1 forwards',
                subMenuExitingToRight: 'subMenuExitingToRight 0.25s ease-in-out 0s 1 forwards',
                subMenuExitingToLeft: 'subMenuExitingToLeft 0.25s ease-in-out 0s 1 forwards',

                // NAVBAR: Home/Close button slideover for desktop animations
                homeCloseExpand: 'homeCloseExpand 0.15s ease-in-out 0s 1 forwards',
                homeCloseCollapse: 'homeCloseCollapse 0.15s ease-in-out 0s 1 forwards',

                // TUTORIAL: Swipe Left Idicator animation
                swipeLeftIndicator: 'swipeLeftIndicator 5s cubic-bezier(.38,0,.44,1) 0s infinite',
            },
            dropShadow: {
                glow: [
                    "0 0px 20px rgba(255,255, 255, 0.35)",
                    "0 0px 65px rgba(255, 255,255, 0.2)"
                ]
            },
        },
    },
    plugins: [
        require('rippleui'),
    ],
}
export default config;
