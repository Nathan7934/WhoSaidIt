import { EXTERNAL_API_ROOT } from "@/app/constants";
import { TimeAttackEntry, SurvivalEntry, QuizLeaderboardInfo } from "@/app/interfaces";

import useAuthFetch from "../../useAuthFetch";

interface ResponseInfo {
    first: number;
    second: Array<TimeAttackEntry | SurvivalEntry>;
}
export default function useGetGroupChatLeaderboards() {

    const authFetch = useAuthFetch();

    // Main hook function
    const getGroupChatLeaderboards = async (groupChatId: number): Promise<Array<QuizLeaderboardInfo> | null> => {

        const requestUrl: string = `${EXTERNAL_API_ROOT}/group-chats/${groupChatId}/leaderboard`;

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
            const parsedJson = await response.json();

            // This amounts to a conversion from a Java tuple to an object with more informative property names
            const quizLeaderboardsInfo: Array<QuizLeaderboardInfo> = parsedJson.map(
                ({first: quizId, second: leaderboard}: ResponseInfo) => 
                ({
                    quizId,
                    leaderboard
                })
            );

            return quizLeaderboardsInfo;

        } catch (error) {
            console.error(error);
            return null;
        }
    }

    return getGroupChatLeaderboards;
}