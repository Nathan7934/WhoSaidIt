export default function InfoIcon({ className }: { className?: string }) {
    return (
        <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        viewBox="0 0 24 24"
        className={`feather feather-info ${className}`}>
            <circle cx={12} cy={12} r={10} />
            <path d="M12 16v-4M12 8h.01" />
        </svg>

        // <svg
        // xmlns="http://www.w3.org/2000/svg"
        // fill="currentColor"
        // className={className}
        // viewBox="0 0 512 512">
        //     <path d="M256 20C125.66 20 20 125.66 20 256s105.66 236 236 236 236-105.66 236-236S386.34 20 256 20Zm21.76 386.09c-6.293 6.16-14.653 9.24-25.08 9.24-10.427 0-18.86-3.08-25.3-9.24-6.287-6.16-9.433-13.963-9.44-23.41 0-9.6 3.217-17.477 9.65-23.63 6.58-6.3 14.943-9.453 25.09-9.46 10.147-.007 18.437 3.147 24.87 9.46 6.567 6.147 9.853 14.023 9.86 23.63 0 9.453-3.217 17.257-9.65 23.41Zm66.68-191.61c-5.427 10.74-14.93 22.697-28.51 35.87l-17.37 16.54c-10.86 10.46-17.077 22.703-18.65 36.73a14.003 14.003 0 0 1-14 13.11H252.5c-15.65 0-28.83-12.79-26.32-28.24a90.382 90.382 0 0 1 5.27-19.67c4.86-11.88 13.723-23.547 26.59-35 13-11.6 21.647-20.98 25.94-28.14a44.75 44.75 0 0 0 6.43-23c0-24.2-11.15-36.3-33.45-36.3-10.573 0-19.077 3.293-25.51 9.88-11.39 11.67-22.87 26.85-39.17 26.85h-1.23c-17.42 0-32.29-14.6-26.84-31.15a75.3 75.3 0 0 1 21.57-33.08c17.44-15.46 41.167-23.193 71.18-23.2 30.313 0 53.827 7.377 70.54 22.13 16.733 14.607 25.097 35.3 25.09 62.08a76.503 76.503 0 0 1-8.15 34.59Z"/>
        // </svg>
    );
}