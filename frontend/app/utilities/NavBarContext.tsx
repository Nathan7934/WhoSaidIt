"use client";

import React, { SetStateAction } from 'react';
import { createContext, useState } from 'react';

// This custom context stores the state of the NavBar in a global state.
// Thus, the navbar can be manipulated from anywhere in the app.
// To access, use the useNavBar() hook

export type NavBarState = "DEFAULT" | "PASSWORD" | "EMAIL";
interface NavBarContextType {
    navBarHidden: boolean,
    navBarExpanded: boolean,
    navBarState: NavBarState,
    setNavBarHidden: React.Dispatch<SetStateAction<boolean>>,
    setNavBarExpanded: React.Dispatch<SetStateAction<boolean>>,
    setNavBarState: React.Dispatch<SetStateAction<NavBarState>>,
}
const NavBarContext = createContext<NavBarContextType>({
    navBarHidden: false,
    navBarExpanded: false,
    navBarState: "DEFAULT",
    setNavBarHidden: () => {},
    setNavBarExpanded: () => {},
    setNavBarState: () => {},
});

interface Props {
    children: React.ReactNode
}
export const NavBarProvider: React.FC<Props> = ({ children }) => {
    const [navBarHidden, setNavBarHidden] = useState<boolean>(false);
    const [navBarExpanded, setNavBarExpanded] = useState<boolean>(false);
    const [navBarState, setNavBarState] = useState<NavBarState>("DEFAULT");

    return (
        <NavBarContext.Provider value={{navBarHidden, navBarExpanded, navBarState, setNavBarHidden, setNavBarExpanded, setNavBarState}}>
            {children}
        </NavBarContext.Provider>
    )
}

export default NavBarContext;