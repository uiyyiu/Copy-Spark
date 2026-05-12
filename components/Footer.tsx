import React from 'react';
import { motion } from 'motion/react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full py-12 mt-auto border-t border-white/5 bg-slate-950/20 backdrop-blur-3xl overflow-hidden no-print">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex flex-col items-center md:items-start gap-3">
                <div className="flex items-center gap-4">
                    <div className="w-8 h-px bg-gradient-to-l from-amber-500 to-transparent"></div>
                    <span className="text-xl font-display italic font-black text-white tracking-widest">SPARK</span>
                    <div className="w-8 h-px bg-gradient-to-r from-amber-500 to-transparent"></div>
                </div>
                <p className="text-slate-500 text-xs uppercase tracking-[0.4em] font-bold">The Intelligent Servant Companion</p>
            </div>

            <div className="flex flex-col items-center gap-2">
                <p className="text-slate-400 text-sm font-spiritual italic">من يخدم، فليخدم كأن الله هو الذي يمنحه القوة.</p>
                <div className="h-px w-32 bg-white/5"></div>
            </div>

            <div className="flex flex-col items-center md:items-end gap-1">
                <p className="text-slate-300 text-sm font-display italic tracking-[0.1em]">Produced By <span className="text-white font-black">Mark George</span></p>
                <p className="text-slate-600 text-[10px] font-mono tracking-tighter uppercase opacity-50">v1.5.0 • A Catalyst for Spiritual Growth</p>
            </div>
        </div>
        
        {/* Subtle decorative element */}
        <div className="mt-12 flex justify-center opacity-20">
             <div className="w-full max-w-lg h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        </div>
    </footer>
  );
};

export default Footer;
