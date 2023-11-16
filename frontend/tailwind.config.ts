import type { Config } from 'tailwindcss'

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
            },
        },
    },
    plugins: [require('rippleui')],
}
export default config;
