
import React, { useState } from 'react';
import { Level, Subject, UserProfile, Role } from '../types';
import { GraduationCap, ArrowRight, Sparkles, User, BookOpen, Users, PlayCircle } from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  // State for Multi-Step Wizard
  const [step, setStep] = useState(1);
  const TOTAL_STEPS = 6;
  
  // Profile Data
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>(Role.STUDENT);
  const [level, setLevel] = useState<Level>(Level.S4);
  const [examYear, setExamYear] = useState('2026');
  const [targetGrade, setTargetGrade] = useState('5*');
  const [targetUni, setTargetUni] = useState('');
  const [electives, setElectives] = useState<Subject[]>([]);
  const [currentGrades, setCurrentGrades] = useState<Record<string, string>>({});
  const [learningStyle, setLearningStyle] = useState<string[]>([]);
  const [studySchedule, setStudySchedule] = useState('Evening');

  // Helper: Toggle Electives
  const handleElectiveToggle = (subj: Subject) => {
    if (electives.includes(subj)) {
      setElectives(electives.filter(e => e !== subj));
    } else {
      if (electives.length < 3) setElectives([...electives, subj]);
    }
  };

  // Helper: Handle Grade Input
  const handleGradeChange = (subj: string, grade: string) => {
    setCurrentGrades(prev => ({ ...prev, [subj]: grade }));
  };

  // Step Navigation
  const handleNext = () => {
    if (step === TOTAL_STEPS) {
      onComplete({
        name,
        role,
        level,
        examYear,
        electives,
        targetGrade,
        targetUni,
        currentGrades,
        learningStyle,
        studySchedule,
        weaknesses: ['General Foundation'] // Default since diagnostic is removed
      });
    } else {
      setStep(step + 1);
    }
  };

  // Render Steps
  const renderStep = () => {
    switch (step) {
        case 1: // Auth / Welcome
            return (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-8">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-brand-600 shadow-glow">
                            <GraduationCap size={32} />
                        </div>
                        <h1 className="text-3xl font-display font-bold text-slate-800">Welcome to DSE.ai</h1>
                        <p className="text-slate-500 mt-2">Your personalized path to 5** starts here.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">What's your name?</label>
                        <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-lg"
                            placeholder="e.g. Alex Chan"
                        />
                    </div>
                </div>
            );
        case 2: // Role Selection
            return (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-8">
                    <div className="text-center">
                         <h2 className="text-2xl font-display font-bold text-slate-800">How will you use DSE.ai?</h2>
                    </div>
                    <div className="grid gap-4">
                        {[
                            { r: Role.STUDENT, icon: User, desc: "I'm preparing for my exams" },
                            { r: Role.TUTOR, icon: BookOpen, desc: "I want resources for students" },
                            { r: Role.PARENT, icon: Users, desc: "I'm monitoring progress" }
                        ].map((item) => (
                            <button
                                key={item.r}
                                onClick={() => setRole(item.r)}
                                className={`flex items-center p-5 rounded-2xl border-2 transition-all ${role === item.r ? 'border-brand-500 bg-brand-50' : 'border-slate-100 hover:border-brand-200'}`}
                            >
                                <div className={`p-3 rounded-full mr-4 ${role === item.r ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                    <item.icon size={20} />
                                </div>
                                <div className="text-left">
                                    <h3 className={`font-bold ${role === item.r ? 'text-brand-800' : 'text-slate-700'}`}>{item.r}</h3>
                                    <p className="text-sm text-slate-500">{item.desc}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            );
        case 3: // Goal Setting
            return (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-8 text-center">
                    <h2 className="text-2xl font-display font-bold text-slate-800">Set Your Target</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">DSE Year</label>
                            <div className="flex justify-center gap-3">
                                {['2025', '2026', '2027'].map(y => (
                                    <button key={y} onClick={() => setExamYear(y)} className={`px-6 py-3 rounded-xl font-bold border-2 ${examYear === y ? 'border-brand-500 bg-brand-600 text-white' : 'border-slate-200 text-slate-500'}`}>
                                        {y}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Dream Grade</label>
                            <div className="flex justify-center gap-3">
                                {['4', '5', '5*', '5**'].map(g => (
                                    <button key={g} onClick={() => setTargetGrade(g)} className={`w-14 h-14 rounded-xl font-bold border-2 text-lg ${targetGrade === g ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-400'}`}>
                                        {g}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Target University (Optional)</label>
                            <input type="text" value={targetUni} onChange={(e) => setTargetUni(e.target.value)} placeholder="e.g. HKU Medicine" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-center font-medium" />
                        </div>
                    </div>
                </div>
            );
        case 4: // Subjects & Status
             return (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-8">
                    <div className="text-center">
                        <h2 className="text-2xl font-display font-bold text-slate-800">Your Subject Mix</h2>
                        <p className="text-slate-500 text-sm">Select up to 3 Electives (Core subjects assumed)</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto custom-scrollbar">
                        {[Subject.PHY, Subject.CHEM, Subject.BIO, Subject.ECON, Subject.BAFS, Subject.HIST, Subject.GEOG, Subject.M1, Subject.M2].map((s) => (
                            <button 
                                key={s} 
                                onClick={() => handleElectiveToggle(s)}
                                className={`p-3 rounded-xl text-sm font-bold border-2 transition-all ${electives.includes(s) ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-100 text-slate-500'}`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl">
                        <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Current Performance (Est.)</h3>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-slate-700">English</span>
                                <select className="bg-white border border-slate-200 rounded-lg text-sm p-1" onChange={(e) => handleGradeChange('ENG', e.target.value)}>
                                    <option>Level...</option><option>3</option><option>4</option><option>5</option><option>5*</option>
                                </select>
                            </div>
                            {electives.slice(0, 2).map(s => (
                                <div key={s} className="flex items-center justify-between">
                                <span className="text-sm font-bold text-slate-700 truncate max-w-[150px]">{s}</span>
                                <select className="bg-white border border-slate-200 rounded-lg text-sm p-1" onChange={(e) => handleGradeChange(s, e.target.value)}>
                                    <option>Level...</option><option>3</option><option>4</option><option>5</option><option>5*</option>
                                </select>
                            </div>
                            ))}
                        </div>
                    </div>
                </div>
             );
        case 5: // Learning Preferences
             return (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-8">
                     <div className="text-center">
                        <h2 className="text-2xl font-display font-bold text-slate-800">How do you learn best?</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Learning Style</label>
                            <div className="flex flex-wrap gap-2">
                                {['Visual (Videos)', 'Reading (Notes)', 'Practice (Drills)'].map(style => (
                                    <button 
                                        key={style}
                                        onClick={() => {
                                            if(learningStyle.includes(style)) setLearningStyle(learningStyle.filter(s=>s!==style));
                                            else setLearningStyle([...learningStyle, style]);
                                        }}
                                        className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${learningStyle.includes(style) ? 'bg-slate-800 text-white border-slate-800' : 'bg-white border-slate-200 text-slate-500'}`}
                                    >
                                        {style}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Preferred Study Time</label>
                            <div className="grid grid-cols-2 gap-2">
                                {['After School (4-6pm)', 'Evening (7-9pm)', 'Late Night (10pm+)', 'Weekends'].map(t => (
                                    <button 
                                        key={t}
                                        onClick={() => setStudySchedule(t)}
                                        className={`p-3 rounded-xl text-xs font-bold border transition-all ${studySchedule === t ? 'bg-brand-50 border-brand-500 text-brand-700' : 'bg-white border-slate-200 text-slate-500'}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
             );
        case 6: // Aha Moment
             return (
                <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700 text-center pt-4">
                    <div className="relative inline-block">
                        <Sparkles className="absolute -top-6 -right-6 text-yellow-400 animate-pulse" size={40} />
                        <h1 className="text-4xl font-display font-extrabold text-slate-800">Plan Ready!</h1>
                    </div>
                    
                    <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100 relative overflow-hidden">
                         <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-500 to-teal-400"></div>
                         <div className="grid grid-cols-3 divide-x divide-slate-100 mb-6">
                             <div>
                                 <p className="text-xs font-bold text-slate-400 uppercase">Target</p>
                                 <p className="text-2xl font-extrabold text-brand-600">{targetGrade}</p>
                             </div>
                             <div>
                                 <p className="text-xs font-bold text-slate-400 uppercase">Current</p>
                                 <p className="text-2xl font-extrabold text-slate-700">Lv 3-4</p>
                             </div>
                             <div>
                                 <p className="text-xs font-bold text-slate-400 uppercase">Gap</p>
                                 <p className="text-2xl font-extrabold text-red-400">+1 Level</p>
                             </div>
                         </div>
                         
                         <div className="bg-brand-50 p-4 rounded-2xl text-left mb-4">
                             <div className="flex items-center mb-2 text-brand-700 font-bold text-sm">
                                 <PlayCircle size={16} className="mr-2" />
                                 Your Priority Task
                             </div>
                             <p className="text-slate-700 font-medium">
                                 Complete a full 30-min Mock Exam for baseline calibration.
                             </p>
                         </div>
                    </div>
                    
                    <p className="text-slate-500 text-sm max-w-xs mx-auto">
                        Apex AI has tailored a schedule for your {studySchedule} sessions.
                    </p>
                </div>
             );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] p-4 md:p-6">
      <div className="max-w-lg w-full bg-white p-8 md:p-10 rounded-[2rem] shadow-2xl shadow-slate-200/60 relative overflow-hidden border border-white">
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-50">
            <div className="h-full bg-brand-600 transition-all duration-500" style={{ width: `${(step/TOTAL_STEPS)*100}%` }}></div>
        </div>

        {/* Step Content */}
        <div className="min-h-[400px] flex flex-col justify-center">
            {renderStep()}
        </div>

        {/* Footer Controls */}
        <div className="mt-8 flex justify-between items-center">
             {step > 1 && (
                 <button onClick={() => setStep(step - 1)} className="text-slate-400 font-bold text-sm hover:text-slate-600">Back</button>
             )}
             <div className="flex-1"></div>
             <button
                onClick={handleNext}
                disabled={step === 1 && !name || step === 2 && !role}
                className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3.5 rounded-2xl font-bold flex items-center transition-all shadow-lg shadow-brand-500/20 hover:scale-105"
             >
                {step === TOTAL_STEPS ? (
                    <>Start Learning <ArrowRight className="ml-2" size={18} /></>
                ) : (
                    <>Next <ArrowRight className="ml-2" size={18} /></>
                )}
             </button>
        </div>
      </div>
    </div>
  );
};
