import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, ShieldCheck, ShieldOff, Users, Building2 } from 'lucide-react';
import api from '../../lib/api';
import clsx from 'clsx';
import { useAdminTheme } from '../../context/AdminThemeContext';

const tokens = {
    dark: {
        h1: 'text-white',
        sub: 'text-gray-400',
        filterBox: 'bg-gray-900 border-gray-800',
        input: 'bg-gray-800 text-white border-white/5 focus:border-violet-500/50 focus:ring-violet-500/30 placeholder-gray-600',
        tabs: 'bg-gray-800',
        tabActive: 'bg-violet-600 text-white',
        tabInactive: 'text-gray-400 hover:text-white',
        table: 'bg-gray-900 border-gray-800',
        th: 'text-gray-500 border-gray-800',
        tr: 'hover:bg-white/[0.02] divide-gray-800',
        divider: 'divide-white/5',
        name: 'text-white',
        email: 'text-gray-500',
        count: 'text-gray-300',
        countIcon: 'text-gray-600',
        date: 'text-gray-500',
        chevron: 'text-gray-600 group-hover:text-violet-400',
        noData: 'text-gray-600',
        spinner: 'border-violet-500',
    },
    light: {
        h1: 'text-slate-900',
        sub: 'text-slate-500',
        filterBox: 'bg-white border-slate-200 shadow-sm',
        input: 'bg-slate-50 text-slate-900 border-slate-200 focus:border-violet-400 focus:ring-violet-300 placeholder-slate-400',
        tabs: 'bg-slate-100',
        tabActive: 'bg-violet-600 text-white',
        tabInactive: 'text-slate-500 hover:text-slate-900',
        table: 'bg-white border-slate-200 shadow-sm',
        th: 'text-slate-400 border-slate-100',
        tr: 'hover:bg-slate-50 divide-slate-100',
        divider: 'divide-slate-100',
        name: 'text-slate-900',
        email: 'text-slate-400',
        count: 'text-slate-700',
        countIcon: 'text-slate-400',
        date: 'text-slate-400',
        chevron: 'text-slate-300 group-hover:text-violet-500',
        noData: 'text-slate-400',
        spinner: 'border-violet-500',
    }
};

const subscriptionBadge = (status) => {
    const map = {
        active: 'bg-emerald-500/15 text-emerald-600 ring-1 ring-emerald-500/20',
        inactive: 'bg-gray-500/15 text-gray-500 ring-1 ring-gray-400/20',
        canceled: 'bg-red-500/15 text-red-500 ring-1 ring-red-500/20',
        trialing: 'bg-sky-500/15 text-sky-600 ring-1 ring-sky-500/20',
        past_due: 'bg-amber-500/15 text-amber-600 ring-1 ring-amber-500/20',
    };
    return map[status] || map.inactive;
};

const AdminHosts = () => {
    const navigate = useNavigate();
    const { theme } = useAdminTheme();
    const tk = tokens[theme];

    const [hosts, setHosts] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        api.get('/admin/hosts')
            .then(res => { setHosts(res.data.hosts); setFiltered(res.data.hosts); })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        let result = [...hosts];
        if (search) {
            const q = search.toLowerCase();
            result = result.filter(h => h.email.toLowerCase().includes(q) || h.full_name.toLowerCase().includes(q));
        }
        if (filter === 'active') result = result.filter(h => h.subscription_status === 'active');
        if (filter === 'inactive') result = result.filter(h => h.subscription_status !== 'active');
        if (filter === 'verified') result = result.filter(h => h.gov_credentials_verified);
        setFiltered(result);
    }, [search, filter, hosts]);

    const filterTabs = [
        { key: 'all', label: 'All' },
        { key: 'active', label: 'Active' },
        { key: 'inactive', label: 'Inactive' },
        { key: 'verified', label: 'Gov Verified' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className={`text-3xl font-bold tracking-tight ${tk.h1}`}>All Hosts</h1>
                <p className={`mt-1 text-sm ${tk.sub}`}>{filtered.length} of {hosts.length} hosts</p>
            </div>

            {/* Filters */}
            <div className={`rounded-2xl p-4 border flex flex-col sm:flex-row gap-4 ${tk.filterBox}`}>
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className={`w-full text-sm pl-9 pr-4 py-2.5 rounded-xl border focus:outline-none focus:ring-1 transition ${tk.input}`}
                    />
                </div>
                <div className={`flex gap-1 rounded-xl p-1 flex-shrink-0 ${tk.tabs}`}>
                    {filterTabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setFilter(tab.key)}
                            className={clsx(
                                'px-3 py-1.5 text-xs font-semibold rounded-lg transition-all',
                                filter === tab.key ? tk.tabActive : tk.tabInactive
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className={`rounded-2xl border overflow-hidden ${tk.table}`}>
                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <div className={`w-8 h-8 rounded-full border-2 border-t-transparent animate-spin ${tk.spinner}`} />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className={`text-center py-16 text-sm ${tk.noData}`}>No hosts found</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className={`border-b ${tk.th}`}>
                                    <th className={`text-left text-xs font-semibold uppercase tracking-wider px-6 py-4 ${tk.th}`}>Host</th>
                                    <th className={`text-left text-xs font-semibold uppercase tracking-wider px-6 py-4 ${tk.th}`}>Subscription</th>
                                    <th className={`text-left text-xs font-semibold uppercase tracking-wider px-4 py-4 ${tk.th}`}>Gov</th>
                                    <th className={`text-left text-xs font-semibold uppercase tracking-wider px-4 py-4 ${tk.th}`}>Guests</th>
                                    <th className={`text-left text-xs font-semibold uppercase tracking-wider px-4 py-4 ${tk.th}`}>Properties</th>
                                    <th className={`text-left text-xs font-semibold uppercase tracking-wider px-6 py-4 ${tk.th}`}>Joined</th>
                                    <th className="px-6 py-4" />
                                </tr>
                            </thead>
                            <tbody className={tk.divider}>
                                {filtered.map(host => (
                                    <tr
                                        key={host.id}
                                        onClick={() => navigate(`/admin/hosts/${host.id}`)}
                                        className={`cursor-pointer transition-colors group border-b last:border-0 ${tk.tr}`}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow">
                                                    {host.full_name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className={`text-sm font-semibold ${tk.name}`}>{host.full_name}</p>
                                                    <p className={`text-xs ${tk.email}`}>{host.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={clsx('inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold capitalize', subscriptionBadge(host.subscription_status || 'inactive'))}>
                                                {host.subscription_status || 'inactive'}
                                            </span>
                                            {host.subscription_valid_until && (
                                                <p className={`text-[10px] mt-1 ${tk.email}`}>
                                                    Until {new Date(host.subscription_valid_until).toLocaleDateString()}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-4 py-4">
                                            {host.gov_credentials_verified
                                                ? <ShieldCheck className="w-5 h-5 text-emerald-500" />
                                                : <ShieldOff className={`w-5 h-5 ${tk.countIcon}`} />
                                            }
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className={`flex items-center gap-1.5 text-sm ${tk.count}`}>
                                                <Users className={`w-4 h-4 ${tk.countIcon}`} />
                                                {host.guest_count}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className={`flex items-center gap-1.5 text-sm ${tk.count}`}>
                                                <Building2 className={`w-4 h-4 ${tk.countIcon}`} />
                                                {host.property_count}
                                            </div>
                                        </td>
                                        <td className={`px-6 py-4 text-xs ${tk.date}`}>
                                            {new Date(host.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <ChevronRight className={`w-4 h-4 transition-colors ${tk.chevron}`} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminHosts;
