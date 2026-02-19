import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import MarketingNavbar from './MarketingNavbar';
import MarketingFooter from './MarketingFooter';

const MarketingLayout = ({ children }) => {
    const { t } = useTranslation();
    const [barDismissed, setBarDismissed] = useState(false);

    return (
        <div className="flex flex-col min-h-screen relative bg-slate-50">
            {/* Global Background Texture */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <img
                    src="/marketing-bg.png"
                    alt=""
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Urgency Bar — fixed above navbar */}
            {!barDismissed && (
                <div
                    id="urgency-bar"
                    className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-orange-500 via-rose-500 to-orange-500"
                    style={{ height: '40px' }}
                >
                    <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                            <p className="text-xs sm:text-sm font-medium text-white truncate">
                                {t('marketing.home.sticky_bar')}
                            </p>
                            <Link
                                to="/prices"
                                className="text-xs sm:text-sm font-bold underline underline-offset-2 whitespace-nowrap hover:text-orange-100 transition-colors flex-shrink-0 text-white"
                            >
                                {t('marketing.home.sticky_bar_cta')} →
                            </Link>
                        </div>
                        <button
                            onClick={() => setBarDismissed(true)}
                            className="flex-shrink-0 p-1 hover:bg-white/20 rounded-full transition-colors"
                            aria-label="Dismiss"
                        >
                            <X className="w-3.5 h-3.5 text-white" />
                        </button>
                    </div>
                </div>
            )}

            {/* Spacer so content doesn't hide behind fixed bar + fixed navbar */}
            <div style={{ height: barDismissed ? '0px' : '40px' }} className="flex-shrink-0" />

            {/* Content Wrapper */}
            <div className="relative z-10 flex flex-col flex-grow">
                {/* Navbar gets pushed down by the spacer above */}
                <MarketingNavbar topOffset={barDismissed ? 0 : 40} />
                <main className="flex-grow" style={{ paddingTop: barDismissed ? '80px' : '120px' }}>
                    {children}
                </main>
                <MarketingFooter />
            </div>
        </div>
    );
};

export default MarketingLayout;
