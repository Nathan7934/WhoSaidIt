export default function AlertIcon({ className }: { className?: string }) {
    return (
        <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        className={className}
        viewBox="0 0 48 48">
            <path
            fill="#0085FF"
            fillRule="evenodd"
            d="M24 4C12.96 4 4 12.96 4 24s8.96 20 20 20 20-8.96 20-20S35.04 4 24 4Zm0 30c-1.1 0-2-.9-2-2v-8c0-1.1.9-2 2-2s2 .9 2 2v8c0 1.1-.9 2-2 2Zm2-16h-4v-4h4v4Z"
            clipRule="evenodd"/>
        </svg>
    );
}