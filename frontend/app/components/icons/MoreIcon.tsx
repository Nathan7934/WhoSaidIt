export default function MoreIcon({ className }: { className?: string }) {
    return (
        <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        viewBox="0 0 24 24"
        className={`feather feather-grid ${className}`}>
            <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />
        </svg>

        // KEBAB ICON
        // <svg
        // xmlns="http://www.w3.org/2000/svg"
        // fill="none"
        // stroke="currentColor"
        // strokeLinecap="round"
        // strokeLinejoin="round"
        // strokeWidth={2}
        // viewBox="0 0 24 24"
        // className={`feather feather-more-vertical ${className}`}>
        //     <circle cx={12} cy={12} r={1} />
        //     <circle cx={12} cy={5} r={1} />
        //     <circle cx={12} cy={19} r={1} />
        // </svg>

        // LIST ITEMS
        // <svg
        // xmlns="http://www.w3.org/2000/svg"
        // fill="none"
        // stroke="currentColor"
        // strokeLinecap="round"
        // strokeLinejoin="round"
        // strokeWidth={2}
        // className={`feather feather-list ${className}`}
        // viewBox="0 0 24 24">
        //     <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
        // </svg>
    );
}