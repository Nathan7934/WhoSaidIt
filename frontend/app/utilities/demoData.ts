import { GroupChatInfo } from "../interfaces";

export const demoGroupChats: Array<GroupChatInfo> = [
    {
        id: 1,
        name: "Plumpa: End Game",
        uploadDate: new Date("10/08/2023"),
        numParticipants: 12,
        numMessages: 403,
        quizzes: [
            {
                id: 1,
                type: "TIME_ATTACK",
                name: "Masters of Plump",
                createdDate: new Date("09/23/2023"),
                description: "",
                hasSpecifiedMessages: false
            },
            {
                id: 2,
                type: "SURVIVAL",
                name: "Plumpa Loremaster",
                createdDate: new Date("09/23/2023"),
                description: "",
                hasSpecifiedMessages: false
            },
            {
                id: 3,
                type: "TIME_ATTACK",
                name: "To Plump, or not to Plump",
                createdDate: new Date("09/23/2023"),
                description: "",
                hasSpecifiedMessages: false
            }
        ]
    },
    {
        id: 2,
        name: "A Virgin Squad Christmas",
        uploadDate: new Date("10/02/2023"),
        numParticipants: 3,
        numMessages: 75,
        quizzes: [
            {
                id: 4,
                type: "TIME_ATTACK",
                name: "Was it Ming?",
                createdDate: new Date("09/23/2023"),
                description: "",
                hasSpecifiedMessages: false
            },
            {
                id: 5,
                type: "SURVIVAL",
                name: "Spot THAT Virgin",
                createdDate: new Date("09/23/2023"),
                description: "",
                hasSpecifiedMessages: false
            }
        ]
    },
    {
        id: 3,
        name: "Anti-Goon Chat (November 2023)",
        uploadDate: new Date("09/23/2023"),
        numParticipants: 9,
        numMessages: 114,
        quizzes: [
            {
                id: 6,
                type: "TIME_ATTACK",
                name: "Oh how the Mighty have Gooned",
                createdDate: new Date("09/23/2023"),
                description: "",
                hasSpecifiedMessages: false
            },
            {
                id: 7,
                type: "SURVIVAL",
                name: "Plumpa Loremaster",
                createdDate: new Date("09/23/2023"),
                description: "",
                hasSpecifiedMessages: false
            },
            {
                id: 8,
                type: "TIME_ATTACK",
                name: "To Plump, or not to Plump",
                createdDate: new Date("09/23/2023"),
                description: "",
                hasSpecifiedMessages: false
            }
        ]
    },
];