export default function PlayButtonIcon({ className }: { className?: string }) {
    return (
        <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill="currentColor"
        viewBox="0 0 512 512"
        className={className}>
            <defs>
                <filter id="dropshadow" height="120%">
                    <feDropShadow dx="15" dy="15" stdDeviation="20" />
                </filter>
            </defs>
            <path
            d="M448 256c0-106-86-192-192-192S64 150 64 256s86 192 192 192 192-86 192-192Z"
            style={{
                fill: "none",
                stroke: "currentColor",
                strokeMiterlimit: 10,
                strokeWidth: 20,
            }}
            filter="url(#dropshadow)"/>
            <path 
            d="m216.32 334.44 114.45-69.14a10.89 10.89 0 0 0 0-18.6l-114.45-69.14a10.78 10.78 0 0 0-16.32 9.31v138.26a10.78 10.78 0 0 0 16.32 9.31Z" 
            filter="url(#dropshadow)"/>
        </svg>
    );
}