import { EXTERNAL_API_ROOT, INTERNAL_API_ROOT } from "@/app/constants";

import useAuth from "../../useAuth";
import useAuthFetch from "../../useAuthFetch";
import useRefreshToken from "../../useRefreshToken";
import { User } from "@/app/interfaces";

export default function useRequestActiveUser() {

    const { userId } = useAuth();
    const authFetch = useAuthFetch();
    const refreshToken = useRefreshToken();

    const requestActiveUser = async (): Promise<User | null> => {
        let currentUserId = userId;

        // If there is no userId stored in the context, attempt to retrieve one using the refresh token:
        if(!currentUserId) {
            const refreshResponse = await refreshToken();
            if (!refreshResponse) {
                console.error("Failed to retrieve user id - No stored session");
                return null;
            }
            currentUserId = refreshResponse.user_id;
        }

        const requestUrl: string = `${EXTERNAL_API_ROOT}/users/${currentUserId}`;

        try {
            const response: Response = await authFetch(requestUrl);
            if (!response.ok) {
                if (response.status >= 400 && response.status < 500) {
                    console.error(`Client failed request: ${response.status}`);
                    return null;
                } else if (response.status >= 500) {
                    console.error(`Server failed request: ${response.status}`);
                    return null;
                }
            }

            const parsedJson: User = await response.json();
            return parsedJson;
            
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    return requestActiveUser;
}