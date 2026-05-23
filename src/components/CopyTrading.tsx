import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { CopyTrader } from '../types';
import { Users, Info, Sparkles, TrendingUp, ShieldCheck, DollarSign, Award, Check } from 'lucide-react';

export const CopyTrading: React.FC = () => {
  const { user, copyTraders, toggleCopyTrader } = useDashboard();
  const [allocationInputs, setAllocationInputs] = useState<Record<string, number>>({});
  const [successMsgs, setSuccessMsgs] = useState<Record<string, string>>({});
  const [errorMsgs, setErrorMsgs] = useState<Record<string, string>>({});

  const handleInputChange = (traderId: string, val: number) => {
    setAllocationInputs(prev => ({ ...prev, [traderId]: val }));
    setSuccessMsgs(prev => ({ ...prev, [traderId]: '' }));
    setErrorMsgs(prev => ({ ...prev, [traderId]: '' }));
  };

  const handleCopySubmit = async (e: React.FormEvent, trader: CopyTrader) => {
    e.preventDefault();
    const traderId = trader.id;
    const amount = allocationInputs[traderId] !== undefined ? allocationInputs[traderId] : (trader.isCopied ? 0 : 500);

    try {
      const res = await toggleCopyTrader(traderId, amount);
      if (res.success) {
        setSuccessMsgs(prev => ({ ...prev, [traderId]: res.message }));
        // Clear inputs
        if (!trader.isCopied) {
          setAllocationInputs(prev => ({ ...prev, [traderId]: 0 }));
        }
      } else {
        setErrorMsgs(prev => ({ ...prev, [traderId]: res.message }));
      }
    } catch (err: any) {
      setErrorMsgs(prev => ({ ...prev, [traderId]: err.message || 'Strategy execution ticket failed.' }));
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white p-6 rounded-[32px] border border-natural-border shadow-xs relative overflow-hidden">
        <div className="flex items-start gap-4 z-10">
          <div className="p-3 bg-[#EAECE0] border border-natural-accent rounded-xl text-natural-primary">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-natural-dark tracking-tight">MirrorCopy™ Vet Index</h2>
            <p className="text-xs text-natural-secondary mt-1 font-semibold">
              Follow elite CFD & Spot traders. The algorithmic mirror router clones execution parameters instantly into your account.
            </p>
          </div>
        </div>
      </div>

      {/* Copy Strategies List grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {copyTraders.map((trader) => {
          const inputAlloc = allocationInputs[trader.id] !== undefined ? allocationInputs[trader.id] : 500;
          return (
            <div 
              key={trader.id} 
              className={`bg-white border rounded-[32px] p-5 shadow-sm flex flex-col justify-between transition-all relative ${
                trader.isCopied ? 'border-natural-primary ring-1 ring-natural-primary bg-[#F4F5F0]/25' : 'border-natural-border hover:border-[#D1D3C4]'
              }`}
            >
              <div>
                {/* Header Profile Info */}
                <div className="flex justify-between items-start">
                  <div className="flex gap-3 items-center">
                    <img 
                      src={trader.avatar} 
                      alt={trader.name} 
                      referrerPolicy="no-referrer"
                      className="h-11 w-11 rounded-full border border-natural-border object-cover" 
                    />
                    <div>
                      <h4 className="font-serif font-bold text-natural-dark text-sm flex items-center gap-1">
                        {trader.name}
                        {trader.winRate >= 85 && (
                          <span title="Top Performing Master" className="text-natural-primary">
                            <Award className="h-3.5 w-3.5 fill-natural-accent/10" />
                          </span>
                        )}
                      </h4>
                      <p className="text-[10px] text-natural-muted font-bold block mt-0.5">Strategy Asset: {trader.preferredAsset}</p>
                    </div>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[9px] text-[#7D7F6E] font-bold uppercase">WIN RATE</span>
                    <span className="font-mono text-emerald-800 font-extrabold text-sm">{trader.winRate}%</span>
                  </div>
                </div>

                {/* Performance stats grid */}
                <div className="grid grid-cols-3 gap-2 bg-[#F4F5F0] rounded-2xl p-3 border border-natural-border my-4 text-center">
                  <div>
                    <span className="text-[9px] text-natural-muted font-bold block">30D RETURN</span>
                    <span className="font-mono text-emerald-700 font-extrabold block text-xs mt-0.5">
                      +{trader.roi30D}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-natural-muted font-bold block">AUM ASSETS</span>
                    <span className="font-mono text-natural-dark font-extrabold block text-xs mt-0.5">
                      ${(trader.aum / 1000000).toFixed(1)}M
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-natural-muted font-bold block">RISK INDEX</span>
                    <span className="font-mono text-amber-800 font-extrabold block text-xs mt-0.5">
                      {trader.riskScore}/5
                    </span>
                  </div>
                </div>

                {/* Description details */}
                <div className="space-y-2 mt-2 mb-4 text-[11px] text-natural-secondary leading-relaxed font-semibold">
                  <div className="flex justify-between">
                    <span>Active Copiers following:</span>
                    <span className="text-natural-dark font-serif font-bold">{trader.copiers.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Performance Fee markup:</span>
                    <span className="text-emerald-800">10.0% of P&L</span>
                  </div>
                </div>
              </div>

              {/* Action Form */}
              <form onSubmit={(e) => handleCopySubmit(e, trader)} className="border-t border-natural-border pt-3.5 space-y-3">
                {trader.isCopied ? (
                  // Active Copy Trading Mode Controls
                  <div className="space-y-3">
                    <div className="bg-emerald-50 text-emerald-800 rounded-xl p-3 border border-emerald-100 text-center flex items-center justify-center gap-1.5">
                      <Check className="h-4.5 w-4.5 stroke-[2.5]" />
                      <div className="text-left font-semibold">
                        <span className="text-[10px] font-bold block uppercase tracking-wider">MIRROR-LINK ACTIVE</span>
                        <span className="text-[10px] text-emerald-950">Allocated amount: <strong className="font-mono text-emerald-900">${trader.copiedAmount}</strong></span>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-white hover:bg-rose-50 text-rose-800 font-bold py-2 px-4 rounded-xl text-xs transition-colors border border-rose-100 hover:border-rose-350 cursor-pointer text-center"
                    >
                      STOP COPY ALLOCATION
                    </button>
                  </div>
                ) : (
                  // Open Mirror Entry
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[9px] text-natural-muted font-bold uppercase block tracking-wider">ALLOCATION BUDGET</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-natural-secondary font-mono">$</span>
                        <input
                          type="number"
                          min={100}
                          value={inputAlloc}
                          onChange={(e) => handleInputChange(trader.id, Number(e.target.value))}
                          placeholder="Min $100 allocation"
                          className="w-full font-bold font-mono bg-white border border-[#D1D3C4] focus:border-natural-primary focus:ring-1 focus:ring-natural-primary rounded-xl py-2 pl-6 pr-4 text-xs text-natural-dark outline-none"
                        />
                      </div>
                    </div>

                    {successMsgs[trader.id] && (
                      <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-[10px] py-1.5 px-2 rounded-lg text-center font-bold">
                        {successMsgs[trader.id]}
                      </div>
                    )}

                    {errorMsgs[trader.id] && (
                      <div className="bg-rose-50 border border-rose-100 text-rose-800 text-[10px] py-1.5 px-2 rounded-lg text-center font-bold">
                        {errorMsgs[trader.id]}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-natural-primary hover:bg-[#4E4E37] text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="h-4 w-4 stroke-[2.5]" />
                      <span>INITIALIZE MIRROR™ COPY</span>
                    </button>
                  </div>
                )}
              </form>
            </div>
          );
        })}
      </div>

      {/* Notice Board */}
      <div className="bg-white border border-natural-border rounded-2xl p-4 flex gap-3 text-xs leading-relaxed text-natural-secondary justify-start select-none font-semibold">
        <Info className="h-5 w-5 text-natural-primary flex-shrink-0" />
        <div>
          <span className="font-serif font-bold text-natural-dark block mb-0.5">Mirror Link Disclaimers</span>
          Risk parameters for copied strategies are computed on structural trading margins and will auto-rebalance if the user accounts fall close to maintaining margin ratios. Past performance does not assure final results.
        </div>
      </div>
    </div>
  );
};
