import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Scan, FileText, Smartphone, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Home = () => {
    const { t } = useTranslation();

    return (
        <div className="overflow-hidden">
            {/* Hero Section */}
            <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-40 overflow-hidden">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/50 via-slate-50 to-white"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-8 font-display">
                        {t('marketing.home.hero_title_1')} <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                            {t('marketing.home.hero_title_2')}
                        </span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-xl text-slate-600 mb-10 leading-relaxed">
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
                </div>
            </section>

            {/* Feature Highlights */}
            <section className="py-24 bg-white">
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

            {/* Mobile Optimization Section */}
            <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-900/20 to-transparent pointer-events-none"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-16">
                    <div className="md:w-1/2">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6 font-display">{t('marketing.home.mobile_title')}</h2>
                        <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                            {t('marketing.home.mobile_desc')}
                        </p>
                        <ul className="space-y-4">
                            {[
                                t('marketing.home.mobile_list_1'),
                                t('marketing.home.mobile_list_2'),
                                t('marketing.home.mobile_list_3')
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
        </div>
    );
};

export default Home;
