import { EXTERNAL_API_ROOT } from "@/app/constants";

import useAuth from "../../useAuth";
import useAuthFetch from "../../useAuthFetch";
import useRefreshToken from "../../useRefreshToken";
import { GroupChatInfo, TimeAttackQuiz, SurvivalQuiz } from "@/app/interfaces";

export default function useRequestGroupChatsInfo() {
    
    const { userId } = useAuth();
    const authFetch = useAuthFetch();
    const refreshToken = useRefreshToken();

    const requestGroupChatsInfo = async (): Promise<Array<GroupChatInfo> | null> => {
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

        const requestUrl: string = `${EXTERNAL_API_ROOT}/users/${currentUserId}/group-chats/info`;

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
            const parsedJson = await response.json();

            // Converting the deserialized LocalDateTime objects to Date objects
            const groupChatsInfo: Array<GroupChatInfo> = parsedJson.map((groupChat: GroupChatInfo) => ({
                ...groupChat,
                uploadDate: new Date(groupChat.uploadDate),
                quizzes: groupChat.quizzes.map((quiz: TimeAttackQuiz | SurvivalQuiz) => ({
                    ...quiz,
                    createdDate: new Date(quiz.createdDate)
                }))
            }));

            return groupChatsInfo;

        } catch (error) {
            console.error(error);
            return null;
        }
    }

    return requestGroupChatsInfo;
}