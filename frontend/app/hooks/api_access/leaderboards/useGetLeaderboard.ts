import { EXTERNAL_API_ROOT } from "@/app/constants";
import { TimeAttackEntry, SurvivalEntry, QuizLeaderboardInfo } from "@/app/interfaces";

import useAuthFetch from "../../security/useAuthFetch";

export default function useGetLeaderboard() {

    const authFetch = useAuthFetch();

    const getLeaderboard = async (quizId: number): Promise<Array<TimeAttackEntry | SurvivalEntry> | null> => {

        const requestUrl: string = `${EXTERNAL_API_ROOT}/quizzes/${quizId}/leaderboard`;

        try {
            const response: Response = await authFetch(requestUrl);
            if (!response.ok) {
                if (response.status >= 400 && response.status < 500) {
                    console.error(`Client request rejected: ${response.status}`);
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

    return getLeaderboard;
}