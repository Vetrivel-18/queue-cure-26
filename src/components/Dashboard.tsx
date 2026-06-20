import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Clock, 
  PlusCircle, 
  CornerDownRight, 
  AlertTriangle, 
  Check, 
  X, 
  Trash2, 
  Settings, 
  TrendingUp, 
  UserCheck, 
  ArrowRight,
  ShieldAlert,
  Printer,
  User,
  Phone
} from 'lucide-react';
import { Patient, ClinicSettings, QueueStats } from '../types';

interface DashboardProps {
  patients: Patient[];
  settings: ClinicSettings;
  stats: QueueStats;
  onAddPatient: (name: string, phone: string) => void;
  onCallNext: () => void;
  onSkipPatient: (id: string) => void;
  onCompletePatient: (id: string) => void;
  onResetQueue: () => void;
  onUpdateSettings: (avgConsultTime: number) => void;
}

export function Dashboard({
  patients,
  settings,
  stats,
  onAddPatient,
  onCallNext,
  onSkipPatient,
  onCompletePatient,
  onResetQueue,
  onUpdateSettings,
}: DashboardProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [nameWarning, setNameWarning] = useState(false);
  const [phoneWarning, setPhoneWarning] = useState(false);
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [avgTime, setAvgTime] = useState(settings.avgConsultationTime);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [formError, setFormError] = useState('');

  const nameRegex = /^[a-zA-Z\s]+$/;
  const phoneRegex = /^[0-9]{10}$/;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const orig = e.target.value;
    setName(orig);

    if (orig.trim() === '') {
      setNameError('');
      setNameWarning(false);
    } else if (!nameRegex.test(orig)) {
      setNameError('Patient name must contain alphabetical letters and spaces only.');
      setNameWarning(true);
    } else {
      setNameError('');
      setNameWarning(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const orig = e.target.value;
    
    // Smooth helper: let user type digits but restrict characters visually to numbers
    const cleanNumbersOnly = orig.replace(/[^0-9]/g, '');
    setPhone(cleanNumbersOnly);

    if (cleanNumbersOnly === '') {
      setPhoneError('');
      setPhoneWarning(false);
    } else if (cleanNumbersOnly.length !== 10) {
      setPhoneError('Phone number must be exactly 10 digits (e.g., 5550192000).');
      setPhoneWarning(true);
    } else {
      setPhoneError('');
      setPhoneWarning(false);
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const trimmedName = name.trim();
    const strippedPhone = phone.replace(/[^0-9]/g, '');

    // Strict validation check via precise regex
    if (!trimmedName) {
      setFormError('Patient name is required.');
      return;
    }
    if (!nameRegex.test(trimmedName)) {
      setFormError('Validation failed: Name can only contain letters and spaces.');
      setNameError('Patient name must contain alphabetical letters and spaces only.');
      setNameWarning(true);
      return;
    }

    if (strippedPhone.length !== 10) {
      setFormError('Validation failed: Phone number must be exactly 10 digits.');
      setPhoneError('Phone number must be exactly 10 digits (e.g., 5550192000).');
      setPhoneWarning(true);
      return;
    }

    // Guard: Prevent double bookings / simultaneous identical submissions
    const isDuplicate = patients.some(
      (p) => 
        p.status === 'waiting' && 
        p.name.toLowerCase() === trimmedName.toLowerCase() && 
        p.phoneNumber.replace(/\D/g, '') === strippedPhone
    );
    if (isDuplicate) {
      setFormError('This active patient is already waiting in the queue.');
      return;
    }

    onAddPatient(trimmedName, strippedPhone);
    setName('');
    setPhone('');
    setNameError('');
    setPhoneError('');
    setNameWarning(false);
    setPhoneWarning(false);
  };

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(avgTime);
  };

  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to open the daily report print view.');
      return;
    }

    const currentDateText = new Date().toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const currentTimeText = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Compute metrics
    const completedCount = patients.filter(p => p.status === 'completed').length;
    const skippedCount = patients.filter(p => p.status === 'skipped').length;
    const waitingCount = patients.filter(p => p.status === 'waiting').length;
    const totalCount = patients.length;

    const patientRowsHtml = patients.map(p => {
      let statusColor = '#475569';
      let statusBg = '#f8fafc';
      let statusBorder = '#e2e8f0';
      if (p.status === 'completed') {
        statusColor = '#065f46';
        statusBg = '#ecfdf5';
        statusBorder = '#a7f3d0';
      } else if (p.status === 'skipped') {
        statusColor = '#991b1b';
        statusBg = '#fef2f2';
        statusBorder = '#fecaca';
      } else if (p.status === 'called') {
        statusColor = '#1e40af';
        statusBg = '#eff6ff';
        statusBorder = '#bfdbfe';
      }

      const actionTime = p.completedAt 
        ? new Date(p.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '-';

      return `
        <tr>
          <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; font-family: monospace; font-weight: bold; color: #2563eb;">#${p.tokenNumber}</td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #1e293b;">${p.name}</td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; font-family: monospace; color: #64748b;">${p.phoneNumber || 'N/A'}</td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9;">
            <span style="display: inline-block; padding: 3px 8px; border-radius: 6px; font-weight: 600; font-size: 10px; letter-spacing: 0.02em; text-transform: uppercase; background-color: ${statusBg}; color: ${statusColor}; border: 1px solid ${statusBorder};">
              ${p.status}
            </span>
          </td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; font-family: monospace; color: #64748b; text-align: right;">${actionTime}</td>
        </tr>
      `;
    }).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Daily Report - Queue Cure '26</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;850&family=Space+Grotesk:wght@600;700&display=swap');
            
            body {
              font-family: 'Inter', sans-serif;
              color: #1e293b;
              background-color: #ffffff;
              margin: 40px;
              padding: 0;
              line-height: 1.5;
            }

            @media print {
              body {
                margin: 20px;
              }
              .no-print {
                display: none !important;
              }
            }

            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid #f1f5f9;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }

            .logo-area {
              display: flex;
              align-items: center;
              gap: 10px;
            }

            .logo-icon {
              width: 32px;
              height: 32px;
              background-color: #ef4444;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 20px;
            }

            .logo-text {
              font-family: 'Space Grotesk', sans-serif;
              font-size: 22px;
              font-weight: 700;
              color: #0f172a;
            }

            .logo-year {
              font-size: 11px;
              background-color: #fee2e2;
              color: #ef4444;
              padding: 2px 6px;
              border-radius: 4px;
              font-weight: bold;
              margin-left: 6px;
            }

            .report-title-block {
              text-align: right;
            }

            .report-title-block h1 {
              font-family: 'Space Grotesk', sans-serif;
              margin: 0;
              font-size: 24px;
              color: #1e293b;
              font-weight: 700;
              letter-spacing: -0.02em;
            }

            .report-title-block p {
              margin: 5px 0 0 0;
              font-size: 13px;
              color: #64748b;
            }

            .metrics-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 20px;
              margin-bottom: 35px;
            }

            .metric-box {
              background-color: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 16px;
              text-align: left;
            }

            .metric-lbl {
              font-size: 11px;
              font-weight: 600;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }

            .metric-val {
              font-size: 28px;
              font-weight: 700;
              color: #0f172a;
              margin: 5px 0;
            }

            .metric-sub {
              font-size: 11px;
              color: #94a3b8;
            }

            .section-lbl {
              font-family: 'Space Grotesk', sans-serif;
              font-size: 16px;
              font-weight: 700;
              color: #0f172a;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 10px;
              margin-bottom: 15px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 40px;
            }

            th {
              background-color: #f8fafc;
              border-bottom: 2px solid #e2e8f0;
              color: #475569;
              font-weight: 600;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              padding: 12px 16px;
              text-align: left;
            }

            .footer-info {
              margin-top: 60px;
              border-top: 1px solid #f1f5f9;
              padding-top: 15px;
              text-align: center;
              font-size: 11px;
              color: #94a3b8;
            }

            .btn-print-action {
              display: inline-block;
              background-color: #ef4444;
              color: white;
              border: none;
              padding: 10px 20px;
              font-size: 13px;
              font-weight: 600;
              border-radius: 8px;
              cursor: pointer;
              margin-bottom: 20px;
              font-family: inherit;
              box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.1), 0 2px 4px -1px rgba(239, 68, 68, 0.06);
            }
            
            .btn-print-action:hover {
              background-color: #dc2626;
            }
          </style>
        </head>
        <body>
          <div style="max-width: 800px; margin: 0 auto;">
            <div class="no-print" style="text-align: right; margin-bottom: 10px;">
              <button class="btn-print-action" onclick="window.print()">Print Report / Save as PDF</button>
            </div>

            <div class="header">
              <div class="logo-area">
                <div class="logo-icon">+</div>
                <div>
                  <span class="logo-text">Queue Cure</span>
                  <span class="logo-year">'26</span>
                </div>
              </div>
              <div class="report-title-block">
                <h1>Daily Clinical Report</h1>
                <p>${currentDateText} &bull; ${currentTimeText}</p>
              </div>
            </div>

            <div class="metrics-grid">
              <div class="metric-box">
                <div class="metric-lbl">Total Registered</div>
                <div class="metric-val">${totalCount}</div>
                <div class="metric-sub">Total shift entries</div>
              </div>
              <div class="metric-box" style="border-top: 3px solid #10b981;">
                <div class="metric-lbl">Completed</div>
                <div class="metric-val">${completedCount}</div>
                <div class="metric-sub">Attended by doctor</div>
              </div>
              <div class="metric-box" style="border-top: 3px solid #ef4444;">
                <div class="metric-lbl">No-Show / Skipped</div>
                <div class="metric-val">${skippedCount}</div>
                <div class="metric-sub">Skipped sessions</div>
              </div>
              <div class="metric-box">
                <div class="metric-lbl">Active Waiting</div>
                <div class="metric-val">${waitingCount}</div>
                <div class="metric-sub">In clinical lounge</div>
              </div>
            </div>

            <div class="section-lbl">Shift Consultation Record</div>
            ${patients.length > 0 ? `
              <table>
                <thead>
                  <tr>
                    <th style="width: 15%">Token</th>
                    <th style="width: 35%">Patient Name</th>
                    <th style="width: 20%">Contact Phone</th>
                    <th style="width: 15%">Status</th>
                    <th style="width: 15%; text-align: right;">Activity Log</th>
                  </tr>
                </thead>
                <tbody>
                  ${patientRowsHtml}
                </tbody>
              </table>
            ` : `
              <div style="padding: 40px; text-align: center; color: #94a3b8; border: 1px dashed #cbd5e1; border-radius: 12px; font-size: 13px;">
                No clinic check-ins logged for today's session.
              </div>
            `}

            <div class="footer-info">
              Authentic Queue Cure '26 Database Record &bull; Generated securely on demand &bull; Page 1 of 1
            </div>
          </div>

          <script>
            // Automatically launch system print modal tool
            window.addEventListener('DOMContentLoaded', () => {
              setTimeout(() => {
                window.print();
              }, 400);
            });
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Group patients for display
  const activePatient = patients.find((p) => p.status === 'called');
  const waitingPatients = patients.filter((p) => p.status === 'waiting');
  const processedPatients = patients.filter((p) => p.status === 'completed' || p.status === 'skipped');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      
      {/* Title block */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-sans font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="text-blue-600 w-8 h-8" />
            <span>Receptionist Dashboard</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">Register incoming clinic visits and direct token workflows in real-time.</p>
        </div>

        {/* Action Header area */}
        <div className="flex flex-wrap items-center gap-3.5 self-start md:self-center">
          <button
            type="button"
            onClick={handlePrintReport}
            className="bg-white hover:bg-slate-50 text-slate-700 font-sans font-bold text-xs px-4 py-3 rounded-xl border border-slate-200 hover:border-slate-300 shadow-xs flex items-center gap-2 cursor-pointer transition-all active:scale-98"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Daily Report</span>
          </button>

          {/* Live Active serving block */}
          {activePatient && (
            <div className="bg-blue-600 text-white rounded-xl px-5 py-3 shadow-md flex items-center gap-4">
              <UserCheck className="w-6 h-6 animate-pulse" />
              <div>
                <div className="text-[10px] uppercase font-bold tracking-widest text-blue-200">Active Consultation</div>
                <div className="font-mono text-lg font-black shrink-0">
                  Token #{activePatient.tokenNumber} <span className="text-sm font-sans font-normal opacity-90 font-sans">({activePatient.name})</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Analytics Statistics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        
        {/* Total Patients */}
        <div className="bg-white/60 backdrop-blur-md border border-white rounded-2xl p-6 shadow-sm shadow-slate-200/50 flex items-center gap-5">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider font-sans block">Patients Today</span>
            <span className="font-mono text-3xl font-extrabold text-slate-900 block leading-tight">{stats.totalPatientsToday}</span>
            <span className="text-[10px] text-slate-400 font-medium">Recorded digital tokens</span>
          </div>
        </div>

        {/* Current lengths */}
        <div className="bg-white/60 backdrop-blur-md border border-white rounded-2xl p-6 shadow-sm shadow-slate-200/50 flex items-center gap-5">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider font-sans block">Current Waiting</span>
            <span className="font-mono text-3xl font-extrabold text-slate-900 block leading-tight">{stats.currentQueueLength}</span>
            <span className="text-[10px] text-slate-400 font-medium">Patients active in lounge</span>
          </div>
        </div>

        {/* Wait estimation logic */}
        <div className="bg-white/60 backdrop-blur-md border border-white rounded-2xl p-6 shadow-sm shadow-slate-200/50 flex items-center gap-5">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider font-sans block">Avg Wait Duration</span>
            <span className="font-mono text-3xl font-extrabold text-slate-900 block leading-tight">{stats.avgWaitingTime}m</span>
            <span className="text-[10px] text-slate-400 font-medium">Computed dynamically</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column: Controls and adding */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Form: Add patient */}
          <div className="bg-white/60 backdrop-blur-md border border-white rounded-2xl p-6 shadow-sm shadow-slate-200/50">
            <h3 className="font-sans font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
              <PlusCircle className="text-blue-500 w-5 h-5" />
              <span>Digital Registration</span>
            </h3>

            {formError && (
              <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs font-semibold flex items-start gap-2 animate-shake">
                <ShieldAlert className="w-4.5 h-4.5 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label htmlFor="patient-name-input" className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-sans">
                  Patient Full Name
                </label>
                <div className="relative">
                  <User aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
                  <input
                    id="patient-name-input"
                    type="text"
                    required
                    aria-invalid={nameWarning ? "true" : "false"}
                    aria-describedby={nameWarning ? "name-error-msg" : undefined}
                    value={name}
                    onChange={handleNameChange}
                    placeholder="e.g. Marie Curie"
                    className={`w-full bg-slate-50 border rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all text-slate-800 font-sans font-medium ${
                      nameWarning 
                        ? 'border-rose-450 focus:border-rose-500 focus:ring-rose-200 bg-rose-50/20' 
                        : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
                    }`}
                  />
                </div>
                {nameWarning && (
                  <p id="name-error-msg" role="alert" className="text-[11px] text-rose-600 mt-1.5 font-semibold flex items-center gap-1">
                    <span>⚠️ {nameError || 'Enter characters/spaces only (e.g. Jane Doe).'}</span>
                  </p>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="patient-phone-input" className="block text-xs font-bold text-slate-500 uppercase tracking-widest font-sans">
                    Contact Phone Number
                  </label>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${phone.length === 10 ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-100' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                    {phone.length}/10 Digits
                  </span>
                </div>
                <div className="relative">
                  <Phone aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
                  <input
                    id="patient-phone-input"
                    type="tel"
                    required
                    aria-invalid={phoneWarning ? "true" : "false"}
                    aria-describedby={phoneWarning ? "phone-error-msg" : undefined}
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="e.g. 5550122000"
                    maxLength={10}
                    className={`w-full bg-slate-50 border rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all text-slate-800 font-mono font-medium tracking-wide ${
                      phoneWarning 
                        ? 'border-rose-450 focus:border-rose-500 focus:ring-rose-200 bg-rose-50/20' 
                        : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
                    }`}
                  />
                </div>
                {phoneWarning && (
                  <p id="phone-error-msg" role="alert" className="text-[11px] text-rose-600 mt-1.5 font-semibold flex items-center gap-1">
                    <span>⚠️ {phoneError || 'Please enter exactly 10 numeric digits.'}</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-sans font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all active:scale-98 shadow-md shadow-blue-500/10 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <PlusCircle className="w-4.5 h-4.5" />
                <span>Generate Digital Slip</span>
              </button>
            </form>
          </div>

          {/* Quick core actions */}
          <div className="bg-white/60 backdrop-blur-md border border-white rounded-2xl p-6 shadow-sm shadow-slate-200/50 flex flex-col gap-3">
            <h3 className="font-sans font-bold text-slate-900 text-base mb-1">Queue Handlers</h3>
            <p className="text-xs text-slate-400 mb-3">Conduct the real-time clinic consultations line chronologically.</p>

            <button
              onClick={onCallNext}
              disabled={waitingPatients.length === 0}
              className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold text-white transition-all active:scale-97 flex items-center justify-center gap-2 cursor-pointer ${
                waitingPatients.length > 0
                  ? 'bg-linear-to-r from-blue-600 to-indigo-600 hover:shadow-md hover:scale-[1.01]'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <CornerDownRight className="w-4.5 h-4.5" />
              <span>Call Next Patient</span>
            </button>

            {/* Complete active called */}
            {activePatient && (
              <button
                onClick={() => onCompletePatient(activePatient.id)}
                className="w-full bg-emerald-50 text-emerald-700 border border-emerald-150 hover:bg-emerald-100 font-bold py-3.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check className="w-4.5 h-4.5" />
                <span>Complete Active Session</span>
              </button>
            )}

            {activePatient && (
              <button
                onClick={() => onSkipPatient(activePatient.id)}
                className="w-full bg-amber-50 text-amber-700 border border-amber-100 hover:bg-amber-100 font-bold py-3.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
                <span>Skip Active Token</span>
              </button>
            )}

            {/* Dangerous reset */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              {showResetConfirm ? (
                <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-center">
                  <span className="text-xs font-semibold text-amber-800 block mb-2 leading-relaxed">
                    Confirm complete wipe? This clears all entries.
                  </span>
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => {
                        onResetQueue();
                        setShowResetConfirm(false);
                      }}
                      className="bg-rose-600 text-white text-xs font-bold py-1.5 px-3 rounded-lg hover:bg-rose-700 cursor-pointer"
                    >
                      Yes, Clear
                    </button>
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="bg-slate-200 text-slate-700 text-xs font-bold py-1.5 px-3 rounded-lg hover:bg-slate-300 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="w-full border border-rose-200 hover:border-rose-450 text-rose-600 hover:bg-rose-50/50 font-bold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Reset & Wipe Queue</span>
                </button>
              )}
            </div>
          </div>

          {/* Consultation setup Interval config */}
          <div className="bg-white/60 backdrop-blur-md border border-white rounded-2xl p-6 shadow-sm shadow-slate-200/50">
            <h3 className="font-sans font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
              <Settings className="text-slate-500 w-4.5 h-4.5" />
              <span>Diagnostic Clock Config</span>
            </h3>

            <form onSubmit={handleSettingsSubmit} className="flex gap-3">
              <div className="flex-1">
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={avgTime}
                  onChange={(e) => setAvgTime(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-800"
                />
              </div>
              <button
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 rounded-xl transition-all active:scale-97 cursor-pointer"
              >
                Apply Mins
              </button>
            </form>
            <span className="text-[10px] text-slate-400 font-medium block mt-2">
              Alters estimated waits (Patients ahead &times; Avg consultation time).
            </span>
          </div>

        </div>

        {/* Right column: Tables / Viewport */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Queue Board Table */}
          <div className="bg-white/85 backdrop-blur-xl border border-white rounded-2xl shadow-xl shadow-slate-200/40 overflow-hidden">
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-sans font-extrabold text-slate-900 text-base">Active Waiting Line</h3>
                <p className="text-xs text-slate-400 mt-0.5">Chronologically ordered patients pending attention.</p>
              </div>
              <span className="bg-blue-50 border border-blue-100 text-blue-700 font-mono text-xs font-bold px-2.5 py-1 rounded-full">
                {waitingPatients.length} Waiting
              </span>
            </div>

            {waitingPatients.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                      <th className="py-3 px-6 select-none">Token</th>
                      <th className="py-3 px-6">Name</th>
                      <th className="py-3 px-6">Phone</th>
                      <th className="py-3 px-6">Est. Wait</th>
                      <th className="py-3 px-6 text-right">Operational Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-sm">
                    {waitingPatients.map((p, index) => {
                      const computedWait = index * settings.avgConsultationTime;
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-4 px-6">
                            <span className="font-mono font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-md text-xs select-none">
                              #{p.tokenNumber}
                            </span>
                          </td>
                          <td className="py-4 px-6 font-semibold text-slate-800">{p.name}</td>
                          <td className="py-4 px-6 font-mono text-xs text-slate-500">{p.phoneNumber}</td>
                          <td className="py-4 px-6">
                            <span className="font-mono font-medium text-slate-700 text-xs">
                              {computedWait} <span className="text-[10px] text-slate-450 font-sans">min</span>
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right flex justify-end gap-1.5">
                            <button
                              onClick={() => {
                                // Simulate calling this specific patient directly
                                onCallNext();
                              }}
                              title="Call to desk"
                              className="bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 font-bold px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer"
                            >
                              Call
                            </button>
                            <button
                              onClick={() => onSkipPatient(p.id)}
                              title="Mark as skipped"
                              className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-all cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center">
                <Users className="w-12 h-12 text-slate-250 mx-auto mb-3" />
                <h4 className="font-bold text-slate-400 text-sm">Lounge area is clear</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1 leading-relaxed">
                  There are no waiting patients. Register one using the left registration form to trigger updates.
                </p>
              </div>
            )}
          </div>

          {/* Processed / Completed Board */}
          <div className="bg-white/85 backdrop-blur-xl border border-white rounded-2xl shadow-xl shadow-slate-200/40 overflow-hidden">
            <div className="px-6 py-4.5 border-b border-slate-100">
              <h3 className="font-sans font-extrabold text-slate-900 text-sm">Consulted & Skipped Logs</h3>
              <p className="text-xs text-slate-400 mt-0.5">Records of patients processed during this shift.</p>
            </div>

            {processedPatients.length > 0 ? (
              <div className="max-h-[300px] overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                      <th className="py-3 px-6">Token</th>
                      <th className="py-3 px-6">Name</th>
                      <th className="py-3 px-6">Status</th>
                      <th className="py-3 px-6 text-right">Processed Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-xs">
                    {processedPatients.slice().reverse().map((p) => {
                      const completedBadge = p.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : 'bg-rose-50 text-rose-700 border-rose-100';
                      
                      const timestamp = p.completedAt 
                        ? new Date(p.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'N/A';

                      return (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-6">
                            <span className="font-mono font-bold text-slate-600 px-2 py-0.5 border border-slate-100 bg-slate-50 rounded">
                              #{p.tokenNumber}
                            </span>
                          </td>
                          <td className="py-3 px-6 font-medium text-slate-700">{p.name}</td>
                          <td className="py-3 px-6">
                            <span className={`px-2 py-0.5 border rounded-sm font-semibold capitalize ${completedBadge}`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="py-3 px-6 text-right font-mono text-slate-400">
                            {timestamp}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400 italic">
                No consultations recorded yet for this session.
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
