import { EXTERNAL_API_ROOT } from "@/app/constants";

import useAuthFetch from "../../useAuthFetch";

export default function usePostGroupChatUpload() {

    const authFetch = useAuthFetch();

    const postGroupChatUpload = async (
        userId: number, 
        file: File,
        groupChatName: string,
        minChars: number
    ): Promise<string | null> => {
        if (!file) return "No file provided";

        const requestUrl: string = `${EXTERNAL_API_ROOT}/users/${userId}/group-chats/upload`;
        const formData = new FormData();
        formData.append("data", file);
        formData.append("name", groupChatName);
        formData.append("minCharacters", minChars.toString());

        try {
            const response = await authFetch(requestUrl, {
                method: "POST",
                body: formData
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

    return postGroupChatUpload;
}