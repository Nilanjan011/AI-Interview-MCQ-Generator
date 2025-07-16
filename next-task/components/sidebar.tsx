"use client"

import { LayoutDashboard, Briefcase, Users, Settings, ChevronLeft, Menu } from 'lucide-react';
import { useState } from 'react';

export default function Sidebar() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <aside className={`bg-gray-800 text-white transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
            <div className="flex items-center justify-between p-4 h-16 border-b border-gray-700">
                <h1 className={`font-bold text-xl transition-opacity ${!isSidebarOpen && 'opacity-0'}`}>Admin</h1>
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-lg hover:bg-gray-700">
                    {isSidebarOpen ? <ChevronLeft /> : <Menu />}
                </button>
            </div>
            <nav className="mt-4">
                <ul>
                    <li className="px-4 py-2 hover:bg-gray-700 rounded-md m-2 cursor-pointer flex items-center">
                        <LayoutDashboard className="mr-3 flex-shrink-0" />
                        <span className={`transition-opacity ${!isSidebarOpen && 'opacity-0'}`}>Dashboard</span>
                    </li>
                    <li className="px-4 py-2 hover:bg-gray-700 rounded-md m-2 cursor-pointer flex items-center">
                        <Briefcase className="mr-3 flex-shrink-0" />
                        <span className={`transition-opacity ${!isSidebarOpen && 'opacity-0'}`}>Jobs</span>
                    </li>
                    <li className="px-4 py-2 hover:bg-gray-700 rounded-md m-2 cursor-pointer flex items-center">
                        <Users className="mr-3 flex-shrink-0" />
                        <span className={`transition-opacity ${!isSidebarOpen && 'opacity-0'}`}>Candidates</span>
                    </li>
                    <li className="px-4 py-2 hover:bg-gray-700 rounded-md m-2 cursor-pointer flex items-center">
                        <Settings className="mr-3 flex-shrink-0" />
                        <span className={`transition-opacity ${!isSidebarOpen && 'opacity-0'}`}>Settings</span>
                    </li>
                </ul>
            </nav>
        </aside>
    )
}
