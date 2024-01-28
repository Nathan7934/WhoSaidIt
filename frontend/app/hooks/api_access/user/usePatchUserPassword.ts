import { EXTERNAL_API_ROOT } from "@/app/constants";
import useAuthFetch from "../../security/useAuthFetch";
import useAuth from "../../context_imports/useAuth";

export default function usePatchUserPassword() {

    const authFetch = useAuthFetch();
    const { userId } = useAuth();

    const patchUserPassword = async (currentPassword: string, newPassword: string): Promise<string | null> => {
        const requestBody = {
            currentPassword: currentPassword,
            newPassword: newPassword
        };
        const requestUrl: string = `${EXTERNAL_API_ROOT}/users/${userId}/password`;

        try {
            const response: Response = await authFetch(requestUrl, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestBody)
            });
            if (!response.ok) {
                if (response.status === 422) { // Server returns UNPROCESSABLE_ENTITY if current password is incorrect
                    return 'Current password is incorrect';
                } else if (response.status >= 400 && response.status < 500) {
                    return 'Client request rejected';
                } else if (response.status >= 500) {
                    return 'Server failed to process the request';
                }
                return 'Unknown error';
            }

            return null;

        } catch (error) {
            console.error(error);
            return "Client failed to process request";
        }
    }

    return patchUserPassword;
}