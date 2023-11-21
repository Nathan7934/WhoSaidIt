import { EXTERNAL_API_ROOT } from "@/app/constants";
import { Participant } from "@/app/interfaces";

import useAuthFetch from "../../useAuthFetch";

export default function useGetParticipants() {

    const authFetch = useAuthFetch();

    const getParticipants = async (groupChatId: number): Promise<Array<Participant> | null> => {
        
        const requestUrl: string = `${EXTERNAL_API_ROOT}/group-chats/${groupChatId}/participants`;

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
            
            return await response.json();

        } catch (error) {
            console.error(error);
            return null;
        }
    }

    return getParticipants;
}