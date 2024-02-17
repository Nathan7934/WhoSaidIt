import { EXTERNAL_API_ROOT } from "@/app/constants";

export default function usePatchPasswordReset() {

    const patchPasswordReset = async (userId: string, newPassword: string, token: string): Promise<string | null> => {

        const requestUrl: string = `${EXTERNAL_API_ROOT}/password-reset/${userId}`;

        try {
            const response: Response = await fetch(requestUrl, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(newPassword)
            });
            if (!response.ok) {
                if (response.status === 403) {
                    console.error("Token is expired or invalid: 403");
                    return "Token is expired or invalid";
                } else if (response.status >= 400 && response.status < 500) {
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

    return patchPasswordReset;

}