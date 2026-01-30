import React from 'react';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Prices = () => {
    const { t } = useTranslation();

    const plans = [
        {
            name: t('marketing.prices.plans.starter.name'),
            price: "€0",
            period: t('marketing.prices.period'),
            description: t('marketing.prices.plans.starter.desc'),
            features: [
                t('marketing.prices.features.prop_1'),
                t('marketing.prices.features.scan_5'),
                t('marketing.prices.features.basic_rpt'),
                t('marketing.prices.features.mobile')
            ],
            cta: t('marketing.prices.plans.starter.cta'),
            popular: false
        },
        {
            name: t('marketing.prices.plans.professional.name'),
            price: "€15",
            period: t('marketing.prices.period'),
            description: t('marketing.prices.plans.professional.desc'),
            features: [
                t('marketing.prices.features.prop_5'),
                t('marketing.prices.features.scan_unlim'),
                t('marketing.prices.features.auto_police'),
                t('marketing.prices.features.multi_user'),
                t('marketing.prices.features.priority')
            ],
            cta: t('marketing.prices.plans.professional.cta'),
            popular: true
        },
        {
            name: t('marketing.prices.plans.business.name'),
            price: "€49",
            period: t('marketing.prices.period'),
            description: t('marketing.prices.plans.business.desc'),
            features: [
                t('marketing.prices.features.prop_unlim'),
                t('marketing.prices.features.api'),
                t('marketing.prices.features.custom'),
                t('marketing.prices.features.account_mgr'),
                t('marketing.prices.features.white_label')
            ],
            cta: t('marketing.prices.plans.business.cta'),
            popular: false
        }
    ];

    return (
        <div className="py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h1 className="text-4xl font-bold font-display text-slate-900 mb-6">{t('marketing.prices.title')}</h1>
                    <p className="text-xl text-slate-600">
                        {t('marketing.prices.subtitle')}
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((plan) => (
                        <div key={plan.name} className={`relative p-8 bg-white rounded-3xl border ${plan.popular ? 'border-blue-500 shadow-xl shadow-blue-100' : 'border-slate-200 shadow-sm'} flex flex-col`}>
                            {plan.popular && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-sm font-semibold px-4 py-1 rounded-full">
                                    {t('marketing.prices.most_popular')}
                                </div>
                            )}
                            <h3 className="text-xl font-semibold text-slate-900 mb-2">{plan.name}</h3>
                            <div className="flex items-baseline mb-4">
                                <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                                <span className="text-slate-500 ml-1">{plan.period}</span>
                            </div>
                            <p className="text-slate-500 mb-6 text-sm">{plan.description}</p>

                            <ul className="space-y-4 mb-8 flex-1">
                                {plan.features.map(feature => (
                                    <li key={feature} className="flex items-start gap-3 text-sm text-slate-700">
                                        <Check className="w-5 h-5 text-teal-500 flex-shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <Link
                                to="/register"
                                className={`w-full py-3 text-center rounded-xl font-semibold transition-colors ${plan.popular
                                    ? 'bg-primary text-white hover:bg-blue-700'
                                    : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                                    }`}
                            >
                                {plan.cta}
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Prices;
