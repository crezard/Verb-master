import React, { useState } from 'react';
import { Verb } from '../types';
import { Volume2, BookOpen } from 'lucide-react';

interface VerbCardProps {
  verb: Verb;
  onSpeak: (text: string) => void;
}

const VerbCard: React.FC<VerbCardProps> = ({ verb, onSpeak }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
             <span className={`px-2 py-1 text-xs font-semibold rounded-full ${verb.isIrregular ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
              {verb.isIrregular ? 'Irregular' : 'Regular'}
             </span>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onSpeak(verb.base);
            }}
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
           <div className="bg-slate-50 p-3 rounded-lg text-center border border-slate-200">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Past</p>
              <p className="font-semibold text-indigo-600">{verb.past}</p>
           </div>
           <div className="bg-slate-50 p-3 rounded-lg text-center border border-slate-200">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Participle</p>
              <p className="font-semibold text-indigo-600">{verb.participle}</p>
           </div>
        </div>
        
        {!isFlipped && (
          <div className="text-center py-4 text-slate-400 text-sm flex items-center justify-center gap-2">
            <BookOpen size={16} />
            <span>Tap to reveal forms</span>
          </div>
        )}

        <div className={`mt-4 pt-4 border-t border-slate-100 ${isFlipped ? 'block' : 'hidden'}`}>
          <p className="text-sm text-slate-600 italic">"{verb.example}"</p>
        </div>
      </div>
    </div>
  );
};

export default VerbCard;
