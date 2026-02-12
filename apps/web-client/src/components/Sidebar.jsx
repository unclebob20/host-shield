import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, FileText, Settings, LogOut, X, PlusCircle, Calendar, Building, ExternalLink, HelpCircle, Smartphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import clsx from 'clsx';

import { useTranslation } from 'react-i18next';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const { logout } = useAuth();
    const { t, i18n } = useTranslation();

    const navItems = [
        { icon: Home, label: t('nav.overview'), to: '/dashboard' },
        { icon: PlusCircle, label: t('nav.new_guest'), to: '/guests/new' },
        { icon: Calendar, label: t('nav.calendar'), to: '/calendar' },
        { icon: Users, label: t('nav.guests'), to: '/guests' },
        { icon: Building, label: t('nav.properties'), to: '/properties' },
        { icon: FileText, label: t('nav.ledger'), to: '/ledger' },
        { icon: Smartphone, label: t('nav.download'), to: '/download' },
        { icon: Settings, label: t('nav.settings'), to: '/profile' },
        { icon: HelpCircle, label: t('nav.help'), to: '/help' },
    ];

    const toggleLanguage = () => {
        const newLang = i18n.language === 'sk' ? 'en' : 'sk';
        i18n.changeLanguage(newLang);
    };

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
                "fixed inset-y-0 left-0 z-30 w-64 glass transform transition-transform duration-300 ease-spring lg:translate-x-0",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex items-center justify-between h-20 px-6 border-b border-white/10">
                    <div className="flex items-center gap-2">
                        {/* Logo Icon */}
                        <img
                            src="/logo-icon.png"
                            alt="HostShield"
                            className="h-10 w-auto object-contain mix-blend-multiply"
                        />
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-violet-600">
                            {t('app.title')}
                        </span>
                    </div>
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

                    <div className="pt-4 border-t border-white/10 space-y-2">
                        {/* Public Site Link */}
                        <NavLink
                            to="/"
                            className="flex items-center px-4 py-3.5 text-sm font-medium text-slate-600 rounded-xl hover:bg-white/50 hover:text-slate-900 hover:shadow-sm hover:translate-x-1 transition-all duration-200 group"
                        >
                            <ExternalLink className="w-5 h-5 mr-3 text-slate-400 group-hover:text-primary transition-colors" />
                            {t('nav.home_page') || 'Home Page'}
                        </NavLink>
                        {/* Language Switcher */}
                        <div className="flex items-center justify-between px-4 py-2">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Language</span>
                            <div className="flex bg-slate-100 rounded-lg p-1">
                                <button
                                    onClick={() => i18n.changeLanguage('en')}
                                    className={clsx(
                                        "px-2 py-1 text-xs font-medium rounded-md transition-all",
                                        i18n.language === 'en' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                    )}
                                >
                                    EN
                                </button>
                                <button
                                    onClick={() => i18n.changeLanguage('sk')}
                                    className={clsx(
                                        "px-2 py-1 text-xs font-medium rounded-md transition-all",
                                        i18n.language === 'sk' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                    )}
                                >
                                    SK
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={logout}
                            className="flex items-center w-full px-4 py-3.5 text-sm font-medium text-slate-600 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
                        >
                            <LogOut className="w-5 h-5 mr-3 text-slate-400 group-hover:text-red-500 transition-colors" />
                            {t('nav.logout')}
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
