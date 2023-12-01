import { ResponseStatus } from "../interfaces";

export function renderQuizTypeBadge(type: string) {
    if (type === "TIME_ATTACK") {
        return (<span className="py-[2px] px-2 bg-blue-4 rounded-lg text-blue-12 text-sm
            font-semibold relative bottom-[1px] whitespace-nowrap">Time Attack</span>);
    }
    return (<span className="py-[2px] px-2 bg-red-4 rounded-lg text-red-12 text-sm
        font-semibold relative bottom-[1px] whitespace-nowrap">Survival</span>);
}

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