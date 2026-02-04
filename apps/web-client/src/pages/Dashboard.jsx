import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Users, AlertTriangle, FileCheck, Clock, TrendingUp, ShieldCheck, Smartphone } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../lib/api';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalGuests: 0,
        pendingSubmissions: 0,
        recentActivity: [],
        monthlyData: [] // Mock data for chart
    });
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const [paymentStatus, setPaymentStatus] = useState(null);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const payment = params.get('payment');
        if (payment === 'success') {
            setPaymentStatus('success');
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
        } else if (payment === 'cancelled') {
            setPaymentStatus('cancelled');
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [location]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/guests');
                const guests = response.data.guests || [];

                const totalGuests = guests.length;
                const pendingSubmissions = guests.filter(g => g.submission_status === 'pending' || g.submission_status === 'error').length;

                // transform for mock chart
                const mockChartData = [
                    { name: 'Mon', guests: 2 },
                    { name: 'Tue', guests: 4 },
                    { name: 'Wed', guests: 3 },
                    { name: 'Thu', guests: 7 },
                    { name: 'Fri', guests: 5 },
                    { name: 'Sat', guests: 9 },
                    { name: 'Sun', guests: totalGuests || 6 },
                ];

                setStats({
                    totalGuests,
                    pendingSubmissions,
                    recentActivity: guests.slice(0, 5),
                    monthlyData: mockChartData
                });
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const cards = [
        { name: t('dashboard.total_guests'), value: stats.totalGuests, icon: Users, color: 'text-blue-500', gradient: 'from-blue-500/20 to-blue-600/5' },
        { name: t('dashboard.pending_report'), value: stats.pendingSubmissions, icon: AlertTriangle, color: 'text-amber-500', gradient: 'from-amber-500/20 to-amber-600/5' },
        { name: t('dashboard.compliance_rate'), value: `${stats.totalGuests ? Math.round(((stats.totalGuests - stats.pendingSubmissions) / stats.totalGuests) * 100) : 100}%`, icon: ShieldCheck, color: 'text-emerald-500', gradient: 'from-emerald-500/20 to-emerald-600/5' },
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-100px)]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Payment Alerts */}
            {paymentStatus === 'success' && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl relative" role="alert">
                    <strong className="font-bold">Payment Successful! </strong>
                    <span className="block sm:inline">Your subscription has been activated. Thank you for choosing HostShield.</span>
                    <button onClick={() => setPaymentStatus(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3">
                        <span className="sr-only">Close</span>
                        <svg className="fill-current h-6 w-6 text-green-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" /></svg>
                    </button>
                </div>
            )}
            {paymentStatus === 'cancelled' && (
                <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl relative" role="alert">
                    <strong className="font-bold">Payment Cancelled. </strong>
                    <span className="block sm:inline">The checkout process was not completed. No charges were made.</span>
                    <button onClick={() => setPaymentStatus(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3">
                        <span className="sr-only">Close</span>
                        <svg className="fill-current h-6 w-6 text-amber-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" /></svg>
                    </button>
                </div>
            )}
            {/* Welcome Banner */}
            <div className="glass-card rounded-2xl p-8 relative overflow-hidden flex items-center justify-between">
                <div className="relative z-10 max-w-xl">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
                        {t('dashboard.title')}
                    </h1>
                    <p className="text-lg text-slate-600">
                        {t('dashboard.welcome')}
                    </p>
                    <div className="mt-6 flex gap-3">
                        <button
                            onClick={() => navigate('/guests')}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
                        >
                            {t('dashboard.view_all')}
                        </button>
                        <button
                            onClick={() => navigate('/ledger')}
                            className="inline-flex items-center px-4 py-2 bg-white text-slate-700 border border-slate-200 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            {t('dashboard.export')}
                        </button>
                    </div>
                </div>

                {/* Hero Decoration */}
                <div className="absolute top-0 right-0 w-1/2 h-full hidden md:block pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white/50 to-white z-10"></div>
                    <img
                        src="/dashboard-hero.png"
                        alt="Hospitality"
                        className="w-full h-full object-cover object-center opacity-80"
                    />
                </div>
            </div>

            {/* Mobile App Download Banner */}
            <div className="glass-card rounded-2xl p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center flex-shrink-0">
                            <Smartphone className="w-7 h-7" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-1">
                                {t('dashboard.mobile_app_title') || 'Get the HostShield Mobile App'}
                            </h3>
                            <p className="text-white/90 text-sm">
                                {t('dashboard.mobile_app_desc') || 'Register guests on the go - scan passports and submit to police from your phone'}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
                        {/* App Store Button */}
                        <a
                            href="#"
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white/20 backdrop-blur hover:bg-white/30 text-white rounded-lg transition-all text-sm font-medium"
                            onClick={(e) => {
                                e.preventDefault();
                                alert(t('dashboard.mobile_app_coming_soon') || 'Coming soon to the App Store!');
                            }}
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                            </svg>
                            <span>App Store</span>
                        </a>

                        {/* Google Play Button */}
                        <a
                            href="#"
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white/20 backdrop-blur hover:bg-white/30 text-white rounded-lg transition-all text-sm font-medium"
                            onClick={(e) => {
                                e.preventDefault();
                                alert(t('dashboard.mobile_app_coming_soon') || 'Coming soon to Google Play!');
                            }}
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                            </svg>
                            <span>Google Play</span>
                        </a>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {cards.map((card) => (
                    <div key={card.name} className="glass-card rounded-2xl p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${card.gradient} rounded-bl-full -mr-8 -mt-8 opacity-50 transition-opacity group-hover:opacity-75`} />

                        <div className="relative">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">{card.name}</p>
                                    <p className="text-4xl font-bold text-slate-900 mt-2">{card.value}</p>
                                </div>
                                <div className={`p-3 rounded-xl bg-white/50 backdrop-blur-sm shadow-sm ${card.color}`}>
                                    <card.icon className="h-8 w-8" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart Section */}
                <div className="lg:col-span-2 glass-card rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center">
                            <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
                            {t('dashboard.guest_occupancy')}
                        </h2>
                        <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">{t('dashboard.this_week')}</span>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.monthlyData}>
                                <defs>
                                    <linearGradient id="colorGuests" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748B', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748B', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="guests"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorGuests)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activity Feed */}
                <div className="glass-card rounded-2xl p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
                        <Clock className="w-5 h-5 mr-2 text-blue-500" />
                        {t('dashboard.recent_arrivals')}
                    </h2>
                    <div className="flow-root">
                        <ul className="-my-5">
                            {stats.recentActivity.length > 0 ? (
                                stats.recentActivity.map((guest, idx) => (
                                    <li key={guest.id} className="py-4 border-b border-slate-100 last:border-0 hover:bg-slate-50/50 rounded-lg px-2 -mx-2 transition-colors">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex-shrink-0">
                                                <div className="relative">
                                                    <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-indigo-100">
                                                        <span className="font-medium text-indigo-700 leading-none">
                                                            {guest.first_name[0]}{guest.last_name[0]}
                                                        </span>
                                                    </span>
                                                    <span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white ${guest.submission_status === 'sent' ? 'bg-green-400' : 'bg-amber-400'}`} />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-900 truncate">
                                                    {guest.first_name} {guest.last_name}
                                                </p>
                                                <p className="text-xs text-slate-500 truncate flex items-center mt-0.5">
                                                    <span className="mr-1">{guest.nationality_iso3}</span>
                                                    • Arrived {new Date(guest.arrival_date).toLocaleDateString(i18n.language, { month: 'short', day: 'numeric' })}
                                                </p>
                                            </div>
                                            <div>
                                                <span className={clsx(
                                                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
                                                    guest.submission_status === 'sent' ? "bg-green-100 text-green-800" :
                                                        guest.submission_status === 'error' ? "bg-red-100 text-red-800" :
                                                            "bg-amber-100 text-amber-800"
                                                )}>
                                                    {t(`guest.status.${guest.submission_status || 'pending'}`)}
                                                </span>
                                            </div>
                                        </div>
                                    </li>
                                ))
                            ) : (
                                <li className="py-4 text-center text-slate-500 text-sm">
                                    {t('dashboard.no_activity')}
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
