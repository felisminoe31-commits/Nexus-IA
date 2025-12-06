
import React, { useState, useEffect, useRef } from 'react';
import { Language, Tool } from '../types';
import { I18N } from '../constants';
import { 
  X, Play, Loader2, Copy, AlertTriangle, Wand2, Lightbulb, Download, 
  Plus, Trash2, RefreshCw, Camera, ChevronRight, ChevronLeft, 
  Palette, Briefcase, User, GraduationCap, FileText, Check, Layout,
  Upload, Sparkles
} from 'lucide-react';

interface ToolModalProps {
  tool: Tool | null;
  isOpen: boolean;
  onClose: () => void;
  onStart: () => Promise<boolean>;
  lang: Language;
}

// Additional Type Definitions for Window libraries
declare global {
  interface Window {
    jspdf: any;
    Chart: any;
    html2canvas: any;
  }
}

const TOOL_TIPS: Record<number, { en: string; pt: string }> = {
  5: { // CV Builder
    en: "Fill out the tabs, choose a style, and see your resume update in real-time.",
    pt: "Preencha as abas, escolha um estilo e veja seu currículo atualizar em tempo real."
  },
  6: { // Invoice
    en: "Step 1: Branding. Step 2: Details. Step 3: Add Items. Then download your professional PDF.",
    pt: "Passo 1: Marca. Passo 2: Detalhes. Passo 3: Itens. Depois baixe seu PDF profissional."
  },
  7: { // QR Art
    en: "Customize colors to match your brand. Dark dots on light background work best for scanning.",
    pt: "Personalize as cores para combinar com sua marca. Pontos escuros em fundo claro funcionam melhor."
  },
  // ... (Keep existing tips for other tools)
  11: { en: "Describe the photo context...", pt: "Descreva o contexto..." },
  13: { en: "Provide a topic...", pt: "Forneça um tópico..." },
  15: { en: "Enter niche...", pt: "Digite o nicho..." },
  16: { en: "Share details...", pt: "Compartilhe detalhes..." },
  19: { en: "Paste bio...", pt: "Cole a bio..." },
  24: { en: "Real-time crypto prices...", pt: "Preços cripto em tempo real..." },
  25: { en: "Track daily expenses and categorize them for better insights.", pt: "Rastreie gastos diários e categorize-os para melhores insights." }
};

const UNAVAILABLE_MESSAGES: Record<number, { en: string; pt: string }> = {
  1: { // Bg Remover
    en: "We are upgrading the background removal engine for higher precision. It will be working shortly!",
    pt: "Estamos atualizando o motor de remoção de fundo para maior precisão. Irá funcionar brevemente!"
  },
  3: { // Watermark
    en: "Watermark removal is currently in maintenance for quality improvements. It will be back very soon.",
    pt: "A remoção de marca d'água está em manutenção para melhorias de qualidade. Irá funcionar brevemente!"
  },
  4: { // Transcriber
    en: "Audio transcription service is being scaled up. It will be available shortly.",
    pt: "O serviço de transcrição de áudio está sendo escalado. Irá funcionar brevemente!"
  },
  12: { // Thumbnail
    en: "AI Thumbnail generation is in final beta testing. This feature will be live shortly!",
    pt: "A geração de Miniaturas com IA está em testes finais. Esta ferramenta irá funcionar brevemente!"
  },
  14: { // Logo
    en: "The AI Logo Maker is loading new design styles. It will be working shortly!",
    pt: "O Criador de Logo com IA está carregando novos estilos de design. Irá funcionar brevemente!"
  }
};

const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Bills', 'Shopping', 'Health', 'Other'];

const ToolModal: React.FC<ToolModalProps> = ({ tool, isOpen, onClose, onStart, lang }) => {
  // Common State
  const [inputText, setInputText] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  
  // --- STATE: QR ART (Tool #7) ---
  const [qrText, setQrText] = useState('');
  const [qrColor, setQrColor] = useState('#000000');
  const [qrBgColor, setQrBgColor] = useState('#ffffff');
  const [qrUrl, setQrUrl] = useState('');

  // --- STATE: INVOICE 2.0 (Tool #6) ---
  const [invStep, setInvStep] = useState(1); // 1:Brand, 2:Details, 3:Items, 4:Preview
  const [invBrand, setInvBrand] = useState({ color: '#6366f1', logoText: 'MY BRAND', currency: '$' });
  const [invDetails, setInvDetails] = useState({ from: '', to: '', id: `INV-${Math.floor(Math.random()*10000)}`, date: new Date().toISOString().split('T')[0] });
  const [invItems, setInvItems] = useState<{id:number, desc:string, qty:number, price:number}[]>([]);
  
  // --- STATE: CV BUILDER (Tool #5) ---
  const [cvTab, setCvTab] = useState<'about'|'exp'|'skills'|'preview'>('about');
  const [cvStyle, setCvStyle] = useState<'modern'|'classic'>('modern');
  const [cvData, setCvData] = useState({
    name: '', title: '', email: '', phone: '', summary: '',
    experience: '', skills: '' 
  });

  // --- STATE: CRYPTO & EXPENSE ---
  const [cryptoData, setCryptoData] = useState<any>(null);
  const [expenses, setExpenses] = useState<{id: number, desc: string, amount: number, category: string}[]>([]);
  const [newExpense, setNewExpense] = useState({ desc: '', amount: '', category: 'Food' });

  const typingTimeoutRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const modalBodyRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);
  const previewRef = useRef<HTMLDivElement>(null); // For html2canvas capture

  useEffect(() => {
    if (isOpen && tool) {
      // Reset generic
      setInputText('');
      setGeneratedText('');
      setIsLoading(false);
      setIsTyping(false);
      
      // Reset Tool Specifics
      setQrText(''); setQrColor('#000000'); setQrBgColor('#ffffff'); setQrUrl('');
      setInvStep(1); setInvItems([]);
      setCvTab('about'); setCvData({ name: '', title: '', email: '', phone: '', summary: '', experience: '', skills: '' });
      setCryptoData(null);
      
      if (typingTimeoutRef.current) clearInterval(typingTimeoutRef.current);
      
      const tutorialKey = `nexus_tutorial_seen_${tool.id}`;
      const hasSeen = localStorage.getItem(tutorialKey);
      setShowTutorial(!hasSeen && !!TOOL_TIPS[tool.id]);

      if (tool.id === 24) fetchCrypto();
    }
  }, [isOpen, tool]);

  // Chart.js for Expenses
  useEffect(() => {
    if (tool?.id === 25 && isOpen && expenses.length > 0 && canvasRef.current && window.Chart) {
      if (chartRef.current) chartRef.current.destroy();
      const ctx = canvasRef.current.getContext('2d');
      
      // Aggregate data by category
      const categoryTotals: Record<string, number> = {};
      expenses.forEach(e => {
        categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
      });
      
      const labels = Object.keys(categoryTotals);
      const data = Object.values(categoryTotals);
      
      // Colors mapped to categories
      const categoryColors: Record<string, string> = {
        'Food': '#f97316',        // Orange
        'Transport': '#3b82f6',   // Blue
        'Entertainment': '#a855f7', // Purple
        'Bills': '#ef4444',       // Red
        'Shopping': '#ec4899',    // Pink
        'Health': '#10b981',      // Green
        'Other': '#6b7280'        // Gray
      };
      const bgColors = labels.map(l => categoryColors[l] || '#cbd5e1');

      if (ctx) {
        chartRef.current = new window.Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: labels,
            datasets: [{
              data: data,
              backgroundColor: bgColors,
              borderWidth: 0,
            }]
          },
          options: { 
            responsive: true, 
            maintainAspectRatio: false, 
            plugins: { 
              legend: { 
                position: 'right', 
                labels: { color: 'white', boxWidth: 10, font: { size: 10 } } 
              } 
            } 
          }
        });
      }
    } else if (expenses.length === 0 && chartRef.current) {
        chartRef.current.destroy(); chartRef.current = null;
    }
  }, [expenses, tool, isOpen]);

  if (!isOpen || !tool) return null;
  const t = I18N[lang];
  const isAiTextTool = [11, 13, 15, 16, 19].includes(tool.id);
  // Tools: BgRemover, Watermark, Transcriber, Converter, Thumbnail, Logo, Aging
  const isHeavyTool = [1, 3, 4, 9, 12, 14, 20].includes(tool.id);

  const handleDismissTutorial = () => {
    setShowTutorial(false);
    if (tool) localStorage.setItem(`nexus_tutorial_seen_${tool.id}`, 'true');
  };

  // --- GENERIC HELPERS ---
  const downloadRefAsPDF = async (filename: string) => {
    if (!previewRef.current || !window.html2canvas || !window.jspdf) return;
    setIsLoading(true);
    try {
      // Wait for images to load if any
      await new Promise(r => setTimeout(r, 500));
      
      const canvas = await window.html2canvas(previewRef.current, {
        scale: 2, // Higher quality
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${filename}.pdf`);
    } catch (e) {
      console.error(e);
      alert("Export failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- LOGIC: QR ART ---
  const generateQr = async () => {
    if(!qrText) return;
    setIsLoading(true);
    // Remove # for API
    const c = qrColor.replace('#', '');
    const bg = qrBgColor.replace('#', '');
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrText)}&color=${c}&bgcolor=${bg}`;
    
    // Preload
    const img = new Image();
    img.src = url;
    img.onload = () => { setQrUrl(url); setIsLoading(false); };
    img.onerror = () => { setIsLoading(false); alert("Error generating QR"); };
  };

  // --- LOGIC: INVOICE ---
  const addInvItem = () => {
    setInvItems([...invItems, { id: Date.now(), desc: 'New Item', qty: 1, price: 0 }]);
  };
  const updateInvItem = (id: number, field: string, val: any) => {
    setInvItems(invItems.map(i => i.id === id ? { ...i, [field]: val } : i));
  };
  const removeInvItem = (id: number) => {
    setInvItems(invItems.filter(i => i.id !== id));
  };
  const invTotal = invItems.reduce((acc, i) => acc + (i.qty * i.price), 0);

  // --- LOGIC: CRYPTO & EXPENSE ---
  const fetchCrypto = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether&vs_currencies=usd');
      const data = await res.json();
      setCryptoData(data);
    } catch {
       setCryptoData({ bitcoin: { usd: 64000 }, ethereum: { usd: 3400 }, tether: { usd: 1.00 } });
    } finally { setIsLoading(false); }
  };
  const addExpense = () => {
    if(newExpense.desc && newExpense.amount) {
      setExpenses([...expenses, { 
        id: Date.now(), 
        desc: newExpense.desc, 
        amount: parseFloat(newExpense.amount),
        category: newExpense.category 
      }]);
      setNewExpense({ ...newExpense, desc: '', amount: '' }); // Keep category
    }
  };

  const removeExpense = (id: number) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  // --- LOGIC: AI & HEAVY TOOLS ---
  const handleAiGeneration = async () => {
      if (!inputText.trim()) return;
      const canStart = await onStart();
      if (!canStart) return;

      setIsLoading(true);
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsLoading(false);
      
      // Typing effect response
      const responseMap: Record<number, string> = {
         11: "Here is a viral caption for your photo: 'Living my best life! ✨ #blessed #goals #lifestyle'\n\nAlternative: 'Chasing dreams and capturing moments. 📸'",
         13: "SEO Optimized Article Outline:\n\nH1: Top Trends in 2025\n\nIntro: The landscape of technology is evolving rapidly. Here is what you need to know.\n\nH2: AI Integration\nArtificial Intelligence is no longer a buzzword...",
         15: "#growth #marketing #viral #trending #2025 #contentcreator #socialmedia",
         16: "Your dream signifies a desire for freedom. The flying element represents breaking free from constraints, while the ocean suggests deep emotions.",
         19: "Oh look, another 'influencer' with a coffee cup. Groundbreaking. Maybe try focusing on the lens instead of your reflection? Just kidding! (Kind of)."
      };
      
      const text = responseMap[tool.id] || "AI generated content based on your input. This is a simulation of the Gemini Pro 1.5 model response.";
      setGeneratedText('');
      setIsTyping(true);
      
      let i = 0;
      const interval = setInterval(() => {
          setGeneratedText(prev => prev + text.charAt(i));
          i++;
          if (i >= text.length) {
              clearInterval(interval);
              setIsTyping(false);
          }
      }, 30);
      typingTimeoutRef.current = interval;
  };

  const handleHeavyToolAction = async () => {
      const canStart = await onStart();
      if (!canStart) return;
      
      setIsLoading(true);
      await new Promise(r => setTimeout(r, 2000)); // Simulate processing
      setIsLoading(false);
      
      // Check if there is a specific message for this tool
      const specificMsg = UNAVAILABLE_MESSAGES[tool.id];
      
      if (specificMsg) {
          alert(`🚧 ${t.maintenance}\n\n${specificMsg[lang]}`);
      } else {
          // Default generic message
          alert(`${t.maintenance} \n\n${t.maintenanceDesc}`);
      }
  };

  // --- RENDERERS ---

  const renderTutorial = () => (
    showTutorial && TOOL_TIPS[tool.id] && (
      <div className="relative bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/30 rounded-xl p-3 flex items-start gap-3 animate-slide-up mb-4">
        <div className="p-1.5 bg-blue-500/20 rounded-lg text-blue-300"><Lightbulb size={16} /></div>
        <div className="flex-1 pr-6">
          <p className="text-xs text-blue-100/90 leading-relaxed">{TOOL_TIPS[tool.id][lang]}</p>
        </div>
        <button onClick={handleDismissTutorial} className="absolute top-2 right-2 text-blue-300/50 hover:text-white"><X size={14}/></button>
      </div>
    )
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-[#131b2e] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-float">
        
        {/* Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#0f172a]">
          <div className="flex items-center gap-3">
             <div className={`p-2 rounded-lg bg-white/5 ${tool.color}`}><tool.icon size={20} /></div>
             <h3 className="text-lg font-bold text-white">{t[tool.nameKey]}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400"><X size={20}/></button>
        </div>

        {/* Content */}
        <div ref={modalBodyRef} className="flex-1 overflow-y-auto p-0 custom-scrollbar bg-[#0f172a]">
          <div className="p-6">
            {renderTutorial()}

            {/* --- INVOICE GENERATOR --- */}
            {tool.id === 6 && (
              <div className="space-y-6">
                {/* Stepper */}
                <div className="flex justify-between items-center px-2 mb-6 text-xs font-bold text-gray-500 uppercase tracking-widest">
                   <span className={invStep >= 1 ? "text-primary" : ""}>1. Brand</span>
                   <span className="h-[1px] flex-1 bg-white/10 mx-2"/>
                   <span className={invStep >= 2 ? "text-primary" : ""}>2. Info</span>
                   <span className="h-[1px] flex-1 bg-white/10 mx-2"/>
                   <span className={invStep >= 3 ? "text-primary" : ""}>3. Items</span>
                   <span className="h-[1px] flex-1 bg-white/10 mx-2"/>
                   <span className={invStep >= 4 ? "text-primary" : ""}>4. Export</span>
                </div>

                {/* Step 1: Branding */}
                {invStep === 1 && (
                  <div className="space-y-4 animate-slide-up">
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Brand Name / Logo Text</label>
                      <input type="text" value={invBrand.logoText} onChange={e=>setInvBrand({...invBrand, logoText:e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white"/>
                    </div>
                    <div>
                       <label className="text-xs text-gray-400 mb-1 block">Brand Color</label>
                       <div className="flex items-center gap-3">
                          <input type="color" value={invBrand.color} onChange={e=>setInvBrand({...invBrand, color:e.target.value})} className="h-10 w-20 rounded cursor-pointer bg-transparent"/>
                          <span className="text-xs text-gray-500">{invBrand.color}</span>
                       </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Currency Symbol</label>
                      <select value={invBrand.currency} onChange={e=>setInvBrand({...invBrand, currency:e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white">
                        <option value="$">USD ($)</option>
                        <option value="€">EUR (€)</option>
                        <option value="R$">BRL (R$)</option>
                      </select>
                    </div>
                    <button onClick={()=>setInvStep(2)} className="w-full py-3 bg-primary rounded-xl font-bold mt-4">Next: Details</button>
                  </div>
                )}

                {/* Step 2: Details */}
                {invStep === 2 && (
                  <div className="space-y-4 animate-slide-up">
                     <div>
                      <label className="text-xs text-gray-400 mb-1 block">Bill From (You)</label>
                      <textarea value={invDetails.from} onChange={e=>setInvDetails({...invDetails, from:e.target.value})} placeholder="Your Company Address..." className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white h-20"/>
                     </div>
                     <div>
                      <label className="text-xs text-gray-400 mb-1 block">Bill To (Client)</label>
                      <textarea value={invDetails.to} onChange={e=>setInvDetails({...invDetails, to:e.target.value})} placeholder="Client Name & Address..." className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white h-20"/>
                     </div>
                     <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="text-xs text-gray-400 mb-1 block">Invoice #</label>
                          <input type="text" value={invDetails.id} onChange={e=>setInvDetails({...invDetails, id:e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white"/>
                        </div>
                        <div className="flex-1">
                          <label className="text-xs text-gray-400 mb-1 block">Date</label>
                          <input type="date" value={invDetails.date} onChange={e=>setInvDetails({...invDetails, date:e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white"/>
                        </div>
                     </div>
                     <div className="flex gap-2 mt-4">
                        <button onClick={()=>setInvStep(1)} className="flex-1 py-3 bg-white/10 rounded-xl font-bold">Back</button>
                        <button onClick={()=>setInvStep(3)} className="flex-[2] py-3 bg-primary rounded-xl font-bold">Next: Items</button>
                     </div>
                  </div>
                )}

                {/* Step 3: Items */}
                {invStep === 3 && (
                   <div className="space-y-4 animate-slide-up">
                      <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                         {invItems.map((item, idx) => (
                           <div key={item.id} className="flex items-start gap-2 bg-white/5 p-2 rounded-lg">
                              <div className="flex-1">
                                 <input type="text" value={item.desc} onChange={(e)=>updateInvItem(item.id, 'desc', e.target.value)} placeholder="Description" className="w-full bg-transparent border-b border-white/10 p-1 text-sm text-white focus:outline-none mb-1"/>
                                 <div className="flex gap-2">
                                   <input type="number" value={item.qty} onChange={(e)=>updateInvItem(item.id, 'qty', parseInt(e.target.value)||0)} placeholder="Qty" className="w-16 bg-transparent border-b border-white/10 p-1 text-xs text-gray-300"/>
                                   <input type="number" value={item.price} onChange={(e)=>updateInvItem(item.id, 'price', parseFloat(e.target.value)||0)} placeholder="Price" className="w-20 bg-transparent border-b border-white/10 p-1 text-xs text-gray-300"/>
                                 </div>
                              </div>
                              <button onClick={()=>removeInvItem(item.id)} className="p-2 text-red-400 hover:bg-white/5 rounded"><Trash2 size={14}/></button>
                           </div>
                         ))}
                         <button onClick={addInvItem} className="w-full py-2 border border-dashed border-white/20 rounded-lg text-sm text-gray-400 hover:text-white hover:border-white/40 flex items-center justify-center gap-2">
                            <Plus size={14} /> Add Item
                         </button>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/10">
                         <span className="text-gray-400">Total</span>
                         <span className="text-xl font-bold text-white">{invBrand.currency} {invTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button onClick={()=>setInvStep(2)} className="flex-1 py-3 bg-white/10 rounded-xl font-bold">Back</button>
                        <button onClick={()=>setInvStep(4)} className="flex-[2] py-3 bg-green-600 rounded-xl font-bold">Preview PDF</button>
                     </div>
                   </div>
                )}

                {/* Step 4: Preview & Download */}
                {invStep === 4 && (
                   <div className="animate-slide-up flex flex-col items-center">
                      <div className="w-full overflow-x-auto pb-4 mb-4 flex justify-center bg-gray-900/50 p-4 rounded-xl border border-white/5">
                        {/* INVOICE PREVIEW DOM */}
                        <div ref={previewRef} className="print-container w-[595px] h-[842px] bg-white text-black p-10 shadow-2xl origin-top transform scale-[0.5] md:scale-[0.6] shrink-0" style={{marginBottom: '-40%'}}>
                           <div className="flex justify-between items-start mb-12">
                              <div>
                                 <h1 className="text-4xl font-bold mb-2 tracking-tight" style={{color: invBrand.color}}>{invBrand.logoText}</h1>
                                 <p className="text-xs text-gray-500 max-w-[200px] whitespace-pre-wrap">{invDetails.from || "Company Address"}</p>
                              </div>
                              <div className="text-right">
                                 <h2 className="text-4xl font-light text-gray-300 mb-4">INVOICE</h2>
                                 <p className="text-sm font-bold text-gray-700">#{invDetails.id}</p>
                                 <p className="text-sm text-gray-500">{invDetails.date}</p>
                              </div>
                           </div>
                           
                           <div className="mb-12">
                              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Bill To:</h3>
                              <p className="text-lg font-medium text-gray-800 whitespace-pre-wrap">{invDetails.to || "Client Name"}</p>
                           </div>

                           <table className="w-full mb-12">
                              <thead>
                                 <tr className="border-b-2 border-gray-100">
                                    <th className="text-left py-3 text-xs font-bold text-gray-400 uppercase">Description</th>
                                    <th className="text-right py-3 text-xs font-bold text-gray-400 uppercase">Qty</th>
                                    <th className="text-right py-3 text-xs font-bold text-gray-400 uppercase">Price</th>
                                    <th className="text-right py-3 text-xs font-bold text-gray-400 uppercase">Amount</th>
                                 </tr>
                              </thead>
                              <tbody>
                                 {invItems.map(i => (
                                    <tr key={i.id} className="border-b border-gray-50">
                                       <td className="py-4 text-sm font-medium text-gray-700">{i.desc}</td>
                                       <td className="py-4 text-sm text-gray-500 text-right">{i.qty}</td>
                                       <td className="py-4 text-sm text-gray-500 text-right">{invBrand.currency}{i.price.toFixed(2)}</td>
                                       <td className="py-4 text-sm font-bold text-gray-800 text-right">{invBrand.currency}{(i.qty*i.price).toFixed(2)}</td>
                                    </tr>
                                 ))}
                              </tbody>
                           </table>

                           <div className="flex justify-end">
                              <div className="text-right">
                                 <p className="text-sm text-gray-500 mb-2">Total Amount</p>
                                 <p className="text-4xl font-bold" style={{color: invBrand.color}}>{invBrand.currency}{invTotal.toFixed(2)}</p>
                              </div>
                           </div>
                           
                           <div className="absolute bottom-10 left-10 right-10 border-t border-gray-100 pt-6 text-center">
                              <p className="text-xs text-gray-400">Thank you for your business.</p>
                           </div>
                        </div>
                        {/* END PREVIEW */}
                      </div>
                      <div className="flex gap-2 w-full">
                        <button onClick={()=>setInvStep(3)} className="flex-1 py-3 bg-white/10 rounded-xl font-bold">Edit</button>
                        <button onClick={()=>downloadRefAsPDF(`invoice_${invDetails.id}`)} className="flex-[2] py-3 bg-primary rounded-xl font-bold flex items-center justify-center gap-2">
                           {isLoading ? <Loader2 className="animate-spin"/> : <><Download size={18}/> Download PDF</>}
                        </button>
                      </div>
                   </div>
                )}
              </div>
            )}

                {/* --- CV BUILDER (ID 5) --- */}
                {tool.id === 5 && (
                  <div className="flex flex-col h-[70vh]">
                     {/* Tabs */}
                     <div className="flex gap-2 mb-4 bg-black/20 p-1 rounded-xl">
                        {[
                          {id:'about', icon:User, l:'About'},
                          {id:'exp', icon:Briefcase, l:'Exp'},
                          {id:'skills', icon:GraduationCap, l:'Skills'},
                          {id:'preview', icon:FileText, l:'Export'}
                        ].map(tab => (
                           <button 
                            key={tab.id}
                            onClick={() => setCvTab(tab.id as any)}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg flex flex-col items-center gap-1 transition-all ${cvTab===tab.id ? 'bg-white/10 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}
                           >
                              <tab.icon size={14}/> {tab.l}
                           </button>
                        ))}
                     </div>

                     {/* Tab Content */}
                     <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 pb-4">
                        {cvTab === 'about' && (
                           <div className="space-y-4 animate-slide-up">
                              <input type="text" placeholder="Full Name" value={cvData.name} onChange={e=>setCvData({...cvData, name:e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white"/>
                              <input type="text" placeholder="Professional Title (e.g. UX Designer)" value={cvData.title} onChange={e=>setCvData({...cvData, title:e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white"/>
                              <div className="flex gap-3">
                                 <input type="text" placeholder="Email" value={cvData.email} onChange={e=>setCvData({...cvData, email:e.target.value})} className="flex-1 bg-black/20 border border-white/10 rounded-xl p-3 text-white"/>
                                 <input type="text" placeholder="Phone / Location" value={cvData.phone} onChange={e=>setCvData({...cvData, phone:e.target.value})} className="flex-1 bg-black/20 border border-white/10 rounded-xl p-3 text-white"/>
                              </div>
                              <textarea placeholder="Professional Summary (2-3 sentences)" value={cvData.summary} onChange={e=>setCvData({...cvData, summary:e.target.value})} className="w-full h-32 bg-black/20 border border-white/10 rounded-xl p-3 text-white resize-none"/>
                           </div>
                        )}
                        {cvTab === 'exp' && (
                           <div className="space-y-4 animate-slide-up">
                              <p className="text-xs text-gray-400">Enter your experience (Use bullets • for new lines)</p>
                              <textarea placeholder="• Senior Dev at Tech Co (2020-Present)&#10;  - Led team of 5&#10;  - Increased performance by 20%&#10;&#10;• Junior Dev at StartUp (2018-2020)&#10;  - Built main landing page" 
                                value={cvData.experience} onChange={e=>setCvData({...cvData, experience:e.target.value})} 
                                className="w-full h-64 bg-black/20 border border-white/10 rounded-xl p-3 text-white resize-none font-mono text-sm"
                              />
                           </div>
                        )}
                        {cvTab === 'skills' && (
                           <div className="space-y-4 animate-slide-up">
                               <p className="text-xs text-gray-400">List skills separated by commas</p>
                               <textarea placeholder="JavaScript, React, Node.js, Leadership, Agile, UI/UX..." 
                                value={cvData.skills} onChange={e=>setCvData({...cvData, skills:e.target.value})} 
                                className="w-full h-32 bg-black/20 border border-white/10 rounded-xl p-3 text-white resize-none"
                               />
                               <div className="mt-4">
                                  <p className="text-xs text-gray-400 mb-2">Choose Style</p>
                                  <div className="flex gap-3">
                                     <button onClick={()=>setCvStyle('modern')} className={`flex-1 p-3 rounded-xl border ${cvStyle==='modern'?'border-primary bg-primary/20':'border-white/10 bg-black/20'}`}>Modern</button>
                                     <button onClick={()=>setCvStyle('classic')} className={`flex-1 p-3 rounded-xl border ${cvStyle==='classic'?'border-primary bg-primary/20':'border-white/10 bg-black/20'}`}>Classic</button>
                                  </div>
                               </div>
                           </div>
                        )}
                        {cvTab === 'preview' && (
                           <div className="flex flex-col items-center animate-slide-up">
                              <div className="w-full overflow-x-auto bg-gray-900/50 p-4 rounded-xl border border-white/5 flex justify-center mb-4">
                                 {/* CV PREVIEW DOM */}
                                 <div ref={previewRef} className="print-container w-[595px] h-[842px] bg-white text-black shadow-2xl origin-top transform scale-[0.5] shrink-0" style={{marginBottom: '-40%'}}>
                                    {cvStyle === 'modern' ? (
                                       // MODERN TEMPLATE
                                       <div className="flex h-full">
                                          <div className="w-1/3 bg-slate-800 text-white p-6 pt-12">
                                             <div className="w-24 h-24 bg-slate-600 rounded-full mx-auto mb-6 flex items-center justify-center text-2xl font-bold">{cvData.name.charAt(0)}</div>
                                             <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-600 pb-1">Contact</h3>
                                             <p className="text-xs mb-2 opacity-80">{cvData.email}</p>
                                             <p className="text-xs mb-6 opacity-80">{cvData.phone}</p>
                                             <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-600 pb-1">Skills</h3>
                                             <div className="flex flex-wrap gap-2">
                                                {cvData.skills.split(',').map(s=>s.trim() && <span key={s} className="text-[10px] bg-slate-700 px-2 py-1 rounded">{s}</span>)}
                                             </div>
                                          </div>
                                          <div className="w-2/3 p-8 pt-12">
                                             <h1 className="text-4xl font-bold text-slate-800 uppercase leading-none mb-1">{cvData.name || "YOUR NAME"}</h1>
                                             <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-6">{cvData.title || "PROFESSIONAL TITLE"}</h2>
                                             <p className="text-sm text-gray-600 mb-8 leading-relaxed italic border-l-4 border-indigo-100 pl-4">{cvData.summary || "Professional summary goes here."}</p>
                                             <h3 className="text-lg font-bold text-slate-800 uppercase tracking-widest mb-4 border-b-2 border-indigo-500 inline-block">Experience</h3>
                                             <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                                {cvData.experience || "• Add your experience in the Experience tab."}
                                             </div>
                                          </div>
                                       </div>
                                    ) : (
                                       // CLASSIC TEMPLATE
                                       <div className="p-10 font-serif text-black">
                                          <div className="text-center border-b-2 border-black pb-4 mb-6">
                                             <h1 className="text-3xl font-bold uppercase tracking-widest mb-2">{cvData.name || "YOUR NAME"}</h1>
                                             <p className="text-sm italic">{cvData.title} | {cvData.email} | {cvData.phone}</p>
                                          </div>
                                          <div className="mb-6">
                                             <h3 className="text-sm font-bold uppercase border-b border-gray-300 mb-2">Summary</h3>
                                             <p className="text-sm leading-relaxed text-justify">{cvData.summary}</p>
                                          </div>
                                          <div className="mb-6">
                                             <h3 className="text-sm font-bold uppercase border-b border-gray-300 mb-2">Experience</h3>
                                             <div className="text-sm whitespace-pre-wrap leading-relaxed">{cvData.experience}</div>
                                          </div>
                                          <div className="mb-6">
                                             <h3 className="text-sm font-bold uppercase border-b border-gray-300 mb-2">Skills</h3>
                                             <p className="text-sm">{cvData.skills}</p>
                                          </div>
                                       </div>
                                    )}
                                 </div>
                                 {/* END CV PREVIEW */}
                              </div>
                              <button onClick={()=>downloadRefAsPDF(`resume_${cvData.name.replace(/\s/g,'_')}`)} className="w-full py-3 bg-yellow-600 hover:bg-yellow-500 rounded-xl font-bold flex items-center justify-center gap-2 text-white shadow-lg">
                                 {isLoading ? <Loader2 className="animate-spin"/> : <><Download size={18}/> Download PDF Resume</>}
                              </button>
                           </div>
                        )}
                     </div>
                  </div>
                )}

                {/* --- QR ART (Tool #7) --- */}
                {tool.id === 7 && (
                   <div className="space-y-6">
                      <div className="space-y-2">
                         <label className="text-xs text-gray-400 font-bold uppercase">1. Content</label>
                         <input type="text" placeholder="https://mysite.com or Text" value={qrText} onChange={e=>setQrText(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white"/>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="text-xs text-gray-400 font-bold uppercase mb-2 block">2. Dot Color</label>
                            <div className="flex items-center gap-2 bg-black/20 p-2 rounded-xl border border-white/10">
                               <input type="color" value={qrColor} onChange={e=>setQrColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent"/>
                               <span className="text-xs text-gray-300 font-mono">{qrColor}</span>
                            </div>
                         </div>
                         <div>
                            <label className="text-xs text-gray-400 font-bold uppercase mb-2 block">3. Background</label>
                            <div className="flex items-center gap-2 bg-black/20 p-2 rounded-xl border border-white/10">
                               <input type="color" value={qrBgColor} onChange={e=>setQrBgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent"/>
                               <span className="text-xs text-gray-300 font-mono">{qrBgColor}</span>
                            </div>
                         </div>
                      </div>
                      <button onClick={generateQr} disabled={!qrText} className="w-full py-3 bg-pink-600 hover:bg-pink-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 flex justify-center gap-2">
                         {isLoading ? <Loader2 className="animate-spin"/> : lang==='pt'?'Gerar Arte':'Generate Art'}
                      </button>
                      {qrUrl && (
                         <div className="bg-white p-6 rounded-2xl flex flex-col items-center animate-slide-up shadow-2xl relative group">
                            <img src={qrUrl} alt="QR Code" className="w-48 h-48 mix-blend-multiply" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-2xl">
                               <a href={qrUrl} download="qrcode.png" target="_blank" rel="noreferrer" className="bg-white text-black px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 hover:scale-105 transition-transform">
                                  <Download size={14}/> Save Image
                               </a>
                            </div>
                         </div>
                      )}
                   </div>
                )}

                {/* --- EXISTING TOOLS (Crypto, Expense, AI) --- */}
                {tool.id === 24 && (
                   <div id="crypto-container" className="space-y-4 p-2 bg-[#131b2e] rounded-xl">
                      <div className="grid grid-cols-3 gap-3">
                         {['bitcoin', 'ethereum', 'tether'].map((coin) => (
                           <div key={coin} className="bg-white/5 rounded-xl p-3 text-center border border-white/10 shadow-lg">
                              <div className="text-[10px] text-gray-400 uppercase mb-2 font-bold tracking-wider">{coin}</div>
                              <div className="text-sm font-bold text-white flex justify-center items-center gap-1">
                                 {cryptoData ? `$${cryptoData[coin]?.usd.toLocaleString()}` : <Loader2 className="animate-spin w-4 h-4"/>}
                              </div>
                           </div>
                         ))}
                      </div>
                      <button onClick={fetchCrypto} className="w-full py-3 bg-white/5 rounded-xl text-sm font-bold text-gray-300 hover:text-white flex justify-center gap-2"><RefreshCw size={14}/> Refresh</button>
                   </div>
                )}

                {tool.id === 25 && (
                   <div className="space-y-4">
                      <div className="relative w-48 h-48 mx-auto">
                         <canvas ref={canvasRef}></canvas>
                         {!expenses.length && <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-600">No Data</div>}
                      </div>
                      <div className="flex flex-col gap-2">
                         <div className="flex gap-2">
                             <input type="text" placeholder="Item" value={newExpense.desc} onChange={e=>setNewExpense({...newExpense, desc:e.target.value})} className="flex-[2] bg-black/20 border border-white/10 rounded-lg p-2 text-sm text-white"/>
                             <input type="number" placeholder="$" value={newExpense.amount} onChange={e=>setNewExpense({...newExpense, amount:e.target.value})} className="flex-1 bg-black/20 border border-white/10 rounded-lg p-2 text-sm text-white"/>
                         </div>
                         <div className="flex gap-2">
                             <select value={newExpense.category} onChange={e=>setNewExpense({...newExpense, category:e.target.value})} className="flex-[3] bg-black/20 border border-white/10 rounded-lg p-2 text-sm text-white">
                                {EXPENSE_CATEGORIES.map(c => <option key={c} value={c} className="bg-slate-800">{c}</option>)}
                             </select>
                             <button onClick={addExpense} className="flex-1 p-2 bg-primary rounded-lg text-white flex items-center justify-center"><Plus size={18}/></button>
                         </div>
                      </div>
                      <div className="max-h-40 overflow-y-auto space-y-2 custom-scrollbar pr-1">
                         {expenses.map(e=>(
                             <div key={e.id} className="flex justify-between items-center p-2 bg-white/5 rounded-lg text-sm border border-white/5">
                                <div className="flex flex-col">
                                    <span className="text-gray-200 font-medium">{e.desc}</span>
                                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">{e.category}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-white">${e.amount.toFixed(2)}</span>
                                    <button onClick={()=>removeExpense(e.id)} className="text-red-400 hover:text-red-300"><Trash2 size={14}/></button>
                                </div>
                             </div>
                         ))}
                      </div>
                   </div>
                )}

                {/* --- HEAVY TOOLS (Image/Video) --- */}
                {isHeavyTool && (
                   <div className="flex flex-col items-center justify-center space-y-6 py-10">
                      <div className="w-full max-w-sm h-48 border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                          <Upload size={40} className="text-gray-400 group-hover:text-white mb-4" />
                          <p className="text-sm text-gray-400 font-bold">Drag & Drop or Click to Upload</p>
                          <p className="text-xs text-gray-500 mt-2">JPG, PNG, MP4</p>
                      </div>
                      
                      <button 
                          onClick={handleHeavyToolAction}
                          disabled={isLoading}
                          className="w-full max-w-sm py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 hover:scale-105 transition-transform"
                      >
                          {isLoading ? <Loader2 className="animate-spin" /> : <><Wand2 size={18}/> Process Media</>}
                      </button>
                      <div className="flex items-center gap-2 text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                          GPU Cluster Active
                      </div>
                   </div>
                )}

                {/* --- AI TEXT TOOLS --- */}
                {isAiTextTool && (
                   <div className="space-y-4">
                      <textarea 
                        value={inputText} onChange={e=>setInputText(e.target.value)} 
                        placeholder={t.inputPlaceholder} 
                        className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 text-white min-h-[120px] focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                      />
                      
                      <button 
                        onClick={handleAiGeneration}
                        disabled={isLoading || isTyping}
                        className="w-full py-4 bg-white text-black font-black rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                      >
                        {isLoading ? <Loader2 className="animate-spin"/> : <><Sparkles size={18} /> {t.modalStart}</>}
                      </button>

                      {generatedText && (
                         <div className="mt-6 p-4 bg-gradient-to-br from-white/5 to-white/10 rounded-xl border border-white/10 animate-slide-up relative group">
                             <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">{generatedText}</p>
                             {!isTyping && (
                                 <button onClick={() => navigator.clipboard.writeText(generatedText)} className="absolute top-2 right-2 p-2 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors">
                                     <Copy size={16} />
                                 </button>
                             )}
                         </div>
                      )}
                   </div>
                )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolModal;
