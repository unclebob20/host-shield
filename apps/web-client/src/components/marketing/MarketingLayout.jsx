import React from 'react';
import MarketingNavbar from './MarketingNavbar';
import MarketingFooter from './MarketingFooter';

const MarketingLayout = ({ children }) => {
    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            <MarketingNavbar />
            <main className="flex-grow pt-20">
                {children}
            </main>
            <MarketingFooter />
        </div>
    );
};

export default MarketingLayout;
