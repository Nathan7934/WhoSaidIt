import { EXTERNAL_API_ROOT } from "@/app/constants";
import { GroupChat } from "@/app/interfaces";

import useAuthFetch from "../../useAuthFetch";

export default function useRequestGroupChat() {

    const authFetch = useAuthFetch();

    const requestGroupChat = async (groupChatId: number): Promise<GroupChat | null> => {

        const requestUrl: string = `${EXTERNAL_API_ROOT}/group-chats/${groupChatId}`;

        try {
            const response: Response = await authFetch(requestUrl);
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

            const groupChat: GroupChat = {
                ...parsedJson,
                uploadDate: new Date(parsedJson.uploadDate)
            }

            return groupChat;

        } catch (error) {
            console.error(error);
            return null;
        }
    }

    return requestGroupChat;
}