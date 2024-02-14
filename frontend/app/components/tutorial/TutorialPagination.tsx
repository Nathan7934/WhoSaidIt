
interface TutorialPaginationProps {
    index: number;
    totalPages: number;
}
export default function TutorialPagination({ index, totalPages }: TutorialPaginationProps) {
    // Renders the pagination dots for the swipeable tutorial

    const renderPagination = () => {
        const pagination = [];
        for (let i = 0; i < totalPages; i++) {
            pagination.push(
                <div key={i} className={`w-2 h-2 rounded-full border border-zinc-300 transition duration-300 ease-in-out
                ${index === i ? ' bg-zinc-300' : ' bg-transparent'}`} />
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