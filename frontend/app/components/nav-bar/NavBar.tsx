"use client";

import { User, ResponseStatus } from "@/app/interfaces";
import { renderModalResponseAlert, toggleModal, isModalOpen } from "@/app/utilities/miscFunctions";
import Modal from "../modals/Modal";

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
import CreateQuizIcon from "../icons/nav-bar/CreateQuizIcon";
import ShareIcon from "../icons/nav-bar/ShareIcon";

// Navbar submenus
import GroupChatUploadSubmenu from "./GroupChatUploadSubmenu";
import DashboardFocusSubmenu from "./DashboardFocusSubmenu";
import ChangePasswordSubmenu from "./ChangePasswordSubmenu";
import ChangeEmailSubmenu from "./ChangeEmailSubmenu";

import DeleteAccountModal from "../modals/DeleteAccountModal";

import useNavBar from "@/app/hooks/context_imports/useNavBar";
import useGetActiveUser from "@/app/hooks/api_access/user/useGetActiveUser";
import useHandleLogout from "@/app/hooks/security/useHandleLogout";
import useAdjustContentHeight from "@/app/hooks/useAdjustContentHeight";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function NavBar() {
    
    // ----------- Hooks ------------------
    const router = useRouter();
    const pathname = usePathname();

    // Extract NavBar state from global context
    const { navBarExpanded, navBarState, refetchDataCounter, setNavBarExpanded, setNavBarState, setRefetchDataCounter } = useNavBar();

    // API access
    const getActiveUser = useGetActiveUser();
    const handleLogout = useHandleLogout();

    // ----------- State (Data) -----------
    const [user, setUser] = useState<User | null>(null);

    // ----------- State (UI) -------------
    const [doDisplayNavBar, setDoDisplayNavBar] = useState<boolean>(true);

    const [isFullWidth, setIsFullWidth] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [doAnimateExpansion, setDoAnimateExpansion] = useState<boolean>(false);
    const [doAnimateMenuOptionsTransition, setDoAnimateMenuOptionsTransition] = useState<boolean>(false);
    const [isHomeButton, setIsHomeButton] = useState<boolean>(true);
    const [navBarOverlayHidden, setNavBarOverlayHidden] = useState<boolean>(true);

    const [loggingOut, setLoggingOut] = useState<boolean>(false);
    const [logoutResponseStatus, setLogoutResponseStatus] = useState<ResponseStatus>({ message: "", success: false, doAnimate: false });

    // Adjust the height of the page content area
    useAdjustContentHeight(".navbar", ".page-content", [loading, navBarState]);

    // ----------- Determine if rendered -----------
    // We do not want the Navbar to render on certain pages. As of now, '/quiz' is the only page where the Navbar should not render.
    useEffect(() => {
        const doDisplay = !pathname.includes("/quiz");
        setDoDisplayNavBar(doDisplay);
        if (!doDisplay) setDoAnimateExpansion(false);
    }, [pathname]);

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
    }, [refetchDataCounter]);

    // ----------- Data Helpers -----------

    const executeLogout = async () => {
        setLoggingOut(true);
        const error: string | null = await handleLogout();
        if (!error) {
            setLogoutResponseStatus({ 
                message: "Successfully logged out.", 
                success: true, 
                doAnimate: true 
            });
            setTimeout(() => {
                if (isModalOpen("logout-confirmation-modal")) toggleModal("logout-confirmation-modal");
                router.push("/"); // Navigate to home page
                setNavBarExpanded(false);
                setLogoutResponseStatus({ message: "", success: false, doAnimate: false });
                setTimeout(() => {
                    setDoAnimateExpansion(false);
                    setDoAnimateMenuOptionsTransition(false);
                    setUser(null);
                }, 150);
            }, 1000);
        } else {
            console.error("Error logging out: ", error);
            setLogoutResponseStatus({ 
                message: "Error logging out. Please try again or contact developer.", 
                success: false, 
                doAnimate: true 
            });
            setTimeout(() => {
                if (isModalOpen("logout-confirmation-modal")) toggleModal("logout-confirmation-modal");
                setLogoutResponseStatus({ message: "", success: false, doAnimate: false });
            }, 3000);
        }
        setLoggingOut(false);
    }

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
        if (navBarState === "DEFAULT") setDoAnimateMenuOptionsTransition(false);
        else if (navBarState === "UPLOAD" || navBarState === "FOCUS" || navBarState === "PASSWORD" || navBarState === "EMAIL") {
            setDoAnimateMenuOptionsTransition(true);
        }
    }, [navBarState]);

    // Ensures that the desktop navbar overlay does not render when the navbar is collapsed
    useEffect(() => {
        if (!isFullWidth) {
            if (navBarExpanded) {
                setNavBarOverlayHidden(false);
            } else {
                setTimeout(() => {
                    setNavBarOverlayHidden(true);
                }, 200);
            }
        }
    }, [navBarExpanded]);

    // =============== RENDER FUNCTIONS ===============

    if (!doDisplayNavBar) return <></>; // Do not render Navbar if not on a page where it should be displayed

    const renderLogoutConfirmationModal = () => {
        let modalContent: JSX.Element;
        if (logoutResponseStatus.doAnimate) {
            modalContent = renderModalResponseAlert(logoutResponseStatus, true);
        } else if (loggingOut) {
            modalContent = (
                <div className="mb-6 mt-4 sm:mb-12 sm:mt-10">
                    <div className="mx-auto mb-2 text-lg sm:text-xl text-center text-gray-11">
                            Logging Out...
                    </div>
                    <div className="flex justify-center">
                        <div className="spinner-circle w-10 h-10 sm:w-12 sm:h-12" />
                    </div>
                </div>
            );
        } else {
            modalContent = (<>
                <div className="w-full text-center text-2xl font-semibold">
                    Are you sure?
                </div>
                <div className="grid grid-cols-2 gap-2 my-4 mx-7">
                    <button className="grow btn btn-lg"
                    onClick={() => toggleModal("logout-confirmation-modal")}>
                        Cancel
                    </button>
                    <button className="grow btn btn-lg"
                    onClick={() => executeLogout()}>
                        Logout
                    </button>
                </div>
            </>);
        }

        return (
            <Modal domId="logout-confirmation-modal" darkOverlay>
                {modalContent}
            </Modal>
        );
    }

    const renderMainMenuOptions = () => {
        if (loading) {
            return <div className="spinner-circle spinner-lg absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]" />;
        }
        if (!user) { // Encourage user to register
            const createAccountClicked = () => {
                setNavBarExpanded(false);
                router.push("/register");
            }
            return (
                <div className="flex flex-col px-2 items-center">
                    <div className="mt-8 text-3xl font-semibold">
                        Welcome, Guest
                    </div>
                    <div className="mt-1 text-xl text-zinc-50 font-light">
                        You are not logged in
                    </div>
                    <div className="mt-8 text-center text-zinc-50 font-medium">
                        With an account, you'll be able to:
                    </div>
                    <div className="flex flex-col gap-4 items-center mt-4 text-lg text-gray-12 font-light">
                        <div className="flex rounded-2xl bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 noselect">
                            <div className="grow flex items-center px-4 py-3 bg-black rounded-2xl m-[1px]">
                                <UploadIcon className="w-7 h-7 text-indigo-100 ml-auto" />
                                <div className="ml-3 text-lg font-normal mr-auto text-zinc-50">
                                    Upload Group Chats
                                </div>
                            </div>
                        </div>
                        <div className="flex rounded-2xl bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 noselect">
                            <div className="grow flex items-center px-4 py-3 bg-black rounded-2xl m-[1px]">
                                <CreateQuizIcon className="w-7 h-7 text-indigo-100" />
                                <div className="ml-3 text-lg font-normal text-zinc-50">
                                    Create Custom Quizzes
                                </div>
                            </div>
                        </div>
                        <div className="flex rounded-2xl bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 noselect">
                            <div className="grow flex items-center px-4 py-3 bg-black rounded-2xl m-[1px]">
                                <ShareIcon className="w-7 h-7 text-indigo-100" />
                                <div className="ml-3 text-lg font-normal text-zinc-50">
                                    Share with Friends
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-10 text-zinc-50">
                        To get started, register and sign up
                    </div>
                    <button className="mt-3 text-xl py-3 px-8 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600
                    rounded-2xl font-medium" onClick={() => createAccountClicked()}>
                        Create Account
                    </button>
                </div>
            )
        }

        return (
            <div className="flex flex-col w-full px-6">
                <div className="flex my-6 items-center">
                    <UserIcon className="w-14 h-14 text-zinc-50" />
                    <div className="ml-2">
                        <div className="text-2xl font-semibold text-zinc-50">
                            {user.username}
                        </div>
                        <div className="text-sm text-zinc-400">
                            {user.email}
                        </div>
                    </div>
                </div>
                <div className="font-bold text-xl">Group Chats</div>
                <div className="flex flex-col gap-4 ml-3 mt-4 text-lg text-zinc-50 font-light">
                    <div className="flex items-center">
                        <GroupChatIcon className="w-5 h-5" />
                        <Link href="/group-chats">
                            <div className="ml-3 md:hover:font-semibold md:hover:text-white noselect cursor-pointer"
                            onClick={() => {
                                setNavBarExpanded(false);
                                setTimeout(() => {
                                    setNavBarState("DEFAULT");
                                    // setDoAnimateMenuOptionsTransition(false);
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
                            // setDoAnimateMenuOptionsTransition(true);
                            setNavBarState("UPLOAD");
                        }}>
                            Upload New
                        </div>
                    </div>
                    <div className="flex items-center">
                        <FocusIcon className="w-5 h-5" />
                        <div className="ml-3 md:hover:font-semibold md:hover:text-white noselect cursor-pointer"
                        onClick={() => {
                            // setDoAnimateMenuOptionsTransition(true);
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
                            // setDoAnimateMenuOptionsTransition(true);
                            setNavBarState("PASSWORD");
                        }}>
                            Change Password
                        </div>
                    </div>
                    <div className="flex items-center">
                        <EmailIcon className="w-5 h-5" />
                        <div className="ml-3 md:hover:font-semibold md:hover:text-white noselect cursor-pointer"
                        onClick={() => {
                            // setDoAnimateMenuOptionsTransition(true);
                            setNavBarState("EMAIL");
                        }}>
                            Change Email
                        </div>
                    </div>
                    <div className="flex items-center">
                        <LogoutIcon className="w-5 h-5" />
                        <div className="ml-3 md:hover:font-semibold md:hover:text-white noselect cursor-pointer"
                        onClick={() => toggleModal("logout-confirmation-modal")}>
                            Logout
                        </div>
                    </div>
                </div>
                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-6 items-center mt-2 underline font-light
                decoration-1 decoration-zinc-700/50 underline-offset-4 noselect text-sm">
                    <a className="transition duration-200 cursor-pointer text-zinc-600"
                    href="https://github.com/Nathan7934/WhoSaidIt" target="_blank">
                        GitHub
                    </a>
                    <a className="transition duration-200 cursor-pointer text-zinc-600"
                    href="https://www.gnu.org/licenses/gpl-3.0.en.html" target="_blank">
                        License
                    </a>
                    <a className="transition duration-200 cursor-pointer text-zinc-600"
                    onClick={() => toggleModal("delete-account-modal")}>
                        Delete Account
                    </a>
                </div>
            </div>
        );
    }

    const renderMenu = () => {
        let subMenu: JSX.Element | null;
        switch (navBarState) {
            case "UPLOAD":
            case "UPLOAD_EXITING":
                subMenu = <GroupChatUploadSubmenu userId={user?.id} />; 
                break;
            case "FOCUS":
            case "FOCUS_EXITING":
                subMenu = <DashboardFocusSubmenu/>;
                break;
            case "PASSWORD":
            case "PASSWORD_EXITING":
                subMenu = <ChangePasswordSubmenu/>; 
                break;
            case "EMAIL":
            case "EMAIL_EXITING":
                subMenu = <ChangeEmailSubmenu/>; 
                break;
            default:
                subMenu = null; 
                break;
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
            <div className={`fixed top-navbar left-0 md:left-auto md:w-[450px] right-0 bottom-0 bg-black z-40 md:border-l border-zinc-800 
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
                {renderLogoutConfirmationModal()}
                <DeleteAccountModal modalDomId="delete-account-modal" setUser={setUser} />
            </div>
        );
    }

    // =============== MAIN RENDER ===============

    const homeBackButtonClicked = () => {
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
            <div className="hidden md:inline-block ml-8 text-3xl font-semibold noselect">
                WhoSaidIt
            </div>
            <div className={`h-full flex items-center w-[70px] md:w-[70px] md:ml-auto md:pl-[5px] md:border-l border-gray-5
            ${doAnimateExpansion ? navBarExpanded ? " md:animate-homeCloseExpand" : " md:animate-homeCloseCollapse" : ""}`}>
                <button className="" onClick={() => homeBackButtonClicked()}>
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
        {!isFullWidth && !navBarOverlayHidden &&
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