import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Clock, 
  BellRing, 
  ChevronRight, 
  Play, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Layers, 
  Activity, 
  CheckCircle, 
  UserPlus,
  Palette,
  Eye,
  Code,
  Copy,
  Check,
  Type,
  Info
} from 'lucide-react';
import { Patient, ClinicSettings, QueueStats } from '../types';

const clinicMockup = "/src/assets/images/clinic_queue_mockup_1781946243884.jpg";

interface LandingPageProps {
  setActiveTab: (tab: 'landing' | 'dashboard' | 'waiting') => void;
  patients: Patient[];
  settings: ClinicSettings;
  stats: QueueStats;
  onSubmitMockPatient: (name: string, phone: string) => void;
}

export function LandingPage({ setActiveTab, patients, settings, stats, onSubmitMockPatient }: LandingPageProps) {
  const [demoName, setDemoName] = useState('');
  const [demoPhone, setDemoPhone] = useState('');
  const [demoNameWarning, setDemoNameWarning] = useState(false);
  const [demoPhoneWarning, setDemoPhoneWarning] = useState(false);
  const [demoSubmitted, setDemoSubmitted] = useState(false);
  const [assignedToken, setAssignedToken] = useState<number | null>(null);
  
  // Interactive Web Design Concept Showcase State
  const [showcaseMode, setShowcaseMode] = useState<'mockup' | 'specs' | 'tokens'>('mockup');
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const handleDemoNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const orig = e.target.value;
    const clean = orig.replace(/[^a-zA-Z\s]/g, '');
    if (orig !== clean) {
      setDemoNameWarning(true);
    } else {
      setDemoNameWarning(false);
    }
    setDemoName(clean);
  };

  const handleDemoPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const orig = e.target.value;
    const clean = orig.replace(/[^0-9]/g, '').slice(0, 10);
    if (orig !== clean) {
      setDemoPhoneWarning(true);
    } else {
      setDemoPhoneWarning(false);
    }
    setDemoPhone(clean);
  };

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoName || !demoPhone) return;
    
    setDemoNameWarning(false);
    setDemoPhoneWarning(false);
    onSubmitMockPatient(demoName, demoPhone);
    const mockToken = patients.length > 0 ? Math.max(...patients.map(p => p.tokenNumber)) + 1 : 101;
    setAssignedToken(mockToken);
    setDemoSubmitted(true);
    setDemoName('');
    setDemoPhone('');
    
    setTimeout(() => {
      setDemoSubmitted(false);
      setAssignedToken(null);
    }, 12000);
  };

  const activeCalledPatient = patients.find(p => p.status === 'called');
  const waitingCount = patients.filter(p => p.status === 'waiting').length;
  
  // Calculate specific wait time for a prospect client
  const clientEstimatedWait = waitingCount * settings.avgConsultationTime;

  return (
    <div className="bg-transparent min-h-screen text-slate-800 selection:bg-blue-100 selection:text-blue-800">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-24 md:pt-20 md:pb-32 bg-white/40 backdrop-blur-md border-b border-white/40">
        {/* Soft background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-blue-100/40 rounded-full blur-3xl pointer-events-none -z-1" />
        <div className="absolute top-[60%] right-[-10%] w-[350px] h-[350px] bg-indigo-100/40 rounded-full blur-3xl pointer-events-none -z-1" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Action text */}
            <div className="col-span-1 lg:col-span-7 flex flex-col space-y-6">
              
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex self-start items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100/80 text-xs font-bold text-blue-700 tracking-wide uppercase"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                Next-Gen Queue Management
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="font-sans font-extrabold text-4xl sm:text-5xl lg:text-5.5xl leading-[1.12] text-slate-900 tracking-tight"
              >
                Skip the Waiting.<br />
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 bg-clip-text text-transparent">
                  Know Your Turn.
                </span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed"
              >
                Unlock patient peace of mind and maximize reception efficiency. Queue Cure ’26 replaces paper-based slip systems with an intelligent, real-time waiting broadcast that updates clients instantly via SMS and screens.
              </motion.p>

              {/* CTAs */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2"
              >
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="flex items-center justify-center gap-2 px-7 py-4.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/25 tracking-wide transition-all active:scale-98 cursor-pointer"
                >
                  <span>Launch Receptionist Desk</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
                <a
                  href="#playground"
                  className="flex items-center justify-center gap-2 px-7 py-4.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 font-bold text-slate-700 transition-all active:scale-98 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-slate-700 text-slate-700" />
                  <span>Try Interactive Demo</span>
                </a>
              </motion.div>

              {/* Fast statistics ribbon */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.55 }}
                className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-8"
              >
                <div>
                  <div className="font-mono text-xl sm:text-2xl font-bold text-slate-900">
                    {stats.totalPatientsToday > 0 ? stats.totalPatientsToday : 24}
                  </div>
                  <div className="text-xs text-slate-500 font-medium">Daily Ingress</div>
                </div>
                <div>
                  <div className="font-mono text-xl sm:text-2xl font-bold text-slate-900">
                    {stats.avgWaitingTime}m
                  </div>
                  <div className="text-xs text-slate-500 font-medium font-sans">Avg Wait-Time</div>
                </div>
                <div>
                  <div className="font-mono text-xl sm:text-2xl font-bold text-emerald-600">
                    99.4%
                  </div>
                  <div className="text-xs text-slate-500 font-medium">Satisfaction Rate</div>
                </div>
              </motion.div>
            </div>

            {/* Simulated Desktop Applet Visual Preview */}
            <div className="col-span-1 lg:col-span-5 relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, r: 8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.25 }}
                className="relative bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden w-full max-w-md mx-auto"
              >
                {/* Header elements */}
                <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500" />
                    <span className="w-3 h-3 rounded-full bg-amber-400" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">Live Queue Monitor</span>
                </div>

                {/* Dashboard body */}
                <div className="p-5 flex flex-col gap-5 text-white bg-slate-900/95">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] font-sans text-slate-500 font-semibold tracking-wide uppercase">Now Serving</span>
                      <div className="font-mono text-3xl font-extrabold text-blue-400">
                        {activeCalledPatient ? `#${activeCalledPatient.tokenNumber}` : 'None'}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-sans text-slate-500 font-semibold tracking-wide uppercase">Estimated Wait</span>
                      <div className="font-mono text-3xl font-extrabold text-indigo-400">
                        {clientEstimatedWait} <span className="text-sm font-sans font-medium text-slate-400">min</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-sans text-slate-500 font-semibold tracking-wide uppercase">Up Next in Queue</span>
                    <div className="space-y-1.5 max-h-[140px] overflow-hidden">
                      {patients.filter(p => p.status === 'waiting').length > 0 ? (
                        patients.filter(p => p.status === 'waiting').slice(0, 3).map((p, index) => (
                          <div key={p.id} className="bg-slate-950/60 transition-all hover:bg-slate-950 px-3.5 py-2.5 rounded-lg border border-slate-850 flex justify-between items-center text-xs">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 bg-blue-900/40 border border-blue-800/50 flex items-center justify-center rounded-sm text-[10px] text-blue-300 font-mono">
                                {index + 1}
                              </span>
                              <span className="font-semibold text-slate-200">{p.name}</span>
                            </div>
                            <span className="font-mono bg-slate-900 px-2 py-1 rounded-sm text-indigo-300 font-semibold border border-indigo-900/40">
                              #{p.tokenNumber}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-xs text-slate-500 italic">
                          No patients waiting. Use the demo below to join!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
            
          </div>
        </div>
      </section>

      {/* Comparisons Section */}
      <section className="py-20 md:py-24 bg-white/20 backdrop-blur-md border-b border-white/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-sans font-extrabold text-3xl text-slate-900 tracking-tight">The Clinic Front-desk Evolution</h2>
            <p className="mt-4 text-slate-600">See how modernizing your waiting room experience directly transforms clinical outcomes for clinic staff and patients alike.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
            {/* The clipboard: Old way */}
            <div className="bg-white/40 backdrop-blur-md border border-white/40 rounded-2xl p-7 relative overflow-hidden flex flex-col shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center mb-6">
                <Users className="w-5.5 h-5.5" />
              </div>
              <h3 className="font-sans font-extrabold text-xl text-slate-900 mb-2">The Tragic "Old Clipboard" Way</h3>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                Relies on paper token pads, handwritten Clipboards, or rigid static TV screens with zero interactivity.
              </p>
              
              <ul className="space-y-3.5 text-xs text-slate-600 mt-auto">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-extrabold select-none mt-0.5">&times;</span>
                  <span>Anxious patients crowding reception to ask "How much longer?"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-extrabold select-none mt-0.5">&times;</span>
                  <span>Muddled verbal calls are missed by hard-of-hearing patients.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-extrabold select-none mt-0.5">&times;</span>
                  <span>Duplicate number slips breed waiting room arguments.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-extrabold select-none mt-0.5">&times;</span>
                  <span>Zero statistical logging to optimize shift timings.</span>
                </li>
              </ul>
            </div>

            {/* Smart Digital: Our way */}
            <div className="bg-white/70 backdrop-blur-xl border border-white rounded-2xl p-7 relative overflow-hidden flex flex-col shadow-xl shadow-slate-200/40">
              <div className="absolute top-0 right-0 bg-blue-600 text-white font-mono text-[9px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-bl-xl shadow-xs">
                Smart Queue
              </div>
              
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mb-6">
                <Activity className="w-5.5 h-5.5" />
              </div>
              <h3 className="font-sans font-extrabold text-xl text-slate-900 mb-2">The Queue Cure Way</h3>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                Connects reception, waiting lounge, and patient smartphones under a unified, real-time sync network.
              </p>
              
              <ul className="space-y-3.5 text-xs text-slate-700 mt-auto">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Real-time countdown and "tokens ahead" indicators.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Audio chime alerts broadcast dynamically on calls.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Anti-collision token security shields from duplicates.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Rich statistics track ingress peaks and waiting metrics.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo Playground */}
      <section id="playground" className="py-20 bg-transparent relative scroll-mt-18">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Context */}
            <div className="col-span-1 lg:col-span-6">
              <span className="text-xs font-bold text-blue-600 tracking-widest uppercase mb-2 block font-mono">Hands-On Portal</span>
              <h2 className="font-sans font-extrabold text-3xl text-slate-900 tracking-tight leading-tight mb-4">
                Test the Real-Time Synced Experience Locally
              </h2>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                Submit this playground form to act as a real-time clinic patient! Joining the queue updates the estimates instantly. Go to the <strong className="text-slate-900">Receptionist Desk</strong> tab to call, skip, or finalize this generated patient token and see the changes flow!
              </p>

              <div className="space-y-4">
                <div className="flex gap-3 text-sm">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs font-mono font-bold flex items-center justify-center shrink-0">1</span>
                  <span className="text-slate-600">Insert your name and phone number in this simulation card.</span>
                </div>
                <div className="flex gap-3 text-sm">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs font-mono font-bold flex items-center justify-center shrink-0">2</span>
                  <span className="text-slate-600">The platform generates a genuine sequencial token number.</span>
                </div>
                <div className="flex gap-3 text-sm">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs font-mono font-bold flex items-center justify-center shrink-0">3</span>
                  <span className="text-slate-600">Verify waiting timers update based on the average service settings.</span>
                </div>
              </div>
            </div>

            {/* Test Form Widget */}
            <div className="col-span-1 lg:col-span-6">
              <div className="bg-indigo-950/45 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-slate-900/10">
                <h3 className="font-sans font-extrabold text-xl mb-6 flex items-center gap-2">
                  <UserPlus className="w-6 h-6" />
                  <span>Join Clinic Queue</span>
                </h3>

                {demoSubmitted ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 text-center"
                  >
                    <div className="w-14 h-14 bg-white text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 font-mono font-extrabold text-xl shadow-md">
                      #{assignedToken}
                    </div>
                    <h4 className="font-extrabold text-lg mb-2">Token Registered Successfully!</h4>
                    <p className="text-xs text-blue-100/80 mb-4 px-2">
                      Your virtual spot is reserved. Watch the Live Wait panel or use the Receptionist tab to service your token!
                    </p>
                    <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4 text-xs font-medium">
                      <div>
                        <div className="text-blue-100/60 font-sans uppercase text-[9px] tracking-wide mb-0.5">Tokens Ahead</div>
                        <div className="font-mono text-lg font-bold">{waitingCount}</div>
                      </div>
                      <div>
                        <div className="text-blue-100/60 font-sans uppercase text-[9px] tracking-wide mb-0.5">Estimate Wait</div>
                        <div className="font-mono text-lg font-bold">{clientEstimatedWait}m</div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <form onSubmit={handleDemoSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-blue-100/80 uppercase tracking-widest mb-1.5 font-mono">Patient Name</label>
                      <input
                        type="text"
                        required
                        value={demoName}
                        onChange={handleDemoNameChange}
                        placeholder="e.g. Richard Hendricks"
                        className={`w-full bg-white/10 border rounded-xl px-4 py-3 text-sm text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 transition-all font-sans ${demoNameWarning ? 'border-rose-400 focus:ring-rose-500' : 'border-white/15 focus:ring-white/35'}`}
                      />
                      {demoNameWarning && (
                        <p className="text-[11px] text-rose-350 mt-1.5 font-semibold flex items-center gap-1">
                          <span>⚠️ Enter only characters.</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-blue-100/80 uppercase tracking-widest mb-1.5 font-mono">Phone Number</label>
                      <input
                        type="tel"
                        required
                        value={demoPhone}
                        onChange={handleDemoPhoneChange}
                        placeholder="e.g. 5550192000"
                        className={`w-full bg-white/10 border rounded-xl px-4 py-3 text-sm text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 transition-all font-mono ${demoPhoneWarning ? 'border-rose-400 focus:ring-rose-500' : 'border-white/15 focus:ring-white/35'}`}
                      />
                      {demoPhoneWarning && (
                        <p className="text-[11px] text-rose-350 mt-1.5 font-semibold flex items-center gap-1">
                          <span>⚠️ Enter only numbers (10 digits max).</span>
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-white text-blue-700 hover:bg-slate-50 font-bold py-3.5 px-6 rounded-xl text-sm transition-all shadow-md active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                    >
                      <UserPlus className="w-4.5 h-4.5" />
                      <span>Generate Spot Token</span>
                    </button>
                    <div className="text-center font-sans">
                      <span className="text-[10px] text-blue-100/50 font-semibold tracking-wider uppercase flex items-center justify-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> Safe testing sandboxed data
                      </span>
                    </div>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Web Design Sample Showcase */}
      <section className="py-20 bg-white border-t border-b border-slate-100 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-50/50 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-semibold text-blue-600 tracking-wider uppercase mb-2 block font-mono flex items-center justify-center gap-1.5">
              <Palette className="w-4 h-4" /> Design System Showcase
            </span>
            <h2 className="font-sans font-extrabold text-3xl text-slate-900 tracking-tight leading-tight mb-4">
              Premium Web Design & Interface Concept
            </h2>
            <p className="text-sm text-slate-650 leading-relaxed">
              We focus on human-centric healthcare digital design. High accessibility, modern typography proportions, eye-friendly layout balance, and frictionless client flow on every page.
            </p>
          </div>

          {/* Interactive Lab Navigator Mode Toggles */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/60 shadow-xs">
              <button
                type="button"
                onClick={() => setShowcaseMode('mockup')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold font-sans transition-all flex items-center gap-2 ${
                  showcaseMode === 'mockup'
                    ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-150'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                High-Fi Mockup
              </button>
              <button
                type="button"
                onClick={() => setShowcaseMode('specs')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold font-sans transition-all flex items-center gap-2 ${
                  showcaseMode === 'specs'
                    ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-150'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                Blueprint Specifications
              </button>
              <button
                type="button"
                onClick={() => setShowcaseMode('tokens')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold font-sans transition-all flex items-center gap-2 ${
                  showcaseMode === 'tokens'
                    ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-150'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                Interactive Style Tokens
              </button>
            </div>
          </div>

          {/* Large Interactive Mockup Display Frame */}
          <div className="max-w-5xl mx-auto">
            <motion.div 
              layout
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-2xl shadow-slate-200/40"
            >
              <div className="bg-slate-950 rounded-2xl overflow-hidden shadow-inner border border-slate-900">
                {/* Visual Window Controls OS-style */}
                <div className="bg-slate-900 px-5 py-4 border-b border-slate-850 flex items-center justify-between">
                  <div className="flex gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500/90 shadow-xs" />
                    <span className="w-3 h-3 rounded-full bg-amber-400/90 shadow-xs" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/90 shadow-xs" />
                  </div>
                  <span className="text-[11px] font-mono font-bold text-slate-500 tracking-wider uppercase">
                    {showcaseMode === 'mockup' && 'PREMIUM_DASHBOARD_UX_SPECIFICATION.PNG'}
                    {showcaseMode === 'specs' && 'INTERACTIVE_DESIGN_BLUEPRINT_SCHEMATIC.SVG'}
                    {showcaseMode === 'tokens' && 'QUEUE_CURE_LIVE_STYLE_DICTIONARY.JSON'}
                  </span>
                  <div className="flex items-center gap-1 bg-slate-950/60 px-2.5 py-1 rounded-md border border-slate-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-[9px] font-mono text-slate-400 font-bold">MODE: {showcaseMode.toUpperCase()}</span>
                  </div>
                </div>

                {/* Inner Stage depending on active tab */}
                <div className="relative overflow-hidden bg-slate-950 min-h-[380px] sm:min-h-[480px] flex flex-col justify-between">
                  
                  {/* VIEW 1: raw image mockup */}
                  {showcaseMode === 'mockup' && (
                    <motion.div 
                      key="mockup-view"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="relative w-full h-full flex flex-col justify-between grow"
                    >
                      <div className="aspect-16/10 sm:aspect-16/9 relative overflow-hidden grow">
                        <img 
                          src={clinicMockup} 
                          alt="Premium Clinic Queue Board Web Design Mockup UI Sample" 
                          className="w-full h-full object-cover select-none transition-transform duration-700 hover:scale-[1.01]"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent pointer-events-none" />
                        
                        {/* Hover specs highlight overlay info */}
                        <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md border border-white/10 px-3.5 py-2 rounded-xl text-left hidden sm:block">
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Concept Canvas</p>
                          <p className="text-xs font-semibold text-white mt-0.5">High-Contrast Television Lounge broadcast layout</p>
                        </div>
                      </div>

                      <div className="bg-slate-900/80 backdrop-blur-xs p-5 border-t border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                            <Sparkles className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white block">Designed for Maximum Trust</span>
                            <span className="text-[11px] text-slate-400 leading-normal block max-w-xl">
                              This premium specimen illustrates the layout of visual broadcast tokens in clinical waiting areas. Designed to reduce patient anxiety through clarity.
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 self-end sm:self-center">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-mono">Aesthetic Index:</span>
                          <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-md font-mono font-bold">100 / 100</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* VIEW 2: interactive blue-print markup specs */}
                  {showcaseMode === 'specs' && (
                    <motion.div 
                      key="specs-view"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="relative w-full grow flex flex-col justify-between"
                    >
                      {/* Grid background + relative diagram target overlays */}
                      <div className="relative aspect-16/10 sm:aspect-16/9 bg-slate-950 p-6 flex flex-col justify-center items-center overflow-hidden grow">
                        {/* Architectural grid overlay */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b22_1px,transparent_1px),linear-gradient(to_bottom,#1e293b22_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
                        <div className="absolute inset-0 bg-[radial-gradient(#1e293b44_1px,transparent_1px)] [background-size:12px_12px] opacity-60 pointer-events-none" />
                        
                        {/* Dim mockup image reflection behind blueprint specs */}
                        <div className="absolute inset-0 opacity-20 pointer-events-none select-none">
                          <img src={clinicMockup} alt="Blueprint underlay" className="w-full h-full object-cover filter grayscale blur-xs" referrerPolicy="no-referrer" />
                        </div>

                        {/* Interactive HUD-style callouts overlaying the diagram */}
                        <div className="w-full h-full relative z-10 flex flex-col justify-between p-4">
                          
                          {/* Label 1: Sticky bar */}
                          <div className="absolute top-[8%] left-[5%] right-[5%] border border-dashed border-blue-500/40 bg-blue-950/30 rounded-lg p-2 flex items-center justify-between backdrop-blur-xs">
                            <span className="text-[10px] font-mono text-blue-400 font-bold flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> SEC-01: STICKY BRAND NAVIGATION BAR
                            </span>
                            <span className="text-[9px] font-mono text-slate-400">CLASS: sticky top-0 bg-white/94 backdrop-blur-md</span>
                          </div>

                          {/* Callout 2: Display Typography */}
                          <div className="absolute top-[32%] left-[8%] max-w-[280px] bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-lg select-none">
                            <div className="flex items-center gap-1.5 text-blue-400 text-[10px] font-mono font-bold uppercase mb-1">
                              <Type className="w-3 h-3" /> TYPOGRAPHY ANCHOR
                            </div>
                            <span className="text-xs font-bold text-slate-100 block font-sans">Space Grotesk Display Headings</span>
                            <span className="text-[11px] text-slate-400 block mt-1 leading-normal">
                              We use a modified geometric layout size of 32px to 48px with strict letter-spacing tracking-tight specs. No lowercase overlaps.
                            </span>
                          </div>

                          {/* Callout 3: Accent Red CTA ergonomics */}
                          <div className="absolute bottom-[20%] left-[8%] max-w-[280px] bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-lg select-none">
                            <div className="flex items-center gap-1.5 text-rose-400 text-[10px] font-mono font-bold uppercase mb-1">
                              <Palette className="w-3 h-3" /> ACTION CHROME ERGONOMICS
                            </div>
                            <span className="text-xs font-bold text-slate-100 block font-sans">Color Weight: #EF4444 Red Accent</span>
                            <span className="text-[11px] text-slate-400 block mt-1 leading-normal">
                              Red is chosen purely for critical active state cues (like next patient calling) with eye-friendly light pink boundaries ensuring instant attention.
                            </span>
                          </div>

                          {/* Callout 4: Hospital Token Box */}
                          <div className="absolute top-[28%] right-[8%] max-w-[300px] bg-slate-900/90 border border-blue-500/30 rounded-xl p-3.5 shadow-xl select-none">
                            <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-mono font-bold uppercase mb-1.5">
                              <Layers className="w-3 h-3" /> TOKEN ARCHITECTURE FRAMEWAY
                            </div>
                            <span className="text-xs font-bold text-slate-100 block font-sans">120px Responsive Token Numeration</span>
                            <div className="my-1.5 h-1 w-full bg-slate-850 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-400 w-3/4" />
                            </div>
                            <span className="text-[11px] text-slate-400 block leading-normal">
                              Designed to prioritize critical glance-reading parameters. Patients can easily identify their queue index up to 25 meters away inside complex clinic lounges.
                            </span>
                          </div>

                        </div>
                      </div>

                      <div className="bg-slate-900/85 backdrop-blur-xs p-4 border-t border-slate-800/60 flex items-center justify-between gap-4 font-mono">
                        <div className="flex items-center gap-2">
                          <Info className="w-4 h-4 text-amber-400" />
                          <span className="text-[11px] text-slate-300">Clicking on layout toggles highlights real-time accessibility ratios and proportions.</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">ACCESSIBILITY: AAA RATED</span>
                      </div>
                    </motion.div>
                  )}

                  {/* VIEW 3: Interactive Style System Dictionary, allows copying codes */}
                  {showcaseMode === 'tokens' && (
                    <motion.div 
                      key="tokens-view"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-6 sm:p-8 grow flex flex-col justify-between bg-slate-950 text-left"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 grow mb-4">
                        {/* Sub-block 1: Color token cards */}
                        <div>
                          <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-widest block mb-4">
                            1. ACCESSIBLE COLOR SPECTRUM TOKENS
                          </span>
                          
                          <div className="space-y-3">
                            {[
                              { label: 'Background Pure', code: '#FFFFFF', usage: 'Clinical atmosphere background purity', bg: 'bg-white', text: 'text-slate-900' },
                              { label: 'Primary Text', code: '#1E293B', usage: 'Dense high contrast Slate text body', bg: 'bg-[#1E293B]', text: 'text-white' },
                              { label: 'Accent Red', code: '#EF4444', usage: 'Call-to-Action immediate active cues', bg: 'bg-[#EF4444]', text: 'text-white' },
                              { label: 'Success Green', code: '#10B981', usage: 'Token state progress confirmation', bg: 'bg-[#10B981]', text: 'text-slate-950' },
                              { label: 'Soft Slate', code: '#F8FAFC', usage: 'Inner card backings and section offsets', bg: 'bg-[#F8FAFC]', text: 'text-slate-900 border border-slate-800' }
                            ].map((item, i) => (
                              <div 
                                key={i} 
                                className="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-xl border border-slate-850 hover:border-slate-750 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-lg ${item.bg}`} />
                                  <div>
                                    <span className="text-xs font-bold text-white block font-sans">{item.label}</span>
                                    <span className="text-[10px] text-slate-400 font-mono block leading-none mt-0.5">{item.usage}</span>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(item.code);
                                    setCopiedColor(item.code);
                                    setTimeout(() => setCopiedColor(null), 1500);
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white transition-all text-[10px] font-mono font-semibold flex items-center gap-1.5"
                                >
                                  {copiedColor === item.code ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                                      Copied!
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3.5 h-3.5" />
                                      {item.code}
                                    </>
                                  )}
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Sub-block 2: Typography parameters and specimens */}
                        <div className="flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-widest block mb-4">
                              2. DYNAMIC TYPOGRAPHY RANGE
                            </span>
                            
                            <div className="space-y-4 bg-slate-900/40 p-4 rounded-xl border border-slate-850">
                              <div>
                                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                                  <span>DISPLAY FAMILY: Space Grotesk</span>
                                  <span>WEIGHT: Expl-ExtraBold</span>
                                </div>
                                <span className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-sans block leading-tight">
                                  Skip the Waiting.
                                </span>
                              </div>

                              <div className="border-t border-slate-850 pt-3">
                                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                                  <span>INTERFACE SANS: Inter Suite</span>
                                  <span>WEIGHT: Regular / Medium v4</span>
                                </div>
                                <span className="text-xs text-slate-300 font-normal leading-relaxed block max-w-sm">
                                  This system integrates crisp letter tracking that guarantees flawless reading under active clinic fluorescent lighting.
                                </span>
                              </div>

                              <div className="border-t border-slate-850 pt-3">
                                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                                  <span>MACHINE DATA: JetBrains Mono</span>
                                  <span>WEIGHT: Medium 500</span>
                                </div>
                                <input 
                                  readOnly
                                  value="TOKEN_NUM: 104 | TIME_MIN: 14"
                                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] font-mono text-emerald-400 focus:outline-none pointer-events-none"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="bg-blue-950/20 rounded-xl p-3.5 border border-blue-500/10 flex items-center gap-3 mt-4">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse shrink-0" />
                            <p className="text-[11px] text-slate-300 leading-normal font-sans">
                              Our layout specifications conform fully with the latest <strong>W3C WCAG 2.2</strong> web usability standards.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-850/40 flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span>FORMAT: TOKENS_CATALOGUE_REPRESENTATION</span>
                        <span>COMPILED SUCCESSFULLY</span>
                      </div>
                    </motion.div>
                  )}

                </div>
              </div>
            </motion.div>

            {/* Design Spec bento badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10">
              <div className="bg-white/60 backdrop-blur-md border border-slate-100 rounded-2xl p-5 shadow-xs">
                <span className="font-sans font-bold text-slate-900 text-sm block mb-1">Modern Typography Suite</span>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Carefully balanced font weights using <strong>Inter</strong> and <strong>Space Grotesk</strong> to guarantee flawless reading under active clinic conditions.
                </p>
              </div>
              <div className="bg-white/60 backdrop-blur-md border border-slate-100 rounded-2xl p-5 shadow-xs">
                <span className="font-sans font-bold text-slate-900 text-sm block mb-1">Access-First Color Palette</span>
                <p className="text-[11px] text-slate-500 leading-normal">
                  High contrast colors optimized for patient glance reading and digital TV lounge broadcasting displays with eye-safe saturation.
                </p>
              </div>
              <div className="bg-white/60 backdrop-blur-md border border-slate-100 rounded-2xl p-5 shadow-xs">
                <span className="font-sans font-bold text-slate-900 text-sm block mb-1">Glassmorphic Materiality</span>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Multi-layered depth with frosted borders and dynamic shadows that create immediate visual structure and intuitive page hierarchy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust sections */}
      <section className="bg-slate-50 py-16 border-t border-slate-150">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <span className="text-xs font-bold text-slate-400 font-mono tracking-widest uppercase">Trusted By Leading clinics</span>
          <div className="mt-8 flex flex-wrap justify-center items-center gap-12 text-slate-400 font-sans font-black text-xl select-none opacity-60">
            <span className="hover:text-slate-650 transition-colors">METROPOLITAN CARE</span>
            <span className="hover:text-slate-650 transition-colors">ST. ANTHONY INFR</span>
            <span className="hover:text-slate-650 transition-colors">BLUE CREST LABS</span>
            <span className="hover:text-slate-650 transition-colors">APEX DENTAL</span>
          </div>
        </div>
      </section>

    </div>
  );
}
