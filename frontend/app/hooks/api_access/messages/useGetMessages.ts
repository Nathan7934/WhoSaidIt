import { EXTERNAL_API_ROOT } from "@/app/constants";

import useAuthFetch from "../../useAuthFetch";
import { Message, MessagePage, PaginationConfig } from "@/app/interfaces";

export default function useGetMessages() {

    const authFetch = useAuthFetch();

    const getMessages = async (
        groupChatId: number, 
        paginationConfig: PaginationConfig,
        quizId: number | null = null, 
        participantId: number | null = null
    ): Promise<MessagePage | null> => {

        const { pageNumber, pageSize, ascending } = paginationConfig;
        const requestUrl: string = quizId ? 
            `${EXTERNAL_API_ROOT}/quizzes/${quizId}/messages/paginated?` :
            `${EXTERNAL_API_ROOT}/group-chats/${groupChatId}/messages/paginated?`;

        let searchParams = new URLSearchParams({
            pageNumber: `${pageNumber}`,
            pageSize: `${pageSize}`,
            ascending: `${ascending}`
        });
        if (participantId) {
            searchParams.set('participantId', `${participantId}`);
        }

        try {
            const response: Response = await authFetch(requestUrl + searchParams);
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
            const messagePage: MessagePage = {
                ...parsedJson,
                messages: parsedJson.messages.map((message: Message) => ({
                    ...message,
                    timestamp: new Date(message.timestamp)
                }))
            };

            return messagePage;

        } catch (error) {
            console.error(error);
            return null;
        }
    }

    return getMessages;
}