"use client";

import React, { SetStateAction } from 'react';
import { createContext, useState } from 'react';

// This custom context stores the access token in a global state
// To access, use the useAuth() hook

interface AuthContextType {
    userId: number | null,
    auth: string | null,
    setUserId: React.Dispatch<SetStateAction<number | null>>,
    setAuth: React.Dispatch<SetStateAction<string | null>>,
}
const AuthContext = createContext<AuthContextType>({
    userId: null,
    auth: null,
    setUserId: () => {},
    setAuth: () => {},
});

interface Props {
    children: React.ReactNode
}
export const AuthProvider: React.FC<Props> = ({ children }) => {
    const [userId, setUserId] = useState<number | null>(null);
    const [auth, setAuth] = useState<string | null>(null);

    return (
        <AuthContext.Provider value={{userId, auth, setUserId, setAuth}}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContext;