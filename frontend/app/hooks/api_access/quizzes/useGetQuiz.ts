import { EXTERNAL_API_ROOT } from "@/app/constants";
import { SurvivalQuiz, TimeAttackQuiz } from "@/app/interfaces";

import useAuthFetch from "../../useAuthFetch";

export default function useGetQuiz() {

    const authFetch = useAuthFetch();

    const getQuiz = async (quizId: number): Promise<SurvivalQuiz | TimeAttackQuiz | null> => {

        const requestUrl: string = `${EXTERNAL_API_ROOT}/quizzes/${quizId}`;

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

            const quiz: SurvivalQuiz | TimeAttackQuiz = {
                ...parsedJson,
                createdDate: new Date(parsedJson.createdDate)
            };

            return quiz;
            
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    return getQuiz;
}