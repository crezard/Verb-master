import React, { useState, useEffect, useRef } from 'react';
import { Verb } from '../types';
import { CheckCircle, XCircle, ArrowRight, RefreshCw, Trophy } from 'lucide-react';

interface QuizModeProps {
  verbs: Verb[];
  onFinish: () => void;
}

const QuizMode: React.FC<QuizModeProps> = ({ verbs, onFinish }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [pastInput, setPastInput] = useState('');
  const [participleInput, setParticipleInput] = useState('');
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  
  const currentVerb = verbs[currentIndex];
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentIndex]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback !== 'idle') return;

    // Although 'required' handles this, double check to be safe
    if (!pastInput.trim() || !participleInput.trim()) return;

    const isPastCorrect = pastInput.trim().toLowerCase() === currentVerb.past.toLowerCase();
    const isParticipleCorrect = participleInput.trim().toLowerCase() === currentVerb.participle.toLowerCase();

    if (isPastCorrect && isParticipleCorrect) {
      setFeedback('correct');
      setScore(s => s + 1);
    } else {
      setFeedback('incorrect');
    }
  };

  const handleNext = () => {
    if (currentIndex < verbs.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setPastInput('');
      setParticipleInput('');
      setFeedback('idle');
    } else {
      setIsComplete(true);
    }
  };

  if (isComplete) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
        <div className="bg-yellow-100 p-6 rounded-full text-yellow-600 mb-6">
          <Trophy size={64} />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 mb-2">퀴즈 완료!</h2>
        <p className="text-slate-500 mb-8">{verbs.length}문제 중 {score}점을 획득했습니다.</p>
        
        <div className="w-full max-w-xs bg-slate-200 rounded-full h-4 mb-8 overflow-hidden">
          <div 
            className="bg-indigo-600 h-4 rounded-full transition-all duration-1000" 
            style={{ width: `${(score / verbs.length) * 100}%` }}
          ></div>
        </div>

        <button 
          onClick={onFinish}
          className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-medium shadow-lg hover:bg-indigo-700 hover:shadow-indigo-200 transition-all"
        >
          메인으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <span className="text-sm font-medium text-slate-500">진행도 {currentIndex + 1} / {verbs.length}</span>
        <span className="text-sm font-medium text-indigo-600">점수: {score}</span>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
        <div className="text-center mb-8">
          <span className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-2 block">기본형 (Base Form)</span>
          <h2 className="text-4xl font-extrabold text-slate-800 mb-2">{currentVerb.base}</h2>
          <p className="text-slate-500">{currentVerb.meaning}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">과거형 (Past Simple)</label>
              <input
                ref={inputRef}
                type="text"
                required
                value={pastInput}
                onChange={(e) => setPastInput(e.target.value)}
                disabled={feedback !== 'idle'}
                className={`w-full px-4 py-3 rounded-lg border-2 focus:ring-4 outline-none transition-all
                  ${feedback === 'idle' 
                    ? 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100' 
                    : feedback === 'correct'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-red-300 bg-red-50 text-red-700'
                  }`}
                placeholder="답을 입력하세요"
                autoComplete="off"
              />
              {feedback === 'incorrect' && (
                <p className="text-sm text-red-500 font-medium animate-pulse">정답: {currentVerb.past}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">과거분사 (Past Participle)</label>
              <input
                type="text"
                required
                value={participleInput}
                onChange={(e) => setParticipleInput(e.target.value)}
                disabled={feedback !== 'idle'}
                className={`w-full px-4 py-3 rounded-lg border-2 focus:ring-4 outline-none transition-all
                  ${feedback === 'idle' 
                    ? 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100' 
                    : feedback === 'correct'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-red-300 bg-red-50 text-red-700'
                  }`}
                placeholder="답을 입력하세요"
                autoComplete="off"
              />
              {feedback === 'incorrect' && (
                <p className="text-sm text-red-500 font-medium animate-pulse">정답: {currentVerb.participle}</p>
              )}
            </div>
          </div>

          <div className="pt-6">
            {feedback === 'idle' ? (
              <button
                type="submit"
                className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
              >
                정답 확인
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2
                  ${feedback === 'correct' 
                    ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-200' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'}`}
              >
                {feedback === 'correct' ? <CheckCircle /> : <RefreshCw />}
                {currentIndex === verbs.length - 1 ? '결과 보기' : '다음 문제'}
                <ArrowRight size={20} />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuizMode;