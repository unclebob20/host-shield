import React from 'react';
import MarketingNavbar from './MarketingNavbar';
import MarketingFooter from './MarketingFooter';

const MarketingLayout = ({ children }) => {
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
            {/* Content Wrapper to ensure z-index above background */}
            <div className="relative z-10 flex flex-col flex-grow">
                <MarketingNavbar />
                <main className="flex-grow pt-20">
                    {children}
                </main>
                <MarketingFooter />
            </div>
        </div>
    );
};

export default MarketingLayout;
