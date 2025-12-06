import React from 'react';
import { Language, Tool } from '../types';
import { TOOLS, I18N } from '../constants';
import { ChevronLeft } from 'lucide-react';

interface DashboardProps {
  lang: Language;
  onOpenTool: (tool: Tool) => void;
  accessLevel: 'free' | 'paid' | 'none';
  onBack: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ lang, onOpenTool, accessLevel, onBack }) => {
  const t = I18N[lang];

  return (
    <div className="min-h-screen p-4 pb-20">
      <header className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
           <button 
             onClick={onBack}
             className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all active:scale-95"
           >
             <ChevronLeft size={20} />
           </button>
           <div>
              <h2 className="text-2xl font-bold text-white leading-none">{t.dashboardTitle}</h2>
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                v2.4.0 • 
                <span className={accessLevel === 'paid' ? "text-primary font-bold" : "text-yellow-500 font-bold"}>
                   {accessLevel === 'paid' ? 'Pro Active' : 'Free Trial'}
                </span>
              </p>
           </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border border-white/20 shadow-lg shadow-indigo-500/20"></div>
      </header>

      {/* Bento Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 auto-rows-[minmax(100px,auto)]">
        {TOOLS.map((tool) => (
          <div
            key={tool.id}
            onClick={() => onOpenTool(tool)}
            className={`
              relative group glass-card rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] hover:bg-white/10 cursor-pointer
              ${tool.span || 'col-span-1 row-span-1'}
              ${tool.isNew ? 'border-primary/50' : ''}
            `}
          >
            {/* Badges */}
            <div className="flex justify-between items-start w-full">
                <div className={`p-2 rounded-xl bg-white/5 ${tool.color} mb-2`}>
                <tool.icon size={24} />
                </div>
                {tool.isHot && (
                    <span className="bg-red-500/20 text-red-400 text-[10px] px-2 py-0.5 rounded-full font-bold border border-red-500/20">HOT</span>
                )}
                {tool.isNew && (
                    <span className="bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold border border-primary/20">NEW</span>
                )}
            </div>

            <span className="text-sm font-medium text-gray-200 leading-tight">
              {t[tool.nameKey] || tool.nameKey}
            </span>

            {/* Hover Effect Light */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />
          </div>
        ))}

        {/* Placeholder for "Coming Soon" or Ads in Free Version */}
        {accessLevel === 'free' && (
           <div className="col-span-2 glass-card rounded-2xl p-4 flex flex-col items-center justify-center border-dashed border-gray-700 opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
             <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Unlock More</span>
             <span className="text-[10px] text-gray-500 text-center">Get the full suite of 30+ tools</span>
           </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;