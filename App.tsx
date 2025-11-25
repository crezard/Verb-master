import React, { useState, useEffect } from 'react';
import { Verb, AppView } from './types.ts';
import { INITIAL_VERBS } from './constants.ts';
import { generateVerbsByTopic } from './services/geminiService.ts';
import QuizMode from './components/QuizMode.tsx';
import VerbList from './components/VerbList.tsx';
import { Book, Brain, Sparkles, LayoutDashboard, Plus, Loader2, ArrowLeft } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.HOME);
  const [verbs, setVerbs] = useState<Verb[]>(INITIAL_VERBS);
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [quizVerbs, setQuizVerbs] = useState<Verb[]>([]);

  // Hydrate from localStorage if available (optional enhancement for persistence)
  useEffect(() => {
    const saved = localStorage.getItem('gemini-verbs');
    if (saved) {
      try {
        setVerbs(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load verbs", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('gemini-verbs', JSON.stringify(verbs));
  }, [verbs]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsGenerating(true);
    try {
      const newVerbs = await generateVerbsByTopic(topic);
      // Avoid duplicates based on base form
      const uniqueNewVerbs = newVerbs.filter(nv => !verbs.some(v => v.base.toLowerCase() === nv.base.toLowerCase()));
      
      if (uniqueNewVerbs.length > 0) {
        setVerbs(prev => [...uniqueNewVerbs, ...prev]);
        setView(AppView.LEARN); // Go to list to see new verbs
      } else {
        alert("이미 리스트에 존재하는 동사들입니다!");
      }
      setTopic('');
    } catch (err) {
      alert("동사 생성에 실패했습니다. .env 파일에 VITE_VAIT_API_KEY가 올바르게 설정되었는지 확인해주세요.");
    } finally {
      setIsGenerating(false);
    }
  };

  const startQuiz = () => {
    // Shuffle and pick 10
    const shuffled = [...verbs].sort(() => 0.5 - Math.random());
    setQuizVerbs(shuffled.slice(0, 10));
    setView(AppView.QUIZ);
  };

  const renderContent = () => {
    switch (view) {
      case AppView.QUIZ:
        return <QuizMode verbs={quizVerbs} onFinish={() => setView(AppView.HOME)} />;
      
      case AppView.LEARN:
        return (
            <div>
                 <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => setView(AppView.HOME)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                        <ArrowLeft />
                    </button>
                    <h2 className="text-2xl font-bold text-slate-800">나만의 동사 컬렉션</h2>
                 </div>
                <VerbList verbs={verbs} />
            </div>
        );

      case AppView.GENERATOR:
        return (
          <div className="max-w-xl mx-auto py-12">
            <button onClick={() => setView(AppView.HOME)} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-8 transition-colors">
                <ArrowLeft size={20} /> 대시보드로 돌아가기
            </button>
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-indigo-50">
              <div className="flex justify-center mb-6">
                <div className="bg-indigo-100 p-4 rounded-full text-indigo-600">
                   <Sparkles size={48} />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-center text-slate-800 mb-4">AI 동사 생성기</h2>
              <p className="text-center text-slate-500 mb-8">
                주제(예: "여행", "비즈니스", "요리")를 입력하면 Gemini가 학습할 맞춤형 동사 리스트를 만들어줍니다.
              </p>
              
              <form onSubmit={handleGenerate} className="space-y-4">
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="주제를 입력하세요..."
                  className="w-full px-5 py-4 text-lg rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                  disabled={isGenerating}
                />
                <button
                  type="submit"
                  disabled={isGenerating || !topic.trim()}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="animate-spin" /> 생성 중...
                    </>
                  ) : (
                    <>
                      <Plus size={24} /> 리스트 만들기
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        );

      case AppView.HOME:
      default:
        return (
          <div className="space-y-8">
            <div className="text-center py-8">
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
                영어 동사 마스터하기
              </h1>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                불규칙 동사를 연습하고, AI 예문으로 학습하며, 퀴즈를 통해 실력을 키우세요.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {/* Card 1: Study */}
              <div 
                onClick={() => setView(AppView.LEARN)}
                className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
              >
                <div className="bg-blue-100 w-14 h-14 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                  <Book size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">학습 리스트</h3>
                <p className="text-slate-500">현재 저장된 {verbs.length}개의 동사를 복습합니다.</p>
              </div>

              {/* Card 2: Quiz */}
              <div 
                onClick={startQuiz}
                className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
              >
                <div className="bg-amber-100 w-14 h-14 rounded-2xl flex items-center justify-center text-amber-600 mb-6 group-hover:scale-110 transition-transform">
                  <Brain size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">퀴즈 모드</h3>
                <p className="text-slate-500">과거형과 과거분사형 지식을 테스트해보세요.</p>
              </div>

              {/* Card 3: AI Generate */}
              <div 
                onClick={() => setView(AppView.GENERATOR)}
                className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-2xl shadow-lg text-white hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
              >
                <div className="bg-white/20 w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform backdrop-blur-sm">
                  <Sparkles size={28} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">AI 생성기</h3>
                <p className="text-indigo-100">원하는 주제로 새로운 동사 리스트를 생성해보세요.</p>
              </div>
            </div>
            
            <div className="mt-12 text-center">
                 <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-200 rounded-full text-sm font-semibold text-slate-600">
                    <LayoutDashboard size={16} />
                    <span>현재 라이브러리: {verbs.length} 단어</span>
                 </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 font-bold text-xl text-indigo-600 cursor-pointer"
            onClick={() => setView(AppView.HOME)}
          >
            <Sparkles className="fill-current" size={24} />
            <span>VerbMaster</span>
          </div>
          <nav className="flex gap-4">
             <button 
                onClick={() => setView(AppView.HOME)}
                className={`text-sm font-medium transition-colors ${view === AppView.HOME ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'}`}
             >
                대시보드
             </button>
             <button 
                 onClick={() => setView(AppView.LEARN)}
                 className={`text-sm font-medium transition-colors ${view === AppView.LEARN ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'}`}
             >
                리스트
             </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-slate-400 text-sm">
          <p>© {new Date().getFullYear()} VerbMaster. Powered by Gemini API.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;