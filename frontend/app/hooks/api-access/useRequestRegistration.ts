import { INTERNAL_API_ROOT, EXTERNAL_API_ROOT } from "@/app/constants";
import useAuth from "../useAuth";

export default function useRequestRegistration() {

    const {setUserId, setAuth} = useAuth();

    const requestRegistration = async (username: string, password: string, email: string): Promise<string | null> => {
        const requestBody = {
            username: username,
            password: password,
            email: email
        };
        const requestUrl: string = `${EXTERNAL_API_ROOT}/auth/register`;

        try {
            const registerResponse: Response = await fetch(requestUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestBody)
            });
            if (!registerResponse.ok) {
                // TODO: Refine these error messages
                if (registerResponse.status === 409) {
                    return 'Username is already in use';
                }
                else if (registerResponse.status >= 400 && registerResponse.status < 500) {
                    return 'Client failed registration request';
                } else if (registerResponse.status >= 500) {
                    return 'The server failed to process the registration request';
                }
                return 'Unknown error (registration)';
            }

            // Assuming registration was successful, authenticate using the internal API with the same credentials
            const loginResponse: Response = await fetch(`${INTERNAL_API_ROOT}/auth`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({username: username, password: password})
            });
            if (!loginResponse.ok) {
                // TODO: Refine these error messages
                if (loginResponse.status >= 400 && loginResponse.status < 500) {
                    return 'Client failed login request after successful registration';
                } else if (loginResponse.status >= 500) {
                    return 'The server failed to process the login request after successful registration';
                }
                return 'Unknown error (login)';
            }

            const parsedJson = await loginResponse.json();
            setUserId(parsedJson.user_id);
            setAuth(parsedJson.access_token);
            return null;

        } catch (error) {
            console.error(error);
            return "Exception thrown during the registration process";
        }
    }

    return requestRegistration;
}