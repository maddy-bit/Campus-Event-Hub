import React from 'react';
import { LayoutDashboard, PlusSquare, Calendar, Users, Bell, User, LogOut, Menu, Search, BellRing } from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, active = false }) => (
    <div className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-200 border-b-2 border-black last:border-b-0 ${active ? 'bg-[#a3ff33] text-black font-bold' : 'text-gray-600 hover:bg-gray-100'}`}>
        <Icon size={20} />
        <span className="uppercase text-xs tracking-widest font-bold">{label}</span>
    </div>
);

const DashboardLayout = ({ children }) => {
    return (
        <div className="flex h-screen bg-[#f1f1f1] font-sans selection:bg-[#a3ff33]">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r-4 border-black flex flex-col">
                <div className="p-6 border-b-4 border-black flex items-center gap-2 bg-[#1a1a1a] text-white">
                    <div className="w-8 h-8 bg-white text-black flex items-center justify-center font-black rounded-sm border-2 border-black">HC</div>
                    <span className="font-black text-lg tracking-tighter italic">HUB_CTRL</span>
                </div>

                <nav className="flex-1 overflow-y-auto">
                    <SidebarItem icon={LayoutDashboard} label="Dashboard" />
                    <SidebarItem icon={PlusSquare} label="Create" active />
                    <SidebarItem icon={Calendar} label="Events" />
                    <SidebarItem icon={Users} label="Participants" />
                    <SidebarItem icon={Bell} label="Notifs" />
                </nav>

                <div className="border-t-4 border-black">
                    <SidebarItem icon={User} label="Profile" />
                    <SidebarItem icon={LogOut} label="Exit" />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col">
                {/* Top Navbar */}
                <header className="h-16 bg-[#fff] border-b-4 border-black flex items-center justify-between px-6">
                    <div className="flex items-center gap-4">
                        <button className="p-2 border-2 border-black bg-[#ffce31] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
                            <Menu size={20} />
                        </button>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                            <input
                                type="text"
                                placeholder="SEARCH DATA..."
                                className="pl-10 pr-4 py-2 border-2 border-black w-64 text-xs font-bold tracking-widest focus:outline-none focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        Status            <div className="relative p-2 border-2 border-black hover:bg-gray-100 cursor-pointer">
                            <BellRing size={20} />
                            <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 border border-black rounded-full"></div>
                        </div>
                        <div className="flex items-center gap-3 pl-4 border-l-2 border-black">
                            <div className="w-10 h-10 bg-[#a3ff33] border-2 border-black rounded-sm flex items-center justify-center font-black text-xs">
                                SJ
                            </div>
                            <div className="hidden md:block text-right">
                                <p className="text-[10px] font-black leading-none uppercase">S. Jenkins</p>
                                <p className="text-[8px] font-bold text-gray-500 uppercase">Admin ID: 01</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
