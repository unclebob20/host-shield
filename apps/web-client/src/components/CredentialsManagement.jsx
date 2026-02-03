import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    TextField,
    Alert,
    CircularProgress,
    Chip,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    Upload as UploadIcon,
    Delete as DeleteIcon,
    VerifiedUser as VerifiedUserIcon,
} from '@mui/icons-material';
import api from '../services/api';

const CredentialsManagement = () => {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Upload form state
    const [ico, setIco] = useState('');
    const [apiSubject, setApiSubject] = useState('');
    const [keystoreFile, setKeystoreFile] = useState(null);
    const [privateKeyFile, setPrivateKeyFile] = useState(null);

    // Dialog state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const hostId = localStorage.getItem('hostId'); // Get from auth context

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/hosts/${hostId}/credentials/status`);
            setStatus(response.data.credentials);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch credential status');
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

            await api.post(`/hosts/${hostId}/credentials`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setSuccess('Credentials uploaded successfully! Please verify them.');
            setIco('');
            setApiSubject('');
            setKeystoreFile(null);
            setPrivateKeyFile(null);

            // Reset file inputs
            document.getElementById('keystore-input').value = '';
            document.getElementById('privatekey-input').value = '';

            await fetchStatus();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to upload credentials');
        } finally {
            setUploading(false);
        }
    };

    const handleVerify = async () => {
        try {
            setVerifying(true);
            setError(null);

            const response = await api.post(`/hosts/${hostId}/credentials/verify`);

            setSuccess(response.data.message);
            await fetchStatus();
        } catch (err) {
            setError(err.response?.data?.error || 'Verification failed');
        } finally {
            setVerifying(false);
        }
    };

    const handleDelete = async () => {
        try {
            setLoading(true);
            await api.delete(`/hosts/${hostId}/credentials`);

            setSuccess('Credentials deleted successfully');
            setDeleteDialogOpen(false);
            await fetchStatus();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to delete credentials');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !status) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 800, margin: '0 auto', p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Government Credentials
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
                Configure your Slovak eID credentials for police guest reporting
            </Typography>

            {error && (
                <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>
                    {success}
                </Alert>
            )}

            {/* Status Card */}
            {status?.configured && (
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                            <Typography variant="h6">Current Credentials</Typography>
                            {status.verified ? (
                                <Chip
                                    icon={<CheckCircleIcon />}
                                    label="Verified"
                                    color="success"
                                    size="small"
                                />
                            ) : (
                                <Chip
                                    icon={<ErrorIcon />}
                                    label="Not Verified"
                                    color="warning"
                                    size="small"
                                />
                            )}
                        </Stack>

                        <Stack spacing={1}>
                            <Typography variant="body2">
                                <strong>ICO:</strong> {status.ico}
                            </Typography>
                            <Typography variant="body2">
                                <strong>API Subject:</strong> {status.apiSubject}
                            </Typography>
                            {status.verifiedAt && (
                                <Typography variant="body2" color="text.secondary">
                                    Verified: {new Date(status.verifiedAt).toLocaleString()}
                                </Typography>
                            )}
                        </Stack>

                        <Stack direction="row" spacing={2} mt={3}>
                            {!status.verified && (
                                <Button
                                    variant="contained"
                                    startIcon={verifying ? <CircularProgress size={20} /> : <VerifiedUserIcon />}
                                    onClick={handleVerify}
                                    disabled={verifying}
                                >
                                    Verify Credentials
                                </Button>
                            )}
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={() => setDeleteDialogOpen(true)}
                            >
                                Delete Credentials
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>
            )}

            {/* Upload Form */}
            {!status?.configured && (
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Upload Credentials
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            Upload your Slovak eID credentials to enable police guest reporting
                        </Typography>

                        <Box component="form" onSubmit={handleUpload} sx={{ mt: 2 }}>
                            <Stack spacing={3}>
                                <TextField
                                    label="ICO Number"
                                    value={ico}
                                    onChange={(e) => setIco(e.target.value)}
                                    required
                                    fullWidth
                                    helperText="Your organization's ICO (identification number)"
                                />

                                <TextField
                                    label="API Subject"
                                    value={apiSubject}
                                    onChange={(e) => setApiSubject(e.target.value)}
                                    required
                                    fullWidth
                                    helperText="Usually the same as your ICO"
                                />

                                <Box>
                                    <Typography variant="body2" gutterBottom>
                                        Keystore File (.keystore, .jks)
                                    </Typography>
                                    <input
                                        id="keystore-input"
                                        type="file"
                                        accept=".keystore,.jks"
                                        onChange={(e) => setKeystoreFile(e.target.files[0])}
                                        required
                                    />
                                </Box>

                                <Box>
                                    <Typography variant="body2" gutterBottom>
                                        Private Key File (.key, .pem)
                                    </Typography>
                                    <input
                                        id="privatekey-input"
                                        type="file"
                                        accept=".key,.pem"
                                        onChange={(e) => setPrivateKeyFile(e.target.files[0])}
                                        required
                                    />
                                </Box>

                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    startIcon={uploading ? <CircularProgress size={20} /> : <UploadIcon />}
                                    disabled={uploading}
                                >
                                    Upload Credentials
                                </Button>
                            </Stack>
                        </Box>
                    </CardContent>
                </Card>
            )}

            {/* Help Card */}
            <Card sx={{ mt: 3, bgcolor: 'info.light' }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        How to Get Credentials
                    </Typography>
                    <Typography variant="body2" component="div">
                        <ol>
                            <li>Obtain eID credentials from a Slovak certificate authority (Disig, eIDAS Bridge, etc.)</li>
                            <li>Your ICO number is your organization's identification number</li>
                            <li>The keystore file contains your public certificate</li>
                            <li>The private key file is used to sign authentication tokens</li>
                            <li>After uploading, verify your credentials to enable guest submissions</li>
                        </ol>
                    </Typography>
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Delete Credentials?</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete your government credentials?
                        You will not be able to submit guests to the police until you upload new credentials.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleDelete} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CredentialsManagement;
