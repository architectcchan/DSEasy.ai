
import React, { useState, useEffect } from 'react';
import { Subject, QuizQuestion, Level, ShortAnswerFeedback } from '../types';
import { generateQuiz, evaluateShortAnswer } from '../services/geminiService';
import { BrainCircuit, Check, X, Trophy, ArrowRight, Loader2, RefreshCw, Medal, Calendar, BarChart, Target, Zap, Shield, Keyboard, PenTool } from 'lucide-react';

interface QuizArenaProps {
  subject: Subject;
  level: Level;
  mode?: 'standard' | 'daily';
  onComplete: (xp: number) => void;
  onBack: () => void;
  onMistake: (question: QuizQuestion, wrongIndex: number, subject: Subject, userAnswerText?: string) => void;
}

export const QuizArena: React.FC<QuizArenaProps> = ({ subject, level, mode = 'standard', onComplete, onBack, onMistake }) => {
  const [view, setView] = useState<'lobby' | 'quiz' | 'result'>('lobby');
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // MC State
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  
  // Short Answer State
  const [userTextInput, setUserTextInput] = useState('');
  const [shortFeedback, setShortFeedback] = useState<ShortAnswerFeedback | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [difficulty, setDifficulty] = useState<'Mixed' | 'Foundation' | 'DSE' | '5**'>('Mixed');

  // Simulated readiness stats
  const readiness = 68; 

  const topics = {
    [Subject.MATH]: ['Quadratic Equations', 'Circle Geometry', 'Probability', 'Calculus (M1/M2)'],
    [Subject.ENG]: ['Paper 1 Reading', 'Grammar & Usage', 'Vocabulary Expansion'],
    [Subject.CHI]: ['Reading Comprehension', 'Classical Chinese', 'Writing Techniques'],
    [Subject.CSD]: ['National Security', 'Global Public Health', 'Sustainable Development'],
    [Subject.PHY]: ['Force & Motion', 'Wave Motion', 'Electricity & Magnetism'],
    [Subject.CHEM]: ['Fossil Fuels', 'Microscopic World', 'Acids and Bases'],
    [Subject.ECON]: ['Demand and Supply', 'Market Structure', 'Macroeconomics']
  };

  useEffect(() => {
    if (mode === 'daily' && view === 'lobby') {
        setTopic('Daily Challenge');
        startQuiz('Mixed DSE Topics (Math/Eng/Liberal Studies)');
    }
  }, [mode]);

  const startQuiz = async (selectedTopic: string) => {
    setIsLoading(true);
    setView('quiz');
    const generatedQuestions = await generateQuiz(subject, selectedTopic, level);
    setQuestions(generatedQuestions);
    setIsLoading(false);
  };

  const handleMCAnswer = (index: number) => {
    if (showResult) return;
    setSelectedOption(index);
    setShowResult(true);
    
    const currentQ = questions[currentIndex];
    if (index === currentQ.correctIndex) {
      setScore(s => s + 1);
    } else {
      onMistake(currentQ, index, subject);
    }
  };

  const handleShortSubmit = async () => {
    if (!userTextInput.trim() || isEvaluating) return;
    setIsEvaluating(true);
    const currentQ = questions[currentIndex];
    
    const evaluation = await evaluateShortAnswer(userTextInput, currentQ);
    setShortFeedback(evaluation);
    setShowResult(true);
    setIsEvaluating(false);

    if (evaluation.isCorrect) {
        setScore(s => s + 1);
    } else {
        onMistake(currentQ, -1, subject, userTextInput);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(c => c + 1);
      // Reset States
      setSelectedOption(null);
      setUserTextInput('');
      setShortFeedback(null);
      setShowResult(false);
    } else {
      setView('result');
      onComplete(score * 50); 
    }
  };

  // --- LOBBY VIEW ---
  if (view === 'lobby') {
    return (
      <div className="p-6 md:p-10 max-w-6xl mx-auto animate-in fade-in">
        <div className="flex items-center mb-8">
           <button onClick={onBack} className="mr-4 p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
             <ArrowRight className="transform rotate-180" size={24} />
           </button>
           <div>
             <h2 className="text-3xl font-display font-bold text-slate-800">{subject} Arena</h2>
             <p className="text-slate-500 font-medium">Test your skills and build exam readiness.</p>
           </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {/* Quiz of the Day */}
          <div className="bg-gradient-to-br from-amber-100 to-orange-50 p-6 rounded-3xl border border-amber-200 shadow-sm relative overflow-hidden group cursor-pointer transition-all hover:scale-[1.02]"
               onClick={() => { setTopic('Daily Mix'); startQuiz('Mixed Topics'); }}>
             <div className="absolute top-0 right-0 bg-white/30 w-32 h-32 rounded-full blur-2xl -mr-10 -mt-10"></div>
             <div className="relative z-10">
                <div className="bg-white w-12 h-12 rounded-xl flex items-center justify-center text-amber-500 mb-4 shadow-sm">
                   <Calendar size={24} />
                </div>
                <h3 className="text-xl font-bold text-amber-900 mb-1">Quiz of the Day</h3>
                <p className="text-amber-700/80 text-sm mb-4">Daily 5-question mix to keep you sharp.</p>
                <button className="bg-white text-amber-600 px-4 py-2 rounded-lg text-sm font-bold shadow-sm">Start Now</button>
             </div>
          </div>

          {/* Readiness Stat */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
             <div className="flex justify-between items-start mb-4">
                <div>
                   <h3 className="font-bold text-slate-700">Readiness</h3>
                   <p className="text-xs text-slate-400">Based on recent performance</p>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg text-slate-400">
                   <BarChart size={20} />
                </div>
             </div>
             <div className="relative pt-2">
                <div className="flex justify-between text-sm font-bold text-slate-600 mb-2">
                   <span>Level 4</span>
                   <span className="text-brand-600">Level 5**</span>
                </div>
                <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                   <div className="h-full bg-gradient-to-r from-teal-400 to-brand-500 rounded-full" style={{ width: `${readiness}%` }}></div>
                </div>
                <p className="text-right text-xs font-bold text-brand-500 mt-2">{readiness}% to 5**</p>
             </div>
          </div>

          {/* Difficulty Setting */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
             <h3 className="font-bold text-slate-700 mb-4">Select Difficulty</h3>
             <div className="space-y-2">
                {(['Foundation', 'DSE', '5**'] as const).map(d => (
                   <button 
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold border-2 transition-all ${
                         difficulty === d 
                            ? 'border-brand-500 bg-brand-50 text-brand-700' 
                            : 'border-slate-100 text-slate-400 hover:border-brand-200'
                      }`}
                   >
                      <span className="flex items-center">
                        {d === 'Foundation' && <Shield size={16} className="mr-2" />}
                        {d === 'DSE' && <Target size={16} className="mr-2" />}
                        {d === '5**' && <Zap size={16} className="mr-2" />}
                        {d} Only
                      </span>
                      {difficulty === d && <Check size={16} />}
                   </button>
                ))}
             </div>
          </div>
        </div>

        <h3 className="text-xl font-bold text-slate-800 mb-4">Select a Topic</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {(topics[subject] || ['General Practice']).map((t) => (
            <button
              key={t}
              onClick={() => { setTopic(t); startQuiz(t); }}
              className="bg-white hover:bg-brand-50 border-2 border-slate-100 hover:border-brand-200 p-5 rounded-2xl text-left group transition-all shadow-sm hover:shadow-md flex justify-between items-center"
            >
              <span className="font-bold text-slate-700 group-hover:text-brand-700">{t}</span>
              <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-brand-200 flex items-center justify-center text-slate-300 group-hover:text-brand-700 transition-colors">
                <ArrowRight size={16} />
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // --- LOADING ---
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="relative">
           <div className="w-20 h-20 rounded-full border-4 border-slate-100 border-t-brand-500 animate-spin"></div>
           <BrainCircuit className="absolute inset-0 m-auto text-brand-500" size={24} />
        </div>
        <p className="text-slate-800 text-xl font-display font-bold mt-6">Generating Challenge...</p>
        <p className="text-slate-500 text-sm mt-2 font-medium bg-white px-4 py-1 rounded-full border border-slate-100">Targeting {difficulty === 'Mixed' ? 'Mixed' : difficulty} Difficulty</p>
      </div>
    );
  }

  // --- RESULT VIEW ---
  if (view === 'result') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6 animate-in zoom-in-95 duration-500">
        <div className="bg-yellow-100 p-8 rounded-full mb-6 shadow-lg shadow-yellow-200/50 ring-8 ring-yellow-50">
          <Trophy className="text-yellow-500" size={64} strokeWidth={1.5} />
        </div>
        <h2 className="text-4xl font-display font-extrabold text-slate-800 mb-2">Session Complete!</h2>
        <p className="text-slate-500 mb-8 text-lg">You've gained +{score * 50} XP towards Level {level}</p>
        
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-soft mb-8 w-full max-w-md">
           <div className="flex justify-between items-center mb-2">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-xs">Final Score</span>
              <span className="text-slate-400 font-bold uppercase tracking-wider text-xs">{score} / {questions.length}</span>
           </div>
           <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden">
              <div 
                className="h-full bg-brand-500 rounded-full transition-all duration-1000" 
                style={{ width: `${(score / questions.length) * 100}%` }}
              ></div>
           </div>
           {score < questions.length && (
               <p className="text-xs text-slate-400 mt-4 font-bold">
                   Note: Mistakes have been added to your Vault for review.
               </p>
           )}
        </div>

        <div className="flex space-x-4">
          <button 
            onClick={() => {
                setView('lobby');
                setCurrentIndex(0);
                setSelectedOption(null);
                setShowResult(false);
                setScore(0);
            }}
            className="bg-white text-slate-600 border-2 border-slate-200 px-6 py-3 rounded-xl hover:bg-slate-50 font-bold transition-colors"
          >
            Back to Lobby
          </button>
          <button 
            onClick={() => {
                setQuestions([]);
                setCurrentIndex(0);
                setSelectedOption(null);
                setShowResult(false);
                setScore(0);
                startQuiz(topic);
            }}
            className="bg-brand-600 text-white px-8 py-3 rounded-xl hover:bg-brand-700 shadow-lg shadow-brand-500/30 font-bold flex items-center transition-transform hover:scale-105"
          >
            <RefreshCw size={18} className="mr-2" /> Drill Again
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) return <div className="text-center p-10 text-red-500">Failed to generate questions. Try again.</div>;

  const currentQ = questions[currentIndex];

  // --- QUIZ QUESTION VIEW ---
  return (
    <div className="max-w-3xl mx-auto p-6 h-full flex flex-col">
        {/* Header Bar */}
        <div className="flex justify-between items-center mb-8">
           <button onClick={() => setView('lobby')} className="text-slate-400 hover:text-slate-600 font-bold text-sm">Quit</button>
           <div className="bg-slate-100 px-3 py-1 rounded-full text-xs font-bold text-slate-500">
              {topic}
           </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 h-2 rounded-full mb-8 overflow-hidden">
            <div 
                className="bg-brand-500 h-full rounded-full transition-all duration-500 ease-out relative"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            >
            </div>
        </div>

        {/* Question Card */}
        <div className="mb-8">
            <div className="flex justify-between items-start mb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                    currentQ.difficulty.includes('Master') || currentQ.difficulty.includes('5**')
                        ? 'bg-purple-100 text-purple-700 border-purple-200' 
                        : currentQ.difficulty.includes('DSE')
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-green-50 text-green-700 border-green-200'
                }`}>
                    {currentQ.difficulty.includes('Master') && <Medal size={12} className="mr-1"/>}
                    {currentQ.difficulty}
                </span>
                <span className="text-slate-400 font-mono text-sm font-bold">
                    Q{currentIndex + 1} / {questions.length}
                </span>
            </div>
            <h2 className="text-xl md:text-2xl font-display font-bold text-slate-800 leading-relaxed">
                {currentQ.question}
            </h2>
            {currentQ.type === 'short' && (
               <div className="mt-2 flex items-center text-brand-600 text-sm font-bold bg-brand-50 px-3 py-1 rounded-lg w-fit">
                  <PenTool size={14} className="mr-2"/> Short Answer - Keyword Check
               </div>
            )}
        </div>

        {/* INPUT AREA (MC or SHORT) */}
        <div className="space-y-3 flex-1">
            {currentQ.type === 'mc' ? (
                // --- MCQ Interface ---
                currentQ.options?.map((option, idx) => {
                    let stateStyles = "bg-white border-2 border-slate-100 hover:border-brand-200 hover:bg-brand-50";
                    let icon = null;
                    
                    if (showResult) {
                        if (idx === currentQ.correctIndex) {
                            stateStyles = "bg-green-50 border-2 border-green-500 text-green-800 shadow-none";
                            icon = <Check size={20} className="text-green-600" />;
                        } else if (idx === selectedOption) {
                            stateStyles = "bg-red-50 border-2 border-red-500 text-red-800 shadow-none";
                            icon = <X size={20} className="text-red-600" />;
                        } else {
                            stateStyles = "bg-slate-50 border-2 border-transparent opacity-50";
                        }
                    } else if (selectedOption === idx) {
                        stateStyles = "bg-brand-50 border-2 border-brand-500";
                    }

                    return (
                        <button
                            key={idx}
                            onClick={() => handleMCAnswer(idx)}
                            disabled={showResult}
                            className={`w-full p-5 rounded-2xl text-left transition-all duration-200 flex items-center justify-between shadow-sm ${stateStyles} ${!showResult && 'hover:scale-[1.01] hover:shadow-md'}`}
                        >
                            <span className="font-medium text-lg">{option}</span>
                            {icon}
                        </button>
                    );
                })
            ) : (
                // --- Short Answer Interface (Keyword Killer) ---
                <div className="space-y-4">
                   <div className="relative">
                      <textarea 
                         value={userTextInput}
                         onChange={(e) => setUserTextInput(e.target.value)}
                         disabled={showResult}
                         placeholder="Type your answer here..."
                         className="w-full h-40 p-5 rounded-2xl border-2 border-slate-200 bg-white focus:border-brand-500 focus:ring-0 text-lg resize-none"
                      />
                      {!showResult && (
                         <div className="absolute bottom-4 right-4">
                            <button 
                              onClick={handleShortSubmit}
                              disabled={!userTextInput.trim() || isEvaluating}
                              className="bg-brand-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                               {isEvaluating && <Loader2 className="animate-spin mr-2" size={16}/>}
                               Submit Answer
                            </button>
                         </div>
                      )}
                   </div>

                   {/* Marking Scheme Visualization */}
                   {showResult && shortFeedback && (
                      <div className="bg-white border-2 border-slate-100 p-6 rounded-2xl animate-in fade-in">
                         <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-800">Marking Scheme Analysis</h3>
                            {shortFeedback.isCorrect ? (
                               <span className="text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-bold border border-green-200">Full Marks</span>
                            ) : (
                               <span className="text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-xs font-bold border border-amber-200">Partial / Zero Marks</span>
                            )}
                         </div>
                         
                         <div className="grid grid-cols-1 gap-2 mb-4">
                            {shortFeedback.matchedKeywords.map((k, i) => (
                               <div key={`match-${i}`} className="flex items-center text-green-700 text-sm font-bold bg-green-50 p-3 rounded-xl border border-green-100">
                                  <Check size={16} className="mr-2"/> {k}
                               </div>
                            ))}
                            {shortFeedback.missedKeywords.map((k, i) => (
                               <div key={`miss-${i}`} className="flex items-center text-red-700 text-sm font-bold bg-red-50 p-3 rounded-xl border border-red-100 opacity-80">
                                  <X size={16} className="mr-2"/> {k} (Missed)
                               </div>
                            ))}
                         </div>
                         <div className="text-sm text-slate-600 italic bg-slate-50 p-4 rounded-xl">
                            "Model Answer: {currentQ.answer}"
                         </div>
                      </div>
                   )}
                </div>
            )}
        </div>

        {/* Explanation & Next */}
        {showResult && (
            <div className="mt-6 bg-brand-50 p-6 rounded-2xl border border-brand-100 animate-in fade-in slide-in-from-bottom-4 shadow-soft relative overflow-hidden">
                <div className="absolute -right-6 -top-6 bg-brand-200 w-24 h-24 rounded-full opacity-50 blur-2xl"></div>
                <h4 className="text-brand-800 font-bold mb-2 flex items-center relative z-10">
                    <BrainCircuit size={18} className="mr-2" /> Smart Explanation
                </h4>
                <p className="text-slate-700 text-sm leading-relaxed mb-4 font-medium relative z-10">
                    {currentQ.explanation}
                </p>
                <button
                    onClick={nextQuestion}
                    className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-brand-500/20 flex justify-center items-center relative z-10"
                >
                    {currentIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                    <ArrowRight size={18} className="ml-2" />
                </button>
            </div>
        )}
    </div>
  );
};
