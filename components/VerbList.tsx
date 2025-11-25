import React from 'react';
import { Verb } from '../types';
import VerbCard from './VerbCard';
import { Search } from 'lucide-react';

interface VerbListProps {
  verbs: Verb[];
}

const VerbList: React.FC<VerbListProps> = ({ verbs }) => {
  const [filter, setFilter] = React.useState('');

  const filteredVerbs = verbs.filter(v => 
    v.base.toLowerCase().includes(filter.toLowerCase()) ||
    v.meaning.includes(filter)
  );

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Search verbs or meanings..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVerbs.map(verb => (
          <VerbCard key={verb.id} verb={verb} onSpeak={speak} />
        ))}
      </div>

      {filteredVerbs.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <p>No verbs found matching "{filter}"</p>
        </div>
      )}
    </div>
  );
};

export default VerbList;
