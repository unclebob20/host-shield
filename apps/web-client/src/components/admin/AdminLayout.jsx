import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AdminThemeProvider, useAdminTheme } from '../../context/AdminThemeContext';
import {
    LayoutDashboard, Users, Menu, X, LogOut,
    ShieldAlert, ArrowLeft, Sun, Moon
} from 'lucide-react';

const adminNavItems = [
    { icon: LayoutDashboard, label: 'Overview', to: '/admin' },
    { icon: Users, label: 'All Hosts', to: '/admin/hosts' },
];

// Theme token maps
const t = {
    dark: {
        root: 'bg-gray-950 text-white',
        sidebar: 'bg-gray-900 border-gray-800',
        sidebarBorder: 'border-gray-800',
        logoText: 'text-white',
        navActive: 'bg-violet-600/20 text-violet-300 ring-1 ring-violet-500/30',
        navInactive: 'text-gray-400 hover:text-white hover:bg-white/5',
        footerBorder: 'border-gray-800',
        footerBtn: 'text-gray-400 hover:text-white hover:bg-white/5',
        logoutBtn: 'text-gray-400 hover:text-red-400 hover:bg-red-500/10',
        themeBtn: 'bg-gray-800 text-yellow-400 hover:bg-gray-700',
        mobileHeader: 'bg-gray-900 border-gray-800',
        mobileBtn: 'text-gray-400 hover:bg-white/5',
        mobileTitle: 'text-white',
        overlay: 'bg-black/60',
    },
    light: {
        root: 'bg-slate-100 text-slate-900',
        sidebar: 'bg-white border-slate-200',
        sidebarBorder: 'border-slate-200',
        logoText: 'text-slate-900',
        navActive: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200',
        navInactive: 'text-slate-500 hover:text-slate-900 hover:bg-slate-100',
        footerBorder: 'border-slate-200',
        footerBtn: 'text-slate-500 hover:text-slate-900 hover:bg-slate-100',
        logoutBtn: 'text-slate-500 hover:text-red-600 hover:bg-red-50',
        themeBtn: 'bg-slate-100 text-slate-600 hover:bg-slate-200',
        mobileHeader: 'bg-white border-slate-200',
        mobileBtn: 'text-slate-500 hover:bg-slate-100',
        mobileTitle: 'text-slate-900',
        overlay: 'bg-black/40',
    }
};

const AdminLayoutInner = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { logout } = useAuth();
    const navigate = useNavigate();
    const { theme, toggleTheme } = useAdminTheme();
    const tk = t[theme];

    return (
        <div className={`flex min-h-screen transition-colors duration-300 ${tk.root}`}>
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className={`fixed inset-0 z-20 lg:hidden ${tk.overlay}`}
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-30 w-64 border-r flex flex-col transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${tk.sidebar}`}>
                {/* Logo */}
                <div className={`flex items-center justify-between h-20 px-6 border-b ${tk.sidebarBorder}`}>
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/30 flex-shrink-0">
                            <ShieldAlert className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <p className={`text-sm font-bold leading-tight ${tk.logoText}`}>HostShield</p>
                            <p className="text-[10px] font-semibold text-violet-500 uppercase tracking-widest">Admin</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className={`lg:hidden p-1.5 rounded-lg transition-colors ${tk.mobileBtn}`}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-4 space-y-1">
                    {adminNavItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === '/admin'}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive ? tk.navActive : tk.navInactive}`
                            }
                        >
                            <item.icon className="w-5 h-5 flex-shrink-0" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                {/* Footer */}
                <div className={`p-4 border-t space-y-1 ${tk.footerBorder}`}>
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all ${tk.themeBtn}`}
                        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                    >
                        {theme === 'dark'
                            ? <><Sun className="w-5 h-5" /> Light Mode</>
                            : <><Moon className="w-5 h-5" /> Dark Mode</>
                        }
                    </button>

                    <button
                        onClick={() => navigate('/dashboard')}
                        className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all ${tk.footerBtn}`}
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to App
                    </button>

                    <button
                        onClick={logout}
                        className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all ${tk.logoutBtn}`}
                    >
                        <LogOut className="w-5 h-5" />
                        Log Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col ml-0 lg:ml-64 min-w-0">
                {/* Mobile header */}
                <header className={`lg:hidden border-b h-16 flex items-center px-4 sticky top-0 z-20 ${tk.mobileHeader}`}>
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className={`p-2 rounded-lg transition-colors ${tk.mobileBtn}`}
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <div className="ml-3 flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5 text-violet-500" />
                        <span className={`text-sm font-bold ${tk.mobileTitle}`}>Admin Panel</span>
                    </div>
                    {/* Theme toggle in mobile header too */}
                    <button
                        onClick={toggleTheme}
                        className={`ml-auto p-2 rounded-lg transition-colors ${tk.mobileBtn}`}
                    >
                        {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-500" />}
                    </button>
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

// Wrap with provider so all admin pages have theme access
const AdminLayout = ({ children }) => (
    <AdminThemeProvider>
        <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminThemeProvider>
);

export default AdminLayout;
