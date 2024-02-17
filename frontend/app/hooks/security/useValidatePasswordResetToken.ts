import { EXTERNAL_API_ROOT } from "@/app/constants";

// Attempts to validate a password reset token.
// Returns null if validation was successful, or an error message if the token was invalid.

export default function useValidatePasswordResetToken() {

    const validatePasswordResetToken = async (userId: string, token: string): Promise<string | null> => {

        const requestUrl: string = `${EXTERNAL_API_ROOT}/auth/validate-reset-token/${userId}`;

        try {
            const response: Response = await fetch(requestUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: token
            });
            if (!response.ok) {
                if (response.status === 403) {
                    return "Reset link is expired or invalid";
                } else if (response.status >= 400 && response.status < 500) {
                    console.error(`Client request rejected: ${response.status}`);
                    return "Client request rejected";
                } else if (response.status >= 500) {
                    console.error(`Server failed to process request: ${response.status}`);
                    return "Server failed to process request";
                }
                return "Unknown error";
            }

            return null;

        } catch (error) {
            console.error(error);
            return "Client failed to process request";
        }
    }

    return validatePasswordResetToken;
}