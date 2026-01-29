import React, { useState } from 'react';
import { FileDown, FileText, Calendar, Loader2, AlertCircle } from 'lucide-react';
import api from '../lib/api';
import { useTranslation } from 'react-i18next';

const Ledger = () => {
    const { t, i18n } = useTranslation();
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
            setError(err.response?.data?.error || t('ledger.error_gen'));
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
            setError(err.response?.data?.error || t('ledger.error_gen'));
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700">
                    {t('ledger.title')}
                </h1>
                <p className="mt-2 text-slate-500">
                    {t('ledger.subtitle')}
                </p>
            </div>

            {/* Controls Card */}
            <div className="glass-card rounded-2xl p-6 sm:p-8">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                            {t('ledger.select_period')}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1 max-w-xl">
                            {t('ledger.select_period_desc')}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                    <div>
                        <label htmlFor="start-date" className="block text-sm font-medium text-slate-700 mb-1">
                            {t('ledger.start_date')}
                        </label>
                        <div className="relative rounded-xl shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Calendar className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="date"
                                id="start-date"
                                className="block w-full rounded-xl border-slate-200/60 bg-white/50 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 shadow-sm transition-all"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="end-date" className="block text-sm font-medium text-slate-700 mb-1">
                            {t('ledger.end_date')}
                        </label>
                        <div className="relative rounded-xl shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Calendar className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="date"
                                id="end-date"
                                className="block w-full rounded-xl border-slate-200/60 bg-white/50 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 shadow-sm transition-all"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 sm:col-span-2 lg:col-span-2">
                        <button
                            type="button"
                            onClick={handlePreview}
                            disabled={loading}
                            className="flex-1 inline-flex justify-center items-center px-4 py-2.5 border border-slate-200 rounded-xl shadow-sm text-sm font-medium text-slate-700 bg-white/80 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                        >
                            {loading ? <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" /> : <FileText className="-ml-1 mr-2 h-4 w-4 text-slate-500" />}
                            {t('ledger.preview')}
                        </button>

                        <button
                            type="button"
                            onClick={handleExport}
                            disabled={exporting}
                            className="flex-1 inline-flex justify-center items-center px-4 py-2.5 border border-transparent shadow-lg shadow-blue-500/20 text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
                        >
                            {exporting ? <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" /> : <FileDown className="-ml-1 mr-2 h-4 w-4" />}
                            {t('ledger.export_pdf')}
                        </button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="rounded-xl bg-red-50 border border-red-100 p-4 animate-fade-in">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <AlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">{t('ledger.error_gen')}</h3>
                            <div className="mt-2 text-sm text-red-700">
                                <p>{error}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {previewData && (
                <div className="flex flex-col animate-fade-in">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 px-1">
                        {t('ledger.preview_title')} ({previewData.rowCount} {t('ledger.records')})
                    </h3>
                    <div className="glass-card rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-100/50">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            {t('ledger.cols.name')}
                                        </th>
                                        <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            {t('ledger.cols.nationality')}
                                        </th>
                                        <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            {t('ledger.cols.arrival')}
                                        </th>
                                        <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            {t('ledger.cols.departure')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white/40 divide-y divide-slate-100/50">
                                    {previewData.entries.map((guest, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                                {guest.first_name} {guest.last_name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-medium border border-slate-200">
                                                    {guest.nationality_iso3}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                {new Date(guest.arrival_date).toLocaleDateString(i18n.language)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                {new Date(guest.departure_date).toLocaleDateString(i18n.language)}
                                            </td>
                                        </tr>
                                    ))}
                                    {previewData.entries.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-12 whitespace-nowrap text-sm text-slate-500 text-center">
                                                {t('ledger.no_records')}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Ledger;
