import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';

const MarketingNavbar = ({ topOffset = 0 }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { t, i18n } = useTranslation();
    const { user } = useAuth();

    const navItems = [
        { label: t('marketing.nav.home'), to: '/' },
        { label: t('marketing.nav.product'), to: '/product' },
        { label: t('marketing.nav.prices'), to: '/prices' },
        { label: t('marketing.nav.contact'), to: '/contact' },
    ];

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        setIsMenuOpen(false); // Close mobile menu on selection
    };

    return (
        <nav className="fixed left-0 right-0 z-50 glass" style={{ top: `${topOffset}px` }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <img
                            src="/logo-icon.png"
                            alt="HostShield"
                            className="h-10 w-auto object-contain mix-blend-multiply"
                        />
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-violet-600">
                            HostShield
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) => clsx(
                                    "text-sm font-medium transition-colors hover:text-primary",
                                    isActive ? "text-primary" : "text-slate-600"
                                )}
                            >
                                {item.label}
                            </NavLink>
                        ))}
                    </div>

                    <div className="hidden md:flex items-center space-x-4">
                        {/* Language Switcher Desktop */}
                        <div className="flex bg-slate-100 rounded-lg p-1 mr-2">
                            <button
                                onClick={() => changeLanguage('en')}
                                className={clsx(
                                    "px-2 py-1 text-xs font-medium rounded-md transition-all",
                                    i18n.language === 'en' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                )}
                            >
                                EN
                            </button>
                            <button
                                onClick={() => changeLanguage('sk')}
                                className={clsx(
                                    "px-2 py-1 text-xs font-medium rounded-md transition-all",
                                    i18n.language === 'sk' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                )}
                            >
                                SK
                            </button>
                        </div>

                        {/* Auth Buttons */}
                        {user ? (
                            <Link
                                to="/dashboard"
                                className="px-5 py-2.5 text-sm font-medium text-white bg-primary hover:bg-blue-700 rounded-full transition-all shadow-sm shadow-blue-200"
                            >
                                {t('marketing.nav.dashboard')}
                            </Link>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-primary transition-colors"
                                >
                                    {t('marketing.nav.sign_in')}
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-5 py-2.5 text-sm font-medium text-white bg-primary hover:bg-blue-700 rounded-full transition-all shadow-sm shadow-blue-200"
                                >
                                    {t('marketing.nav.get_started')}
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-4">
                        {/* Language Switcher Mobile (Header) */}
                        <div className="flex bg-slate-100 rounded-lg p-1">
                            <button
                                onClick={() => changeLanguage('en')}
                                className={clsx(
                                    "px-2 py-1 text-xs font-medium rounded-md transition-all",
                                    i18n.language === 'en' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                )}
                            >
                                EN
                            </button>
                            <button
                                onClick={() => changeLanguage('sk')}
                                className={clsx(
                                    "px-2 py-1 text-xs font-medium rounded-md transition-all",
                                    i18n.language === 'sk' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                )}
                            >
                                SK
                            </button>
                        </div>

                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 text-slate-600 hover:text-slate-900"
                        >
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden glass border-t border-slate-100">
                    <div className="px-4 pt-2 pb-6 space-y-1">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                onClick={() => setIsMenuOpen(false)}
                                className={({ isActive }) => clsx(
                                    "block px-3 py-3 rounded-lg text-base font-medium",
                                    isActive ? "bg-primary/5 text-primary" : "text-slate-600 hover:bg-slate-50"
                                )}
                            >
                                {item.label}
                            </NavLink>
                        ))}
                        <div className="pt-4 mt-4 border-t border-slate-100 flex flex-col gap-3">
                            {user ? (
                                <Link
                                    to="/dashboard"
                                    className="w-full text-center px-4 py-3 text-white font-medium bg-primary rounded-lg hover:bg-blue-700"
                                >
                                    {t('marketing.nav.dashboard')}
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        className="w-full text-center px-4 py-3 text-slate-700 font-medium bg-slate-50 rounded-lg hover:bg-slate-100"
                                    >
                                        {t('marketing.nav.sign_in')}
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="w-full text-center px-4 py-3 text-white font-medium bg-primary rounded-lg hover:bg-blue-700"
                                    >
                                        {t('marketing.nav.get_started')}
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default MarketingNavbar;
