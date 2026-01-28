import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, FileText, Settings, LogOut, X, PlusCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import clsx from 'clsx';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const { logout } = useAuth();

    const navItems = [
        { icon: Home, label: 'Overview', to: '/' },
        { icon: PlusCircle, label: 'New Guest', to: '/guests/new' },
        { icon: Users, label: 'Guests', to: '/guests' },
        { icon: FileText, label: 'Ledger', to: '/ledger' },
        // { icon: Settings, label: 'Settings', to: '/settings' },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={clsx(
                    "fixed inset-0 z-20 bg-black/50 transition-opacity lg:hidden",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={() => setIsOpen(false)}
            />

            {/* Sidebar */}
            <aside className={clsx(
                "fixed inset-y-0 left-0 z-30 w-64 glass transform transition-transform duration-300 ease-spring lg:translate-x-0 lg:static lg:inset-auto",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex items-center justify-between h-20 px-6 border-b border-white/10">
                    <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                        HostShield
                    </span>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="lg:hidden p-2 rounded-full hover:bg-black/5 text-slate-500 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex flex-col justify-between flex-1 h-[calc(100%-5rem)] p-4">
                    <nav className="space-y-1">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                onClick={() => setIsOpen(false)}
                                className={({ isActive }) => clsx(
                                    "flex items-center px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-200 group",
                                    isActive
                                        ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20"
                                        : "text-slate-600 hover:bg-white/50 hover:text-slate-900 hover:shadow-sm hover:translate-x-1"
                                )}
                            >
                                <item.icon className={clsx(
                                    "w-5 h-5 mr-3 transition-colors",
                                    ({ isActive }) => isActive ? "text-primary" : "text-slate-400 group-hover:text-primary"
                                )} />
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="pt-4 border-t border-white/10">
                        <button
                            onClick={logout}
                            className="flex items-center w-full px-4 py-3.5 text-sm font-medium text-slate-600 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
                        >
                            <LogOut className="w-5 h-5 mr-3 text-slate-400 group-hover:text-red-500 transition-colors" />
                            Logout
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
