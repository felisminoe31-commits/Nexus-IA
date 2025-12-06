import React from 'react';
import { Language } from '../types';

interface LanguageToggleProps {
  currentLang: Language;
  onToggle: (lang: Language) => void;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ currentLang, onToggle }) => {
  return (
    <div className="absolute top-4 right-4 z-50 glass-card rounded-full p-1 flex">
      <button
        onClick={() => onToggle('pt')}
        className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
          currentLang === 'pt' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'
        }`}
      >
        PT
      </button>
      <button
        onClick={() => onToggle('en')}
        className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
          currentLang === 'en' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'
        }`}
      >
        EN
      </button>
    </div>
  );
};

export default LanguageToggle;