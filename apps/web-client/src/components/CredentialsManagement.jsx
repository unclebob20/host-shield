import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import api from '../lib/api';
import {
    Upload,
    CheckCircle,
    AlertCircle,
    Trash2,
    Shield,
    Key as KeyIcon,
    FileText,
    Loader2
} from 'lucide-react';

const CredentialsManagement = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    // Upload form state
    const [ico, setIco] = useState('');
    const [apiSubject, setApiSubject] = useState('');
    const [keystoreFile, setKeystoreFile] = useState(null);
    const [privateKeyFile, setPrivateKeyFile] = useState(null);

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/hosts/${user.id}/credentials/status`);
            setStatus(response.data.credentials);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.error || t('credentials.fetch_error'));
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();

        if (!ico || !apiSubject || !keystoreFile || !privateKeyFile) {
            setError('All fields are required');
            return;
        }

        try {
            setUploading(true);
            setError(null);

            const formData = new FormData();
            formData.append('ico', ico);
            formData.append('apiSubject', apiSubject);
            formData.append('keystore', keystoreFile);
            formData.append('privateKey', privateKeyFile);

            await api.post(`/hosts/${user.id}/credentials`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setSuccess(t('credentials.upload_success'));
            setIco('');
            setApiSubject('');
            setKeystoreFile(null);
            setPrivateKeyFile(null);

            // Reset file inputs
            document.getElementById('keystore-input').value = '';
            document.getElementById('privatekey-input').value = '';

            await fetchStatus();
        } catch (err) {
            setError(err.response?.data?.error || t('credentials.upload_error'));
        } finally {
            setUploading(false);
        }
    };

    const handleVerify = async () => {
        try {
            setVerifying(true);
            setError(null);

            const response = await api.post(`/hosts/${user.id}/credentials/verify`);

            setSuccess(response.data.message || t('credentials.verify_success'));
            await fetchStatus();
        } catch (err) {
            setError(err.response?.data?.error || err.response?.data?.details || t('credentials.verify_error'));
        } finally {
            setVerifying(false);
        }
    };

    const handleDelete = async () => {
        try {
            setLoading(true);
            await api.delete(`/hosts/${user.id}/credentials`);

            setSuccess(t('credentials.delete_success'));
            setShowDeleteDialog(false);
            await fetchStatus();
        } catch (err) {
            setError(err.response?.data?.error || t('credentials.delete_error'));
        } finally {
            setLoading(false);
        }
    };

    if (loading && !status) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Alerts */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-sm text-red-800">{error}</p>
                    </div>
                    <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
                        ×
                    </button>
                </div>
            )}

            {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-sm text-green-800">{success}</p>
                    </div>
                    <button onClick={() => setSuccess(null)} className="text-green-600 hover:text-green-800">
                        ×
                    </button>
                </div>
            )}

            {/* Current Credentials Status */}
            {status?.configured && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{t('credentials.current_title')}</h3>
                        {status.verified ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                <CheckCircle className="h-4 w-4" />
                                {t('credentials.verified')}
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                                <AlertCircle className="h-4 w-4" />
                                {t('credentials.not_verified')}
                            </span>
                        )}
                    </div>

                    <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-2 text-sm">
                            <KeyIcon className="h-4 w-4 text-gray-400" />
                            <span className="font-medium text-gray-700">{t('credentials.ico')}:</span>
                            <span className="text-gray-900">{status.ico}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <FileText className="h-4 w-4 text-gray-400" />
                            <span className="font-medium text-gray-700">{t('credentials.api_subject')}:</span>
                            <span className="text-gray-900">{status.apiSubject}</span>
                        </div>
                        {status.verifiedAt && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Shield className="h-4 w-4 text-gray-400" />
                                <span>{t('credentials.verified_at')}: {new Date(status.verifiedAt).toLocaleString()}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3">
                        {!status.verified && (
                            <button
                                onClick={handleVerify}
                                disabled={verifying}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {verifying ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        {t('credentials.verifying')}
                                    </>
                                ) : (
                                    <>
                                        <Shield className="h-4 w-4" />
                                        {t('credentials.verify_btn')}
                                    </>
                                )}
                            </button>
                        )}
                        <button
                            onClick={() => setShowDeleteDialog(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                        >
                            <Trash2 className="h-4 w-4" />
                            {t('credentials.delete_btn')}
                        </button>
                    </div>
                </div>
            )}

            {/* Upload Form */}
            {!status?.configured && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('credentials.upload_title')}</h3>
                    <p className="text-sm text-gray-600 mb-6">
                        {t('credentials.upload_desc')}
                    </p>

                    <form onSubmit={handleUpload} className="space-y-4">
                        <div>
                            <label htmlFor="ico" className="block text-sm font-medium text-gray-700 mb-1">
                                {t('credentials.ico_label')}
                            </label>
                            <input
                                id="ico"
                                type="text"
                                value={ico}
                                onChange={(e) => setIco(e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder={t('credentials.ico_placeholder')}
                            />
                            <p className="mt-1 text-xs text-gray-500">{t('credentials.ico_help')}</p>
                        </div>

                        <div>
                            <label htmlFor="apiSubject" className="block text-sm font-medium text-gray-700 mb-1">
                                {t('credentials.api_subject_label')}
                            </label>
                            <input
                                id="apiSubject"
                                type="text"
                                value={apiSubject}
                                onChange={(e) => setApiSubject(e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder={t('credentials.api_subject_placeholder')}
                            />
                            <p className="mt-1 text-xs text-gray-500">{t('credentials.api_subject_help')}</p>
                        </div>

                        <div>
                            <label htmlFor="keystore-input" className="block text-sm font-medium text-gray-700 mb-1">
                                {t('credentials.keystore_label')}
                            </label>
                            <input
                                id="keystore-input"
                                type="file"
                                accept=".keystore,.jks"
                                onChange={(e) => setKeystoreFile(e.target.files[0])}
                                required
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                        </div>

                        <div>
                            <label htmlFor="privatekey-input" className="block text-sm font-medium text-gray-700 mb-1">
                                {t('credentials.privatekey_label')}
                            </label>
                            <input
                                id="privatekey-input"
                                type="file"
                                accept=".key,.pem"
                                onChange={(e) => setPrivateKeyFile(e.target.files[0])}
                                required
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={uploading}
                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    {t('credentials.uploading')}
                                </>
                            ) : (
                                <>
                                    <Upload className="h-5 w-5" />
                                    {t('credentials.upload_btn')}
                                </>
                            )}
                        </button>
                    </form>
                </div>
            )}

            {/* Help Card */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">{t('credentials.help_title')}</h3>
                <ol className="space-y-2 text-sm text-blue-800 list-decimal list-inside">
                    <li>{t('credentials.help_1')}</li>
                    <li>{t('credentials.help_2')}</li>
                    <li>{t('credentials.help_3')}</li>
                    <li>{t('credentials.help_4')}</li>
                    <li>{t('credentials.help_5')}</li>
                    <li>{t('credentials.help_6')}</li>
                </ol>
            </div>

            {/* Delete Confirmation Dialog */}
            {showDeleteDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('credentials.delete_confirm_title')}</h3>
                        <p className="text-sm text-gray-600 mb-6">
                            {t('credentials.delete_confirm_msg')}
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowDeleteDialog(false)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                {t('credentials.delete_cancel')}
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                {t('credentials.delete_confirm')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CredentialsManagement;
