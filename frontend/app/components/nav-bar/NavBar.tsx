"use client";

import { NavBarState } from "@/app/utilities/NavBarContext";
import { NAVBAR_HEIGHT } from "@/app/constants";
import { User } from "@/app/interfaces";

// Navbar header icons
import MenuIcon from "../icons/MenuIcon";
import HomeIcon from "../icons/HomeIcon";
import CloseIcon from "../icons/CloseIcon";

// Navbar menu icons
import UserIcon from "../icons/nav-bar/UserIcon";
import GroupChatIcon from "../icons/nav-bar/GroupChatIcon";
import UploadIcon from "../icons/nav-bar/UploadIcon";
import FocusIcon from "../icons/nav-bar/FocusIcon";
import PasswordIcon from "../icons/nav-bar/PasswordIcon";
import EmailIcon from "../icons/nav-bar/EmailIcon";
import LogoutIcon from "../icons/nav-bar/LogoutIcon";

import useNavBar from "@/app/hooks/useNavBar";
import useGetActiveUser from "@/app/hooks/api_access/user/useGetActiveUser";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function NavBar() {
    
    // ----------- Hooks ------------------

    // Extract NavBar state from global context
    const { navBarHidden, navBarExpanded, navBarState, setNavBarHidden, setNavBarExpanded, setNavBarState } = useNavBar();

    // API access
    const getActiveUser = useGetActiveUser();

    // ----------- State (Data) -----------
    const [user, setUser] = useState<User | null>(null);

    // ----------- State (UI) -------------
    const [loading, setLoading] = useState<boolean>(false);
    const [doAnimateExpansion, setDoAnimateExpansion] = useState<boolean>(false);

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

    const getMenuAnimationClass = () => {
        if (!doAnimateExpansion) {
            return " hidden";
        } else if (navBarExpanded) {
            return " animate-menuEntering";
        }
        return " animate-menuExiting";
    }

    const renderMainMenuContent = () => {
        if (loading) return <></>; // TODO: Add loading animation
        if (!user) {
            // TODO: Direct user to login/signup page
            return <></>;
        }

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
                <div className="flex flex-col gap-3 ml-3 mt-4 text-lg text-gray-12 font-light">
                    <div className="flex items-center">
                        <GroupChatIcon className="w-5 h-5" />
                        <div className="ml-[6px] md:hover:font-semibold md:hover:text-white noselect cursor-pointer">
                            Manage Group Chats
                        </div>
                    </div>
                    <div className="flex items-center">
                        <UploadIcon className="w-5 h-5" />
                        <div className="ml-[6px] md:hover:font-semibold md:hover:text-white noselect cursor-pointer">
                            Upload New
                        </div>
                    </div>
                    <div className="flex items-center">
                        <FocusIcon className="w-5 h-5" />
                        <div className="ml-[6px] md:hover:font-semibold md:hover:text-white noselect cursor-pointer">
                            Change Dashboard Focus
                        </div>
                    </div>
                </div>
                <div className="mt-6 font-bold text-xl">Account</div>
                <div className="flex flex-col gap-3 ml-3 mt-4 text-lg text-gray-12 font-light">
                    <div className="flex items-center">
                        <PasswordIcon className="w-5 h-5" />
                        <div className="ml-[6px] md:hover:font-semibold md:hover:text-white noselect cursor-pointer">
                            Change Password
                        </div>
                    </div>
                    <div className="flex items-center">
                        <EmailIcon className="w-5 h-5" />
                        <div className="ml-[6px] md:hover:font-semibold md:hover:text-white noselect cursor-pointer">
                            Change Email
                        </div>
                    </div>
                    <div className="flex items-center">
                        <LogoutIcon className="w-5 h-5" />
                        <div className="ml-[6px] md:hover:font-semibold md:hover:text-white noselect cursor-pointer">
                            Logout
                        </div>
                    </div>
                </div>
                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-6 items-center mt-2 text-gray-8 underline font-light
                decoration-1 decoration-gray-8/50 underline-offset-4 noselect text-sm">
                    {/* <DeleteAccountIcon className="ml-auto w-4 h-4" /> */}
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

    return (<>
        {/* Navbar Header */}
        <div className={`fixed flex top-0 left-0 right-0 pt-1 h-navbar items-center bg-zinc-950 border-b border-gray-5 z-50
        shadow-[0_0px_15px_5px_rgba(0,0,0,0.8)]`}>
            <div className="w-[70px]">
                <Link href="/">
                    <button className="relative top-1" onClick={() => {
                        setDoAnimateExpansion(false);
                        setNavBarExpanded(false);
                    }}>
                        <HomeIcon className="relative left-[2px] ml-4 h-7 w-7 text-gray-12" />
                    </button>
                </Link>
            </div>
            <div className="mx-auto text-3xl font-semibold">
                WhoSaidIt
            </div>
            <button className="w-[70px]"
            onClick={() => {
                setDoAnimateExpansion(true);
                setNavBarExpanded(!navBarExpanded);
            }}>
                {navBarExpanded
                    ? <CloseIcon className="ml-auto mr-[22px] h-7 w-7 text-gray-12" />
                    : <MenuIcon className="ml-auto mr-4 h-10 w-10 text-gray-12" />
                }
            </button>
        </div>
        {/* Navbar Menu */}
        <div className={`fixed top-navbar left-0 md:left-auto md:w-[450px] right-0 bottom-0 bg-black z-40 md:border-l border-gray-5 
        shadow-[0_0px_15px_5px_rgba(0,0,0,0.8)] ${getMenuAnimationClass()}`}>
            {renderMainMenuContent()}
        </div>
    </>);
}