import React, { useState, useRef } from 'react';
import { Upload, Loader2, FileText, AlertCircle, RefreshCw, Printer } from 'lucide-react';
import api from '../lib/api';

const Scanner = ({ onScanComplete }) => {
    const [activeTab, setActiveTab] = useState('upload'); // upload, device
    const [isDragging, setIsDragging] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState(null);

    // Device Scanning State
    const [availableDevices, setAvailableDevices] = useState([]);
    const [selectedDevice, setSelectedDevice] = useState('');
    const [isSearchingDevices, setIsSearchingDevices] = useState(false);

    const fileInputRef = useRef(null);

    // --- Device (TWAIN/Scanner) Logic ---
    const searchForDevices = async () => {
        setIsSearchingDevices(true);
        setError(null);
        setAvailableDevices([]);

        // SIMULATION: In a real app, this would call a local service (localhost:port) 
        // that bridges the browser to the OS TWAIN/WIA drivers.
        // e.g. await axios.get('http://localhost:11111/api/scanners')

        try {
            await new Promise(resolve => setTimeout(resolve, 1500)); // Fake delay

            // Mock result - uncomment to test UI with devices
            // setAvailableDevices([
            //     { id: '1', name: 'Epson Perfection V600' },
            //     { id: '2', name: 'Canon LiDE 400' }
            // ]);

            // Real-world default: No service found
            throw new Error("Scanner service not detected.");

        } catch (err) {
            setError(
                <span>
                    System scanner service not detected. To scan directly from a hardware scanner,
                    ensure your local scanning bridge (e.g., TWAIN Web Service) is running.
                    <br /><span className="text-xs opacity-75 mt-1 block">Browser security prevents direct hardware access without a local bridge.</span>
                </span>
            );
        } finally {
            setIsSearchingDevices(false);
        }
    };

    const scanFromDevice = async () => {
        if (!selectedDevice) return;
        setIsScanning(true);
        setError(null);

        try {
            // SIMULATION: standard flow for a local scanner service
            await new Promise(resolve => setTimeout(resolve, 3000));
            // In a real implementation:
            // const imageBlob = await api.post('http://localhost:11111/scan', { device: selectedDevice });
            // processFile(new File([imageBlob], "scan.jpg", { type: "image/jpeg" }));

            throw new Error("Connection to scanner lost during transfer.");
        } catch (err) {
            setError(err.message || "Failed to acquire image from device.");
        } finally {
            setIsScanning(false);
        }
    };


    // --- File Processing ---
    const handleDragOver = (e) => {
        e.preventDefault();
        if (activeTab === 'upload') {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        if (activeTab === 'upload') {
            setIsDragging(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        if (activeTab === 'upload') {
            setIsDragging(false);
            const files = e.dataTransfer.files;
            if (files.length > 0) processFile(files[0]);
        }
    };

    const handleFileSelect = (e) => {
        const files = e.target.files;
        if (files.length > 0) processFile(files[0]);
    };

    const processFile = async (file) => {
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (!validTypes.includes(file.type)) {
            setError('Please upload a valid image (JPEG, PNG) or PDF.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError('File size must be less than 5MB.');
            return;
        }

        setIsScanning(true);
        setError(null);

        const formData = new FormData();
        formData.append('document', file);

        try {
            const response = await api.post('/ocr/scan', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.data.success) {
                onScanComplete(response.data.data, file);
            } else {
                setError(response.data.error || 'Failed to scan document.');
            }
        } catch (err) {
            console.error('OCR Error:', err);
            setError(err.response?.data?.error || 'Error connecting to scanning service.');
        } finally {
            setIsScanning(false);
        }
    };

    // --- Renderers ---
    const renderContent = () => {
        if (isScanning && !isSearchingDevices) {
            return (
                <div className="flex flex-col items-center py-12">
                    <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">Processing Document...</h3>
                    <p className="text-sm text-gray-500 mt-2">Extracting data and verifying identity</p>
                </div>
            );
        }

        switch (activeTab) {
            case 'device':
                return (
                    <div className="flex flex-col items-center py-6 w-full max-w-md mx-auto">
                        <div className="p-4 bg-purple-50 rounded-full mb-4">
                            <Printer className="h-10 w-10 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">System Scanner</h3>
                        <p className="text-sm text-gray-500 mt-2 mb-6 text-center">
                            Connect to a USB/Network scanner via local bridge.
                        </p>

                        {!availableDevices.length ? (
                            <div className="w-full text-center">
                                <button
                                    onClick={searchForDevices}
                                    disabled={isSearchingDevices}
                                    className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium shadow-sm flex items-center justify-center w-full disabled:opacity-70"
                                >
                                    {isSearchingDevices ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Searching...
                                        </>
                                    ) : (
                                        <>
                                            <RefreshCw className="w-4 h-4 mr-2" />
                                            Find Scanners
                                        </>
                                    )}
                                </button>
                                <p className="text-xs text-slate-400 mt-3 italic">
                                    Requires a TWAIN/WIA bridge service running on localhost.
                                </p>
                            </div>
                        ) : (
                            <div className="w-full space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Select Scanner</label>
                                    <select
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-sm"
                                        value={selectedDevice}
                                        onChange={(e) => setSelectedDevice(e.target.value)}
                                    >
                                        <option value="">Select a device...</option>
                                        {availableDevices.map(d => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    onClick={scanFromDevice}
                                    disabled={!selectedDevice}
                                    className="w-full px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium shadow-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Printer className="w-4 h-4 mr-2" />
                                    Scan Document
                                </button>
                            </div>
                        )}
                    </div>
                );

            case 'upload':
            default:
                return (
                    <div className="flex flex-col items-center py-8">
                        <div className="p-4 bg-blue-50 rounded-full mb-4">
                            <Upload className="h-10 w-10 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">Upload File</h3>
                        <p className="text-sm text-gray-500 mt-2 mb-6 text-center max-w-xs">
                            Drag & drop or select a PDF, JPG, or PNG file.
                        </p>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/jpeg,image/png,image/jpg,application/pdf"
                            onChange={handleFileSelect}
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm flex items-center"
                        >
                            <FileText className="w-4 h-4 mr-2" />
                            Select File
                        </button>
                    </div>
                );
        }
    };

    return (
        <div className="w-full flex flex-col">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-0">
                <button
                    onClick={() => { setActiveTab('upload'); setError(null); }}
                    className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors ${activeTab === 'upload' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                >
                    <div className="flex items-center justify-center gap-2">
                        <Upload className="w-4 h-4" />
                        <span>Upload</span>
                    </div>
                </button>
                <button
                    onClick={() => { setActiveTab('device'); setError(null); }}
                    className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors ${activeTab === 'device' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                >
                    <div className="flex items-center justify-center gap-2">
                        <Printer className="w-4 h-4" />
                        <span>Scanner</span>
                    </div>
                </button>
            </div>

            {/* Main Area */}
            <div
                className={`flex-1 min-h-[300px] flex items-center justify-center bg-gray-50/50 rounded-b-lg border-x border-b border-gray-200 transition-colors ${isDragging && activeTab === 'upload' ? 'bg-blue-50 border-blue-300' : ''
                    }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {renderContent()}
            </div>

            {/* Error Message */}
            {error && (
                <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-100 flex items-start animate-fade-in shadow-sm">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                    <p className="text-sm text-red-700 leading-snug">{error}</p>
                </div>
            )}
        </div>
    );
};

export default Scanner;
