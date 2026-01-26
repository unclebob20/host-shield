import React, { useState, useRef } from 'react';
import { Upload, Camera, Loader2, FileText, AlertCircle } from 'lucide-react';
import api from '../lib/api';

const Scanner = ({ onScanComplete }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            processFile(files[0]);
        }
    };

    const handleFileSelect = (e) => {
        const files = e.target.files;
        if (files.length > 0) {
            processFile(files[0]);
        }
    };

    const processFile = async (file) => {
        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (!validTypes.includes(file.type)) {
            setError('Please upload a valid image (JPEG, PNG) or PDF.');
            return;
        }

        // Validate file size (5MB limit)
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
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
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

    return (
        <div className="w-full">
            <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragging
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {isScanning ? (
                    <div className="flex flex-col items-center py-8">
                        <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">Scanning Document...</h3>
                        <p className="text-sm text-gray-500 mt-2">Extracting data from your file</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <div className="flex space-x-4 mb-4">
                            <div className="p-3 bg-blue-100 rounded-full">
                                <Upload className="h-8 w-8 text-blue-600" />
                            </div>
                            {/* Camera support would be added here in a future iteration */}
                            {/* <div className="p-3 bg-green-100 rounded-full">
                                <Camera className="h-8 w-8 text-green-600" />
                            </div> */}
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">Upload Passport or ID</h3>
                        <p className="text-sm text-gray-500 mt-2 mb-6">
                            Drag and drop your file here, or click to browse
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
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <FileText className="mr-2 h-4 w-4" />
                            Select File
                        </button>
                    </div>
                )}
            </div>

            {error && (
                <div className="mt-4 p-4 bg-red-50 rounded-md flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}
        </div>
    );
};

export default Scanner;
