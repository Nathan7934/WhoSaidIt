import { EXTERNAL_API_ROOT } from "@/app/constants";

export default function usePostRequestPasswordReset() {

    const postRequestPasswordReset = async (email: string): Promise<string | null> => {
        
        const requestUrl: string = `${EXTERNAL_API_ROOT}/auth/request-password-reset`;

        try {
            const response: Response = await fetch(requestUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: email
            });
            console.log("Sending email: " + email);
            if (!response.ok) {
                if (response.status === 404) {
                    return 'No user with that email address was found';
                } else if (response.status >= 400 && response.status < 500) {
                    return 'Client request rejected';
                } else if (response.status >= 500) {
                    return 'Server failed to process request';
                }
                return 'Unknown error';
            }

            return null;

        } catch (error) {
            console.error(error);
            return "Exception thrown while client was requesting password reset";
        }
    }

    return postRequestPasswordReset;
}
