import React, { useState, useRef, useEffect } from 'react';
import { chatEssayCoach } from '../services/geminiService';
import { Level, Message } from '../types';
import { PenTool, Send, Bot, User, Sparkles, Eraser, Maximize2, Minimize2, Wand2, ArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export const EssayGrader: React.FC<{ level: Level }> = ({ level }) => {
  const [essay, setEssay] = useState('');
  const [topic, setTopic] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 'welcome', 
      role: 'model', 
      text: "Hi! I'm your DSE Writing Coach. Paste your essay on the left, and I'll check it for **Content**, **Language**, and **Organization**. \n\nI'm looking for those common pitfalls that stop students from getting 5**. Ready when you are!",
      suggestions: ["Check for grammar mistakes", "How is my content?", "Improve my vocabulary"]
    }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() && !essay.trim()) return;

    // Add user message
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    // Call AI Coach with Essay Context
    // Note: The service now handles JSON parsing, but we pass the simple text history
    const history = messages.map(m => ({ role: m.role, text: m.text }));
    const responseObj = await chatEssayCoach(history, userMsg.text, essay, topic, level);

    // Add AI response with suggestions
    setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        text: responseObj.feedback,
        suggestions: responseObj.suggestions 
    }]);
    setIsThinking(false);
  };

  return (
    <div className="flex h-[calc(100vh-64px)] md:h-screen bg-[#FAF9F6] overflow-hidden">
      {/* LEFT PANEL: Document Editor */}
      <div className="w-1/2 md:w-3/5 h-full p-4 md:p-6 flex flex-col border-r border-slate-200">
        <div className="bg-white h-full rounded-3xl shadow-sm border border-slate-200 flex flex-col overflow-hidden ring-1 ring-slate-100">
          {/* Editor Toolbar */}
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
             <div className="flex items-center space-x-2 text-slate-500">
                <PenTool size={18} />
                <span className="font-bold text-sm uppercase tracking-wider">Document Editor</span>
             </div>
             <input 
               value={topic}
               onChange={(e) => setTopic(e.target.value)}
               placeholder="Add Topic / Question Title..."
               className="bg-transparent border-b border-transparent hover:border-slate-300 focus:border-brand-500 focus:outline-none text-sm font-medium px-2 py-1 w-64 transition-all text-slate-700 placeholder-slate-400"
             />
          </div>
          
          {/* Text Area - Now explicitly White */}
          <div className="flex-1 bg-white relative">
            <textarea
                value={essay}
                onChange={(e) => setEssay(e.target.value)}
                placeholder="Type or paste your essay here..."
                className="w-full h-full p-8 resize-none focus:outline-none text-slate-800 text-lg leading-relaxed font-serif placeholder:text-slate-300 bg-white"
                spellCheck={false}
            />
          </div>
          
          {/* Editor Footer */}
          <div className="px-6 py-3 border-t border-slate-100 text-xs text-slate-400 font-bold flex justify-between bg-white">
             <span>{essay.split(/\s+/).filter(w => w.length > 0).length} Words</span>
             <span>{level} Standard</span>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: AI Coach Chat */}
      <div className="w-1/2 md:w-2/5 h-full flex flex-col bg-[#FAF9F6]">
         {/* Chat Header */}
         <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-white/80 backdrop-blur sticky top-0 z-10">
            <div className="flex items-center space-x-3">
               <div className="bg-brand-100 p-2 rounded-xl text-brand-600">
                  <Bot size={24} />
               </div>
               <div>
                  <h2 className="font-display font-bold text-slate-800">Writing Coach</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">HKDSE Specialist</p>
               </div>
            </div>
            <button 
              onClick={() => setMessages([{ id: 'reset', role: 'model', text: "Started a new session. Ready to review your work!", suggestions: ["Analyze my intro", "Check grammar", "Review structure"] }])}
              className="text-slate-400 hover:text-brand-600 transition-colors p-2"
              title="Clear Chat"
            >
               <Eraser size={20} />
            </button>
         </div>

         {/* Chat Messages */}
         <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
            {messages.map((msg) => (
               <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[90%] rounded-2xl p-4 shadow-sm text-sm leading-relaxed relative ${
                     msg.role === 'user' 
                        ? 'bg-brand-600 text-white rounded-tr-sm' 
                        : 'bg-white text-slate-700 border border-slate-100 rounded-tl-sm'
                  }`}>
                     {msg.role === 'model' && (
                        <div className="flex items-center space-x-2 mb-2 text-brand-600 font-bold text-xs uppercase tracking-widest">
                           <Sparkles size={12} /> <span>Coach</span>
                        </div>
                     )}
                     <ReactMarkdown 
                        components={{
                           strong: ({node, ...props}) => <strong className="font-bold text-brand-700 bg-brand-50 px-1 rounded" {...props} />,
                           ul: ({node, ...props}) => <ul className="list-disc pl-4 my-2 space-y-1" {...props} />,
                        }}
                     >
                        {msg.text}
                     </ReactMarkdown>
                  </div>
                  
                  {/* Suggestion Chips */}
                  {msg.role === 'model' && msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2">
                          {msg.suggestions.map((suggestion, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleSend(suggestion)}
                                className="text-xs font-bold text-brand-600 bg-white border border-brand-100 px-3 py-1.5 rounded-full hover:bg-brand-50 hover:border-brand-200 transition-colors shadow-sm"
                              >
                                  {suggestion}
                              </button>
                          ))}
                      </div>
                  )}
               </div>
            ))}
            {isThinking && (
               <div className="flex justify-start animate-pulse">
                  <div className="bg-white border border-slate-100 rounded-2xl p-4 rounded-tl-sm shadow-sm flex items-center space-x-2">
                     <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce"></div>
                     <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce delay-75"></div>
                     <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce delay-150"></div>
                  </div>
               </div>
            )}
         </div>

         {/* Chat Input */}
         <div className="p-4 border-t border-slate-200 bg-white">
            <div className="relative flex items-center">
               <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask a question about your essay..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-12 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
               />
               <button 
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isThinking}
                  className="absolute right-2 p-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
               >
                  <ArrowRight size={16} />
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};