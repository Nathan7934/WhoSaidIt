export interface User {
    id: number;
    username: string;
    email: string;
}

// ======= GROUP CHATS =======
export interface GroupChat {
    id: number;
    groupChatName: string;
    uploadDate: Date;
    fileName: string;
}

// This interface contains more information for the dashboard to reduce fetch calls
export interface GroupChatInfo {
    id: number;
    groupChatName: string;
    uploadDate: Date;
    numParticipants: number;
    numMessages: number;
    quizzes: Array<SurvivalQuiz | TimeAttackQuiz>;
}

// ======= QUIZZES =======
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

// ======= LEADERBOARDS =======
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

// ======= MESSAGES =======
export interface Participant {
    id: number;
    name: string;
    numberOfMessages: number;
}

export interface Message {
    id: number;
    sender: Participant;
    content: string;
    timestamp: Date;
}

export interface MessagePage {
    pageNumber: number;
    totalPages: number;
    totalMessages: number;
    hasNext: boolean;
    hasPrevious: boolean;
    messages: Array<Message>;
}

export interface PaginationConfig {
    pageNumber: number;
    pageSize: number;
    ascending: boolean;
}

// ======= MISC =======
export interface ResponseStatus {
    message: string;
    success: boolean;
    doAnimate: boolean;
}