import React from 'react';
import { Camera, FileCheck, Brain, Lock, TrendingUp, Clock, Euro, CheckCircle, XCircle, Smartphone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import OCRDemoAnimation from '../../components/marketing/OCRDemoAnimation';
import ComplianceDemoAnimation from '../../components/marketing/ComplianceDemoAnimation';

const Product = () => {
    const { t } = useTranslation();

    return (
        <div className="">
            {/* Product Hero */}
            <section className="relative py-20 text-white overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="/product-hero-bg.png"
                        alt=""
                        className="w-full h-full object-cover opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 to-slate-900/30"></div>
                </div>
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold font-display mb-6 text-white">{t('marketing.product.hero_title')}</h1>
                    <p className="max-w-3xl mx-auto text-xl text-slate-200">
                        {t('marketing.product.hero_subtitle')}
                    </p>
                </div>
            </section>

            {/* Deep Dives */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-32">

                    {/* OCR */}
                    <div className="flex flex-col md:flex-row items-center gap-16">
                        <div className="md:w-1/2">
                            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
                                <Camera className="w-8 h-8" />
                            </div>
                            <h2 className="text-3xl font-bold mb-4 text-slate-900">{t('marketing.product.ocr_title')}</h2>
                            <p className="text-lg text-slate-600 leading-relaxed mb-6">
                                {t('marketing.product.ocr_desc_1')}
                            </p>
                            <ul className="grid grid-cols-2 gap-4">
                                {(t('marketing.product.ocr_list', { returnObjects: true }) || []).map(item => (
                                    <li key={item} className="flex items-center gap-2 text-slate-700 font-medium">
                                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="md:w-1/2 flex items-center justify-center relative min-h-[250px]">
                            {/* Background Glow */}
                            <div className="absolute inset-0 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>
                            <OCRDemoAnimation />
                        </div>
                    </div>

                    {/* Compliance */}
                    <div className="flex flex-col md:flex-row-reverse items-center gap-16">
                        <div className="md:w-1/2">
                            <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-600 mb-6">
                                <FileCheck className="w-8 h-8" />
                            </div>
                            <h2 className="text-3xl font-bold mb-4 text-slate-900">{t('marketing.product.comp_title')}</h2>
                            <p className="text-lg text-slate-600 leading-relaxed mb-4">
                                {t('marketing.product.comp_desc_1')}
                            </p>
                            <p className="text-lg text-slate-600 leading-relaxed">
                                {t('marketing.product.comp_desc_2')}
                            </p>
                        </div>
                        <div className="md:w-1/2 flex items-center justify-center relative min-h-[250px]">
                            {/* Background Glow */}
                            <div className="absolute inset-0 bg-teal-500/5 rounded-full blur-[100px] pointer-events-none"></div>
                            <ComplianceDemoAnimation />
                        </div>
                    </div>

                    {/* Privacy */}
                    <div className="flex flex-col md:flex-row items-center gap-16">
                        <div className="md:w-1/2">
                            <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center text-violet-600 mb-6">
                                <Lock className="w-8 h-8" />
                            </div>
                            <h2 className="text-3xl font-bold mb-4 text-slate-900">{t('marketing.product.priv_title')}</h2>
                            <p className="text-lg text-slate-600 leading-relaxed mb-6">
                                {t('marketing.product.priv_desc_1')}
                            </p>
                            <p className="text-lg text-slate-600 leading-relaxed">
                                {t('marketing.product.priv_desc_2')}
                            </p>
                        </div>
                        <div className="md:w-1/2 flex items-center justify-center p-8">
                            <div className="w-full max-w-[320px] mx-auto">
                                <img
                                    src="/security-architecture.png"
                                    alt="Security Architecture"
                                    className="w-full h-auto object-contain drop-shadow-2xl"
                                />
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* Mobile App Section */}
            <section className="py-24 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center gap-16">
                        {/* Left: Content */}
                        <div className="md:w-1/2">
                            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
                                <Smartphone className="w-8 h-8" />
                            </div>
                            <h2 className="text-4xl font-bold mb-4 text-slate-900">
                                {t('marketing.product.mobile_title') || 'HostShield Mobile App'}
                            </h2>
                            <p className="text-lg text-slate-600 leading-relaxed mb-6">
                                {t('marketing.product.mobile_desc') || 'Register guests on the go with our powerful mobile app. Scan passports, extract data, and submit to police - all from your smartphone.'}
                            </p>

                            {/* Features List */}
                            <ul className="space-y-4 mb-8">
                                {(t('marketing.product.mobile_features', { returnObjects: true }) || [
                                    'Instant passport scanning with camera',
                                    'Offline mode - sync when connected',
                                    'One-tap police submission',
                                    'Real-time guest status updates',
                                    'Available for iOS and Android'
                                ]).map((feature, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <CheckCircle className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <span className="text-slate-700 font-medium">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* Download Buttons */}
                            <a
                                href="/download"
                                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl font-bold text-lg"
                            >
                                <Smartphone className="w-6 h-6" />
                                <span>{t('nav.download') || 'Download App'}</span>
                            </a>

                            {/* Coming Soon Badge */}
                            <p className="mt-4 text-sm text-slate-500 italic">
                                {t('marketing.product.mobile_status') || '📱 Mobile app launching soon! Sign up to be notified.'}
                            </p>
                        </div>

                        {/* Right: Phone Mockup */}
                        <div className="md:w-1/2 flex items-center justify-center relative">
                            {/* Background Glow */}
                            <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>

                            {/* Phone Frame */}
                            <div className="relative z-10 w-[280px] h-[560px] bg-slate-900 rounded-[3rem] p-3 shadow-2xl">
                                {/* Screen */}
                                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-[2.5rem] overflow-hidden relative">
                                    {/* Notch */}
                                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl"></div>

                                    {/* App Screenshot Placeholder */}
                                    <div className="flex flex-col items-center justify-center h-full text-white p-6">
                                        <Smartphone className="w-20 h-20 mb-4 opacity-90" />
                                        <h3 className="text-xl font-bold mb-2">HostShield</h3>
                                        <p className="text-sm text-center opacity-80">
                                            {t('marketing.product.mobile_mockup') || 'Scan. Extract. Submit.'}
                                        </p>
                                        <div className="mt-8 space-y-3 w-full">
                                            <div className="h-12 bg-white/20 backdrop-blur rounded-xl"></div>
                                            <div className="h-12 bg-white/20 backdrop-blur rounded-xl"></div>
                                            <div className="h-12 bg-white/20 backdrop-blur rounded-xl"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ROI / Profitability Section */}
            <section className="py-24 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Section Header */}
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-6">
                            <TrendingUp className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-4xl font-bold mb-4 text-slate-900">
                            {t('marketing.product.roi_title') || 'Why HostShield Pays for Itself'}
                        </h2>
                        <p className="max-w-3xl mx-auto text-xl text-slate-600">
                            {t('marketing.product.roi_subtitle') || 'Stop wasting time and money on manual police reporting. See how much you can save.'}
                        </p>
                    </div>

                    {/* Comparison Cards */}
                    <div className="grid md:grid-cols-2 gap-8 mb-16">
                        {/* Manual Process Card */}
                        <div className="bg-white rounded-2xl shadow-lg border-2 border-red-200 p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                                    <XCircle className="w-6 h-6 text-red-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900">
                                    {t('marketing.product.roi_manual_title') || 'Manual Reporting'}
                                </h3>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="flex items-start gap-3">
                                    <Clock className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
                                    <div>
                                        <p className="font-semibold text-slate-900">
                                            {t('marketing.product.roi_manual_time') || '5-10 minutes per guest'}
                                        </p>
                                        <p className="text-sm text-slate-600">
                                            {t('marketing.product.roi_manual_time_desc') || 'Manual data entry, form filling, portal navigation'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Euro className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
                                    <div>
                                        <p className="font-semibold text-slate-900">
                                            {t('marketing.product.roi_manual_cost') || '€150-300/month in labor'}
                                        </p>
                                        <p className="text-sm text-slate-600">
                                            {t('marketing.product.roi_manual_cost_desc') || 'Based on 50-100 guests/month at €15/hour wage'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
                                    <div>
                                        <p className="font-semibold text-slate-900">
                                            {t('marketing.product.roi_manual_errors') || 'High error rate'}
                                        </p>
                                        <p className="text-sm text-slate-600">
                                            {t('marketing.product.roi_manual_errors_desc') || 'Typos, missing data, compliance risks'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-red-200">
                                <p className="text-3xl font-bold text-red-600">
                                    €150-300<span className="text-lg font-normal text-slate-600">/month</span>
                                </p>
                                <p className="text-sm text-slate-600 mt-1">
                                    {t('marketing.product.roi_manual_total') || 'Plus compliance risks and staff frustration'}
                                </p>
                            </div>
                        </div>

                        {/* HostShield Card */}
                        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-2xl border-2 border-green-400 p-8 text-white relative overflow-hidden">
                            {/* Decorative Elements */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                                        <CheckCircle className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold">
                                        {t('marketing.product.roi_hostshield_title') || 'With HostShield'}
                                    </h3>
                                </div>

                                <div className="space-y-4 mb-6">
                                    <div className="flex items-start gap-3">
                                        <Clock className="w-5 h-5 flex-shrink-0 mt-1" />
                                        <div>
                                            <p className="font-semibold">
                                                {t('marketing.product.roi_hostshield_time') || '30 seconds per guest'}
                                            </p>
                                            <p className="text-sm text-white/80">
                                                {t('marketing.product.roi_hostshield_time_desc') || 'Snap photo, auto-extract, one-click submit'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Euro className="w-5 h-5 flex-shrink-0 mt-1" />
                                        <div>
                                            <p className="font-semibold">
                                                {t('marketing.product.roi_hostshield_cost') || '€15/month flat rate'}
                                            </p>
                                            <p className="text-sm text-white/80">
                                                {t('marketing.product.roi_hostshield_cost_desc') || 'Unlimited guests, no hidden fees'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 flex-shrink-0 mt-1" />
                                        <div>
                                            <p className="font-semibold">
                                                {t('marketing.product.roi_hostshield_accuracy') || '99%+ accuracy'}
                                            </p>
                                            <p className="text-sm text-white/80">
                                                {t('marketing.product.roi_hostshield_accuracy_desc') || 'AI-powered OCR, automated validation'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-white/20">
                                    <p className="text-3xl font-bold">
                                        €15<span className="text-lg font-normal text-white/80">/month</span>
                                    </p>
                                    <p className="text-sm text-white/90 mt-1 font-medium">
                                        {t('marketing.product.roi_hostshield_total') || 'Save €78–285/month + compliance peace of mind'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Savings Calculator */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
                        <div className="text-center mb-8">
                            <h3 className="text-3xl font-bold text-slate-900 mb-3">
                                {t('marketing.product.roi_calculator_title') || 'Your Potential Savings'}
                            </h3>
                            <p className="text-lg text-slate-600">
                                {t('marketing.product.roi_calculator_subtitle') || 'Based on typical accommodation provider usage'}
                            </p>
                        </div>

                        {/* Time context strip */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8 text-sm">
                            <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-full">
                                <span className="text-red-500 font-bold">✗</span>
                                <span className="text-red-700 font-medium">Manual check-in: ~7 min per guest</span>
                            </div>
                            <span className="text-slate-400 font-bold text-lg hidden sm:block">→</span>
                            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full">
                                <span className="text-green-500 font-bold">✓</span>
                                <span className="text-green-700 font-medium">HostShield: ~30 sec per guest</span>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {/* 50 Guests/Month */}
                            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
                                <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">
                                    {t('marketing.product.roi_calc_small') || 'Small Property'}
                                </p>
                                <p className="text-4xl font-bold text-slate-900 mb-2">50</p>
                                <p className="text-sm text-slate-600 mb-4">
                                    {t('marketing.product.roi_calc_guests_month') || 'guests/month'}
                                </p>
                                <div className="pt-4 border-t border-blue-200 space-y-3">
                                    <div>
                                        <p className="text-2xl font-bold text-green-600 mb-0.5">€78</p>
                                        <p className="text-xs text-slate-500">{t('marketing.product.roi_calc_saved') || 'saved per month'}</p>
                                    </div>
                                    <div className="flex items-center justify-center gap-1.5 bg-blue-100 rounded-lg py-2 px-3">
                                        <span className="text-blue-600 text-lg">⏱</span>
                                        <p className="text-sm font-bold text-blue-700">~6 hrs</p>
                                        <p className="text-xs text-blue-600">saved / month</p>
                                    </div>
                                </div>
                            </div>

                            {/* 100 Guests/Month */}
                            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-400 relative">
                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                    {t('marketing.product.roi_calc_popular') || 'Most Popular'}
                                </div>
                                <p className="text-sm font-semibold text-green-600 uppercase tracking-wide mb-2">
                                    {t('marketing.product.roi_calc_medium') || 'Medium Property'}
                                </p>
                                <p className="text-4xl font-bold text-slate-900 mb-2">100</p>
                                <p className="text-sm text-slate-600 mb-4">
                                    {t('marketing.product.roi_calc_guests_month') || 'guests/month'}
                                </p>
                                <div className="pt-4 border-t border-green-200 space-y-3">
                                    <div>
                                        <p className="text-2xl font-bold text-green-600 mb-0.5">€142</p>
                                        <p className="text-xs text-slate-500">{t('marketing.product.roi_calc_saved') || 'saved per month'}</p>
                                    </div>
                                    <div className="flex items-center justify-center gap-1.5 bg-green-100 rounded-lg py-2 px-3">
                                        <span className="text-green-600 text-lg">⏱</span>
                                        <p className="text-sm font-bold text-green-700">~12 hrs</p>
                                        <p className="text-xs text-green-600">saved / month</p>
                                    </div>
                                </div>
                            </div>

                            {/* 200 Guests/Month */}
                            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200">
                                <p className="text-sm font-semibold text-purple-600 uppercase tracking-wide mb-2">
                                    {t('marketing.product.roi_calc_large') || 'Large Property'}
                                </p>
                                <p className="text-4xl font-bold text-slate-900 mb-2">200</p>
                                <p className="text-sm text-slate-600 mb-4">
                                    {t('marketing.product.roi_calc_guests_month') || 'guests/month'}
                                </p>
                                <div className="pt-4 border-t border-purple-200 space-y-3">
                                    <div>
                                        <p className="text-2xl font-bold text-green-600 mb-0.5">€285</p>
                                        <p className="text-xs text-slate-500">{t('marketing.product.roi_calc_saved') || 'saved per month'}</p>
                                    </div>
                                    <div className="flex items-center justify-center gap-1.5 bg-purple-100 rounded-lg py-2 px-3">
                                        <span className="text-purple-600 text-lg">⏱</span>
                                        <p className="text-sm font-bold text-purple-700">~23 hrs</p>
                                        <p className="text-xs text-purple-600">saved / month</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Additional Benefits */}
                        <div className="mt-12 grid md:grid-cols-4 gap-6">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Clock className="w-6 h-6 text-blue-600" />
                                </div>
                                <p className="font-semibold text-slate-900 mb-1">
                                    {t('marketing.product.roi_benefit_time') || 'Save 90% Time'}
                                </p>
                                <p className="text-sm text-slate-600">
                                    {t('marketing.product.roi_benefit_time_desc') || 'Focus on guests, not paperwork'}
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Euro className="w-6 h-6 text-green-600" />
                                </div>
                                <p className="font-semibold text-slate-900 mb-1">
                                    {t('marketing.product.roi_benefit_cost') || 'Lower Costs'}
                                </p>
                                <p className="text-sm text-slate-600">
                                    {t('marketing.product.roi_benefit_cost_desc') || 'Reduce labor expenses'}
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <CheckCircle className="w-6 h-6 text-purple-600" />
                                </div>
                                <p className="font-semibold text-slate-900 mb-1">
                                    {t('marketing.product.roi_benefit_compliance') || 'Zero Compliance Risk'}
                                </p>
                                <p className="text-sm text-slate-600">
                                    {t('marketing.product.roi_benefit_compliance_desc') || 'Avoid fines and penalties'}
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <TrendingUp className="w-6 h-6 text-orange-600" />
                                </div>
                                <p className="font-semibold text-slate-900 mb-1">
                                    {t('marketing.product.roi_benefit_growth') || 'Scale Easily'}
                                </p>
                                <p className="text-sm text-slate-600">
                                    {t('marketing.product.roi_benefit_growth_desc') || 'Grow without hiring'}
                                </p>
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="mt-12 text-center">
                            <a
                                href="/register"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl font-semibold text-lg"
                            >
                                {t('marketing.product.roi_cta') || 'Start Saving Today'}
                                <TrendingUp className="w-5 h-5" />
                            </a>
                            <p className="text-sm text-slate-600 mt-3">
                                {t('marketing.product.roi_cta_desc') || 'No credit card required • 14-day free trial'}
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Product;
