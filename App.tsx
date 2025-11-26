import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Book, Brain, LayoutDashboard, Plus, Loader2, ArrowLeft, Volume2, BookOpen, CheckCircle, XCircle, ArrowRight, RefreshCw, Trophy, Search } from 'lucide-react';
import { generateVerbsByTopic } from './services/geminiService';

// --- Types ---
interface Verb {
  id: string;
  base: string;
  past: string;
  participle: string;
  meaning: string;
  example: string;
  isIrregular: boolean;
}

enum AppView {
  HOME = 'HOME',
  LEARN = 'LEARN',
  QUIZ = 'QUIZ',
  GENERATOR = 'GENERATOR'
}

// --- Constants ---
const INITIAL_VERBS: Verb[] = [
  { id: 'v1', base: 'go', past: 'went', participle: 'gone', meaning: '가다', example: 'I usually go to work by bus.', isIrregular: true },
  { id: 'v2', base: 'eat', past: 'ate', participle: 'eaten', meaning: '먹다', example: 'I ate lunch an hour ago.', isIrregular: true },
  { id: 'v3', base: 'write', past: 'wrote', participle: 'written', meaning: '쓰다', example: 'She wrote a letter.', isIrregular: true },
  { id: 'v4', base: 'play', past: 'played', participle: 'played', meaning: '놀다/연주하다', example: 'We played soccer.', isIrregular: false },
  { id: 'v5', base: 'take', past: 'took', participle: 'taken', meaning: '가져가다/타다', example: 'It took two hours.', isIrregular: true },
  { id: 'v6', base: 'see', past: 'saw', participle: 'seen', meaning: '보다', example: 'I saw him yesterday.', isIrregular: true },
  { id: 'v7', base: 'do', past: 'did', participle: 'done', meaning: '하다', example: 'She did her homework.', isIrregular: true },
  { id: 'v8', base: 'buy', past: 'bought', participle: 'bought', meaning: '사다', example: 'He bought a laptop.', isIrregular: true },
  { id: 'v9', base: 'speak', past: 'spoke', participle: 'spoken', meaning: '말하다', example: 'I spoke to the manager.', isIrregular: true },
  { id: 'v10', base: 'study', past: 'studied', participle: 'studied', meaning: '공부하다', example: 'We studied English.', isIrregular: false },
];

// --- Sub-Components ---

const VerbCard: React.FC<{ verb: Verb; onSpeak: (text: string) => void }> = ({ verb, onSpeak }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  return (
    <div 
      className="bg-white rounded-xl shadow border border-slate-100 overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${verb.isIrregular ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
            {verb.isIrregular ? '불규칙' : '규칙'}
          </span>
          <button 
            onClick={(e) => { e.stopPropagation(); onSpeak(verb.base); }}
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
          >
            <Volume2 size={20} />
          </button>
        </div>
        <div className="text-center mb-6">
          <h3 className="text-3xl font-bold text-slate-800 mb-1">{verb.base}</h3>
          <p className="text-slate-500 font-medium">{verb.meaning}</p>
        </div>
        <div className={`grid grid-cols-2 gap-3 transition-opacity duration-300 ${isFlipped ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
           <div className="bg-slate-50 p-2 rounded text-center border border-slate-200">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Past</p>
              <p className="font-semibold text-indigo-600">{verb.past}</p>
           </div>
           <div className="bg-slate-50 p-2 rounded text-center border border-slate-200">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">PP</p>
              <p className="font-semibold text-indigo-600">{verb.participle}</p>
           </div>
        </div>
        {!isFlipped && (
          <div className="text-center py-2 text-slate-400 text-xs flex items-center justify-center gap-1">
            <BookOpen size={14} /> <span>탭하여 정답 보기</span>
          </div>
        )}
      </div>
    </div>
  );
};

const QuizMode: React.FC<{ verbs: Verb[]; onFinish: () => void }> = ({ verbs, onFinish }) => {
  const [idx, setIdx] = useState(0);
  const [past, setPast] = useState('');
  const [pp, setPp] = useState('');
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [score, setScore] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const current = verbs[idx];

  useEffect(() => { inputRef.current?.focus(); }, [idx]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback !== 'idle' || !past.trim() || !pp.trim()) return;
    const isCorrect = past.trim().toLowerCase() === current.past.toLowerCase() && 
                      pp.trim().toLowerCase() === current.participle.toLowerCase();
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    if (isCorrect) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (idx < verbs.length - 1) {
      setIdx(i => i + 1); setPast(''); setPp(''); setFeedback('idle');
    } else {
      setIdx(verbs.length); // Completed state marker
    }
  };

  if (idx >= verbs.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
        <Trophy size={64} className="text-yellow-500 mb-6" />
        <h2 className="text-2xl font-bold mb-2">퀴즈 완료!</h2>
        <p className="text-slate-500 mb-6">{verbs.length}문제 중 {score}점 획득</p>
        <button onClick={onFinish} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-medium shadow hover:bg-indigo-700">메인으로</button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-4 flex justify-between text-sm font-medium">
        <span className="text-slate-500">문제 {idx + 1} / {verbs.length}</span>
        <span className="text-indigo-600">점수: {score}</span>
      </div>
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-extrabold text-slate-800 mb-1">{current.base}</h2>
          <p className="text-slate-500">{current.meaning}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500">과거형 (Past)</label>
              <input ref={inputRef} required type="text" value={past} onChange={e => setPast(e.target.value)} disabled={feedback !== 'idle'} 
                className={`w-full px-4 py-3 rounded-lg border-2 outline-none transition-colors ${feedback === 'idle' ? 'border-slate-200 focus:border-indigo-500' : feedback === 'correct' ? 'border-green-500 bg-green-50' : 'border-red-300 bg-red-50'}`} placeholder="답 입력" autoComplete="off" />
               {feedback === 'incorrect' && <p className="text-xs text-red-500 mt-1">정답: {current.past}</p>}
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500">과거분사 (PP)</label>
              <input required type="text" value={pp} onChange={e => setPp(e.target.value)} disabled={feedback !== 'idle'}
                className={`w-full px-4 py-3 rounded-lg border-2 outline-none transition-colors ${feedback === 'idle' ? 'border-slate-200 focus:border-indigo-500' : feedback === 'correct' ? 'border-green-500 bg-green-50' : 'border-red-300 bg-red-50'}`} placeholder="답 입력" autoComplete="off" />
              {feedback === 'incorrect' && <p className="text-xs text-red-500 mt-1">정답: {current.participle}</p>}
            </div>
          </div>
          <button type={feedback === 'idle' ? 'submit' : 'button'} onClick={feedback !== 'idle' ? handleNext : undefined}
            className={`w-full py-3 rounded-xl font-bold text-white shadow transition-all flex items-center justify-center gap-2 ${feedback === 'idle' ? 'bg-slate-900 hover:bg-slate-800' : feedback === 'correct' ? 'bg-green-600 hover:bg-green-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
            {feedback === 'idle' ? '정답 확인' : <>{feedback === 'correct' ? <CheckCircle size={20}/> : <RefreshCw size={20}/>} {idx === verbs.length - 1 ? '결과 보기' : '다음 문제'} <ArrowRight size={20}/></>}
          </button>
        </form>
      </div>
    </div>
  );
};

const VerbList: React.FC<{ verbs: Verb[] }> = ({ verbs }) => {
  const [filter, setFilter] = useState('');
  const filtered = verbs.filter(v => v.base.toLowerCase().includes(filter.toLowerCase()) || v.meaning.includes(filter));
  const speak = (text: string) => { const u = new SpeechSynthesisUtterance(text); u.lang = 'en-US'; window.speechSynthesis.speak(u); };

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input type="text" placeholder="검색..." value={filter} onChange={e => setFilter(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(v => <VerbCard key={v.id} verb={v} onSpeak={speak} />)}
      </div>
      {filtered.length === 0 && <p className="text-center text-slate-400 py-8">검색 결과가 없습니다.</p>}
    </div>
  );
};

// --- Main Component ---
const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.HOME);
  const [verbs, setVerbs] = useState<Verb[]>(INITIAL_VERBS);
  const [topic, setTopic] = useState('');
  const [isGen, setIsGen] = useState(false);
  const [quizVerbs, setQuizVerbs] = useState<Verb[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('gemini-verbs');
    if (saved) try { setVerbs(JSON.parse(saved)); } catch (e) {}
  }, []);

  useEffect(() => { localStorage.setItem('gemini-verbs', JSON.stringify(verbs)); }, [verbs]);

  const handleGen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setIsGen(true);
    try {
      const newVerbs = await generateVerbsByTopic(topic);
      const unique = newVerbs.filter(nv => !verbs.some(v => v.base.toLowerCase() === nv.base.toLowerCase()));
      if (unique.length) {
        setVerbs(prev => [...unique, ...prev]);
        setView(AppView.LEARN);
      } else alert("중복된 동사입니다.");
      setTopic('');
    } catch (err: any) { 
      console.error(err);
      alert(`오류: ${err.message}`); 
    } 
    finally { setIsGen(false); }
  };

  const startQuiz = () => {
    setQuizVerbs([...verbs].sort(() => 0.5 - Math.random()).slice(0, 10));
    setView(AppView.QUIZ);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={() => setView(AppView.HOME)} className="flex items-center gap-2 font-bold text-lg text-indigo-600">
            <Sparkles size={20} className="fill-current" /> VerbMaster
          </button>
          <nav className="flex gap-4 text-sm font-medium">
             <button onClick={() => setView(AppView.HOME)} className={view === AppView.HOME ? 'text-indigo-600' : 'text-slate-500'}>홈</button>
             <button onClick={() => setView(AppView.LEARN)} className={view === AppView.LEARN ? 'text-indigo-600' : 'text-slate-500'}>리스트</button>
          </nav>
        </div>
      </header>
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-6">
        {view === AppView.QUIZ && <QuizMode verbs={quizVerbs} onFinish={() => setView(AppView.HOME)} />}
        {view === AppView.LEARN && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <button onClick={() => setView(AppView.HOME)} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-500"><ArrowLeft size={20}/></button>
              <h2 className="text-xl font-bold text-slate-800">동사 리스트 ({verbs.length})</h2>
            </div>
            <VerbList verbs={verbs} />
          </div>
        )}
        {view === AppView.GENERATOR && (
          <div className="max-w-lg mx-auto py-8">
            <button onClick={() => setView(AppView.HOME)} className="flex items-center gap-2 text-slate-500 mb-6 hover:text-slate-800"><ArrowLeft size={18}/> 돌아가기</button>
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-indigo-50 text-center">
              <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center text-indigo-600 mx-auto mb-4"><Sparkles size={24}/></div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">AI 동사 생성</h2>
              <p className="text-slate-500 mb-6 text-sm">주제(예: 요리, 여행)를 입력하세요.</p>
              <form onSubmit={handleGen} className="space-y-3">
                <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="주제 입력..." disabled={isGen}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                <button type="submit" disabled={isGen || !topic.trim()}
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  {isGen ? <Loader2 className="animate-spin" size={20}/> : <Plus size={20}/>} 생성하기
                </button>
              </form>
            </div>
          </div>
        )}
        {view === AppView.HOME && (
          <div className="space-y-8 py-4">
            <div className="text-center">
              <h1 className="text-3xl font-extrabold text-slate-900 mb-2">영어 불규칙 동사 마스터</h1>
              <p className="text-slate-600">AI와 함께 효율적으로 학습하세요.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div onClick={() => setView(AppView.LEARN)} className="bg-white p-6 rounded-xl shadow border border-slate-100 hover:shadow-md cursor-pointer group transition-all">
                <div className="bg-blue-100 w-10 h-10 rounded-lg flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform"><Book size={20}/></div>
                <h3 className="font-bold text-slate-800">학습하기</h3>
                <p className="text-xs text-slate-500 mt-1">{verbs.length}개의 단어장</p>
              </div>
              <div onClick={startQuiz} className="bg-white p-6 rounded-xl shadow border border-slate-100 hover:shadow-md cursor-pointer group transition-all">
                <div className="bg-amber-100 w-10 h-10 rounded-lg flex items-center justify-center text-amber-600 mb-4 group-hover:scale-110 transition-transform"><Brain size={20}/></div>
                <h3 className="font-bold text-slate-800">퀴즈 풀기</h3>
                <p className="text-xs text-slate-500 mt-1">실력 테스트</p>
              </div>
              <div onClick={() => setView(AppView.GENERATOR)} className="bg-gradient-to-br from-indigo-600 to-purple-600 p-6 rounded-xl shadow text-white hover:shadow-md cursor-pointer group transition-all">
                <div className="bg-white/20 w-10 h-10 rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform"><Sparkles size={20}/></div>
                <h3 className="font-bold text-white">AI 생성</h3>
                <p className="text-xs text-indigo-100 mt-1">맞춤형 단어 추가</p>
              </div>
            </div>
            <div className="text-center">
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-200 rounded-full text-xs font-semibold text-slate-600">
                    <LayoutDashboard size={14} /> <span>저장된 단어: {verbs.length}</span>
                 </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;