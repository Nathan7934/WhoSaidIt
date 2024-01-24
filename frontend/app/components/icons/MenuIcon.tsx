export default function MenuIcon({ className }: { className?: string }) {
    return (
        <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        stroke="currentColor"
        className={className}
        viewBox="0 0 24 24">
            <g strokeLinecap="round" strokeWidth={2}>
                <path d="M4 18h16M4 12h16M4 6h16" />
            </g>
        </svg>
    );
}