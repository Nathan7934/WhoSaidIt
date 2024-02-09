import { EXTERNAL_API_ROOT } from "@/app/constants";

import useAuthFetch from "../../security/useAuthFetch";
import useAuth from "../../context_imports/useAuth";

export default function useDeleteUser() {

    const authFetch = useAuthFetch();
    const { userId } = useAuth();

    const deleteUser = async (): Promise<string | null> => {

        const requestUrl: string = `${EXTERNAL_API_ROOT}/users/${userId}`;

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

    return deleteUser;
}