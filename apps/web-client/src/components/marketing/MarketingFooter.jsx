import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const MarketingFooter = () => {
    const { t } = useTranslation();

    return (
        <footer className="bg-white border-t border-slate-200 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-6 md:mb-0 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-violet-600">
                                HostShield
                            </span>
                        </div>
                        <p className="text-slate-500 text-sm">
                            {t('marketing.footer.desc')}
                        </p>
                    </div>

                    <div className="flex gap-8 text-sm text-slate-500">
                        <Link to="/product" className="hover:text-primary transition-colors">{t('marketing.nav.product')}</Link>
                        <Link to="/prices" className="hover:text-primary transition-colors">{t('marketing.nav.prices')}</Link>
                        <Link to="/contact" className="hover:text-primary transition-colors">{t('marketing.nav.contact')}</Link>
                        <Link to="/login" className="hover:text-primary transition-colors">{t('marketing.nav.sign_in')}</Link>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-100 text-center text-xs text-slate-400">
                    © {new Date().getFullYear()} HostShield. {t('marketing.footer.rights')}
                </div>
            </div>
        </footer>
    );
};

export default MarketingFooter;
