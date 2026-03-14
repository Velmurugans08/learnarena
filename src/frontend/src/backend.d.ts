import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface LeaderboardEntry {
    xp: bigint;
    username: string;
    userId: string;
}
export type Result_2 = {
    __kind__: "ok";
    ok: {
        correct: boolean;
        score: bigint;
    };
} | {
    __kind__: "err";
    err: string;
};
export type Result_6 = {
    __kind__: "ok";
    ok: {
        message: string;
        xpEarned: bigint;
        passed: boolean;
    };
} | {
    __kind__: "err";
    err: string;
};
export type Result_5 = {
    __kind__: "ok";
    ok: BattleRecord;
} | {
    __kind__: "err";
    err: string;
};
export interface BattleRecord {
    playerIds: Array<string>;
    winnerId: string;
    userId: string;
    scores: Array<[string, bigint]>;
    mode: string;
    timestamp: bigint;
}
export type Result_1 = {
    __kind__: "ok";
    ok: {
        correct: boolean;
        message: string;
        xpEarned: bigint;
    };
} | {
    __kind__: "err";
    err: string;
};
export type Result_4 = {
    __kind__: "ok";
    ok: UserProfile;
} | {
    __kind__: "err";
    err: string;
};
export type Result = {
    __kind__: "ok";
    ok: bigint;
} | {
    __kind__: "err";
    err: string;
};
export type Result_3 = {
    __kind__: "ok";
    ok: string;
} | {
    __kind__: "err";
    err: string;
};
export interface CodingProblem {
    id: string;
    moduleId: bigint;
    title: string;
    xpReward: bigint;
    hint: string;
    description: string;
    brokenCode: string;
    solutionKeyword: string;
}
export interface Module {
    id: string;
    theme: string;
    icon: string;
    name: string;
    description: string;
}
export interface UserProfile {
    xp: bigint;
    completedWorlds: Array<string>;
    username: string;
    userId: string;
    level: bigint;
    achievements: Array<string>;
    battleWins: bigint;
}
export interface McqQuestion {
    id: string;
    moduleId: bigint;
    correctOption: string;
    question: string;
    xpReward: bigint;
    hint: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    checkCode(userId: string, problemId: string, submittedCode: string): Promise<Result_6>;
    completeBattle(_battleId: string): Promise<Result_5>;
    createBattle(_userId: string, _mode: string): Promise<Result_5>;
    getAiHint(questionId: string): Promise<Result_3>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCodingProblems(moduleId: string): Promise<Array<CodingProblem>>;
    getLeaderboard(_filterModule: string | null): Promise<Array<LeaderboardEntry>>;
    getMcqQuestions(moduleId: string): Promise<Array<McqQuestion>>;
    getModules(): Promise<Array<Module>>;
    getProfile(userId: string): Promise<Result_4>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    joinBattle(_userId: string, _battleId: string): Promise<Result_5>;
    loginUser(_email: string, _passwordHash: string): Promise<Result_4>;
    registerUser(username: string, _email: string, _passwordHash: string): Promise<Result_3>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitBattleAnswer(_userId: string, _battleId: string, _answer: string, _timeTaken: bigint): Promise<Result_2>;
    submitMcqAnswer(userId: string, questionId: string, selectedOption: string): Promise<Result_1>;
    updateXP(userId: string, xpToAdd: bigint): Promise<Result>;
}
