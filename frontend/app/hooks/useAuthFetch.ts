import useAuth from "./useAuth";
import useRefreshToken from "./useRefreshToken";

/*
    This hook is meant to simplify authentication by providing a wrapper around the fetch API.
    
    It handles retrieving the access token from the AuthContext and attaching it to the request header.
    If the access token is expired, it will attempt to retrieve a new one using the refresh token. If successful,
    it will attach the new access token to the request header and then re-attempt the original request.
*/

export default function useAuthFetch() {
    const { auth: token } = useAuth();
    const refreshToken = useRefreshToken();

    const authFetch = async (url: string, options: RequestInit = {}) => {
        // This default response is returned when the auth token is null and a refresh request fails
        let response = new Response(null, {
            status: 401,
            statusText: "Unauthorized - No stored session"
        });
        // If we have a token stored in the context, attempt to make the request with it:
        if (token) {
            response = await fetch(url, {
                ...options,
                headers: {
                    ...options.headers,
                    Authorization: `Bearer ${token}`
                },
            });
        }
        // If there is no token in the context (can occur on manual browser refresh), or if the initial request fails with a 403 or 401,
        // attempt to retrieve a new access token using the refresh token (stored in HttpOnly cookie) and re-attempt the request:
        if (!token || response.status === 403 || response.status === 401) {
            const refreshResponse = await refreshToken();
            if (refreshResponse) {
                response = await fetch(url, {
                    ...options,
                    headers: {
                        ...options.headers,
                        Authorization: `Bearer ${refreshResponse.access_token}`
                    }
                });
            } else {
                // TODO: Here we will want to execute some logout code
            }
        }
        return response;
    }

    return authFetch;
}