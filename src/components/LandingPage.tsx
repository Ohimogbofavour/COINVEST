import React, { useState, useMemo } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { 
  ShieldCheck, Lock, Mail, User, TrendingUp, Cpu, Globe, Users, ArrowRight,
  Menu, X, Landmark, Coins, ChevronDown, CheckCircle, Calculator, Percent, Sparkles, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LandingPageProps {
  onEnterConsole: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterConsole }) => {
  const { 
    user, 
    marketAssets, 
    investmentPlans, 
    copyTraders, 
    login, 
    register,
    recoverPassword,
    getSandboxUsers,
    firebaseError,
    isFirebasePlaceholder
  } = useDashboard();

  // Navigation states
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  // Auth drawer states
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const isLogin = authMode === 'login';
  const setIsLogin = (val: boolean) => setAuthMode(val ? 'login' : 'register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setForgotLoading(true);
    try {
      const res = await recoverPassword(email);
      setForgotMessage(res.message);
      setForgotSent(true);
    } catch (err: any) {
      setError(err.message || 'Recovery override key could not be dispatched.');
    } finally {
      setForgotLoading(false);
    }
  };

  // Staking simulator states
  const [calcAmount, setCalcAmount] = useState<number>(5000);
  const [customTermDays, setCustomTermDays] = useState<number>(30);

  // FAQ open state
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Live selected active ticker on Landing page
  const [activeTabTicker, setActiveTabTicker] = useState('crypto');

  // Handle section scroll
  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  // Determine matching plan advisor dynamically
  const recommendedPlan = useMemo(() => {
    return investmentPlans.find(p => calcAmount >= p.min && calcAmount <= p.max) || 
           investmentPlans[investmentPlans.length - 1];
  }, [investmentPlans, calcAmount]);

  // Compute simulated yields
  const simulatedYield = useMemo(() => {
    if (!recommendedPlan) return { daily: 0, total: 0, profit: 0 };
    const dailyRoi = recommendedPlan.dailyRoi;
    const days = recommendedPlan.durationDays;
    const daily = calcAmount * (dailyRoi / 100);
    const profit = daily * days;
    const total = calcAmount + profit;
    return {
      daily,
      profit,
      total
    };
  }, [recommendedPlan, calcAmount]);

  // Handle Authentication submit
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please provide a valid security email.');
      return;
    }

    if (authMode === 'register' && !name) {
      setError('Please provide your legal identity name.');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    if (authMode === 'register' && !agreed) {
      setError('You must endorse the Segregated Fund Regulations clearance.');
      return;
    }

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, name);
      }
      setAuthOpen(false);
      onEnterConsole();
    } catch (err: any) {
      const msg = err.message || String(err);
      if (msg.includes('operation-not-allowed') || err.code === 'auth/operation-not-allowed') {
        setError('Email/password authentication is currently disabled in your Firebase console. To resolve this, click Firebase Diagnostics below and enable the Email/Password Auth Provider.');
        setShowDiagnostics(true);
      } else if (msg.includes('configuration-not-found') || err.code === 'auth/configuration-not-found') {
        setError('Your Firebase configuration is invalid or still has template values. Bypassing safely to local Sandbox mode.');
        setShowDiagnostics(true);
      } else {
        setError(msg);
      }
    }
  };

  const handleDemoAccess = async () => {
    try {
      setError('');
      await login('demo.trader@coinvest.cc', 'demotrader123');
      setAuthOpen(false);
      onEnterConsole();
    } catch (err: any) {
      try {
        await register('demo.trader@coinvest.cc', 'demotrader123', 'Demo Pro Trader');
        setAuthOpen(false);
        onEnterConsole();
      } catch (regErr: any) {
        setError(regErr.message || 'Could not instantiate sandbox environment.');
      }
    }
  };

  const toggleFaq = (idx: number) => {
    setOpenFaq(prev => prev === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-natural-bg text-natural-text font-sans selection:bg-gold-light/40 overflow-x-hidden relative">
      {/* Background ambient gold-cream overlay */}
      <div className="absolute top-[-20%] left-[-20%] w-[70%] h-[70%] rounded-full bg-gold-cream/40 blur-[150px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-20%] w-[60%] h-[60%] rounded-full bg-gold-cream/30 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-gold-light/20 blur-[120px] pointer-events-none" />

      {/* FIXED PREMIUM HEADER */}
      <header className="sticky top-0 bg-white/70 backdrop-blur-md border-b border-natural-border h-20 px-4 md:px-8 flex items-center justify-between z-40 transition-all select-none">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-gold-accent via-gold-primary to-gold-dark flex items-center justify-center shadow-lg shadow-gold-light/20 border border-gold-light">
            <TrendingUp className="h-5 w-5 text-white stroke-[2.5]" />
          </div>
          <div>
            <span className="font-serif font-serif-black text-xl font-black tracking-tight text-natural-dark block">coinvest</span>
            <span className="text-[10px] text-gold-dark font-black tracking-widest block uppercase">GOLD-STANDARD DESK</span>
          </div>
        </div>

        {/* Desktop Nav Items */}
        <nav className="hidden lg:flex items-center gap-8 text-[12.5px] font-bold text-natural-text">
          <button onClick={() => scrollToId('hero')} className="hover:text-gold-primary transition-colors cursor-pointer uppercase tracking-wider">Home</button>
          <button onClick={() => scrollToId('rates')} className="hover:text-gold-primary transition-colors cursor-pointer uppercase tracking-wider">Staking Rates</button>
          <button onClick={() => scrollToId('markets')} className="hover:text-gold-primary transition-colors cursor-pointer uppercase tracking-wider">Live Assets</button>
          <button onClick={() => scrollToId('copy')} className="hover:text-gold-primary transition-colors cursor-pointer uppercase tracking-wider">Expert Copiers</button>
          <button onClick={() => scrollToId('faq')} className="hover:text-gold-primary transition-colors cursor-pointer uppercase tracking-wider">FAQ</button>
        </nav>

        {/* Action CTAs */}
        <div className="hidden sm:flex items-center gap-3">
          {user ? (
            <button 
              onClick={onEnterConsole}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold-dark to-gold-primary text-white font-serif font-bold text-xs shadow-md shadow-gold-light/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer uppercase tracking-wide border border-gold-accent"
            >
              <span>Investor Dashboard</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <>
              <button 
                onClick={() => { setIsLogin(true); setError(''); setAuthOpen(true); }}
                className="px-5 py-2.5 rounded-xl border border-natural-border text-natural-dark hover:bg-natural-bg text-xs font-bold transition-all cursor-pointer uppercase tracking-wider"
              >
                Sign In
              </button>
              <button 
                onClick={() => { setIsLogin(false); setError(''); setAuthOpen(true); }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold-primary to-gold-dark text-white font-serif font-bold text-xs shadow-md shadow-gold-light/40 hover:scale-[1.02] transition-all cursor-pointer uppercase tracking-wide border border-gold-accent"
              >
                Join Gold Standard
              </button>
            </>
          )}
        </div>

        {/* Hamburger */}
        <button 
          onClick={() => setMobileMenuOpen(prev => !prev)}
          className="lg:hidden p-2 text-natural-dark hover:bg-[#F4F5F0] rounded-xl border border-natural-border transition-colors cursor-pointer"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* MOBILE MENU DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 inset-x-0 bg-white border-b border-natural-border shadow-xl z-30 p-6 flex flex-col gap-4 select-none lg:hidden"
          >
            <button onClick={() => scrollToId('rates')} className="text-left font-bold text-sm text-natural-dark py-2 border-b border-[#F4F5F0] uppercase tracking-wider">Staking Rates</button>
            <button onClick={() => scrollToId('markets')} className="text-left font-bold text-sm text-natural-dark py-2 border-b border-[#F4F5F0] uppercase tracking-wider">Live Assets</button>
            <button onClick={() => scrollToId('copy')} className="text-left font-bold text-sm text-natural-dark py-2 border-b border-[#F4F5F0] uppercase tracking-wider">Expert Copiers</button>
            <button onClick={() => scrollToId('security')} className="text-left font-bold text-sm text-natural-dark py-2 border-b border-[#F4F5F0] uppercase tracking-wider">Audit Security</button>
            <button onClick={() => scrollToId('faq')} className="text-left font-bold text-sm text-natural-dark py-2 border-b border-[#F4F5F0] uppercase tracking-wider">FAQ</button>

            <div className="flex flex-col gap-2 pt-2">
              {user ? (
                <button 
                  onClick={() => { setMobileMenuOpen(false); onEnterConsole(); }}
                  className="w-full text-center py-3 rounded-xl bg-gradient-to-r from-gold-primary to-gold-dark text-white font-bold text-xs uppercase cursor-pointer"
                >
                  Go to Investor Dashboard
                </button>
              ) : (
                <>
                  <button 
                    onClick={() => { setMobileMenuOpen(false); setIsLogin(true); setError(''); setAuthOpen(true); }}
                    className="w-full text-center py-3 rounded-xl border border-[#D1D3C4] hover:bg-natural-bg text-natural-dark text-xs font-bold uppercase cursor-pointer"
                  >
                    Partner Login
                  </button>
                  <button 
                    onClick={() => { setMobileMenuOpen(false); setIsLogin(false); setError(''); setAuthOpen(true); }}
                    className="w-full text-center py-3 rounded-xl bg-gradient-to-r from-gold-primary to-gold-dark text-white font-bold text-xs uppercase cursor-pointer"
                  >
                    Open Gold Account
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CORE WEBSITE CONTENT */}
      <main>
        {/* SECTION 1: ELEGANT HERO */}
        <section id="hero" className="max-w-7xl mx-auto px-6 md:px-8 pt-12 md:pt-20 pb-16 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center border-b border-natural-border">
          <div className="lg:col-span-7 text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-cream border border-gold-light text-gold-dark text-xs font-extrabold tracking-widest uppercase shadow-xs">
              <Sparkles className="h-3 w-3 text-gold-primary animate-pulse" />
              <span>Institutional Sovereign Trading Desk</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-black tracking-tight text-natural-dark leading-[1.1]">
              The Gold Standard of <span className="bg-gradient-to-r from-gold-dark via-gold-primary to-gold-accent bg-clip-text text-transparent">Liquid Wealth</span> & Copy yields
            </h1>

            <p className="text-base text-natural-text/90 font-medium leading-relaxed max-w-2xl">
              De-risk your asset exposure with institutional CFD matching technology, premium coinvest ROI contracts, and automated mirror trades certified under UK licensing desk clearances.
            </p>

            {/* Quick Benefits icons */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
              <div className="flex gap-2.5 items-center">
                <div className="h-9 w-9 bg-white border border-natural-border flex items-center justify-center rounded-xl text-gold-primary shadow-xs">
                  <Coins className="h-4.5 w-4.5 stroke-[2]" />
                </div>
                <div>
                  <h4 className="text-xs font-serif font-bold text-natural-dark leading-tight">Up to 5.0% Daily</h4>
                  <p className="text-[10px] text-natural-secondary font-semibold">Guaranteed Sovereign Tier</p>
                </div>
              </div>

              <div className="flex gap-2.5 items-center">
                <div className="h-9 w-9 bg-white border border-natural-border flex items-center justify-center rounded-xl text-gold-primary shadow-xs">
                  <Cpu className="h-4.5 w-4.5 stroke-[2]" />
                </div>
                <div>
                  <h4 className="text-xs font-serif font-bold text-natural-dark leading-tight">&lt; 1ms Latency</h4>
                  <p className="text-[10px] text-natural-secondary font-semibold">Instant Order Execution</p>
                </div>
              </div>

              <div className="flex gap-2.5 items-center col-span-2 md:col-span-1">
                <div className="h-9 w-9 bg-white border border-natural-border flex items-center justify-center rounded-xl text-gold-primary shadow-xs">
                  <ShieldCheck className="h-4.5 w-4.5 stroke-[2]" />
                </div>
                <div>
                  <h4 className="text-xs font-serif font-bold text-natural-dark leading-tight">Broker #103945</h4>
                  <p className="text-[10px] text-natural-secondary font-semibold">UK Segregated Custody</p>
                </div>
              </div>
            </div>

            {/* Call to actions in hero */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button 
                onClick={() => { setIsLogin(false); setAuthOpen(true); }}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-gold-primary via-gold-dark to-[#8B7310] text-white font-serif font-bold text-sm shadow-xl shadow-gold-light/40 hover:translate-y-[-1px] transition-all cursor-pointer text-center uppercase tracking-wider border border-gold-accent"
              >
                Establish Allocation Account
              </button>
              <button 
                onClick={handleDemoAccess}
                className="px-8 py-4 rounded-xl border border-natural-border bg-white hover:bg-gold-cream/40 text-natural-dark text-xs font-serif font-bold transition-all text-center uppercase tracking-wider flex items-center justify-center gap-2 group cursor-pointer shadow-xs"
              >
                <span>Launch Interactive Demo</span>
                <Globe className="h-4 w-4 text-gold-primary group-hover:rotate-12 transition-transform" />
              </button>
            </div>
          </div>

          {/* Golden Device Frame Mockup */}
          <div className="lg:col-span-15 select-none relative max-w-md mx-auto lg:max-w-none w-full flex items-center justify-center">
            {/* Visual golden glow behind card */}
            <div className="absolute inset-0 bg-gold-accent/10 rounded-full blur-3xl scale-75 pointer-events-none" />

            <div className="relative bg-gradient-to-b from-[#1E1E12] to-[#121209] rounded-[36px] border-[5px] border-gold-light/30 shadow-2xl p-6 w-full text-white overflow-hidden max-w-sm">
              {/* Gold status strip */}
              <div className="flex justify-between items-center text-[10px] font-mono font-bold text-gold-accent mb-4 uppercase tracking-wider pb-3 border-b border-white/5">
                <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live spreads</span>
                <span>DESK IP: 0.90ms</span>
              </div>

              {/* Account Balance Widget */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gold-light opacity-60 uppercase tracking-widest block">Staked Allocation Ledger</span>
                <div className="flex justify-between items-baseline">
                  <span className="text-3xl font-mono font-black tracking-tight text-white">$42,910.45</span>
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">+12.4% ROI</span>
                </div>
              </div>

              {/* Interactive graph representation (Beautiful mockup curves) */}
              <div className="h-28 my-6 flex items-end gap-1.5">
                {[45, 60, 52, 70, 85, 95, 80, 110, 125, 115, 140, 160].map((h, i) => (
                  <div key={i} className="flex-1 bg-white/5 rounded-t-md hover:bg-gold-primary/30 transition-all cursor-pointer relative group h-full flex flex-col justify-end">
                    <div 
                      style={{ height: `${(h / 160) * 100}%` }}
                      className={`w-full rounded-t-md transition-all ${i === 11 ? 'bg-gradient-to-t from-gold-dark to-gold-accent' : 'bg-gold-light/20 group-hover:bg-gold-accent/40'}`} 
                    />
                  </div>
                ))}
              </div>

              {/* Trade feed indicators */}
              <div className="space-y-2 mt-4">
                <div className="bg-white/5 border border-white/5 rounded-xl p-2.5 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-[10.5px] font-bold uppercase tracking-wider">GBP/USD BUY Order</span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 font-bold">+$182.40</span>
                </div>

                <div className="bg-white/5 border border-white/5 rounded-xl p-2.5 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-[10.5px] font-bold uppercase tracking-wider">Gold Spot CFD Stake</span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 font-bold">+$950.00</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: INTERACTIVE COMPOUND YIELD SIMULATOR (STAKING) */}
        <section id="rates" className="bg-gradient-to-b from-white to-gold-cream/40 py-20 border-b border-natural-border relative">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
              <span className="text-xs font-extrabold tracking-widest text-gold-dark uppercase bg-gold-light/40 border border-gold-light px-3.5 py-1.5 rounded-full">
                Yield Generator Suite
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-natural-dark">
                Simulate Your Passive Return Velocity
              </h2>
              <p className="text-sm text-natural-secondary font-medium leading-relaxed">
                Alter the capital staking slider to identify recommended packages and projected compound yields instantly authorized by our London clearing partner pools.
              </p>
            </div>

            {/* Slider Calculator Block */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch font-semibold">
              <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-[32px] border border-natural-border shadow-md flex flex-col justify-between space-y-8">
                
                {/* Text input + slider */}
                <div className="space-y-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-black uppercase tracking-wider text-natural-muted">Set Investment Capital (USD)</span>
                    <span className="text-2xl font-mono font-black text-natural-dark">$ {calcAmount.toLocaleString()}</span>
                  </div>

                  <input 
                    type="range"
                    min="100"
                    max="100000"
                    step="100"
                    value={calcAmount}
                    onChange={(e) => setCalcAmount(Number(e.target.value))}
                    className="w-full h-2 bg-[#EAECE0] rounded-lg appearance-none cursor-pointer accent-gold-primary"
                  />
                  <div className="flex justify-between text-[10px] text-natural-muted font-bold tracking-wider uppercase font-mono">
                    <span>Min: $100</span>
                    <span>Mid: $50,000</span>
                    <span>Max: $100,000</span>
                  </div>
                </div>

                {/* Advising Card block */}
                <div className="bg-[#FAFAF7] rounded-2xl p-4 sm:p-5 border border-natural-border flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] text-gold-dark font-extrabold tracking-wider uppercase bg-gold-cream border border-gold-light px-2.5 py-0.5 rounded-full inline-block">
                      System Recommended Plan
                    </span>
                    <h3 className="font-serif font-serif-black font-black text-natural-dark text-lg">
                      {recommendedPlan?.name}
                    </h3>
                    <p className="text-[11.5px] text-natural-secondary leading-normal font-semibold max-w-sm">
                      {recommendedPlan?.description}
                    </p>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-3xl font-mono font-black text-gold-dark block">
                      {recommendedPlan?.dailyRoi}%
                    </span>
                    <span className="text-[10px] text-natural-muted font-black uppercase tracking-widest block">Daily Yield</span>
                  </div>
                </div>

                {/* Plan parameters features check */}
                <div className="space-y-2.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-natural-muted block">Contract Inclusions</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-natural-dark font-semibold">
                    {recommendedPlan?.features.map((feat, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-700 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Yield Output Result Card (Touch of Gold Dark Card) */}
              <div className="lg:col-span-5 bg-gradient-to-b from-[#1F1F13] to-[#121208] text-white p-6 sm:p-8 rounded-[32px] border border-gold-light/20 flex flex-col justify-between shadow-xl">
                <div>
                  <div className="flex items-center gap-2 pb-4 border-b border-white/5 mb-6">
                    <Calculator className="h-5 w-5 text-gold-accent" />
                    <h4 className="text-xs font-serif font-black tracking-wider uppercase text-gold-light">ALLOCATION PERFORMANCE SHEET</h4>
                  </div>

                  <div className="space-y-6">
                    <div className="flex justify-between items-baseline border-b border-white/5 pb-3">
                      <span className="text-xs text-gold-light opacity-60">Contract Term Duration:</span>
                      <span className="text-sm font-mono font-black text-white">{recommendedPlan?.durationDays} Days Duration</span>
                    </div>

                    <div className="flex justify-between items-baseline border-b border-white/5 pb-3">
                      <span className="text-xs text-gold-light opacity-60">Daily Yield Reward:</span>
                      <span className="text-lg font-mono font-black text-emerald-400">+${simulatedYield.daily.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>

                    <div className="flex justify-between items-baseline border-b border-white/5 pb-3">
                      <span className="text-xs text-gold-light opacity-60">Net Yield Profit:</span>
                      <span className="text-xl font-mono font-black text-emerald-400">+${simulatedYield.profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>

                    <div className="flex justify-between items-baseline pt-2">
                      <span className="text-xs text-gold-light font-black uppercase tracking-wider">Total Ledger Return:</span>
                      <span className="text-3xl font-mono font-black text-gold-accent">$ {simulatedYield.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-8">
                  <button 
                    onClick={() => { setIsLogin(false); setAuthOpen(true); }}
                    className="w-full bg-gradient-to-r from-gold-accent via-gold-primary to-gold-dark hover:scale-[1.01] text-white font-serif font-black py-3 px-4 rounded-xl text-xs transition-all uppercase tracking-wider cursor-pointer text-center flex items-center justify-center gap-1.5 border border-gold-accent shadow-md"
                  >
                    <span>Secure This Yield Contract</span>
                    <ArrowRight className="h-3.5 w-3.5 text-white" />
                  </button>
                  <p className="text-[10px] text-center text-gold-light/40 leading-normal">
                    *Returns derived dynamically from CFD assets, interest rate differences, and prime broker execution desks. Returns locked upon contract activation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: LIVE RE-TICKING ASSETS */}
        <section id="markets" className="py-20 border-b border-natural-border">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div className="text-left space-y-4">
                <span className="text-[10px] font-extrabold tracking-widest text-gold-dark uppercase bg-gold-cream border border-gold-light px-3 py-1 rounded-full">
                  Real-time Vector Feed
                </span>
                <h2 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-natural-dark">
                  Institutional CFD Brokerage Rates
                </h2>
                <p className="text-xs text-natural-secondary max-w-xl font-semibold mt-1">
                  Our live order book stream matching Forex currency pairs, Crypto assets, and precious Commodities with latency values verified below 1ms.
                </p>
              </div>

              {/* Category tabs */}
              <div className="flex bg-[#F4F5F0] p-1.5 rounded-xl border border-natural-border self-start font-semibold">
                {['crypto', 'forex', 'stock', 'commodity'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveTabTicker(cat)}
                    className={`px-4 py-2 text-xs rounded-lg uppercase tracking-wider transition-all font-bold cursor-pointer ${
                      activeTabTicker === cat 
                        ? 'bg-natural-primary text-white shadow-xs' 
                        : 'text-natural-muted hover:text-natural-dark'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Assets Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 font-semibold">
              {marketAssets
                .filter(asset => asset.category === activeTabTicker)
                .map((asset) => (
                  <div 
                    key={asset.symbol}
                    className="bg-white border border-[#E5E7D8] rounded-[32px] p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] text-natural-muted uppercase font-mono tracking-wider">{asset.symbol}</span>
                        <h3 className="font-serif font-black text-natural-dark text-base mt-0.5">{asset.name}</h3>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        asset.change24h >= 0 ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-rose-50 text-rose-800 border border-rose-100'
                      }`}>
                        {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
                      </span>
                    </div>

                    <div className="flex justify-between items-baseline pt-2">
                      <span className="text-xs text-natural-secondary font-bold">Indicative Price</span>
                      <span className="text-2xl font-mono font-black text-natural-dark tracking-tight">
                        ${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: asset.category === 'forex' ? 4 : 2 })}
                      </span>
                    </div>

                    {/* Faux Sparkline curve */}
                    <div className="h-10 w-full opacity-60 flex items-end gap-1 select-none pointer-events-none">
                      {asset.history24h.map((v, idx) => (
                        <div 
                          key={idx}
                          style={{ height: `${((v - Math.min(...asset.history24h)) / (Math.max(...asset.history24h) - Math.min(...asset.history24h) || 1)) * 100}%` }}
                          className={`flex-1 rounded-t-sm ${asset.change24h >= 0 ? 'bg-emerald-700/30' : 'bg-rose-700/30'}`}
                        />
                      ))}
                    </div>

                    <div className="pt-4 border-t border-[#F4F5F0] flex justify-between items-center">
                      <span className="text-[10px] text-natural-muted font-mono">Broker Liquidity Index: 99.85%</span>
                      <button 
                        onClick={() => { setIsLogin(true); setAuthOpen(true); }}
                        className="text-[11px] text-gold-dark hover:text-gold-primary font-bold flex items-center gap-1 transition-colors uppercase tracking-wider cursor-pointer border border-[#E5E7D8] hover:border-gold-accent px-2.5 py-1 rounded-lg bg-natural-bg/40 hover:bg-gold-cream"
                      >
                        Trade CFD
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </section>

        {/* SECTION 4: VETTED EXPERT MIRROR TRADERS */}
        <section id="copy" className="bg-gradient-to-b from-white to-[#FAFAF7] py-20 border-b border-natural-border">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
              <span className="text-xs font-extrabold tracking-widest text-[#403212] bg-gold-light/60 border border-gold-light px-3.5 py-1.5 rounded-full uppercase">
                MirrorCopy™ Operations
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-natural-dark">
                Trade Side-by-Side with Elite Masters
              </h2>
              <p className="text-xs text-natural-secondary font-semibold leading-relaxed">
                Connect your staking account to veteran broker experts. Observe audited trader yields and automatically execute parallel copy transactions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left font-semibold">
              {copyTraders.map((trader) => (
                <div 
                  key={trader.id}
                  className="bg-white border border-natural-border rounded-[32px] p-6 shadow-sm flex flex-col justify-between space-y-6 relative"
                >
                  <div className="flex gap-4 items-center">
                    <img 
                      src={trader.avatar} 
                      alt={trader.name} 
                      className="h-14 w-14 rounded-full border border-gold-light shadow-xs object-cover select-none"
                    />
                    <div>
                      <h4 className="text-base font-serif font-serif-black font-black text-natural-dark">{trader.name}</h4>
                      <div className="flex items-center gap-1 text-[10.5px] text-natural-secondary font-bold">
                        <span>Preferred Asset: </span>
                        <strong className="text-gold-dark">{trader.preferredAsset}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Core Metrics Bento */}
                  <div className="grid grid-cols-2 gap-3 bg-[#FAFAF7] p-4 rounded-2xl border border-natural-border text-center">
                    <div>
                      <span className="text-[10px] text-natural-muted font-bold block uppercase tracking-wider">30D Contract ROI</span>
                      <span className="text-lg font-mono font-black text-emerald-800">+{trader.roi30D}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-natural-muted font-bold block uppercase tracking-wider">Win Ratio Limit</span>
                      <span className="text-lg font-mono font-black text-[#5A5A40]">{trader.winRate}%</span>
                    </div>
                    <div className="col-span-2 pt-2 border-t border-[#EAECE0]">
                      <div className="flex justify-between text-[10px] text-natural-secondary font-bold uppercase tracking-wider px-2">
                        <span>Total Active Copiers:</span>
                        <span className="text-natural-dark font-mono font-black">{trader.copiers}</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => { setIsLogin(true); setAuthOpen(true); }}
                    className="w-full py-3 px-4 rounded-xl text-xs font-serif font-black text-white bg-natural-primary hover:bg-gold-dark border border-natural-primary hover:border-gold-accent tracking-widest uppercase text-center transition-colors cursor-pointer"
                  >
                    MIRROR STRATEGY
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 5: SAFETY CLEARANCES & UK REGULATORY CREDENTIALS */}
        <section id="security" className="bg-[#12120A] text-white py-24 border-b border-white/5 relative overflow-hidden select-none">
          <div className="absolute top-[30%] left-[-20%] w-[50%] h-[50%] rounded-full bg-gold-dark/10 blur-[100px] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-6 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-8 text-left space-y-6">
              <span className="text-xs font-extrabold tracking-widest text-gold-accent bg-gold-accent/10 border border-gold-dark/50 px-3.5 py-1.5 rounded-full uppercase">
                🛡️ Audit Cleared Custody
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black tracking-tight leading-[1.12] text-white">
                Fiduciary Security and Segregated Clearing Vaults
              </h2>
              <p className="text-sm font-medium text-gold-light/70 leading-relaxed max-w-2xl">
                coinvest operations conform to strict UK broker compliance requirements (DESK ID #103945). Complete client funds are isolated within high-tier segregated banking pools, insulated from core brokerage risks.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold pt-4">
                <div className="flex gap-3 items-start bg-white/5 border border-white/5 p-4 rounded-2xl">
                  <ShieldCheck className="h-6 w-6 text-gold-accent shrink-0" />
                  <div>
                    <h4 className="font-bold text-white text-sm">Regulatory Capital Reserves</h4>
                    <p className="text-[11px] text-gold-light/60 mt-0.5 font-semibold">Mandated capital cushions maintained in accordance with top global licensing bodies.</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start bg-white/5 border border-white/5 p-4 rounded-2xl">
                  <Landmark className="h-6 w-6 text-gold-accent shrink-0" />
                  <div>
                    <h4 className="font-bold text-white text-sm">London Audit Clearance</h4>
                    <p className="text-[11px] text-gold-light/60 mt-0.5 font-semibold">Independent audits performed quarterly monitoring asset depth and contract payout integrity.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Regulatory badge display panel */}
            <div className="lg:col-span-4 bg-white/5 rounded-[40px] border border-white/10 p-8 text-center space-y-6 max-w-xs mx-auto">
              <div className="h-16 w-16 bg-gold-dark/20 border border-gold-accent/30 rounded-full flex items-center justify-center mx-auto shadow-md">
                <Landmark className="h-7 w-7 text-gold-accent" />
              </div>
              <div>
                <h4 className="text-xl font-serif font-black tracking-wide text-white">COINVEST DIGITAL LTD</h4>
                <p className="text-[10px] text-gold-dark tracking-widest uppercase font-black font-mono mt-0.5">COMPLIANCE CERTIFICATE</p>
              </div>
              <div className="divide-y divide-white/5 text-[11px] text-gold-light/60 font-mono text-left space-y-3 pt-4">
                <div className="flex justify-between pb-2 pt-1 font-semibold">
                  <span>Register Desk:</span>
                  <span className="text-white">ENGLAND & WALES</span>
                </div>
                <div className="flex justify-between py-2 font-semibold">
                  <span>Licence Reference:</span>
                  <span className="text-white">#103945 SECURE</span>
                </div>
                <div className="flex justify-between py-2 font-semibold">
                  <span>Custody Banks:</span>
                  <span className="text-white">BARCLAYS / HSBC</span>
                </div>
                <div className="flex justify-between py-2 font-semibold">
                  <span>Insured Limits:</span>
                  <span className="text-white">$100,000 PER ACCT</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 6: ELEVATED FAQS Accordion */}
        <section id="faq" className="py-24 border-b border-natural-border bg-white">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center space-y-4 mb-16">
              <span className="text-xs font-extrabold tracking-widest text-[#403212] bg-gold-light/60 border border-gold-light px-3.5 py-1.5 rounded-full uppercase">
                Investor Resources
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-natural-dark">
                Sovereign Investor Support Desk
              </h2>
              <p className="text-xs text-natural-secondary font-semibold">
                Critical details regarding liquidity routing, yield contract legalities, and fund withdrawals.
              </p>
            </div>

            <div className="space-y-4 font-semibold">
              {[
                { 
                  q: "How does coinvest maintain daily yield contracts of up to 5%?", 
                  a: "coinvest operates as a primary desk leveraging high-volume contract difference trading (CFD), arbitrage differences between top exchanges, and cryptocurrency liquidity pools. By locking capital for set terms, we obtain priority spreads from our London wholesale trading desks, passing the yielded profit directly to the investor's ledger." 
                },
                { 
                  q: "What is the exact process of clearing identity verification (KYC)?", 
                  a: "In compliance with strict anti-money laundering (AML) protocols, identity certification is triggered upon major CFD transactions. Legal copies of credentials can be securely uploaded via the Profile Gate, resolving audit verification within 24 hours." 
                },
                { 
                  q: "Is coinvest an investment website or a registered brokerage?", 
                  a: "coinvest is an institutional investment website and CFD asset desk registered in the United Kingdom under reference ID #103945. It combines client-facing digital allocation portals with traditional prime broker liquidity setups." 
                },
                { 
                  q: "Are client trade funds secured against loss?", 
                  a: "Yes. Your principal staking deposits remain securely isolated in separate UK banking pools (such as Barclays and HSBC), guaranteeing insulation even under extreme volatility indexes. Furthermore, standard CFD positions utilize robust automated loss-cap collars." 
                },
                { 
                  q: "Can I cancel a running staking term early?", 
                  a: "Once yield contracts are initialized and locked into liquidity channels, they cannot be canceled early as assets are backing active order positions. Funds along with compound yields are paid out instantly to your liquid wallet balance at the end of the term." 
                }
              ].map((faq, idx) => (
                <div 
                  key={idx}
                  className="bg-[#FAFAF7] border border-natural-border rounded-2xl hover:border-gold-accent transition-all duration-200 overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-5 text-left flex justify-between items-center gap-4 cursor-pointer outline-none"
                  >
                    <span className="font-serif font-black text-sm text-natural-dark">{faq.q}</span>
                    <ChevronDown className={`h-4.5 w-4.5 text-natural-primary transition-transform duration-300 shrink-0 ${openFaq === idx ? 'rotate-180 text-gold-accent' : ''}`} />
                  </button>

                  <AnimatePresence initial={false}>
                    {openFaq === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <p className="p-5 pt-0 border-t border-[#F4F5F0] text-xs text-natural-secondary leading-relaxed font-semibold">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#12120A] px-6 md:px-8 py-12 text-white border-t border-white/5 select-none font-semibold">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12 text-left">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-gold-accent to-gold-dark flex items-center justify-center border border-gold-light">
                <TrendingUp className="h-4.5 w-4.5 text-white stroke-[2.5]" />
              </div>
              <span className="font-serif font-black text-lg text-white font-black tracking-tight block">coinvest</span>
            </div>
            <p className="text-[11.5px] text-gold-light/60 leading-relaxed max-w-sm font-semibold">
              The gold-standard terminal for institutional assets, copy portfolios, and robust interest yields. Authorized and regulated under registration #103945.
            </p>
          </div>

          <div>
            <h4 className="text-[10px] text-gold-accent uppercase font-black tracking-widest mb-4">Allocation Tiers</h4>
            <div className="flex flex-col gap-2 text-[11px] text-gold-light/60 font-semibold">
              <span className="hover:text-white transition-colors">Beginner Staking (Roi 1.5%)</span>
              <span className="hover:text-white transition-colors">Basic Portfolio (Roi 2.5%)</span>
              <span className="hover:text-white transition-colors">Standard Contract (Roi 3.5%)</span>
              <span className="hover:text-white transition-colors">VIP Sovereign (Roi 5.0%)</span>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] text-gold-accent uppercase font-black tracking-widest mb-4">Platform Shield</h4>
            <div className="flex flex-col gap-2 text-[11px] text-gold-light/60 font-semibold">
              <span className="hover:text-white transition-colors">FCA Clearances</span>
              <span className="hover:text-white transition-colors">Segregated Banking Rules</span>
              <span className="hover:text-white transition-colors">Risk Loss Limits</span>
              <span className="hover:text-white transition-colors">Anti-Money Laundering Regulations</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between text-[11px] text-gold-light/40 gap-4">
          <div className="text-center md:text-left leading-relaxed">
            © 2026 COINVEST DIGITAL LTD (Licenced Broker CRN #103945). Standard registered in England and Wales. 
            All trading activities carry substantial financial risks. Ensure full assessment prior to allocating active capital.
          </div>
          <div className="flex gap-4 shrink-0 font-semibold">
            <a href="#" className="hover:text-white transition-colors">Security Terms</a>
            <a href="#" className="hover:text-white transition-colors">Liquidity Disclaimers</a>
            <a href="https://wa.me/19702617338?text=Hello%20Coinvest%20Support%2C%20I%20have%20a%20question%20about%20my%20portfolio." target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Contact Support</a>
          </div>
        </div>
      </footer>

      {/* AUTHENTICATION SIDE DRAWER / MODAL OVERLAY */}
      <AnimatePresence>
        {authOpen && (
          <div className="fixed inset-0 z-50 flex overflow-hidden">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAuthOpen(false)}
              className="absolute inset-0 bg-natural-dark/60 backdrop-blur-xs"
            />

            {/* Panel */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative ml-auto w-full max-w-md bg-white border-l border-natural-border h-full shadow-2xl z-10 flex flex-col justify-between overflow-y-auto outline-none select-none p-6 sm:p-8"
            >
              <div>
                {/* Header */}
                <div className="flex justify-between items-center pb-4 border-b border-natural-border mb-6">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-gold-accent" />
                    <div>
                      <h4 className="text-sm font-serif font-black text-natural-dark uppercase tracking-wider">Investor Access Gate</h4>
                      <p className="text-[10px] text-natural-muted font-bold font-mono">Institutional Crypto & CFD Broker</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setAuthOpen(false)}
                    className="p-1 px-2.5 hover:bg-[#F4F5F0] text-natural-secondary hover:text-natural-dark rounded-lg text-xs font-bold cursor-pointer border border-[#E5E7D8]"
                  >
                    Close
                  </button>
                </div>

                {forgotMode ? (
                  // Forgot Mode
                  <div className="space-y-4">
                    <h3 className="text-lg font-serif font-black text-natural-dark">Recover Vault Access</h3>
                    <p className="text-xs text-natural-secondary leading-relaxed font-semibold">
                      Please enter your validated security email. A security authentication token override will be discharged.
                    </p>

                    {error && (
                      <div className="bg-rose-50 border border-rose-100 text-rose-800 text-[11px] py-2 px-3 rounded-lg text-center font-bold mb-3">
                        {error}
                      </div>
                    )}

                    {forgotSent ? (
                      <div className="bg-[#FAFAF7] border border-natural-border text-natural-dark rounded-xl p-5 text-xs font-semibold mt-4 space-y-3">
                        <div className="text-center">
                          <span className="text-gold-dark font-serif font-black uppercase text-[11px] block mb-1">Authorization Discharged</span>
                          <p className="text-natural-dark">Override instruction details below:</p>
                        </div>
                        <div className="bg-white border border-natural-border p-3.5 rounded-lg font-mono text-[11px] text-[#565842] leading-relaxed break-words whitespace-pre-wrap select-text">
                          {forgotMessage}
                        </div>
                        <p className="text-[10px] text-center text-natural-secondary font-bold">Inspect your mailbox spam/security filters for server relays if running on live networks.</p>
                      </div>
                    ) : (
                      <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-natural-muted uppercase tracking-wider block">Security Email Address</label>
                          <input 
                            type="email" 
                            required 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-[#FAFAF7] border border-[#D1D3C4] focus:border-gold-accent rounded-xl py-2.5 px-3.5 text-xs text-natural-dark font-bold font-bold outline-none"
                            placeholder="you@domain.com"
                          />
                        </div>
                        <button 
                          type="submit"
                          disabled={forgotLoading}
                          className="w-full bg-natural-primary hover:bg-[#4E4E37] disabled:bg-natural-muted text-white font-serif font-black py-3 px-4 rounded-xl text-xs uppercase tracking-wider cursor-pointer font-serif flex items-center justify-center gap-1 mt-6"
                        >
                          <span>{forgotLoading ? 'Discharging override...' : 'Forward Access Override Key'}</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </form>
                    )}

                    <button 
                      onClick={() => { setForgotMode(false); setForgotSent(false); }}
                      className="w-full text-center mt-4 text-[11px] text-natural-secondary hover:text-natural-dark underline font-semibold"
                    >
                      Return to authentication desk
                    </button>
                  </div>
                ) : (
                  // Login or Register Switcher
                  <div className="space-y-6 font-semibold">
                    <div className="flex bg-[#F4F5F0] p-1 rounded-xl border border-natural-border font-semibold gap-1">
                      <button
                        onClick={() => { setAuthMode('login'); setError(''); }}
                        className={`flex-1 text-center py-2 text-[10.5px] rounded-lg transition-all cursor-pointer font-bold ${
                          authMode === 'login' ? 'bg-natural-primary text-white shadow-xs' : 'text-natural-muted hover:text-natural-dark'
                        }`}
                      >
                        MEMBER SIGN IN
                      </button>
                      <button
                        onClick={() => { setAuthMode('register'); setError(''); }}
                        className={`flex-1 text-center py-2 text-[10.5px] rounded-lg transition-all cursor-pointer font-bold ${
                          authMode === 'register' ? 'bg-natural-primary text-white shadow-xs' : 'text-natural-muted hover:text-natural-dark'
                        }`}
                      >
                        OPEN ACCOUNT
                      </button>
                    </div>

                    <div>
                      <h3 className="text-xl font-serif font-serif-black font-black text-natural-dark">
                        {isLogin ? 'Establish Secure Connection' : 'Register Staking Account'}
                      </h3>
                      <p className="text-xs text-natural-secondary mt-1 font-semibold">
                        {isLogin ? 'Authorizing secure CFD portfolio and asset monitoring.' : 'Allocating new high-yield investment contracts.'}
                      </p>
                    </div>

                    {error && (
                      <div className="bg-rose-50 border border-rose-100 text-rose-800 text-[11px] py-2 px-3 rounded-lg text-center font-bold">
                        {error}
                      </div>
                    )}

                    <form onSubmit={handleAuthSubmit} className="space-y-4">
                      {authMode === 'register' && (
                        <div className="space-y-1">
                          <label className="text-[10px] text-natural-muted uppercase tracking-wider block font-bold">Full Legal Name</label>
                          <input 
                            type="text" 
                            required 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-[#FAFAF7] border border-[#D1D3C4] focus:border-gold-accent rounded-xl py-2.5 px-3.5 text-xs text-natural-dark font-bold outline-none"
                            placeholder="Sterling Marcus"
                          />
                        </div>
                      )}

                      <div className="space-y-1">
                        <label className="text-[10px] text-natural-muted uppercase tracking-wider block font-bold">Security Email Address</label>
                        <input 
                          type="email" 
                          required 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-[#FAFAF7] border border-[#D1D3C4] focus:border-gold-accent rounded-xl py-2.5 px-3.5 text-xs text-natural-dark font-bold outline-none"
                          placeholder="you@domain.com"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] text-natural-muted uppercase tracking-wider block font-bold">Account Vault Password</label>
                          {isLogin && (
                            <button 
                              type="button" 
                              onClick={() => setForgotMode(true)}
                              className="text-[10px] text-gold-dark hover:text-gold-primary uppercase tracking-wider font-extrabold"
                            >
                              Forgot Access Key?
                            </button>
                          )}
                        </div>
                        <input 
                          type="password" 
                          required 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-[#FAFAF7] border border-[#D1D3C4] focus:border-gold-accent rounded-xl py-2.5 px-3.5 text-xs text-natural-dark font-bold outline-none"
                          placeholder="••••••••"
                        />
                      </div>

                      {authMode === 'register' && (
                        <div className="flex items-start gap-2.5 pt-1.5 leading-normal">
                          <input 
                            type="checkbox" 
                            id="drawer_agree"
                            checked={agreed}
                            onChange={(e) => setAgreed(e.target.checked)}
                            className="mt-1 rounded accent-natural-primary h-3.5 w-3.5"
                          />
                          <label htmlFor="drawer_agree" className="text-[10px] text-natural-secondary font-bold leading-normal">
                            I verify my information and endorse coinvest's <span className="text-gold-dark underline font-black">Segregated Fund Regulations</span> and <span className="text-gold-dark underline font-black">CFD Leverage Disclaimers</span>.
                          </label>
                        </div>
                      )}

                      <button 
                        type="submit"
                        className="w-full hover:scale-[1.01] text-white font-serif font-black py-3 px-4 rounded-xl text-xs transition-all uppercase tracking-wider cursor-pointer mt-4 flex items-center justify-center gap-1.5 border border-gold-accent shadow-xs bg-gradient-to-r from-gold-primary to-gold-dark"
                      >
                        <span>{isLogin ? 'ESTABLISH SECURE ACCESS' : 'PROVISION HIGH-YIELD VAULT'}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </form>

                    <div className="relative my-4 select-none">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#F4F5F0]"></div></div>
                      <div className="relative flex justify-center text-[10px] text-natural-muted uppercase font-bold"><span className="bg-white px-2.5">Trial Sandbox Mode</span></div>
                    </div>

                    {/* Operations Bulletin for Visitors */}
                    <div className="bg-[#FAF5E6] border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-950 font-medium leading-relaxed my-2.5 space-y-1 select-none flex items-start gap-2">
                      <span className="text-sm leading-none shrink-0">💡</span>
                      <div>
                        <h5 className="font-extrabold text-[10px] uppercase tracking-wider text-amber-900 font-mono">Visitor Operations Notice</h5>
                        <p className="text-[10px] text-amber-850 mt-0.5">
                          Sandbox customer profile impersonation has been secured and integrated directly into the administrative workspace panel.
                        </p>
                        <p className="text-[10px] text-amber-800 mt-1 font-bold">
                          To switch between simulated accounts or edit client portfolios, use the <strong className="underline">⚙️ Admin Console</strong> in the bottom-left corner of your dashboard after logging in.
                        </p>
                      </div>
                    </div>

                    <button 
                      onClick={handleDemoAccess}
                      className="w-full bg-gold-cream border border-gold-light hover:bg-gold-light/40 text-[#403212] font-serif font-bold py-3 px-4 rounded-xl text-xs transition-all tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Cpu className="h-4 w-4 text-gold-primary" />
                      <span>LAUNCH SECURE DEMO (FREE $1,000)</span>
                    </button>

                    {/* Firebase Connection & Auth Status Diagnostic Troubleshooter */}
                    <div className="mt-5 border-t border-[#E5E7D8] pt-4 select-none">
                      <div className="flex justify-between items-center text-xs">
                        <button
                          type="button"
                          onClick={() => setShowDiagnostics(prev => !prev)}
                          className="text-[10px] text-natural-secondary hover:text-natural-dark font-extrabold flex items-center gap-1 cursor-pointer transition-colors uppercase tracking-wider"
                        >
                          <span>🛠️ Firebase Diagnostics</span>
                          <span>{showDiagnostics ? '[-]' : '[+]'}</span>
                        </button>
                        
                        {(firebaseError || isFirebasePlaceholder) ? (
                          <span className="inline-flex items-center gap-1 text-[9px] text-[#A25050] bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full font-black uppercase">
                            ● Offline (Sandbox)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9px] text-[#5A5A40] bg-[#5A5A40]/5 px-2 py-0.5 rounded-full font-black uppercase">
                            ● Live & Syncing
                          </span>
                        )}
                      </div>

                      {showDiagnostics && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-3.5 space-y-3 bg-[#F4F5F0] rounded-xl p-3.5 border border-natural-border text-[10.5px] leading-relaxed text-[#565842] font-semibold select-text"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 font-bold text-natural-dark text-xs font-serif">
                              <span className={(firebaseError || isFirebasePlaceholder) ? "text-[#A25050]" : "text-[#5A5A40]"}>●</span>
                              <span>Cloud Firestore Backend Status</span>
                            </div>
                            {isFirebasePlaceholder ? (
                              <div className="space-y-1.5">
                                <p className="text-[10px] text-amber-800 font-bold bg-[#FAF5E6] p-2 rounded border border-amber-200 font-mono leading-normal">
                                  Warning: Using Default Offline Sandbox Backend
                                </p>
                                <p className="text-[10px] leading-normal text-natural-secondary font-medium">
                                  Firebase has not been provisioned for this website yet (using remixed-project placeholder configuration). Accounts you register are temporarily stored in your local browser's <code className="bg-[#D1D3C4]/30 px-1 py-0.5 rounded">localStorage</code>.
                                </p>
                                <p className="text-[10px] leading-normal text-natural-secondary font-semibold">
                                  As the developer/owner, if you want users to register and log in permanently from any computer or browser, please complete the <strong>Firebase Database setup</strong> in your AI Studio editor!
                                </p>
                              </div>
                            ) : firebaseError ? (
                              <div className="space-y-1.5">
                                <p className="text-[10px] text-rose-800 font-bold bg-rose-50/50 p-1.5 rounded border border-rose-100/60 font-mono">
                                  Error: {firebaseError}
                                </p>
                                <p className="text-[10px] leading-relaxed text-natural-secondary font-medium">
                                  Firestore returned a connection timeout. The website has automatically engaged secure local fallback storage so you can continue testing all features offline.
                                </p>
                              </div>
                            ) : (
                              <p className="text-[10px] text-natural-secondary font-medium">
                                Your Cloud Firestore Database is connected successfully!
                              </p>
                            )}
                          </div>

                          <div className="space-y-1 border-t border-[#D1D3C4]/50 pt-2.5">
                            <div className="flex items-center gap-1.5 font-bold text-natural-dark text-xs font-serif">
                              <span className="text-[#5A5A40]">●</span>
                              <span>Email / Password Authentication Desk</span>
                            </div>
                            <p className="text-[10px] leading-relaxed text-natural-secondary font-medium">
                              To allow global signups and login on live networks, make sure "Email/Password" is enabled under sign-in methods in your Firebase Auth Cloud Console dashboard.
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer footer */}
              <div className="pt-6 border-t border-natural-border flex justify-between items-center text-[9px] text-natural-secondary font-bold font-mono uppercase">
                <span>London Shield Secured</span>
                <span className="flex items-center gap-1"><span className="h-1 text-emerald-500 animate-ping inline-block" /> SECURE DESK</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
