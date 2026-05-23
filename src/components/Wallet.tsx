import React, { useState, useMemo } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, Copy, Check, UploadCloud, FileText, AlertCircle, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

const DEPOSIT_METHODS = [
  { id: 'btc', name: 'Bitcoin (BTC)', symbol: 'BTC', address: 'bc1qxy65zpgx6fzv9qcmnysdqhwnm0nds8y9gqs2s7', network: 'Bitcoin Mainnet', qr: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=bc1qxy65zpgx6fzv9qcmnysdqhwnm0nds8y9gqs2s7&color=2a2a1a&bgcolor=f4f5f0', status: 'operational' },
  { id: 'usdt', name: 'USDT (TRC20)', symbol: 'USDT', address: 'TXs92fK7saLpQrwBNZ10xmdrPyw481h90A', network: 'Tron Network', qr: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=TXs92fK7saLpQrwBNZ10xmdrPyw481h90A&color=2a2a1a&bgcolor=f4f5f0', status: 'network_issue' },
  { id: 'eth', name: 'Ethereum (ERC20)', symbol: 'ETH', address: '0x7a81fK7saLpQrwBN10xmdrPyw481lh89AeCF40d9', network: 'Ethereum Mainnet', qr: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=0x7a81fK7saLpQrwBN10xmdrPyw481lh89AeCF40d9&color=2a2a1a&bgcolor=f4f5f0', status: 'network_issue' },
  { id: 'wire', name: 'Corporate Bank Wire (UK)', symbol: 'GBP/USD', address: 'Sort Code: 20-45-78 | Acc: 70394512 | PILLAR YIELD LTD', network: 'FPS / SEPA / CHIPS', qr: '', status: 'network_issue' }
];

export const Wallet: React.FC = () => {
  const { user, deposit, withdraw, transactions } = useDashboard();
  const [activeSubTab, setActiveSubTab] = useState<'deposit' | 'withdraw'>('deposit');

  // Deposit Form State
  const [selectedMethodId, setSelectedMethodId] = useState('btc');
  const [depositAmount, setDepositAmount] = useState<number>(200);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [fileName, setFileName] = useState('');
  const [depositSuccess, setDepositSuccess] = useState('');
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Withdrawal Form State
  const [withdrawAmount, setWithdrawAmount] = useState<number>(500);
  const [withdrawMethod, setWithdrawMethod] = useState('usdt');
  const [withdrawDestination, setWithdrawDestination] = useState('');
  const [securityPin, setSecurityPin] = useState('');
  const [withdrawSuccess, setWithdrawSuccess] = useState('');
  const [withdrawError, setWithdrawError] = useState('');

  const currentMethod = useMemo(() => {
    return DEPOSIT_METHODS.find(m => m.id === selectedMethodId) || DEPOSIT_METHODS[0];
  }, [selectedMethodId]);

  // Copy wallet address
  const handleCopyAddress = () => {
    if (currentMethod) {
      navigator.clipboard.writeText(currentMethod.address);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  // Mock Receipt Upload file selection handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileUploaded(true);
      setFileName(file.name);
    }
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDepositSuccess('');

    if (currentMethod?.status === 'network_issue') {
      alert('This blockchain network is currently experiencing severe consensus latency. Please use Bitcoin (BTC) to complete your deposit.');
      return;
    }

    if (depositAmount <= 0) return;

    const isConfirmed = window.confirm(
      `CONFIRM DEPOSIT COMMIT:\nAre you sure you wish to submit a deposit of $${depositAmount.toLocaleString()} via ${currentMethod.name}?\n\nPlease ensure you have transferred the funds to the designated wallet address.`
    );
    if (!isConfirmed) return;

    try {
      // Trigger deposit transaction in pending flow
      await deposit(
        depositAmount,
        currentMethod.name,
        fileUploaded ? `Proof uploaded: ${fileName}` : 'Standard manual blockchain ledger'
      );

      setDepositSuccess(`Deposit protocol initiated. Securely polling blockchain Ledger for standard validations. Expected credit within 15 seconds!`);
      
      // Clear fields
      setFileUploaded(false);
      setFileName('');
    } catch (err: any) {
      setDepositSuccess('');
      alert(err.message || 'Deposit connection timed out. Please retry.');
    }
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError('');
    setWithdrawSuccess('');

    if (!user) return;

    if (withdrawAmount <= 0) {
      setWithdrawError('Please enter a valid amount.');
      return;
    }

    if (withdrawAmount > user.balance) {
      setWithdrawError('Insufficient available liquid balance to commit withdrawal.');
      return;
    }

    if (!withdrawDestination) {
      setWithdrawError('Destination payment coordinate or address is required.');
      return;
    }

    if (securityPin.length < 4) {
      setWithdrawError('Account security PIN validation required. Enter a 4-digit PIN.');
      return;
    }

    try {
      const res = await withdraw(withdrawAmount, withdrawMethod, `Cleared Payout to: ${withdrawDestination.slice(0, 16)}...`);
      if (res.success) {
        setWithdrawSuccess(res.message);
        // Confetti triggers!
        confetti({
          particleCount: 120,
          spread: 60,
          origin: { y: 0.6 }
        });
        // Reset withdrawal inputs
        setWithdrawDestination('');
        setSecurityPin('');
      } else {
        setWithdrawError(res.message);
      }
    } catch (err: any) {
      setWithdrawError(err.message || 'Withdrawal dispatch experienced an engineering timeout.');
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Wallet Banner Card */}
      <div className="bg-white p-6 rounded-[32px] border border-natural-border shadow-xs relative overflow-hidden">
        <div className="flex items-start gap-4 z-10">
          <div className="p-3 bg-[#EAECE0] border border-natural-accent rounded-xl text-natural-primary">
            <WalletIcon className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-natural-dark tracking-tight">Accounts {"&"} Ledger Settlement</h2>
            <p className="text-xs text-natural-secondary mt-1 font-semibold">
              Provision direct deposits easily or request instant audits for cash withdrawals securely.
            </p>
          </div>
        </div>
      </div>

      {/* Switcher tabs */}
      <div className="flex bg-[#EAECE0] p-1.5 rounded-xl border border-natural-border font-bold max-w-sm">
        <button
          onClick={() => setActiveSubTab('deposit')}
          className={`flex-1 text-center py-2.5 text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'deposit' 
              ? 'bg-natural-primary text-white shadow-xs' 
              : 'text-natural-secondary hover:text-natural-dark'
          }`}
        >
          <ArrowUpRight className="h-4 w-4" /> FUND DEPOSIT
        </button>
        <button
          onClick={() => setActiveSubTab('withdraw')}
          className={`flex-1 text-center py-2.5 text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'withdraw' 
              ? 'bg-natural-primary text-white shadow-xs' 
              : 'text-natural-secondary hover:text-natural-dark'
          }`}
        >
          <ArrowDownLeft className="h-4 w-4" /> WITHDRAWAL GATE
        </button>
      </div>

      {/* Form Area */}
      {activeSubTab === 'deposit' ? (
        // Deposit Sub Section
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Method Selection */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-bold text-natural-muted uppercase tracking-wider pl-1">Deposit Gateway</h3>
            <div className="space-y-2">
              {DEPOSIT_METHODS.map((method) => {
                const hasIssue = method.status === 'network_issue';
                return (
                  <button
                    key={method.id}
                    onClick={() => {
                      setSelectedMethodId(method.id);
                      setDepositSuccess('');
                    }}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                      selectedMethodId === method.id
                        ? hasIssue
                          ? 'bg-rose-50 border-rose-200 text-rose-950 shadow-xs'
                          : 'bg-natural-bg border-natural-primary text-natural-dark shadow-xs'
                        : 'bg-white border-natural-border hover:border-[#D1D3C4] text-natural-secondary hover:text-natural-dark'
                    }`}
                  >
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-xs block">{method.name}</span>
                        {hasIssue && (
                          <span className="bg-rose-100 border border-rose-300 text-rose-800 text-[8px] font-black uppercase tracking-wider px-1 py-0.5 rounded">
                            Network Issue
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-natural-muted block font-bold mt-0.5">{method.network}</span>
                    </div>
                    <span className={`font-bold text-xs font-mono ${hasIssue ? 'text-rose-700' : ''}`}>{method.symbol}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Actions and Details */}
          <div className="lg:col-span-3 bg-white rounded-[32px] border border-natural-border p-5 shadow-sm space-y-5">
            {currentMethod?.status === 'network_issue' ? (
              <div className="bg-rose-50 border border-rose-100 p-5 rounded-2xl flex gap-3.5 select-none items-start">
                <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-serif font-black text-rose-900 text-xs uppercase tracking-wide">Network Connection Down</h4>
                  <p className="text-[11px] text-rose-700 leading-relaxed font-semibold">
                    The requested gateway <span className="font-bold">{currentMethod.name}</span> is currently down due to network latency and node synchronization errors. Manual asset allocation is temporarily blocked on this route for security.
                  </p>
                  <p className="text-[10px] text-rose-600/90 font-bold italic pt-1">
                    *Please allocate your deposit via the Bitcoin (BTC) mainnet gateway.
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-sm font-serif font-bold text-natural-dark uppercase tracking-wider">Instructions to send Funds</h3>
                <p className="text-xs text-natural-secondary leading-relaxed mt-1 font-semibold">
                  Scan the secure cryptographic QR coordinate below or copy the wallet address, then transfer assets using your secure decentralized web wallets.
                </p>
              </div>
            )}

            {/* Address Display Panel */}
            <div className={`grid grid-cols-1 md:grid-cols-3 gap-5 items-center bg-[#F4F5F0] p-4 rounded-2xl border border-natural-border transition-all ${
              currentMethod?.status === 'network_issue' ? 'opacity-40 pointer-events-none' : ''
            }`}>
              {/* QR Image */}
              {currentMethod.qr ? (
                <div className="col-span-1 bg-white p-2 rounded-xl flex items-center justify-center w-28 h-28 mx-auto xl:w-32 xl:h-32 shadow-inner">
                  <img src={currentMethod.qr} alt="Address QR Code" className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="col-span-1 border border-natural-border bg-white rounded-xl flex flex-col justify-center items-center p-3 h-28 text-center text-[10px] text-natural-muted font-bold leading-normal">
                  <FileText className="h-5 w-5 mb-1.5 text-natural-primary" /> UK Banking Wire
                </div>
              )}

              {/* Copy address logic */}
              <div className="col-span-2 space-y-2.5">
                <div>
                  <span className="text-[10px] text-natural-muted font-bold block uppercase tracking-wider">{currentMethod.name} Secure Gate</span>
                  <span className="text-[11px] font-mono text-natural-dark select-all break-all block mt-1 font-bold leading-relaxed">
                    {currentMethod.address}
                  </span>
                </div>
                <button
                  onClick={handleCopyAddress}
                  disabled={currentMethod?.status === 'network_issue'}
                  className="bg-white border border-natural-border hover:bg-natural-bg text-natural-dark font-bold px-3 py-1.5 rounded-lg text-[10px] tracking-wide flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedAddress ? <Check className="h-3.5 w-3.5 text-emerald-700" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedAddress ? 'Address Copied securely' : 'Copy Vault Address'}</span>
                </button>
              </div>
            </div>

            {/* Proof Submission form */}
            <form onSubmit={handleDepositSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-natural-muted font-bold uppercase tracking-wider">Value to Register (USD)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-natural-secondary font-black font-semibold">$</span>
                    <input
                      type="number"
                      required
                      min={200}
                      disabled={currentMethod?.status === 'network_issue'}
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(Number(e.target.value))}
                      className={`w-full font-bold font-mono bg-white border border-[#D1D3C4] focus:border-natural-primary focus:ring-1 focus:ring-natural-primary rounded-xl py-2 pl-7 pr-4 text-xs text-natural-dark outline-none ${
                        currentMethod?.status === 'network_issue' ? 'bg-[#FAFAF7] cursor-not-allowed text-natural-muted' : ''
                      }`}
                    />
                  </div>
                  <span className="text-[9px] text-natural-muted font-bold">Minimum direct deposit is $200</span>
                </div>

                {/* File Upload drag area */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-natural-muted font-bold uppercase tracking-wider">Proof Receipt Image (Optional)</label>
                  <div className={`relative border border-dashed border-[#D1D3C4] hover:border-natural-primary rounded-xl p-2.5 bg-white flex items-center gap-3 select-none cursor-pointer ${
                    currentMethod?.status === 'network_issue' ? 'opacity-55 cursor-not-allowed pointer-events-none' : ''
                  }`}>
                    <input
                      type="file"
                      id="proof_upload"
                      accept="image/*"
                      disabled={currentMethod?.status === 'network_issue'}
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <UploadCloud className="h-5 w-5 text-natural-secondary shrink-0" />
                    <div className="min-w-0 font-semibold">
                      <span className="text-[10.5px] font-bold text-natural-dark block truncate">
                        {fileUploaded ? fileName : 'Upload Proof Receipt'}
                      </span>
                      <span className="text-[9px] text-[#8B8D7A] block truncate">Drag jpeg or trigger uploader</span>
                    </div>
                  </div>
                </div>
              </div>

              {depositSuccess && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs py-2 px-3 rounded-xl text-center font-bold">
                  {depositSuccess}
                </div>
              )}

              <button
                type="submit"
                disabled={currentMethod?.status === 'network_issue'}
                className={`w-full font-bold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer ${
                  currentMethod?.status === 'network_issue'
                    ? 'bg-[#EAECE0] border border-[#D1D3C4] text-natural-muted cursor-not-allowed opacity-70'
                    : 'bg-natural-primary hover:bg-[#4E4E37] text-white'
                }`}
              >
                {currentMethod?.status === 'network_issue' ? (
                  <>
                    <AlertCircle className="h-4 w-4" />
                    <span>GATEWAY OFFLINE - CHOOSE BTC</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>CONFIRM COMMIT PAY</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      ) : (
        // Withdrawal Sub Section
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-bold text-natural-muted uppercase tracking-wider pl-1 font-semibold">Liquid Balances</h3>
            <div className="bg-white p-5 rounded-[32px] border border-natural-border space-y-4 shadow-sm">
              <div>
                <span className="text-[10px] text-natural-muted font-bold block uppercase tracking-wider">Total Available Cash</span>
                <span className="text-2xl font-serif font-black text-natural-dark mt-1 block tracking-tight">
                  ${user.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[9px] text-[#8B8D7A] font-bold block mt-1">Pending wire validations excluded.</span>
              </div>
              
              <div className="border-t border-natural-border pt-3 flex gap-2 justify-start items-start text-[10.5px] leading-relaxed text-natural-secondary select-none font-semibold">
                <AlertCircle className="h-4.5 w-4.5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-serif font-bold text-natural-dark block mb-0.5">FCA Custodial Audits</span>
                  Withdrawals match direct liquidity settlement checks. Security clearances require up to 30 seconds for standard blockchain block generation.
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 bg-white rounded-[32px] border border-natural-border p-5 shadow-sm">
            <h3 className="text-sm font-serif font-bold text-natural-dark uppercase tracking-wider mb-4">Request Withdrawal Ticket</h3>
            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Method selector inside withdraw */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-natural-muted font-bold uppercase tracking-wider select-none">Asset Payout Method</label>
                  <select
                    value={withdrawMethod}
                    onChange={(e) => setWithdrawMethod(e.target.value)}
                    className="w-full bg-white border border-[#D1D3C4] focus:border-natural-primary focus:ring-1 focus:ring-natural-primary rounded-xl py-2.5 px-3 text-xs text-natural-dark outline-none font-bold transition-all cursor-pointer"
                  >
                    <option value="usdt">USDT - Tron Blockchain (TRC20)</option>
                    <option value="btc">Bitcoin (BTC) Address</option>
                    <option value="eth">Ethereum (ERC20) Wallet</option>
                    <option value="wire">Bank Wire SWIFT Transfer</option>
                  </select>
                </div>

                {/* Amount to take */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-natural-muted font-bold uppercase tracking-wider block">Amount (USD)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-natural-secondary font-black font-semibold font-mono">$</span>
                    <input
                      type="number"
                      required
                      min={10}
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                      className="w-full font-bold font-mono bg-white border border-[#D1D3C4] focus:border-natural-primary focus:ring-1 focus:ring-natural-primary rounded-xl py-2 pl-7 pr-4 text-xs text-natural-dark outline-none"
                    />
                  </div>
                  <div className="flex justify-between text-[9px] text-[#7D7F6E] font-bold">
                    <span onClick={() => setWithdrawAmount(Math.floor(user.balance))} className="hover:text-natural-primary underline cursor-pointer">ALL AVAILABLE CASH</span>
                  </div>
                </div>
              </div>

              {/* Destination address */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-natural-muted font-bold uppercase tracking-wider block">Destination Coordinate or Purse Address</label>
                <input
                  type="text"
                  required
                  value={withdrawDestination}
                  onChange={(e) => setWithdrawDestination(e.target.value)}
                  placeholder="e.g. TXs92fK7saLpQrwBNZ10xmdrPyw481h90A"
                  className="w-full bg-white border border-[#D1D3C4] focus:border-natural-primary focus:ring-1 focus:ring-natural-primary rounded-xl py-2.5 px-3.5 text-xs text-natural-dark outline-none transition-all placeholder-[#9A9C8B] font-mono font-bold"
                />
              </div>

              {/* Safety PIN */}
              <div className="space-y-1.5 max-w-[180px]">
                <label className="text-[10px] text-natural-muted font-bold uppercase tracking-wider block">4-Digit Security PIN</label>
                <input
                  type="password"
                  required
                  maxLength={4}
                  value={securityPin}
                  onChange={(e) => setSecurityPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  className="w-full bg-white border border-[#D1D3C4] focus:border-natural-primary focus:ring-1 focus:ring-natural-primary rounded-xl py-2.5 px-3.5 text-center text-sm font-black tracking-[0.6em] text-natural-dark outline-none transition-all placeholder-[#9A9C8B] font-mono"
                />
              </div>

              {withdrawSuccess && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs py-2 px-3 rounded-xl text-center font-bold">
                  {withdrawSuccess}
                </div>
              )}

              {withdrawError && (
                <div className="bg-rose-50 border border-rose-100 text-rose-800 text-xs py-2 px-3 rounded-xl text-center font-bold">
                  {withdrawError}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-natural-primary hover:bg-[#4E4E37] text-white font-bold py-3.5 px-4 rounded-xl text-xs transition-colors text-center flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>INITIATE CAPITAL REPATRIATION</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
