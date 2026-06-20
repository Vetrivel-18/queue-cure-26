import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Tv, 
  Volume2, 
  VolumeX, 
  Hourglass, 
  ArrowRight, 
  Calendar,
  AlertCircle,
  Clock,
  HeartPulse,
  QrCode,
  Smartphone,
  X,
  User,
  Phone,
  Sparkles,
  CheckCircle
} from 'lucide-react';
import { Patient, ClinicSettings, QueueStats } from '../types';

interface WaitingScreenProps {
  patients: Patient[];
  settings: ClinicSettings;
  stats: QueueStats;
  currentToken: number | null;
  nextToken: number | null;
  onAddPatient?: (name: string, phone: string) => void;
}

export function WaitingScreen({
  patients,
  settings,
  stats,
  currentToken,
  nextToken,
  onAddPatient
}: WaitingScreenProps) {
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Interactive Mobile Scan Modal states
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [modalName, setModalName] = useState('');
  const [modalPhone, setModalPhone] = useState('');
  const [modalNameWarning, setModalNameWarning] = useState(false);
  const [modalPhoneWarning, setModalPhoneWarning] = useState(false);
  const [modalNameError, setModalNameError] = useState('');
  const [modalPhoneError, setModalPhoneError] = useState('');
  const [modalFormError, setModalFormError] = useState('');
  const [modalSuccessTicket, setModalSuccessTicket] = useState<{ name: string; tokenNumber: number; estWait: number } | null>(null);

  const nameRegex = /^[a-zA-Z\s]+$/;
  const phoneRegex = /^[0-9]{10}$/;

  const handleModalNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const orig = e.target.value;
    setModalName(orig);

    if (orig.trim() === '') {
      setModalNameError('');
      setModalNameWarning(false);
    } else if (!nameRegex.test(orig)) {
      setModalNameError('Patient name must contain alphabetical letters and spaces only.');
      setModalNameWarning(true);
    } else {
      setModalNameError('');
      setModalNameWarning(false);
    }
  };

  const handleModalPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const orig = e.target.value;
    
    // Smooth helper: let user type digits but restrict characters visually to numbers
    const cleanNumbersOnly = orig.replace(/[^0-9]/g, '');
    setModalPhone(cleanNumbersOnly);

    if (cleanNumbersOnly === '') {
      setModalPhoneError('');
      setModalPhoneWarning(false);
    } else if (cleanNumbersOnly.length !== 10) {
      setModalPhoneError('Phone number must be exactly 10 digits (e.g., 5550192000).');
      setModalPhoneWarning(true);
    } else {
      setModalPhoneError('');
      setModalPhoneWarning(false);
    }
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setModalFormError('');

    const trimmedName = modalName.trim();
    const strippedPhone = modalPhone.replace(/[^0-9]/g, '');

    // Strict validation check via precise regex
    if (!trimmedName) {
      setModalFormError('Patient name is required.');
      return;
    }
    if (!nameRegex.test(trimmedName)) {
      setModalFormError('Validation failed: Name can only contain letters and spaces.');
      setModalNameError('Patient name must contain alphabetical letters and spaces only.');
      setModalNameWarning(true);
      return;
    }

    if (strippedPhone.length !== 10) {
      setModalFormError('Validation failed: Phone number must be exactly 10 digits.');
      setModalPhoneError('Phone number must be exactly 10 digits (e.g., 5550192000).');
      setModalPhoneWarning(true);
      return;
    }

    // Determine the newly generated token index logic
    const nextTokenNum = patients.length > 0 ? Math.max(...patients.map(p => p.tokenNumber)) + 1 : 101;
    const waitingCount = patients.filter(p => p.status === 'waiting').length;
    const computedWaitTime = waitingCount * settings.avgConsultationTime;

    if (onAddPatient) {
      onAddPatient(trimmedName, strippedPhone);
    }

    // Display beautiful successful queue ticket confirmation screen inside modal
    setModalSuccessTicket({
      name: trimmedName,
      tokenNumber: nextTokenNum,
      estWait: computedWaitTime
    });

    // Reset fields
    setModalName('');
    setModalPhone('');
    setModalNameError('');
    setModalPhoneError('');
    setModalNameWarning(false);
    setModalPhoneWarning(false);
  };

  const handleCloseModal = () => {
    setIsJoinModalOpen(false);
    // Stagger success ticket clearing for neat transition fadeout
    setTimeout(() => {
      setModalSuccessTicket(null);
      setModalFormError('');
    }, 200);
  };
  
  // Track previous token to trigger chime on update
  const prevTokenRef = useRef<number | null>(currentToken);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Tick clock for the clinic TV wall
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Web Audio API Synthesizer Chime
  const playChime = () => {
    if (!audioEnabled) return;
    try {
      // Lazy load AudioContext
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new AudioCtx();
      }
      
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      
      // Dual-tone chime: High-pitch pleasant clinic tone (E5 -> G5)
      // Note 1: E5 (659.25 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.2, now + 0.1);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      
      // Note 2: A5 (880 Hz) - staggered slightly
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880.00, now + 0.25);
      gain2.gain.setValueAtTime(0, now + 0.25);
      gain2.gain.linearRampToValueAtTime(0.2, now + 0.35);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      
      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.7);

      osc2.start(now + 0.25);
      osc2.stop(now + 0.95);

    } catch (e) {
      console.warn('Audio synthesis failed or was blocked by browser policies:', e);
    }
  };

  // Watch for token updates and alert
  useEffect(() => {
    if (currentToken !== prevTokenRef.current) {
      if (currentToken !== null) {
        playChime();
      }
      prevTokenRef.current = currentToken;
    }
  }, [currentToken]);

  const activeCalledPatient = patients.find(p => p.status === 'called');
  const waitingList = patients.filter(p => p.status === 'waiting');
  
  // Est wait time for general next entries
  const currentTotalWaitEst = waitingList.length * settings.avgConsultationTime;

  return (
    <div className="bg-transparent text-white min-h-screen py-8 overflow-hidden select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* TV Header panel */}
        <div className="bg-slate-900/35 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-4.5 mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-650 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Tv className="w-5.5 h-5.5" />
            </div>
            <div>
              <h1 className="font-sans font-extrabold text-base tracking-tight text-slate-100 flex items-center gap-2">
                <span>Waiting Room Broadcast</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
              </h1>
              <p className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">Console Screen #01 &bull; Active Loop</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Audio speaker toggler */}
            <button
              onClick={() => {
                setAudioEnabled(!audioEnabled);
                // Trigger play briefly to bypass Safari/Chrome restrictions
                if (!audioEnabled) playChime();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                audioEnabled 
                  ? 'bg-blue-900/30 border-blue-800 text-blue-300' 
                  : 'bg-slate-800/50 border-slate-700 text-slate-400'
              }`}
            >
              {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="font-sans uppercase tracking-wider text-[10px]">{audioEnabled ? 'Audible Chimes On' : 'Chimes Muted'}</span>
            </button>

            {/* Live digital Clock */}
            <div className="text-right shrink-0">
              <div className="font-mono text-lg font-bold text-slate-50">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
              <div className="text-[10px] text-slate-500 font-sans">
                {currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
              </div>
            </div>
          </div>
        </div>

        {/* Primary Call Announcement Block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-8">
          
          {/* Main big display: NOW SERVING */}
          <div className="col-span-1 lg:col-span-8 bg-indigo-950/45 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden min-h-[420px]">
            {/* Visual background ripple */}
            <div className="absolute -top-[10%] -left-[10%] w-[120%] h-[120%] bg-[radial-gradient(circle,rgba(59,130,246,0.06)_0%,transparent_70%)] pointer-events-none" />
            
            <div className="flex justify-between items-start z-1">
              <div>
                <span className="text-blue-400 text-xs font-bold font-mono tracking-widest uppercase block mb-1">Status</span>
                <h2 className="text-5xl font-sans font-black tracking-tight text-white">Now Serving</h2>
              </div>
              <HeartPulse className="text-blue-500 w-8 h-8 animate-pulse shrink-0" />
            </div>

            {/* Token Announcement Card */}
            <div className="my-10 text-center relative z-1">
              <AnimatePresence mode="wait">
                {activeCalledPatient ? (
                  <motion.div
                    key={activeCalledPatient.id}
                    initial={{ scale: 0.9, opacity: 0, y: 15 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: -15 }}
                    transition={{ type: 'spring', damping: 15, stiffness: 100 }}
                  >
                    <div className="inline-block bg-linear-to-b from-blue-600/80 to-indigo-700/80 backdrop-blur-md text-white rounded-3xl border border-white/20 px-12 py-8 shadow-2xl relative shadow-blue-900/30">
                      <div className="text-[10px] text-blue-100/60 uppercase font-bold font-sans tracking-widest mb-1">Token Number</div>
                      <div className="font-mono text-7xl sm:text-8.5xl font-extrabold leading-none tracking-tight">
                        {activeCalledPatient.tokenNumber}
                      </div>
                      <div className="mt-4 text-sm sm:text-base text-blue-100 font-semibold uppercase tracking-wider">
                        {activeCalledPatient.name}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-12"
                  >
                    <div className="text-slate-500 italic text-lg">No active consultation.</div>
                    <p className="text-slate-500 text-xs max-w-sm mx-auto mt-2 leading-relaxed">
                      All checks are complete or the receptionist is preparing the next profile. Please look for token details shortly.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom Estimates summaries */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-800/60 z-1 text-sm font-semibold">
              <div>
                <span className="text-slate-500 block text-xs uppercase font-sans tracking-wider mb-1">Estimated Wait</span>
                <span className="font-mono text-xl text-blue-400 flex items-center gap-1.5">
                  <Clock className="w-4.5 h-4.5 shrink-0" />
                  <span>{currentTotalWaitEst} <span className="text-xs font-sans text-slate-500">mins total</span></span>
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-xs uppercase font-sans tracking-wider mb-1">Up Next Token</span>
                <span className="font-mono text-xl text-indigo-400">
                  {nextToken ? `#${nextToken}` : 'None'}
                </span>
              </div>
              <div className="sm:text-right">
                <span className="text-slate-500 block text-xs uppercase font-sans tracking-wider mb-1">Clinic Flow Rate</span>
                <span className="font-sans text-xl text-emerald-400">
                  {settings.avgConsultationTime} <span className="text-xs text-slate-500">min/patient</span>
                </span>
              </div>
            </div>

          </div>

          {/* Right Column: Next Patients listing queue */}
          <div className="col-span-1 lg:col-span-4 bg-slate-900/35 backdrop-blur-md border border-white/10 rounded-3xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-800">
                <h3 className="font-sans font-bold text-white text-base">Lounge queue</h3>
                <span className="bg-slate-800 text-slate-350 border border-slate-700 text-[10px] font-bold px-2 py-0.5 rounded font-mono uppercase tracking-widest">
                  {waitingList.length} Upcoming
                </span>
              </div>

              {/* Progress listings */}
              <div className="space-y-3">
                <AnimatePresence>
                  {waitingList.length > 0 ? (
                    waitingList.slice(0, 5).map((p, index) => {
                      const computedWait = index * settings.avgConsultationTime;
                      return (
                        <motion.div
                          key={p.id}
                          layout
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.25 }}
                          className="bg-slate-950/60 transition-all hover:bg-slate-950 px-4 py-3 border border-slate-850 rounded-xl flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-5.5 h-5.5 rounded-lg bg-blue-950/85 border border-blue-800/40 text-blue-300 font-mono font-bold flex items-center justify-center select-none text-[10px]">
                              {index + 1}
                            </span>
                            <div>
                              <div className="font-bold text-slate-200">{p.name}</div>
                              <div className="text-[9px] text-slate-500 font-mono">Queue slot {index + 1} &bull; Est wait {computedWait}m</div>
                            </div>
                          </div>
                          
                          <span className="font-mono bg-slate-900 border border-indigo-950 px-2.5 py-1 rounded text-indigo-300 font-black">
                            #{p.tokenNumber}
                          </span>
                        </motion.div>
                      );
                    })
                  ) : (
                    <div className="text-center py-20 text-xs text-slate-500 italic">
                      Lounge queue is currently clear.
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Accessibility / notice ticker */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex items-start gap-2.5 bg-slate-950/40 p-3 rounded-lg border border-slate-850/30 text-xs">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
              <p className="text-slate-400 text-[10px] leading-relaxed">
                <strong>Attention Patients:</strong> Estimated wait-times are calculated dynamically. Please remain present in the lounge 5-10 minutes prior to your slots.
              </p>
            </div>

            {/* FAST SELF-CHECKIN QR CODE WIDGET */}
            <div className="mt-5 pt-5 border-t border-slate-800 flex flex-col gap-3.5">
              <div className="flex gap-3 items-start">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Fast Self-Checkin</h4>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Scan with your smartphone to instantly join the booking queue.
                  </p>
                </div>
              </div>

              {/* Graphical QR container with Framer Motion scanning laser */}
              <div className="relative bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-center items-center overflow-hidden">
                <motion.div 
                  animate={{ y: [0, 134, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute left-0 right-0 h-[2px] bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)] pointer-events-none"
                />

                <button
                  type="button"
                  onClick={() => setIsJoinModalOpen(true)}
                  className="bg-white p-2.5 rounded-xl block transition-transform duration-300 hover:scale-[1.03] shadow-lg shadow-black/35 cursor-pointer relative"
                  title="Scan / Click to join wait list"
                >
                  <div className="w-32 h-32">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900" fill="currentColor">
                      {/* Finder patterns */}
                      <rect x="0" y="0" width="28" height="28" rx="3.5" className="text-blue-900" />
                      <rect x="4" y="4" width="20" height="20" rx="1.5" fill="white" />
                      <rect x="8" y="8" width="12" height="12" rx="1" className="text-blue-900" />

                      <rect x="72" y="0" width="28" height="28" rx="3.5" className="text-blue-900" />
                      <rect x="76" y="4" width="20" height="20" rx="1.5" fill="white" />
                      <rect x="80" y="8" width="12" height="12" rx="1px" className="text-blue-900" />

                      <rect x="0" y="72" width="28" height="28" rx="3.5" className="text-blue-900" />
                      <rect x="4" y="76" width="20" height="20" rx="1.5" fill="white" />
                      <rect x="8" y="80" width="12" height="12" rx="1px" className="text-blue-900" />

                      <rect x="76" y="76" width="12" height="12" rx="2" className="text-blue-800" />
                      <rect x="80" y="80" width="4" height="4" rx="0.5" fill="white" />

                      {/* Random realistic deterministic dots */}
                      <rect x="36" y="4" width="4" height="4" rx="0.5" />
                      <rect x="44" y="0" width="8" height="4" rx="0.5" />
                      <rect x="60" y="4" width="4" height="4" rx="0.5" />
                      <rect x="36" y="12" width="4" height="8" rx="0.5" />
                      <rect x="48" y="16" width="8" height="4" rx="0.5" />
                      <rect x="60" y="12" width="8" height="4" rx="0.5" />
                      <rect x="44" y="24" width="4" height="4" rx="0.5" />
                      <rect x="56" y="20" width="4" height="8" rx="0.5" />
                      <rect x="4" y="36" width="8" height="4" rx="0.5" />
                      <rect x="16" y="40" width="4" height="4" rx="0.5" />
                      <rect x="24" y="36" width="4" height="8" rx="0.5" />
                      <rect x="32" y="36" width="12" height="4" rx="0.5" />
                      <rect x="48" y="36" width="4" height="8" rx="0.5" />
                      <rect x="56" y="40" width="8" height="4" rx="0.5" />
                      <rect x="68" y="36" width="4" height="4" rx="0.5" />
                      <rect x="76" y="36" width="8" height="4" rx="0.5" />
                      <rect x="88" y="40" width="4" height="8" rx="0.5" />
                      <rect x="0" y="48" width="4" height="8" rx="0.5" />
                      <rect x="8" y="48" width="8" height="4" rx="0.5" />
                      <rect x="20" y="52" width="4" height="4" rx="0.5" />
                      <rect x="28" y="48" width="4" height="4" rx="0.5" />
                      <rect x="60" y="48" width="4" height="4" rx="0.5" />
                      <rect x="68" y="52" width="8" height="4" rx="0.5" />
                      <rect x="80" y="48" width="4" height="8" rx="0.5" />
                      <rect x="92" y="52" width="4" height="4" rx="0.5" />
                      <rect x="4" y="60" width="8" height="4" rx="0.5" />
                      <rect x="16" y="60" width="4" height="4" rx="0.5" />
                      <rect x="24" y="60" width="8" height="4" rx="0.5" />
                      <rect x="36" y="60" width="4" height="8" rx="0.5" />
                      <rect x="44" y="60" width="12" height="4" rx="0.5" />
                      <rect x="60" y="60" width="4" height="4" rx="0.5" />
                      <rect x="68" y="60" width="4" height="8" rx="0.5" />
                      <rect x="76" y="64" width="8" height="4" rx="0.5" />
                      <rect x="88" y="60" width="8" height="4" rx="0.5" />
                      <rect x="36" y="72" width="8" height="4" rx="0.5" />
                      <rect x="48" y="76" width="4" height="8" rx="0.5" />
                      <rect x="56" y="72" width="8" height="4" rx="0.5" />
                      <rect x="60" y="80" width="4" height="8" rx="0.5" />
                      <rect x="36" y="88" width="4" height="8" rx="0.5" />
                      <rect x="44" y="92" width="12" height="4" rx="0.5" />
                      <rect x="60" y="88" width="8" height="4" rx="0.5" />

                      {/* Medical Plus Cross inside circular backing */}
                      <circle cx="50" cy="50" r="11" fill="white" />
                      <circle cx="50" cy="50" r="9" className="text-red-500" />
                      <path d="M50 46 v8 M46 50 h8" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                  </div>
                </button>

                <p className="text-[9px] font-mono tracking-wider text-slate-500 mt-1 uppercase">
                  SIMULATOR SECURE CHOP_09
                </p>
              </div>

              {/* Direct modal trigger CTA */}
              <button
                type="button"
                onClick={() => setIsJoinModalOpen(true)}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white border border-blue-550 py-2.5 rounded-xl font-sans text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Smartphone className="w-4 h-4 text-white" />
                <span>Interactive Mobile Join</span>
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* MOBILE QUEUE REGISTRATION MODAL */}
      <AnimatePresence>
        {isJoinModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop glow overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ type: 'spring', damping: 20, stiffness: 120 }}
              className="bg-white text-slate-850 rounded-3xl w-full max-w-md border border-slate-200 shadow-2xl relative z-10 overflow-hidden"
            >
              {/* Header medical strip */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-6 text-white relative">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className="flex items-center gap-2.5 mb-11">
                  <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                    <HeartPulse className="w-4.5 h-4.5 text-white animate-pulse" />
                  </div>
                  <span className="text-[10px] font-mono font-bold tracking-widest text-blue-100 uppercase">Self Check-in Portal</span>
                </div>
                <h3 className="font-sans font-extrabold text-xl tracking-tight leading-none mt-2">Queue Cure ‘26</h3>
                <p className="text-[11px] text-blue-100/70 mt-1 leading-normal font-sans">
                  Register your spot in real time. We will generate your lounge ticket.
                </p>
              </div>

              {/* Success ticket or input fields */}
              <div className="p-6">
                {!modalSuccessTicket ? (
                  <form onSubmit={handleModalSubmit} className="space-y-4">
                    {modalFormError && (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                        <span>{modalFormError}</span>
                      </div>
                    )}

                    <div>
                      <label htmlFor="modal-name-input" className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5 font-sans">
                        Patient Full Name
                      </label>
                      <div className="relative">
                        <User aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
                        <input
                          id="modal-name-input"
                          type="text"
                          required
                          aria-invalid={modalNameWarning ? "true" : "false"}
                          aria-describedby={modalNameWarning ? "modal-name-error-msg" : undefined}
                          value={modalName}
                          onChange={handleModalNameChange}
                          placeholder="e.g. Richard Hendricks"
                          className={`w-full bg-slate-50 border rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all font-sans font-medium ${
                            modalNameWarning 
                              ? 'border-rose-450 focus:border-rose-500 focus:ring-rose-200 bg-rose-50/25' 
                              : 'border-slate-200 focus:ring-blue-500/50 focus:border-blue-500'
                          }`}
                        />
                      </div>
                      {modalNameWarning && (
                        <p id="modal-name-error-msg" role="alert" className="text-[11px] text-rose-600 mt-1.5 font-semibold flex items-center gap-1">
                          <span>⚠️ {modalNameError || 'Enter letters/spaces only (e.g. Richard Hendricks).'}</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label htmlFor="modal-phone-input" className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block font-sans">
                          Contact Mobile Phone
                        </label>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${modalPhone.length === 10 ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-100' : 'bg-slate-100 text-slate-550 border border-slate-200'}`}>
                          {modalPhone.length}/10 Digits
                        </span>
                      </div>
                      <div className="relative">
                        <Phone aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
                        <input
                          id="modal-phone-input"
                          type="tel"
                          required
                          aria-invalid={modalPhoneWarning ? "true" : "false"}
                          aria-describedby={modalPhoneWarning ? "modal-phone-error-msg" : undefined}
                          value={modalPhone}
                          onChange={handleModalPhoneChange}
                          placeholder="e.g. 5550192000"
                          maxLength={10}
                          className={`w-full bg-slate-50 border rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:ring-2 transition-all font-medium tracking-wide ${
                            modalPhoneWarning 
                              ? 'border-rose-450 focus:border-rose-500 focus:ring-rose-200 bg-rose-50/25' 
                              : 'border-slate-200 focus:ring-blue-500/50 focus:border-blue-500'
                          }`}
                        />
                      </div>
                      {modalPhoneWarning && (
                        <p id="modal-phone-error-msg" role="alert" className="text-[11px] text-rose-600 mt-1.5 font-semibold flex items-center gap-1">
                          <span>⚠️ {modalPhoneError || 'Please enter exactly 10 numeric digits.'}</span>
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full mt-5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white py-3 rounded-xl font-sans font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-blue-500/10 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>Join Lounge Queue</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  /* BEAUTIFUL SUCCESS CONFIRMED TICKET SCREEN */
                  <div className="text-center py-2 space-y-5">
                    <div className="w-14 h-14 bg-emerald-100 border border-emerald-200 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-xs">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    
                    <div>
                      <span className="text-[10px] font-semibold text-emerald-700 tracking-wider uppercase bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">
                        Queue Spot Confirmed!
                      </span>
                      <h4 className="font-extrabold text-slate-900 font-sans text-xl mt-3 leading-tight">
                        Check-in Completed
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Please take a screenshot of your digital ticket or note your slot below.
                      </p>
                    </div>

                    {/* PHYSICAL LOOKING CLINICAL PASS ticket stub */}
                    <div className="bg-slate-55 border border-slate-200 rounded-2xl relative overflow-hidden text-left p-5 shadow-xs py-5">
                      {/* Ticket side notches */}
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-white border-r border-slate-200 rounded-r-full -translate-x-1" />
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-white border-l border-slate-200 rounded-l-full translate-x-1" />

                      <div className="border-b border-dashed border-slate-200 pb-3 flex justify-between items-center">
                        <div>
                          <span className="text-[9px] font-mono uppercase text-slate-400 block tracking-wider">CLINICAL PASS</span>
                          <span className="font-bold text-slate-800 text-xs font-sans mt-0.5 block">{modalSuccessTicket.name}</span>
                        </div>
                        <span className="text-[9px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded font-mono uppercase">
                          SLOT {patients.filter(p => p.status === 'waiting').length + 1}
                        </span>
                      </div>

                      <div className="pt-4 flex justify-between items-center">
                        <div>
                          <span className="text-[9px] font-mono uppercase text-slate-500 block leading-tight">ASSIGNED TOKEN</span>
                          <span className="font-mono text-3xl font-extrabold text-blue-650 block mt-1 leading-none">
                            #{modalSuccessTicket.tokenNumber}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] font-mono uppercase text-slate-500 block leading-tight">EST wait-TIME</span>
                          <span className="font-sans text-xs font-bold text-slate-800 block mt-1">
                            ~{modalSuccessTicket.estWait} mins total
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-400 font-mono tracking-tight text-center leading-normal">
                      ID: {Math.random().toString(36).substring(2, 9).toUpperCase()} &bull; Broadcasted on screen instantly
                    </p>

                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="w-full bg-slate-900 hover:bg-slate-850 text-white py-3 rounded-xl font-sans font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
                    >
                      Great, Got It!
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
