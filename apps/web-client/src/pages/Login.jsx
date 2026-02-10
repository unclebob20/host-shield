import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, Lock, Mail, Languages, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'sk' : 'en';
        i18n.changeLanguage(newLang);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || t('auth.login.error_generic'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full overflow-hidden">
            {/* Full Screen Background Image */}
            <div className="absolute inset-0">
                <img
                    className="w-full h-full object-cover"
                    src="/login-hero.png"
                    alt="HostShield Security"
                />
                {/* Gradient Overlay for Readability on the Left */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/50 to-transparent sm:w-3/4 lg:w-1/2"></div>
            </div>

            {/* Back to Home Link */}
            <div className="absolute top-6 left-6 z-30">
                <Link to="/" className="text-white/80 hover:text-white flex items-center gap-2 transition-colors">
                    <span className="text-sm font-medium">← {t('auth.login.back_home')}</span>
                </Link>
            </div>

            {/* Language Switcher */}
            <div className="absolute top-6 right-6 z-30">
                <button
                    onClick={toggleLanguage}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors"
                >
                    <Languages className="h-4 w-4" />
                    <span className="text-sm font-medium">{i18n.language === 'en' ? 'SK' : 'EN'}</span>
                </button>
            </div>

            {/* Bottom Centered Branding */}
            <div className="absolute bottom-[15%] left-0 right-0 z-20 flex flex-col items-center text-center px-4 pointer-events-none">
                <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-4 drop-shadow-2xl">
                    {t('auth.login.hero_title')}
                </h1>
                <p className="text-xl md:text-2xl text-slate-200 max-w-3xl font-light drop-shadow-lg">
                    {t('auth.login.hero_subtitle')}
                </p>
            </div>

            {/* Left-Aligned Content */}
            <div className="relative z-10 flex min-h-screen flex-col justify-center px-4 py-12 sm:px-12 lg:px-20 xl:px-28">
                <div className="w-full max-w-md space-y-8">
                    {/* Sign In Header */}
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-white mb-2">
                            {t('auth.login.title')}
                        </h2>
                        <p className="text-sm text-slate-400">
                            {t('auth.login.subtitle')}
                        </p>
                    </div>

                    {/* Form - Transparent Container */}
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
                                <p className="text-sm font-medium text-red-200">{error}</p>
                            </div>
                        )}

                        <div className="space-y-5">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-slate-200 mb-1.5">
                                    {t('auth.login.email_label')}
                                </label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <Mail className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-10 text-white placeholder-slate-400 focus:border-blue-500 focus:bg-white/10 focus:ring-1 focus:ring-blue-500 sm:text-sm transition-colors"
                                        placeholder={t('auth.login.email_placeholder')}
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-slate-200 mb-1.5">
                                    {t('auth.login.password_label')}
                                </label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <Lock className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-10 pr-10 text-white placeholder-slate-400 focus:border-blue-500 focus:bg-white/10 focus:ring-1 focus:ring-blue-500 sm:text-sm transition-colors"
                                        placeholder={t('auth.login.password_placeholder')}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-white"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex w-full justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 transition-all"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="animate-spin h-5 w-5 mr-2" />
                                        {t('auth.login.loading')}
                                    </>
                                ) : (
                                    t('auth.login.submit')
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Footer */}
                    <div className="relative mt-10">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-transparent px-2 text-sm text-slate-400">
                                {t('auth.login.no_account')}
                            </span>
                        </div>
                    </div>
                    <div>
                        <Link
                            to="/register"
                            className="flex w-full justify-center rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all"
                        >
                            {t('auth.login.create_account')}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
