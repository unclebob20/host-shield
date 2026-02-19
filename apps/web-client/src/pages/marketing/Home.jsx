import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Scan, FileText, Smartphone, CheckCircle, ChevronDown, AlertTriangle, ChevronUp, Euro, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Home = () => {
    const { t } = useTranslation();
    const [faqOpen, setFaqOpen] = useState(null);

    const faqs = [
        { q: t('marketing.home.faq_1_q'), a: t('marketing.home.faq_1_a') },
        { q: t('marketing.home.faq_2_q'), a: t('marketing.home.faq_2_a') },
        { q: t('marketing.home.faq_3_q'), a: t('marketing.home.faq_3_a') },
    ];

    return (
        <div className="overflow-hidden">
            {/* Hero Section */}
            <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-40 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-700 mb-8 font-display">
                        {t('marketing.home.hero_title_1')} <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">
                            {t('marketing.home.hero_title_2')}
                        </span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-xl text-slate-500 mb-10 leading-relaxed">
                        {t('marketing.home.hero_subtitle')}
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link
                            to="/register"
                            className="px-8 py-4 text-lg font-semibold text-white bg-primary hover:bg-blue-700 rounded-full transition-all shadow-lg hover:shadow-blue-200 hover:-translate-y-1"
                        >
                            {t('marketing.home.cta_primary')}
                        </Link>
                        <Link
                            to="/product"
                            className="px-8 py-4 text-lg font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-full transition-all hover:-translate-y-1"
                        >
                            {t('marketing.home.cta_secondary')}
                        </Link>
                    </div>

                    {/* Scroll Down Indicator */}
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                        <button
                            onClick={() => {
                                const featuresSection = document.querySelector('section:nth-of-type(2)');
                                featuresSection?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="flex flex-col items-center gap-2 text-slate-400 hover:text-blue-500 transition-colors group"
                            aria-label="Scroll down"
                        >
                            <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                {t('marketing.home.scroll_down') || 'Scroll Down'}
                            </span>
                            <div className="w-8 h-12 border-2 border-slate-300 rounded-full flex items-start justify-center p-2 group-hover:border-blue-500 transition-colors">
                                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full group-hover:bg-blue-500 transition-colors animate-scroll-down"></div>
                            </div>
                            <ChevronDown className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </section>

            {/* Feature Highlights */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-12 text-center">
                        <div className="p-8 rounded-3xl bg-slate-50 hover:bg-indigo-50/50 transition-colors">
                            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
                                <Scan className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-4">{t('marketing.home.feat_ocr_title')}</h3>
                            <p className="text-slate-600">
                                {t('marketing.home.feat_ocr_desc')}
                            </p>
                        </div>
                        <div className="p-8 rounded-3xl bg-slate-50 hover:bg-indigo-50/50 transition-colors">
                            <div className="w-16 h-16 mx-auto bg-teal-100 rounded-2xl flex items-center justify-center text-teal-600 mb-6">
                                <FileText className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-4">{t('marketing.home.feat_police_title')}</h3>
                            <p className="text-slate-600">
                                {t('marketing.home.feat_police_desc')}
                            </p>
                        </div>
                        <div className="p-8 rounded-3xl bg-slate-50 hover:bg-indigo-50/50 transition-colors">
                            <div className="w-16 h-16 mx-auto bg-violet-100 rounded-2xl flex items-center justify-center text-violet-600 mb-6">
                                <Shield className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-4">{t('marketing.home.feat_sec_title')}</h3>
                            <p className="text-slate-600">
                                {t('marketing.home.feat_sec_desc')}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* EU Regulation Urgency Section */}
            <section className="py-24 relative overflow-hidden">
                {/* Lighter warm background */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-rose-50 to-orange-50 pointer-events-none" />
                {/* Decorative blobs */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-rose-200/40 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-200/40 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Badge */}
                    <div className="flex justify-center mb-6">
                        <span className="inline-flex items-center gap-2 bg-rose-100 border border-rose-300 text-rose-700 text-sm font-semibold px-4 py-1.5 rounded-full uppercase tracking-wide">
                            <AlertTriangle className="w-4 h-4" />
                            {t('marketing.home.urgency_section_badge')}
                        </span>
                    </div>

                    {/* Section title */}
                    <h2 className="text-3xl md:text-5xl font-bold text-slate-800 text-center mb-16 font-display max-w-4xl mx-auto leading-tight">
                        {t('marketing.home.urgency_section_title')}
                    </h2>

                    {/* Two-column urgency cards */}
                    <div className="grid md:grid-cols-2 gap-8 mb-16">
                        {/* Card 1: Fine risk */}
                        <div className="bg-white border border-rose-200 rounded-3xl p-8 shadow-lg hover:shadow-rose-100 hover:shadow-xl transition-shadow">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center">
                                    <Euro className="w-6 h-6 text-rose-500" />
                                </div>
                                <div>
                                    <p className="text-rose-500 text-xs font-bold uppercase tracking-widest">DAC7 Directive</p>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-4">
                                {t('marketing.home.urgency_fine_title')}
                            </h3>
                            <p className="text-slate-600 leading-relaxed text-sm">
                                {t('marketing.home.urgency_fine_body')}
                            </p>
                        </div>

                        {/* Card 2: Deadline */}
                        <div className="bg-white border border-orange-200 rounded-3xl p-8 shadow-lg hover:shadow-orange-100 hover:shadow-xl transition-shadow">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                                    <Clock className="w-6 h-6 text-orange-500" />
                                </div>
                                <div>
                                    <p className="text-orange-500 text-xs font-bold uppercase tracking-widest">
                                        EU Regulation 2024/1028
                                    </p>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-4">
                                {t('marketing.home.urgency_deadline_title')}
                            </h3>
                            <p className="text-slate-600 leading-relaxed text-sm">
                                {t('marketing.home.urgency_deadline_body')}
                            </p>
                        </div>
                    </div>

                    {/* Countdown / CTA banner */}
                    <div className="bg-gradient-to-r from-rose-500 to-orange-500 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-rose-200">
                        <div className="text-center md:text-left">
                            <p className="text-rose-100 text-sm font-semibold uppercase tracking-widest mb-1">
                                {t('marketing.home.urgency_time_left')}
                            </p>
                            <p className="text-white text-2xl font-bold">May 20, 2026 · EU Regulation 2024/1028</p>
                        </div>
                        <Link
                            to="/register"
                            className="flex-shrink-0 px-8 py-4 bg-white text-rose-600 font-bold text-lg rounded-full hover:bg-rose-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                        >
                            {t('marketing.home.urgency_cta')} →
                        </Link>
                    </div>
                </div>
            </section>

            {/* Mobile Optimization Section */}
            <section className="py-24 bg-gradient-to-br from-indigo-900 to-slate-800 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-600/10 to-transparent pointer-events-none"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-16">
                    <div className="md:w-1/2">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6 font-display">{t('marketing.home.mobile_title')}</h2>
                        <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                            {t('marketing.home.mobile_desc')}
                        </p>
                        <ul className="space-y-4">
                            {[
                                t('marketing.home.mobile_list_2'),
                                t('marketing.home.mobile_list_3'),
                                'Available for Android'
                            ].map((item) => (
                                <li key={item} className="flex items-center gap-3 text-slate-200">
                                    <CheckCircle className="w-5 h-5 text-teal-400" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="md:w-1/2 flex justify-center">
                        {/* Abstract representation of mobile usage since we don't have screenshots yet */}
                        <div className="relative w-64 h-[500px] border-8 border-slate-700 rounded-[3rem] bg-slate-800 shadow-2xl overflow-hidden flex items-center justify-center">
                            <Smartphone className="w-24 h-24 text-slate-600" />
                            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-blue-600/20 to-transparent"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-24 bg-white">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 text-center mb-12 font-display">
                        {t('marketing.home.faq_section_title')}
                    </h2>
                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <div
                                key={i}
                                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${faqOpen === i ? 'border-blue-300 shadow-md shadow-blue-100' : 'border-slate-200'}`}
                            >
                                <button
                                    onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                                    className="w-full text-left flex items-center justify-between gap-4 p-6"
                                >
                                    <span className={`font-semibold text-base leading-snug ${faqOpen === i ? 'text-blue-700' : 'text-slate-800'}`}>
                                        {faq.q}
                                    </span>
                                    {faqOpen === i
                                        ? <ChevronUp className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                        : <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                                    }
                                </button>
                                {faqOpen === i && (
                                    <div className="px-6 pb-6 text-slate-600 leading-relaxed text-sm border-t border-blue-100 pt-4">
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
