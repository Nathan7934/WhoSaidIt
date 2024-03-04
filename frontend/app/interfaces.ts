export interface User {
    id: number;
    username: string;
    email: string;
    focusedGroupChatId: number;
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

// Interfaces for POST requests
export interface PostQuiz {
    quizName: string;
    description: string;
}

export interface PostSurvivalQuiz extends PostQuiz {
    numberOfSkips: number;
}

export interface PostTimeAttackQuiz extends PostQuiz {
    numberOfQuestions: number;
    initialQuestionScore: number;
    penaltyPerSecond: number;
    wrongAnswerPenalty: number;
}

// This interface contains more information for the quiz page and complies with security reqs
export interface QuizInfo {
    id: number;
    type: string;
    quizName: string;
    description: string;
    username: string;
    groupChatName: string;
    participants: Array<Participant>;
}

export interface SurvivalQuizInfo extends QuizInfo {
    numberOfSkips: number;
}

export interface TimeAttackQuizInfo extends QuizInfo {
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

// Post request interfaces
export interface PostLeaderboardEntry {
    playerName: string;
    playerUUID: string;
}

export interface PostTimeAttackEntry extends PostLeaderboardEntry {
    score: number;
    timeTaken: number;
}

export interface PostSurvivalEntry extends PostLeaderboardEntry {
    streak: number;
    skipsUsed: number;
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