import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    Shield,
    FileText,
    Key,
    CheckCircle,
    AlertCircle,
    ExternalLink,
    Download,
    Building2,
    Lock,
    HelpCircle
} from 'lucide-react';

const Help = () => {
    const { t } = useTranslation();

    return (
        <div className="p-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {t('help.title') || 'Help & Support'}
                    </h1>
                    <p className="text-lg text-gray-600">
                        {t('help.subtitle') || 'Complete guide to setting up government credentials for automated guest reporting'}
                    </p>
                </div>

                {/* Alert Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-lg font-semibold text-blue-900 mb-2">
                                {t('help.important_title') || 'Important Information'}
                            </h3>
                            <p className="text-blue-800">
                                {t('help.important_desc') || 'To use HostShield\'s automated guest reporting to Slovak police, you need valid eID credentials from a Slovak certification authority. This is a legal requirement for electronic communication with government systems.'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* What You Need Section */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <HelpCircle className="h-6 w-6 text-blue-600" />
                        {t('help.what_you_need') || 'What You Need'}
                    </h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Building2 className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">
                                        {t('help.ico_title') || 'IČO (Company ID)'}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {t('help.ico_desc') || 'Your 8-digit Slovak company identification number (Identifikačné číslo organizácie). This is assigned when you register your business.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <Shield className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">
                                        {t('help.eid_title') || 'eID Certificate'}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {t('help.eid_desc') || 'A qualified electronic certificate from a Slovak certification authority (Disig, eIDAS Bridge, etc.) for legal entities.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <FileText className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">
                                        {t('help.keystore_title') || 'Keystore File'}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {t('help.keystore_desc') || 'A .keystore or .jks file containing your public certificate. Usually provided by your certification authority.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <Key className="h-6 w-6 text-orange-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">
                                        {t('help.privatekey_title') || 'Private Key File'}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {t('help.privatekey_desc') || 'A .key or .pem file containing your private key for signing authentication tokens. Keep this secure!'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Step-by-Step Guide */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        {t('help.step_by_step') || 'Step-by-Step Guide'}
                    </h2>

                    <div className="space-y-6">
                        {/* Step 1 */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                                    1
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                        {t('help.step1_title') || 'Obtain eID Certificate from Certification Authority'}
                                    </h3>
                                    <p className="text-gray-600 mb-4">
                                        {t('help.step1_desc') || 'You need to obtain a qualified electronic certificate from an accredited Slovak certification authority. The most common providers are:'}
                                    </p>

                                    <div className="space-y-3 mb-4">
                                        <a
                                            href="https://www.disig.sk/en/ca/certificates-for-legal-entities"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                            <span className="font-medium">Disig, a.s.</span>
                                            <span className="text-sm text-gray-500">(Most popular)</span>
                                        </a>
                                        <a
                                            href="https://www.slovensko.sk/sk/titulna-stranka"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                            <span className="font-medium">slovensko.sk</span>
                                            <span className="text-sm text-gray-500">(Government portal)</span>
                                        </a>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-900 mb-2">
                                            {t('help.step1_process') || 'Typical Process:'}
                                        </h4>
                                        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                                            <li>{t('help.step1_1') || 'Generate a certificate request on your computer'}</li>
                                            <li>{t('help.step1_2') || 'Submit the request to the registration authority'}</li>
                                            <li>{t('help.step1_3') || 'Schedule an appointment with the registration authority'}</li>
                                            <li>{t('help.step1_4') || 'Visit in person with company documents (Business Register extract, ID)'}</li>
                                            <li>{t('help.step1_5') || 'Pay the fee (typically €30-100 per year)'}</li>
                                            <li>{t('help.step1_6') || 'Receive your certificate files (keystore and private key)'}</li>
                                        </ol>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                                    2
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                        {t('help.step2_title') || 'Prepare Your Certificate Files'}
                                    </h3>
                                    <p className="text-gray-600 mb-4">
                                        {t('help.step2_desc') || 'After receiving your certificate, you should have two files:'}
                                    </p>

                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
                                            <FileText className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-medium text-gray-900">Keystore file (.keystore or .jks)</p>
                                                <p className="text-sm text-gray-600">Contains your public certificate</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
                                            <Key className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-medium text-gray-900">Private key file (.key or .pem)</p>
                                                <p className="text-sm text-gray-600">Your secret key for signing - keep this secure!</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <div className="flex items-start gap-2">
                                            <Lock className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-semibold text-yellow-900 mb-1">
                                                    {t('help.security_warning') || 'Security Warning'}
                                                </p>
                                                <p className="text-sm text-yellow-800">
                                                    {t('help.security_desc') || 'Never share your private key file with anyone. HostShield encrypts it using AES-256-GCM encryption before storing it.'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                                    3
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                        {t('help.step3_title') || 'Upload to HostShield'}
                                    </h3>
                                    <p className="text-gray-600 mb-4">
                                        {t('help.step3_desc') || 'Once you have your certificate files, upload them to HostShield:'}
                                    </p>

                                    <ol className="list-decimal list-inside space-y-2 text-gray-700 mb-4">
                                        <li>{t('help.step3_1') || 'Go to Settings → Government Credentials tab'}</li>
                                        <li>{t('help.step3_2') || 'Enter your IČO (company identification number)'}</li>
                                        <li>{t('help.step3_3') || 'Enter API Subject (usually the same as your IČO)'}</li>
                                        <li>{t('help.step3_4') || 'Upload your keystore file (.keystore or .jks)'}</li>
                                        <li>{t('help.step3_5') || 'Upload your private key file (.key or .pem)'}</li>
                                        <li>{t('help.step3_6') || 'Click "Upload Credentials"'}</li>
                                    </ol>

                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <div className="flex items-start gap-2">
                                            <Shield className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-semibold text-green-900 mb-1">
                                                    {t('help.encryption_title') || 'Encryption at Rest'}
                                                </p>
                                                <p className="text-sm text-green-800">
                                                    {t('help.encryption_desc') || 'Your credentials are immediately encrypted using AES-256-GCM encryption and stored securely. Only your server can decrypt them.'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 4 */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                                    4
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                        {t('help.step4_title') || 'Verify Your Credentials'}
                                    </h3>
                                    <p className="text-gray-600 mb-4">
                                        {t('help.step4_desc') || 'After uploading, you must verify your credentials to ensure they work correctly:'}
                                    </p>

                                    <ol className="list-decimal list-inside space-y-2 text-gray-700 mb-4">
                                        <li>{t('help.step4_1') || 'Click the "Verify Credentials" button'}</li>
                                        <li>{t('help.step4_2') || 'HostShield will test authentication with the government API'}</li>
                                        <li>{t('help.step4_3') || 'If successful, you\'ll see a "Verified" badge'}</li>
                                        <li>{t('help.step4_4') || 'You can now submit guests to the police automatically'}</li>
                                    </ol>

                                    <div className="bg-blue-50 rounded-lg p-4">
                                        <p className="text-sm text-blue-800">
                                            <strong>{t('help.step4_note') || 'Note:'}  </strong>
                                            {t('help.step4_note_desc') || 'Verification may take a few seconds as it connects to the government API. If verification fails, check that your certificate is valid and not expired.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Troubleshooting */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        {t('help.troubleshooting') || 'Troubleshooting'}
                    </h2>

                    <div className="space-y-4">
                        <details className="bg-white rounded-lg border border-gray-200">
                            <summary className="px-6 py-4 cursor-pointer font-semibold text-gray-900 hover:bg-gray-50">
                                {t('help.trouble1_q') || 'Verification fails - "Invalid certificate"'}
                            </summary>
                            <div className="px-6 pb-4 text-gray-600">
                                <ul className="list-disc list-inside space-y-2">
                                    <li>{t('help.trouble1_a1') || 'Check that your certificate is not expired'}</li>
                                    <li>{t('help.trouble1_a2') || 'Ensure you uploaded the correct keystore and private key files'}</li>
                                    <li>{t('help.trouble1_a3') || 'Verify your IČO is correct (8 digits)'}</li>
                                    <li>{t('help.trouble1_a4') || 'Contact your certification authority if the issue persists'}</li>
                                </ul>
                            </div>
                        </details>

                        <details className="bg-white rounded-lg border border-gray-200">
                            <summary className="px-6 py-4 cursor-pointer font-semibold text-gray-900 hover:bg-gray-50">
                                {t('help.trouble2_q') || 'Upload fails - "Invalid file format"'}
                            </summary>
                            <div className="px-6 pb-4 text-gray-600">
                                <ul className="list-disc list-inside space-y-2">
                                    <li>{t('help.trouble2_a1') || 'Keystore must be .keystore or .jks format'}</li>
                                    <li>{t('help.trouble2_a2') || 'Private key must be .key or .pem format'}</li>
                                    <li>{t('help.trouble2_a3') || 'Files must not be corrupted or password-protected'}</li>
                                </ul>
                            </div>
                        </details>

                        <details className="bg-white rounded-lg border border-gray-200">
                            <summary className="px-6 py-4 cursor-pointer font-semibold text-gray-900 hover:bg-gray-50">
                                {t('help.trouble3_q') || 'Where do I find my IČO?'}
                            </summary>
                            <div className="px-6 pb-4 text-gray-600">
                                <p className="mb-2">
                                    {t('help.trouble3_a') || 'Your IČO (Identifikačné číslo organizácie) is your 8-digit company ID. You can find it:'}
                                </p>
                                <ul className="list-disc list-inside space-y-2">
                                    <li>{t('help.trouble3_a1') || 'On your Business Register extract (Výpis z Obchodného registra)'}</li>
                                    <li>{t('help.trouble3_a2') || 'On official company documents and invoices'}</li>
                                    <li>{t('help.trouble3_a3') || 'At orsr.sk (Business Register search)'}</li>
                                </ul>
                            </div>
                        </details>
                    </div>
                </section>

                {/* Additional Resources */}
                <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        {t('help.resources') || 'Additional Resources'}
                    </h2>

                    <div className="grid md:grid-cols-2 gap-4">
                        <a
                            href="https://www.disig.sk/en/ca/certificates-for-legal-entities"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 hover:shadow-md transition-all"
                        >
                            <ExternalLink className="h-5 w-5 text-blue-600 flex-shrink-0" />
                            <div>
                                <p className="font-semibold text-gray-900">Disig Certificates</p>
                                <p className="text-sm text-gray-600">Official certificate provider</p>
                            </div>
                        </a>

                        <a
                            href="https://www.slovensko.sk"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 hover:shadow-md transition-all"
                        >
                            <ExternalLink className="h-5 w-5 text-blue-600 flex-shrink-0" />
                            <div>
                                <p className="font-semibold text-gray-900">slovensko.sk</p>
                                <p className="text-sm text-gray-600">Government portal</p>
                            </div>
                        </a>

                        <a
                            href="https://www.orsr.sk"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 hover:shadow-md transition-all"
                        >
                            <ExternalLink className="h-5 w-5 text-blue-600 flex-shrink-0" />
                            <div>
                                <p className="font-semibold text-gray-900">Business Register</p>
                                <p className="text-sm text-gray-600">Find your IČO</p>
                            </div>
                        </a>

                        <a
                            href="https://www.minv.sk"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 hover:shadow-md transition-all"
                        >
                            <ExternalLink className="h-5 w-5 text-blue-600 flex-shrink-0" />
                            <div>
                                <p className="font-semibold text-gray-900">Ministry of Interior</p>
                                <p className="text-sm text-gray-600">Police reporting info</p>
                            </div>
                        </a>
                    </div>
                </section>

                {/* Contact Support */}
                <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-8 text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        {t('help.need_help') || 'Still Need Help?'}
                    </h3>
                    <p className="text-gray-600 mb-6">
                        {t('help.contact_desc') || 'Our support team is here to help you get set up with your credentials.'}
                    </p>
                    <a
                        href="mailto:support@hostshield.sk"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        <span>{t('help.contact_button') || 'Contact Support'}</span>
                        <ExternalLink className="h-4 w-4" />
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Help;
