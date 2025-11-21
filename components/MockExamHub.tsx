
import React from 'react';
import { PastPaper, Subject, Level, UserProfile } from '../types';
import { MOCK_PAST_PAPERS, SUBJECT_ICONS } from '../constants';
import { PlayCircle, Star, TrendingUp, Clock, School, ArrowRight } from 'lucide-react';

interface MockExamHubProps {
  userProfile: UserProfile;
  onStartExam: (paper: PastPaper) => void;
}

export const MockExamHub: React.FC<MockExamHubProps> = ({ userProfile, onStartExam }) => {
  
  const recommendedPapers = MOCK_PAST_PAPERS.filter(
    p => userProfile.electives.includes(p.subject) || [Subject.CHI, Subject.ENG, Subject.MATH, Subject.CSD].includes(p.subject)
  ).slice(0, 3);

  const allPapers = MOCK_PAST_PAPERS;

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-10 pb-24 space-y-10 animate-in fade-in">
      <div className="flex flex-col md:flex-row justify-between items-end">
        <div>
          <h1 className="text-4xl font-display font-extrabold text-slate-800">Mock Exam Hub</h1>
          <p className="text-slate-500 mt-2 text-lg">Simulate real exam conditions. Target {userProfile.targetGrade}.</p>
        </div>
        <div className="hidden md:flex items-center space-x-2 text-sm font-bold text-slate-400 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
          <Clock size={16} />
          <span>Avg. Duration: 15-30 mins</span>
        </div>
      </div>

      {/* Recommendations */}
      <section>
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
          <Star className="mr-2 text-yellow-500" fill="currentColor" /> Recommended For You
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {recommendedPapers.map(paper => {
            const Icon = SUBJECT_ICONS[paper.subject];
            return (
              <button 
                key={paper.id}
                onClick={() => onStartExam(paper)}
                className="group text-left bg-gradient-to-br from-white to-slate-50 border border-slate-100 p-6 rounded-3xl shadow-soft hover:shadow-xl hover:scale-[1.02] transition-all relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 bg-brand-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">
                  TARGET {userProfile.targetGrade}
                </div>
                <div className="bg-brand-100 w-12 h-12 rounded-xl flex items-center justify-center text-brand-600 mb-4 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                  <Icon size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">{paper.subject}</h3>
                <div className="flex items-center text-slate-500 text-sm mb-4">
                  <School size={14} className="mr-1.5" /> {paper.school} {paper.year}
                </div>
                <div className="flex flex-wrap gap-2 mb-6">
                  {paper.topics.slice(0, 2).map(t => (
                    <span key={t} className="text-[10px] font-bold bg-white border border-slate-200 text-slate-500 px-2 py-1 rounded-md">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="flex items-center text-brand-600 font-bold text-sm group-hover:translate-x-2 transition-transform">
                  Start Simulation <ArrowRight size={16} className="ml-1" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* All Exams List */}
      <section>
        <h2 className="text-xl font-bold text-slate-800 mb-6">All Available Mocks</h2>
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
          {allPapers.map((paper, idx) => (
            <div 
              key={paper.id} 
              className={`p-6 flex flex-col md:flex-row items-center justify-between hover:bg-slate-50 transition-colors ${idx !== allPapers.length - 1 ? 'border-b border-slate-100' : ''}`}
            >
              <div className="flex items-center space-x-4 w-full md:w-auto mb-4 md:mb-0">
                <div className="bg-slate-100 p-3 rounded-xl text-slate-500">
                  <School size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-lg">{paper.paper}</h4>
                  <p className="text-slate-500 text-sm">{paper.school} • {paper.year} • {paper.subject}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-6 w-full md:w-auto justify-between md:justify-end">
                <div className="flex flex-col items-end">
                   <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Skills</span>
                   <div className="flex gap-1 mt-1">
                      {paper.topics.slice(0, 2).map(t => (
                         <span key={t} className="w-2 h-2 rounded-full bg-teal-400" title={t}></span>
                      ))}
                   </div>
                </div>
                <button 
                  onClick={() => onStartExam(paper)}
                  className="bg-white border-2 border-slate-200 hover:border-brand-500 hover:text-brand-600 text-slate-600 px-6 py-2 rounded-xl font-bold transition-all"
                >
                  Start
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
