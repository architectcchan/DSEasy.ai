
import React, { useState } from 'react';
import { MistakeRecord, Subject } from '../types';
import { AlertOctagon, Trash2, RefreshCcw, CheckCircle2, Tag, BrainCircuit, Filter } from 'lucide-react';
import { SUBJECT_ICONS } from '../constants';

interface MistakeVaultProps {
  mistakes: MistakeRecord[];
  onResolveMistake: (id: string) => void;
  onAddReflection: (id: string, type: 'Careless' | 'Concept' | 'Time', note: string) => void;
}

export const MistakeVault: React.FC<MistakeVaultProps> = ({ mistakes, onResolveMistake, onAddReflection }) => {
  const [filterSubject, setFilterSubject] = useState<string>('All');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState('');
  const [errorType, setErrorType] = useState<'Careless' | 'Concept' | 'Time'>('Concept');

  const filteredMistakes = mistakes.filter(m => filterSubject === 'All' || m.subject === filterSubject);

  const handleSaveReflection = (id: string) => {
    onAddReflection(id, errorType, noteInput);
    setEditingId(null);
    setNoteInput('');
  };

  if (mistakes.length === 0) {
    return (
      <div className="max-w-5xl mx-auto p-10 flex flex-col items-center justify-center h-[80vh] text-center">
        <div className="w-32 h-32 bg-green-50 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <CheckCircle2 size={64} className="text-green-500" />
        </div>
        <h2 className="text-3xl font-display font-bold text-slate-800 mb-2">No Mistakes Recorded!</h2>
        <p className="text-slate-500 text-lg max-w-md">
          Great job. Go to the Quiz Arena and challenge yourself. Any mistakes you make will appear here for review.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-8 h-full pb-24">
      <div className="flex flex-col md:flex-row justify-between items-end">
        <div>
          <h1 className="text-4xl font-display font-extrabold text-slate-800 flex items-center">
            <AlertOctagon className="mr-4 text-red-500" size={40} />
            Mistake Vault
          </h1>
          <p className="text-slate-500 mt-2 text-lg font-medium">Review, reflect, and never make the same mistake twice.</p>
        </div>
        
        <div className="flex items-center space-x-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
           <Filter size={18} className="text-slate-400 ml-2" />
           <select 
             value={filterSubject} 
             onChange={(e) => setFilterSubject(e.target.value)}
             className="bg-transparent border-none text-sm font-bold text-slate-700 focus:ring-0 cursor-pointer"
           >
             <option value="All">All Subjects</option>
             {Object.values(Subject).map(s => <option key={s} value={s}>{s}</option>)}
           </select>
        </div>
      </div>

      <div className="grid gap-6">
        {filteredMistakes.map((mistake) => {
          const Icon = SUBJECT_ICONS[mistake.subject];
          const isEditing = editingId === mistake.id;

          return (
            <div key={mistake.id} className="bg-white border-l-4 border-l-red-500 border-y border-r border-slate-200 rounded-r-3xl rounded-l-md p-6 md:p-8 shadow-soft hover:shadow-md transition-all group relative">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                   <div className="bg-slate-50 p-2 rounded-lg text-slate-500">
                      <Icon size={20} />
                   </div>
                   <span className="text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                      {mistake.subject} • {new Date(mistake.timestamp).toLocaleDateString()}
                   </span>
                   {mistake.errorType && (
                     <span className={`text-xs font-bold px-2 py-1 rounded-md border ${
                       mistake.errorType === 'Careless' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' :
                       mistake.errorType === 'Concept' ? 'bg-red-50 text-red-600 border-red-200' :
                       'bg-blue-50 text-blue-600 border-blue-200'
                     }`}>
                       {mistake.errorType}
                     </span>
                   )}
                </div>
                <button 
                  onClick={() => onResolveMistake(mistake.id)}
                  className="text-green-600 hover:bg-green-50 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors flex items-center"
                >
                  <CheckCircle2 size={16} className="mr-1" /> Mark Resolved
                </button>
              </div>

              {/* Question Content */}
              <div className="mb-6">
                 <h3 className="text-xl font-bold text-slate-800 mb-4">{mistake.question.question}</h3>
                 
                 {mistake.question.type === 'mc' ? (
                     // MC Mistake View
                     <div className="grid md:grid-cols-2 gap-4">
                        {mistake.question.options?.map((opt, idx) => {
                           let style = "border-slate-100 bg-slate-50 text-slate-500 opacity-60";
                           if (idx === mistake.question.correctIndex) style = "border-green-500 bg-green-50 text-green-800 font-bold ring-1 ring-green-500 opacity-100";
                           if (idx === mistake.userAnswerIndex) style = "border-red-500 bg-red-50 text-red-800 font-bold ring-1 ring-red-500 opacity-100 decoration-wavy line-through";
                           
                           return (
                              <div key={idx} className={`p-3 rounded-xl border-2 text-sm ${style}`}>
                                 {opt}
                              </div>
                           )
                        })}
                     </div>
                 ) : (
                     // Short Answer Mistake View
                     <div className="space-y-4">
                         <div className="bg-red-50 border border-red-100 p-4 rounded-xl">
                             <p className="text-xs font-bold text-red-400 uppercase mb-1">Your Answer</p>
                             <p className="text-red-800 font-medium">"{mistake.userAnswerText}"</p>
                         </div>
                         <div className="bg-green-50 border border-green-100 p-4 rounded-xl">
                             <p className="text-xs font-bold text-green-400 uppercase mb-1">Model Answer / Keywords</p>
                             <p className="text-green-800 font-medium mb-2">"{mistake.question.answer}"</p>
                             <div className="flex flex-wrap gap-2">
                                 {mistake.question.keywords?.map(k => (
                                     <span key={k} className="text-[10px] bg-white border border-green-200 text-green-600 px-2 py-1 rounded-md font-bold uppercase">{k}</span>
                                 ))}
                             </div>
                         </div>
                     </div>
                 )}
              </div>

              {/* Explanation */}
              <div className="bg-brand-50 p-5 rounded-xl mb-6">
                 <p className="text-sm text-brand-900 font-medium flex items-start">
                    <BrainCircuit size={18} className="mr-2 shrink-0 mt-0.5" />
                    {mistake.question.explanation}
                 </p>
              </div>

              {/* Reflection Area */}
              <div className="border-t border-slate-100 pt-4">
                 {!isEditing && !mistake.reflectionNote ? (
                    <button 
                      onClick={() => setEditingId(mistake.id)}
                      className="text-slate-400 hover:text-brand-600 text-sm font-bold flex items-center transition-colors"
                    >
                       <Tag size={16} className="mr-1" /> Add Reflection Note (Why did I get this wrong?)
                    </button>
                 ) : isEditing ? (
                    <div className="bg-slate-50 p-4 rounded-xl space-y-3 animate-in fade-in">
                       <p className="text-xs font-bold text-slate-500 uppercase">Categorize Error</p>
                       <div className="flex space-x-2">
                          {['Concept', 'Careless', 'Time'].map(t => (
                             <button 
                               key={t} 
                               onClick={() => setErrorType(t as any)}
                               className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${errorType === t ? 'border-brand-500 bg-brand-100 text-brand-700' : 'border-slate-200 bg-white text-slate-500'}`}
                             >
                               {t} Error
                             </button>
                          ))}
                       </div>
                       <textarea 
                          value={noteInput}
                          onChange={(e) => setNoteInput(e.target.value)}
                          placeholder="e.g. Forgot to convert units to meters..."
                          className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                          rows={2}
                       />
                       <div className="flex justify-end space-x-2">
                          <button onClick={() => setEditingId(null)} className="px-3 py-1.5 text-slate-500 text-xs font-bold">Cancel</button>
                          <button onClick={() => handleSaveReflection(mistake.id)} className="bg-brand-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-brand-700">Save Reflection</button>
                       </div>
                    </div>
                 ) : (
                    <div className="flex items-start space-x-2 bg-yellow-50 p-3 rounded-xl text-yellow-800 text-sm font-medium border border-yellow-100">
                       <Tag size={16} className="shrink-0 mt-0.5" />
                       <span><strong className="uppercase text-[10px] bg-yellow-200 px-1.5 py-0.5 rounded mr-1">{mistake.errorType}</strong> {mistake.reflectionNote}</span>
                    </div>
                 )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };
