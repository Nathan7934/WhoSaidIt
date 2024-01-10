import useAuth from "./useAuth";
import { EXTERNAL_API_ROOT } from "@/app/constants";

// Takes a URL Token extracted from a shareable link and attempts to validate it.
// If successful, the returned access token is stored in the AuthContext for use in future requests to appropriate endpoints.
// Returns true if the token was successfully validated, false otherwise.

export default function useValidateUrlToken() {

    const validateUrlToken = async (quizId: number, token: string): Promise<string | null> => {
        
        const requestUrl: string = `${EXTERNAL_API_ROOT}/auth/quizzes/${quizId}/validate-url-token`;

        try {
            const response: Response = await fetch(requestUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: token
            });
            if (!response.ok) {
                if (response.status >= 400 && response.status < 500) {
                    console.error(`Client request rejected: ${response.status}`);
                } else if (response.status >= 500) {
                    console.error(`Server failed to process request: ${response.status}`);
                }
                return null;
            }

            const parsedJson = await response.json();
            console.log("Shareable token validated successfully.");
            return parsedJson.access_token;

        } catch (error) {
            console.error(error);
            return null;
        }
    }

    return validateUrlToken;
}