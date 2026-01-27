import React, { useState } from 'react';
import { FileDown, FileText, Calendar, Loader2, AlertCircle } from 'lucide-react';
import api from '../lib/api';

const Ledger = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

    // Helper to format date as YYYY-MM-DD for input fields
    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Default to current month
    const [startDate, setStartDate] = useState(formatDate(firstDay));
    const [endDate, setEndDate] = useState(formatDate(today));

    const [previewData, setPreviewData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [error, setError] = useState(null);

    const handlePreview = async () => {
        setLoading(true);
        setError(null);
        setPreviewData(null);

        try {
            const response = await api.post('/ledger/preview', {
                fromDate: startDate,
                toDate: endDate
            });

            setPreviewData(response.data);
        } catch (err) {
            console.error('Preview error:', err);
            setError(err.response?.data?.error || 'Failed to generate preview');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        setExporting(true);
        setError(null);

        try {
            const response = await api.post('/ledger/export', {
                fromDate: startDate,
                toDate: endDate
            }, {
                responseType: 'blob' // Important for PDF download
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `kniha_ubytovanych_${startDate}_${endDate}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Export error:', err);
            setError(err.response?.data?.error || 'Failed to export PDF');
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">Guest Ledger (Kniha ubytovaných)</h1>

            <div className="bg-white shadow sm:rounded-lg mb-8">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Select Date Range
                    </h3>
                    <div className="mt-2 max-w-xl text-sm text-gray-500">
                        <p>Generate a PDF report of all guests within a specific period for compliance purposes.</p>
                    </div>

                    <div className="mt-5 sm:flex sm:items-center gap-4">
                        <div className="w-full sm:max-w-xs">
                            <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">
                                Start Date
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Calendar className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="date"
                                    name="start-date"
                                    id="start-date"
                                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md border p-2"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="w-full sm:max-w-xs mt-3 sm:mt-0">
                            <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">
                                End Date
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Calendar className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="date"
                                    name="end-date"
                                    id="end-date"
                                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md border p-2"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex gap-3">
                        <button
                            type="button"
                            onClick={handlePreview}
                            disabled={loading}
                            className="inline-flex items-center px-4 py-2 border border-blue-300 shadow-sm text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" /> : <FileText className="-ml-1 mr-2 h-4 w-4" />}
                            Preview Data
                        </button>

                        <button
                            type="button"
                            onClick={handleExport}
                            disabled={exporting}
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {exporting ? <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" /> : <FileDown className="-ml-1 mr-2 h-4 w-4" />}
                            Export PDF
                        </button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="rounded-md bg-red-50 p-4 mb-8">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Error generating report</h3>
                            <div className="mt-2 text-sm text-red-700">
                                <p>{error}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {previewData && (
                <div className="flex flex-col">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Preview ({previewData.rowCount} Records)
                    </h3>
                    <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Name
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Nationality
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Arrival
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Departure
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {previewData.entries.map((guest, idx) => (
                                            <tr key={idx}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {guest.first_name} {guest.last_name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {guest.nationality_iso3}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(guest.arrival_date).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(guest.departure_date).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                        {previewData.entries.length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                                    No guests found in this period.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Ledger;
