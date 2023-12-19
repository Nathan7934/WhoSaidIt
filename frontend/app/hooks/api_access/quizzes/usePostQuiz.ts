import { EXTERNAL_API_ROOT } from "@/app/constants";
import { PostSurvivalQuiz, PostTimeAttackQuiz } from "@/app/interfaces";

import useAuthFetch from "../../useAuthFetch";

export default function usePostQuiz() {

    const authFetch = useAuthFetch();

    const postQuiz = async (
        groupChatId: number, 
        config: PostSurvivalQuiz | PostTimeAttackQuiz
    ): Promise<string | null> => {

        // We determine the config type by checking for a unique property
        const requestUrl: string = 'numberOfSkips' in config
            ? `${EXTERNAL_API_ROOT}/group-chats/${groupChatId}/quizzes/survival`
            : `${EXTERNAL_API_ROOT}/group-chats/${groupChatId}/quizzes/time-attack`;

        try {
            const response: Response = await authFetch(requestUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(config)
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

    return postQuiz;
}