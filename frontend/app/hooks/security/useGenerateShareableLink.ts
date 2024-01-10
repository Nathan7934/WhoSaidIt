import useAuthFetch from "./useAuthFetch";
import { EXTERNAL_API_ROOT, DOMAIN_URL } from "@/app/constants";

export default function useGenerateShareableLink() {

    const authFetch = useAuthFetch();

    const generateShareableLink = async (quizId: number): Promise<string> => {

        const requestUrl: string = `${EXTERNAL_API_ROOT}/quizzes/${quizId}/generate-token`;

        try {
            const response: Response = await authFetch(requestUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            if (!response.ok) {
                if (response.status >= 400 && response.status < 500) {
                    console.error(`Client request rejected: ${response.status}`);
                    return "Client request rejected";
                } else if (response.status >= 500) {
                    console.error(`Server failed to process request: ${response.status}`);
                    return "Server failed to process request";
                }
                return "Request Failed";
            }

            const parsedJson = await response.json();
            return `Success: ${DOMAIN_URL}/quiz/${quizId}/${parsedJson.url_token}`;

        } catch (error) {
            console.error(error);
            return "Client failed request";
        }
    }

    return generateShareableLink;
}