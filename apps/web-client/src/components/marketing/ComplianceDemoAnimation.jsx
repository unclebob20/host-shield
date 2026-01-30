import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, CheckCircle2, Building, RefreshCw } from 'lucide-react';

const ComplianceDemoAnimation = () => {
    const [rows, setRows] = useState([
        { id: 1, name: "Schmidt, Hans", nat: "DEU", status: "sent" },
        { id: 2, name: "Dubois, Marie", nat: "FRA", status: "sent" },
        { id: 3, name: "Novak, Jan", nat: "CZE", status: "pending" },
    ]);

    useEffect(() => {
        const interval = setInterval(() => {
            setRows([
                { id: 1, name: "Schmidt, Hans", nat: "DEU", status: "sent" },
                { id: 2, name: "Dubois, Marie", nat: "FRA", status: "sent" },
                { id: 3, name: "Novak, Jan", nat: "CZE", status: "pending" },
            ]);

            setTimeout(() => {
                setRows(prev => prev.map(r => r.id === 3 ? { ...r, status: "sending" } : r));
                setTimeout(() => {
                    setRows(prev => prev.map(r => r.id === 3 ? { ...r, status: "sent" } : r));
                }, 2000);
            }, 1000);

        }, 6000);

        return () => clearInterval(interval);
    }, []);

    const StatusBadge = ({ status }) => {
        if (status === 'sent') return (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide bg-emerald-100 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Sent
            </span>
        );
        if (status === 'sending') return (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide bg-blue-100 text-blue-700 border border-blue-200 animate-pulse">
                <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> Process
            </span>
        );
        return (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide bg-amber-100 text-amber-700 border border-amber-200">
                Pending
            </span>
        );
    };

    return (
        <div className="w-full max-w-[300px] mx-auto perspective-1000 py-2">
            <motion.div
                className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200/60"
                initial={{ rotateY: -5 }}
                whileHover={{ rotateY: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Header */}
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-teal-100 text-teal-600 rounded-lg">
                            <FileText className="w-4 h-4" />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-slate-900">Compliance</div>
                            <div className="text-[10px] text-slate-500">Auto-Submission</div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="p-0">
                    <table className="w-full">
                        <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase font-semibold">
                            <tr>
                                <th className="px-4 py-2 text-left">Guest</th>
                                <th className="px-4 py-2 text-left">Nat.</th>
                                <th className="px-4 py-2 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            <AnimatePresence>
                                {rows.map((row) => (
                                    <motion.tr
                                        key={row.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className={`transition-colors duration-300 ${row.status === 'sending' ? 'bg-blue-50/50' :
                                                row.status === 'sent' && row.id > 2 ? 'bg-emerald-50/30' : 'hover:bg-slate-50'
                                            }`}
                                    >
                                        <td className="px-4 py-2">
                                            <div className="text-xs font-medium text-slate-900">{row.name}</div>
                                        </td>
                                        <td className="px-4 py-2">
                                            <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-1 py-0.5 rounded border border-slate-200">
                                                {row.nat}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                            <StatusBadge status={row.status} />
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="bg-slate-50 px-4 py-2 border-t border-slate-100 flex justify-between items-center">
                    <div className="text-[10px] text-slate-400">Processing...</div>
                    <div className="flex -space-x-1">
                        <div className="w-4 h-4 rounded-full bg-blue-500 border border-white"></div>
                        <div className="w-4 h-4 rounded-full bg-teal-500 border border-white"></div>
                    </div>
                </div>

            </motion.div>
        </div>
    );
};

export default ComplianceDemoAnimation;
