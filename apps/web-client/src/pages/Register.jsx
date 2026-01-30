import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Loader2, User, Mail, Lock, BadgeCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Register = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        full_name: '',
        police_provider_id: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await register(formData);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || t('auth.register.error_generic'));
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

            {/* Left-Aligned Content */}
            <div className="relative z-10 flex min-h-screen flex-col justify-center px-4 py-12 sm:px-12 lg:px-20 xl:px-28">
                <div className="w-full max-w-md space-y-8">
                    {/* Header */}
                    <div>
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600/20 backdrop-blur-sm border border-blue-500/30 mb-6 text-white">
                            <Shield className="h-8 w-8" />
                        </div>
                        <h2 className="text-4xl font-bold tracking-tight text-white mb-2">
                            {t('auth.register.title')}
                        </h2>
                        <p className="text-lg text-slate-300">
                            {t('auth.register.subtitle')}
                        </p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
                                <p className="text-sm font-medium text-red-200">{error}</p>
                            </div>
                        )}

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-200 mb-1.5">{t('auth.register.full_name')}</label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <User className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        name="full_name"
                                        type="text"
                                        required
                                        value={formData.full_name}
                                        onChange={handleChange}
                                        className="block w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-10 text-white placeholder-slate-400 focus:border-blue-500 focus:bg-white/10 focus:ring-1 focus:ring-blue-500 sm:text-sm transition-colors"
                                        placeholder={t('auth.register.full_name_placeholder')}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-200 mb-1.5">{t('auth.register.email_label')}</label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <Mail className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        name="email"
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="block w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-10 text-white placeholder-slate-400 focus:border-blue-500 focus:bg-white/10 focus:ring-1 focus:ring-blue-500 sm:text-sm transition-colors"
                                        placeholder={t('auth.register.email_placeholder')}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-200 mb-1.5">{t('auth.register.password_label')}</label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <Lock className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        name="password"
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="block w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-10 text-white placeholder-slate-400 focus:border-blue-500 focus:bg-white/10 focus:ring-1 focus:ring-blue-500 sm:text-sm transition-colors"
                                        placeholder={t('auth.register.password_placeholder')}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-200 mb-1.5">
                                    {t('auth.register.police_id')}
                                </label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <BadgeCheck className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        name="police_provider_id"
                                        type="text"
                                        value={formData.police_provider_id}
                                        onChange={handleChange}
                                        className="block w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-10 text-white placeholder-slate-400 focus:border-blue-500 focus:bg-white/10 focus:ring-1 focus:ring-blue-500 sm:text-sm transition-colors"
                                        placeholder={t('auth.register.police_id_placeholder')}
                                    />
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
                                        {t('auth.register.loading')}
                                    </>
                                ) : (
                                    t('auth.register.submit')
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="relative mt-10">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-transparent px-2 text-sm text-slate-400">
                                {t('auth.register.has_account')}
                            </span>
                        </div>
                    </div>
                    <div>
                        <Link
                            to="/login"
                            className="flex w-full justify-center rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all"
                        >
                            {t('auth.register.sign_in')}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
