"use client";

import { NavBarState } from "@/app/utilities/NavBarContext";
import { NAVBAR_HEIGHT } from "@/app/constants";
import { User } from "@/app/interfaces";

import MenuIcon from "../icons/MenuIcon";
import HomeIcon from "../icons/HomeIcon";
import CloseIcon from "../icons/CloseIcon";
import UserIcon from "../icons/UserIcon";

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
                <div className="flex mt-6 items-center">
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
                <div className="mt-6 font-bold text-xl">Main Menu</div>
                <div className="flex flex-col gap-1 ml-6 mt-2 text-lg text-gray-12 font-light">
                    <div>Manage Group Chats</div>
                    <div>Upload New</div>
                    <div>Change Dashboard Focus</div>
                </div>
                <div className="mt-6 font-bold text-xl">Account</div>
                <div className="flex flex-col gap-1 ml-6 mt-2 text-lg text-gray-12 font-light">
                    <div>Change Password</div>
                    <div>Change Email</div>
                    <div>Logout</div>
                    <div>Delete Account</div>
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
                    <HomeIcon className="ml-4 h-7 w-7 text-gray-11" />
                </Link>
            </div>
            <div className="mx-auto text-3xl font-semibold text-gray-12">
                WhoSaidIt
            </div>
            <button className="w-[70px]"
            onClick={() => {
                setDoAnimateExpansion(true);
                setNavBarExpanded(!navBarExpanded);
            }}>
                {navBarExpanded
                    ? <CloseIcon className="ml-auto mr-[21px] h-7 w-7 text-gray-11" />
                    : <MenuIcon className="ml-auto mr-4 h-10 w-10 text-gray-11" />
                }
            </button>
        </div>
        {/* Navbar Menu */}
        <div className={`fixed top-navbar left-0 right-0 bottom-0 bg-black z-40 shadow-[0_0px_15px_5px_rgba(0,0,0,0.8)]
        ${getMenuAnimationClass()}`}>
            {renderMainMenuContent()}
        </div>
    </>);
}