import React, { useState, useMemo } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { ShieldAlert, Info, Percent, ChevronUp, ChevronDown, CheckCircle, Activity, TrendingUp, DollarSign } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isSuccess = data.pnl >= 0;
    return (
      <div className="bg-white/95 backdrop-blur-md border border-[#EAECE0] shadow-xl p-3.5 rounded-2xl text-left select-none max-w-xs">
        <p className="text-[10px] text-[#8B8D7A] font-bold uppercase tracking-wider font-mono">
          {data.tradeIndex} – {data.symbol} ({data.type})
        </p>
        <p className="text-xs font-serif font-bold text-natural-dark mt-1">Ref ID: {data.id}</p>
        <div className="mt-2 space-y-1 text-xs">
          <div className="flex justify-between gap-6">
            <span className="text-[#8B8D7A] font-semibold">Trade P&L:</span>
            <span className={`font-mono font-black ${isSuccess ? 'text-emerald-700' : 'text-rose-700'}`}>
              {isSuccess ? '+' : ''}${data.pnl.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between gap-6">
            <span className="text-[#8B8D7A] font-semibold">Cumulative Total:</span>
            <span className={`font-mono font-bold ${data.cumulativePnl >= 0 ? 'text-emerald-800' : 'text-rose-800'}`}>
              {data.cumulativePnl >= 0 ? '+' : ''}${data.cumulativePnl.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const CFDTrading: React.FC = () => {
  const { user, marketAssets, trades, openTrade, closeTrade } = useDashboard();
  const [selectedSymbol, setSelectedSymbol] = useState('BTC/USD');
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [marginInput, setMarginInput] = useState<number>(50); // Direct margin used for this position
  const [leverage, setLeverage] = useState<number>(50); // Starting default leverage
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const currentAsset = useMemo(() => {
    return marketAssets.find(a => a.symbol === selectedSymbol) || marketAssets[0];
  }, [marketAssets, selectedSymbol]);

  const closedPositions = useMemo(() => {
    return trades.filter(t => t.status === 'closed');
  }, [trades]);

  const last10ClosedTrades = useMemo(() => {
    // Sort closed trades oldest to newest (chronologically) so the line feeds left-to-right
    const sorted = [...closedPositions].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    return sorted.slice(-10);
  }, [closedPositions]);

  const pnlChartData = useMemo(() => {
    let runningTotal = 0;
    return last10ClosedTrades.map((t, idx) => {
      runningTotal += t.pnl;
      return {
        tradeIndex: `Trade #${idx + 1}`,
        id: t.id.slice(0, 6).toUpperCase(),
        symbol: t.symbol,
        pnl: parseFloat(t.pnl.toFixed(2)),
        cumulativePnl: parseFloat(runningTotal.toFixed(2)),
        type: t.type.toUpperCase()
      };
    });
  }, [last10ClosedTrades]);

  // CFD Stats calculations
  const positionStats = useMemo(() => {
    const assetPrice = currentAsset.price;
    const notionalVolume = marginInput * leverage;
    const sizeInContracts = notionalVolume / assetPrice;
    
    // Leverage Maintenance check & liquidation calculation
    const isBuy = tradeType === 'buy';
    const liquidationSpreadPercent = 100 / leverage; // When asset falls/rises by this %, margin is lost
    const liquidationDelta = assetPrice * (liquidationSpreadPercent / 100);
    const liquidationPrice = isBuy ? assetPrice - liquidationDelta : assetPrice + liquidationDelta;

    return {
      volume: parseFloat(notionalVolume.toFixed(2)),
      size: parseFloat(sizeInContracts.toFixed(isBuy ? 5 : 4)),
      liqPrice: parseFloat(liquidationPrice.toFixed(currentAsset.category === 'forex' ? 5 : 2))
    };
  }, [marginInput, leverage, tradeType, currentAsset]);

  const handleSubmitTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!user) return;

    if (marginInput <= 0) {
      setErrorMsg('Margin allocation must be greater than zero.');
      return;
    }

    if (marginInput > user.balance) {
      setErrorMsg('Insufficient available liquid balance to fulfill margin requirement.');
      return;
    }

    try {
      const res = await openTrade(selectedSymbol, tradeType, marginInput, leverage);
      if (res.success) {
        setSuccessMsg(res.message);
        // Auto-clear success message after 4.5 seconds
        setTimeout(() => {
          setSuccessMsg('');
        }, 4500);
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Execution of contract order signal failed.');
    }
  };

  if (!user) return null;

  const openPositions = trades.filter(t => t.status === 'open');

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="bg-white p-6 rounded-[32px] border border-natural-border shadow-xs relative overflow-hidden">
        <div className="flex items-start gap-4 z-10">
          <div className="p-3 bg-[#EAECE0] border border-natural-accent rounded-xl text-natural-primary">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-natural-dark tracking-tight">Institutional CFD Terminal</h2>
            <p className="text-xs text-natural-secondary mt-1 font-semibold">
              Live multi-asset execution station. Custom margins, 1:500 leverages, and immediate liquidity clearance.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assets List Panel */}
        <div className="bg-white rounded-[32px] border border-natural-border p-5 shadow-sm">
          <h3 className="text-xs font-bold text-natural-muted uppercase tracking-wider mb-4">Supported Contracts Index</h3>
          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1 no-scrollbar">
            {marketAssets.map((asset) => (
              <button
                key={asset.symbol}
                onClick={() => {
                  setSelectedSymbol(asset.symbol);
                  setSuccessMsg('');
                  setErrorMsg('');
                }}
                className={`w-full flex justify-between items-center p-3 rounded-xl border transition-all cursor-pointer ${
                  selectedSymbol === asset.symbol
                    ? 'bg-natural-bg border-natural-primary text-natural-dark shadow-xs'
                    : 'bg-white border-natural-border hover:border-[#D1D3C4] text-natural-secondary hover:text-natural-dark'
                }`}
              >
                <div>
                  <span className="font-serif font-bold text-xs block text-left">{asset.symbol}</span>
                  <span className="text-[10px] text-natural-muted block text-left font-bold capitalize mt-0.5">{asset.category} CFD</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xs font-black block">
                    ${asset.price.toLocaleString(undefined, { maximumFractionDigits: asset.category === 'forex' ? 4 : 2 })}
                  </span>
                  <span className={`block text-[10px] font-bold mt-0.5 ${asset.change24h >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Trade Entry Station */}
        <div className="lg:col-span-2 bg-white rounded-[32px] border border-natural-border p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4 border-b border-natural-border pb-3">
            <div>
              <h3 className="text-sm font-serif font-bold text-natural-dark flex items-center gap-1.5">
                Market Order Ticket
                <span className="bg-[#EAECE0] text-natural-primary text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border border-[#D1D3C4]">
                  {currentAsset.symbol}
                </span>
              </h3>
            </div>
            <div className="text-right font-mono text-xs text-natural-secondary font-bold">
              Live Feed: <span className="text-natural-dark font-black">${currentAsset.price.toLocaleString(undefined, { maximumFractionDigits: currentAsset.category === 'forex' ? 4 : 2 })}</span>
            </div>
          </div>

          <form onSubmit={handleSubmitTrade} className="space-y-5">
            {/* Bid/Ask Direction Selection */}
            <div className="grid grid-cols-2 gap-3.5">
              <button
                type="button"
                onClick={() => setTradeType('buy')}
                className={`py-3.5 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  tradeType === 'buy'
                    ? 'bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs'
                    : 'bg-white hover:bg-emerald-50 border border-emerald-200 text-emerald-800'
                }`}
              >
                <ChevronUp className="h-4.5 w-4.5 stroke-[3]" />
                <span>BUY (LONG CONTRACT)</span>
              </button>
              <button
                type="button"
                onClick={() => setTradeType('sell')}
                className={`py-3.5 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  tradeType === 'sell'
                    ? 'bg-rose-800 hover:bg-rose-900 text-white shadow-xs'
                    : 'bg-white hover:bg-rose-50 border border-rose-200 text-rose-800'
                }`}
              >
                <ChevronDown className="h-4.5 w-4.5 stroke-[3]" />
                <span>SELL (SHORT CONTRACT)</span>
              </button>
            </div>

            {/* Inputs Margin */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-natural-muted font-bold uppercase tracking-wider block">Position Margin (USD)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-natural-secondary font-black font-mono">$</span>
                  <input
                    type="number"
                    min={5}
                    value={marginInput}
                    onChange={(e) => setMarginInput(Number(e.target.value))}
                    className="w-full font-bold font-mono bg-white border border-[#D1D3C4] focus:border-natural-primary focus:ring-1 focus:ring-natural-primary rounded-xl py-2.5 pl-7 pr-4 text-xs text-natural-dark outline-none"
                  />
                </div>
                <div className="flex justify-between text-[9px] text-[#7D7F6E] font-bold">
                  <span>Available Balance: ${user.balance.toLocaleString()}</span>
                  <button type="button" onClick={() => setMarginInput(Math.floor(user.balance * 0.25))} className="hover:text-natural-primary underline uppercase cursor-pointer">Quick 25%</button>
                </div>
              </div>

              {/* Leverage Selection Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] text-natural-muted font-bold uppercase tracking-wider">
                  <span>CFD Margin Leverage</span>
                  <span className="font-mono text-natural-primary pr-1">{leverage}x</span>
                </div>
                <div className="bg-[#F4F5F0] border border-natural-border px-3.5 py-2.5 rounded-xl flex items-center gap-3">
                  <input
                    type="range"
                    min={5}
                    max={500}
                    step={5}
                    value={leverage}
                    onChange={(e) => setLeverage(Number(e.target.value))}
                    className="w-full h-1.5 accent-[#5A5A40] bg-[#EAECE0] rounded-lg outline-none cursor-pointer"
                  />
                </div>
                <div className="flex gap-1 justify-between">
                  {[10, 50, 100, 200, 500].map((lev) => (
                    <button
                      key={lev}
                      type="button"
                      onClick={() => setLeverage(lev)}
                      className={`text-[9px] font-bold font-mono border px-1.5 py-0.5 rounded-md cursor-pointer ${
                        leverage === lev 
                          ? 'bg-[#EAECE0] text-[#5A5A40] border-natural-accent' 
                          : 'bg-white text-natural-secondary border-natural-border hover:border-[#D1D3C4]'
                      }`}
                    >
                      {lev}x
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Simulated Calculations */}
            <div className="bg-[#F4F5F0] rounded-xl p-4 border border-natural-border space-y-3 font-semibold text-xs text-natural-text">
              <div className="flex justify-between items-center">
                <span className="text-[#8B8D7A]">Notional Ticket volume (USD):</span>
                <span className="font-mono text-natural-dark font-black">${positionStats.volume.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#8B8D7A]">Execution Size in Units:</span>
                <span className="font-mono text-natural-dark font-black">{positionStats.size.toLocaleString()} Contract Units</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#8B8D7A]">Liquidation Trigger Price:</span>
                <span className="font-mono text-rose-800 font-bold">${positionStats.liqPrice.toLocaleString()}</span>
              </div>
            </div>

            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs py-2 px-3 rounded-xl text-center font-bold">
                {successMsg}
              </div>
            )}

            {errorMsg && (
              <div className="bg-rose-50 border border-rose-100 text-rose-800 text-xs py-2 px-3 rounded-xl text-center font-bold">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-natural-primary hover:bg-[#4E4E37] font-bold py-3.5 px-4 rounded-xl text-xs text-white transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <span>EXECUTE SIGNAL PROTOCOL</span>
            </button>
          </form>
        </div>
      </div>

      {/* Active Trades Panel */}
      <div className="bg-white rounded-[32px] border border-natural-border p-5 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4.5 w-4.5 text-natural-primary" />
            <h3 className="text-sm font-serif font-black text-natural-dark">Active CFD Positions Portfolio</h3>
          </div>
          <span className="text-[10px] text-natural-muted font-bold uppercase tracking-wider">Broker Ledger</span>
        </div>

        {openPositions.length === 0 ? (
          <div className="text-center py-10 rounded-2xl bg-[#F4F5F0]/30 border border-dashed border-natural-accent text-natural-secondary">
            <p className="text-xs font-semibold">No active open trades. Execute a signal ticket above!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-natural-border text-[10px] text-natural-muted uppercase tracking-wider leading-10 font-bold">
                  <th className="pb-2">CONTRACT</th>
                  <th className="pb-2">DIRECTION</th>
                  <th className="pb-2 text-right">ENTRY</th>
                  <th className="pb-2 text-right">CURRENT RATE</th>
                  <th className="pb-2 text-right">MARGIN/LEVERAGE</th>
                  <th className="pb-2 text-right">RUNNING P&L</th>
                  <th className="pb-2 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F5F0] text-xs font-semibold text-natural-text">
                {openPositions.map((tr) => (
                  <tr key={tr.id} className="hover:bg-[#F4F5F0]/30 leading-[3rem]">
                    <td className="font-serif font-bold text-natural-dark uppercase">{tr.symbol}</td>
                    <td>
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                        tr.type === 'buy' 
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' 
                          : 'bg-rose-50 text-rose-800 border border-rose-100'
                      }`}>
                        {tr.type === 'buy' ? 'LONG (BUY)' : 'SHORT (SELL)'}
                      </span>
                    </td>
                    <td className="text-right font-mono text-natural-secondary">${tr.entryPrice.toLocaleString(undefined, { maximumFractionDigits: 4 })}</td>
                    <td className="text-right font-mono text-natural-dark">${tr.currentPrice.toLocaleString(undefined, { maximumFractionDigits: 4 })}</td>
                    <td className="text-right font-mono">
                      <span>${tr.amount.toLocaleString()}</span>
                      <span className="text-natural-muted text-[10px] pl-1 font-bold">({tr.leverage}x)</span>
                    </td>
                    <td className={`text-right font-mono font-black text-sm ${tr.pnl >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {tr.pnl >= 0 ? '+' : ''}${tr.pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => closeTrade(tr.id)}
                        className="bg-white hover:bg-rose-50 text-rose-800 font-bold px-3 py-1.5 rounded-lg text-[9px] tracking-wide border border-rose-200 hover:border-rose-400 transition-all shrink-0 uppercase cursor-pointer"
                      >
                        Secure Closure
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Realized P&L Performance Analytics */}
      <div className="bg-white rounded-[32px] border border-natural-border p-5 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4.5 w-4.5 text-natural-primary" />
            <h3 className="text-sm font-serif font-black text-natural-dark">Realized P&L Tracker (Last 10 Settled Positions)</h3>
          </div>
          <span className="text-[10px] text-natural-muted font-bold uppercase tracking-wider">Historical Analytics</span>
        </div>

        {closedPositions.length === 0 ? (
          <div className="text-center py-10 rounded-2xl bg-[#F4F5F0]/30 border border-dashed border-natural-accent text-natural-secondary flex flex-col items-center justify-center p-6">
            <Activity className="h-7 w-7 text-natural-muted/60 mb-2 animate-pulse" />
            <p className="text-xs font-serif font-bold text-natural-dark">No realized performance data yet</p>
            <p className="text-[10px] text-natural-muted mt-1 max-w-sm">
              Your closed trade profits and losses will be plotted here in real-time as soon as you settle your first positions.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4 text-xs font-bold font-mono text-natural-secondary">
              <div className="flex items-center gap-1.5 bg-[#F4F5F0] px-3 py-1.5 rounded-lg border border-natural-border">
                <span className="h-2 w-2 rounded-full bg-[#5A5A40]"></span>
                <span>Individual P&L</span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#F5F2E9] px-3 py-1.5 rounded-lg border border-natural-border">
                <span className="h-2 w-2 rounded-full bg-[#D4AF37]"></span>
                <span>Cumulative Net</span>
              </div>
            </div>
            
            <div className="h-72 w-full pr-4 select-none">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={pnlChartData}
                  margin={{ top: 15, right: 10, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#F4F5F0" vertical={false} />
                  <XAxis 
                    dataKey="tradeIndex" 
                    stroke="#8B8D7A" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={{ stroke: '#EAECE0' }}
                    fontWeight="bold"
                  />
                  <YAxis
                    stroke="#8B8D7A"
                    fontSize={10}
                    tickLine={false}
                    axisLine={{ stroke: '#EAECE0' }}
                    fontWeight="bold"
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#EAECE0', strokeWidth: 1.5 }} />
                  <ReferenceLine y={0} stroke="#D1D3C4" strokeWidth={1} strokeDasharray="5 5" />
                  <Line
                    type="monotone"
                    dataKey="pnl"
                    name="Individual P&L"
                    stroke="#5A5A40"
                    strokeWidth={2}
                    dot={{ r: 4, stroke: '#5A5A40', strokeWidth: 1.5, fill: '#FFF' }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="cumulativePnl"
                    name="Cumulative Progression"
                    stroke="#D4AF37"
                    strokeWidth={2.5}
                    dot={{ r: 4, stroke: '#D4AF37', strokeWidth: 1.5, fill: '#FFF' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Historic Closed Trades Registry */}
      {closedPositions.length > 0 && (
        <div className="bg-white rounded-[32px] border border-natural-border p-5 shadow-sm">
          <h3 className="text-sm font-serif font-black text-natural-dark mb-4">Historic Trade Settlement Audit</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-natural-border text-[10px] text-natural-muted uppercase tracking-wider leading-10 font-bold">
                  <th className="pb-2">CONTRACT REFERENCE</th>
                  <th className="pb-2">DIRECTION</th>
                  <th className="pb-2 text-right">ENTRY VALUE</th>
                  <th className="pb-2 text-right">SETTLED VALUE</th>
                  <th className="pb-2 text-right">SECURED VOLUME</th>
                  <th className="pb-2 text-right">SETTLED P&L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F5F0] text-xs font-semibold text-natural-secondary">
                {closedPositions.slice(0, 5).map((tr) => (
                  <tr key={tr.id} className="leading-10 text-[11px] hover:bg-[#F4F5F0]/10">
                    <td className="font-mono text-natural-dark font-medium">{tr.id} ({tr.symbol})</td>
                    <td className="uppercase">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        tr.type === 'buy' 
                          ? 'bg-emerald-50 text-emerald-800' 
                          : 'bg-rose-50 text-rose-800'
                      }`}>
                        {tr.type}
                      </span>
                    </td>
                    <td className="text-right font-mono">${tr.entryPrice.toLocaleString()}</td>
                    <td className="text-right font-mono text-natural-dark">${tr.closedPrice?.toLocaleString()}</td>
                    <td className="text-right font-mono">${tr.amount.toLocaleString()} ({tr.leverage}x)</td>
                    <td className={`text-right font-mono font-black ${tr.pnl >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {tr.pnl >= 0 ? '+' : ''}${tr.pnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
