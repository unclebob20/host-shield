import React from 'react';
import CredentialsManagement from '../components/CredentialsManagement';

const Credentials = () => {
    return (
        <div className="p-6">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Government API Credentials</h1>
                    <p className="mt-2 text-gray-600">
                        Manage your Slovak government API credentials for automated guest registration
                    </p>
                </div>

                <CredentialsManagement />
            </div>
        </div>
    );
};

export default Credentials;
