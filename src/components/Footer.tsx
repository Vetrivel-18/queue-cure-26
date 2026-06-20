import { Activity, Github, Shield, HelpCircle, FileText } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-950/75 text-slate-400 py-12 border-t border-white/10 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand/Slogan */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Activity className="w-4.5 h-4.5" />
              </div>
              <span className="font-sans font-extrabold text-base text-white tracking-tight">Queue Cure <span className="text-xs text-blue-400 font-mono">’26</span></span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Replacing paper tokens with smart, real-time queuing experiences. Helping clinics boost patient trust, streamline consultations, and eliminate waiting room crowding.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 font-sans">Platforms</h4>
            <ul className="space-y-2 text-sm">
              <li><span className="hover:text-white transition-colors cursor-pointer">Live Wait Screen</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Reception Desk</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Clinic Telemetry</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Patient Portal</span></li>
            </ul>
          </div>

          {/* Guidelines */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 font-sans">Hackathon Release</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
                <Shield className="w-4 h-4 text-slate-500" />
                <span>HIPAA Compliant</span>
              </li>
              <li className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
                <FileText className="w-4 h-4 text-slate-500" />
                <span>Render / Vercel Specifications</span>
              </li>
              <li className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
                <HelpCircle className="w-4 h-4 text-slate-500" />
                <span>FastAPI WS Managers</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} Queue Cure. Built with passion for patient-care optimization. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-slate-500 text-xs">
            <span className="hover:text-slate-400 transition-colors cursor-pointer">Terms of Service</span>
            <span>&bull;</span>
            <span className="hover:text-slate-400 transition-colors cursor-pointer">Privacy Policy</span>
            <span>&bull;</span>
            <span className="hover:text-slate-400 transition-colors cursor-pointer flex items-center gap-1">
              <Github className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
