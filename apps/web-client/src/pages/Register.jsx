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
        <div className="min-h-screen bg-slate-50 flex">
            {/* Left Side - Form */}
            <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-gradient-to-br from-slate-50 to-blue-50 relative overflow-hidden w-full lg:w-1/2 xl:w-[500px]">
                {/* Decoration */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                    <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-400/10 blur-3xl"></div>
                    <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-indigo-400/10 blur-3xl"></div>
                </div>

                <div className="mx-auto w-full max-w-sm lg:w-96 relative z-10">
                    <div className="flex justify-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 transform -rotate-3">
                            <Shield className="h-8 w-8 text-white" />
                        </div>
                    </div>

                    <div>
                        <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-900 text-center">
                            Create your account
                        </h2>
                        <p className="mt-2 text-sm text-slate-600 text-center">
                            Join HostShield and start managing guests
                        </p>
                    </div>

                    <div className="mt-8">
                        <div className="glass-card py-8 px-4 sm:rounded-2xl sm:px-10 shadow-xl border border-white/50">
                            <form className="space-y-6" onSubmit={handleSubmit}>
                                {error && (
                                    <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start">
                                        <div className="ml-3">
                                            <p className="text-sm text-red-600 font-medium">{error}</p>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                    <div className="relative rounded-xl shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-4 w-4 text-slate-400" />
                                        </div>
                                        <input
                                            name="full_name"
                                            type="text"
                                            required
                                            value={formData.full_name}
                                            onChange={handleChange}
                                            className="block w-full rounded-xl border-slate-200/60 bg-white/50 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 shadow-sm transition-all placeholder-slate-400"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Email address</label>
                                    <div className="relative rounded-xl shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="h-4 w-4 text-slate-400" />
                                        </div>
                                        <input
                                            name="email"
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="block w-full rounded-xl border-slate-200/60 bg-white/50 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 shadow-sm transition-all placeholder-slate-400"
                                            placeholder="name@example.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                                    <div className="relative rounded-xl shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-4 w-4 text-slate-400" />
                                        </div>
                                        <input
                                            name="password"
                                            type="password"
                                            required
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="block w-full rounded-xl border-slate-200/60 bg-white/50 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 shadow-sm transition-all placeholder-slate-400"
                                            placeholder="Create a password"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Police Provider ID (Optional)
                                    </label>
                                    <div className="relative rounded-xl shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <BadgeCheck className="h-4 w-4 text-slate-400" />
                                        </div>
                                        <input
                                            name="police_provider_id"
                                            type="text"
                                            value={formData.police_provider_id}
                                            onChange={handleChange}
                                            className="block w-full rounded-xl border-slate-200/60 bg-white/50 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 shadow-sm transition-all placeholder-slate-400"
                                            placeholder="Assigned by Foreign Police"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-500/30 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
                                    >
                                        {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Register'}
                                    </button>
                                </div>
                            </form>

                            <div className="mt-8">
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-slate-200/60" />
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 bg-white/50 backdrop-blur text-slate-500 rounded-full">
                                            Already have an account?
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <Link
                                        to="/login"
                                        className="w-full flex justify-center py-2.5 px-4 border border-slate-200/60 rounded-xl shadow-sm text-sm font-medium text-slate-700 bg-white/50 hover:bg-white hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all backdrop-blur-sm"
                                    >
                                        Sign in
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Image */}
            <div className="hidden lg:block relative w-0 flex-1">
                <img
                    className="absolute inset-0 h-full w-full object-cover"
                    src="/login-hero.png"
                    alt="HostShield Security"
                />
            </div>
        </div>
    );
};

export default Register;
