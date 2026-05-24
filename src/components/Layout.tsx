import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import { 
  TrendingUp, LayoutDashboard, PiggyBank, Activity, Users, Wallet, User as UserIcon, 
  LogOut, ShieldAlert, BadgeInfo, Bell, Menu, X, Globe
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onBrowseWebsite?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, onBrowseWebsite }) => {
  const { user, logout, isSandbox } = useDashboard();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  if (!user) return null;

  const sidebarLinks = [
    { id: 'overview', name: 'Overview', icon: LayoutDashboard, desc: 'Balance & Stats' },
    { id: 'investments', name: 'Invest', icon: PiggyBank, desc: 'Yield Packages' },
    { id: 'trading', name: 'Live CFD Desk', icon: Activity, desc: 'Terminal Station' },
    { id: 'copy-trading', name: 'Strategy Copy', icon: Users, desc: 'Follow Elite' },
    { id: 'wallet', name: 'Manage Funds', icon: Wallet, desc: 'Deposit / Withdraw' },
    { id: 'profile', name: 'Settings Desk', icon: UserIcon, desc: 'Safety & KYC' }
  ];

  return (
    <div className="min-h-screen bg-natural-bg text-natural-text flex flex-col font-sans antialiased">
      {/* Top Header Navigation */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-xl border-b border-natural-border h-20 px-4 md:px-8 flex items-center justify-between z-30 shadow-xs">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-gold-accent via-gold-primary to-gold-dark flex items-center justify-center shadow-lg shadow-gold-light/20 border border-gold-light">
            <TrendingUp className="h-5 w-5 text-white stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif font-serif-black text-lg font-black tracking-tight text-natural-dark block">coinvest</span>
              {isSandbox && (
                <span className="bg-amber-600 font-sans text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded tracking-wide shadow-sm" title="SANDBOX MODE FALLBACK ACTIVE">SANDBOX</span>
              )}
            </div>
            <span className="text-[9px] text-gold-dark font-extrabold tracking-wider block uppercase">GOLD DESK #039</span>
          </div>
        </div>

        {/* User Stats widget */}
        <div className="hidden lg:flex items-center gap-6 px-5 py-2 bg-[#FBFBFA] border border-natural-border rounded-xl text-xs font-semibold shadow-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-natural-muted font-bold uppercase tracking-wider text-[9px]">Clear Account Value:</span>
            <span className="font-mono text-natural-dark font-black">${user.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="h-4 w-px bg-natural-border" />
          <div className="flex items-center gap-1.5">
            <span className="text-natural-muted font-bold uppercase tracking-wider text-[9px]">Welcome back:</span>
            <span className="text-natural-dark font-serif font-black">{user.name}</span>
            <span className={`h-2.5 w-2.5 rounded-full ${user.verificationStatus === 'verified' ? 'bg-natural-primary' : 'bg-amber-500 animate-pulse'}`} />
          </div>
        </div>

        {/* Action icons / Mobile Hamburger */}
        <div className="flex items-center gap-3">
          {/* Browse Website Trigger */}
          {onBrowseWebsite && (
            <button 
              onClick={onBrowseWebsite}
              className="flex items-center gap-2 bg-gradient-to-r from-[#FDFDFD] to-[#F5F6F0] hover:from-gold-cream/40 border border-natural-border hover:border-gold-accent px-4 py-2 rounded-xl text-xs font-serif font-black text-gold-dark transition-all cursor-pointer shadow-sm select-none"
            >
              <Globe className="h-4 w-4 text-gold-primary animate-pulse-subtle" />
              <span className="tracking-wide uppercase text-[10.5px]">BROWSE HOME</span>
            </button>
          )}

          {/* Notifications mockup */}
          <button className="hidden sm:inline-flex p-2.5 text-natural-secondary hover:text-natural-dark hover:bg-[#F4F5F0] rounded-xl border border-natural-border transition-colors relative">
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-natural-primary" />
          </button>

          {/* Logout Trigger */}
          <button 
            onClick={logout}
            className="hidden sm:flex items-center gap-1.5 bg-white hover:bg-neutral-50 hover:text-red-700 border border-natural-border hover:border-red-200/60 px-4 py-2 rounded-xl text-xs font-extrabold text-[#5A5A40] transition-all cursor-pointer shadow-sm"
          >
            <LogOut className="h-3.5 w-3.5 shrink-0" />
            <span className="uppercase text-[10px] tracking-wider">SECURE LOGOUT</span>
          </button>

          {/* Hamburger trigger */}
          <button 
            onClick={() => setMobileMenuOpen(prev => !prev)}
            className="p-2 py-1.5 md:hidden text-natural-text hover:text-natural-dark hover:bg-white bg-transparent border border-natural-border rounded-xl"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Website-Style Dashboard Portal Navigation Sub-header */}
      <div className="bg-white border-b border-natural-border py-2 sticky top-20 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between gap-4 overflow-x-auto scrollbar-none">
          <nav className="flex items-center gap-1">
            {sidebarLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    setActiveTab(link.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs transition-all whitespace-nowrap border ${
                    isActive
                      ? 'bg-natural-primary text-white border-natural-primary font-bold shadow-md shadow-natural-primary/15'
                      : 'bg-transparent text-natural-text border-transparent hover:text-natural-dark hover:bg-[#F4F5F0] hover:border-natural-border'
                  }`}
                >
                  <link.icon className="h-4 w-4 shrink-0" />
                  <span className="font-serif font-black text-xs uppercase tracking-wider">{link.name}</span>
                </button>
              );
            })}
          </nav>

          <div className="hidden lg:flex items-center gap-2 text-[10.5px] font-sans font-black bg-gold-cream/40 border border-gold-border px-3 py-1.5 rounded-xl select-none">
            <span className="text-gold-dark uppercase tracking-wider">System Latency:</span>
            <span className="text-natural-dark font-mono">0.90ms Live Desk (UK Direct Pool)</span>
          </div>
        </div>
      </div>

      {/* Account stats display on mobile views directly below menu */}
      <div className="lg:hidden bg-gold-cream/30 border-b border-natural-border p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-natural-muted font-bold uppercase tracking-wider text-[9px]">Clear Account Value:</span>
          <span className="font-mono text-natural-dark font-black text-sm">${user.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-natural-muted font-bold uppercase tracking-wider text-[9px]">Investor profile:</span>
          <span className="text-natural-dark font-serif font-black">{user.name}</span>
          <span className={`h-2.5 w-2.5 rounded-full ${user.verificationStatus === 'verified' ? 'bg-natural-primary' : 'bg-amber-500 animate-pulse'}`} />
        </div>
      </div>

      {/* Mobile Drawer (replaces side app list drawer for a natural mobile-adapted flow) */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-36 bg-white z-20 flex flex-col p-6 space-y-4 md:hidden border-b border-natural-border shadow-xl select-none">
          <span className="text-[10px] text-natural-muted font-bold tracking-widest uppercase mb-1">Investor Control Desk</span>
          <nav className="flex flex-col gap-1.5">
            {sidebarLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    setActiveTab(link.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-serif font-black border transition-all text-left ${
                    isActive
                      ? 'bg-natural-primary text-white border-natural-primary font-bold shadow-md shadow-natural-primary/10'
                      : 'bg-transparent text-natural-text border-transparent hover:text-natural-dark hover:bg-natural-bg'
                  }`}
                >
                  <link.icon className="h-4.5 w-4.5" />
                  <span className="uppercase tracking-wide">{link.name}</span>
                </button>
              );
            })}
          </nav>
          
          <div className="pt-4 border-t border-natural-border flex flex-col gap-2">
            <button
              onClick={logout}
              className="w-full bg-white hover:bg-[#EAECE0] text-[#5A5A40] text-xs font-extrabold py-3 rounded-xl border border-natural-border tracking-wider transition-colors shadow-sm"
            >
              EXCHANGE LOGOUT
            </button>
          </div>
        </div>
      )}

      {/* Dashboard Web Main Stream */}
      <main className="flex-1 max-w-full bg-natural-bg relative pb-16">
        <div className="w-full max-w-7xl mx-auto py-8 px-4 md:px-8">
          {children}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#12120A] px-6 md:px-8 py-16 text-white border-t border-white/5 select-none font-semibold">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-12 text-left">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-br from-gold-accent to-gold-dark flex items-center justify-center border border-gold-light rounded-xl shadow-lg">
                <TrendingUp className="h-5 w-5 text-white stroke-[2.5]" />
              </div>
              <div>
                <span className="font-serif font-black text-xl text-white tracking-tight block">coinvest</span>
                <span className="text-[9px] text-gold-accent font-black tracking-widest block uppercase">GOLD DESK #039</span>
              </div>
            </div>
            <p className="text-[11.5px] text-gold-light/60 leading-relaxed max-w-md font-semibold font-sans">
              COINVEST DIGITAL LTD operates as a premier gold-standard institutional portal in the United Kingdom, combining custom client allocation solutions with top tier CFD trading matching, arbitrage engines, and capital protection strategies. Authorized and regulated under CRN #103945.
            </p>
          </div>

          <div>
            <h4 className="text-[10px] text-gold-accent uppercase font-black tracking-widest mb-4 font-serif">Investor Tiers</h4>
            <div className="flex flex-col gap-2.5 text-[11px] text-gold-light/60 font-semibold font-sans">
              <span className="hover:text-white transition-colors cursor-pointer">Beginner Portfolio (Roi 1.5% Daily)</span>
              <span className="hover:text-white transition-colors cursor-pointer">Basic Yield Contract (Roi 2.5% Daily)</span>
              <span className="hover:text-white transition-colors cursor-pointer">Standard Prime Match (Roi 3.5% Daily)</span>
              <span className="hover:text-white transition-colors cursor-pointer">VIP Sovereign Reserve (Roi 5.0% Daily)</span>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] text-gold-accent uppercase font-black tracking-widest mb-4 font-serif">Desk Safeguards</h4>
            <div className="flex flex-col gap-2.5 text-[11px] text-gold-light/60 font-semibold font-sans">
              <span className="hover:text-white transition-colors cursor-pointer">FCA Compliant Capital Clearance</span>
              <span className="hover:text-white transition-colors cursor-pointer">Segregated Pools (Barclays & HSBC)</span>
              <span className="hover:text-white transition-colors cursor-pointer">Automated Collared Risk Limits</span>
              <span className="hover:text-white transition-colors cursor-pointer">AML Identity Verification Audits</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between text-[11px] text-gold-light/40 gap-4 font-sans">
          <div className="text-center md:text-left leading-relaxed">
            © 2026 COINVEST DIGITAL LTD (Licensed Broker CRN #103945). Registered in England and Wales. 
            All trading activities, derivative assets, and CFD copy-strategies carrying high volume leverage present significant risks of capital loss. Verify kyc suitability prior to allocation.
          </div>
          <div className="flex gap-4 shrink-0 font-semibold">
            <span className="hover:text-white transition-colors cursor-pointer">Security Terms</span>
            <span className="hover:text-white transition-colors cursor-pointer">Liquidity Disclaimers</span>
            <a href="https://wa.me/19702617338?text=Hello%20Coinvest%20Support%2C%20I%20have%20a%20question%20about%20my%20portfolio." target="_blank" rel="noopener noreferrer" className="hover:text-[#FFF] hover:underline transition-colors cursor-pointer">London Support Desk</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
