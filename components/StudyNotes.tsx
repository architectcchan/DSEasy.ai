
import React, { useState } from 'react';
import { MOCK_TIPS } from '../constants';
import { Sparkles, BookOpen, CheckCircle2, Copy, Check } from 'lucide-react';
import { chatWithTutor } from '../services/geminiService';
import { Subject, Level } from '../types';

export const StudyNotes: React.FC = () => {
  const [generatedNote, setGeneratedNote] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedNote(null);
    // Simulate specific request for a summary
    const result = await chatWithTutor(
        [{role: 'user', text: 'Generate a concise 1-page summary cheat sheet for DSE English Writing formats.'}], 
        "Generate summary", 
        Subject.ENG, 
        Level.S6
    );
    // The chat service returns JSON string usually, let's try to extract explanation
    try {
        const parsed = JSON.parse(result);
        setGeneratedNote(parsed.explanation);
    } catch (e) {
        setGeneratedNote(result);
    }
    setIsGenerating(false);
  };

  const handleCopy = () => {
    if (generatedNote) {
        navigator.clipboard.writeText(generatedNote);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8 animate-in fade-in pb-24">
      <div className="flex justify-between items-center mb-4">
          <div>
              <h2 className="text-3xl font-display font-bold text-slate-800">Smart Notes</h2>
              <p className="text-slate-500">AI-generated cheat sheets for your last minute revision.</p>
          </div>
          <button 
            onClick={handleGenerate} 
            disabled={isGenerating}
            className="bg-brand-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-brand-700 shadow-lg shadow-brand-500/20 transition-all hover:scale-105 disabled:opacity-50 flex items-center"
          >
              {isGenerating ? <Sparkles size={16} className="inline mr-2 animate-spin"/> : <Sparkles size={16} className="inline mr-2"/>}
              {isGenerating ? 'Generating...' : 'Generate New'}
          </button>
      </div>

      {generatedNote && (
          <div className="bg-white border border-brand-200 rounded-2xl p-6 shadow-lg animate-in slide-in-from-top-4 relative">
              <div className="absolute top-4 right-4">
                  <button onClick={handleCopy} className="text-slate-400 hover:text-brand-600">
                      {copied ? <Check size={20} /> : <Copy size={20} />}
                  </button>
              </div>
              <h3 className="font-bold text-brand-800 mb-4 flex items-center">
                  <Sparkles size={18} className="mr-2"/> AI Summary
              </h3>
              <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {generatedNote}
              </div>
          </div>
      )}
      
      <div className="grid md:grid-cols-2 gap-6">
        {MOCK_TIPS.map((tip, i) => (
          <div key={i} className="bg-white border border-slate-100 p-6 rounded-2xl hover:shadow-lg hover:border-brand-200 transition-all cursor-pointer group relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-brand-50 w-16 h-16 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150"></div>
            <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center relative z-10">
              <BookOpen size={20} className="mr-2 text-brand-500"/> {tip.title}
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed relative z-10">{tip.content}</p>
          </div>
        ))}
      </div>

       <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-8 rounded-3xl text-white flex flex-col md:flex-row items-center justify-between shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="relative z-10 mb-6 md:mb-0">
                <div className="flex items-center mb-2 text-brand-300 font-bold">
                  <CheckCircle2 size={20} className="mr-2" /> Pro Feature
                </div>
                <h3 className="text-2xl font-display font-bold mb-2">Unlock Unlimited AI Summaries</h3>
                <p className="text-slate-400 max-w-md text-sm">
                  Get instant, syllabus-aligned summaries for History, Geography, Literature, and Science topics.
                </p>
            </div>
            <button className="relative z-10 bg-white text-slate-900 px-8 py-3 rounded-xl font-bold hover:bg-brand-50 transition-colors">
                Try it now
            </button>
       </div>
    </div>
  );
};
