"use client";

import useValidateUrlToken from "@/app/hooks/security/useValidateUrlToken";
import useAuth from "@/app/hooks/security/useAuth";

import { SurvivalQuizInfo, TimeAttackQuizInfo, Participant } from "@/app/interfaces";

import useGetQuizInfo from "@/app/hooks/api_access/quizzes/useGetQuizInfo";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Quiz({ params }: { params: { query: string[] } }) {

    // Extracting the NextJS route query parameters "/quiz/{quizId}/{?urlToken}"
    const quizId = Number(params.query[0]);
    const urlToken: string | null = params.query.length > 1 ? params.query[1] : null;

    // ----------- Hooks ------------------
    const router = useRouter();

    // API access hooks
    const getQuizInfo = useGetQuizInfo();

    // Security
    const { auth } = useAuth();
    const validateUrlToken = useValidateUrlToken();

    // ----------- State (Data) -----------
    const [quizInfo, setQuizInfo] = useState<TimeAttackQuizInfo | SurvivalQuizInfo | null>(null);

    // ----- Data Retrieval/Authentication -----
    useEffect(() => {
        const getPageData = async () => {
            
            // If the user is not logged in, we need to authenticate them using the urlToken
            let shareableToken: string | null = null;
            if (urlToken) {
                shareableToken = await validateUrlToken(quizId, urlToken);
                if (!shareableToken && !auth) {
                    // If the urlToken is invalid, redirect to the home page
                    console.error("Error authenticating user, redirecting to root");
                    router.push("/");
                    return;
                }
            }

            // Once authentication is verified, retrieve the static data
            const quiz: TimeAttackQuizInfo | SurvivalQuizInfo | null = await getQuizInfo(quizId, shareableToken || undefined);
            // const groupChat: GroupChat | null = await getGroupChat(groupChatId, shareableToken || undefined);
            // const participants: Array<Participant> | null = await getParticipants(groupChatId, shareableToken || undefined);
            if (quiz) {
                setQuizInfo(quiz);
            } else {
                console.error("Error retrieving data, redirecting to root");
                router.push("/");
            }
        }
        getPageData();
    }, []);

    return (<>
        <div>Quiz Id: {quizId}</div>
        <div>Participants:</div>
        <div className="flex flex-col">
            {quizInfo?.participants.map((participant, index) => {
                return <div key={index}>{participant.name}</div>
            })};
        </div>
    </>);
}