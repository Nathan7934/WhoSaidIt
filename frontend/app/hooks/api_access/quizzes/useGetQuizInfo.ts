import { EXTERNAL_API_ROOT } from "@/app/constants";
import { SurvivalQuizInfo, TimeAttackQuizInfo } from "@/app/interfaces";

import useAuthFetch from "../../security/useAuthFetch";

export default function useGetQuizInfo() {

    const authFetch = useAuthFetch();

    const getQuizInfo = async (quizId: number, shareableToken?: string | undefined): Promise<SurvivalQuizInfo | TimeAttackQuizInfo | null> => {

        const requestUrl: string = `${EXTERNAL_API_ROOT}/quizzes/${quizId}/info`;

        try {
            const response: Response = await authFetch(requestUrl, {}, shareableToken);
            if (!response.ok) {
                if (response.status >= 400 && response.status < 500) {
                    console.error(`Client failed request: ${response.status}`);
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

    return getQuizInfo;
}