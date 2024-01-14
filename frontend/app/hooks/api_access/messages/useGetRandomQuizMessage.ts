import { EXTERNAL_API_ROOT } from "@/app/constants";

import useAuthFetch from "../../security/useAuthFetch";
import { Message } from "@/app/interfaces";

export default function useGetRandomQuizMessage() {

    const authFetch = useAuthFetch();

    const getRandomQuizMessage = async (
        quizId: number, 
        excludedMessageIds: Array<number>,
        shareableToken?: string | undefined
    ): Promise<Message | null> => {

        const requestUrl: string = `${EXTERNAL_API_ROOT}/quizzes/${quizId}/messages/random`;
        const searchParams = new URLSearchParams({ excludedMessageIds: excludedMessageIds.join(',') });
        const routeSuffix = excludedMessageIds.length > 0 ? '?' + searchParams : '';

        try {
            const response: Response = await authFetch(requestUrl + routeSuffix, {}, shareableToken);
            if (!response.ok) {
                if (response.status >= 400 && response.status < 500) {
                    console.error(`Client failed request: ${response.status}`);
                    return null;
                } else if (response.status >= 500) {
                    console.error(`Server failed request: ${response.status}`);
                    return null;
                }
            }

            const parsedJson = await response.json();

            // Converting the deserialized LocalDateTime message timestamps to Date objects
            const message: Message = {
                ...parsedJson,
                timestamp: new Date(parsedJson.timestamp)
            };

            return message;
        
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    return getRandomQuizMessage;
}