import React from 'react';
import { Camera, FileCheck, Brain, Lock } from 'lucide-react';
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
        </div>
    );
};

export default Product;
