import { EXTERNAL_API_ROOT } from "@/app/constants";

import useAuthFetch from "../../useAuthFetch";
import { Message, MessagePage, PaginationConfig } from "@/app/interfaces";

export default function useRequestMessages() {

    const authFetch = useAuthFetch();

    const requestMessages = async (groupChatId: number, paginationConfig: PaginationConfig): Promise<MessagePage | null> => {

        const { pageNumber, pageSize, ascending } = paginationConfig;
        const requestUrl: string = `${EXTERNAL_API_ROOT}/group-chats/${groupChatId}/messages/paginated?`;

        try {
            const response: Response = await authFetch(requestUrl + new URLSearchParams({
                pageNumber: `${pageNumber}`,
                pageSize: `${pageSize}`,
                ascending: `${ascending}`
            }));
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

    return requestMessages;
}