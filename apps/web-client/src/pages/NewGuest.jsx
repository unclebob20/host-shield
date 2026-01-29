import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Import
import Scanner from '../components/Scanner';
import api from '../lib/api';
import { Check, Loader2, ArrowLeft, ScanLine } from 'lucide-react';

const NewGuest = () => {
    const navigate = useNavigate();
    const { t } = useTranslation(); // Destructure
    const [scannedData, setScannedData] = useState(null);
    const [formData, setFormData] = useState({});
    const [previewUrl, setPreviewUrl] = useState(null);
    const [fileType, setFileType] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [objects, setObjects] = useState([]);

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const response = await api.get('/properties');
                setObjects(response.data.properties || []);
            } catch (error) {
                console.error('Failed to fetch properties', error);
            }
        };
        fetchProperties();
    }, []);

    const handleScanComplete = (data, file) => {
        setScannedData(data);
        setFormData({
            ...data,
            // Default dates if needed
            arrival_date: new Date().toISOString().split('T')[0],
            departure_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            purpose_of_stay: 'turistika'
        });

        // Create preview URL for the uploaded image
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        setFileType(file.type);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const response = await api.post('/guests/save', formData);
            if (response.data.success) {
                // Short delay to ensure DB consistency if needed, though usually not required
                setTimeout(() => {
                    navigate('/guests');
                }, 500);
            } else {
                setError(response.data.error || t('common.error'));
            }
        } catch (err) {
            console.error('Save Error:', err);
            setError(err.response?.data?.error || t('common.error'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in pb-10">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => navigate('/guests')}
                    className="flex items-center text-sm text-slate-500 hover:text-blue-600 mb-4 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    {t('common.back')}
                </button>
                <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700">
                    {t('guest.register_new')}
                </h1>
                <p className="mt-2 text-slate-500">
                    {t('guest.register_desc')}
                </p>
            </div>

            {!scannedData ? (
                <div className="glass-card rounded-2xl p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <ScanLine className="w-16 h-16 text-blue-500" />
                    </div>

                    <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm font-bold mr-3">1</span>
                        {t('guest.upload_doc')}
                    </h2>

                    <div className="bg-white/40 backdrop-blur-sm rounded-xl p-6 border border-slate-200/50">
                        <Scanner onScanComplete={handleScanComplete} />
                    </div>

                    <div className="mt-8 flex flex-col items-center">
                        <div className="relative w-full mb-6">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                <div className="w-full border-t border-slate-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-white/80 backdrop-blur px-2 text-slate-400 rounded-full">{t('guest.manual_entry')}</span>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                setScannedData({
                                    first_name: '',
                                    last_name: '',
                                    document_number: '',
                                    nationality_iso3: '',
                                    date_of_birth: ''
                                });
                                // Initialize default dates and empty form
                                setFormData({
                                    arrival_date: new Date().toISOString().split('T')[0],
                                    departure_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                                    purpose_of_stay: 'turistika',
                                    document_type: 'P'
                                });
                            }}
                            className="text-slate-600 hover:text-blue-600 font-medium text-sm focus:outline-none hover:underline transition-colors"
                        >
                            {t('guest.skip_upload')}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="glass-card rounded-2xl overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-200/60 flex justify-between items-center bg-white/30 backdrop-blur-sm">
                        <h3 className="text-lg font-medium text-slate-900 flex items-center">
                            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 text-xs font-bold mr-3">2</span>
                            {t('guest.review_confirm')}
                        </h3>
                        <button
                            onClick={() => {
                                setScannedData(null);
                                setFormData({});
                                setPreviewUrl(null);
                                setFileType(null);
                            }}
                            className="text-sm text-slate-500 hover:text-blue-600 transition-colors"
                        >
                            {t('guest.upload_diff')}
                        </button>
                    </div>

                    <div className="md:flex">
                        {/* Image Preview Sidebar */}
                        <div className="md:w-1/3 bg-slate-50/50 p-6 border-r border-slate-200/60">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t('guest.uploaded_doc')}</h4>
                            {previewUrl && (
                                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
                                    {fileType === 'application/pdf' ? (
                                        <embed src={previewUrl} type="application/pdf" className="w-full h-64 md:h-96 object-contain" />
                                    ) : (
                                        <img src={previewUrl} alt="Scanned Passport" className="w-full h-auto" />
                                    )}
                                </div>
                            )}

                            <div className="mt-6 p-4 rounded-xl bg-white/60 border border-slate-100">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t('guest.confidence')}</h4>
                                <div className="flex items-center">
                                    <div className="flex-1 bg-slate-200 rounded-full h-2">
                                        <div className="bg-emerald-500 h-2 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: '92%' }}></div>
                                    </div>
                                    <span className="ml-2 text-sm font-bold text-emerald-600">92%</span>
                                </div>
                            </div>
                        </div>

                        {/* Form */}
                        <div className="md:w-2/3 p-6 md:p-8">
                            {error && (
                                <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                                    <div className="flex">
                                        <div className="ml-3">
                                            <p className="text-sm text-red-700 font-medium">{error}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
                                {/* Personal Details Section */}
                                <div>
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200/60 pb-2 mb-4">
                                        {t('guest.personal_details')}
                                    </h4>
                                    <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-2">
                                        <div className="sm:col-span-1">
                                            <label className="block text-sm font-medium text-slate-700 mb-1">{t('guest.first_name')}</label>
                                            <input
                                                type="text"
                                                name="first_name"
                                                value={formData.first_name || ''}
                                                onChange={handleChange}
                                                className="block w-full rounded-xl border-slate-200/60 bg-white/50 px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm shadow-sm transition-all"
                                            />
                                        </div>

                                        <div className="sm:col-span-1">
                                            <label className="block text-sm font-medium text-slate-700 mb-1">{t('guest.last_name')}</label>
                                            <input
                                                type="text"
                                                name="last_name"
                                                value={formData.last_name || ''}
                                                onChange={handleChange}
                                                className="block w-full rounded-xl border-slate-200/60 bg-white/50 px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm shadow-sm transition-all"
                                            />
                                        </div>

                                        <div className="sm:col-span-1">
                                            <label className="block text-sm font-medium text-slate-700 mb-1">{t('guest.dob')}</label>
                                            <input
                                                type="date"
                                                name="date_of_birth"
                                                value={formData.date_of_birth || ''}
                                                onChange={handleChange}
                                                className="block w-full rounded-xl border-slate-200/60 bg-white/50 px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm shadow-sm transition-all"
                                            />
                                        </div>

                                        <div className="sm:col-span-1">
                                            <label className="block text-sm font-medium text-slate-700 mb-1">{t('guest.nationality')}</label>
                                            <input
                                                type="text"
                                                name="nationality_iso3"
                                                maxLength={3}
                                                value={formData.nationality_iso3 || ''}
                                                onChange={handleChange}
                                                className="block w-full rounded-xl border-slate-200/60 bg-white/50 px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm shadow-sm transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Identity Document Section */}
                                <div>
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200/60 pb-2 mb-4">
                                        {t('guest.identity_doc')}
                                    </h4>
                                    <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-2">
                                        <div className="sm:col-span-1">
                                            <label className="block text-sm font-medium text-slate-700 mb-1">{t('guest.doc_type')}</label>
                                            <select
                                                name="document_type"
                                                value={formData.document_type || 'P'}
                                                onChange={handleChange}
                                                className="block w-full rounded-xl border-slate-200/60 bg-white/50 px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm shadow-sm transition-all"
                                            >
                                                <option value="P">{t('guest.passport')} (P)</option>
                                                <option value="ID">{t('guest.id_card')} (I)</option>
                                            </select>
                                        </div>

                                        <div className="sm:col-span-1">
                                            <label className="block text-sm font-medium text-slate-700 mb-1">{t('guest.doc_number')}</label>
                                            <input
                                                type="text"
                                                name="document_number"
                                                value={formData.document_number || ''}
                                                onChange={handleChange}
                                                className="block w-full rounded-xl border-slate-200/60 bg-white/50 px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm shadow-sm transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Stay Experience Section */}
                                <div>
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200/60 pb-2 mb-4">
                                        {t('guest.stay_exp')}
                                    </h4>
                                    <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-2">
                                        <div className="sm:col-span-2">
                                            <label className="block text-sm font-medium text-slate-700 mb-1">{t('guest.property')}</label>
                                            <select
                                                name="objectId"
                                                value={formData.objectId || ''}
                                                onChange={handleChange}
                                                className="block w-full rounded-xl border-slate-200/60 bg-white/50 px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm shadow-sm transition-all"
                                            >
                                                <option value="">Select a property...</option>
                                                {objects.map(obj => (
                                                    <option key={obj.id} value={obj.id}>
                                                        {obj.name} ({obj.type})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="sm:col-span-1">
                                            <label className="block text-sm font-medium text-slate-700 mb-1">{t('guest.arrival')}</label>
                                            <input
                                                type="date"
                                                name="arrival_date"
                                                value={formData.arrival_date || ''}
                                                onChange={handleChange}
                                                className="block w-full rounded-xl border-slate-200/60 bg-white/50 px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm shadow-sm transition-all"
                                            />
                                        </div>

                                        <div className="sm:col-span-1">
                                            <label className="block text-sm font-medium text-slate-700 mb-1">{t('guest.departure')}</label>
                                            <input
                                                type="date"
                                                name="departure_date"
                                                value={formData.departure_date || ''}
                                                onChange={handleChange}
                                                className="block w-full rounded-xl border-slate-200/60 bg-white/50 px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm shadow-sm transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-200/60 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (window.confirm(t('guest.discard_confirm'))) {
                                                setScannedData(null);
                                                setFileType(null);
                                            }
                                        }}
                                        className="bg-white py-2.5 px-5 border border-slate-200 rounded-xl shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3 transition-colors"
                                    >
                                        {t('common.cancel')}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="inline-flex justify-center items-center py-2.5 px-6 border border-transparent shadow-lg shadow-blue-500/30 text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:shadow-none transition-all"
                                    >
                                        {saving ? (
                                            <>
                                                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                {t('guest.save_register')}
                                                <Check className="ml-2 -mr-1 h-4 w-4" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewGuest;
