
import React, { useState, useEffect } from 'react';
import { Subject, GameLevel } from '../types';
import { Dna, Zap, Timer, Trophy, ArrowRight, RefreshCw } from 'lucide-react';

// Mock Data Generator (In prod this would come from Gemini)
const generateLevel = (id: number): GameLevel => {
  return {
      id,
      subject: Subject.BIO,
      pairs: [
          { term: "Mitochondria", definition: "Powerhouse of the cell; generates ATP." },
          { term: "Ribosome", definition: "Site of protein synthesis." },
          { term: "Nucleus", definition: "Contains genetic material (DNA)." },
          { term: "Mitosis", definition: "Cell division resulting in two identical daughter cells." }
      ]
  };
};

export const LearningGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [level, setLevel] = useState<GameLevel | null>(null);
  const [draggedTerm, setDraggedTerm] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]); // List of matched terms
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');

  useEffect(() => {
      setLevel(generateLevel(1));
  }, []);

  useEffect(() => {
      if (gameStatus === 'playing' && timeLeft > 0) {
          const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
          return () => clearInterval(timer);
      } else if (timeLeft === 0) {
          setGameStatus('lost');
      }
  }, [timeLeft, gameStatus]);

  const handleDragStart = (term: string) => {
      setDraggedTerm(term);
  };

  const handleDrop = (def: string) => {
      if (!draggedTerm || !level) return;
      const pair = level.pairs.find(p => p.term === draggedTerm);
      if (pair && pair.definition === def) {
          // Correct Match
          setMatchedPairs(prev => [...prev, draggedTerm]);
          setScore(s => s + 100);
          if (matchedPairs.length + 1 === level.pairs.length) {
              setGameStatus('won');
          }
      } else {
          // Wrong match penalty
          setScore(s => Math.max(0, s - 20));
      }
      setDraggedTerm(null);
  };

  if (!level) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 h-screen flex flex-col animate-in zoom-in-95">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <button onClick={onBack} className="text-slate-400 font-bold hover:text-slate-600">Exit</button>
            <div className="flex items-center space-x-4">
                <div className={`flex items-center space-x-2 font-mono font-bold text-xl ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-slate-700'}`}>
                    <Timer size={20} /> <span>00:{timeLeft.toString().padStart(2,'0')}</span>
                </div>
                <div className="bg-yellow-100 text-yellow-700 px-4 py-1 rounded-full font-bold">
                    XP: {score}
                </div>
            </div>
        </div>

        {gameStatus !== 'playing' ? (
            <div className="flex flex-col items-center justify-center flex-1 text-center space-y-6">
                {gameStatus === 'won' ? (
                    <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center text-green-600 animate-bounce">
                        <Trophy size={64} />
                    </div>
                ) : (
                    <div className="w-32 h-32 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                        <RefreshCw size={64} />
                    </div>
                )}
                <h2 className="text-4xl font-display font-bold text-slate-800">{gameStatus === 'won' ? 'Level Cleared!' : 'Time Up!'}</h2>
                <button onClick={() => { setTimeLeft(60); setMatchedPairs([]); setScore(0); setGameStatus('playing'); }} className="bg-brand-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-brand-700 transition-all">
                    Play Again
                </button>
            </div>
        ) : (
            <div className="grid md:grid-cols-2 gap-12 flex-1">
                {/* Terms Column */}
                <div className="space-y-4">
                    <h3 className="text-slate-400 font-bold uppercase tracking-wider text-center mb-4">Terms</h3>
                    {level.pairs.filter(p => !matchedPairs.includes(p.term)).map((pair) => (
                        <div 
                            key={pair.term}
                            draggable
                            onDragStart={() => handleDragStart(pair.term)}
                            className="bg-white border-2 border-brand-100 text-brand-800 p-6 rounded-2xl shadow-sm cursor-grab active:cursor-grabbing hover:scale-105 transition-transform font-bold text-center text-lg select-none"
                        >
                            {pair.term}
                        </div>
                    ))}
                </div>

                {/* Definitions Column */}
                <div className="space-y-4">
                    <h3 className="text-slate-400 font-bold uppercase tracking-wider text-center mb-4">Definitions</h3>
                    {level.pairs.sort(() => Math.random() - 0.5).map((pair) => {
                         if (matchedPairs.includes(pair.term)) return null;
                         return (
                            <div 
                                key={pair.definition}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={() => handleDrop(pair.definition)}
                                className="bg-slate-50 border-2 border-dashed border-slate-200 text-slate-600 p-6 rounded-2xl flex items-center justify-center text-sm font-medium min-h-[100px] hover:bg-slate-100 transition-colors"
                            >
                                {pair.definition}
                            </div>
                         );
                    })}
                </div>
            </div>
        )}
    </div>
  );
};
