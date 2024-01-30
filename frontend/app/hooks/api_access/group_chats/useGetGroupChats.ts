import { EXTERNAL_API_ROOT } from "@/app/constants";

import useAuth from "../../context_imports/useAuth";
import useAuthFetch from "../../security/useAuthFetch";
import { GroupChat } from "@/app/interfaces";

export default function useGetGroupChats() {

    const { userId } = useAuth();
    const authFetch = useAuthFetch();

    const getGroupChats = async (): Promise<Array<GroupChat> | null> => {

        const requestUrl: string = `${EXTERNAL_API_ROOT}/users/${userId}/group-chats`;

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

    return getGroupChats;
}