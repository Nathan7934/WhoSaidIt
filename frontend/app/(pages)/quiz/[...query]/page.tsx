"use client";

import useGetQuiz from "@/app/hooks/api_access/quizzes/useGetQuiz";
import useGetGroupChat from "@/app/hooks/api_access/group_chats/useGetGroupChat";
import useGetParticipants from "@/app/hooks/api_access/participants/useGetParticipants";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Quiz({ params }: { params: { query: string[] } }) {

    // Extracting the NextJS route query parameters "/quiz/{quizId}/{?urlToken}"
    const quizId = Number(params.query[0]);
    const urlToken: string | null = params.query.length > 1 ? params.query[1] : null;

    // ----------- Hooks ------------------
    const router = useRouter();

    // API access hooks
    const getQuiz = useGetQuiz();
    const getGroupChat = useGetGroupChat();
    const getParticipants = useGetParticipants();

    return (<></>);
}