import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { UserPlus, Search, Filter, MoreVertical, Loader2 } from 'lucide-react';
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
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold text-gray-900">Guests</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        A list of all guests registered in your establishment.
                    </p>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                    <button
                        onClick={() => navigate('/guests/new')}
                        className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
                    >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Guest
                    </button>
                </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full sm:w-96">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                        type="text"
                        className="block w-full rounded-md border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 border"
                        placeholder="Search by name or document number"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {/* <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                </button> */}
            </div>

            <div className="mt-8 flex flex-col">
                <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Name</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Nationality</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Arrival</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                            <span className="sr-only">Actions</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {filteredGuests.length > 0 ? (
                                        filteredGuests.map((guest) => (
                                            <tr key={guest.id}>
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                                                    <div className="font-medium text-gray-900">{guest.first_name} {guest.last_name}</div>
                                                    <div className="text-gray-500">{guest.document_type} • {guest.document_number}</div>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    {guest.nationality_iso3}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    {new Date(guest.arrival_date).toLocaleDateString()}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                    <span className={clsx(
                                                        "inline-flex rounded-full px-2 text-xs font-semibold leading-5",
                                                        guest.submission_status === 'sent' ? "bg-green-100 text-green-800" :
                                                            guest.submission_status === 'error' ? "bg-red-100 text-red-800" :
                                                                guest.submission_status === 'sending' ? "bg-blue-100 text-blue-800 animate-pulse" :
                                                                    "bg-yellow-100 text-yellow-800"
                                                    )}>
                                                        {guest.submission_status || 'pending'}
                                                    </span>
                                                </td>
                                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                    {(guest.submission_status === 'pending' || guest.submission_status === 'error') && (
                                                        <button
                                                            onClick={() => handleSubmission(guest.id)}
                                                            className="text-blue-600 hover:text-blue-900 mr-4"
                                                        >
                                                            Submit
                                                        </button>
                                                    )}
                                                    {/* <button className="text-gray-400 hover:text-gray-600">
                                                        <MoreVertical className="h-5 w-5" />
                                                    </button> */}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="py-10 text-center text-gray-500 text-sm">
                                                No guests found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GuestList;
