import { GroupChatInfo } from "../interfaces";

export const demoGroupChats: Array<GroupChatInfo> = [
    {
        id: 1,
        groupChatName: "Plumpa: End Game",
        uploadDate: new Date("10/08/2023"),
        numParticipants: 12,
        numMessages: 403,
        quizzes: [
            {
                id: 1,
                type: "TIME_ATTACK",
                quizName: "Masters of Plump",
                createdDate: new Date("09/23/2023"),
                description: "",
                hasSpecifiedMessages: false,
                numberOfQuestions: 20,
                initialQuestionScore: 500,
                penaltyPerSecond: 50,
                wrongAnswerPenalty: 200
            },
            {
                id: 2,
                type: "SURVIVAL",
                quizName: "Plumpa Loremaster",
                createdDate: new Date("09/23/2023"),
                description: "",
                hasSpecifiedMessages: false,
                numberOfSkips: 3
            },
            {
                id: 3,
                type: "TIME_ATTACK",
                quizName: "To Plump, or not to Plump",
                createdDate: new Date("09/23/2023"),
                description: "",
                hasSpecifiedMessages: false,
                numberOfQuestions: 20,
                initialQuestionScore: 500,
                penaltyPerSecond: 50,
                wrongAnswerPenalty: 200
            }
        ]
    },
    {
        id: 2,
        groupChatName: "A Virgin Squad Christmas",
        uploadDate: new Date("10/02/2023"),
        numParticipants: 3,
        numMessages: 75,
        quizzes: [
            {
                id: 4,
                type: "TIME_ATTACK",
                quizName: "Was it Ming?",
                createdDate: new Date("09/23/2023"),
                description: "",
                hasSpecifiedMessages: false,
                numberOfQuestions: 20,
                initialQuestionScore: 500,
                penaltyPerSecond: 50,
                wrongAnswerPenalty: 200
            },
            {
                id: 5,
                type: "SURVIVAL",
                quizName: "Spot THAT Virgin",
                createdDate: new Date("09/23/2023"),
                description: "",
                hasSpecifiedMessages: false,
                numberOfSkips: 3
            }
        ]
    },
    {
        id: 3,
        groupChatName: "Anti-Goon Chat (November 2023)",
        uploadDate: new Date("09/23/2023"),
        numParticipants: 9,
        numMessages: 114,
        quizzes: [
            {
                id: 6,
                type: "TIME_ATTACK",
                quizName: "Oh how the Mighty have Gooned",
                createdDate: new Date("09/23/2023"),
                description: "",
                hasSpecifiedMessages: false,
                numberOfQuestions: 20,
                initialQuestionScore: 500,
                penaltyPerSecond: 50,
                wrongAnswerPenalty: 200
            },
            {
                id: 7,
                type: "SURVIVAL",
                quizName: "Plumpa Loremaster",
                createdDate: new Date("09/23/2023"),
                description: "",
                hasSpecifiedMessages: false,
                numberOfSkips: 3
            },
            {
                id: 8,
                type: "TIME_ATTACK",
                quizName: "To Plump, or not to Plump",
                createdDate: new Date("09/23/2023"),
                description: "",
                hasSpecifiedMessages: false,
                numberOfQuestions: 20,
                initialQuestionScore: 500,
                penaltyPerSecond: 50,
                wrongAnswerPenalty: 200
            }
        ]
    },
];