import { INTERNAL_API_ROOT } from '@/app/constants';

import useAuth from '../context_imports/useAuth';

// A simple hook for refreshing the local access token using the internal API.
// Returns the token and user id if successful, otherwise returns null.
interface RefreshResponse {
    user_id: number;
    access_token: string;
}
export default function useRefreshToken() {

    const { setUserId, setAuth } = useAuth();

    const refreshToken = async (): Promise<RefreshResponse | null> => {
        console.log("Refreshing token...");
        try {
            const refreshResponse = await fetch(`${INTERNAL_API_ROOT}/refresh`);
            const {user_id, access_token} = await refreshResponse.json();
            if (access_token && user_id) {
                setUserId(user_id);
                setAuth(access_token);
                return {user_id, access_token};
            } else {
                return null;
            }
        } catch (error) {
            console.error(error);
            return null;
        }
    }
    
    return refreshToken;
}