import { ResponseStatus, GroupChatInfo, TimeAttackEntry, SurvivalEntry, TimeAttackQuiz, SurvivalQuiz } from "../interfaces";
import QuizRow from "../components/data-rows/QuizRow";
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
export const isTimeAttackQuiz = (quiz: TimeAttackQuiz | SurvivalQuiz): quiz is TimeAttackQuiz => {
    return quiz.type === "TIME_ATTACK";
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

// This function renders a badge for a quiz type.
// In mobile, it renders gradient text. In desktop, it renders a badge with a gradient border.
export function renderQuizTypeBadge(type: string, forceBadge: boolean = false) {
    if (type === "TIME_ATTACK") {
        return (<>
            {/* Desktop */}
            <div className={`${forceBadge ? "flex " : "hidden sm:flex "}
            w-min rounded-[9px] bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500 text-blue-50`}>
                <div className="grow bg-black m-[1px] py-[2px] px-3 rounded-lg text-sm whitespace-nowrap">
                    Time Attack
                </div>
            </div>
            {/* Mobile */}
            <div className={`${forceBadge ? "hidden " : " sm:hidden"}
            font-extrabold w-min text-transparent bg-clip-text whitespace-nowrap bg-gradient-to-r from-blue-200 to-blue-300`}>
                Time Attack
            </div>
        </>);
    }
    return (<>
        {/* Desktop */}
        <div className={`${forceBadge ? "flex " : "hidden sm:flex "} 
        w-min rounded-[9px] bg-gradient-to-r from-purple-400/90 via-pink-300/90 to-purple-400/90 text-violet-50`}>
            <div className="grow bg-black m-[1px] py-[2px] px-3 rounded-lg text-sm whitespace-nowrap">
                Survival
            </div>
        </div>
        {/* Mobile */}
        <div className={`${forceBadge ? "hidden " : " sm:hidden"}
        font-extrabold w-min text-transparent bg-clip-text whitespace-nowrap bg-gradient-to-r from-purple-200 to-purple-300`}>
            Survival
        </div>
    </>);
}

// This function renders the rows for a list of quizzes, given a group chat.
export function renderQuizRows(groupChat: GroupChatInfo, setReloadCounter: React.Dispatch<React.SetStateAction<number>>) {
    const quizzes = groupChat.quizzes;

    if (quizzes.length < 1) {
        return (
            <div className="flex flex-col gap-2 px-4 justify-center w-full h-36 lg:h-[240px] border border-dashed 
            rounded-lg border-zinc-700 text-center">
                <div className="text-lg text-zinc-400">
                    Nothing here
                </div>
                <div className="text-sm text-zinc-600">
                    Create a new quiz to get started
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
            <div key={quiz.id} className={`my-3 sm:my-0 sm:pt-2 sm:pb-4 border-zinc-800 
            ${index !== quizzes.length - 1 ? "sm:border-b" : ""}`}>
                <QuizRow groupChatId={groupChat.id} quiz={quiz} setReloadCounter={setReloadCounter}
                dropdownPosition={dropdownPosition} />
            </div>
        ); 
    });
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

// Formats the content of a message so that WhatsApp-style text markup is displayed correctly
// (e.g. *bold*, _italic_)
export function applyTextMarkup(content: string): (string | JSX.Element)[] {
    
    // Define a recursive function to process the text
    const processText = (text: string, regex: RegExp , className: string): (string | JSX.Element)[] => {
        if (!regex.test(text)) return [text]; // Base case: no matches found
        
        const segments = [];
        let lastIndex = 0;
        text.replace(regex, (match, group1, offset) => {
            // Add the text before the match
            if (offset > lastIndex) {
                segments.push(...processText(text.slice(lastIndex, offset), regex, className));
            }
            // Add the formatted span
            segments.push(<span key={offset} className={className}>{group1}</span>);
            lastIndex = offset + match.length;
            return match;
        });
        
        // Add any remaining text after the last match
        if (lastIndex < text.length) {
            segments.push(...processText(text.slice(lastIndex), regex, className));
        }
        
        return segments;
    };

    // Replace in a specific order to handle nested formatting
    let processedContent = processText(content, /\*_(.*?)_\*/g, 'font-bold italic');
    processedContent = processedContent.flatMap((segment) =>
        typeof segment === 'string' ? processText(segment, /\*(.*?)\*/g, 'font-bold') : segment
    );
    processedContent = processedContent.flatMap((segment) =>
        typeof segment === 'string' ? processText(segment, /_(.*?)_/g, 'italic') : segment
    );

    return processedContent;
};

// Plays a sound effect given a ref to an HTMLAudioElement
export function playSoundEffect(audioRef: React.RefObject<HTMLAudioElement>) {
    if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch((error) => {
            console.error("Error playing sound effect: ", error);
        });
    }
}

// This function executes a sequence of events, each with a delay between them.
export function executeEventSequence(sequence: { action: () => void, delay: number }[]) {
    let index = 0;
    const executeNext = () => {
        const event = sequence[index];
        setTimeout(() => {
            event.action();
            index++;
            if (index < sequence.length) executeNext();
        }, event.delay);
    };
    executeNext();
}

// ===================================== Response alert animations =====================================

// This function determines the appropriate animation class for an alert, given its response status.
const determineAlertAnimationClassName = (responseStatus: ResponseStatus) => {
    const color = responseStatus.success ? " bg-blue-2" : " bg-purple-2";
    if (responseStatus.doAnimate) {
        if (responseStatus.message === "") {
            return " animate-alertExiting" + color;
        } else {
            return " animate-alertEntering" + color;
        }
    }
    return " hidden";
}

export function renderResponseAlert(responseStatus: ResponseStatus, positioning: string) {
    const success: boolean = responseStatus.success;
    return (
        <div className={`${positioning} z-50 p-2 rounded-2xl overflow-hidden backdrop-blur-lg
        ${determineAlertAnimationClassName(responseStatus)}`}>
            <div className="relative">
                {success
                    ? <SuccessIcon className="text-blue-500 w-[40px] h-[40px]" />
                    : <AlertIcon className="text-purple-500 w-[40px] h-[40px]" />
                }
                <div className="absolute left-[50px] top-[50%] translate-y-[-50%] whitespace-nowrap">
                    {responseStatus.message}
                </div>
            </div>
        </div>
    );
}

export function renderModalResponseAlert(responseStatus: ResponseStatus, noTitle: boolean = false) {
    const success: boolean = responseStatus.success;
        return (
            <div className={`${noTitle ? " mb-6 mt-4 sm:mb-12 sm:mt-10" : " my-6 sm:my-12"}`}>
                <div className={`mx-auto mb-[2px] text-lg sm:text-xl text-center ${success ? "text-blue-50" : "text-purple-50"}`}>
                    {responseStatus.message}
                </div>
                <div className="flex justify-center animate__animated animate__fadeIn">
                    {success
                        ? <SuccessIcon className="text-blue-500 w-12 h-12 sm:w-14 sm:h-14" />
                        : <AlertIcon className="text-purple-500 w-12 h-12 sm:w-14 sm:h-14" />
                    }
                </div>
            </div>
        )
}

// =====================================================================================================

