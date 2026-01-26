import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Scanner from '../components/Scanner';
import api from '../lib/api';
import { Check } from 'lucide-react';

const NewGuest = () => {
    const navigate = useNavigate();
    const [scannedData, setScannedData] = useState(null);
    const [formData, setFormData] = useState({});
    const [previewUrl, setPreviewUrl] = useState(null);
    const [fileType, setFileType] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

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
                setError(response.data.error || 'Failed to save guest.');
            }
        } catch (err) {
            console.error('Save Error:', err);
            setError(err.response?.data?.error || 'Failed to save guest data. Please check connection.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Register New Guest</h1>

            {!scannedData ? (
                <div className="bg-white shadow sm:rounded-lg p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Step 1: Scan Document</h2>
                    <Scanner onScanComplete={handleScanComplete} />
                </div>
            ) : (
                <div className="bg-white shadow sm:rounded-lg overflow-hidden">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                            Step 2: Review & Confirm
                        </h3>
                        <button
                            onClick={() => {
                                setScannedData(null);
                                setFormData({});
                                setPreviewUrl(null);
                                setFileType(null);
                            }}
                            className="text-sm text-blue-600 hover:text-blue-500"
                        >
                            Scan different document
                        </button>
                    </div>

                    <div className="md:flex">
                        {/* Image Preview Sidebar */}
                        <div className="md:w-1/3 bg-gray-50 p-6 border-r border-gray-200">
                            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Scanned Document</h4>
                            {previewUrl && (
                                <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm bg-white">
                                    {fileType === 'application/pdf' ? (
                                        <embed src={previewUrl} type="application/pdf" className="w-full h-64 md:h-96 object-contain" />
                                    ) : (
                                        <img src={previewUrl} alt="Scanned Passport" className="w-full h-auto" />
                                    )}
                                </div>
                            )}

                            <div className="mt-6">
                                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Extraction Confidence</h4>
                                <div className="flex items-center">
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                                    </div>
                                    <span className="ml-2 text-sm font-medium text-gray-700">92%</span>
                                </div>
                            </div>
                        </div>

                        {/* Form */}
                        <div className="md:w-2/3 p-6">
                            {error && (
                                <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
                                    <div className="flex">
                                        <div className="ml-3">
                                            <p className="text-sm text-red-700">{error}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                    <div className="sm:col-span-3">
                                        <label className="block text-sm font-medium text-gray-700">First name</label>
                                        <div className="mt-1">
                                            <input
                                                type="text"
                                                name="first_name"
                                                value={formData.first_name || ''}
                                                onChange={handleChange}
                                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                            />
                                        </div>
                                    </div>

                                    <div className="sm:col-span-3">
                                        <label className="block text-sm font-medium text-gray-700">Last name</label>
                                        <div className="mt-1">
                                            <input
                                                type="text"
                                                name="last_name"
                                                value={formData.last_name || ''}
                                                onChange={handleChange}
                                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                            />
                                        </div>
                                    </div>

                                    <div className="sm:col-span-3">
                                        <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                                        <div className="mt-1">
                                            <input
                                                type="date"
                                                name="date_of_birth"
                                                value={formData.date_of_birth || ''}
                                                onChange={handleChange}
                                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                            />
                                        </div>
                                    </div>

                                    <div className="sm:col-span-3">
                                        <label className="block text-sm font-medium text-gray-700">Nationality (ISO3)</label>
                                        <div className="mt-1">
                                            <input
                                                type="text"
                                                name="nationality_iso3"
                                                maxLength={3}
                                                value={formData.nationality_iso3 || ''}
                                                onChange={handleChange}
                                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                            />
                                        </div>
                                    </div>

                                    <div className="sm:col-span-3">
                                        <label className="block text-sm font-medium text-gray-700">Document Type</label>
                                        <div className="mt-1">
                                            <select
                                                name="document_type"
                                                value={formData.document_type || 'P'}
                                                onChange={handleChange}
                                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                            >
                                                <option value="P">Passport (P)</option>
                                                <option value="ID">Identity Card (I)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="sm:col-span-3">
                                        <label className="block text-sm font-medium text-gray-700">Document Number</label>
                                        <div className="mt-1">
                                            <input
                                                type="text"
                                                name="document_number"
                                                value={formData.document_number || ''}
                                                onChange={handleChange}
                                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                            />
                                        </div>
                                    </div>

                                    <div className="sm:col-span-3">
                                        <label className="block text-sm font-medium text-gray-700">Arrival Date</label>
                                        <div className="mt-1">
                                            <input
                                                type="date"
                                                name="arrival_date"
                                                value={formData.arrival_date || ''}
                                                onChange={handleChange}
                                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                            />
                                        </div>
                                    </div>

                                    <div className="sm:col-span-3">
                                        <label className="block text-sm font-medium text-gray-700">Departure Date</label>
                                        <div className="mt-1">
                                            <input
                                                type="date"
                                                name="departure_date"
                                                value={formData.departure_date || ''}
                                                onChange={handleChange}
                                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-5 border-t border-gray-200 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (window.confirm("Discard changes?")) {
                                                setScannedData(null);
                                                setFileType(null);
                                            }
                                        }}
                                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                    >
                                        {saving ? 'Saving...' : 'Save & Register Guest'}
                                        {!saving && <Check className="ml-2 -mr-1 h-4 w-4" />}
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
