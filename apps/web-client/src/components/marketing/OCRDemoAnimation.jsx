import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Calendar, Hash, Globe, CheckCircle2 } from 'lucide-react';

const OCRDemoAnimation = () => {
    const [scannedFields, setScannedFields] = useState({
        name: false,
        dob: false,
        docNum: false,
        nationality: false,
    });

    useEffect(() => {
        const interval = setInterval(() => {
            // Reset fields
            setScannedFields({ name: false, dob: false, docNum: false, nationality: false });

            // Trigger fields matching the scanning overlay movement
            setTimeout(() => setScannedFields(prev => ({ ...prev, name: true })), 1200);
            setTimeout(() => setScannedFields(prev => ({ ...prev, dob: true })), 1800);
            setTimeout(() => setScannedFields(prev => ({ ...prev, docNum: true })), 2400);
            setTimeout(() => setScannedFields(prev => ({ ...prev, nationality: true })), 3000);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const Field = ({ label, value, icon: Icon, isScanned }) => (
        <div className={`p-1.5 rounded-md backdrop-blur-md border transition-all duration-300 flex items-center gap-2 ${isScanned
                ? "bg-white/90 border-blue-400 shadow-sm scale-105"
                : "bg-slate-900/40 border-white/10"
            }`}>
            <div className={`p-1 rounded-full transition-colors duration-300 ${isScanned ? "bg-blue-100 text-blue-600" : "bg-white/10 text-white/50"
                }`}>
                <Icon className="w-2.5 h-2.5" />
            </div>
            <div className="flex-1 min-w-0">
                <div className={`text-[8px] uppercase tracking-wider font-semibold mb-0.5 ${isScanned ? "text-slate-500" : "text-white/40"
                    }`}>{label}</div>
                <div className={`font-mono text-[9px] font-medium transition-all duration-300 truncate ${isScanned ? "text-slate-900 blur-none opacity-100" : "text-white blur-[1px] opacity-40"
                    }`}>
                    {value}
                </div>
            </div>
            <div className={`transition-all duration-300 flex-shrink-0 ${isScanned ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
                <CheckCircle2 className="w-3 h-3 text-green-500" />
            </div>
        </div>
    );

    return (
        <div className="relative w-full max-w-[200px] mx-auto perspective-1000">
            {/* Phone Frame Container */}
            <div className="relative rounded-[1.5rem] overflow-hidden border-[6px] border-slate-900 shadow-xl bg-slate-900 aspect-[9/16]">

                {/* Simulated Live Camera Feed */}
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/ocr-demo-bg.png')" }}>
                    {/* Dark gradient overlay for UI readability */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80"></div>
                </div>

                {/* Camera UI - Top */}
                <div className="absolute top-4 left-0 right-0 px-4 flex justify-between text-white/80 z-20">
                    <div className="w-6 h-6 rounded-full bg-black/20 backdrop-blur flex items-center justify-center">
                        <motion.div
                            animate={{ opacity: [1, 0.5, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="w-1.5 h-1.5 rounded-full bg-green-400"
                        />
                    </div>
                    <div className="px-2 py-0.5 rounded-full bg-black/40 backdrop-blur text-[8px] font-medium">
                        PASSPORT
                    </div>
                </div>

                {/* Scanning Frame Overlay */}
                <div className="absolute top-[15%] left-4 right-4 bottom-[40%] rounded-xl border border-white/20 z-10 overflow-hidden">
                    {/* Corner Markers */}
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-blue-400 rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-blue-400 rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-blue-400 rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-blue-400 rounded-br-lg"></div>

                    {/* Scanning Beam */}
                    <motion.div
                        className="absolute left-0 right-0 h-0.5 bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.8)]"
                        animate={{ top: ["0%", "100%"] }}
                        transition={{
                            duration: 3,
                            ease: "easeInOut",
                            repeat: Infinity,
                            repeatDelay: 0.5
                        }}
                    />
                    <motion.div
                        className="absolute left-0 right-0 h-16 bg-gradient-to-b from-blue-500/20 to-transparent"
                        animate={{ top: ["-20%", "80%"] }}
                        transition={{
                            duration: 3,
                            ease: "easeInOut",
                            repeat: Infinity,
                            repeatDelay: 0.5
                        }}
                    />
                </div>

                {/* Floating Extracted Data Cards */}
                <div className="absolute bottom-16 left-3 right-3 space-y-1.5 z-20">
                    <p className="text-[8px] text-white/60 mb-1 pl-1 font-medium tracking-wide">DETECTED</p>
                    <Field
                        label="Full Name"
                        value="DOE, JOHN"
                        icon={User}
                        isScanned={scannedFields.name}
                    />
                    <div className="grid grid-cols-2 gap-1.5">
                        <Field
                            label="Doc No."
                            value="X123456"
                            icon={Hash}
                            isScanned={scannedFields.docNum}
                        />
                        <Field
                            label="Nat."
                            value="USA"
                            icon={Globe}
                            isScanned={scannedFields.nationality}
                        />
                    </div>
                </div>

                {/* Camera UI - Bottom (Shutter) */}
                <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center z-20">
                    <div className="w-12 h-12 rounded-full border-[3px] border-white flex items-center justify-center">
                        <div className="w-9 h-9 rounded-full bg-white"></div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default OCRDemoAnimation;
