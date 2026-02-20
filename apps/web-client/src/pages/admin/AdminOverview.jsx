import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, UserCheck, UserX, ShieldCheck, TrendingUp,
    FileText, AlertTriangle, CheckCircle2, Clock
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer
} from 'recharts';
import api from '../../lib/api';
import { useAdminTheme } from '../../context/AdminThemeContext';

const pageTokens = {
    dark: {
        card: 'bg-gray-900 border-white/5 hover:border-white/10',
        cardLabel: 'text-gray-500',
        cardSub: 'text-gray-500',
        cardIcon: 'bg-white/5',
        section: 'bg-gray-900 border-white/5',
        sectionTitle: 'text-white',
        sectionSub: 'text-gray-400',
        h1: 'text-white',
        h1sub: 'text-gray-400',
        noData: 'text-gray-600',
        chartGrid: '#ffffff10',
        chartTick: '#6b7280',
        chartTooltip: { backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#fff', fontSize: '13px' },
        chartCursor: 'rgba(139,92,246,0.08)',
    },
    light: {
        card: 'bg-white border-slate-200 hover:border-violet-200 shadow-sm',
        cardLabel: 'text-slate-400',
        cardSub: 'text-slate-400',
        cardIcon: 'bg-slate-100',
        section: 'bg-white border-slate-200 shadow-sm',
        sectionTitle: 'text-slate-900',
        sectionSub: 'text-slate-500',
        h1: 'text-slate-900',
        h1sub: 'text-slate-500',
        noData: 'text-slate-400',
        chartGrid: '#e2e8f0',
        chartTick: '#94a3b8',
        chartTooltip: { backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', color: '#0f172a', fontSize: '13px' },
        chartCursor: 'rgba(139,92,246,0.06)',
    }
};

const StatCard = ({ icon: Icon, label, value, color, sub, tk }) => (
    <div className={`rounded-2xl p-6 border transition-all group ${tk.card}`}>
        <div className="flex items-start justify-between">
            <div>
                <p className={`text-xs font-semibold uppercase tracking-widest mb-1 ${tk.cardLabel}`}>{label}</p>
                <p className={`text-4xl font-bold ${color}`}>{value ?? '—'}</p>
                {sub && <p className={`text-xs mt-1 ${tk.cardSub}`}>{sub}</p>}
            </div>
            <div className={`p-3 rounded-xl ${tk.cardIcon} ${color}`}>
                <Icon className="w-6 h-6" />
            </div>
        </div>
    </div>
);

const AdminOverview = () => {
    const navigate = useNavigate();
    const { theme } = useAdminTheme();
    const tk = pageTokens[theme];

    const [stats, setStats] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        api.get('/admin/stats')
            .then(res => {
                setStats(res.data.stats);
                setChartData(res.data.monthly_signups || []);
            })
            .catch(() => setError('Failed to load admin stats'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-10 h-10 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl p-6 text-sm">{error}</div>
        );
    }

    const statCards = [
        { icon: Users, label: 'Total Hosts', value: stats?.total_hosts, color: 'text-violet-500' },
        { icon: UserCheck, label: 'Active Subscriptions', value: stats?.active_subscribers, color: 'text-emerald-500', sub: `${stats?.total_hosts ? Math.round((stats.active_subscribers / stats.total_hosts) * 100) : 0}% of all hosts` },
        { icon: UserX, label: 'Inactive Hosts', value: stats?.inactive_hosts, color: 'text-amber-500' },
        { icon: ShieldCheck, label: 'Gov-Verified', value: stats?.verified_hosts, color: 'text-sky-500' },
        { icon: TrendingUp, label: 'New Hosts (30d)', value: stats?.new_hosts_30d, color: 'text-fuchsia-500' },
        { icon: FileText, label: 'Total Guests', value: stats?.total_guests, color: 'text-blue-500' },
        { icon: CheckCircle2, label: 'Submitted', value: stats?.submitted_guests, color: 'text-green-500' },
        { icon: AlertTriangle, label: 'Pending / Errors', value: (stats?.pending_guests || 0) + (stats?.error_guests || 0), color: 'text-orange-500' },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className={`text-3xl font-bold tracking-tight ${tk.h1}`}>Platform Overview</h1>
                <p className={`mt-1 text-sm ${tk.h1sub}`}>Real-time metrics for all HostShield accounts</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card) => (
                    <StatCard key={card.label} {...card} tk={tk} />
                ))}
            </div>

            {/* Chart */}
            <div className={`rounded-2xl p-6 border ${tk.section}`}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className={`text-base font-bold flex items-center gap-2 ${tk.sectionTitle}`}>
                        <TrendingUp className="w-5 h-5 text-violet-500" />
                        New Host Signups — Last 6 Months
                    </h2>
                </div>
                {chartData.length > 0 ? (
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} barSize={32}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={tk.chartGrid} />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: tk.chartTick, fontSize: 12 }} dy={8} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: tk.chartTick, fontSize: 12 }} allowDecimals={false} />
                                <Tooltip contentStyle={tk.chartTooltip} cursor={{ fill: tk.chartCursor }} />
                                <Bar dataKey="count" fill="#7c3aed" radius={[6, 6, 0, 0]} name="Signups" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className={`h-64 flex items-center justify-center text-sm ${tk.noData}`}>
                        <Clock className="w-5 h-5 mr-2" /> Not enough data yet
                    </div>
                )}
            </div>

            {/* Quick link */}
            <div className="flex justify-end">
                <button
                    onClick={() => navigate('/admin/hosts')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-violet-500/20"
                >
                    <Users className="w-4 h-4" />
                    View All Hosts
                </button>
            </div>
        </div>
    );
};

export default AdminOverview;
