
import React from 'react';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const steps = [
    { number: 1, title: 'أساسيات الدرس' },
    { number: 2, title: 'تفاصيل إضافية' },
];

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ currentStep, totalSteps }) => {
  return (
    <div className="flex items-center justify-center w-full max-w-sm mx-auto mb-12">
      {steps.map((step, index) => {
        const isActive = currentStep === step.number;
        const isCompleted = currentStep > step.number;
        return (
          <React.Fragment key={step.number}>
            <div className="flex flex-col items-center text-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                  isActive
                    ? 'bg-[var(--accent-gold)] border-[var(--accent-gold)] text-white scale-110'
                    : isCompleted
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'bg-[var(--card-bg-light)] border-[var(--border-light)] text-[var(--text-light-secondary)]'
                }`}
              >
                {isCompleted ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                ) : (
                    <span className="font-bold">{step.number}</span>
                )}
                
              </div>
              <p className={`mt-2 spark-caption font-semibold transition-colors ${isActive ? 'text-[var(--accent-gold)]' : 'text-[var(--text-light-secondary)]'}`}>
                {step.title}
              </p>
            </div>
            {index < totalSteps - 1 && (
              <div className={`flex-auto mx-4 h-1 transition-colors duration-300 ${isCompleted ? 'bg-green-500' : 'bg-[var(--border-light)]'}`}></div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default ProgressIndicator;