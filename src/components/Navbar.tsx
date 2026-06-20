import { Activity, Radio, LayoutDashboard, Monitor, Home } from 'lucide-react';

interface NavbarProps {
  activeTab: 'landing' | 'dashboard' | 'waiting';
  setActiveTab: (tab: 'landing' | 'dashboard' | 'waiting') => void;
  wsState: 'connected' | 'connecting' | 'disconnected';
}

export function Navbar({ activeTab, setActiveTab, wsState }: NavbarProps) {
  const wsBadgeStyle = {
    connected: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500 animate-pulse',
      label: 'Live Connected',
    },
    connecting: {
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      dot: 'bg-amber-400 animate-ping',
      label: 'Syncing...',
    },
    disconnected: {
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      dot: 'bg-rose-500',
      label: 'Local Dev Mode',
    },
  }[wsState];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/40 border-b border-white/40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Identity / Logo */}
        <div 
          onClick={() => setActiveTab('landing')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-200/50 group-hover:scale-105 transition-transform">
            <Activity className="w-5.5 h-5.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-sans font-extrabold text-lg text-slate-900 tracking-tight">Queue Cure</span>
              <span className="text-xs bg-blue-100/70 text-blue-800 font-bold px-1.5 py-0.5 rounded-md font-mono">’26</span>
            </div>
            <span className="text-[10px] font-sans text-slate-500 font-medium tracking-wide uppercase">Smart Clinic</span>
          </div>
        </div>

        {/* Dynamic Interactive Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => setActiveTab('landing')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'landing'
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Home className="w-4 h-4" />
            Home
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'dashboard'
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Receptionist Desk
          </button>
          <button
            onClick={() => setActiveTab('waiting')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'waiting'
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Monitor className="w-4 h-4" />
            Waiting Monitor
          </button>
        </nav>

        {/* Connection status badge / Call-to-action */}
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-full text-xs font-semibold ${wsBadgeStyle.bg}`}>
            <span className={`w-2 h-2 rounded-full ${wsBadgeStyle.dot}`} />
            <span className="hidden sm:inline font-mono uppercase tracking-wider">{wsBadgeStyle.label}</span>
            <span className="sm:hidden font-mono uppercase">Live</span>
          </div>
          
          <button
            onClick={() => setActiveTab(activeTab === 'dashboard' ? 'waiting' : 'dashboard')}
            className="text-xs font-bold leading-none py-2 px-4 rounded-lg bg-slate-900 text-white hover:bg-slate-800 shadow-sm hover:shadow-md transition-all active:scale-97 cursor-pointer"
          >
            {activeTab === 'dashboard' ? 'Open Waiting Room' : 'Open Dashboard'}
          </button>
        </div>
      </div>
      
      {/* Mobile-only compact quick navigation bar */}
      <div className="md:hidden flex items-center justify-around py-2 bg-slate-50/50 border-t border-blue-50/60 text-xs">
        <button
          onClick={() => setActiveTab('landing')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-md transition-colors ${
            activeTab === 'landing' ? 'text-blue-600 font-semibold' : 'text-slate-500'
          }`}
        >
          <Home className="w-4.5 h-4.5" />
          <span>Home</span>
        </button>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-md transition-colors ${
            activeTab === 'dashboard' ? 'text-blue-600 font-semibold' : 'text-slate-500'
          }`}
        >
          <LayoutDashboard className="w-4.5 h-4.5" />
          <span>Receptionist</span>
        </button>
        <button
          onClick={() => setActiveTab('waiting')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-md transition-colors ${
            activeTab === 'waiting' ? 'text-blue-600 font-semibold' : 'text-slate-500'
          }`}
        >
          <Monitor className="w-4.5 h-4.5" />
          <span>Monitor</span>
        </button>
      </div>
    </header>
  );
}
