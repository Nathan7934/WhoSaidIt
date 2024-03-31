
interface TutorialPaginationProps {
    index: number;
    totalPages: number;
    large?: boolean;
}
export default function TutorialPagination({ index, totalPages, large = false }: TutorialPaginationProps) {
    // Renders the pagination dots for the swipeable tutorial

    const renderPagination = () => {
        const pagination = [];
        for (let i = 0; i < totalPages; i++) {
            pagination.push(
                <div key={i} className={`rounded-full border border-zinc-300 transition duration-300 ease-in-out
                ${index === i ? ' bg-zinc-300' : ' bg-transparent'} ${large ? " w-[10px] h-[10px]" : " w-2 h-2"}`} />
            );
        }
        return pagination;
    }

    return (
        <div className="flex justify-center items-center gap-1 w-full">
            {renderPagination()}
        </div>
    );

}