export interface Quiz {
    id: number;
    type: string;
    name: string;
    createdDate: Date;
    description: string;
    hasSpecifiedMessages: boolean;
}

export interface SurvivalQuiz extends Quiz {
    numberOfSkips: number;
}

export interface TimeAttackQuiz extends Quiz {
    numberOfQuestions: number;
    initialQuestionScore: number;
    penaltyPerSecond: number;
    wrongAnswerPenalty: number;
}

export interface GroupChatInfo {
    id: number;
    name: string;
    uploadDate: Date;
    numParticipants: number;
    numMessages: number;
    quizzes: Array<Quiz>;
}