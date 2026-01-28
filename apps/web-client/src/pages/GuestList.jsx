import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { UserPlus, Search, Filter, MoreVertical, Loader2, Send } from 'lucide-react';
import clsx from 'clsx';

const GuestList = () => {
    const [guests, setGuests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchGuests();
    }, []);

    const fetchGuests = async () => {
        try {
            const response = await api.get('/guests');
            setGuests(response.data.guests || []);
        } catch (error) {
            console.error('Failed to fetch guests', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmission = async (guestId) => {
        try {
            // Optimistic update
            setGuests(guests.map(g =>
                g.id === guestId ? { ...g, submission_status: 'sending' } : g
            ));

            await api.post('/guests/register', { guestId });

            // Refetch to get updated status and details
            fetchGuests();
            alert('Guest successfully submitted to police database!');
        } catch (error) {
            console.error('Submission failed', error);
            alert('Failed to submit guest. Check console for details.');
            fetchGuests(); // Revert/update status
        }
    };

    const filteredGuests = guests.filter(guest => {
        const search = searchTerm.toLowerCase();
        return (
            guest.first_name.toLowerCase().includes(search) ||
            guest.last_name.toLowerCase().includes(search) ||
            guest.document_number.toLowerCase().includes(search)
        );
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-100px)]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700">
                        Guest Registry
                    </h1>
                    <p className="mt-2 text-slate-500">
                        Manage all registered guests and their reporting status.
                    </p>
                </div>
                <div className="flex-none">
                    <button
                        onClick={() => navigate('/guests/new')}
                        className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-500/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add New Guest
                    </button>
                </div>
            </div>

            {/* Controls */}
            <div className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full sm:w-96">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
                    </div>
                    <input
                        type="text"
                        className="block w-full rounded-xl border-slate-200/60 bg-white/50 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 placeholder-slate-400 backdrop-blur-sm transition-all"
                        placeholder="Search by name or passport..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {/* Placeholder for future filters */}
            </div>

            {/* Table Card */}
            <div className="glass-card rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100/50">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 sm:pl-6">Guest Details</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Nationality</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Arrival</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Validation Status</th>
                                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/50 bg-white/40">
                            {filteredGuests.length > 0 ? (
                                filteredGuests.map((guest) => (
                                    <tr key={guest.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                                            <div className="font-semibold text-slate-900">{guest.first_name} {guest.last_name}</div>
                                            <div className="text-slate-500 text-xs mt-0.5">{guest.document_type} • {guest.document_number}</div>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-600">
                                            <div className="flex items-center">
                                                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-medium border border-slate-200">
                                                    {guest.nationality_iso3}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-600">
                                            {new Date(guest.arrival_date).toLocaleDateString()}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                                            <span className={clsx(
                                                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
                                                guest.submission_status === 'sent' ? "bg-emerald-100 text-emerald-800 border border-emerald-200/50" :
                                                    guest.submission_status === 'error' ? "bg-red-100 text-red-800 border border-red-200/50" :
                                                        guest.submission_status === 'sending' ? "bg-blue-100 text-blue-800 animate-pulse border border-blue-200/50" :
                                                            "bg-amber-100 text-amber-800 border border-amber-200/50"
                                            )}>
                                                {guest.submission_status === 'sent' && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></div>}
                                                {guest.submission_status === 'error' && <div className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5"></div>}
                                                {guest.submission_status || 'pending'}
                                            </span>
                                        </td>
                                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                            {(guest.submission_status === 'pending' || guest.submission_status === 'error') && (
                                                <button
                                                    onClick={() => handleSubmission(guest.id)}
                                                    className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg"
                                                >
                                                    <Send className="w-3.5 h-3.5 mr-1.5" />
                                                    Submit
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="py-16 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="bg-slate-100 p-4 rounded-full mb-3">
                                                <Search className="h-6 w-6 text-slate-400" />
                                            </div>
                                            <p className="text-sm font-medium text-slate-900">No guests found</p>
                                            <p className="text-sm text-slate-500 mt-1">
                                                Try adjusting your search or add a new guest.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default GuestList;
