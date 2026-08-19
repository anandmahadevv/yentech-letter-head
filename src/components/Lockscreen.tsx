import React, { useState } from 'react';
import { Lock, KeyRound, ArrowRight, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';

interface LockscreenProps {
  onUnlock: () => void;
  correctPasscode: string;
}

export const Lockscreen: React.FC<LockscreenProps> = ({ onUnlock, correctPasscode }) => {
  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode) return;

    setIsSubmitting(true);
    setError(false);

    // Verify passcode (matches either configured admin passcode or master default)
    const valid = passcode === correctPasscode || passcode === 'admin@yentech.edu.in';

    if (valid) {
      setTimeout(() => {
        onUnlock();
      }, 300);
    } else {
      setTimeout(() => {
        setError(true);
        setIsSubmitting(false);
      }, 250);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#090b10] flex items-center justify-center p-4 select-none font-sans">
      {/* Background Ambient Grid & Radial Glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(23, 144, 145, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(23, 144, 145, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
      <div className="absolute w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none -top-32 -left-32" />
      <div className="absolute w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none -bottom-32 -right-32" />

      {/* Main Lock Card */}
      <div className="relative z-10 w-full max-w-md bg-[#141720] border border-[#262c3a] shadow-2xl rounded-2xl p-6 sm:p-8 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
        {/* Top Logo & Header */}
        <div className="flex flex-col items-center text-center space-y-3 mb-6">
          <div className="px-6 py-3 bg-white rounded-xl shadow-lg border border-slate-200 flex items-center justify-center">
            <img
              src="/yentech_cropped_logo.png"
              alt="YenTech Community Logo"
              className="h-10 w-auto object-contain"
            />
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-teal-500/15 border border-teal-500/30 rounded-full text-[11px] font-mono text-teal-300 font-semibold uppercase tracking-wider">
            <Lock className="w-3 h-3 text-teal-400" />
            <span>Restricted Access</span>
          </div>

          <div>
            <h1 className="text-xl font-bold text-white tracking-tight font-mono">
              YenTech Official Studio
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
              Enter the authorized passcode to access the letterhead studio. Your session will remain unlocked on this device for 24 hours.
            </p>
          </div>
        </div>

        {/* Passcode Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono uppercase font-bold tracking-wider text-slate-400">
              Passcode
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <KeyRound className="w-4 h-4" />
              </div>

              <input
                type={showPassword ? 'text' : 'password'}
                autoFocus
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  if (error) setError(false);
                }}
                placeholder="Enter passcode"
                className={`w-full pl-9 pr-10 py-2.5 bg-[#0b0d13] border rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none transition font-mono ${
                  error
                    ? 'border-red-500/80 focus:border-red-500 bg-red-500/5'
                    : 'border-slate-700 focus:border-teal-500 focus:ring-1 focus:ring-teal-500'
                }`}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
                title={showPassword ? 'Hide passcode' : 'Show passcode'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-1.5 text-red-400 text-xs mt-1.5 animate-in fade-in duration-100 font-mono">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Incorrect passcode. Please try again.</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!passcode || isSubmitting}
            className="w-full py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-lg shadow-lg flex items-center justify-center gap-2 cursor-pointer transition uppercase font-mono tracking-wide"
          >
            <span>{isSubmitting ? 'Verifying...' : 'Unlock Studio'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer Security Badge */}
        <div className="mt-6 pt-4 border-t border-[#232730] flex items-center justify-center gap-2 text-[10.5px] font-mono text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
          <span>24-Hour Local Storage Authorization</span>
        </div>
      </div>
    </div>
  );
};
