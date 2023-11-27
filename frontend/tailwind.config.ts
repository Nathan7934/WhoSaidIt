import type { Config } from 'tailwindcss'
import { MOBILE_HOLD_DURATION } from './app/constants';

const config: Config = {
    content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            screens: {
                '3xl': '2000px',
            },
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
                from: { transform: 'translateX(100%)' },
                to: { transform: 'translateX(0)' },
            },
            slideOutToLeft: {
                from: { transform: 'translateX(0)' },
                to: { transform: 'translateX(-100%)' },
            },
            slideInFromLeft: {
                from: { transform: 'translateX(-100%)' },
                to: { transform: 'translateX(0)' },
            },
            slideOutToRight: {
                from: { transform: 'translateX(0)' },
                to: { transform: 'translateX(100%)' },
            },

            // MESSAGES: Keyframes for response status alerts
            alertEntering: {
                '0%': {
                    width: '52px',
                    opacity: '0',
                },
                '25%': { opacity: '1' },
                '50%': { width: '52px' },
                '100%': { width: '310px' },
            },
            alertExiting: {
                '0%': { 
                    width: '310px',
                    opacity: '1',
                },
                '50%': { width: '52px' },
                '75%': { opacity: '1' },
                '100%': { 
                    opacity: '0',
                    width: '52px',
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
            },
        },
    },
    plugins: [require('rippleui')],
}
export default config;
