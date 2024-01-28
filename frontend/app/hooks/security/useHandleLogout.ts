import { INTERNAL_API_ROOT } from "@/app/constants";
import useAuth from "../context_imports/useAuth";

export default function useHandleLogout() {

    const {setUserId, setAuth} = useAuth();

    const handleLogout = async (): Promise<string | null> => {
        const requestUrl: string = `${INTERNAL_API_ROOT}/logout`;

        try {
            // Internal API call clears the refresh token HTTP-only cookie from the client.
            const response: Response = await fetch(requestUrl, { 
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            if (!response.ok) {
                if (response.status >= 400 && response.status < 500) {
                    return 'Client request rejected';
                } else if (response.status >= 500) {
                    return 'NextJS server failed to process the request';
                }
                return 'Unknown error';
            }

            // Clear the user ID and auth token from the client-side AuthContext.
            setUserId(null);
            setAuth(null);
            return null;

        } catch (error) {
            console.error(error);
            return "Exception thrown while client was requesting logout";
        }
    }

    return handleLogout;
}