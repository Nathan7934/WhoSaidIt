import { EXTERNAL_API_ROOT } from "@/app/constants";
import { TimeAttackEntry, SurvivalEntry } from "@/app/interfaces";

import useAuthFetch from "../../security/useAuthFetch";

export default function useGetPastPlayerLeaderboardEntry() {

    const authFetch = useAuthFetch();

    const getPastPlayerLeaderboardEntry = async (
        quizId: number, 
        playerUUID: string,
        shareableToken?: string | undefined
    ): Promise<TimeAttackEntry | SurvivalEntry | null> => {

        const requestUrl: string = `${EXTERNAL_API_ROOT}/quizzes/${quizId}/leaderboard/${playerUUID}`;

        try {
            const response: Response = await authFetch(requestUrl, {}, shareableToken);
            if (!response.ok) {
                if (response.status === 404) {
                    console.log("No previous leaderboard entry found for player.");
                } else if (response.status >= 400 && response.status < 500) {
                    console.error(`Client request rejected: ${response.status}`);
                } else if (response.status >= 500) {
                    console.error(`Server failed request: ${response.status}`);
                }
                return null;
            }
            return await response.json();
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    return getPastPlayerLeaderboardEntry;
}