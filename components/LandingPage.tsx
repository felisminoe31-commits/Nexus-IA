
import React, { useRef } from 'react';
import { Language } from '../types';
import { I18N, TOOLS } from '../constants';
import { 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  Star, 
  ChevronDown,
  Rocket,
  Globe2,
  Cpu
} from 'lucide-react';

interface LandingPageProps {
  lang: Language;
  onUnlock: () => void;
  onTrial: () => void;
  onPurchase: (plan: string, amount: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ lang, onUnlock, onTrial, onPurchase }) => {
  const t = I18N[lang];
  const pricingRef = useRef<HTMLDivElement>(null);

  const scrollToPricing = () => {
    pricingRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden bg-[#050b14]">
      
      {/* --- AMBIENT 3D BACKGROUND --- */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Top Nebula */}
        <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-purple-600/20 blur-[120px] rounded-full mix-blend-screen animate-pulse-slow"></div>
        {/* Bottom Nebula */}
        <div className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] bg-cyan-600/10 blur-[100px] rounded-full mix-blend-screen animate-pulse-slow"></div>
        {/* Floating Particles */}
        <div className="absolute top-[20%] right-[20%] w-2 h-2 bg-white rounded-full animate-float blur-[1px]"></div>
        <div className="absolute bottom-[30%] left-[10%] w-3 h-3 bg-purple-400 rounded-full animate-float-delayed blur-[2px]"></div>
      </div>

      {/* --- HERO SECTION --- */}
      <section className="relative z-10 pt-10 pb-20 px-6 flex flex-col items-center text-center perspective-container min-h-screen justify-center">
        
        {/* 3D NEXUS CORE ANIMATION */}
        <div className="mb-12 relative animate-float">
            <div className="atom-container">
                <div className="core"></div>
                <div className="orbit"></div>
                <div className="orbit"></div>
                <div className="orbit"></div>
            </div>
            {/* Glow underneath */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-40 h-10 bg-purple-500/30 blur-[40px] rounded-full"></div>
        </div>

        {/* HEADLINES */}
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-xs font-bold tracking-widest text-gray-300 uppercase">System Online v2.5</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] drop-shadow-2xl animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <span className="text-white">NEXUS</span><br/>
                <span className="text-gradient-premium">SUPER APP</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-400 max-w-xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.3s' }}>
               {lang === 'pt' 
                 ? "Domine o digital. 17 ferramentas de elite em um único comando." 
                 : "Dominate digital. 17 elite tools at your single command."}
            </p>
        </div>

        {/* CTA BUTTONS (3D Feel) */}
        <div className="mt-10 flex flex-col w-full max-w-xs gap-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
             <button 
                onClick={scrollToPricing}
                className="group relative w-full py-4 bg-white text-black font-black text-lg rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] transition-all hover:scale-[1.02] active:scale-95"
             >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity"></div>
                <span className="flex items-center justify-center gap-2">
                   {t.unlock} <Zap size={20} className="fill-black" />
                </span>
             </button>

             <button 
                onClick={onTrial}
                className="w-full py-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 font-bold backdrop-blur-md transition-all active:scale-95 flex items-center justify-center gap-2"
             >
                {t.trial}
             </button>
        </div>

        <div className="absolute bottom-10 animate-bounce opacity-30">
            <ChevronDown size={32} />
        </div>
      </section>

      {/* --- INFINITE MARQUEE (Neon Style) --- */}
      <div className="relative z-10 py-6 bg-black/40 border-y border-white/10 backdrop-blur-md overflow-hidden">
        <div className="flex w-[200%] animate-marquee">
          {[...TOOLS, ...TOOLS].map((tool, index) => (
            <div key={`${tool.id}-${index}`} className="flex items-center gap-3 px-8 opacity-50 hover:opacity-100 transition-opacity">
               <tool.icon size={24} className={tool.color} style={{filter: 'drop-shadow(0 0 8px currentColor)'}} />
               <span className="text-sm font-bold text-white tracking-widest uppercase">{t[tool.nameKey] || tool.nameKey}</span>
            </div>
          ))}
        </div>
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#050b14] to-transparent z-20"></div>
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#050b14] to-transparent z-20"></div>
      </div>

      {/* --- 3D BENTO GRID FEATURES --- */}
      <section className="relative z-10 py-24 px-6 perspective-container">
          <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                  <span className="text-accent text-xs font-bold tracking-[0.3em] uppercase mb-4 block animate-pulse">Tecnologia Superior</span>
                  <h3 className="text-4xl md:text-5xl font-black text-white">
                      {lang === 'pt' ? 'O Futuro é Nexus.' : 'The Future is Nexus.'}
                  </h3>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                  {/* Card 1 */}
                  <div className="card-3d glass-card p-8 rounded-3xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-[40px] group-hover:bg-indigo-500/40 transition-all"></div>
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/30">
                          <Cpu size={28} className="text-white" />
                      </div>
                      <h4 className="text-2xl font-bold text-white mb-3">{t.feature2Title}</h4>
                      <p className="text-gray-400 leading-relaxed">{t.feature2Desc}</p>
                  </div>

                  {/* Card 2 */}
                  <div className="card-3d glass-card p-8 rounded-3xl relative overflow-hidden group md:mt-12">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 rounded-full blur-[40px] group-hover:bg-cyan-500/40 transition-all"></div>
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/30">
                          <Rocket size={28} className="text-white" />
                      </div>
                      <h4 className="text-2xl font-bold text-white mb-3">{t.feature1Title}</h4>
                      <p className="text-gray-400 leading-relaxed">{t.feature1Desc}</p>
                  </div>

                  {/* Card 3 */}
                  <div className="card-3d glass-card p-8 rounded-3xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/20 rounded-full blur-[40px] group-hover:bg-green-500/40 transition-all"></div>
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30">
                          <ShieldCheck size={28} className="text-white" />
                      </div>
                      <h4 className="text-2xl font-bold text-white mb-3">{t.feature3Title}</h4>
                      <p className="text-gray-400 leading-relaxed">{t.feature3Desc}</p>
                  </div>
              </div>
          </div>
      </section>

      {/* --- PRICING (Glass & Neon) --- */}
      <section ref={pricingRef} className="relative z-10 py-20 px-6 max-w-5xl mx-auto w-full">
         <div className="text-center mb-12">
            <h3 className="text-4xl font-black text-white mb-4">{t.unlock}</h3>
            <p className="text-gray-400">{t.ctaDesc}</p>
         </div>

         <div className="grid md:grid-cols-3 gap-6 items-center">
            {/* Weekly */}
            <div 
              onClick={() => onPurchase('weekly', '2 USDT')}
              className="glass-card rounded-3xl p-8 cursor-pointer hover:bg-white/10 transition-all border-t border-white/10"
            >
               <h4 className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-4">{t.weekly}</h4>
               <div className="text-4xl font-black text-white mb-6">2 USDT</div>
               <button className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/20 text-white font-bold transition-colors">Select</button>
            </div>

            {/* Lifetime (HERO CARD) */}
            <div 
              onClick={() => onPurchase('lifetime', '7 USDT')}
              className="relative rounded-3xl p-[2px] bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 shadow-[0_0_50px_rgba(139,92,246,0.3)] transform md:scale-110 z-20 cursor-pointer group"
            >
               <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-black px-4 py-1.5 rounded-full shadow-lg tracking-wide uppercase flex items-center gap-1">
                  <Star size={12} fill="currentColor" /> {t.bestValue}
               </div>
               <div className="bg-[#0f172a] rounded-[22px] p-8 h-full flex flex-col relative overflow-hidden">
                  {/* Internal Glow */}
                  <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-b from-white/5 to-transparent rotate-45 pointer-events-none"></div>
                  
                  <h4 className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 font-black uppercase tracking-widest text-sm mb-2">{t.lifetime}</h4>
                  <div className="text-5xl font-black text-white mb-1">7 USDT</div>
                  <div className="text-xs text-gray-500 mb-8 uppercase font-bold tracking-wider">Single Payment</div>
                  
                  <ul className="space-y-4 mb-8">
                     <li className="flex items-center gap-3 text-sm text-gray-200 font-bold"><div className="p-1 rounded bg-green-500/20 text-green-400"><CheckCircle2 size={14}/></div> All 17+ Tools</li>
                     <li className="flex items-center gap-3 text-sm text-gray-200 font-bold"><div className="p-1 rounded bg-green-500/20 text-green-400"><CheckCircle2 size={14}/></div> Priority GPU</li>
                     <li className="flex items-center gap-3 text-sm text-gray-200 font-bold"><div className="p-1 rounded bg-green-500/20 text-green-400"><CheckCircle2 size={14}/></div> Lifetime Updates</li>
                  </ul>
                  
                  <button className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black shadow-lg transition-all group-hover:shadow-[0_0_20px_rgba(139,92,246,0.6)] flex items-center justify-center gap-2">
                     Get Instant Access <Rocket size={18} />
                  </button>
               </div>
            </div>

            {/* Monthly */}
            <div 
               onClick={() => onPurchase('monthly', '4 USDT')}
               className="glass-card rounded-3xl p-8 cursor-pointer hover:bg-white/10 transition-all border-t border-white/10"
            >
               <h4 className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-4">{t.monthly}</h4>
               <div className="text-4xl font-black text-white mb-6">4 USDT</div>
               <button className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/20 text-white font-bold transition-colors">Select</button>
            </div>
         </div>
         
         <p className="text-center text-xs text-gray-500 mt-10 flex items-center justify-center gap-2 opacity-60">
            <ShieldCheck size={14} /> 
            {lang === 'pt' ? 'Pagamento Cripto Seguro & Anônimo' : 'Secure & Anonymous Crypto Payment'}
         </p>
      </section>

      {/* --- FOOTER --- */}
      <footer className="relative z-10 py-10 border-t border-white/5 text-center">
         <div className="flex justify-center gap-6 mb-6 text-gray-400">
            <Globe2 size={20} className="hover:text-white cursor-pointer transition-colors" />
            <div className="w-px h-5 bg-white/10"></div>
            <span className="text-xs font-bold hover:text-white cursor-pointer">TERMS</span>
            <span className="text-xs font-bold hover:text-white cursor-pointer">PRIVACY</span>
         </div>
         <p className="text-[10px] text-gray-600 font-mono">
            NEXUS SYSTEM /// V2.5.0<br/>
            © 2025 ALL RIGHTS RESERVED
         </p>
      </footer>

    </div>
  );
};

export default LandingPage;
