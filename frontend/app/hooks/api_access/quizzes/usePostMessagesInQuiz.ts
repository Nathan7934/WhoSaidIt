import { EXTERNAL_API_ROOT } from "@/app/constants";

import useAuthFetch from "../../security/useAuthFetch";

export default function usePostMessagesInQuiz() {

    const authFetch = useAuthFetch();

    const postMessagesInQuiz = async (quizId: number, messageIds: Array<number>, removing: boolean): Promise<string | null> => {

        const requestUrl: string = `${EXTERNAL_API_ROOT}/quizzes/${quizId}/messages`;

        try {
            const response: Response = await authFetch(requestUrl, {
                method: removing ? "PATCH" : "POST",
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

    return postMessagesInQuiz;
}