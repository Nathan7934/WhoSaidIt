export default function SuccessIcon({ className }: { className?: string }) {
    return (
        <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        className={className}
        viewBox="0 0 48 48">
            <path
            fillRule="evenodd"
            d="M24 4C12.96 4 4 12.96 4 24s8.96 20 20 20 20-8.96 20-20S35.04 4 24 4Zm-5.42 28.58L11.4 25.4c-.78-.78-.78-2.04 0-2.82.78-.78 2.04-.78 2.82 0L20 28.34l13.76-13.76c.78-.78 2.04-.78 2.82 0 .78.78.78 2.04 0 2.82L21.4 32.58c-.76.78-2.04.78-2.82 0Z"
            clipRule="evenodd"/>
        </svg>
    );
}