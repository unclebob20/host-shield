import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, AlertTriangle, FileCheck, Clock, TrendingUp, ShieldCheck } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../lib/api';
import clsx from 'clsx';

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalGuests: 0,
        pendingSubmissions: 0,
        recentActivity: [],
        monthlyData: [] // Mock data for chart
    });
    const [loading, setLoading] = useState(true);

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
        { name: 'Total Guests', value: stats.totalGuests, icon: Users, color: 'text-blue-500', gradient: 'from-blue-500/20 to-blue-600/5' },
        { name: 'Pending Report', value: stats.pendingSubmissions, icon: AlertTriangle, color: 'text-amber-500', gradient: 'from-amber-500/20 to-amber-600/5' },
        { name: 'Compliance Rate', value: `${stats.totalGuests ? Math.round(((stats.totalGuests - stats.pendingSubmissions) / stats.totalGuests) * 100) : 100}%`, icon: ShieldCheck, color: 'text-emerald-500', gradient: 'from-emerald-500/20 to-emerald-600/5' },
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
            {/* Welcome Banner */}
            <div className="glass-card rounded-2xl p-8 relative overflow-hidden flex items-center justify-between">
                <div className="relative z-10 max-w-xl">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
                        Dashboard
                    </h1>
                    <p className="text-lg text-slate-600">
                        Welcome back! Here's an overview of your guests and recent activity.
                    </p>
                    <div className="mt-6 flex gap-3">
                        <button
                            onClick={() => navigate('/guests')}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
                        >
                            View All Guests
                        </button>
                        <button
                            onClick={() => navigate('/ledger')}
                            className="inline-flex items-center px-4 py-2 bg-white text-slate-700 border border-slate-200 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            Export Report
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
                            Guest Occupancy
                        </h2>
                        <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">This Week</span>
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
                        Recent Arrivals
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
                                                    • Arrived {new Date(guest.arrival_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </p>
                                            </div>
                                            <div>
                                                <span className={clsx(
                                                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
                                                    guest.submission_status === 'sent' ? "bg-green-100 text-green-800" :
                                                        guest.submission_status === 'error' ? "bg-red-100 text-red-800" :
                                                            "bg-amber-100 text-amber-800"
                                                )}>
                                                    {guest.submission_status || 'pending'}
                                                </span>
                                            </div>
                                        </div>
                                    </li>
                                ))
                            ) : (
                                <li className="py-4 text-center text-slate-500 text-sm">
                                    No scanning activity yet.
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
