import { INTERNAL_API_ROOT } from "@/app/constants";
import useAuth from "../../context_imports/useAuth";

export default function usePostLogin() {

    const {setUserId, setAuth} = useAuth();

    const postLogin = async (username: string, password: string, rememberUser: boolean): Promise<string | null> => {
        const requestBody = {
            username: username,
            password: password,
            rememberUser: rememberUser
        };
        const requestUrl: string = `${INTERNAL_API_ROOT}/auth`;

        try {
            const response: Response = await fetch(requestUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestBody)
            });
            if (!response.ok) {
                // TODO: Refine these error messages
                if (response.status === 403) {
                    return 'Invalid username/password combination';
                } else if (response.status >= 400 && response.status < 500) {
                    return 'Client failed request';
                } else if (response.status >= 500) {
                    return 'The server failed to process the request';
                }
                return 'Unknown error';
            }

            const parsedJson = await response.json();
            setUserId(parsedJson.user_id);
            setAuth(parsedJson.access_token);
            return null;

        } catch (error) {
            console.error(error);
            return "Exception thrown while client was requesting login";
        }
    }

    return postLogin;
}