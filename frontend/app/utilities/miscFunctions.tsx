import { ResponseStatus, GroupChatInfo } from "../interfaces";
import QuizRow from "../components/QuizRow";

// At some point, this file might grow sufficiently large that it should be split into multiple files.

// This function renders a badge for a quiz type.
export function renderQuizTypeBadge(type: string) {
    if (type === "TIME_ATTACK") {
        return (<span className="py-[2px] px-2 bg-blue-4 rounded-lg text-blue-12 text-sm
            font-semibold relative bottom-[1px] whitespace-nowrap">Time Attack</span>);
    }
    return (<span className="py-[2px] px-2 bg-red-4 rounded-lg text-red-12 text-sm
        font-semibold relative bottom-[1px] whitespace-nowrap">Survival</span>);
}

// This function determines the appropriate animation class for an alert, given its response status.
export const determineAlertAnimationClassName = (responseStatus: ResponseStatus) => {
    const color = responseStatus.success ? " bg-green-2" : " bg-blue-2";
    if (responseStatus.doAnimate) {
        if (responseStatus.message === "") {
            return " animate-alertExiting" + color;
        } else {
            return " animate-alertEntering" + color;
        }
    }
    return " opacity-0";
}

// The next two functions are used to toggle the visibility of a modal, given its DOM id.
export function toggleModal(modalId: string) {
    const modalCheckbox = document.getElementById(modalId) as HTMLInputElement;
    if (modalCheckbox) {
        modalCheckbox.checked = !modalCheckbox.checked;
    }
}
export function isModalOpen(modalId: string) {
    const modalCheckbox = document.getElementById(modalId) as HTMLInputElement;
    if (modalCheckbox) {
        return modalCheckbox.checked;
    }
    return false;
}

// This function formats a date as "Month Day, Year" (e.g. "January 1st, 2021").
export function formatDateLong(date: Date): string {

    const getOrdinalSuffix = (number: number) => {
        if (number > 3 && number < 21) return 'th';
        switch (number % 10) {
            case 1:  return "st";
            case 2:  return "nd";
            case 3:  return "rd";
            default: return "th";
        }
    }

    const month: string = date.toLocaleString('default', { month: 'long' });
    const day: string = date.getDate().toString();
    const year: string = date.getFullYear().toString();
    const ordinalSuffix = getOrdinalSuffix(date.getDate());
    return `${month} ${day}${ordinalSuffix}, ${year}`;
}

// This function renders the rows for a list of quizzes, given a group chat.
export function renderQuizRows(groupChat: GroupChatInfo) {
    const quizzes = groupChat.quizzes;
    return quizzes.map((quiz, index) => {
        return (<>
            <QuizRow key={quiz.id} groupChatId={groupChat.id} quiz={quiz} />
            {index !== quizzes.length - 1 && <div className="divider my-0"></div>}
        </>); 
    });
}