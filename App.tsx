
import React, { useState, useEffect } from 'react';
import { Sidebar, MobileNav } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { ChatTutor } from './components/ChatTutor';
import { QuizArena } from './components/QuizArena';
import { EssayGrader } from './components/EssayGrader';
import { PaperLibrary } from './components/PaperLibrary';
import { MockExam } from './components/MockExam';
import { MockExamHub } from './components/MockExamHub';
import { Onboarding } from './components/Onboarding';
import { MistakeVault } from './components/MistakeVault';
import { SpeakingCoach } from './components/SpeakingCoach';
import { StudyNotes } from './components/StudyNotes';
import { LearningGame } from './components/LearningGame';
import { Tutorial } from './components/Tutorial';
import { AppView, Subject, UserStats, PastPaper, Level, UserProfile, MistakeRecord, QuizQuestion } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('onboarding');
  const [selectedSubject, setSelectedSubject] = useState<Subject>(Subject.MATH);
  const [selectedLevel, setSelectedLevel] = useState<Level>(Level.S4);
  const [selectedPaper, setSelectedPaper] = useState<PastPaper | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  // Mistake Vault State
  const [mistakes, setMistakes] = useState<MistakeRecord[]>([]);

  // For handling special quiz modes (e.g. daily)
  const [quizMode, setQuizMode] = useState<'standard' | 'daily'>('standard');
  
  const [showTutorial, setShowTutorial] = useState(false);

  const [stats, setStats] = useState<UserStats>({
    xp: 1240,
    level: 5,
    streak: 14,
    questionsAsked: 84,
    topicsMastered: 12,
    subjectActivity: {
        'Mathematics': 45,
        'Science': 22,
        'English': 17
    }
  });

  const handleOnboardingComplete = (profile: UserProfile) => {
    setUserProfile(profile);
    setSelectedLevel(profile.level);
    if (profile.electives.length > 0) setSelectedSubject(profile.electives[0]);
    setCurrentView('dashboard');
    setShowTutorial(true);
  };

  const handleSubjectSelect = (sub: Subject) => {
    setSelectedSubject(sub);
    setCurrentView('chat');
    setStats(prev => ({ ...prev, questionsAsked: prev.questionsAsked + 1 }));
  };

  const handleQuizComplete = (earnedXp: number) => {
    setStats(prev => ({
      ...prev,
      xp: prev.xp + earnedXp,
    }));
  };
  
  const handleMistake = (question: QuizQuestion, wrongIndex: number, subject: Subject, userAnswerText?: string) => {
    const newMistake: MistakeRecord = {
        id: Date.now().toString(),
        subject: subject,
        question: question,
        userAnswerIndex: wrongIndex,
        userAnswerText: userAnswerText,
        timestamp: Date.now(),
    };
    setMistakes(prev => [newMistake, ...prev]);
  };
  
  const handleResolveMistake = (id: string) => {
    setMistakes(prev => prev.filter(m => m.id !== id));
    setStats(prev => ({ ...prev, xp: prev.xp + 50 })); // Reward for fixing mistake
  };

  const handleAddReflection = (id: string, type: 'Careless' | 'Concept' | 'Time', note: string) => {
    setMistakes(prev => prev.map(m => {
        if (m.id === id) return { ...m, errorType: type, reflectionNote: note };
        return m;
    }));
  };

  const handleSimulateExam = (paper: PastPaper) => {
    setSelectedPaper(paper);
    setCurrentView('mock-exam');
  };

  const handleQuickAction = (action: string, payload?: any) => {
    if(action === 'quiz') {
        if (payload) setSelectedSubject(payload as Subject);
        setQuizMode('standard');
        setCurrentView('quiz');
    } else if (action === 'quiz_daily') {
        setQuizMode('daily');
        setCurrentView('quiz');
    } else if (action === 'essay') {
        setCurrentView('essay');
    } else if (action === 'notes') {
        setCurrentView('notes');
    } else if (action === 'paper') {
        setCurrentView('mock-exam-hub');
    } else if (action === 'review') {
        setCurrentView('notes');
    } else if (action === 'drill') {
        if (payload) setSelectedSubject(payload as Subject);
        setQuizMode('standard');
        setCurrentView('quiz');
    } else if (action === 'game') {
        setCurrentView('game');
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'onboarding':
        return <Onboarding onComplete={handleOnboardingComplete} />;
      case 'dashboard':
        return (
          <Dashboard 
            stats={stats} 
            userProfile={userProfile!}
            subjects={Object.values(Subject)} 
            selectedLevel={selectedLevel}
            onSelectLevel={setSelectedLevel}
            onSelectSubject={handleSubjectSelect}
            onQuickAction={handleQuickAction}
          />
        );
      case 'chat':
        return <ChatTutor subject={selectedSubject} level={selectedLevel} onClose={() => setCurrentView('dashboard')} />;
      case 'quiz':
        return (
          <QuizArena 
            subject={selectedSubject} 
            level={selectedLevel} 
            mode={quizMode}
            onComplete={handleQuizComplete} 
            onBack={() => setCurrentView('dashboard')}
            onMistake={handleMistake}
          />
        );
      case 'essay':
        return <EssayGrader level={selectedLevel} />;
      case 'speaking-coach':
        return <SpeakingCoach />;
      case 'mistake-vault':
        return <MistakeVault mistakes={mistakes} onResolveMistake={handleResolveMistake} onAddReflection={handleAddReflection} />;
      case 'papers':
        return <PaperLibrary onSimulateExam={handleSimulateExam} />;
      case 'mock-exam-hub':
        return <MockExamHub userProfile={userProfile!} onStartExam={handleSimulateExam} />;
      case 'mock-exam':
        if (selectedPaper) {
          return (
            <MockExam 
              paper={selectedPaper} 
              onClose={() => setCurrentView('mock-exam-hub')} 
              onComplete={handleQuizComplete}
            />
          );
        }
        return <MockExamHub userProfile={userProfile!} onStartExam={handleSimulateExam} />;
      case 'notes':
        return <StudyNotes />;
      case 'game':
        return <LearningGame onBack={() => setCurrentView('dashboard')} />;
      default:
        return <div>Not Found</div>;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FAF9F6] text-slate-800 font-sans selection:bg-brand-100 selection:text-brand-900 bg-grid-pattern relative">
       {/* GLOBAL ANIMATED BACKGROUND */}
       <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none fixed">
          <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-accent-light rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>
      
      {currentView !== 'onboarding' && <Sidebar currentView={currentView} setView={setCurrentView} />}
      <main className={`flex-1 overflow-x-hidden relative ${currentView === 'onboarding' ? 'w-full' : ''}`}>
        {renderContent()}
      </main>
      {currentView !== 'onboarding' && <MobileNav currentView={currentView} setView={setCurrentView} />}
      
      {showTutorial && <Tutorial onComplete={() => setShowTutorial(false)} />}
    </div>
  );
};

export default App;
