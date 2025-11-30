
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full py-6 text-center mt-auto border-t border-white/5 bg-[#0f172a]/50 backdrop-blur-sm">
        <div className="flex flex-col gap-1">
            <p className="text-slate-400 text-sm font-medium">Produced By Mark George</p>
            <p className="text-slate-600 text-xs font-mono">v1.3.0 • Spark Platform</p>
        </div>
    </footer>
  );
};

export default Footer;
