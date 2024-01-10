import { EXTERNAL_API_ROOT } from "@/app/constants";
import { SurvivalQuiz, TimeAttackQuiz } from "@/app/interfaces";

import useAuthFetch from "../../security/useAuthFetch";

export default function useGetQuizzes() {

    const authFetch = useAuthFetch();

    const getQuizzes = async (groupChatId: number): Promise<Array<SurvivalQuiz | TimeAttackQuiz> | null> => {
        
        const requestUrl: string = `${EXTERNAL_API_ROOT}/group-chats/${groupChatId}/quizzes`;

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

            const quizzes: Array<SurvivalQuiz | TimeAttackQuiz> = parsedJson.map((quiz: SurvivalQuiz | TimeAttackQuiz) => ({
                ...quiz,
                createdDate: new Date(quiz.createdDate)
            }));

            return quizzes;

        } catch (error) {
            console.error(error);
            return null;
        }
    }

    return getQuizzes;
}