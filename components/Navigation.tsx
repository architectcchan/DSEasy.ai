
import React, { useState } from 'react';
import { AppView } from '../types';
import { LayoutDashboard, MessageSquare, BrainCircuit, PenTool, BookMarked, LogOut, FileText, GraduationCap, Layers, AlertOctagon, Mic } from 'lucide-react';

interface NavigationProps {
  currentView: AppView;
  setView: (view: AppView) => void;
}

const NavItem = ({ 
  icon: Icon, 
  label, 
  active, 
  onClick,
  isExpanded
}: { 
  icon: any, 
  label: string, 
  active: boolean, 
  onClick: () => void,
  isExpanded: boolean
}) => (
  <button
    onClick={onClick}
    title={!isExpanded ? label : undefined}
    className={`flex items-center space-x-3 w-full p-3.5 rounded-xl transition-all duration-300 font-medium relative overflow-hidden ${
      active 
        ? 'bg-brand-100 text-brand-700 shadow-sm' 
        : 'text-slate-500 hover:bg-white hover:text-brand-600 hover:shadow-soft'
    } ${!isExpanded && 'justify-center px-0'}`}
  >
    <Icon size={22} strokeWidth={active ? 2.5 : 2} className="shrink-0" />
    <span className={`font-display tracking-wide whitespace-nowrap transition-all duration-300 ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 absolute left-12'}`}>
      {label}
    </span>
  </button>
);

export const Sidebar: React.FC<NavigationProps> = ({ currentView, setView }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`hidden md:flex flex-col bg-cream/50 border-r border-slate-200 h-screen sticky top-0 backdrop-blur-md transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)] z-50 ${isHovered ? 'w-72 px-6' : 'w-20 px-3'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`flex items-center ${isHovered ? 'space-x-3 pl-2' : 'justify-center'} mb-12 mt-6 transition-all duration-300`}>
        <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-500/30 transform rotate-3 shrink-0">
          <GraduationCap size={24} />
        </div>
        <div className={`transition-opacity duration-300 overflow-hidden whitespace-nowrap ${isHovered ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden'}`}>
          <h1 className="text-2xl font-display font-extrabold text-slate-800 tracking-tight">
            DSE<span className="text-brand-600">asy.ai</span>
          </h1>
          <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">HK's Smartest Tutor</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar overflow-x-hidden pb-4">
        <NavItem 
          icon={LayoutDashboard} 
          label="Dashboard" 
          active={currentView === 'dashboard'} 
          onClick={() => setView('dashboard')}
          isExpanded={isHovered} 
        />
        <NavItem 
          icon={Layers} 
          label="Mock Exam Hub" 
          active={currentView === 'mock-exam-hub'} 
          onClick={() => setView('mock-exam-hub')}
          isExpanded={isHovered} 
        />
        <NavItem 
          icon={MessageSquare} 
          label="AI Chat Tutor" 
          active={currentView === 'chat'} 
          onClick={() => setView('chat')} 
          isExpanded={isHovered}
        />
        <NavItem 
          icon={Mic} 
          label="Speaking Coach" 
          active={currentView === 'speaking-coach'} 
          onClick={() => setView('speaking-coach')} 
          isExpanded={isHovered}
        />
        <NavItem 
          icon={BrainCircuit} 
          label="Drill & Quiz" 
          active={currentView === 'quiz'} 
          onClick={() => setView('quiz')} 
          isExpanded={isHovered}
        />
        <NavItem 
          icon={AlertOctagon} 
          label="Mistake Vault" 
          active={currentView === 'mistake-vault'} 
          onClick={() => setView('mistake-vault')} 
          isExpanded={isHovered}
        />
        <NavItem 
          icon={FileText} 
          label="Past Papers" 
          active={currentView === 'papers'} 
          onClick={() => setView('papers')} 
          isExpanded={isHovered}
        />
        <NavItem 
          icon={PenTool} 
          label="Essay Grader" 
          active={currentView === 'essay'} 
          onClick={() => setView('essay')} 
          isExpanded={isHovered}
        />
        <NavItem 
          icon={BookMarked} 
          label="Study Notes" 
          active={currentView === 'notes'} 
          onClick={() => setView('notes')} 
          isExpanded={isHovered}
        />
      </nav>

      <div className="mt-auto space-y-4 pt-4 pb-6 border-t border-slate-200/50">
        <div className={`bg-gradient-to-br from-brand-600 to-brand-700 rounded-2xl p-5 text-white shadow-lg shadow-brand-500/20 relative overflow-hidden group cursor-pointer transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 h-0 p-0 overflow-hidden hidden'}`}>
           <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full transform translate-x-10 -translate-y-10"></div>
           <p className="text-xs text-brand-200 mb-1 font-bold uppercase tracking-wider">Pro Plan</p>
           <p className="text-lg font-display font-bold flex justify-between items-center">
             Unlimited
             <span className="bg-white/20 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-sm">Active</span>
           </p>
           <p className="text-xs text-brand-200 mt-2">Valid until DSE 2025</p>
        </div>

        <button 
          className={`flex items-center space-x-3 text-slate-400 hover:text-red-500 transition-colors w-full p-2 font-medium text-sm ${!isHovered && 'justify-center'}`}
          title={!isHovered ? "Sign Out" : undefined}
        >
          <LogOut size={20} />
          <span className={`transition-opacity duration-200 whitespace-nowrap ${isHovered ? 'opacity-100' : 'opacity-0 hidden'}`}>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export const MobileNav: React.FC<NavigationProps> = ({ currentView, setView }) => {
  return (
    <div className="md:hidden fixed bottom-4 left-4 right-4 bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl shadow-slate-200/50 border border-white p-2 flex justify-around z-50">
      <button 
        onClick={() => setView('dashboard')}
        className={`p-3 rounded-2xl transition-all ${currentView === 'dashboard' ? 'bg-brand-100 text-brand-600' : 'text-slate-400'}`}
      >
        <LayoutDashboard size={24} />
      </button>
      <button 
        onClick={() => setView('speaking-coach')}
        className={`p-3 rounded-2xl transition-all ${currentView === 'speaking-coach' ? 'bg-brand-100 text-brand-600' : 'text-slate-400'}`}
      >
        <Mic size={24} />
      </button>
      <div className="-mt-10">
        <button onClick={() => setView('quiz')} className="bg-brand-600 p-4 rounded-full shadow-glow text-white border-4 border-[#FAF9F6] transform transition-transform active:scale-95">
          <BrainCircuit size={24} />
        </button>
      </div>
      <button 
        onClick={() => setView('mistake-vault')}
        className={`p-3 rounded-2xl transition-all ${currentView === 'mistake-vault' ? 'bg-brand-100 text-brand-600' : 'text-slate-400'}`}
      >
        <AlertOctagon size={24} />
      </button>
      <button 
        onClick={() => setView('mock-exam-hub')}
        className={`p-3 rounded-2xl transition-all ${currentView === 'mock-exam-hub' ? 'bg-brand-100 text-brand-600' : 'text-slate-400'}`}
      >
        <Layers size={24} />
      </button>
    </div>
  );
};
