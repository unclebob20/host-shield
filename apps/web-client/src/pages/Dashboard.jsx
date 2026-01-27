import React, { useEffect, useState } from 'react';
import { Users, AlertTriangle, FileCheck, Clock } from 'lucide-react';
import api from '../lib/api';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalGuests: 0,
        pendingSubmissions: 0,
        recentActivity: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Mocking stats for MVP since we don't have a dedicated endpoint yet
                // In production, we would have GET /api/dashboard/stats

                // Fetch recent guests to calculate stats (simple client-side logic for now)
                const response = await api.get('/guests'); // Ensure this endpoint supports listing all
                // If the endpoint is paginated, this might be partial, but ok for MVP

                // Wait, based on Sprint Plan, /guests endpoint might fetch "Guests" list. 
                // Let's assume pagination for large datasets but for now we might get limited set.
                // Or maybe getting all is fine for small count.

                const guests = response.data.guests || [];

                const totalGuests = guests.length;
                const pendingSubmissions = guests.filter(g => g.submission_status === 'pending' || g.submission_status === 'error').length;

                setStats({
                    totalGuests,
                    pendingSubmissions,
                    recentActivity: guests.slice(0, 5) // Last 5
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
        { name: 'Total Guests', value: stats.totalGuests, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
        { name: 'Pending Submissions', value: stats.pendingSubmissions, icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-100' },
        { name: 'Reports Submitted', value: stats.totalGuests - stats.pendingSubmissions, icon: FileCheck, color: 'text-green-600', bg: 'bg-green-100' },
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto animate-fade-in">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {cards.map((card) => (
                    <div key={card.name} className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className={`p-3 rounded-md ${card.bg}`}>
                                        <card.icon className={`h-6 w-6 ${card.color}`} aria-hidden="true" />
                                    </div>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">{card.name}</dt>
                                        <dd className="text-3xl font-semibold text-gray-900">{card.value}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Guests</h2>
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                        {stats.recentActivity.length > 0 ? (
                            stats.recentActivity.map((guest) => (
                                <li key={guest.id}>
                                    <div className="px-4 py-4 sm:px-6">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-blue-600 truncate">
                                                {guest.first_name} {guest.last_name}
                                            </p>
                                            <div className="ml-2 flex-shrink-0 flex">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${guest.submission_status === 'sent' ? 'bg-green-100 text-green-800' :
                                                    guest.submission_status === 'error' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {guest.submission_status || 'pending'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mt-2 sm:flex sm:justify-between">
                                            <div className="sm:flex">
                                                <p className="flex items-center text-sm text-gray-500">
                                                    <Users className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                                                    {guest.nationality_iso3}
                                                </p>
                                            </div>
                                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                                <Clock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                                                <p>
                                                    Arrived {new Date(guest.arrival_date).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
                                No recent activity
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
