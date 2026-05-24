import React, { useState, useEffect } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { 
  Settings, 
  Check, 
  X, 
  ShieldAlert, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Users, 
  Search, 
  LogIn, 
  ChevronDown, 
  ChevronUp, 
  Database,
  Sliders
} from 'lucide-react';
import { User, Transaction } from '../types';

export const AdminPanel: React.FC = () => {
  const { 
    user, 
    transactions, 
    adminUpdateUser, 
    adminApproveTransaction, 
    adminRejectTransaction, 
    triggerMarketTick,
    isSandbox,
    switchSandboxUser,
    createSandboxUser,
    deleteSandboxUser,
    getSandboxUsers,
    logout,
    impersonatedUid,
    setImpersonatedUid,
    allUsers
  } = useDashboard();

  const [isOpen, setIsOpen] = useState(false);
  const [adminTab, setAdminTab] = useState<'adjust' | 'directory'>('adjust');
  
  // Quick Adjust inputs (active user)
  const [balanceInput, setBalanceInput] = useState('');
  const [profitsInput, setProfitsInput] = useState('');
  const [rfEarnedInput, setRfEarnedInput] = useState('');

  // Register user form inputs
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [submittingUser, setSubmittingUser] = useState(false);
  const [userError, setUserError] = useState('');

  // Search & Selector in directory
  const [searchQuery, setSearchQuery] = useState('');
  const [usersList, setUsersList] = useState<User[]>([]);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<string | null>(null);

  // Edit fields for the selected user in directory
  const [editBalance, setEditBalance] = useState('');
  const [editProfits, setEditProfits] = useState('');
  const [editReferral, setEditReferral] = useState('');

  // Password-based gate states
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(
    () => sessionStorage.getItem('admin_authenticated') === 'true'
  );
  const [passwordAttempt, setPasswordAttempt] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  if (!user) return null;

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const adminPassword = (import.meta as any).env.VITE_ADMIN_PASSWORD || "Blac&N{0}@er123)x";
    if (passwordAttempt === adminPassword) {
      setIsAdminAuthenticated(true);
      sessionStorage.setItem('admin_authenticated', 'true');
      setLoginError('');
      setPasswordAttempt('');
    } else {
      setLoginError('Invalid Administrator Security Key');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem('admin_authenticated');
  };

  const pendingTxs = transactions.filter(t => t.status === 'pending');

  const refreshUsersList = () => {
    if (isSandbox) {
      setUsersList(getSandboxUsers());
    } else {
      setUsersList(allUsers);
    }
  };

  useEffect(() => {
    if (isOpen) {
      refreshUsersList();
    }
  }, [isOpen, user, allUsers, isSandbox]);

  // Active User Adjustments
  const handleUpdateBalance = (e: React.FormEvent) => {
    e.preventDefault();
    if (balanceInput) {
      const parsed = parseFloat(balanceInput);
      const isConfirmed = window.confirm(`CONFIRM BALANCE ACTION:\nAre you sure you want to alter the main account balance to $${parsed.toLocaleString()}?`);
      if (isConfirmed) {
        adminUpdateUser({ balance: parsed });
        setBalanceInput('');
      }
    }
  };

  const handleUpdateProfits = (e: React.FormEvent) => {
    e.preventDefault();
    if (profitsInput) {
      const parsed = parseFloat(profitsInput);
      const isConfirmed = window.confirm(`CONFIRM PROFITS ACTION:\nAre you sure you want to alter the recorded yields profits to $${parsed.toLocaleString()}?`);
      if (isConfirmed) {
        adminUpdateUser({ profits: parsed });
        setProfitsInput('');
      }
    }
  };

  const handleUpdateReferral = (e: React.FormEvent) => {
    e.preventDefault();
    if (rfEarnedInput) {
      const parsed = parseFloat(rfEarnedInput);
      const isConfirmed = window.confirm(`CONFIRM REFERRAL INCOME ACTION:\nAre you sure you want to alter the client's referral balance to $${parsed.toLocaleString()}?`);
      if (isConfirmed) {
        adminUpdateUser({ referralsEarned: parsed });
        setRfEarnedInput('');
      }
    }
  };

  const handleInstantVerificationToggle = () => {
    const nextStatus = user.verificationStatus === 'verified' ? 'unverified' : 'verified';
    adminUpdateUser({ verificationStatus: nextStatus });
  };

  // Direct edit functions for other user accounts
  const handleDirectUpdateUser = async (uid: string, fields: Partial<User>) => {
    try {
      if (isSandbox) {
        const savedUsers = JSON.parse(localStorage.getItem('sandbox_users_db') || '{}');
        const emailKey = Object.keys(savedUsers).find(email => savedUsers[email].id === uid);
        
        if (emailKey) {
          const uProfile = savedUsers[emailKey];
          const updatedProfile = { ...uProfile, ...fields };
          savedUsers[emailKey] = updatedProfile;
          localStorage.setItem('sandbox_users_db', JSON.stringify(savedUsers));
          
          // If updating the active user email, reflect in context state immediately!
          if (user.id === uid) {
            adminUpdateUser(fields);
          }
          
          refreshUsersList();
        } else {
          alert("Account match not found in local sandbox storage index.");
        }
      } else {
        const { doc, updateDoc } = await import('firebase/firestore');
        const { db } = await import('../firebase');
        await updateDoc(doc(db, 'users', uid), fields);
        refreshUsersList();
      }
    } catch (err: any) {
      console.error(err);
      alert("Failed direct storage commit: " + err.message);
    }
  };

  const handleToggleExpandUser = (target: User) => {
    if (selectedUserForEdit === target.id) {
      setSelectedUserForEdit(null);
      setEditBalance('');
      setEditProfits('');
      setEditReferral('');
    } else {
      setSelectedUserForEdit(target.id);
      setEditBalance(target.balance.toString());
      setEditProfits((target.profits || 0).toString());
      setEditReferral((target.referralsEarned || 0).toString());
    }
  };

  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newName) {
      setUserError('Name and email are required to pre-seed the profile.');
      return;
    }
    setSubmittingUser(true);
    setUserError('');
    try {
      if (isSandbox) {
        createSandboxUser(newEmail, newName);
      } else {
        const { doc, setDoc } = await import('firebase/firestore');
        const { db } = await import('../firebase');
        const newUid = 'u_cl_' + Math.random().toString(36).substring(2, 11);
        const newUser: User = {
          id: newUid,
          name: newName,
          email: newEmail.toLowerCase().trim(),
          balance: 0.00,
          profits: 0.00,
          totalWithdrawn: 0.00,
          activeInvestmentsAmount: 0.00,
          referralsEarned: 0.00,
          referralCode: 'PY-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
          verificationStatus: 'unverified',
          joinedAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'users', newUid), newUser);
      }
      setNewEmail('');
      setNewName('');
      refreshUsersList();
      alert(isSandbox ? 'Simulated customer account registered!' : 'New customer profile initialized in Cloud Firestore databases!');
    } catch (err: any) {
      setUserError(err.message || 'Failed registration.');
    } finally {
      setSubmittingUser(false);
    }
  };

  const handleDeleteUserClick = async (uid: string, email: string) => {
    const confirmDelete = window.confirm(
      `DANGER ZONE: DELETE ACCOUNT\nAre you sure you want to permanently erase the simulated account "${email}"?`
    );
    if (confirmDelete) {
      if (isSandbox) {
        deleteSandboxUser(uid);
        if (user.id === uid) {
          const remaining = getSandboxUsers();
          if (remaining.length > 0) {
            switchSandboxUser(remaining[0].id);
          } else {
            logout();
          }
        } else {
          refreshUsersList();
          setSelectedUserForEdit(null);
        }
      } else {
        const { doc, deleteDoc } = await import('firebase/firestore');
        const { db } = await import('../firebase');
        try {
          await deleteDoc(doc(db, 'users', uid));
          if (user.id === uid) {
            setImpersonatedUid(null);
          }
          refreshUsersList();
          setSelectedUserForEdit(null);
        } catch (err: any) {
          alert("Erase failed: " + err.message);
        }
      }
    }
  };

  // Searching users
  const filteredUsers = usersList.filter(u => {
    const query = searchQuery.toLowerCase();
    return u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query);
  });

  return (
    <>
      {/* Floating Gear Button (Moved to left-6 to prevent overlapping with the WhatsApp Widget at right-6) */}
      <div className="fixed bottom-6 left-6 z-50 flex items-center gap-2 select-none group">
        <button
          onClick={() => setIsOpen(prev => !prev)}
          className="h-12 w-12 rounded-full bg-[#5A5A40] border border-natural-accent flex items-center justify-center text-white hover:bg-[#4E4E37] hover:scale-105 shadow-md transition-all duration-300 cursor-pointer animate-pulse"
          title="Administrative Controls Portal"
          id="dev-panel-trigger"
        >
          <Settings className="h-5.5 w-5.5 group-hover:rotate-45 transition-transform" />
          {pendingTxs.length > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-rose-700 border-2 border-white text-[10px] font-black text-white flex items-center justify-center animate-bounce">
              {pendingTxs.length}
            </span>
          )}
        </button>
        <span className="bg-[#12120A] text-white text-[9px] font-mono font-black py-1.5 px-3 rounded-xl border border-natural-accent shadow-md opacity-90 group-hover:opacity-100 transition-opacity uppercase tracking-wider">
        </span>
      </div>

      {/* Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-natural-dark/30 backdrop-blur-xs" 
            onClick={() => setIsOpen(false)} 
          />

          {/* Panel content */}
          <div className="relative w-full max-w-md bg-white border-l border-natural-border h-full shadow-2xl z-10 flex flex-col justify-between overflow-y-auto outline-none select-none">
            <div className="p-6 space-y-5">
              {/* Header */}
              <div className="flex justify-between items-center border-b border-natural-border pb-3.5">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-[#5A5A40]" />
                  <div>
                    <h4 className="text-sm font-serif font-black text-natural-dark uppercase tracking-wider">Built-In Admin Panel</h4>
                    <p className="text-[9px] text-natural-muted font-bold font-mono">Operations Console & Swappable Database</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {isAdminAuthenticated && (
                    <button 
                      onClick={handleAdminLogout}
                      className="p-1 px-2 text-rose-805 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg text-[9px] font-mono font-black uppercase cursor-pointer transition-colors"
                      title="Lock Admin Control Access"
                    >
                      Lock Panel
                    </button>
                  )}
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-1 px-2.5 hover:bg-[#F4F5F0] text-natural-secondary hover:text-natural-dark border border-transparent hover:border-natural-border rounded-lg text-[10px] font-mono font-black uppercase cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>

              {!isAdminAuthenticated ? (
                /* Login screen */
                <form onSubmit={handleAdminLogin} className="space-y-6 py-6 animate-fade-in">
                  <div className="text-center space-y-2 select-none">
                    <div className="h-14 w-14 rounded-full bg-[#5A5A40]/10 flex items-center justify-center text-[#5A5A40] mx-auto border border-[#5A5A40]/30 shadow-inner animate-pulse">
                      <ShieldAlert className="h-7 w-7" />
                    </div>
                    <h5 className="text-[12px] uppercase font-black tracking-widest text-[#5A5A40] font-sans">Administrative Access Gate</h5>
                    <p className="text-[10.5px] font-semibold text-natural-muted leading-relaxed max-w-[280px] mx-auto pb-1">
                      This panel contains core security override capabilities. Enter the security passphrase to unlock.
                    </p>
                  </div>

                  <div className="space-y-3 font-bold text-xs select-none">
                    <div className="space-y-1.5">
                      <label className="text-[9px] text-natural-muted uppercase font-black tracking-widest font-mono">Operations Passphrase</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••••••••••"
                          value={passwordAttempt}
                          onChange={(e) => setPasswordAttempt(e.target.value)}
                          className="w-full bg-white border border-[#D1D3C4] focus:border-natural-primary focus:ring-1 focus:ring-natural-primary rounded-xl py-2.5 px-4 text-xs text-natural-dark outline-none font-bold placeholder:font-normal"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(prev => !prev)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase font-mono text-[#5A5A40] opacity-80 hover:opacity-100 cursor-pointer"
                        >
                          {showPassword ? 'Hide' : 'Show'}
                        </button>
                      </div>
                    </div>

                    {loginError && (
                      <p className="text-[10px] text-rose-750 font-extrabold font-mono text-center bg-rose-50 border border-rose-100 rounded-lg p-2.5 animate-shake">
                        ⚠️ {loginError}
                      </p>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-[#5A5A40] hover:bg-[#4E4E37] text-white py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md mt-2 border border-natural-accent flex items-center justify-center gap-2"
                    >
                      <LogIn className="h-4 w-4" />
                      <span>Unlock Dev Dashboard</span>
                    </button>
                  </div>
                </form>
              ) : (
                <>

              {/* Environment Status Info banner */}
              <div className="bg-[#F4F5F0] text-natural-secondary border border-natural-border rounded-2xl p-3.5 space-y-1.5 text-xs select-none font-semibold">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[10px] uppercase font-black text-natural-dark flex items-center gap-1.5">
                    <span className={"h-2.5 w-2.5 rounded-full " + (isSandbox ? "bg-emerald-600 animate-pulse" : "bg-blue-600")}></span>
                    Mode: {isSandbox ? 'Local Sandbox' : 'Cloud Firebase'}
                  </span>
                  <span className="text-[9px] bg-natural-dark/5 px-2 py-0.5 rounded font-black font-mono">
                    Active UUID: {user.id.slice(0, 8)}
                  </span>
                </div>
                <p className="text-[10.5px] leading-relaxed text-[#7D7F6E]">
                  {isSandbox ? (
                    <span>
                      Because you logged in using a fallback/demo profile, you are interacting with <strong>Local Browser Storage</strong>. Data is isolated offline here. Balance and customer directory overrides are immediately editable!
                    </span>
                  ) : (
                    <span>
                      You are authenticated in <strong>Cloud Firebase</strong>. Database updates are synced on-screen. To test multiple distinct accounts, register other credentials or swap to sandbox storage falls!
                    </span>
                  )}
                </p>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-natural-border font-mono text-[10px] font-black uppercase tracking-wider">
                <button
                  onClick={() => setAdminTab('adjust')}
                  className={`flex-1 py-2.5 text-center border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    adminTab === 'adjust'
                      ? 'border-[#5A5A40] text-natural-dark font-black'
                      : 'border-transparent text-natural-muted hover:text-natural-secondary'
                  }`}
                >
                  <Sliders className="h-3.5 w-3.5" />
                  <span>Active Profile</span>
                </button>
                <button
                  onClick={() => setAdminTab('directory')}
                  className={`flex-1 py-2.5 text-center border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    adminTab === 'directory'
                      ? 'border-[#5A5A40] text-natural-dark font-black'
                      : 'border-transparent text-natural-muted hover:text-natural-secondary'
                  }`}
                >
                  <Users className="h-3.5 w-3.5" />
                  <span>Accounts Directory ({usersList.length})</span>
                </button>
              </div>

              {/* Tab Content 1: Active Profile quick adjustments */}
              {adminTab === 'adjust' && (
                <div className="space-y-5 animate-fade-in">
                  {user.email !== 'admin@coinvest.cc' ? (
                    <div className="bg-amber-50 text-amber-900 border border-amber-200 rounded-xl p-3.5 text-[10.5px] leading-relaxed font-semibold space-y-2.5">
                      <span className="block text-amber-850">
                        🕵️ <strong>IMPERSONATION ACTIVE:</strong> You are currently viewing and editing the portfolio of client <strong className="underline text-natural-dark">{user.name} ({user.email})</strong>.
                      </span>
                      <button
                        onClick={() => {
                          if (window.confirm("CONFIRM RETURN:\nAre you sure you want to exit live client view and return to the master administrator panel?")) {
                            if (isSandbox) {
                              switchSandboxUser('admin_u_sd');
                            } else {
                              setImpersonatedUid(null);
                            }
                          }
                        }}
                        className="w-full bg-[#AA8226] text-white hover:bg-[#856317] font-sans font-black py-2 px-3 rounded-lg text-[9.5px] tracking-wider transition-colors cursor-pointer uppercase flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <LogIn className="h-3 w-3" />
                        <span>Exit & Return to Master Admin</span>
                      </button>
                    </div>
                  ) : (
                    <div className="bg-[#F5F2E9] text-natural-secondary border border-[#EAECE0] rounded-xl p-3 text-[10.5px] leading-relaxed font-semibold">
                      You are configuring ledger attributes for: <strong className="text-natural-dark underline">{user.name} ({user.email})</strong>
                    </div>
                  )}

                  {/* Real-time Ticker trigger */}
                  <div className="space-y-2">
                    <h5 className="text-[10px] text-natural-muted uppercase font-black tracking-wider font-mono">Engine ticks</h5>
                    <button
                      onClick={triggerMarketTick}
                      className="w-full bg-[#5A5A40] hover:bg-[#4E4E37] text-white font-black py-2.5 px-4 rounded-xl text-[11px] transition-colors flex items-center justify-center gap-2 border border-natural-accent font-mono cursor-pointer shadow-xs uppercase"
                    >
                      <RefreshCw className="h-4 w-4 text-white animate-spin-slow" />
                      <span>Trigger Market Interval (+CFD Yields)</span>
                    </button>
                  </div>

                  {/* Pending Approvals */}
                  <div className="space-y-3">
                    <h5 className="text-[10px] text-natural-muted uppercase font-black tracking-wider font-mono flex justify-between items-center">
                      <span>Ref Approvals Review</span>
                      {pendingTxs.length > 0 && <span className="bg-rose-700 text-white text-[9px] px-2 py-0.5 rounded-full font-black animate-pulse">{pendingTxs.length} pending</span>}
                    </h5>

                    {pendingTxs.length === 0 ? (
                      <p className="text-[10.5px] text-[#8B8D7A] bg-natural-bg/40 p-4 border border-natural-border text-center rounded-xl font-bold font-mono uppercase">
                        No transactions pending review.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {pendingTxs.map((tx) => (
                          <div key={tx.id} className="bg-[#F4F5F0]/65 border border-natural-border p-3 rounded-2xl flex items-center justify-between gap-4 font-semibold">
                            <div className="min-w-0">
                              <span className={`text-[8.5px] font-black uppercase px-2 py-0.5 rounded-md ${tx.type === 'deposit' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
                                {tx.type}
                              </span>
                              <span className="text-[11px] font-mono text-natural-dark font-black block mt-1.5">${tx.amount.toLocaleString()} ({tx.method})</span>
                              <span className="text-[9.5px] text-natural-muted block truncate mt-0.5" title={tx.details}>{tx.details}</span>
                            </div>
                            <div className="flex gap-1 shrink-0">
                              <button
                                onClick={() => {
                                  const isConfirmed = window.confirm(`CONFIRM TRANSACTION APPROVAL:\nAre you sure you want to approve this simulated ${tx.type} request of $${tx.amount.toLocaleString()}?\nThis will adjust raw account funds accordingly.`);
                                  if (isConfirmed) {
                                    adminApproveTransaction(tx.id);
                                  }
                                }}
                                className="h-8 w-8 bg-emerald-800 hover:bg-emerald-900 rounded-lg flex items-center justify-center text-white select-none cursor-pointer"
                                title="Approve & Credit Balance"
                              >
                                <Check className="h-4 w-4 stroke-[3]" />
                              </button>
                              <button
                                onClick={() => {
                                  const isConfirmed = window.confirm(`CONFIRM TRANSACTION REJECTION:\nAre you sure you want to reject this simulated ${tx.type} request of $${tx.amount.toLocaleString()}?`);
                                  if (isConfirmed) {
                                    adminRejectTransaction(tx.id);
                                  }
                                }}
                                className="h-8 w-8 bg-rose-800 hover:bg-rose-900 rounded-lg flex items-center justify-center text-white select-none cursor-pointer"
                                title="Reject & Fail"
                              >
                                <X className="h-4 w-4 stroke-[2.5]" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Active Profile Balance Overwrites */}
                  <div className="space-y-3.5 pt-4 border-t border-natural-border">
                    <h5 className="text-[10px] text-natural-muted uppercase font-black tracking-wider font-mono">Main Account Adjustments</h5>

                    {/* Overwrite balance */}
                    <form onSubmit={handleUpdateBalance} className="flex gap-2 font-bold">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[10px] text-natural-secondary font-black">$</span>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Overwrite active balance"
                          value={balanceInput}
                          onChange={(e) => setBalanceInput(e.target.value)}
                          className="w-full bg-white border border-[#D1D3C4] focus:border-natural-primary focus:ring-1 focus:ring-natural-primary rounded-xl py-2 pl-6 pr-3 text-xs text-natural-dark outline-none font-bold"
                        />
                      </div>
                      <button type="submit" className="bg-[#EAECE0] hover:bg-[#D1D3C4] px-3.5 py-2 text-xs font-black rounded-xl text-natural-dark border border-natural-accent transition-colors uppercase cursor-pointer shrink-0">
                        Set
                      </button>
                    </form>

                    {/* Overwrite profits */}
                    <form onSubmit={handleUpdateProfits} className="flex gap-2 font-bold">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[10px] text-natural-secondary font-black">$</span>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Overwrite yield profits"
                          value={profitsInput}
                          onChange={(e) => setProfitsInput(e.target.value)}
                          className="w-full bg-white border border-[#D1D3C4] focus:border-natural-primary focus:ring-1 focus:ring-natural-primary rounded-xl py-2 pl-6 pr-3 text-xs text-natural-dark outline-none font-bold"
                        />
                      </div>
                      <button type="submit" className="bg-[#EAECE0] hover:bg-[#D1D3C4] px-3.5 py-2 text-xs font-black rounded-xl text-natural-dark border border-natural-accent transition-colors uppercase cursor-pointer shrink-0">
                        Set
                      </button>
                    </form>

                    {/* Overwrite Referral Earned */}
                    <form onSubmit={handleUpdateReferral} className="flex gap-2 font-bold">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[10px] text-natural-secondary font-black">$</span>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Overwrite referral earnings"
                          value={rfEarnedInput}
                          onChange={(e) => setRfEarnedInput(e.target.value)}
                          className="w-full bg-white border border-[#D1D3C4] focus:border-natural-primary focus:ring-1 focus:ring-natural-primary rounded-xl py-2 pl-6 pr-3 text-xs text-natural-dark outline-none font-bold"
                        />
                      </div>
                      <button type="submit" className="bg-[#EAECE0] hover:bg-[#D1D3C4] px-3.5 py-2 text-xs font-black rounded-xl text-natural-dark border border-natural-accent transition-colors uppercase cursor-pointer shrink-0">
                        Set
                      </button>
                    </form>

                    {/* KYC override button */}
                    <button
                      type="button"
                      onClick={handleInstantVerificationToggle}
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-black bg-[#F4F5F0] border border-natural-border hover:bg-[#EAECE0] transition-colors text-natural-dark uppercase mt-2 cursor-pointer flex justify-between items-center"
                    >
                      <span>KYC Verification level</span>
                      <strong className={`px-2 py-0.5 rounded font-black text-[10px] ${user.verificationStatus === 'verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-[#5A5A40]'}`}>
                        {user.verificationStatus.toUpperCase()}
                      </strong>
                    </button>
                  </div>
                </div>
              )}

              {/* Tab Content 2: Swappable Accounts Database */}
              {adminTab === 'directory' && (
                <div className="space-y-4 animate-fade-in font-semibold">
                  {/* Create customer profile form */}
                  {isSandbox ? (
                    <form onSubmit={handleCreateUserSubmit} className="bg-[#F4F5F0]/50 border border-natural-border rounded-2xl p-4 space-y-3 font-semibold text-xs">
                      <h6 className="text-[10px] text-natural-muted uppercase font-black tracking-wider flex items-center gap-1">
                        <Plus className="h-3.5 w-3.5 text-natural-dark" />
                        <span>Instantiate Customer Profile</span>
                      </h6>
                      {userError && <p className="text-[10px] text-rose-700 font-extrabold">{userError}</p>}
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Client Name"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          className="bg-white border border-[#D1D3C4] focus:border-natural-primary focus:ring-1 focus:ring-natural-primary rounded-xl py-2 px-3 text-xs text-natural-dark outline-none font-bold placeholder:font-normal"
                        />
                        <input
                          type="email"
                          placeholder="Client Email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          className="bg-white border border-[#D1D3C4] focus:border-natural-primary focus:ring-1 focus:ring-natural-primary rounded-xl py-2 px-3 text-xs text-natural-dark outline-none font-bold placeholder:font-normal"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={submittingUser}
                        className="w-full bg-[#5A5A40] hover:bg-[#4E4E37] text-white py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>{submittingUser ? 'Registering...' : 'Instantiate Customer Wallet'}</span>
                      </button>
                    </form>
                  ) : (
                    <div className="bg-[#F5F2E9]/70 border border-[#EAECE0] p-3 rounded-2xl text-[10px] leading-relaxed text-[#7D7F6E]">
                      <strong>MOCK MANAGER NOTE:</strong> Customer generation and account-swapping are fully optimized under <strong>Local SandboxFALL</strong>. To explore database switching, log out and sign in using our Sandbox fallback logic.
                    </div>
                  )}

                  {/* Search Directory */}
                  <div className="relative font-bold mt-1">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-natural-muted">
                      <Search className="h-3.5 w-3.5" />
                    </span>
                    <input
                      type="text"
                      placeholder="Filter accounts by email, name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white border border-[#D1D3C4] focus:border-natural-primary focus:ring-1 focus:ring-natural-primary rounded-xl py-2.5 pl-9 pr-4 text-xs text-natural-dark outline-none font-bold placeholder:font-normal"
                    />
                  </div>

                  {/* Switcher & View Profile instructions */}
                  <div className="bg-[#FAF5E6] border border-amber-200 text-amber-950 rounded-xl p-3 text-[10px] leading-relaxed font-semibold">
                    🤝 <strong>MULTI-PROFILE MANAGEMENT ACTIVE:</strong> Use the list below to manage and switch active client views. Click <strong className="text-amber-900 uppercase font-bold">Login As</strong> to instantly impersonate and view that profile's active portfolio, or click <strong className="text-amber-900 uppercase font-bold">Override Balances</strong> to configure individual ledger records.
                  </div>

                  {/* Accounts List */}
                  <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                    <div className="flex items-center gap-1.5 text-[9px] text-[#8B8D7A] uppercase font-black tracking-wider pb-1">
                      <Database className="h-3.5 w-3.5" />
                      <span>Ledger Records Catalogue</span>
                    </div>

                    {filteredUsers.length === 0 ? (
                      <div className="text-center py-8 bg-natural-bg/40 rounded-xl border border-dashed border-natural-accent text-natural-secondary p-4">
                        <Users className="h-6 w-6 text-natural-muted/60 mx-auto mb-1 animate-pulse" />
                        <p className="text-xs font-bold text-natural-dark">No swappable client profiles found</p>
                        <p className="text-[10px] text-natural-muted mt-0.5">Filter with different search queries or insert a mock profile above.</p>
                      </div>
                    ) : (
                      filteredUsers.map((u) => {
                        const isActive = user.id === u.id;
                        const isExpanded = selectedUserForEdit === u.id;

                        return (
                          <div 
                            key={u.id}
                            className={`border rounded-2xl p-3.5 transition-all text-xs font-semibold ${
                              isActive 
                                ? 'bg-[#F5F2E9]/70 border-[#D4AF37] shadow-xs' 
                                : 'bg-[#F4F5F0]/30 border-natural-border hover:bg-[#F4F5F0]/65'
                            }`}
                          >
                            <div className="flex justify-between items-start gap-4">
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-xs font-serif font-black text-natural-dark truncate max-w-[170px]">
                                    {u.name}
                                  </span>
                                  {isActive && (
                                    <span className="bg-emerald-100 text-emerald-850 text-[8px] font-black uppercase px-2 py-0.5 rounded-sm flex items-center gap-0.5">
                                      Active
                                    </span>
                                  )}
                                </div>
                                <span className="text-[9.5px] text-natural-muted font-mono block select-text truncate mt-0.5" title={u.email}>
                                  {u.email}
                                </span>
                              </div>
                              <div className="text-right text-[10px] font-mono font-bold text-natural-secondary shrink-0">
                                <span className="font-mono font-black text-natural-dark">${u.balance.toLocaleString()}</span> Bal
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-1.5 mt-2.5 text-[9px] font-mono text-[#8B8D7A] font-bold">
                              <div className="bg-[#F4F5F0] px-2 py-1 rounded">
                                Prof: <strong className="text-emerald-800 font-extrabold">${(u.profits || 0).toLocaleString()}</strong>
                              </div>
                              <div className="bg-[#F4F5F0] px-2 py-1 rounded columns-1 truncate">
                                Refs: <strong className="text-amber-800 font-extrabold">${(u.referralsEarned || 0).toLocaleString()}</strong>
                              </div>
                              <div className="bg-[#F4F5F0] px-2 py-1 rounded">
                                KYC: <strong className={`${u.verificationStatus === 'verified' ? 'text-emerald-800' : u.verificationStatus === 'pending' ? 'text-amber-800' : 'text-rose-805'} font-black`}>
                                  {u.verificationStatus.toUpperCase()}
                                </strong>
                              </div>
                            </div>

                            {/* Action Row */}
                            <div className="flex items-center justify-end gap-1.5 mt-3 pt-2.5 border-t border-natural-border/60">
                              {/* Direct Audit expand */}
                              <button
                                onClick={() => handleToggleExpandUser(u)}
                                className="h-7 px-2.5 border border-natural-accent hover:bg-natural-bg/40 text-[9.5px] font-black text-natural-secondary hover:text-natural-dark rounded-xl flex items-center gap-1 transition-all cursor-pointer"
                                title="Audit individual fields directly"
                              >
                                <Database className="h-3 w-3 text-natural-muted" />
                                <span>{isExpanded ? 'Hide Overrides' : 'Override Balances'}</span>
                                {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                              </button>

                              {/* Impersonate/Switch Profile */}
                              {!isActive && (
                                <button
                                  onClick={() => {
                                    const confirmSwitch = window.confirm(`CONFIRM PROFILE SWITCH:\nAre you sure you want to swap the running session to log in as:\n\n${u.name} (${u.email})?\nThis updates the loaded balance, trades & ledger.`);
                                    if (confirmSwitch) {
                                      if (isSandbox) {
                                        switchSandboxUser(u.id);
                                      } else {
                                        setImpersonatedUid(u.id);
                                      }
                                    }
                                  }}
                                  className="h-7 px-2.5 bg-[#5A5A40] hover:bg-[#4E4E37] text-white text-[9.5px] font-black uppercase rounded-xl flex items-center gap-1 transition-all cursor-pointer"
                                  title="Instantly sign into this customer environment"
                                >
                                  <LogIn className="h-3 w-3" />
                                  <span>Login As</span>
                                </button>
                              )}

                              {/* Delete account */}
                              <button
                                onClick={() => handleDeleteUserClick(u.id, u.email)}
                                className="h-7 w-7 border border-rose-200 hover:border-rose-450 hover:bg-rose-50/60 rounded-xl flex items-center justify-center transition-all cursor-pointer text-rose-700 shrink-0"
                                title="Erase account records from sandbox"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>

                            {/* Collapsible Edit Pane */}
                            {isExpanded && (
                              <div className="mt-3.5 p-3 rounded-xl border border-natural-border bg-white space-y-3 shadow-inner">
                                <h7 className="text-[9.5px] text-natural-dark uppercase font-black tracking-wider block border-b border-natural-border pb-1 font-mono">
                                  Alter Records – {u.name}
                                </h7>

                                <div className="space-y-2.5 font-bold">
                                  {/* Edit balance */}
                                  <div className="flex gap-1.5">
                                    <div className="relative flex-1">
                                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-mono text-[9px] text-natural-secondary font-black">$</span>
                                      <input
                                        type="number"
                                        step="0.01"
                                        placeholder="Set new balance value"
                                        value={editBalance}
                                        onChange={(e) => setEditBalance(e.target.value)}
                                        className="w-full bg-[#F4F5F0]/30 border border-[#D1D3C4] focus:border-natural-primary focus:ring-1 focus:ring-natural-primary rounded-lg py-1.5 pl-5 pr-2 text-xs text-natural-dark outline-none font-bold"
                                      />
                                    </div>
                                    <button
                                      onClick={() => {
                                        if (!editBalance) return;
                                        handleDirectUpdateUser(u.id, { balance: parseFloat(editBalance) });
                                      }}
                                      className="bg-[#EAECE0] hover:bg-[#D1D3C4] text-[10px] font-black px-2.5 py-1.5 rounded-lg border border-natural-accent text-natural-dark transition-colors cursor-pointer text-center uppercase inline-flex items-center"
                                    >
                                      Apply
                                    </button>
                                  </div>

                                  {/* Edit profits */}
                                  <div className="flex gap-1.5">
                                    <div className="relative flex-1">
                                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-mono text-[9px] text-natural-secondary font-black">$</span>
                                      <input
                                        type="number"
                                        step="0.01"
                                        placeholder="Set new profits value"
                                        value={editProfits}
                                        onChange={(e) => setEditProfits(e.target.value)}
                                        className="w-full bg-[#F4F5F0]/30 border border-[#D1D3C4] focus:border-natural-primary focus:ring-1 focus:ring-natural-primary rounded-lg py-1.5 pl-5 pr-2 text-xs text-natural-dark outline-none font-bold"
                                      />
                                    </div>
                                    <button
                                      onClick={() => {
                                        if (!editProfits) return;
                                        handleDirectUpdateUser(u.id, { profits: parseFloat(editProfits) });
                                      }}
                                      className="bg-[#EAECE0] hover:bg-[#D1D3C4] text-[10px] font-black px-2.5 py-1.5 rounded-lg border border-natural-accent text-natural-dark transition-colors cursor-pointer text-center uppercase inline-flex items-center"
                                    >
                                      Apply
                                    </button>
                                  </div>

                                  {/* Edit Referral Income */}
                                  <div className="flex gap-1.5">
                                    <div className="relative flex-1">
                                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-mono text-[9px] text-natural-secondary font-black">$</span>
                                      <input
                                        type="number"
                                        step="0.01"
                                        placeholder="Set new referral value"
                                        value={editReferral}
                                        onChange={(e) => setEditReferral(e.target.value)}
                                        className="w-full bg-[#F4F5F0]/30 border border-[#D1D3C4] focus:border-natural-primary focus:ring-1 focus:ring-natural-primary rounded-lg py-1.5 pl-5 pr-2 text-xs text-natural-dark outline-none font-bold"
                                      />
                                    </div>
                                    <button
                                      onClick={() => {
                                        if (!editReferral) return;
                                        handleDirectUpdateUser(u.id, { referralsEarned: parseFloat(editReferral) });
                                      }}
                                      className="bg-[#EAECE0] hover:bg-[#D1D3C4] text-[10px] font-black px-2.5 py-1.5 rounded-lg border border-natural-accent text-natural-dark transition-colors cursor-pointer text-center uppercase inline-flex items-center"
                                    >
                                      Apply
                                    </button>
                                  </div>

                                  {/* Edit KYC status */}
                                  <div className="flex gap-2 items-center">
                                    <div className="text-[9.5px] text-natural-muted font-bold uppercase font-mono shrink-0">KYC Verify:</div>
                                    <div className="flex-1 flex gap-1 font-mono text-[9px] font-black">
                                      {(['unverified', 'pending', 'verified'] as const).map((status) => (
                                        <button
                                          key={status}
                                          onClick={() => handleDirectUpdateUser(u.id, { verificationStatus: status })}
                                          className={`flex-1 py-1 rounded-md border text-center transition-all cursor-pointer ${
                                            u.verificationStatus === status
                                              ? 'bg-[#5A5A40] text-white border-transparent shadow-xs'
                                              : 'bg-[#F4F5F0] border-natural-border text-natural-secondary hover:text-natural-dark hover:bg-[#EAECE0]'
                                          }`}
                                        >
                                          {status.slice(0, 4).toUpperCase()}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

            {/* Footer details */}
            <div className="p-6 border-t border-natural-border bg-natural-bg/40 flex justify-between items-center text-[10px] text-[#8B8D7A] font-bold uppercase font-mono">
              <span>Gate Security Shield Active</span>
              <span className="flex items-center gap-1 font-mono text-[9px] font-black"><span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" /> DEV CORE CONSOLE</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
