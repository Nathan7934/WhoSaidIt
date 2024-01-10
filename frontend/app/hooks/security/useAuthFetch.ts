import useAuth from "./useAuth";
import useRefreshToken from "./useRefreshToken";

/*
    This hook is meant to simplify authentication by providing a wrapper around the fetch API.
    
    It handles retrieving the access token from the AuthContext and attaching it to the request header.
    If the access token is expired, it will attempt to retrieve a new one using the refresh token. If successful,
    it will attach the new access token to the request header and then re-attempt the original request.
*/

export default function useAuthFetch() {
    const { auth: token, shareableAuth: shareableToken, setShareableAuth } = useAuth();
    const refreshToken = useRefreshToken();

    const authFetch = async (url: string, options: RequestInit = {}) => {
        // This default response is returned when the auth token is null and a refresh request fails
        let response = new Response(null, {
            status: 401,
            statusText: "Unauthorized - No stored session"
        });

        // If we have a shareable token stored in the context (from a link), first attempt to make the request using that
        if (shareableToken) {
            response = await executeRequest(url, options, shareableToken);
            if (response.status === 403 || response.status === 401) {
                // If the request fails, user may be trying to access a resource that requires them to be logged in.
                // If they are logged in, we clear the shareable token to prevent future requests from using it.
                setShareableAuth(null);
            } else {
                return response; // Return early if the request was successful
            }
        }

        // If we have a loggedin token stored in the context, attempt to make the request with it:
        if (token) {
            response = await executeRequest(url, options, token);
        }
        // If there is no token in the context (can occur on manual browser refresh), or if the initial request fails with a 403 or 401,
        // attempt to retrieve a new access token using the refresh token (stored in HttpOnly cookie) and re-attempt the request:
        if (!token || response.status === 403 || response.status === 401) {
            const refreshResponse = await refreshToken();
            if (refreshResponse) {
                response = await executeRequest(url, options, refreshResponse.access_token);
            }
        }
        return response;
    }

    // This function is used to execute the request with the provided auth token:
    const executeRequest = async (url: string, options: RequestInit = {}, authToken: string) => {
        return await fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                Authorization: `Bearer ${authToken}`
            },
        });
    }

    return authFetch;
}