import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Check, ArrowRight, UserCheck, ShieldCheck } from 'lucide-react';

export const WhatsAppWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasPrompted, setHasPrompted] = useState(false);

  // Trigger auto open suggestion bubble after 4 seconds only once
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen) {
        setHasPrompted(true);
      }
    }, 4000);
    return () => clearTimeout(timer);
  }, [isOpen]);

  const supportNumber = '19702617338';
  const welcomeText = encodeURIComponent('Hello Coinvest Support, I need assistance with my portfolio/funding.');
  const whatsappUrl = `https://wa.me/${supportNumber}?text=${welcomeText}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 select-none font-sans">
      <AnimatePresence>
        {/* Help Tooltip Prompt bubble (only if widget is closed) */}
        {hasPrompted && !isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="absolute bottom-18 right-2 w-72 bg-white border border-[#D1D3C4] shadow-xl p-4 rounded-2xl text-left hidden sm:block overflow-hidden"
          >
            {/* Top gold bar */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-gold-accent to-gold-primary" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setHasPrompted(false);
              }}
              className="absolute top-2.5 right-2 text-[#5A5A40] hover:text-black hover:bg-neutral-100 p-1 rounded-lg transition-all"
            >
              <X className="h-3 w-3" />
            </button>
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80"
                  alt="Support Specialist"
                  className="w-9 h-9 rounded-full object-cover border border-[#D1D3C4]"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-serif font-black text-natural-dark">Olivia Mercer</h4>
                <p className="text-[10px] text-emerald-600 font-extrabold flex items-center gap-1 uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block" /> Live Support Desk
                </p>
              </div>
            </div>
            <p className="mt-2.5 text-xs text-natural-secondary leading-relaxed font-semibold">
              Is your deposit taking time, or do you have package questions? Speak live with London Desk.
            </p>
            <button
              onClick={() => {
                setIsOpen(true);
                setHasPrompted(false);
              }}
              className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2 px-3 text-[10.5px] font-bold flex items-center justify-center gap-1.5 tracking-wider uppercase transition-colors"
            >
              <MessageCircle className="h-3.5 w-3.5 fill-white/10" />
              <span>Connect Now</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {/* Expanded Customer Service Desk Dialog */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 20 }}
            className="absolute bottom-18 right-0 w-80 sm:w-85 bg-white border border-natural-border rounded-3xl shadow-2xl overflow-hidden text-left"
          >
            {/* Header backdrop matching premium Gold Standard colors */}
            <div className="bg-[#12120A] px-5 py-6 text-white relative">
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-extrabold px-1.5 py-0.5 rounded tracking-wide uppercase">Desk Active</span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/60 hover:text-white hover:bg-white/10 p-1.5 rounded-xl transition-all"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              <div className="flex items-center gap-3.5 pt-2">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100"
                    alt="Support Specialist"
                    className="w-11 h-11 rounded-full object-cover border-2 border-gold-light"
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#12120A] animate-pulse" />
                </div>
                <div>
                  <h4 className="font-serif font-black text-white text-sm tracking-tight flex items-center gap-1">
                    Olivia Mercer
                    <UserCheck className="h-3.5 w-3.5 text-gold-accent shrink-0" />
                  </h4>
                  <p className="text-[10px] text-gold-accent font-black tracking-widest uppercase">Lead Client Allocations</p>
                </div>
              </div>
            </div>

            {/* Support Message Bubble body */}
            <div className="p-5 space-y-4 bg-gradient-to-b from-[#FAFAF7] to-white">
              <div className="bg-white border border-[#EAECE0] p-4 rounded-2xl relative text-xs text-natural-secondary leading-relaxed font-semibold shadow-xs">
                {/* Arrow indicator */}
                <div className="absolute top-4 -left-1.5 w-3 h-3 bg-white border-l border-b border-[#EAECE0] rotate-45" />
                Welcome! This is our dedicated WhatsApp sovereign channel.
                <br />
                <br />
                I can assist you instantly with <span className="text-natural-dark font-extrabold">deposits (starting from $200)</span>, kyc verification clearances, copy strategy followings, or account setup. Let's resolve any issue directly.
              </div>

              {/* Verified Trust Badges */}
              <div className="flex gap-4 p-3 bg-gold-cream/30 border border-gold-light/40 rounded-xl text-[10.5px] font-semibold text-gold-dark">
                <ShieldCheck className="h-4 w-4 text-gold-primary shrink-0" />
                <div>
                  <h5 className="font-bold leading-tight uppercase text-[9.5px] tracking-wide text-natural-dark">Verified Private Line</h5>
                  <p className="text-[10px] text-natural-muted">Encrypted Direct Exchange WhatsApp Integration</p>
                </div>
              </div>

              {/* Official WhatsApp Action Button */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#128C7E] hover:bg-[#075E54] hover:shadow-lg text-white font-bold py-3.5 px-4 rounded-xl text-xs transition-all tracking-wider flex items-center justify-center gap-2 group cursor-pointer"
              >
                {/* Embedded High Quality SVG icon for WhatsApp Logo */}
                <svg className="h-5 w-5 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.863-9.755.002-2.61-1.01-5.063-2.85-6.908C16.643 2.1 14.195.918 11.99.918c-5.444 0-9.866 4.372-9.87 9.76-.002 1.761.47 3.479 1.365 5.011L2.43 21.144l5.968-1.564z" />
                  <path d="M12.002 1.916c-5.1.001-9.25 4.15-9.254 9.255a9.208 9.208 0 001.282 4.706l-.137-.233-1.026 3.75 3.844-1.008.24.143c1.4.832 2.99 1.272 4.622 1.274 5.1 0 9.25-4.151 9.254-9.257a9.204 9.204 0 00-2.71-6.549 9.204 9.204 0 00-6.574-2.73l.001.033zm4.5 9.177c.453-.133.722-.266.86-.4.07-.07.12-.116.155-.221.052-.15.22-.962.29-1.284.071-.32-.154-.482-.363-.482-.162 0-.27 0-.414.053l-.974.364c-.452.171-.784.6-1.12.871-.563.456-1.14 1.055-1.583 1.5l-.234-.236c-.453-.455-1.055-1.032-1.51-1.597.272-.336.7-.667.871-1.12l.364-.974a.8.8 0 00.053-.414c0-.21-.162-.434-.483-.363-.321.07-1.133.238-1.283.29-.105.035-.152.086-.222.155-.133.138-.266.407-.4.86.035.14.17.29 1.2.98l.05.035c1.455.975 1.551.986 1.762.61a5.626 5.626 0 00.125-.262l-.042-.042c-.5-.5-.453-.453 0 0zm-7.614-2.33c-.221.22-.355.518-.355.856s.134.636.355.856l1.248 1.248c.221.221.518.355.856.355s.636-.134.856-.355l-1.248-1.248-.445.446-.37-.37.446-.445-1.248-1.248z" fillRule="evenodd" />
                </svg>
                <span className="uppercase tracking-widest text-[#FFF]">Start Session on WhatsApp</span>
                <ArrowRight className="h-4 w-4 text-white group-hover:translate-x-1.5 transition-transform" />
              </a>

              {/* Subtle official support phone details */}
              <div className="text-center">
                <span className="text-[10px] text-natural-muted font-bold font-mono tracking-wide">
                  Tel: +1 (970) 261-7338 (Live Desk Pool)
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Circular Anchor Button */}
      <motion.button
        id="whatsapp-chat-button"
        onClick={() => {
          setIsOpen(prev => !prev);
          setHasPrompted(false);
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl border cursor-pointer transition-all ${
          isOpen
            ? 'bg-[#12120A] border-natural-border text-white hover:bg-black'
            : 'bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-400 border-emerald-400 hover:to-emerald-500 text-white hover:shadow-emerald-500/20 shadow-emerald-600/10'
        }`}
        title="Connect to Sovereign Customer Service"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <div className="relative">
            <svg className="h-7 w-7 fill-current" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" />
            </svg>
            <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-emerald-500 animate-ping" />
            <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-emerald-500" />
          </div>
        )}
      </motion.button>
    </div>
  );
};
