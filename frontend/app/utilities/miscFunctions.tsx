import { ResponseStatus, GroupChatInfo, TimeAttackEntry, SurvivalEntry } from "../interfaces";
import QuizRow from "../components/QuizRow";
import SuccessIcon from "../components/icons/SuccessIcon";
import AlertIcon from "../components/icons/AlertIcon";

// At some point, this file might grow sufficiently large that it should be split into multiple files.

// Custom type guards
export const isTimeAttackEntry = (entry: TimeAttackEntry | SurvivalEntry): entry is TimeAttackEntry => {
    return entry.type === "TIME_ATTACK";
}
export const isSurvivalEntry = (entry: TimeAttackEntry | SurvivalEntry): entry is SurvivalEntry => {
    return entry.type === "SURVIVAL";
}

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
export function renderQuizRows(groupChat: GroupChatInfo, setReloadCounter: React.Dispatch<React.SetStateAction<number>>) {
    const quizzes = groupChat.quizzes;

    if (quizzes.length < 1) {
        return (
            <div className="flex flex-col gap-4 px-4 justify-center w-full h-36 lg:h-[240px] border-2 border-dashed 
            rounded-lg border-gray-6 text-center">
                <div className="text-xl text-gray-11">
                    Nothing here.
                </div>aaaaaaaaa
                <div className="text-gray-9">
                    Create a new quiz to get started.
                </div>
            </div>
        )
    }

    return quizzes.map((quiz, index) => {
        let dropdownPosition: ("dropdown-menu-left" | "dropdown-menu-left-bottom" | "dropdown-menu-left-top") = "dropdown-menu-left";
        if (quizzes.length !== 1) {
            if (index === 0) dropdownPosition = "dropdown-menu-left-bottom";
            else if (index === quizzes.length - 1) dropdownPosition = "dropdown-menu-left-top";
        }
        return (
            <div key={quiz.id} className={`border-gray-6 py-[6px] ${index !== quizzes.length - 1 ? "border-b" : ""}`}>
                <QuizRow groupChatId={groupChat.id} quiz={quiz} setReloadCounter={setReloadCounter}
                dropdownPosition={dropdownPosition} />
            </div>
        ); 
    });
}

export function renderModalResponseAlert(responseStatus: ResponseStatus) {
    const success: boolean = responseStatus.success;
        return (
            <div className="my-6 sm:my-12">
                <div className={`mx-auto mb-[2px] text-lg sm:text-xl text-center ${success ? "text-green-12" : "text-blue-12"}`}>
                    {responseStatus.message}
                </div>
                <div className="flex justify-center animate__animated animate__fadeIn">
                    {success
                        ? <SuccessIcon className="w-12 h-12 sm:w-14 sm:h-14" />
                        : <AlertIcon className="w-12 h-12 sm:w-14 sm:h-14" />
                    }
                </div>
            </div>
        )
}