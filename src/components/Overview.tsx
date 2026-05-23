import React, { useState, useMemo } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { 
  TrendingUp, TrendingDown, DollarSign, Wallet, ArrowUpRight, ArrowDownLeft, 
  History, ShieldCheck, HelpCircle, Eye, EyeOff, ClipboardCheck, Award 
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export const Overview: React.FC<{ setActiveTab: (tab: string) => void }> = ({ setActiveTab }) => {
  const { user, transactions, marketAssets, trades, investments } = useDashboard();
  const [showSensitive, setShowSensitive] = useState(true);
  const [selectedAssetSymbol, setSelectedAssetSymbol] = useState('BTC/USD');

  // Find currently selected ticker core details
  const selectedAsset = useMemo(() => {
    return marketAssets.find(a => a.symbol === selectedAssetSymbol) || marketAssets[0];
  }, [marketAssets, selectedAssetSymbol]);

  // Construct chart data dynamically using history24h from Context
  const chartData = useMemo(() => {
    if (!selectedAsset) return [];
    return selectedAsset.history24h.map((val, idx) => ({
      time: `${idx * 4}:00`,
      price: val
    }));
  }, [selectedAsset]);

  // Handle Clipboard Copy
  const handleCopyReferral = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(`https://coinvest.cc/?ref=${user.referralCode}`);
      alert('Referral link copied securely!');
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Header Info Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[32px] border border-natural-border shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-natural-dark tracking-tight flex items-center gap-2">
            Asset Vault Management
            {user.verificationStatus === 'verified' && (
              <span className="text-[10px] font-bold tracking-widest text-[#5A5A40] bg-[#EAECE0] border border-natural-accent px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 stroke-[3]" /> SECURED & VERIFIED
              </span>
            )}
          </h2>
          <p className="text-xs text-natural-secondary mt-1 font-semibold">
            Standard brokerage session initiated. Live connections monitoring LP depth.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => setShowSensitive(prev => !prev)}
            className="p-2 ml-auto text-natural-secondary hover:text-natural-dark hover:bg-natural-bg rounded-lg border border-[#D1D3C4] transition-colors bg-white shadow-xs"
            title="Toggle Numbers Visibility"
          >
            {showSensitive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          <button 
            onClick={() => setActiveTab('wallet')}
            className="bg-natural-primary hover:bg-[#4E4E37] text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors shadow-sm flex items-center gap-1 cursor-pointer"
          >
            <ArrowUpRight className="h-3.5 w-3.5 stroke-[2.5]" /> Fund Wallet
          </button>
        </div>
      </div>

      {/* Financial Core Stats Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            title: 'Account Value (USD)', 
            value: user.balance, 
            sub: 'Available Liquid Capital', 
            icon: Wallet,
            color: 'text-[#5A5A40] bg-[#EAECE0] border-[#D1D3C4]'
          },
          { 
            title: 'Retained Yields & P&L', 
            value: user.profits, 
            sub: 'Real-time Net Earnings', 
            icon: TrendingUp,
            color: user.profits >= 0 ? 'text-emerald-800 bg-emerald-50 border-emerald-200' : 'text-rose-800 bg-rose-50 border-rose-200'
          },
          { 
            title: 'Active Margin / Placed', 
            value: user.activeInvestmentsAmount, 
            sub: 'In-play Staked Contracts', 
            icon: DollarSign,
            color: 'text-[#8B8D7A] bg-[#F4F5F0] border-[#E5E7D8]'
          },
          { 
            title: 'System Payouts / Outflows', 
            value: user.totalWithdrawn, 
            sub: 'Cleared Withdrawals', 
            icon: ArrowDownLeft,
            color: 'text-amber-800 bg-amber-50 border-amber-200'
          }
        ].map((stat, idx) => (
          <div 
            key={idx} 
            className="bg-white rounded-[32px] p-5 border border-natural-border shadow-sm relative overflow-hidden"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs text-natural-muted font-bold block uppercase tracking-wider">{stat.title}</span>
                <span className="text-xl sm:text-2xl font-serif font-black text-natural-dark mt-1.5 block tracking-tight">
                  {showSensitive ? `$${stat.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '••••••••'}
                </span>
                <span className="text-[10px] text-natural-secondary font-bold block mt-1">{stat.sub}</span>
              </div>
              <div className={`p-2.5 rounded-xl border ${stat.color} shadow-xs`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Live Market Tickers Header */}
      <div className="bg-[#EAECE0] p-2 border border-natural-border rounded-2xl flex items-center gap-3 overflow-x-auto select-none no-scrollbar">
        <div className="text-[10px] font-bold text-[#7D7F6E] uppercase px-3 tracking-wider border-r border-natural-border flex-shrink-0">
          Live Assets
        </div>
        <div className="flex gap-2 w-full">
          {marketAssets.map((asset) => (
            <button
              key={asset.symbol}
              onClick={() => setSelectedAssetSymbol(asset.symbol)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex-shrink-0 cursor-pointer ${
                selectedAssetSymbol === asset.symbol
                  ? 'bg-natural-primary border-natural-primary text-white shadow-xs'
                  : 'bg-white/40 border-natural-border text-[#7D7F6E] hover:text-[#5A5A40] hover:bg-white/80'
              }`}
            >
              <span className="font-serif">{asset.symbol}</span>
              <span className="font-mono font-medium">${asset.price.toLocaleString(undefined, { maximumFractionDigits: asset.category === 'forex' ? 4 : 2 })}</span>
              <span className={`flex items-center text-[10px] ${asset.change24h >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Multi-Asset Interactive Chart Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart (Recharts) */}
        <div className="lg:col-span-2 bg-white rounded-[32px] border border-natural-border p-5 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-serif font-black text-natural-dark">Market Rate Vector</h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold bg-[#EAECE0] text-[#5A5A40]">
                  {selectedAsset.category.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-natural-secondary mt-0.5 font-semibold">{selectedAsset.name} price tracking indexes</p>
            </div>
            <div className="text-right">
              <span className="text-lg font-mono font-black text-natural-dark block">
                ${selectedAsset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: selectedAsset.category === 'forex' ? 4 : 2 })}
              </span>
              <span className={`block text-[11px] font-bold ${selectedAsset.change24h >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {selectedAsset.change24h >= 0 ? '▲' : '▼'} {selectedAsset.change24h}% (24h)
              </span>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full pr-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5A5A40" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#5A5A40" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="time" 
                  stroke="#8B8D7A" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  stroke="#8B8D7A" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  domain={['auto', 'auto']}
                  tickFormatter={(val) => `$${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderColor: '#E5E7D8', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                  labelStyle={{ color: '#8B8D7A', fontSize: '10px', fontWeight: 'bold' }}
                  itemStyle={{ color: '#2A2A1A', fontSize: '12px', fontWeight: 'bold', fontFamily: 'monospace' }}
                  formatter={(value: any) => [`$${parseFloat(value).toLocaleString()}`, 'Price']}
                />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#5A5A40" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#colorPrice)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-between items-center text-[10px] text-natural-muted pt-3 border-t border-natural-border mt-2 font-bold uppercase tracking-wider">
            <span>Aggregating pricing signals from 4 liquidity pools</span>
            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-natural-primary animate-pulse" /> Live Pricing Socket Connected</span>
          </div>
        </div>

        {/* Dynamic Margin Status and Referral Card */}
        <div className="space-y-4">
          {/* Activity State Card */}
          <div className="bg-white rounded-[32px] border border-[#E5E7D8] p-5 shadow-sm flex flex-col justify-between h-[50%] min-h-[170px]">
            <div>
              <h4 className="text-[10px] font-bold text-natural-muted uppercase tracking-widest">Active Margin Status</h4>
              <div className="flex items-center gap-2.5 mt-2.5">
                <span className="text-2xl font-serif font-black text-natural-dark">
                  {trades.filter(t => t.status === 'open').length}
                </span>
                <span className="text-xs text-natural-secondary font-semibold">Position Margin Streams in lockup</span>
              </div>
            </div>
            
            <div className="bg-[#F4F5F0] rounded-2xl p-3 border border-natural-border mt-2 flex justify-between items-center shadow-xs">
              <div>
                <span className="text-[9.5px] text-[#7D7F6E] uppercase font-bold block">Current Running P&L</span>
                <span className={`text-sm font-mono font-bold ${
                  trades.reduce((sum, t) => sum + (t.status === 'open' ? t.pnl : 0), 0) >= 0 ? 'text-emerald-700' : 'text-rose-700'
                }`}>
                  {trades.reduce((sum, t) => sum + (t.status === 'open' ? t.pnl : 0), 0) >= 0 ? '+' : ''}
                  ${trades.reduce((sum, t) => sum + (t.status === 'open' ? t.pnl : 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <button 
                onClick={() => setActiveTab('trading')}
                className="bg-white hover:bg-[#EAECE0] text-natural-dark font-bold px-3 py-1.5 rounded-lg text-[10px] tracking-wide border border-natural-border transition-colors cursor-pointer"
              >
                Go To Terminal
              </button>
            </div>
          </div>

          {/* Referral Card */}
          <div className="bg-gradient-to-br from-gold-cream to-white rounded-[32px] p-5 border border-gold-light shadow-xs h-[46%] min-h-[160px] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Award className="h-4.5 w-4.5 text-gold-accent" />
                <h4 className="text-xs font-serif font-bold text-gold-dark tracking-wide">coinvest Referral Plan</h4>
              </div>
              <p className="text-[11px] text-natural-secondary leading-normal mt-2 font-semibold">
                Refer other active CFD traders and retain 10% of their staking ROI contracts instantly!
              </p>
            </div>

            <div className="space-y-2 mt-2">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-natural-muted">
                <span>Total Commissions:</span>
                <span className="font-mono text-emerald-800">${user.referralsEarned.toLocaleString()}</span>
              </div>
              <div className="flex bg-white rounded-xl max-w-full overflow-hidden border border-gold-light p-1 shadow-xs font-semibold">
                <input
                  type="text"
                  readOnly
                  value={user.referralCode}
                  className="bg-transparent text-xs text-natural-dark pl-2 outline-none w-full font-mono font-semibold select-all"
                />
                <button
                  onClick={handleCopyReferral}
                  className="bg-natural-primary hover:bg-[#4E4E37] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
                >
                  <ClipboardCheck className="h-3 w-3" /> Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Ledger Logs (Transactions) */}
      <div className="bg-white rounded-[32px] border border-natural-border p-5 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <History className="h-4.5 w-4.5 text-natural-primary" />
            <h3 className="text-sm font-serif font-black text-natural-dark">Transaction Registry Journal</h3>
          </div>
          <span className="text-[10px] text-natural-muted font-bold uppercase tracking-wider">Secured Ledger</span>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-10 text-natural-secondary font-semibold">
            <p className="text-xs">No journal activity recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-natural-border text-[10px] text-natural-muted uppercase tracking-wider leading-10 font-bold">
                  <th className="pb-2">REFERENCE/HASH</th>
                  <th className="pb-2">TYPE</th>
                  <th className="pb-2">DISPATCH ACCOUNT</th>
                  <th className="pb-2">DATE TIME</th>
                  <th className="pb-2 text-right">VALUE</th>
                  <th className="pb-2 text-right">METRIC STATE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F5F0] text-xs font-semibold text-natural-text">
                {transactions.slice(0, 5).map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#F4F5F0]/30 leading-[3rem]">
                    <td className="font-mono text-natural-secondary text-[11px]">
                      {tx.txHash ? (
                        <a href="#" className="hover:text-natural-primary underline transition-colors" title={tx.txHash}>
                          {tx.id} / {tx.txHash.slice(0, 8)}...
                        </a>
                      ) : (
                        tx.id
                      )}
                    </td>
                    <td className="capitalize">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                        tx.type === 'deposit' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' :
                        tx.type === 'withdrawal' ? 'bg-amber-50 text-amber-800 border border-amber-100' :
                        tx.type === 'investment' ? 'bg-[#EAECE0] text-[#5A5A40] border border-natural-border' :
                        'bg-cyan-50 text-cyan-800 border border-cyan-100'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="text-natural-secondary text-[11px] max-w-[150px] truncate" title={tx.details}>
                      {tx.method} ({tx.details})
                    </td>
                    <td className="text-natural-muted text-[11px]">
                      {new Date(tx.timestamp).toLocaleString(undefined, { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className={`text-right font-mono font-black ${
                      tx.type === 'deposit' || tx.type === 'payout' || tx.type === 'referral' ? 'text-emerald-700' : 'text-natural-dark'
                    }`}>
                      {tx.type === 'deposit' || tx.type === 'payout' || tx.type === 'referral' ? '+' : '-'}
                      ${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="text-right">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        tx.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                        tx.status === 'pending' ? 'bg-amber-100 text-amber-800 animate-pulse-subtle' :
                        tx.status === 'under_review' ? 'bg-amber-50 text-amber-700' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {tx.status.toUpperCase().replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
