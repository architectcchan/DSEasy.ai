
import React, { useState, useMemo } from 'react';
import { Subject, PastPaper, Level } from '../types';
import { MOCK_PAST_PAPERS, SUBJECT_ICONS } from '../constants';
import { Search, FileText, School, ChevronDown, Eye, CheckCircle } from 'lucide-react';

interface PaperLibraryProps {
  onSimulateExam: (paper: PastPaper) => void;
}

export const PaperLibrary: React.FC<PaperLibraryProps> = ({ onSimulateExam }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');

  const subjects = Object.values(Subject);
  const levels = Object.values(Level);

  const filteredPapers = useMemo(() => {
    return MOCK_PAST_PAPERS.filter(paper => {
      const matchesSearch = 
        paper.paper.toLowerCase().includes(searchQuery.toLowerCase()) || 
        paper.topics.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        paper.school.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSubject = selectedSubject === 'All' || paper.subject === selectedSubject;
      const matchesLevel = selectedLevel === 'All' || paper.level === selectedLevel;
      
      return matchesSearch && matchesSubject && matchesLevel;
    });
  }, [searchQuery, selectedSubject, selectedLevel]);

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-8 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center">
        <div>
          <h2 className="text-3xl font-display font-extrabold text-slate-800 flex items-center">
            <FileText className="mr-3 text-brand-600" strokeWidth={2.5} />
            Resource Bank
          </h2>
          <p className="text-slate-500 mt-2 font-medium">View Past Papers, Marking Schemes & Examiner Reports.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-soft grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search topics, schools (e.g. 'DBS', 'Integration')..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-slate-700 focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-none font-medium transition-all"
          />
        </div>
        
        <div className="relative">
          <select 
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-700 appearance-none focus:ring-2 focus:ring-brand-500 focus:outline-none cursor-pointer font-bold"
          >
            <option value="All">All Levels</option>
            {levels.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
        </div>

        <div className="relative">
           <select 
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-700 appearance-none focus:ring-2 focus:ring-brand-500 focus:outline-none cursor-pointer font-bold"
          >
            <option value="All">All Subjects</option>
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
        {filteredPapers.length > 0 ? (
          filteredPapers.map(paper => {
             const SubjectIcon = SUBJECT_ICONS[paper.subject] || FileText;
             return (
               <div key={paper.id} className="bg-white border border-slate-100 rounded-3xl p-6 hover:shadow-xl hover:shadow-slate-200 hover:border-brand-100 transition-all group relative overflow-hidden flex flex-col h-full">
                  
                  {/* Badge */}
                  <div className="absolute top-0 right-0 bg-slate-50 px-4 py-2 rounded-bl-2xl text-xs font-bold text-slate-500 border-b border-l border-slate-100 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                    {paper.year} • {paper.level}
                  </div>
                  
                  <div className="flex items-start space-x-4 mb-5">
                    <div className="bg-brand-50 p-3.5 rounded-2xl text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-all duration-300 shadow-sm">
                      <SubjectIcon size={28} />
                    </div>
                    <div className="pt-1">
                      <h3 className="font-bold text-slate-800 text-lg leading-tight mb-1">{paper.subject}</h3>
                      <p className="text-slate-500 font-medium text-sm flex items-center">
                        <School size={14} className="mr-1.5 text-brand-400"/> {paper.school}
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                     <p className="text-sm font-bold text-slate-700 mb-2">{paper.paper}</p>
                     <div className="flex flex-wrap gap-2">
                        {paper.topics.map(t => (
                        <span key={t} className="text-[10px] font-bold uppercase tracking-wider bg-slate-50 text-slate-500 px-2.5 py-1.5 rounded-lg border border-slate-100">
                            {t}
                        </span>
                        ))}
                     </div>
                  </div>

                  <div className="mt-auto grid grid-cols-2 gap-3">
                    <button 
                      className="w-full bg-white border-2 border-slate-100 hover:border-brand-500 hover:bg-brand-50 text-slate-700 hover:text-brand-700 py-3 rounded-xl text-sm font-bold flex items-center justify-center transition-all shadow-sm"
                    >
                      <Eye size={18} className="mr-2" /> View PDF
                    </button>
                    <button 
                      className="w-full bg-teal-50 border-2 border-teal-100 hover:border-teal-500 hover:bg-teal-100 text-teal-700 py-3 rounded-xl text-sm font-bold flex items-center justify-center transition-all shadow-sm"
                    >
                      <CheckCircle size={18} className="mr-2" /> Answers
                    </button>
                  </div>
               </div>
             );
          })
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center p-20 text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
            <Search size={48} className="mb-4 opacity-20" />
            <p className="text-lg font-bold text-slate-600">No papers found</p>
            <p className="text-sm">Try changing your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};
