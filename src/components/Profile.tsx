import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { User, ShieldCheck, Mail, Calendar, Key, Copy, Check, UploadCloud } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, verifyAccount } = useDashboard();
  const [copiedLink, setCopiedLink] = useState(false);
  const [docUploaded, setDocUploaded] = useState(false);
  const [docName, setDocName] = useState('');
  
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [newPwConfirm, setNewPwConfirm] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');

  const handleCopyLink = () => {
    if (user) {
      navigator.clipboard.writeText(`https://coinvest.cc/register?ref=${user.referralCode}`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocUploaded(true);
      setDocName(file.name);
      verifyAccount(); // Trigger state to 'pending'
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');

    if (newPw.length < 6) {
      setPwError('New security password must be at least 6 characters.');
      return;
    }

    if (newPw !== newPwConfirm) {
      setPwError('New passwords do not match.');
      return;
    }

    setPwSuccess('Vault firewall updated. Guard password changed successfully.');
    setCurrentPw('');
    setNewPw('');
    setNewPwConfirm('');
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core details column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-[32px] border border-natural-border p-6 shadow-sm flex flex-col md:flex-row items-center gap-6">
            <div className="h-20 w-20 rounded-full bg-[#EAECE0] border border-natural-accent flex items-center justify-center relative select-none">
              <span className="text-2xl font-serif font-black text-natural-dark">{user.name.charAt(0)}</span>
              <div className={`absolute bottom-0 right-0 h-5 w-5 rounded-full border border-white flex items-center justify-center ${user.verificationStatus === 'verified' ? 'bg-emerald-700' : 'bg-natural-muted'}`}>
                <ShieldCheck className="h-3 w-3 text-white stroke-[2.5]" />
              </div>
            </div>

            <div className="text-center md:text-left space-y-1">
              <h3 className="text-lg font-serif font-bold text-natural-dark flex items-center justify-center md:justify-start gap-2">
                {user.name}
              </h3>
              <p className="text-xs text-natural-secondary font-bold flex items-center justify-center md:justify-start gap-1">
                <Mail className="h-3.5 w-3.5 text-natural-muted" /> {user.email}
              </p>
              <p className="text-[10.5px] text-natural-muted font-mono font-bold">
                System Reference: {user.id}
              </p>
            </div>
          </div>

          {/* Account KYC validation */}
          <div className="bg-white rounded-[32px] border border-natural-border p-6 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-serif font-black text-natural-dark">KYC Legal Verification Desk</h3>
              <p className="text-xs text-natural-secondary leading-relaxed mt-1 font-semibold">
                In compliance with standard anti-money laundering regulations, executing large volume CFD trades require valid identity validation.
              </p>
            </div>

            {user.verificationStatus === 'verified' ? (
              <div className="bg-emerald-50 text-emerald-800 rounded-2xl p-4 border border-emerald-100 flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 stroke-[2.5] shrink-0" />
                <div className="font-semibold">
                  <span className="text-xs font-bold block uppercase tracking-wider">KYC ACCOUNT CERTIFIED</span>
                  <span className="text-[11px] text-emerald-900">Your account is catalogued and certified under regulatory compliance standards.</span>
                </div>
              </div>
            ) : user.verificationStatus === 'pending' ? (
              <div className="bg-emerald-50/50 text-emerald-900 rounded-2xl p-4 border border-[#D1D3C4] flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 stroke-[2.5] shrink-0 text-emerald-700" />
                <div className="font-semibold">
                  <span className="text-xs font-bold block uppercase tracking-wider text-emerald-800">DOCUMENT AUDIT STREAM IN PLAY</span>
                  <span className="text-[11px] text-natural-text">Docs uploaded ({docName || 'passport.jpg'}). Financial audit desk is reviewing details.</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                <div className="border border-dashed border-[#D1D3C4] hover:border-natural-primary bg-white rounded-2xl p-6 text-center relative cursor-pointer flex flex-col items-center">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleDocChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <UploadCloud className="h-8 w-8 text-natural-muted mb-2" />
                  <span className="text-xs font-serif font-bold text-natural-dark">Upload Legal Identity Passport or Driver License</span>
                  <span className="text-[10px] text-natural-muted mt-1 leading-normal font-bold max-w-sm">
                    Upload jpeg, png, or pdf forms. Max size allowed is 5MB. Processing times estimate within 24 hours.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Security / Password adjustments */}
        <div className="bg-white rounded-[32px] border border-natural-border p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4 border-b border-natural-border pb-3">
            <Key className="h-4.5 w-4.5 text-natural-primary" />
            <h4 className="text-sm font-serif font-bold text-natural-dark">Security Gate Management</h4>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] text-natural-muted font-bold uppercase tracking-wider block">Current Password</label>
              <input
                type="password"
                required
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white border border-[#D1D3C4] focus:border-natural-primary focus:ring-1 focus:ring-natural-primary rounded-xl py-2 px-3 text-xs text-natural-dark outline-none font-bold placeholder-[#A2A493]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-natural-muted font-bold uppercase tracking-wider block">New Password</label>
              <input
                type="password"
                required
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full bg-white border border-[#D1D3C4] focus:border-natural-primary focus:ring-1 focus:ring-natural-primary rounded-xl py-2 px-3 text-xs text-natural-dark outline-none font-bold placeholder-[#A2A493]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-natural-muted font-bold uppercase tracking-wider block">Confirm New Password</label>
              <input
                type="password"
                required
                value={newPwConfirm}
                onChange={(e) => setNewPwConfirm(e.target.value)}
                placeholder="Repeat password"
                className="w-full bg-white border border-[#D1D3C4] focus:border-natural-primary focus:ring-1 focus:ring-natural-primary rounded-xl py-2 px-3 text-xs text-natural-dark outline-none font-bold placeholder-[#A2A493]"
              />
            </div>

            {pwSuccess && (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-[10px] py-2 px-3 rounded-lg text-center font-bold">
                {pwSuccess}
              </div>
            )}

            {pwError && (
              <div className="bg-rose-50 border border-rose-100 text-rose-800 text-[10px] py-2 px-3 rounded-lg text-center font-bold">
                {pwError}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-natural-primary hover:bg-[#4E4E37] text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors uppercase tracking-wider cursor-pointer font-serif"
            >
              SAVE VAULT KEYS
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
