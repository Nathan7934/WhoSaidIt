export interface User {
    id: number;
    username: string;
    email: string;
}

export interface GroupChatInfo {
    id: number;
    groupChatName: string;
    uploadDate: Date;
    numParticipants: number;
    numMessages: number;
    quizzes: Array<SurvivalQuiz | TimeAttackQuiz>;
}

export interface Quiz {
    id: number;
    type: string;
    quizName: string;
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

export interface LeaderboardEntry {
    id: number;
    type: string;
    playerName: string;
}

export interface TimeAttackEntry extends LeaderboardEntry {
    score: number;
    timeTaken: number;
    averageTimePerQuestion: number;
}

export interface SurvivalEntry extends LeaderboardEntry {
    streak: number;
    skipsUsed: number;
}

export interface QuizLeaderboardInfo {
    quizId: number;
    leaderboard: Array<TimeAttackEntry | SurvivalEntry>;
}