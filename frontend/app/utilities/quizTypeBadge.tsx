 export default function renderQuizTypeBadge(type: string) {
    if (type === "TIME_ATTACK") {
        return (<span className="py-[2px] px-2 bg-blue-4 rounded-lg text-blue-12 text-sm
            font-semibold relative bottom-[1px] whitespace-nowrap">Time Attack</span>);
    }
    return (<span className="py-[2px] px-2 bg-red-4 rounded-lg text-red-12 text-sm
        font-semibold relative bottom-[1px] whitespace-nowrap">Survival</span>);
}