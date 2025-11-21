
import React, { useState } from 'react';
import { TUTORIAL_STEPS } from '../constants';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';

export const Tutorial: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [index, setIndex] = useState(0);
  const step = TUTORIAL_STEPS[index];

  const handleNext = () => {
      if (index < TUTORIAL_STEPS.length - 1) setIndex(index + 1);
      else onComplete();
  };

  return (
      <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center animate-in fade-in">
          <div className="bg-white max-w-md w-full mx-4 rounded-[2rem] shadow-2xl p-8 relative">
              <button onClick={onComplete} className="absolute top-4 right-4 text-slate-300 hover:text-slate-500">
                  <X size={24} />
              </button>

              <div className="mb-6">
                  <span className="bg-brand-100 text-brand-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                      Step {index + 1} of {TUTORIAL_STEPS.length}
                  </span>
              </div>

              <h2 className="text-2xl font-display font-bold text-slate-800 mb-3">{step.title}</h2>
              <p className="text-slate-500 text-lg mb-8 leading-relaxed">
                  {step.description}
              </p>

              <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                      {TUTORIAL_STEPS.map((_, i) => (
                          <div key={i} className={`w-2 h-2 rounded-full ${i === index ? 'bg-brand-600' : 'bg-slate-200'}`} />
                      ))}
                  </div>
                  <div className="flex space-x-3">
                      {index > 0 && (
                          <button onClick={() => setIndex(index - 1)} className="p-3 rounded-xl hover:bg-slate-50 text-slate-500">
                              <ArrowLeft size={20} />
                          </button>
                      )}
                      <button 
                          onClick={handleNext}
                          className="bg-brand-600 text-white px-6 py-3 rounded-xl font-bold flex items-center shadow-lg hover:bg-brand-700 transition-all"
                      >
                          {index === TUTORIAL_STEPS.length - 1 ? "Get Started" : "Next"} 
                          <ArrowRight size={18} className="ml-2" />
                      </button>
                  </div>
              </div>
          </div>
      </div>
  );
};
