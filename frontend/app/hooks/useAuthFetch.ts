import { INTERNAL_API_ROOT } from "../constants";
import useAuth from "./useAuth";

/*
    This hook is meant to simplify authentication by providing a wrapper around the fetch API.
    
    It handles retrieving the access token from the AuthContext and attaching it to the request header.
    If the access token is expired, it will attempt to retrieve a new one using the refresh token. If successful,
    it will attach the new access token to the request header and then re-attempt the original request.
*/

export default function useAuthFetch() {
    const { auth: token, setUserId, setAuth } = useAuth();

    const authFetch = async (url: string, options: RequestInit = {}) => {
        let response = await fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                Authorization: `Bearer ${token}`,
            },
        });
        if (response.status === 403) {
            const refreshResponse = await fetch(`${INTERNAL_API_ROOT}/refresh`);
            if (refreshResponse.ok) {
                const { user_id, access_token } = await refreshResponse.json();
                setUserId(user_id);
                setAuth(access_token);
                response = await fetch(url, {
                    ...options,
                    headers: {
                        ...options.headers,
                        Authorization: `Bearer ${access_token}`,
                    },
                });
            } else {
                // TODO: Here we will want to execute some logout code
            }
        }
        return response;
    }

    return authFetch;
}