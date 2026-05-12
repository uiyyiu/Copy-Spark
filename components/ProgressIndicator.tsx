import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const steps = [
    { number: 1, title: 'هيكلية الدرس', subtitle: 'الأساسيات' },
    { number: 2, title: 'اللمسات الفنية', subtitle: 'التفاصيل' },
];

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ currentStep, totalSteps }) => {
  return (
    <div className="flex items-center justify-center w-full max-w-2xl mx-auto mb-20" dir="rtl">
      {steps.map((step, index) => {
        const isActive = currentStep === step.number;
        const isCompleted = currentStep > step.number;
        
        return (
          <React.Fragment key={step.number}>
            <div className="flex flex-col items-center text-center relative group">
              <motion.div
                initial={false}
                animate={{
                    scale: isActive ? 1.2 : 1,
                    backgroundColor: isCompleted ? '#10b981' : isActive ? '#f59e0b' : 'rgba(255,255,255,0.05)',
                    borderColor: isCompleted ? '#10b981' : isActive ? '#f59e0b' : 'rgba(255,255,255,0.1)'
                }}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-700 border shadow-2xl relative z-10`}
              >
                <AnimatePresence mode="wait">
                    {isCompleted ? (
                        <motion.svg 
                            key="check" 
                            initial={{ scale: 0 }} animate={{ scale: 1 }} 
                            className="w-7 h-7 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </motion.svg>
                    ) : (
                        <motion.span key="number" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`text-xl font-black font-display italic ${isActive ? 'text-slate-950' : 'text-slate-600'}`}>
                            {step.number}
                        </motion.span>
                    )}
                </AnimatePresence>
                
                {isActive && (
                    <motion.div 
                        layoutId="progress-glow"
                        className="absolute inset-0 bg-amber-500 blur-2xl opacity-30 rounded-2xl"
                    />
                )}
              </motion.div>
              
              <div className="mt-4 flex flex-col items-center">
                  <p className={`text-sm font-black font-display italic tracking-tight transition-colors duration-500 uppercase ${isActive ? 'text-amber-500' : isCompleted ? 'text-emerald-500' : 'text-slate-600'}`}>
                    {step.title}
                  </p>
                  <p className="text-[9px] font-black tracking-[0.3em] uppercase text-slate-700 mt-1 opacity-60">{step.subtitle}</p>
              </div>
            </div>
            {index < totalSteps - 1 && (
              <div className="flex-auto mx-10 relative h-0.5 mt-[-3.5rem] overflow-hidden">
                  <div className="absolute inset-0 bg-white/5"></div>
                  <motion.div 
                    initial={false}
                    animate={{ width: isCompleted ? '100%' : '0%' }}
                    transition={{ duration: 0.7, ease: "easeInOut" }}
                    className="absolute inset-0 bg-gradient-to-r from-amber-500 to-emerald-500"
                  />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default ProgressIndicator;
