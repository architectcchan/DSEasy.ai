
import React, { useState, useRef, useEffect } from 'react';
import { Subject, Message, Level } from '../types';
import { chatWithTutor } from '../services/geminiService';
import { Send, Loader2, Bot, User, Sparkles, X, RefreshCcw, BookOpen, HelpCircle, Target, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatTutorProps {
  subject: Subject;
  level: Level;
  onClose: () => void;
}

export const ChatTutor: React.FC<ChatTutorProps> = ({ subject, level, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [showMenu, setShowMenu] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isThinking) return;

    setShowMenu(false);
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    const history = messages.map(m => ({ role: m.role, text: m.text }));
    const responseText = await chatWithTutor(history, userMsg.text, subject, level);
    
    const modelMsg: Message = { id: (Date.now() + 1).toString(), role: 'model', text: responseText };
    setMessages(prev => [...prev, modelMsg]);
    setIsThinking(false);
  };

  const popularQuestions: Record<string, string[]> = {
    [Subject.MATH]: ["Explain 'Completing the Square'", "How to find the center of a circle?", "Probability 'nCr' vs 'nPr'", "3D Trigonometry tips"],
    [Subject.ECON]: ["Opportunity Cost definition", "Factors affecting Demand", "Law of Diminishing Returns", "GDP components"],
    [Subject.ENG]: ["Writing a persuasive essay intro", "Tone and Atmosphere words", "Paper 3 Listening tips", "Common grammar mistakes"],
    [Subject.PHY]: ["Newton's Laws summary", "Lenz's Law explanation", "Radioactive decay types", "Refraction vs Reflection"]
  };

  const renderMenu = () => (
    <div className="max-w-3xl mx-auto p-6 md:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="text-center space-y-4 mb-8">
        <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center mx-auto text-brand-600 mb-4 shadow-glow">
          <Bot size={40} />
        </div>
        <h2 className="text-3xl font-display font-bold text-slate-800">
          Hi! I'm your {subject} Tutor.
        </h2>
        <p className="text-slate-500 text-lg">
          I'm ready to help you secure that 5**. What's our goal for this session?
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <button 
          onClick={() => handleSend(`Give me a concise summary of key concepts for ${subject} at ${level} level. Treat it like a cheat sheet.`)}
          className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-brand-200 transition-all text-left group"
        >
          <div className="bg-orange-50 w-12 h-12 rounded-xl flex items-center justify-center text-orange-500 mb-4 group-hover:scale-110 transition-transform">
            <BookOpen size={24} />
          </div>
          <h3 className="font-bold text-slate-700 mb-1">Revise Concepts</h3>
          <p className="text-xs text-slate-400">Get cheat sheets & summaries</p>
        </button>

        <button 
           onClick={() => handleSend(`I want to practice. Give me a challenging ${subject} question suitable for ${level} and then explain the answer.`)}
           className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-brand-200 transition-all text-left group"
        >
          <div className="bg-teal-50 w-12 h-12 rounded-xl flex items-center justify-center text-teal-500 mb-4 group-hover:scale-110 transition-transform">
            <Target size={24} />
          </div>
          <h3 className="font-bold text-slate-700 mb-1">Drill Questions</h3>
          <p className="text-xs text-slate-400">Test your knowledge</p>
        </button>

        <button 
           onClick={() => handleSend(`What are the most common mistakes students make in ${subject} for the DSE?`)}
           className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-brand-200 transition-all text-left group"
        >
          <div className="bg-violet-50 w-12 h-12 rounded-xl flex items-center justify-center text-violet-500 mb-4 group-hover:scale-110 transition-transform">
            <Zap size={24} />
          </div>
          <h3 className="font-bold text-slate-700 mb-1">Exam Strategy</h3>
          <p className="text-xs text-slate-400">Tips to avoid losing marks</p>
        </button>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center mb-4">Popular {subject} Questions</h3>
        <div className="flex flex-wrap justify-center gap-3">
          {(popularQuestions[subject] || ["How to improve my grade?", "Explain the hardest topic", "Summary of this year's syllabus"]).map((q, i) => (
            <button
              key={i}
              onClick={() => handleSend(q)}
              className="bg-white border border-slate-200 px-4 py-2 rounded-full text-sm text-slate-600 hover:text-brand-600 hover:border-brand-200 hover:bg-brand-50 transition-all shadow-sm"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-110px)] md:h-screen bg-[#FAF9F6] relative animate-in slide-in-from-right-4 duration-300">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg p-4 flex justify-between items-center border-b border-slate-100 sticky top-0 z-10">
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-tr from-brand-500 to-violet-400 p-2.5 rounded-xl text-white shadow-lg shadow-brand-500/30">
            <Bot size={24} />
          </div>
          <div>
            <h3 className="font-display font-bold text-slate-800 text-lg leading-tight">{subject} Tutor</h3>
            <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md flex items-center w-fit mt-0.5">
              <Sparkles size={10} className="mr-1" /> {level}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
            <button 
              onClick={() => { setMessages([]); setShowMenu(true); }} 
              className="p-2 text-slate-400 hover:text-brand-600 hover:bg-slate-50 rounded-full transition-colors" 
              title="Restart Session"
            >
                <RefreshCcw size={20} />
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-50 rounded-full transition-colors">
                <X size={24} />
            </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
        {showMenu && messages.length === 0 ? (
          renderMenu()
        ) : (
          <div className="space-y-6 max-w-4xl mx-auto">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] md:max-w-[75%] rounded-3xl p-5 shadow-sm animate-in zoom-in-95 duration-300 ${
                  msg.role === 'user' 
                    ? 'bg-brand-600 text-white rounded-tr-sm' 
                    : 'bg-white text-slate-700 border border-slate-100 rounded-tl-sm'
                }`}>
                  <div className="flex items-center space-x-2 mb-2 opacity-70 text-[10px] font-bold uppercase tracking-widest">
                    {msg.role === 'user' ? (
                        <><span>You</span><User size={10} /></>
                    ) : (
                        <><Bot size={10} /><span>DSE.ai</span></>
                    )}
                  </div>
                  <div className="prose prose-sm max-w-none font-medium leading-relaxed">
                    <ReactMarkdown 
                        components={{
                            p: ({node, ...props}) => <p className={msg.role === 'user' ? 'text-white' : 'text-slate-700'} {...props} />,
                            strong: ({node, ...props}) => <strong className={msg.role === 'user' ? 'text-brand-100' : 'text-brand-700'} {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc pl-4 my-2" {...props} />,
                            li: ({node, ...props}) => <li className="my-1" {...props} />
                        }}
                    >
                        {msg.text}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            {isThinking && (
               <div className="flex justify-start">
                 <div className="bg-white rounded-3xl p-4 rounded-tl-sm border border-slate-100 shadow-sm flex items-center space-x-3">
                   <Loader2 className="animate-spin text-brand-500" size={20} />
                   <span className="text-slate-500 text-sm font-medium animate-pulse">Thinking...</span>
                 </div>
               </div>
            )}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-6 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask a follow-up question..."
            className="w-full bg-slate-50 text-slate-800 rounded-2xl pl-5 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white border-2 border-transparent focus:border-transparent transition-all font-medium shadow-inner placeholder-slate-400"
          />
          <button 
            onClick={() => handleSend()}
            disabled={!input.trim() || isThinking}
            className="absolute right-2 p-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 shadow-lg shadow-brand-500/30"
          >
            <Send size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};
