import { EXTERNAL_API_ROOT } from "@/app/constants";

import useAuthFetch from "../../security/useAuthFetch";

export default function useDeleteParticipant() {

    const authFetch = useAuthFetch();

    const deleteParticipant = async (participantId: number): Promise<string | null> => {

        const requestUrl: string = `${EXTERNAL_API_ROOT}/participants/${participantId}`;

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

    return deleteParticipant;
}