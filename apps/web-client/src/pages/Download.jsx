import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download as DownloadIcon, Smartphone, Shield, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Download = () => {
    const { t } = useTranslation();
    const downloadUrl = "https://hostshield.org/downloads/hostshield.apk";

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">{t('nav.download')}</h1>
                <p className="text-slate-600 mt-2">
                    Get the HostShield mobile app for Android to manage guests on the go.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Download Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex flex-col items-center text-center space-y-6">
                        <div className="bg-blue-50 p-4 rounded-full">
                            <Smartphone className="w-12 h-12 text-blue-600" />
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Android App</h2>
                            <p className="text-slate-500 mt-1">Version 1.0.0 • APK File</p>
                        </div>

                        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                            <QRCodeSVG value={downloadUrl} size={160} />
                            <p className="text-xs text-slate-400 mt-2">Scan to Download</p>
                        </div>

                        <a
                            href="/downloads/hostshield.apk"
                            download
                            className="flex items-center justify-center w-full px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition space-x-2 font-medium"
                        >
                            <DownloadIcon className="w-5 h-5" />
                            <span>Download APK</span>
                        </a>
                    </div>
                </div>

                {/* Instructions Card */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                            <Shield className="w-5 h-5 mr-2 text-emerald-500" />
                            Installation Instructions
                        </h3>
                        <ol className="space-y-4 list-decimal list-inside text-slate-600 text-sm">
                            <li className="pl-2">Download the <strong>APK file</strong> to your Android device.</li>
                            <li className="pl-2">Open the downloaded file from your notifications or file manager.</li>
                            <li className="pl-2">If prompted, allow installation from <strong>Unknown Sources</strong> in your settings.</li>
                            <li className="pl-2">Tap <strong>Install</strong> and open the app.</li>
                        </ol>
                    </div>

                    <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200">
                        <h3 className="text-lg font-bold text-amber-900 mb-2 flex items-center">
                            <AlertTriangle className="w-5 h-5 mr-2" />
                            Security Note
                        </h3>
                        <p className="text-amber-800 text-sm">
                            Since this app is distributed directly (not via Play Store), your phone may warn you about installing from unknown sources. This is normal for direct downloads.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Download;
