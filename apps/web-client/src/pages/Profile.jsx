import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import api from '../lib/api';
import CredentialsManagement from '../components/CredentialsManagement';
import { User, Mail, Building2, Calendar, Key, Shield, Edit2, Save, X, Loader2 } from 'lucide-react';

const Profile = () => {
    const { user, setUser } = useAuth();
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('profile');
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Editable fields
    const [fullName, setFullName] = useState(user?.fullName || user?.full_name || '');
    const [policeProviderId, setPoliceProviderId] = useState(user?.policeProviderId || user?.police_provider_id || '');

    const handleEdit = () => {
        setIsEditing(true);
        setFullName(user?.fullName || user?.full_name || '');
        setPoliceProviderId(user?.policeProviderId || user?.police_provider_id || '');
        setError(null);
        setSuccess(null);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFullName(user?.fullName || user?.full_name || '');
        setPoliceProviderId(user?.policeProviderId || user?.police_provider_id || '');
        setError(null);
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError(null);

            // Update full name
            await api.put('/auth/profile', {
                full_name: fullName,
            });

            // Update police provider ID
            await api.put('/auth/police-id', {
                police_provider_id: policeProviderId || null,
            });

            // Update user in auth context
            setUser({
                ...user,
                fullName,
                full_name: fullName,
                policeProviderId,
                police_provider_id: policeProviderId
            });

            setSuccess(t('profile.update_success') || 'Profile updated successfully!');
            setIsEditing(false);

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.response?.data?.error || t('profile.update_error') || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">{t('profile.title') || 'Settings'}</h1>
                    <p className="mt-2 text-gray-600">
                        {t('profile.subtitle') || 'Manage your profile and government API credentials'}
                    </p>
                </div>

                {/* Alerts */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                        <div className="flex-1">
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                        <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
                            ×
                        </button>
                    </div>
                )}

                {success && (
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                        <div className="flex-1">
                            <p className="text-sm text-green-800">{success}</p>
                        </div>
                        <button onClick={() => setSuccess(null)} className="text-green-600 hover:text-green-800">
                            ×
                        </button>
                    </div>
                )}

                {/* Tabs */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`
                py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === 'profile'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }
              `}
                        >
                            <div className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                {t('profile.tab_profile') || 'Profile'}
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('credentials')}
                            className={`
                py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === 'credentials'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }
              `}
                        >
                            <div className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                {t('profile.tab_credentials') || 'Government Credentials'}
                            </div>
                        </button>
                    </nav>
                </div>

                {/* Tab Content */}
                {activeTab === 'profile' && (
                    <div className="space-y-6">
                        {/* Profile Information Card */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {t('profile.profile_info') || 'Profile Information'}
                                </h2>
                                {!isEditing ? (
                                    <button
                                        onClick={handleEdit}
                                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                        {t('profile.edit') || 'Edit'}
                                    </button>
                                ) : (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleCancel}
                                            disabled={saving}
                                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            <X className="h-4 w-4" />
                                            {t('profile.cancel') || 'Cancel'}
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            {saving ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    {t('profile.saving') || 'Saving...'}
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="h-4 w-4" />
                                                    {t('profile.save') || 'Save'}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                {/* Full Name - Editable */}
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                        <User className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('profile.full_name') || 'Full Name'}
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder={t('profile.full_name_placeholder') || 'Enter your full name'}
                                            />
                                        ) : (
                                            <p className="text-gray-900">{user?.fullName || user?.full_name || 'N/A'}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Email - Read only */}
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                        <Mail className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('profile.email') || 'Email'}
                                        </label>
                                        <p className="text-gray-900">{user?.email || 'N/A'}</p>
                                        {isEditing && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                {t('profile.email_readonly') || 'Email cannot be changed'}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Police Provider ID - Editable */}
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                        <Building2 className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('profile.police_provider_id') || 'Police Provider ID'}
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={policeProviderId}
                                                onChange={(e) => setPoliceProviderId(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder={t('profile.police_provider_id_placeholder') || 'Enter your police provider ID (optional)'}
                                            />
                                        ) : (
                                            <p className="text-gray-900">{user?.policeProviderId || user?.police_provider_id || t('profile.not_set') || 'Not set'}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Member Since - Read only */}
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                        <Calendar className="h-6 w-6 text-orange-600" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('profile.member_since') || 'Member Since'}
                                        </label>
                                        <p className="text-gray-900">
                                            {user?.createdAt || user?.created_at
                                                ? new Date(user.createdAt || user.created_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })
                                                : 'N/A'
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Account Info Card */}
                        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
                            <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                <Key className="h-5 w-5" />
                                {t('profile.account_info') || 'Account Information'}
                            </h3>
                            <div className="space-y-2 text-sm text-blue-800">
                                <p><strong>{t('profile.account_id') || 'Account ID'}:</strong> {user?.id || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'credentials' && (
                    <div>
                        <CredentialsManagement />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
