import { EXTERNAL_API_ROOT } from "@/app/constants";

import useAuthFetch from "../../useAuthFetch";

export default function useDeleteMessages() {

    const authFetch = useAuthFetch();

    const deleteMessages = async (messageIds: Array<number>): Promise<string | null> => {

        const requestUrl: string = `${EXTERNAL_API_ROOT}/messages`;

        try {
            const response: Response = await authFetch(requestUrl, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(messageIds)
            });
            if (!response.ok) {
                if (response.status >= 400 && response.status < 500) {
                    console.error(`Client request rejected: ${response.status}`);
                    return "Client request rejected";
                } else if (response.status >= 500) {
                    console.error(`Server failed request: ${response.status}`);
                    return "Server failed to process request";
                }
            }
            return null;
        } catch (error) {
            console.error(error);
            return "Client failed to process request";
        }

    }

    return deleteMessages;
}