export default function BackIcon({ className }: { className?: string }) {
    return (
        <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        viewBox="0 0 24 24"
        className={`feather feather-arrow-left ${className}`}>
            <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
    );
}