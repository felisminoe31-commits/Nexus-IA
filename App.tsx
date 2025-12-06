import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import ToolModal from './components/ToolModal';
import LanguageToggle from './components/LanguageToggle';
import { Language, Tool, ViewState } from './types';

// Declare Adsgram interface on window object
declare global {
  interface Window {
    Adsgram?: {
      init: (params: { blockId: string; debug?: boolean }) => { show: () => Promise<void> };
    };
  }
}

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('pt');
  const [view, setView] = useState<ViewState>('landing');
  const [activeTool, setActiveTool] = useState<Tool | null>(null);
  const [accessLevel, setAccessLevel] = useState<'none' | 'free' | 'paid'>('none');
  const [isPremium, setIsPremium] = useState(false);

  // Initialize and check persistent state
  useEffect(() => {
    // 1. Check persistent premium status
    const savedPremium = localStorage.getItem('nexus_premium');
    if (savedPremium === 'true') {
      setIsPremium(true);
      setAccessLevel('paid');
      // If they are premium, we can skip landing if desired, but user flow suggests landing first
    }

    // 2. Simulate Telegram WebApp expansion
    console.log("Nexus Super App Initialized");
  }, []);

  const handleUnlock = () => {
    // Scroll to pricing or trigger general payment modal (defaulting to monthly for now if general click)
    handlePurchase('monthly', '4 USDT');
  };

  const handleTrial = () => {
    setAccessLevel('free');
    setView('dashboard');
  };

  const handleOpenTool = (tool: Tool) => {
    setActiveTool(tool);
  };

  const handleCloseTool = () => {
    setActiveTool(null);
  };

  const handleBackToLanding = () => {
    setView('landing');
  };

  const handleLanguageToggle = (selectedLang: Language) => {
    setLang(selectedLang);
  };

  // --- Payment Logic (OxaPay Simulation) ---
  const handlePurchase = (plan: string, amount: string) => {
    // In production, this would make an API call to create an invoice
    console.log(`Initiating payment for ${plan} - ${amount}`);
    
    // Simulate user flow
    const confirmed = window.confirm(
      `[OxaPay Sandbox]\n\nInvoice Created: #${Math.floor(Math.random() * 99999)}\nAmount: ${amount}\n\nClick OK to simulate a successful crypto payment.`
    );

    if (confirmed) {
      // Payment Successful
      setIsPremium(true);
      setAccessLevel('paid');
      localStorage.setItem('nexus_premium', 'true');
      
      alert("Payment Successfully Verified! Premium Access Unlocked.");
      setView('dashboard');
    }
  };

  // --- Adsgram Logic ---
  const handleStartTool = async (): Promise<boolean> => {
    if (!activeTool) return false;

    // 1. If Premium, run immediately
    if (isPremium) {
      return true;
    }

    // 2. If Free, try to show Ad
    if (window.Adsgram) {
      // Replace '0' with real Block ID from Adsgram Dashboard
      const AdController = window.Adsgram.init({ blockId: "0", debug: true });
      
      try {
        await AdController.show();
        // Ad watched successfully
        return true;
      } catch (error) {
        // Ad failed or user skipped/error
        console.error("Adsgram error:", error);
        // Fallback: still let them use it to avoid bad UX in demo
        // In production, you might return false here if you want to force ads.
        return true;
      }
    } else {
      console.warn("Adsgram script not loaded");
      alert("Ad simulation: Watch 5s video... Done.");
      return true;
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans selection:bg-primary/30">
      
      {/* Global Language Toggle */}
      <LanguageToggle currentLang={lang} onToggle={handleLanguageToggle} />

      {/* Main Views */}
      <main className="transition-opacity duration-500 ease-in-out">
        {view === 'landing' && (
          <LandingPage 
            lang={lang} 
            onUnlock={handleUnlock} 
            onTrial={handleTrial}
            onPurchase={handlePurchase}
          />
        )}

        {view === 'dashboard' && (
          <Dashboard 
            lang={lang} 
            onOpenTool={handleOpenTool}
            accessLevel={accessLevel}
            onBack={handleBackToLanding}
          />
        )}
      </main>

      {/* Tool Modal (Global Overlay) */}
      <ToolModal 
        tool={activeTool} 
        isOpen={!!activeTool} 
        onClose={handleCloseTool}
        onStart={handleStartTool}
        lang={lang}
      />
      
    </div>
  );
};

export default App;