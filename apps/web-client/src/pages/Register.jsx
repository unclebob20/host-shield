import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Loader2, User, Mail, Lock, BadgeCheck } from 'lucide-react';

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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await register(formData);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to register');
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

            {/* Left-Aligned Content */}
            <div className="relative z-10 flex min-h-screen flex-col justify-center px-4 py-12 sm:px-12 lg:px-20 xl:px-28">
                <div className="w-full max-w-md space-y-8">
                    {/* Header */}
                    <div>
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600/20 backdrop-blur-sm border border-blue-500/30 mb-6 text-white">
                            <Shield className="h-8 w-8" />
                        </div>
                        <h2 className="text-4xl font-bold tracking-tight text-white mb-2">
                            Create your account
                        </h2>
                        <p className="text-lg text-slate-300">
                            Join HostShield and start managing guests
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
                                <label className="block text-sm font-medium text-slate-200 mb-1.5">Full Name</label>
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
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-200 mb-1.5">Email address</label>
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
                                        placeholder="name@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-200 mb-1.5">Password</label>
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
                                        placeholder="Create a password"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-200 mb-1.5">
                                    Police Provider ID (Optional)
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
                                        placeholder="Assigned by Foreign Police"
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
                                {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Register'}
                            </button>
                        </div>
                    </form>

                    <div className="relative mt-10">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-transparent px-2 text-sm text-slate-400">
                                Already have an account?
                            </span>
                        </div>
                    </div>
                    <div>
                        <Link
                            to="/login"
                            className="flex w-full justify-center rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all"
                        >
                            Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
