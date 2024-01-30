import { EXTERNAL_API_ROOT } from "@/app/constants";
import useAuth from "../../context_imports/useAuth";
import useAuthFetch from "../../security/useAuthFetch";

export default function usePatchFocusedGroupChat() {

    const { userId } = useAuth();
    const authFetch = useAuthFetch();

    const patchFocusedGroupChat = async (groupChatId: number): Promise<string | null> => {

        const requestUrl: string = `${EXTERNAL_API_ROOT}/users/${userId}/focused-group-chat/${groupChatId}`;

        try {
            const response: Response = await authFetch(requestUrl, {
                method: "PATCH"
            });
            if (!response.ok) {
                if (response.status >= 400 && response.status < 500) {
                    console.error(`Client failed request: ${response.status}`);
                    return 'Client request rejected';
                } else if (response.status >= 500) {
                    console.error(`Server failed request: ${response.status}`);
                    return 'Server failed to process the request';
                }
                return 'Unknown error';
            }

            return null;
        } catch (error) {
            console.error(error);
            return "Client failed to process request";
        }
    }

    return patchFocusedGroupChat;
}