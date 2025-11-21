
import React, { useState, useEffect, useRef } from 'react';
import { Mic, StopCircle, Play, Award, RefreshCw, MessageSquare, Users, User, Volume2, BarChart, Star } from 'lucide-react';
import { SpeakingFeedback, SpeakingMode } from '../types';
import { getSpeakingTopic, generateSpeakingFeedback } from '../services/geminiService';

// Add Web Speech API Types (local to this file if not globally available)
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const SpeakingCoach: React.FC = () => {
  const [mode, setMode] = useState<SpeakingMode | null>(null);
  const [status, setStatus] = useState<'setup' | 'prep' | 'recording' | 'analyzing' | 'feedback'>('setup');
  const [topicData, setTopicData] = useState<{topic: string, context?: string} | null>(null);
  const [transcript, setTranscript] = useState('');
  const [timeLeft, setTimeLeft] = useState(60); // Prep time or Recording time
  const [feedback, setFeedback] = useState<SpeakingFeedback | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US'; // DSE uses English
      
      recognition.onresult = (event: any) => {
        let finalTrans = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTrans += event.results[i][0].transcript;
          }
        }
        // In a real scenario, we'd append to state properly, but for this demo:
        if (finalTrans) setTranscript(prev => prev + ' ' + finalTrans);
      };
      
      recognitionRef.current = recognition;
    }
  }, []);

  // Timer Logic
  useEffect(() => {
    if ((status === 'prep' || status === 'recording') && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      if (status === 'prep') startRecording();
      if (status === 'recording') stopRecording();
    }
  }, [status, timeLeft]);

  const startSession = async (selectedMode: SpeakingMode) => {
    setMode(selectedMode);
    const data = await getSpeakingTopic(selectedMode);
    setTopicData(data);
    setStatus('prep');
    setTimeLeft(selectedMode === 'PartA_Group' ? 10 : 5); // Short prep for demo
  };

  const startRecording = () => {
    setTranscript('');
    setStatus('recording');
    setTimeLeft(60); // 1 minute response
    recognitionRef.current?.start();
  };

  const stopRecording = async () => {
    recognitionRef.current?.stop();
    setStatus('analyzing');
    if (topicData) {
      const result = await generateSpeakingFeedback(transcript || "(No speech detected)", topicData.topic, mode!);
      setFeedback(result);
      setStatus('feedback');
    }
  };

  const formatTime = (sec: number) => `${Math.floor(sec / 60)}:${(sec % 60).toString().padStart(2, '0')}`;

  // --- VIEW: SETUP ---
  if (status === 'setup') {
    return (
      <div className="max-w-5xl mx-auto p-6 md:p-10 animate-in fade-in">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600 shadow-glow">
            <Mic size={40} />
          </div>
          <h1 className="text-4xl font-display font-extrabold text-slate-800">Speaking 5** Coach</h1>
          <p className="text-slate-500 mt-2 text-lg">AI-powered examiner for HKDSE English Paper 4.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <button 
            onClick={() => startSession('PartA_Group')}
            className="group bg-white p-8 rounded-3xl border-2 border-slate-100 hover:border-indigo-500 transition-all text-left hover:shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 bg-indigo-500 w-24 h-24 rounded-bl-full -mr-10 -mt-10 opacity-10 group-hover:opacity-20 transition-opacity"></div>
            <div className="bg-indigo-50 w-14 h-14 rounded-2xl flex items-center justify-center text-indigo-600 mb-6">
              <Users size={28} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Group Interaction</h3>
            <p className="text-slate-500">Simulate responding to another candidate. AI sets the context, you demonstrate transition skills.</p>
            <div className="mt-6 inline-flex items-center text-indigo-600 font-bold text-sm group-hover:translate-x-2 transition-transform">
              Start Simulation <Play size={16} className="ml-2" fill="currentColor" />
            </div>
          </button>

          <button 
            onClick={() => startSession('PartB_Individual')}
            className="group bg-white p-8 rounded-3xl border-2 border-slate-100 hover:border-pink-500 transition-all text-left hover:shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 bg-pink-500 w-24 h-24 rounded-bl-full -mr-10 -mt-10 opacity-10 group-hover:opacity-20 transition-opacity"></div>
            <div className="bg-pink-50 w-14 h-14 rounded-2xl flex items-center justify-center text-pink-600 mb-6">
              <User size={28} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Individual Response</h3>
            <p className="text-slate-500">1-minute solo response to a challenging examiner question. Test your idea organization.</p>
            <div className="mt-6 inline-flex items-center text-pink-600 font-bold text-sm group-hover:translate-x-2 transition-transform">
              Start Simulation <Play size={16} className="ml-2" fill="currentColor" />
            </div>
          </button>
        </div>
      </div>
    );
  }

  // --- VIEW: PREP ---
  if (status === 'prep') {
    return (
      <div className="max-w-3xl mx-auto p-10 flex flex-col h-[80vh] justify-center text-center animate-in zoom-in-95">
        <div className="mb-8">
          <span className="bg-indigo-50 text-indigo-600 px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wide">Preparation Time</span>
        </div>
        <h2 className="text-5xl font-mono font-bold text-slate-800 mb-8">{formatTime(timeLeft)}</h2>
        
        <div className="bg-white p-8 rounded-3xl shadow-soft border border-slate-100 text-left space-y-6">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Topic</h3>
            <p className="text-2xl font-bold text-slate-800">{topicData?.topic}</p>
          </div>
          {topicData?.context && (
            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
               <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 flex items-center">
                 <MessageSquare size={12} className="mr-1" /> Previous Candidate Said:
               </h3>
               <p className="text-indigo-900 italic font-medium">"{topicData.context}"</p>
            </div>
          )}
        </div>

        <button onClick={startRecording} className="mt-8 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30">
          Start Speaking Now
        </button>
      </div>
    );
  }

  // --- VIEW: RECORDING ---
  if (status === 'recording') {
    return (
      <div className="max-w-3xl mx-auto p-10 flex flex-col h-[80vh] justify-center text-center animate-in fade-in">
        <div className="mb-8 relative inline-block">
           <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20"></div>
           <div className="relative bg-red-50 text-red-600 px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wide flex items-center justify-center">
             <div className="w-2 h-2 bg-red-600 rounded-full mr-2 animate-pulse"></div> Recording
           </div>
        </div>
        
        <div className="mb-12 relative">
           {/* Simulated Waveform */}
           <div className="flex justify-center items-center space-x-1 h-16 mb-4">
              {[...Array(12)].map((_, i) => (
                  <div key={i} className="w-2 bg-indigo-500 rounded-full animate-float" style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s` }}></div>
              ))}
           </div>
           <h2 className="text-6xl font-mono font-bold text-slate-800">{formatTime(timeLeft)}</h2>
        </div>

        <div className="bg-slate-50 p-6 rounded-2xl min-h-[100px] mb-8 text-left">
           <p className="text-slate-400 text-sm font-bold uppercase mb-2">Live Transcript</p>
           <p className="text-slate-700 text-lg font-medium leading-relaxed">
             {transcript || <span className="text-slate-400 italic">Listening...</span>}
           </p>
        </div>

        <button onClick={stopRecording} className="mx-auto bg-white border-2 border-red-100 text-red-500 hover:bg-red-50 px-8 py-4 rounded-2xl font-bold transition-all flex items-center">
          <StopCircle className="mr-2" /> Stop & Grade
        </button>
      </div>
    );
  }

  // --- VIEW: ANALYZING ---
  if (status === 'analyzing') {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center">
         <RefreshCw size={48} className="text-indigo-500 animate-spin mb-6" />
         <h2 className="text-2xl font-bold text-slate-800">Analyzing Speech Patterns...</h2>
         <p className="text-slate-500 mt-2">Checking pronunciation markers and vocabulary variety.</p>
      </div>
    );
  }

  // --- VIEW: FEEDBACK ---
  if (status === 'feedback' && feedback) {
    return (
      <div className="max-w-5xl mx-auto p-6 md:p-10 pb-24 animate-in slide-in-from-bottom-8">
        <div className="flex justify-between items-center mb-8">
           <div>
             <h1 className="text-3xl font-display font-bold text-slate-800">Assessment Report</h1>
             <p className="text-slate-500">{mode === 'PartA_Group' ? 'Part A Group Interaction' : 'Part B Individual Response'}</p>
           </div>
           <button onClick={() => setStatus('setup')} className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-50">
             New Session
           </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
           {/* Main Score */}
           <div className="bg-white border border-indigo-100 p-8 rounded-3xl shadow-soft text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-indigo-500"></div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Predicted Level</p>
              <div className="text-7xl font-display font-extrabold text-indigo-600 mb-2">{feedback.score}</div>
              <div className="flex justify-center gap-1">
                 {[1,2,3,4,5].map(i => <Star key={i} size={16} className={parseInt(feedback.score) >= i ? "text-yellow-400 fill-yellow-400" : "text-slate-200"} />)}
              </div>
           </div>

           {/* Metrics */}
           <div className="md:col-span-2 bg-white border border-slate-100 p-8 rounded-3xl shadow-soft grid grid-cols-2 gap-8">
              <div>
                 <div className="flex justify-between mb-2">
                    <span className="text-sm font-bold text-slate-600">Vocabulary</span>
                    <span className="text-sm font-bold text-indigo-600">{feedback.vocabularyScore}/10</span>
                 </div>
                 <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{width: `${feedback.vocabularyScore * 10}%`}}></div>
                 </div>
              </div>
              <div>
                 <div className="flex justify-between mb-2">
                    <span className="text-sm font-bold text-slate-600">Fluency</span>
                    <span className="text-sm font-bold text-teal-600">{feedback.fluencyScore}/10</span>
                 </div>
                 <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500 rounded-full" style={{width: `${feedback.fluencyScore * 10}%`}}></div>
                 </div>
              </div>
              <div className="col-span-2 bg-indigo-50 p-4 rounded-xl flex items-start">
                 <Volume2 className="shrink-0 text-indigo-600 mr-3 mt-1" size={20} />
                 <div>
                    <h4 className="text-sm font-bold text-indigo-800 mb-1">Delivery Note</h4>
                    <p className="text-sm text-indigo-700 leading-relaxed">{feedback.pronunciationTip}</p>
                 </div>
              </div>
           </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
           <div className="bg-white p-8 rounded-3xl border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                 <MessageSquare className="mr-2 text-slate-400" size={20} /> Your Response
              </h3>
              <p className="text-slate-600 leading-relaxed italic">"{transcript}"</p>
           </div>

           <div className="bg-white p-8 rounded-3xl border border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-to-bl from-purple-100 to-transparent w-32 h-32 rounded-bl-full -mr-10 -mt-10"></div>
              <h3 className="font-bold text-purple-700 mb-4 flex items-center relative z-10">
                 <Award className="mr-2" size={20} /> 5** Rewrite
              </h3>
              <p className="text-slate-700 leading-relaxed font-medium relative z-10 bg-purple-50/50 p-4 rounded-xl border border-purple-100">
                 {feedback.betterExpression}
              </p>
              <div className="mt-6 pt-6 border-t border-slate-100">
                 <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Examiner's Final Comment</h4>
                 <p className="text-sm text-slate-600">{feedback.examinerComment}</p>
              </div>
           </div>
        </div>
      </div>
    );
  }

  return <div>Error State</div>;
};
