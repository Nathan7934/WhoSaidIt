"use client";

import { NavBarState } from "@/app/utilities/NavBarContext";
import { NAVBAR_HEIGHT } from "@/app/constants";
import { User } from "@/app/interfaces";

// Navbar header icons
import MenuIcon from "../icons/MenuIcon";
import HomeIcon from "../icons/HomeIcon";
import CloseIcon from "../icons/CloseIcon";
import BackIcon from "../icons/nav-bar/BackIcon";

// Navbar menu icons
import UserIcon from "../icons/nav-bar/UserIcon";
import GroupChatIcon from "../icons/nav-bar/GroupChatIcon";
import UploadIcon from "../icons/nav-bar/UploadIcon";
import FocusIcon from "../icons/nav-bar/FocusIcon";
import PasswordIcon from "../icons/nav-bar/PasswordIcon";
import EmailIcon from "../icons/nav-bar/EmailIcon";
import LogoutIcon from "../icons/nav-bar/LogoutIcon";

// Navbar submenus
import GroupChatUploadSubmenu from "./GroupChatUploadSubmenu";

import useNavBar from "@/app/hooks/useNavBar";
import useGetActiveUser from "@/app/hooks/api_access/user/useGetActiveUser";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NavBar() {
    
    // ----------- Hooks ------------------
    const router = useRouter();

    // Extract NavBar state from global context
    const { navBarHidden, navBarExpanded, navBarState, setNavBarHidden, setNavBarExpanded, setNavBarState } = useNavBar();

    // API access
    const getActiveUser = useGetActiveUser();

    // ----------- State (Data) -----------
    const [user, setUser] = useState<User | null>(null);

    // ----------- State (UI) -------------
    const [isFullWidth, setIsFullWidth] = useState<boolean>(window.innerWidth < 768);
    const [loading, setLoading] = useState<boolean>(false);
    const [doAnimateExpansion, setDoAnimateExpansion] = useState<boolean>(false);
    const [doAnimateMenuOptionsTransition, setDoAnimateMenuOptionsTransition] = useState<boolean>(false);
    const [isHomeButton, setIsHomeButton] = useState<boolean>(true);

    // ----------- Data Retrieval ---------
    useEffect(() => {
        const getNavBarData = async () => {
            setLoading(true);
            const activeUser: User | null = await getActiveUser();
            if (activeUser) {
                setUser(activeUser);
            }
            setLoading(false);
        }
        getNavBarData();
    }, []);

    // ----------- UI Effects ---------

    // We maintain the isFullWidth state variable to determine whether the NavBar should be full width or not.
    useEffect(() => {
        // If the viewport width is less than 1024px (TailwindCSS 'lg' breakpoint), we switch to the mobile layouts determined by isMobile
        const handleResize = () => {
            setIsFullWidth(window.innerWidth < 768);
        }
        handleResize();
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
        }
    }, []);

    useEffect(() => {
        setIsHomeButton(navBarState === "DEFAULT" || navBarState.includes("EXITING"));
    }, [navBarState])

    // =============== RENDER FUNCTIONS ===============

    const renderMainMenuOptions = () => {
        if (!user) return null;

        return (
            <div className="flex flex-col w-full px-6">
                <div className="flex my-6 items-center">
                    <UserIcon className="w-14 h-14 text-gray-12" />
                    <div className="ml-2">
                        <div className="text-2xl font-semibold text-gray-12">
                            {user.username}
                        </div>
                        <div className="text-sm font-medium text-gray-11">
                            {user.email}
                        </div>
                    </div>
                </div>
                <div className="font-bold text-xl">Group Chats</div>
                <div className="flex flex-col gap-4 ml-3 mt-4 text-lg text-gray-12 font-light">
                    <div className="flex items-center">
                        <GroupChatIcon className="w-5 h-5" />
                        <Link href="/group-chats">
                            <div className="ml-3 md:hover:font-semibold md:hover:text-white noselect cursor-pointer"
                            onClick={() => {
                                setNavBarExpanded(false);
                                setTimeout(() => {
                                    setNavBarState("DEFAULT");
                                    setDoAnimateMenuOptionsTransition(false);
                                }, 150); // Wait for menu to close before resetting state
                            }}>
                                Manage Group Chats
                            </div>
                        </Link>
                    </div>
                    <div className="flex items-center">
                        <UploadIcon className="w-5 h-5" />
                        <div className="ml-3 md:hover:font-semibold md:hover:text-white noselect cursor-pointer"
                        onClick={() => {
                            setDoAnimateMenuOptionsTransition(true);
                            setNavBarState("UPLOAD");
                        }}>
                            Upload New
                        </div>
                    </div>
                    <div className="flex items-center">
                        <FocusIcon className="w-5 h-5" />
                        <div className="ml-3 md:hover:font-semibold md:hover:text-white noselect cursor-pointer"
                        onClick={() => {
                            setDoAnimateMenuOptionsTransition(true);
                            setNavBarState("FOCUS");
                        }}>
                            Change Dashboard Focus
                        </div>
                    </div>
                </div>
                <div className="mt-6 font-bold text-xl">Account</div>
                <div className="flex flex-col gap-4 ml-3 mt-4 text-lg text-gray-12 font-light">
                    <div className="flex items-center">
                        <PasswordIcon className="w-5 h-5" />
                        <div className="ml-3 md:hover:font-semibold md:hover:text-white noselect cursor-pointer"
                        onClick={() => {
                            setDoAnimateMenuOptionsTransition(true);
                            setNavBarState("PASSWORD");
                        }}>
                            Change Password
                        </div>
                    </div>
                    <div className="flex items-center">
                        <EmailIcon className="w-5 h-5" />
                        <div className="ml-3 md:hover:font-semibold md:hover:text-white noselect cursor-pointer"
                        onClick={() => {
                            setDoAnimateMenuOptionsTransition(true);
                            setNavBarState("EMAIL");
                        }}>
                            Change Email
                        </div>
                    </div>
                    <div className="flex items-center">
                        <LogoutIcon className="w-5 h-5" />
                        <div className="ml-3 md:hover:font-semibold md:hover:text-white noselect cursor-pointer">
                            Logout
                        </div>
                    </div>
                </div>
                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-6 items-center mt-2 text-gray-8 underline font-light
                decoration-1 decoration-gray-8/50 underline-offset-4 noselect text-sm">
                    <a className="transition duration-200 hover:text-gray-11 hover:decoration-gray-11/50 cursor-pointer"
                    href="https://github.com/Nathan7934/WhoSaidIt" target="_blank">
                        GitHub
                    </a>
                    <a className="transition duration-200 hover:text-gray-11 hover:decoration-gray-11/50 cursor-pointer">
                        License
                    </a>
                    <a className="transition duration-200 hover:text-gray-11 hover:decoration-gray-11/50 cursor-pointer">
                        Delete Account
                    </a>
                </div>
            </div>
        );
    }

    const renderMenu = () => {
        if (loading) return <></>; // TODO: Add loading animation
        if (!user) {
            // TODO: Direct user to login/signup page
            return <></>;
        }

        let subMenu: JSX.Element | null;
        switch (navBarState) {
            case "UPLOAD":
            case "UPLOAD_EXITING":
                subMenu = <GroupChatUploadSubmenu userId={user.id} />; 
                break;
            case "FOCUS":
            case "FOCUS_EXITING":
                subMenu = <>Focus</>; 
                break;
            case "PASSWORD":
            case "PASSWORD_EXITING":
                subMenu = <>Password</>; 
                break;
            case "EMAIL":
            case "EMAIL_EXITING":
                subMenu = <>Email</>; 
                break;
            default:
                subMenu = null; break;
        }

        const getMenuAnimationClass = () => {
            if (!doAnimateExpansion) {
                return " hidden";
            } else if (navBarExpanded) {
                return " animate-menuEntering";
            }
            return " animate-menuExiting";
        }

        const getMenuOptionsAnimationClass = () => {
            if (!doAnimateMenuOptionsTransition) return "";
            if (navBarState === "DEFAULT" || navBarState.includes("EXITING")) {
                return " animate-subMenuEnteringFromLeft";
            }
            return " animate-subMenuExitingToLeft";
        }

        return (
            <div className={`fixed top-navbar left-0 md:left-auto md:w-[450px] right-0 bottom-0 bg-black z-40 md:border-l border-gray-5 
            shadow-[0_0px_15px_5px_rgba(0,0,0,0.8)] overflow-x-hidden ${getMenuAnimationClass()}`}>
                <div className={`fixed top-0 left-0 right-0 bottom-0 ${getMenuOptionsAnimationClass()}`}>
                    {renderMainMenuOptions()}
                </div>
                {navBarState !== "DEFAULT" &&
                    <div className={`fixed top-0 left-0 right-0 bottom-0
                    ${navBarState.includes("EXITING") ? " animate-subMenuExitingToRight" : " animate-subMenuEnteringFromRight"}`}>
                        {subMenu}
                    </div>
                }
            </div>
        );
    }

    // =============== MAIN RENDER ===============

    const homeCloseButtonClicked = () => {
        if (isHomeButton) {
            setNavBarExpanded(false);
            router.push("/"); // Navigate to home page
            setTimeout(() => {
                setNavBarState("DEFAULT");
                setDoAnimateMenuOptionsTransition(false);
            }, 150); // Wait for menu to close before resetting state
        } else {
            switch (navBarState) {
                case "UPLOAD":
                    setNavBarState("UPLOAD_EXITING"); break;
                case "FOCUS":
                    setNavBarState("FOCUS_EXITING"); break;
                case "PASSWORD":
                    setNavBarState("PASSWORD_EXITING"); break;
                case "EMAIL":
                    setNavBarState("EMAIL_EXITING"); break;
                default:
                    break;
            }
            setTimeout(() => {
                setNavBarState("DEFAULT");
            }, 500);
        }
    }

    return (<>
        {/* Navbar Header */}
        <div className={`fixed flex top-0 left-0 right-0 h-navbar items-center bg-zinc-950 border-b border-gray-5 z-50
        shadow-[0_0px_15px_5px_rgba(0,0,0,0.8)]`}>
            <div className="hidden md:inline-block ml-8 text-3xl font-semibold">
                WhoSaidIt
            </div>
            <div className={`h-full flex items-center w-[70px] md:w-[70px] md:ml-auto md:pl-[5px] md:border-l border-gray-5
            ${doAnimateExpansion ? navBarExpanded ? " md:animate-homeCloseExpand" : " md:animate-homeCloseCollapse" : ""}`}>
                <button className="" onClick={() => homeCloseButtonClicked()}>
                    {isHomeButton
                        ? <HomeIcon className="relative left-[2px] ml-4 h-7 w-7 text-gray-12" />
                        : <BackIcon className="relative left-[2px] ml-4 h-7 w-7 text-gray-12" />}
                </button>
            </div>
            <div className="md:hidden mx-auto text-3xl font-semibold">
                WhoSaidIt
            </div>
            <button className="w-[70px]"
            onClick={() => {
                setDoAnimateExpansion(true);
                if (navBarExpanded) {
                    setTimeout(() => {
                        setNavBarState("DEFAULT");
                        setDoAnimateMenuOptionsTransition(false);
                    }, 150); // Wait for menu to close before resetting state
                }
                setNavBarExpanded(!navBarExpanded);
            }}>
                {navBarExpanded
                    ? <CloseIcon className="ml-auto mr-[22px] h-7 w-7 text-gray-12" />
                    : <MenuIcon className="ml-auto mr-4 h-10 w-10 text-gray-12" />
                }
            </button>
        </div>
        {/* Navbar Menu */}
        {renderMenu()}
        {/* Navbar Overlay */}
        {!isFullWidth &&
            <div className={`fixed top-navbar left-0 right-0 bottom-0 bg-black/75 z-10 animate__animated animate__duration-200ms
            ${doAnimateExpansion ? navBarExpanded ? " animate__fadeIn" : " animate__fadeOut" : " hidden"}`}
            onClick={() => {
                setNavBarExpanded(false);
                setTimeout(() => {
                    setNavBarState("DEFAULT");
                    setDoAnimateMenuOptionsTransition(false);
                }, 150); // Wait for menu to close before resetting state
            }} />
        }
    </>);
}