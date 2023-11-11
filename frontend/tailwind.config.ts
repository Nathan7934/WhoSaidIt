import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      keyframes: {
        leaderboardNavArrowLeft: {
            '0%, 100%': { transform: 'translateX(0)' },
            '50%': { transform: 'translateX(-4px)' },
        },
        leaderboardNavArrowRight: {
            '0%, 100%': { transform: 'translateX(0)' },
            '50%': { transform: 'translateX(4px)' },
        },
      },
      animation: {
        leaderboardNavArrowLeft: 'leaderboardNavArrowLeft 0.3s ease-out 1',
        leaderboardNavArrowRight: 'leaderboardNavArrowRight 0.3s ease-in-out 1',
      },
    },
  },
  plugins: [require('rippleui')],
}
export default config
