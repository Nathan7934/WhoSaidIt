"use client";

import React, { SetStateAction } from 'react';
import { createContext, useState } from 'react';

// This custom context stores the state of the NavBar in a global state.
// Thus, the navbar can be manipulated from anywhere in the app.
// To access, use the useNavBar() hook

export type NavBarState = "DEFAULT" | "UPLOAD" | "FOCUS" | "PASSWORD" | "EMAIL" 
| "UPLOAD_EXITING" | "FOCUS_EXITING" | "PASSWORD_EXITING" | "EMAIL_EXITING";
interface NavBarContextType {
    navBarExpanded: boolean,
    navBarState: NavBarState,
    refetchDataCounter: number,
    setNavBarExpanded: React.Dispatch<SetStateAction<boolean>>,
    setNavBarState: React.Dispatch<SetStateAction<NavBarState>>,
    setRefetchDataCounter: React.Dispatch<SetStateAction<number>>,
}
const NavBarContext = createContext<NavBarContextType>({
    navBarExpanded: false,
    navBarState: "DEFAULT",
    refetchDataCounter: 0,
    setNavBarExpanded: () => {},
    setNavBarState: () => {},
    setRefetchDataCounter: () => {},
});

interface Props {
    children: React.ReactNode
}
export const NavBarProvider: React.FC<Props> = ({ children }) => {
    const [navBarHidden, setNavBarHidden] = useState<boolean>(false);
    const [navBarExpanded, setNavBarExpanded] = useState<boolean>(false);
    const [navBarState, setNavBarState] = useState<NavBarState>("DEFAULT");
    const [refetchDataCounter, setRefetchDataCounter] = useState<number>(0);

    return (
        <NavBarContext.Provider value={{navBarExpanded, navBarState, refetchDataCounter, setNavBarExpanded, setNavBarState, setRefetchDataCounter}}>
            {children}
        </NavBarContext.Provider>
    )
}

export default NavBarContext;