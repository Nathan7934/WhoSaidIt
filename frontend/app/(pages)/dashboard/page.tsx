"use client";

import useAuth from "@/app/hooks/useAuth";

import Image from "next/image";

export default function Dashboard() {

    const { userId } = useAuth();

    return (
        <main className="flex min-h-screen flex-col items-center justify-between">
            <div className="relative w-[95%] lg:w-[90%] xl:w-[70%] 2xl:w-[60%] mt-24">
                <div className="text-5xl font-bold">Welcome, Nathan7934!</div>
                {/* <div className="divider"></div> */}
                <div className="w-full flow-root mt-8">
                    <div className="float-left btn-group btn-group-scrollable">
                        <button className="btn">Manage Group Chats</button>
                        <button className="btn">Manage Quizzes</button>
                    </div>
                    <button className="float-right btn btn-primary">Upload New Group Chat</button>
                </div>
                {/* <div className="flex items-center gap-3 mt-6 whitespace-nowrap">
                    YOUR RECENT GROUP CHAT
                    <div className="divider divider-horizontal w-full"></div>
                </div> */}
                {/* <div className="divider divider-horizontal mt-10">LATEST GROUP CHAT</div> */}
                <div className="w-full grid grid-cols-3 mt-8 bg-zinc-950 py-7 px-5 rounded-md border border-gray-7">
                    <div className="flex-grow col-span-2 relative">
                        <div className="text-3xl font-medium ml-1">
                            Plumpa: End Game <span className="text-gray-7 font-light ml-2">(Latest)</span>
                        </div>
                        <div className="mt-3">
                            <span className="badge badge-outline">
                                <span className="font-normal mr-2">Uploaded:</span> 10/08/2023
                            </span>
                            <span className="badge badge-outline ml-2">
                                <span className="font-normal mr-2">Participants:</span> 12
                            </span>
                            <span className="badge badge-outline ml-2">
                                <span className="font-normal mr-2">Messages:</span> 403
                            </span>
                        </div>
                        <div className="mt-8 text-lg underline decoration-1 underline-offset-2 text-gray-9 font-light">
                            Most active quizzes:
                        </div>
                        <div className="w-full mt-4 pr-8">
                            {/* QUIZZES */}
                            {/* <div className="divider my-0"></div> */}
                            <div className="grid grid-cols-2 grid-rows-2 gap-1">
                                <div>
                                    <span className="text-xl font-semibold">Masters of Plump</span>
                                    <span className="ml-3 py-[2px] px-2 bg-blue-4 rounded-lg text-blue-12 text-sm
                                    font-semibold relative bottom-[1px]">Time Attack</span>
                                </div>
                                <div className="row-span-2 justify-self-end self-center flex items-center">
                                    <button className="btn btn-outline btn-sm mr-2">Copy Link</button>
                                    <div className="dropdown">
                                        <label tabIndex={0} className="hover:cursor-pointer"><Image src="menu.svg" alt="Menu" width={44} height={44} /></label>
                                        <div className="dropdown-menu dropdown-menu-bottom-left">
                                            <a className="dropdown-item text-sm">Quiz Leaderboard</a>
                                            <a tabIndex={-1} className="dropdown-item text-sm">Messages in Quiz</a>
                                            <a tabIndex={-1} className="dropdown-item text-sm text-red-9">Delete Quiz</a>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-9 self-center">
                                    Created: 09/23/2023
                                </div>
                            </div>
                            <div className="divider my-0"></div>
                            <div className="grid grid-cols-3 grid-rows-2 gap-1">
                                <div className="col-span-2">
                                    <span className="text-xl font-semibold">Plumpa Loremaster</span>
                                    <span className="ml-3 py-[2px] px-2 bg-red-4 rounded-lg text-red-12 text-sm
                                    font-semibold relative bottom-[1px]">Survival</span>
                                </div>
                                <div className="row-span-2 justify-self-end self-center flex items-center">
                                    <button className="btn btn-outline btn-sm mr-2">Copy Link</button>
                                    <Image src="menu.svg" alt="Menu" width={44} height={44} />
                                </div>
                                <div className="text-sm text-gray-9 self-center">
                                    Created: 09/23/2023
                                </div>
                            </div>
                            <div className="divider my-0"></div>
                            <div className="grid grid-cols-3 grid-rows-2 gap-1">
                                <div className="col-span-2">
                                    <span className="text-xl font-semibold">To Plump, or not to Plump</span>
                                    <span className="ml-3 py-[2px] px-2 bg-blue-4 rounded-lg text-blue-12 text-sm
                                    font-semibold relative bottom-[1px]">Time Attack</span>
                                </div>
                                <div className="row-span-2 justify-self-end self-center flex items-center">
                                    <button className="btn btn-outline btn-sm mr-2">Copy Link</button>
                                    <Image src="menu.svg" alt="Menu" width={44} height={44} />
                                </div>
                                <div className="text-sm text-gray-9 self-center">
                                    Created: 09/23/2023
                                </div>
                            </div>
                            {/* <div className="divider my-0"></div> */}
                            {/* QUIZZES END */}
                        </div>
                        <div className="absolute bottom-0">
                            <button className="btn btn-primary btn-sm mr-2">Generate New Quiz</button>
                            <button className="btn mr-2 btn-sm">View Messages</button>
                            <button className="btn btn-sm mr-2">Manage Participants</button>
                        </div>
                    </div>
                    <div>
                        <div className="w-full text-center text-xl mb-2 font-medium">
                            ~ Leaderboards ~
                        </div>
                        <div className="w-full h-[400px] bg-gray-1 border border-border rounded-lg shadow-md">
                            
                        </div>
                    </div>
                </div>
                {/* <div className="flex items-center gap-1 mt-6 whitespace-nowrap text-gray-9 font-light">
                    Older Group Chats
                    <div className="divider divider-horizontal w-full"></div>
                </div> */}
                <div className="divider divider-horizontal mt-10 mb-6 text-gray-9 font-light">Older Group Chats</div>
                <div className="accordion-group accordion-group-bordered">
                    <div className="accordion">
                        <input type="checkbox" id="toggle-15" className="accordion-toggle" />
                        <label htmlFor="toggle-15" className="accordion-title bg-zinc-950">
                            <span className="font-light">A Virgin Squad Christmas</span>
                            <div className="mt-0">
                                <span className="badge badge-outline">
                                    <span className="font-normal mr-2">Uploaded:</span> 10/08/2023
                                </span>
                                <span className="badge badge-outline ml-2">
                                    <span className="font-normal mr-2">Participants:</span> 3
                                </span>
                                <span className="badge badge-outline ml-2">
                                    <span className="font-normal mr-2">Messages:</span> 75
                                </span>
                            </div>
                        </label>
                        <span className="accordion-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M13.293 6.293 7.586 12l5.707 5.707 1.414-1.414L10.414 12l4.293-4.293z"></path></svg>
                        </span>
                        <div className="accordion-content text-content2 bg-[#09090bb9]">
                            <div className="min-h-0">
                                <div className="grid grid-cols-2 grid-rows-2 gap-1">
                                    <div>
                                        <span className="text-xl font-semibold">Masters of Plump</span>
                                        <span className="ml-3 py-[2px] px-2 bg-blue-4 rounded-lg text-blue-12 text-sm
                                        font-semibold relative bottom-[1px]">Time Attack</span>
                                    </div>
                                    <div className="row-span-2 justify-self-end self-center flex items-center">
                                        <button className="btn btn-outline btn-sm mr-2">Copy Link</button>
                                        <div className="dropdown">
                                            <label tabIndex={0} className="hover:cursor-pointer"><Image src="menu.svg" alt="Menu" width={44} height={44} /></label>
                                            <div className="dropdown-menu dropdown-menu-bottom-left">
                                                <a className="dropdown-item text-sm">Quiz Leaderboard</a>
                                                <a tabIndex={-1} className="dropdown-item text-sm">Messages in Quiz</a>
                                                <a tabIndex={-1} className="dropdown-item text-sm text-red-9">Delete Quiz</a>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-9 self-center">
                                        Created: 09/23/2023
                                    </div>
                                </div>
                                <div className="divider my-0"></div>
                                <div className="grid grid-cols-3 grid-rows-2 gap-1">
                                    <div className="col-span-2">
                                        <span className="text-xl font-semibold">Spot THAT Virgin</span>
                                        <span className="ml-3 py-[2px] px-2 bg-red-4 rounded-lg text-red-12 text-sm
                                        font-semibold relative bottom-[1px]">Survival</span>
                                    </div>
                                    <div className="row-span-2 justify-self-end self-center flex items-center">
                                        <button className="btn btn-outline btn-sm mr-2">Copy Link</button>
                                        <Image src="menu.svg" alt="Menu" width={44} height={44} />
                                    </div>
                                    <div className="text-sm text-gray-9 self-center">
                                        Created: 09/23/2023
                                    </div>
                                </div>
                                <div className="mt-8">
                                    <button className="btn btn-primary btn-sm mr-2">Generate New Quiz</button>
                                    <button className="btn mr-2 btn-sm">View Messages</button>
                                    <button className="btn btn-sm mr-2">Manage Participants</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="accordion">
                        <input type="checkbox" id="toggle-16" className="accordion-toggle" />
                        <label htmlFor="toggle-16" className="accordion-title bg-zinc-950">
                            <span className="font-light">Anti-Goon Chat (November 2023)</span>
                            <div className="mt-0">
                                <span className="badge badge-outline">
                                    <span className="font-normal mr-2">Uploaded:</span> 10/08/2023
                                </span>
                                <span className="badge badge-outline ml-2">
                                    <span className="font-normal mr-2">Participants:</span> 9
                                </span>
                                <span className="badge badge-outline ml-2">
                                    <span className="font-normal mr-2">Messages:</span> 114
                                </span>
                            </div>
                        </label>
                        <span className="accordion-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M13.293 6.293 7.586 12l5.707 5.707 1.414-1.414L10.414 12l4.293-4.293z"></path></svg>
                        </span>
                        <div className="accordion-content text-content2">
                            <div className="min-h-0">Lorem ipsum dolor sit amet consectetur adipisicing elit. Nulla necessitatibus iusto laborum autem placeat aspernatur inventore eius deleniti reprehenderit? Numquam commodi totam mollitia quod</div>
                        </div>
                    </div>
                </div>


                {/* <div className="w-full grid grid-cols-3 grid-rows-2 bg-zinc-950 rounded-md px-4 py-2 border border-gray-7">
                    <div className="col-span-2">
                        <div className="text-xl font-semibold">
                            Virgin Squad Christmas
                        </div>
                    </div>
                </div> */}
            </div>
        </main>
    )
}