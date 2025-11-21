
import React, { useState, useEffect } from 'react';
import { Subject, PastPaper, MockExamQuestion } from '../types';
import { generateMockExam } from '../services/geminiService';
import { Timer, AlertTriangle, Lightbulb, CheckCircle2, XCircle, ArrowRight, BrainCircuit, School, AlertCircle, BarChart3 } from 'lucide-react';

interface MockExamProps {
  paper: PastPaper;
  onClose: () => void;
  onComplete: (xp: number) => void;
}

export const MockExam: React.FC<MockExamProps> = ({ paper, onClose, onComplete }) => {
  const [status, setStatus] = useState<'loading' | 'active' | 'review'>('loading');
  const [questions, setQuestions] = useState<MockExamQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes for mini mock
  const [totalTime, setTotalTime] = useState(300);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const initExam = async () => {
      const examData = await generateMockExam(paper.subject, paper.topics, paper.level);
      setQuestions(examData);
      setUserAnswers(new Array(examData.length).fill(-1));
      setStatus('active');
    };
    initExam();
  }, [paper]);

  useEffect(() => {
    if (status === 'active' && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (status === 'active' && timeLeft === 0) {
      handleSubmit();
    }
  }, [status, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (questionIndex: number, optionIndex: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[questionIndex] = optionIndex;
    setUserAnswers(newAnswers);
  };

  const handleSubmit = () => {
    let correctCount = 0;
    questions.forEach((q, i) => {
      if (userAnswers[i] === q.correctIndex) correctCount++;
    });
    setScore(correctCount);
    setStatus('review');
    onComplete(correctCount * 80); 
  };

  // Pacing Logic: Calculates if you are ahead or behind schedule
  const getPacingStatus = () => {
    if (questions.length === 0) return 'good';
    const avgTimePerQ = totalTime / questions.length;
    const questionsAnswered = userAnswers.filter(a => a !== -1).length;
    const expectedTimeUsed = questionsAnswered * avgTimePerQ;
    const actualTimeUsed = totalTime - timeLeft;
    
    if (actualTimeUsed > expectedTimeUsed + 20) return 'slow'; // Behind by 20s
    if (actualTimeUsed < expectedTimeUsed - 20) return 'fast'; // Ahead
    return 'good'; // On track
  };

  if (status === 'loading') {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-6 animate-in fade-in">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-slate-100 border-t-brand-500 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <School className="text-brand-500" size={32} />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-800">Setting Exam Conditions</h2>
          <p className="text-slate-500 mt-2">Extracting questions from {paper.school} {paper.year}...</p>
        </div>
      </div>
    );
  }

  if (status === 'review') {
    // Calculate topic mastery for the review
    const topicBreakdown: Record<string, {total: number, correct: number}> = {};
    questions.forEach((q, i) => {
       if (!topicBreakdown[q.topic]) topicBreakdown[q.topic] = { total: 0, correct: 0 };
       topicBreakdown[q.topic].total++;
       if (userAnswers[i] === q.correctIndex) topicBreakdown[q.topic].correct++;
    });

    return (
      <div className="max-w-4xl mx-auto p-6 h-full overflow-y-auto custom-scrollbar pb-20">
        {/* Results Header */}
        <div className="bg-white border border-slate-200 rounded-3xl p-10 mb-8 text-center relative overflow-hidden shadow-lg shadow-brand-500/10">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-500 to-teal-400"></div>
          <h2 className="text-3xl font-display font-bold text-slate-800 mb-2">Performance Report</h2>
          <div className="flex justify-center items-baseline space-x-3 mb-6">
            <span className="text-7xl font-display font-extrabold text-brand-600">{score}</span>
            <span className="text-3xl text-slate-400 font-bold">/ {questions.length}</span>
          </div>
          <p className="text-slate-500 max-w-xl mx-auto font-medium">
            {score === questions.length ? "Flawless 5**! You crushed this paper." : "Good attempt. Check the marking notes below to secure your stars next time."}
          </p>
          <button onClick={onClose} className="mt-8 px-8 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-bold transition-colors">
            Back to Library
          </button>
        </div>

        {/* Topic Breakdown - Analytics */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
           <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
             <h3 className="font-bold text-slate-800 mb-4 flex items-center"><BarChart3 className="mr-2 text-brand-500" /> Topic Mastery</h3>
             <div className="space-y-4">
                {Object.entries(topicBreakdown).map(([topic, stats]) => (
                  <div key={topic}>
                     <div className="flex justify-between text-sm font-bold mb-1">
                        <span className="text-slate-600">{topic}</span>
                        <span className={stats.correct === stats.total ? 'text-green-600' : 'text-slate-400'}>
                          {stats.correct}/{stats.total}
                        </span>
                     </div>
                     <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${stats.correct === stats.total ? 'bg-green-500' : 'bg-brand-500'}`} 
                          style={{ width: `${(stats.correct / stats.total) * 100}%`}}
                        ></div>
                     </div>
                  </div>
                ))}
             </div>
           </div>
           
           <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center"><Lightbulb className="mr-2 text-yellow-500" /> AI Examiner Notes</h3>
              <div className="bg-yellow-50 p-4 rounded-xl text-sm text-yellow-800 leading-relaxed">
                 Based on your answers, you are strong in <strong>{Object.keys(topicBreakdown)[0]}</strong> but lost marks on tricky phrasing. Remember, DSE questions often require referencing specific keywords.
              </div>
           </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="space-y-6">
          {questions.map((q, i) => {
            const isCorrect = userAnswers[i] === q.correctIndex;
            return (
              <div key={i} className={`bg-white border-2 ${isCorrect ? 'border-green-100' : 'border-red-100'} rounded-2xl overflow-hidden shadow-sm`}>
                {/* Question Header */}
                <div className="p-6 md:p-8 border-b border-slate-100">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-2 py-1 rounded">Q{i + 1} • {q.difficulty}</span>
                    {isCorrect ? (
                      <span className="flex items-center text-green-600 text-sm font-bold bg-green-50 px-3 py-1 rounded-full"><CheckCircle2 size={16} className="mr-1.5"/> Correct</span>
                    ) : (
                      <span className="flex items-center text-red-500 text-sm font-bold bg-red-50 px-3 py-1 rounded-full"><XCircle size={16} className="mr-1.5"/> Incorrect</span>
                    )}
                  </div>
                  <h3 className="text-xl text-slate-800 font-bold mb-6 leading-snug">{q.question}</h3>
                  
                  {/* Options Review */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {q.options.map((opt, idx) => {
                      let style = "border-slate-100 text-slate-500 opacity-70 bg-slate-50";
                      if (idx === q.correctIndex) style = "border-green-500 bg-green-50 text-green-800 opacity-100 ring-1 ring-green-500";
                      else if (idx === userAnswers[i]) style = "border-red-500 bg-red-50 text-red-800 opacity-100 ring-1 ring-red-500";
                      
                      return (
                        <div key={idx} className={`p-4 rounded-xl border-2 ${style} text-sm font-medium transition-all`}>
                          {opt}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Learning Section */}
                <div className="p-6 md:p-8 bg-slate-50 grid md:grid-cols-2 gap-8">
                  {/* Common Mistake */}
                  <div className="space-y-2">
                    <h4 className="text-amber-600 text-sm font-bold flex items-center">
                      <AlertTriangle size={16} className="mr-2" /> Common Trap
                    </h4>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {q.commonMistake}
                    </p>
                  </div>
                  
                  {/* Pro Tip */}
                  <div className="space-y-2">
                    <h4 className="text-brand-600 text-sm font-bold flex items-center">
                      <Lightbulb size={16} className="mr-2" /> 5** Strategy
                    </h4>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {q.examTip}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Active Exam Interface
  return (
    <div className="h-full flex flex-col max-w-5xl mx-auto p-4 md:p-8">
      {/* Visual Pacing Bar (Top Fixed) */}
      <div className="fixed top-0 left-0 right-0 h-2 bg-slate-100 z-50">
         <div 
           className={`h-full transition-all duration-1000 ${
             getPacingStatus() === 'slow' ? 'bg-red-500' : getPacingStatus() === 'fast' ? 'bg-green-500' : 'bg-brand-500'
           }`}
           style={{ width: `${(timeLeft / totalTime) * 100}%` }}
         ></div>
      </div>

      {/* Top Bar */}
      <div className="flex justify-between items-center mb-8 bg-white p-5 rounded-2xl border border-slate-100 shadow-soft sticky top-4 z-20">
        <div className="flex items-center space-x-4">
          <div className="bg-brand-50 p-2 rounded-lg text-brand-600">
             <School size={24} />
          </div>
          <div>
            <h2 className="text-slate-800 font-bold text-lg leading-none">{paper.school}</h2>
            <div className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wide">{paper.year} • {paper.level} {paper.subject}</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
            {getPacingStatus() === 'slow' && (
                <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded hidden md:block animate-pulse">Pacing Alert: Speed Up!</span>
            )}
            <div className={`flex items-center space-x-2 text-xl font-mono font-bold bg-slate-50 px-4 py-2 rounded-xl ${timeLeft < 60 ? 'text-red-500 animate-pulse bg-red-50' : 'text-slate-700'}`}>
            <Timer size={20} />
            <span>{formatTime(timeLeft)}</span>
            </div>
        </div>
      </div>

      {/* Questions List (Scrollable) */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pb-24">
        {questions.map((q, qIdx) => (
          <div key={qIdx} className="bg-white border border-slate-200 p-6 md:p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-5">
              <div className="bg-slate-100 text-slate-600 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm">
                {qIdx + 1}
              </div>
              <span className="text-xs font-bold px-2.5 py-1 bg-brand-50 text-brand-600 rounded-md uppercase tracking-wide">
                {q.topic}
              </span>
            </div>
            
            <p className="text-xl text-slate-800 mb-8 font-medium leading-relaxed">{q.question}</p>
            
            <div className="space-y-3">
              {q.options.map((opt, optIdx) => (
                <label 
                  key={optIdx} 
                  className={`flex items-center space-x-4 p-4 rounded-xl cursor-pointer transition-all border-2 ${
                    userAnswers[qIdx] === optIdx 
                      ? 'bg-brand-50 border-brand-500 shadow-sm' 
                      : 'bg-white border-slate-100 hover:border-brand-200 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    userAnswers[qIdx] === optIdx 
                      ? 'border-brand-500 bg-brand-500' 
                      : 'border-slate-300 bg-white'
                  }`}>
                    {userAnswers[qIdx] === optIdx && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <input 
                    type="radio" 
                    name={`q-${qIdx}`} 
                    className="hidden"
                    onChange={() => handleAnswer(qIdx, optIdx)}
                    checked={userAnswers[qIdx] === optIdx}
                  />
                  <span className={`text-lg ${userAnswers[qIdx] === optIdx ? 'text-brand-900 font-medium' : 'text-slate-600'}`}>{opt}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Actions */}
      <div className="fixed bottom-6 left-4 right-4 md:left-1/2 md:ml-[-200px] md:w-[400px] p-2 bg-slate-800/90 backdrop-blur text-white rounded-2xl shadow-2xl flex justify-between items-center z-50 px-4">
        <div className="text-sm font-medium pl-2">
          <span className="text-brand-300 font-bold">{userAnswers.filter(a => a !== -1).length}</span> / {questions.length} answered
        </div>
        <button 
          onClick={handleSubmit}
          className="bg-white text-slate-900 hover:bg-brand-50 font-bold px-6 py-2.5 rounded-xl flex items-center transition-all transform hover:scale-105 shadow-lg"
        >
          Submit <ArrowRight className="ml-2" size={16} />
        </button>
      </div>
    </div>
  );
};
