import useAuth from "./useAuth";
import { EXTERNAL_API_ROOT } from "@/app/constants";

// Takes a URL Token extracted from a shareable link and attempts to validate it.
// If successful, the returned access token is stored in the AuthContext for use in future requests to appropriate endpoints.
// Returns true if the token was successfully validated, false otherwise.

export default function useValidateUrlToken() {
    const { setShareableAuth } = useAuth();

    const validateUrlToken = async (quizId: number, token: string): Promise<boolean> => {
        
        const requestUrl: string = `${EXTERNAL_API_ROOT}/auth/quizzes/${quizId}/validate-url-token`;

        try {
            const response: Response = await fetch(requestUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ urlToken: token })
            });
            if (!response.ok) {
                if (response.status >= 400 && response.status < 500) {
                    console.error(`Client request rejected: ${response.status}`);
                } else if (response.status >= 500) {
                    console.error(`Server failed to process request: ${response.status}`);
                }
                return false;
            }

            const parsedJson = await response.json();
            setShareableAuth(parsedJson.access_token);
            return true;

        } catch (error) {
            console.error(error);
            return false;
        }
    }

    return validateUrlToken;
}