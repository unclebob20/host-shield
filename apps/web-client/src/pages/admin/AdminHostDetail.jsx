import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, ShieldCheck, ShieldOff, Users, Building2,
    CreditCard, Hash, Edit3, Check, X, Mail
} from 'lucide-react';
import api from '../../lib/api';
import clsx from 'clsx';
import { useAdminTheme } from '../../context/AdminThemeContext';

const tokens = {
    dark: {
        backBtn: 'text-gray-400 hover:text-white',
        header: 'bg-gray-900 border-gray-800',
        name: 'text-white',
        email: 'text-gray-400',
        countVal: 'text-white',
        countLabel: 'text-gray-500',
        card: 'bg-gray-900 border-gray-800',
        cardTitle: 'text-white',
        fieldLabel: 'text-gray-500',
        fieldVal: 'text-white',
        fieldMono: 'text-gray-300',
        emptyField: 'text-gray-600',
        editLink: 'text-gray-400 hover:text-violet-400',
        select: 'bg-gray-800 text-white border-white/5 focus:border-violet-500/50',
        input: 'bg-gray-800 text-white border-white/5 focus:border-violet-500/50',
        propCard: 'bg-gray-800 border-gray-700',
        propName: 'text-white',
        propAddr: 'text-gray-500',
        propType: 'text-gray-400 bg-white/5',
        tableWrap: 'bg-gray-900 border-gray-800',
        tableHeader: 'border-gray-800 text-gray-500',
        tableRow: 'hover:bg-white/[0.02] divide-gray-800 border-gray-800',
        tableName: 'text-white',
        tableVal: 'text-gray-400',
        noData: 'text-gray-600',
    },
    light: {
        backBtn: 'text-slate-500 hover:text-slate-900',
        header: 'bg-white border-slate-200 shadow-sm',
        name: 'text-slate-900',
        email: 'text-slate-500',
        countVal: 'text-slate-900',
        countLabel: 'text-slate-400',
        card: 'bg-white border-slate-200 shadow-sm',
        cardTitle: 'text-slate-900',
        fieldLabel: 'text-slate-400',
        fieldVal: 'text-slate-900',
        fieldMono: 'text-slate-600',
        emptyField: 'text-slate-300',
        editLink: 'text-slate-400 hover:text-violet-600',
        select: 'bg-slate-50 text-slate-900 border-slate-200 focus:border-violet-400',
        input: 'bg-slate-50 text-slate-900 border-slate-200 focus:border-violet-400',
        propCard: 'bg-slate-50 border-slate-200',
        propName: 'text-slate-900',
        propAddr: 'text-slate-500',
        propType: 'text-slate-500 bg-slate-200',
        tableWrap: 'bg-white border-slate-200 shadow-sm',
        tableHeader: 'border-slate-200 text-slate-400',
        tableRow: 'hover:bg-slate-50 divide-slate-100 border-slate-100',
        tableName: 'text-slate-900',
        tableVal: 'text-slate-500',
        noData: 'text-slate-400',
    }
};

const statusBadge = (status) => {
    const map = {
        active: 'bg-emerald-500/15 text-emerald-600 ring-1 ring-emerald-500/20',
        inactive: 'bg-gray-400/15 text-gray-500 ring-1 ring-gray-400/20',
        canceled: 'bg-red-500/15 text-red-500 ring-1 ring-red-500/20',
        trialing: 'bg-sky-500/15 text-sky-600 ring-1 ring-sky-500/20',
        past_due: 'bg-amber-500/15 text-amber-600 ring-1 ring-amber-500/20',
        pending: 'bg-amber-500/15 text-amber-600 ring-1 ring-amber-500/20',
        sent: 'bg-emerald-500/15 text-emerald-600 ring-1 ring-emerald-500/20',
        error: 'bg-red-500/15 text-red-500 ring-1 ring-red-500/20',
    };
    return map[status] || map.inactive;
};

const AdminHostDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { theme } = useAdminTheme();
    const tk = tokens[theme];

    const [host, setHost] = useState(null);
    const [guests, setGuests] = useState([]);
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [editSub, setEditSub] = useState(false);
    const [subForm, setSubForm] = useState({ subscription_status: '', subscription_plan: '', subscription_valid_until: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        api.get(`/admin/hosts/${id}`)
            .then(res => {
                setHost(res.data.host);
                setGuests(res.data.guests);
                setProperties(res.data.properties);
                setSubForm({
                    subscription_status: res.data.host.subscription_status || '',
                    subscription_plan: res.data.host.subscription_plan || '',
                    subscription_valid_until: res.data.host.subscription_valid_until
                        ? new Date(res.data.host.subscription_valid_until).toISOString().slice(0, 10)
                        : ''
                });
            })
            .catch(() => setError('Host not found or access denied'))
            .finally(() => setLoading(false));
    }, [id]);

    const handleSaveSub = async () => {
        setSaving(true);
        try {
            const res = await api.patch(`/admin/hosts/${id}/subscription`, {
                subscription_status: subForm.subscription_status || null,
                subscription_plan: subForm.subscription_plan || null,
                subscription_valid_until: subForm.subscription_valid_until || null,
            });
            setHost(prev => ({ ...prev, ...res.data.host }));
            setEditSub(false);
        } catch (err) {
            console.error('Failed to update subscription', err);
        } finally {
            setSaving(false);
        }
    };

    const Field = ({ label, value, mono = false }) => (
        <div>
            <p className={`text-[11px] font-semibold uppercase tracking-wider mb-0.5 ${tk.fieldLabel}`}>{label}</p>
            <p className={clsx('text-sm break-all', mono ? `font-mono text-xs ${tk.fieldMono}` : tk.fieldVal)}>
                {value || <span className={`italic ${tk.emptyField}`}>—</span>}
            </p>
        </div>
    );

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
        </div>
    );

    if (error || !host) return (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl p-6 text-sm">{error}</div>
    );

    return (
        <div className="space-y-6">
            <button onClick={() => navigate('/admin/hosts')} className={`flex items-center gap-2 text-sm transition-colors ${tk.backBtn}`}>
                <ArrowLeft className="w-4 h-4" /> Back to Hosts
            </button>

            {/* Host Header */}
            <div className={`rounded-2xl border p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 ${tk.header}`}>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0 shadow-lg shadow-violet-500/20">
                    {host.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h1 className={`text-2xl font-bold ${tk.name}`}>{host.full_name}</h1>
                        <span className={clsx('px-2.5 py-1 rounded-lg text-xs font-semibold capitalize', statusBadge(host.subscription_status || 'inactive'))}>
                            {host.subscription_status || 'inactive'}
                        </span>
                        {host.gov_credentials_verified && (
                            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-500/15 text-sky-600 ring-1 ring-sky-500/20">
                                <ShieldCheck className="w-3.5 h-3.5" /> Gov Verified
                            </span>
                        )}
                    </div>
                    <p className={`text-sm mt-1 flex items-center gap-1.5 ${tk.email}`}>
                        <Mail className="w-3.5 h-3.5" /> {host.email}
                    </p>
                </div>
                <div className="flex gap-6 text-center">
                    <div>
                        <p className={`text-2xl font-bold ${tk.countVal}`}>{host.guest_count}</p>
                        <p className={`text-xs flex items-center gap-1 justify-center mt-0.5 ${tk.countLabel}`}><Users className="w-3 h-3" />Guests</p>
                    </div>
                    <div>
                        <p className={`text-2xl font-bold ${tk.countVal}`}>{host.property_count}</p>
                        <p className={`text-xs flex items-center gap-1 justify-center mt-0.5 ${tk.countLabel}`}><Building2 className="w-3 h-3" />Properties</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Account Info */}
                <div className={`rounded-2xl border p-6 space-y-4 ${tk.card}`}>
                    <h2 className={`text-sm font-bold flex items-center gap-2 ${tk.cardTitle}`}>
                        <Hash className="w-4 h-4 text-violet-500" /> Account Information
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Host ID" value={host.id} mono />
                        <Field label="Joined" value={new Date(host.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} />
                        <Field label="Police Provider ID" value={host.police_provider_id} mono />
                        <Field label="Gov ICO" value={host.gov_ico} mono />
                        <Field label="Gov API Subject" value={host.gov_api_subject} mono />
                        <Field label="Gov Verified At" value={host.gov_credentials_verified_at ? new Date(host.gov_credentials_verified_at).toLocaleDateString() : null} />
                        <Field label="Stripe Customer" value={host.stripe_customer_id} mono />
                    </div>
                </div>

                {/* Subscription */}
                <div className={`rounded-2xl border p-6 space-y-4 ${tk.card}`}>
                    <div className="flex items-center justify-between">
                        <h2 className={`text-sm font-bold flex items-center gap-2 ${tk.cardTitle}`}>
                            <CreditCard className="w-4 h-4 text-violet-500" /> Subscription
                        </h2>
                        {!editSub ? (
                            <button onClick={() => setEditSub(true)} className={`flex items-center gap-1.5 text-xs transition-colors ${tk.editLink}`}>
                                <Edit3 className="w-3.5 h-3.5" /> Edit
                            </button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <button onClick={handleSaveSub} disabled={saving} className="flex items-center gap-1 text-xs text-emerald-500 hover:text-emerald-400 transition-colors disabled:opacity-50">
                                    <Check className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save'}
                                </button>
                                <button onClick={() => setEditSub(false)} className={`flex items-center gap-1 text-xs transition-colors ${tk.editLink}`}>
                                    <X className="w-3.5 h-3.5" /> Cancel
                                </button>
                            </div>
                        )}
                    </div>
                    {!editSub ? (
                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Status" value={host.subscription_status} />
                            <Field label="Plan" value={host.subscription_plan} />
                            <Field label="Valid Until" value={host.subscription_valid_until ? new Date(host.subscription_valid_until).toLocaleDateString() : null} />
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div>
                                <label className={`text-[11px] font-semibold uppercase tracking-wider block mb-1 ${tk.fieldLabel}`}>Status</label>
                                <select value={subForm.subscription_status} onChange={e => setSubForm(f => ({ ...f, subscription_status: e.target.value }))}
                                    className={`w-full text-sm px-3 py-2 rounded-lg border focus:outline-none transition ${tk.select}`}>
                                    <option value="">— none —</option>
                                    <option value="active">active</option>
                                    <option value="inactive">inactive</option>
                                    <option value="trialing">trialing</option>
                                    <option value="canceled">canceled</option>
                                    <option value="past_due">past_due</option>
                                </select>
                            </div>
                            <div>
                                <label className={`text-[11px] font-semibold uppercase tracking-wider block mb-1 ${tk.fieldLabel}`}>Plan</label>
                                <input type="text" value={subForm.subscription_plan} onChange={e => setSubForm(f => ({ ...f, subscription_plan: e.target.value }))}
                                    placeholder="e.g. monthly"
                                    className={`w-full text-sm px-3 py-2 rounded-lg border focus:outline-none transition ${tk.input}`} />
                            </div>
                            <div>
                                <label className={`text-[11px] font-semibold uppercase tracking-wider block mb-1 ${tk.fieldLabel}`}>Valid Until</label>
                                <input type="date" value={subForm.subscription_valid_until} onChange={e => setSubForm(f => ({ ...f, subscription_valid_until: e.target.value }))}
                                    className={`w-full text-sm px-3 py-2 rounded-lg border focus:outline-none transition ${tk.input}`} />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Properties */}
            {properties.length > 0 && (
                <div className={`rounded-2xl border p-6 ${tk.card}`}>
                    <h2 className={`text-sm font-bold mb-4 flex items-center gap-2 ${tk.cardTitle}`}>
                        <Building2 className="w-4 h-4 text-violet-500" /> Properties ({properties.length})
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {properties.map(p => (
                            <div key={p.id} className={`rounded-xl p-4 border ${tk.propCard}`}>
                                <p className={`text-sm font-semibold ${tk.propName}`}>{p.name}</p>
                                <p className={`text-xs mt-0.5 ${tk.propAddr}`}>{p.address || 'No address'}</p>
                                {p.type && (
                                    <span className={`mt-2 inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md capitalize ${tk.propType}`}>
                                        {p.type}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Guests */}
            <div className={`rounded-2xl border overflow-hidden ${tk.tableWrap}`}>
                <div className={`px-6 py-4 border-b ${tk.tableHeader}`}>
                    <h2 className={`text-sm font-bold flex items-center gap-2 ${tk.cardTitle}`}>
                        <Users className="w-4 h-4 text-violet-500" /> Recent Guests (last 20)
                    </h2>
                </div>
                {guests.length === 0 ? (
                    <div className={`py-12 text-center text-sm ${tk.noData}`}>No guests recorded yet</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className={`border-b ${tk.tableHeader}`}>
                                    <th className={`text-left text-xs font-semibold uppercase tracking-wider px-6 py-3 ${tk.tableHeader}`}>Guest</th>
                                    <th className={`text-left text-xs font-semibold uppercase tracking-wider px-4 py-3 ${tk.tableHeader}`}>Nationality</th>
                                    <th className={`text-left text-xs font-semibold uppercase tracking-wider px-4 py-3 ${tk.tableHeader}`}>Arrival</th>
                                    <th className={`text-left text-xs font-semibold uppercase tracking-wider px-4 py-3 ${tk.tableHeader}`}>Departure</th>
                                    <th className={`text-left text-xs font-semibold uppercase tracking-wider px-6 py-3 ${tk.tableHeader}`}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {guests.map(g => (
                                    <tr key={g.id} className={`transition-colors border-b last:border-0 ${tk.tableRow}`}>
                                        <td className={`px-6 py-3 text-sm font-medium ${tk.tableName}`}>{g.first_name} {g.last_name}</td>
                                        <td className={`px-4 py-3 text-sm ${tk.tableVal}`}>{g.nationality_iso3}</td>
                                        <td className={`px-4 py-3 text-xs ${tk.tableVal}`}>{new Date(g.arrival_date).toLocaleDateString('en-GB')}</td>
                                        <td className={`px-4 py-3 text-xs ${tk.tableVal}`}>{new Date(g.departure_date).toLocaleDateString('en-GB')}</td>
                                        <td className="px-6 py-3">
                                            <span className={clsx('px-2.5 py-1 rounded-lg text-xs font-semibold capitalize', statusBadge(g.submission_status || 'pending'))}>
                                                {g.submission_status || 'pending'}
                                            </span>
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

export default AdminHostDetail;
