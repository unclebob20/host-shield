import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

const Layout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden ml-0 lg:ml-64 transition-all duration-300">
                {/* Mobile Header */}
                <header className="lg:hidden glass border-b border-white/20 flex items-center h-16 px-4 sticky top-0 z-20">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="text-slate-500 hover:text-slate-700 focus:outline-none p-2"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    <span className="ml-4 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                        HostShield
                    </span>
                </header>

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
