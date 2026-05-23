import React, { useState, useMemo } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { Sparkles, Calculator, PiggyBank, CircleCheck, Check, Clock, TrendingUp, Calendar, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export const Investments: React.FC = () => {
  const { user, investmentPlans, investments, invest, claimInvestment } = useDashboard();
  const [selectedPlanId, setSelectedPlanId] = useState('beginner');
  const [investAmount, setInvestAmount] = useState<number>(200);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const selectedPlan = useMemo(() => {
    return investmentPlans.find(p => p.id === selectedPlanId) || investmentPlans[0];
  }, [investmentPlans, selectedPlanId]);

  // Adjust amount slider bounds when plan selection shifts
  const handlePlanSelect = (planId: string) => {
    setSelectedPlanId(planId);
    const plan = investmentPlans.find(p => p.id === planId);
    if (plan) {
      setInvestAmount(plan.min);
    }
    setErrorMsg('');
    setSuccessMsg('');
  };

  // Calculations for ROI Calculator
  const roiCalculations = useMemo(() => {
    const dailyEarnings = investAmount * (selectedPlan.dailyRoi / 100);
    const totalEarnings = dailyEarnings * selectedPlan.durationDays;
    const totalROI = selectedPlan.dailyRoi * selectedPlan.durationDays;
    return {
      daily: parseFloat(dailyEarnings.toFixed(2)),
      total: parseFloat(totalEarnings.toFixed(2)),
      percent: parseFloat(totalROI.toFixed(1)),
      gross: parseFloat((investAmount + totalEarnings).toFixed(2))
    };
  }, [investAmount, selectedPlan]);

  // Execute buy protocol
  const handleInvestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!user) return;

    if (investAmount < selectedPlan.min || investAmount > selectedPlan.max) {
      setErrorMsg(`Amount must be between $${selectedPlan.min.toLocaleString()} and $${selectedPlan.max.toLocaleString()} for this contract.`);
      return;
    }

    try {
      const res = await invest(selectedPlan.id, investAmount);
      if (res.success) {
        setSuccessMsg(res.message);
        // Trigger confetti celebration!
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Deployment of staking capital could not be completed.');
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white p-6 rounded-[32px] border border-natural-border shadow-xs relative overflow-hidden">
        <div className="flex items-start gap-4 z-10">
          <div className="p-3 bg-[#EAECE0] border border-natural-accent rounded-xl text-natural-primary">
            <PiggyBank className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-natural-dark tracking-tight">Compound Contracts Desk</h2>
            <p className="text-xs text-natural-secondary mt-1 font-semibold">
              Select verified investment channels matching CFD risk ratios. Interest accrues in real-time.
            </p>
          </div>
        </div>
      </div>

      {/* Plans List & Commitment Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plan Cards List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-natural-muted uppercase tracking-wider pl-1">Vetted Investment Contracts</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {investmentPlans.map((plan) => {
              const isSelected = plan.id === selectedPlanId;
              return (
                <button
                  key={plan.id}
                  onClick={() => handlePlanSelect(plan.id)}
                  className={`text-left p-5 rounded-[32px] border transition-all duration-300 relative overflow-hidden group flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-white border-natural-primary ring-1 ring-natural-primary shadow-sm'
                      : 'bg-white border-natural-border hover:border-[#D1D3C4]'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-natural-primary tracking-wider font-mono uppercase">
                        {plan.id} index
                      </span>
                      {isSelected && (
                        <span className="bg-[#EAECE0] text-[#5A5A40] text-[9px] font-black px-2 py-0.5 rounded-full tracking-wide border border-natural-accent">
                          SELECTED
                        </span>
                      )}
                    </div>
                    
                    <h4 className="text-lg font-serif font-bold text-natural-dark mt-2 group-hover:text-natural-primary transition-colors">
                      {plan.name}
                    </h4>
                    <p className="text-[11px] text-natural-secondary mt-1 leading-normal font-semibold">
                      {plan.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-natural-border text-xs">
                      <div>
                        <span className="text-[10px] text-[#8B8D7A] font-bold block">DAILY REWARDS</span>
                        <span className="font-mono font-extrabold text-emerald-800 mt-0.5 block text-sm">
                          {plan.dailyRoi}% ROI
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#8B8D7A] font-bold block">LOCKUP DURATION</span>
                        <span className="font-mono font-extrabold text-natural-primary mt-0.5 block text-sm">
                          {plan.durationDays} Days
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-natural-border flex justify-between items-center text-[10px] text-natural-muted font-bold">
                    <span>${plan.min.toLocaleString()} to ${plan.max >= 250000 ? 'Unlimited' : plan.max.toLocaleString()}</span>
                    <span className="text-natural-primary font-bold group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                      Configure <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Commitment & Calculator Panel */}
        <div className="bg-white rounded-[32px] border border-natural-border p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4 border-b border-natural-border pb-3">
            <Calculator className="h-[18px] w-[18px] text-natural-primary" />
            <h4 className="text-sm font-serif font-bold text-natural-dark">Staking Calculator {"&"} Deploy</h4>
          </div>

          <form onSubmit={handleInvestSubmit} className="space-y-4">
            {/* Input Amount */}
            <div className="space-y-1.5">
              <label className="text-xs text-natural-muted font-bold uppercase tracking-wider block">STAKING DEPLOYMENT AMOUNT</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-natural-secondary font-mono font-extrabold text-sm">$</span>
                <input
                  type="number"
                  min={selectedPlan.min}
                  max={selectedPlan.max}
                  value={investAmount}
                  onChange={(e) => setInvestAmount(Number(e.target.value))}
                  className="w-full font-mono font-bold bg-white border border-[#D1D3C4] focus:border-natural-primary focus:ring-1 focus:ring-natural-primary rounded-xl py-2.5 pl-8 pr-4 text-sm text-natural-dark outline-none"
                />
              </div>
              <div className="flex justify-between text-[10px] text-[#7D7F6E] font-bold">
                <span>Min: ${selectedPlan.min.toLocaleString()}</span>
                <span>Max: ${selectedPlan.max >= 250000 ? 'Unlimited' : selectedPlan.max.toLocaleString()}</span>
              </div>
            </div>

            {/* Slider shortcuts */}
            <div className="grid grid-cols-4 gap-1">
              {[selectedPlan.min, Math.floor(selectedPlan.min + selectedPlan.max * 0.25) || 500, Math.floor(selectedPlan.min + selectedPlan.max * 0.5) || 1500, selectedPlan.max >= 250000 ? 50000 : selectedPlan.max].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setInvestAmount(v)}
                  className="text-[9px] font-mono bg-white border border-natural-border hover:bg-natural-bg text-natural-secondary py-1 px-1 rounded-md transition-colors cursor-pointer font-bold"
                >
                  ${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </button>
              ))}
            </div>

            {/* ROI Metrics */}
            <div className="bg-[#F4F5F0] rounded-2xl p-4 border border-natural-border space-y-3 font-semibold text-natural-text">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#8B8D7A] font-bold">PLAN ROI INTEREST:</span>
                <span className="font-mono text-emerald-800 font-extrabold">{roiCalculations.percent}%</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#8B8D7A] font-bold">DAILY RETURN ESTIMATE:</span>
                <span className="font-mono text-natural-dark font-black">${roiCalculations.daily.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#8B8D7A] font-bold">NET EARNED YIELD:</span>
                <span className="font-mono text-emerald-800 font-extrabold">+${roiCalculations.total.toLocaleString()}</span>
              </div>
              <div className="border-t border-[#D1D3C4] pt-2 flex justify-between items-center text-xs">
                <span className="text-natural-secondary font-bold">GROSS MATURITY PAYOUT:</span>
                <span className="font-mono text-natural-dark font-black text-sm">${roiCalculations.gross.toLocaleString()}</span>
              </div>
            </div>

            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-[11px] py-2 px-3 rounded-lg text-center font-semibold">
                {successMsg}
              </div>
            )}

            {errorMsg && (
              <div className="bg-rose-50 border border-rose-100 text-rose-800 text-[11px] py-2 px-3 rounded-lg text-center font-semibold">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-natural-primary hover:bg-[#4E4E37] text-white font-bold py-3 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>DEPLOY STAKING CAPITAL</span>
            </button>
          </form>
        </div>
      </div>

      {/* Active Running Investments Portfolio */}
      <div className="bg-white rounded-[32px] border border-natural-border p-5 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4.5 w-4.5 text-natural-primary" />
            <h3 className="text-sm font-serif font-black text-natural-dark">Active Staked Contracts Portfolio</h3>
          </div>
          <span className="text-[10px] text-emerald-800 font-bold tracking-wider bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <TrendingUp className="h-3 w-3 animate-pulse" /> GENERATING YIELDS
          </span>
        </div>

        {investments.length === 0 ? (
          <div className="text-center py-10 rounded-2xl bg-[#F4F5F0]/30 border border-dashed border-natural-accent text-natural-secondary">
            <p className="text-xs font-semibold">No active investment allocations. Launch a contract above!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {investments.map((inv) => {
              const daysLeft = Math.max(0, Math.ceil((new Date(inv.endDate).getTime() - Date.now()) / (24 * 60 * 60 * 1000)));
              
              return (
                <div 
                  key={inv.id} 
                  className="bg-white border border-natural-border rounded-2xl p-4 flex flex-col justify-between shadow-xs"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-serif font-bold text-natural-dark text-sm">{inv.planName} Contract</h4>
                      <p className="text-[10px] text-natural-muted mt-0.5 font-mono">Reference ID: {inv.id}</p>
                    </div>
                    <span className="bg-[#EAECE0] text-natural-primary border border-natural-accent text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                      {inv.dailyRoi}% ROI (Daily)
                    </span>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 my-4 py-3 border-y border-natural-border text-xs text-natural-secondary font-semibold">
                    <div>
                      <span className="text-[10px] text-natural-muted font-bold block">PLACED AMOUNT</span>
                      <span className="font-mono text-natural-dark font-black block mt-0.5 text-xs">
                        ${inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-natural-muted font-bold block">MATURITY DAYS LEFT</span>
                      <span className="font-mono text-natural-primary font-bold block mt-0.5 text-xs flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" /> {daysLeft} Days
                      </span>
                    </div>
                    <div className="col-span-2 lg:col-span-1">
                      <span className="text-[10px] text-emerald-800 font-bold block">UNINTERRUPTED ACCRUALS</span>
                      <span className="font-mono text-emerald-700 font-black block mt-0.5 text-sm animate-pulse-subtle">
                        +${inv.totalEarned.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-natural-muted font-bold">
                      Auto-Compound Active
                    </span>
                    <button
                      onClick={() => claimInvestment(inv.id)}
                      disabled={inv.totalEarned <= 0}
                      className={`font-bold px-3 py-1.5 rounded-lg text-[10px] tracking-wide transition-all border shrink-0 cursor-pointer ${
                        inv.totalEarned > 0
                          ? 'bg-emerald-800 hover:bg-emerald-900 text-white border-emerald-700 shadow shadow-emerald-500/5'
                          : 'bg-[#F4F5F0] text-natural-muted border-natural-border cursor-not-allowed'
                      }`}
                    >
                      {inv.totalEarned > 0 ? 'Claim / compounding' : 'accruing...'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
