import { EXTERNAL_API_ROOT } from "@/app/constants";
import { PostTimeAttackEntry, PostSurvivalEntry } from "@/app/interfaces";

import useAuthFetch from "../../security/useAuthFetch";

export default function usePostLeaderboardEntry() {

    const authFetch = useAuthFetch();

    const postLeaderboardEntry = async (
        quizId: number, 
        request: PostTimeAttackEntry | PostSurvivalEntry,
        shareableToken?: string | undefined
    ): Promise<string | null> => {

        // We determine the request type by checking for a unique property
        const requestUrl: string = 'score' in request
            ? `${EXTERNAL_API_ROOT}/quizzes/${quizId}/leaderboard/time-attack`
            : `${EXTERNAL_API_ROOT}/quizzes/${quizId}/leaderboard/survival`;

        try {
            const response: Response = await authFetch(requestUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(request)
            }, shareableToken);
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

    return postLeaderboardEntry;
}