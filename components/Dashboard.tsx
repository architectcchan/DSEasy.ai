
import React, { useEffect, useState } from 'react';
import { UserStats, Subject, Level, UserProfile, StudyTask, SubjectReadiness, DashboardInsight } from '../types';
import { generateStudyPlan, generateDashboardInsight } from '../services/geminiService';
import { SUBJECT_ICONS, HKDSE_SKILL_TREE } from '../constants';
import { 
  Trophy, Flame, Zap, TrendingUp, ArrowRight, 
  BookMarked, Activity, ChevronDown, Calendar, 
  AlertOctagon, Crosshair, BrainCircuit, Sparkles, 
  Lightbulb, BarChart3, Target, Search, ArrowLeft,
  Bot, Hexagon, GraduationCap, Clock, Gamepad2
} from 'lucide-react';

interface DashboardProps {
  stats: UserStats;
  userProfile: UserProfile;
  subjects: Subject[];
  selectedLevel: Level;
  onSelectLevel: (l: Level) => void;
  onSelectSubject: (s: Subject) => void;
  onQuickAction: (action: string, payload?: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  stats, 
  userProfile,
  selectedLevel,
  onSelectLevel,
  onQuickAction 
}) => {
  const [studyPlan, setStudyPlan] = useState<StudyTask[]>([]);
  const [activeHeatmapSubject, setActiveHeatmapSubject] = useState<Subject>(Subject.MATH);
  const [viewMode, setViewMode] = useState<'overview' | 'full_report'>('overview');
  const [insight, setInsight] = useState<DashboardInsight | null>(null);

  useEffect(() => {
    const init = async () => {
      const plan = await generateStudyPlan(userProfile);
      setStudyPlan(plan);
      const aiInsight = await generateDashboardInsight(userProfile, stats);
      setInsight(aiInsight);
    };
    init();
  }, [userProfile]);

  // DSE Countdown Calculation
  const dseDate = new Date('2025-04-21'); // Mock DSE Date
  const today = new Date();
  const daysLeft = Math.ceil((dseDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  // 5-Point Radar Chart Logic for Subjects
  const radarSubjects = [
    Subject.MATH, 
    Subject.ENG, 
    Subject.CHI, 
    userProfile.electives[0] || Subject.CSD, 
    userProfile.electives[1] || Subject.PHY
  ];
  
  // Mock Scores for Radar (0.0 to 1.0)
  const radarScores = [0.78, 0.62, 0.55, 0.88, 0.70];

  const getRadarPoints = () => {
    const base = 100; // Center
    const radius = 80;
    const angleStep = (Math.PI * 2) / 5;
    
    const points = radarScores.map((v, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const x = base + Math.cos(angle) * (radius * v);
        const y = base + Math.sin(angle) * (radius * v);
        return `${x},${y}`;
    }).join(' ');
    
    return points;
  };

  const getRadarLabelPos = (i: number) => {
     const angleStep = (Math.PI * 2) / 5;
     const angle = i * angleStep - Math.PI / 2;
     const radius = 95; // slightly outside
     const x = 100 + Math.cos(angle) * radius;
     const y = 100 + Math.sin(angle) * radius;
     return { x, y };
  };

  const getHeatmapColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 75) return 'bg-brand-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Drill Down Data (Specific Skills for active subject)
  const activeTree = HKDSE_SKILL_TREE[activeHeatmapSubject] || {};

  // ---- FULL REPORT VIEW ----
  if (viewMode === 'full_report') {
    return (
      <div className="p-6 md:p-10 space-y-10 max-w-7xl mx-auto animate-in fade-in relative">
        <div className="flex items-center space-x-4">
          <button onClick={() => setViewMode('overview')} className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-display font-extrabold text-slate-800">Comprehensive Readiness Report</h1>
        </div>
        
        <div className="grid gap-8">
          {[Subject.MATH, Subject.ENG, Subject.CHI, ...userProfile.electives].map((subj) => {
             const tree = HKDSE_SKILL_TREE[subj] || {};
             const Icon = SUBJECT_ICONS[subj] || Activity;
             
             return (
               <div key={subj} className="bg-white/80 backdrop-blur-sm border border-slate-100 rounded-3xl p-8 shadow-soft hover:shadow-lg transition-all">
                  <div className="flex items-center space-x-4 mb-6 border-b border-slate-50 pb-4">
                    <div className="bg-brand-50 p-3 rounded-xl text-brand-600">
                      <Icon size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">{subj}</h2>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {Object.entries(tree).map(([component, skills]) => (
                      <div key={component}>
                        <h3 className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wider">{component}</h3>
                        <div className="space-y-3">
                          {skills.map((skill: string) => {
                            const score = Math.floor(Math.random() * 40) + 50; 
                            return (
                              <div key={skill} className="group">
                                <div className="flex justify-between text-sm font-medium mb-1">
                                  <span className="text-slate-600 group-hover:text-brand-600 transition-colors">{skill}</span>
                                  <span className="text-slate-400 text-xs">{score}%</span>
                                </div>
                                <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                                   <div className={`h-full rounded-full ${getHeatmapColor(score)}`} style={{ width: `${score}%` }}></div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
             );
          })}
        </div>
      </div>
    );
  }

  // ---- MAIN OVERVIEW ----
  return (
    <div className="p-6 md:p-10 space-y-8 pb-32 md:pb-10 max-w-7xl mx-auto animate-in fade-in duration-500 relative">
      
      {/* APEX MASCOT */}
      <div className="fixed bottom-8 right-8 z-50 hidden lg:block animate-float">
         <div className="relative group">
             {/* Speech Bubble */}
             <div className="absolute bottom-full right-0 mb-4 w-64 bg-white p-5 rounded-2xl rounded-br-none shadow-xl border border-slate-100 opacity-100 transition-all transform translate-y-0">
                 <p className="text-sm font-bold text-slate-700 mb-1">
                     Hello, {userProfile.name.split(' ')[0]}! 👋
                 </p>
                 <p className="text-xs text-slate-500">
                     {insight ? insight.description : "Let's get that 5** today."}
                 </p>
             </div>
             
             {/* Character */}
             <div className="bg-gradient-to-tr from-brand-600 to-emerald-500 w-16 h-16 rounded-2xl shadow-glow flex items-center justify-center text-white cursor-pointer hover:scale-110 transition-transform">
                 <Bot size={36} />
                 <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-400 rounded-full border-2 border-white animate-pulse"></div>
             </div>
         </div>
      </div>

      {/* Header Section - Dashboard Hero */}
      <div id="dashboard-hero" className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
             <h1 className="text-4xl font-display font-extrabold text-slate-800 tracking-tight">
                Dashboard
             </h1>
             <span className="bg-brand-100 text-brand-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{userProfile.level}</span>
          </div>
          <p className="text-slate-500 font-medium text-lg">Your readiness for 5* is trending up.</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="bg-white/80 backdrop-blur px-4 py-2.5 rounded-2xl border border-white shadow-sm flex items-center space-x-3">
             <div className="bg-red-50 p-2 rounded-lg text-red-500">
                 <Clock size={18} />
             </div>
             <div>
                 <p className="text-[10px] font-bold text-slate-400 uppercase">DSE Countdown</p>
                 <p className="text-sm font-extrabold text-slate-800">{daysLeft} Days Left</p>
             </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur px-4 py-2.5 rounded-2xl border border-white shadow-sm flex items-center space-x-3">
             <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600">
                 <Target size={18} />
             </div>
             <div>
                 <p className="text-[10px] font-bold text-slate-400 uppercase">Uni Target</p>
                 <p className="text-sm font-extrabold text-slate-800">{userProfile.targetGrade}</p>
             </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: TOP ACTION GRID (Daily Quiz + Expanded Study Plan) */}
      <div className="grid lg:grid-cols-3 gap-6 relative z-10">
          {/* Left: Daily Quiz (High Prominence) */}
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group hover:shadow-xl transition-all flex flex-col justify-between min-h-[240px]">
                <div className="absolute top-0 right-0 w-48 h-48 bg-brand-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>
                
                <div className="relative z-10 flex justify-between items-start">
                    <div className="flex items-center text-orange-400 font-bold text-xs bg-white/10 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                        <Flame size={14} className="mr-1" fill="currentColor" /> DAILY STREAK: {stats.streak}
                    </div>
                    <div className="bg-white/10 p-3 rounded-2xl backdrop-blur border border-white/10">
                       <BrainCircuit size={24} />
                    </div>
                </div>

                <div className="relative z-10 mt-4">
                    <h3 className="font-display font-bold text-2xl mb-2">Quiz of the Day</h3>
                    <p className="text-slate-300 text-sm mb-6 leading-relaxed">Fresh DSE-style questions mixed from your electives. Keep your streak alive and boost your XP multiplier!</p>
                    
                    <button 
                       onClick={() => onQuickAction('quiz_daily')}
                       className="bg-white text-slate-900 py-3.5 px-6 rounded-xl font-bold text-sm hover:bg-brand-50 transition-colors flex items-center w-fit"
                    >
                       Start Challenge <ArrowRight size={16} className="ml-2" />
                    </button>
                </div>
                
                <div className="absolute bottom-4 right-6 text-[10px] font-mono text-slate-500">
                    ~10 Mins • +500 XP
                </div>
          </div>

          {/* Right: Daily AI Study Plan (Expanded View) */}
          <div className="lg:col-span-2 bg-brand-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-lg shadow-brand-500/20">
               <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl transform translate-x-10 -translate-y-10"></div>
               <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-500 opacity-20 rounded-full blur-3xl"></div>
               
               <h3 className="font-display font-bold text-xl mb-6 flex items-center relative z-10">
                   <Sparkles size={20} className="mr-2 text-yellow-300" fill="currentColor" /> Daily AI Study Plan
               </h3>

               <div className="grid md:grid-cols-2 gap-4 relative z-10">
                   {/* Task 1 */}
                   <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-5 hover:bg-white/20 transition-all cursor-pointer group" onClick={() => onQuickAction('drill', studyPlan[0]?.subject)}>
                       <div className="flex justify-between items-start mb-3">
                           <div className="bg-brand-500/40 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center">
                               <Crosshair size={10} className="mr-1"/> Drill
                           </div>
                           <span className="text-xs font-bold text-brand-200 group-hover:text-white transition-colors">+120 XP</span>
                       </div>
                       <h4 className="font-bold text-lg mb-1 leading-tight">DSE Maths Drill: Functions & Graphs Essentials</h4>
                       <p className="text-xs text-brand-100 opacity-80 mb-4 line-clamp-2">Sharpen your skills in identifying function types, sketching graphs, and interpreting intercepts/