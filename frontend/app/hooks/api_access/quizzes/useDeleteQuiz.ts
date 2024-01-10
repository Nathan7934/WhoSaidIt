import { EXTERNAL_API_ROOT } from "@/app/constants";

import useAuthFetch from "../../security/useAuthFetch";

export default function useDeleteQuiz() {

    const authFetch = useAuthFetch();

    const deleteQuiz = async (quizId: number): Promise<string | null> => {

        const requestUrl: string = `${EXTERNAL_API_ROOT}/quizzes/${quizId}`;

        try {
            const response: Response = await authFetch(requestUrl, {
                method: "DELETE"
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

    return deleteQuiz;
}