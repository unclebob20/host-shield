import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../lib/api';
import { CreditCard, Check, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SubscriptionManagement = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // This should ideally come from an environment variable or config
    // In a real app, you might fetch available plans from the backend
    const STRIPE_PRICE_IDS = {
        professional: 'price_1QjXXXXXX', // Replace with real ID
        business: 'price_1QjYYYYYY'    // Replace with real ID
    };

    const handleSubscribe = async (planKey, priceId) => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.post('/payments/create-checkout-session', {
                priceId: priceId
            });

            if (response.data.url) {
                window.location.href = response.data.url;
            } else {
                throw new Error('No checkout URL received');
            }
        } catch (err) {
            console.error(err);
            setError(t('subscription.checkout_error') || 'Failed to start checkout process');
        } finally {
            setLoading(false);
        }
    };

    const isSubscribed = user?.subscription_status === 'active';
    // Simplified checks - in real app check specific plan
    const currentPlan = user?.subscription_plan || 'free';

    if (isSubscribed) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-green-200 p-6">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <Check className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            {t('subscription.active_title') || 'Subscription Active'}
                        </h2>
                        <p className="text-green-700">
                            {t('subscription.active_desc') || 'You are currently subscribed to the Professional Plan.'}
                        </p>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-500">{t('subscription.valid_until') || 'Valid Until'}</p>
                        <p className="font-medium text-gray-900">
                            {user?.subscription_valid_until
                                ? new Date(user.subscription_valid_until).toLocaleDateString()
                                : 'N/A'}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">{t('subscription.status') || 'Status'}</p>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {user?.subscription_status}
                        </span>
                    </div>
                </div>

                {/* Manage Subscription Button (Portal) could go here */}
                <div className="mt-6">
                    <button className="text-sm text-blue-600 hover:text-blue-500 font-medium">
                        {t('subscription.manage_billing') || 'Manage Billing & Invoices'}
                    </button>
                    <p className="text-xs text-gray-500 mt-1">
                        {t('subscription.manage_desc') || 'Cancel or update your payment details via Stripe.'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="text-center md:text-left">
                <h2 className="text-xl font-semibold text-gray-900">
                    {t('subscription.upgrade_title') || 'Upgrade your Plan'}
                </h2>
                <p className="text-gray-600 mt-1">
                    {t('subscription.upgrade_subtitle') || 'Unlock advanced features for your compliance needs.'}
                </p>
            </div>

            {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
                {/* Professional Plan */}
                <div className="border border-blue-200 rounded-2xl p-6 bg-white shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                        POPULAR
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Professional</h3>
                    <div className="mt-2 flex items-baseline">
                        <span className="text-3xl font-bold text-gray-900">€15</span>
                        <span className="text-gray-500 ml-1">/month</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Perfect for most hosts with 1-5 properties.</p>

                    <ul className="mt-4 space-y-2">
                        <li className="flex items-center gap-2 text-sm text-gray-700">
                            <Check className="w-4 h-4 text-green-500" /> 5 Properties
                        </li>
                        <li className="flex items-center gap-2 text-sm text-gray-700">
                            <Check className="w-4 h-4 text-green-500" /> Unlimited Scans
                        </li>
                        <li className="flex items-center gap-2 text-sm text-gray-700">
                            <Check className="w-4 h-4 text-green-500" /> Priority Support
                        </li>
                    </ul>

                    <button
                        onClick={() => handleSubscribe('professional', STRIPE_PRICE_IDS.professional)}
                        disabled={loading}
                        className="mt-6 w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                        Subscribe Now
                    </button>
                </div>

                {/* Business Plan */}
                <div className="border border-gray-200 rounded-2xl p-6 bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-900">Business</h3>
                    <div className="mt-2 flex items-baseline">
                        <span className="text-3xl font-bold text-gray-900">€49</span>
                        <span className="text-gray-500 ml-1">/month</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">For agencies and large scale operations.</p>

                    <ul className="mt-4 space-y-2">
                        <li className="flex items-center gap-2 text-sm text-gray-700">
                            <Check className="w-4 h-4 text-green-500" /> Unlimited Properties
                        </li>
                        <li className="flex items-center gap-2 text-sm text-gray-700">
                            <Check className="w-4 h-4 text-green-500" /> API Access
                        </li>
                        <li className="flex items-center gap-2 text-sm text-gray-700">
                            <Check className="w-4 h-4 text-green-500" /> Dedicated Manager
                        </li>
                    </ul>

                    <button
                        onClick={() => handleSubscribe('business', STRIPE_PRICE_IDS.business)}
                        disabled={loading}
                        className="mt-6 w-full py-2.5 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-900 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                        Contact Sales / Subscribe
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionManagement;
