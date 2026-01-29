import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Building, Home, Loader2, X } from 'lucide-react';
import api from '../lib/api';

const Properties = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', type: 'Apartment' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = async () => {
        try {
            const response = await api.get('/properties');
            setProperties(response.data.properties || []);
        } catch (error) {
            console.error('Failed to fetch properties', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this property? This might affect existing bookings.')) return;

        try {
            await api.delete(`/properties/${id}`);
            setProperties(properties.filter(p => p.id !== id));
        } catch (error) {
            console.error('Failed to delete property', error);
            alert('Failed to delete property.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const response = await api.post('/properties', formData);
            setProperties([...properties, response.data.property]);
            setShowModal(false);
            setFormData({ name: '', type: 'Apartment' });
        } catch (error) {
            console.error('Failed to create property', error);
            alert('Failed to create property.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-100px)]">
                <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto animate-fade-in pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700">
                        Properties
                    </h1>
                    <p className="mt-2 text-slate-500">
                        Manage your accommodation units.
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Property
                </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.length > 0 ? (
                    properties.map((property) => (
                        <div key={property.id} className="glass-card p-6 rounded-2xl border border-slate-200/50 hover:shadow-lg transition-all group relative">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                                    <Building className="w-6 h-6" />
                                </div>
                                <button
                                    onClick={() => handleDelete(property.id)}
                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                    title="Delete Property"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">{property.name}</h3>
                            <p className="text-sm text-slate-500 font-medium bg-slate-100 inline-block px-2 py-1 rounded-md">
                                {property.type}
                            </p>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-16 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                        <Home className="mx-auto h-12 w-12 text-slate-400" />
                        <h3 className="mt-2 text-sm font-medium text-slate-900">No properties</h3>
                        <p className="mt-1 text-sm text-slate-500">Get started by creating a new property.</p>
                        <div className="mt-6">
                            <button
                                onClick={() => setShowModal(true)}
                                className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                                New Property
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-900">Add New Property</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Property Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="block w-full rounded-xl border-slate-200 bg-white px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    placeholder="e.g. Seaside Apt 101"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="block w-full rounded-xl border-slate-200 bg-white px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                >
                                    <option value="Apartment">Apartment</option>
                                    <option value="Studio">Studio</option>
                                    <option value="Villa">Villa</option>
                                    <option value="Cabin">Cabin</option>
                                    <option value="Room">Room</option>
                                    <option value="House">House</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 mt-6"
                            >
                                {saving ? <Loader2 className="animate-spin w-5 h-5" /> : 'Create Property'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Properties;
