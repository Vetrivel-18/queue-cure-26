import { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { WaitingScreen } from './components/WaitingScreen';
import { ToastsContainer } from './components/Notification';
import { Footer } from './components/Footer';
import { Patient, ClinicSettings, QueueStats, QueueState, WSMessage } from './types';

// Root App orchestrator
export default function App() {
  // Navigation Routing Tabs Configuration
  const [activeTab, setActiveTab] = useState<'landing' | 'dashboard' | 'waiting'>('landing');

  // Core synchronized Queue States (defaults seeded for visual polish on start)
  const [patients, setPatients] = useState<Patient[]>([
    { id: '1', name: 'John Doe', phoneNumber: '555-1029', tokenNumber: 101, status: 'completed', createdAt: new Date(Date.now() - 3600000).toISOString(), calledAt: new Date(Date.now() - 1800000).toISOString(), completedAt: new Date(Date.now() - 900000).toISOString() },
    { id: '2', name: 'Zoe Miller', phoneNumber: '555-4421', tokenNumber: 102, status: 'called', createdAt: new Date(Date.now() - 2400000).toISOString(), calledAt: new Date(Date.now() - 300000).toISOString() },
    { id: '3', name: 'Sarah Connor', phoneNumber: '555-9011', tokenNumber: 103, status: 'waiting', createdAt: new Date(Date.now() - 1200000).toISOString() },
    { id: '4', name: 'Michael Vance', phoneNumber: '555-3810', tokenNumber: 104, status: 'waiting', createdAt: new Date(Date.now() - 600000).toISOString() }
  ]);

  const [settings, setSettings] = useState<ClinicSettings>({
    avgConsultationTime: 10
  });

  const [stats, setStats] = useState<QueueStats>({
    totalPatientsToday: 4,
    currentQueueLength: 2,
    avgWaitingTime: 10
  });

  const [currentToken, setCurrentToken] = useState<number | null>(102);
  const [nextToken, setNextToken] = useState<number | null>(103);

  // Connection & Notification alerts states
  const [wsState, setWsState] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const [toasts, setToasts] = useState<{ id: string; type: 'success' | 'info' | 'warning'; message: string }[]>([]);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Toast notifier triggers
  const addToast = (type: 'success' | 'info' | 'warning', message: string) => {
    const id = String(Date.now() + Math.random());
    setToasts(prev => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Safe incremental token generator for fallback mode
  const getNextLocalToken = () => {
    const today = new Date().toDateString();
    const todayTokens = patients.filter(p => new Date(p.createdAt).toDateString() === today);
    if (todayTokens.length === 0) return 101;
    return Math.max(...todayTokens.map(p => p.tokenNumber)) + 1;
  };

  // Re-calculates statistics block in fallback mode
  const recalculateLocalStats = (updatedPatients: Patient[], customAvg?: number) => {
    const today = new Date().toDateString();
    const avgTimeVal = customAvg !== undefined ? customAvg : settings.avgConsultationTime;
    
    const patientsToday = updatedPatients.filter(p => new Date(p.createdAt).toDateString() === today);
    const totalPatientsToday = patientsToday.length;
    
    const currentQueueLength = updatedPatients.filter(p => p.status === 'waiting').length;
    
    // Average Wait duration calculated from actual mock completions
    const completed = updatedPatients.filter(p => p.status === 'completed' && p.calledAt && p.createdAt);
    let avgWaitingTime = avgTimeVal;
    
    if (completed.length > 0) {
      const waitSumMs = completed.reduce((sum, p) => {
        const diffMs = new Date(p.calledAt!).getTime() - new Date(p.createdAt).getTime();
        return sum + diffMs;
      }, 0);
      avgWaitingTime = Math.round((waitSumMs / completed.length) / 60000);
    }
    
    const activeCalled = updatedPatients.find(p => p.status === 'called');
    const waitingSorted = updatedPatients.filter(p => p.status === 'waiting').sort((a,b) => a.tokenNumber - b.tokenNumber);

    setPatients(updatedPatients);
    setStats({
      totalPatientsToday,
      currentQueueLength,
      avgWaitingTime: avgWaitingTime > 0 ? avgWaitingTime : avgTimeVal
    });
    setCurrentToken(activeCalled ? activeCalled.tokenNumber : null);
    setNextToken(waitingSorted.length > 0 ? waitingSorted[0].tokenNumber : null);
  };

  // Real-time WebSocket sync establishing loop
  useEffect(() => {
    const connectWS = () => {
      setWsState('connecting');

      // Extract hosts configurations securely (works beneath reverse-proxies / cloud ports)
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/ws`;

      console.log('Establishing connection to:', wsUrl);
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        setWsState('connected');
        addToast('info', 'Secure real-time clinic queue stream active.');
      };

      ws.onmessage = (event) => {
        try {
          const data: WSMessage = JSON.parse(event.data);
          console.log('Incoming Message type:', data.type);

          switch (data.type) {
            case 'INIT_STATE':
              setPatients(data.payload.patients);
              setSettings(data.payload.settings);
              setStats(data.payload.stats);
              setCurrentToken(data.payload.currentToken);
              setNextToken(data.payload.nextToken);
              break;
            case 'QUEUE_UPDATED':
              setPatients(data.payload.patients);
              setStats(data.payload.stats);
              setCurrentToken(data.payload.currentToken);
              setNextToken(data.payload.nextToken);
              break;
            case 'SETTINGS_CHANGED':
              setSettings(data.payload);
              break;
            case 'NOTIFICATION':
              addToast(data.payload.type, data.payload.message);
              break;
          }
        } catch (e) {
          console.error('Socket decoding error:', e);
        }
      };

      ws.onclose = (event) => {
        setWsState('disconnected');
        console.warn('Socket closed. Fail code:', event.code);
        
        // Loop back reconnects securely unless tab kills
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWS();
        }, 8000);
      };

      ws.onerror = (err) => {
        setWsState('disconnected');
        console.error('Socket error details:', err);
      };
    };

    connectWS();

    // Kill reconnect loops on unmounting
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        // override close to prevent loop loops
        socketRef.current.onclose = null;
        socketRef.current.close();
      }
    };
  }, []);

  // Dispatch Queue Mutation Command triggers
  const executeQueueAction = (action: string, payload?: object) => {
    // If WebSockets is actively connected, push message to server
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: action,
        payload
      }));
    } else {
      // Offline local rollback fallback mode
      console.warn('Running in Local Fallback mode due to disconnected WebSockets. Executing locally.');
      
      switch (action) {
        case 'ADD_PATIENT': {
          const { name, phoneNumber } = payload as { name: string; phoneNumber: string };
          const nextLocalTokenVal = getNextLocalToken();
          const newPatient: Patient = {
            id: String(Date.now()),
            name,
            phoneNumber,
            tokenNumber: nextLocalTokenVal,
            status: 'waiting',
            createdAt: new Date().toISOString()
          };
          const updated = [...patients, newPatient];
          recalculateLocalStats(updated);
          addToast('success', `Patient ${name} added locally. Token #${nextLocalTokenVal} generated!`);
          break;
        }
        case 'CALL_NEXT': {
          // Finalize current called
          let updated = patients.map(p => 
            p.status === 'called' 
              ? { ...p, status: 'completed' as const, completedAt: new Date().toISOString() } 
              : p
          );

          // Select next waiting
          const sortedWaiting = updated.filter(p => p.status === 'waiting').sort((a,b) => a.tokenNumber - b.tokenNumber);
          if (sortedWaiting.length > 0) {
            const nextId = sortedWaiting[0].id;
            updated = updated.map(p => 
              p.id === nextId 
                ? { ...p, status: 'called' as const, calledAt: new Date().toISOString() } 
                : p
            );
            const verifiedActive = updated.find(p => p.id === nextId);
            recalculateLocalStats(updated);
            addToast('success', `Calling Token #${verifiedActive?.tokenNumber} (${verifiedActive?.name}) to consultation!`);
          } else {
            recalculateLocalStats(updated);
            addToast('warning', 'No waiting patients found.');
          }
          break;
        }
        case 'SKIP_PATIENT': {
          const { id } = payload as { id: string };
          const patientToSkip = patients.find(p => p.id === id);
          if (patientToSkip) {
            const updated = patients.map(p => 
              p.id === id ? { ...p, status: 'skipped' as const } : p
            );
            recalculateLocalStats(updated);
            addToast('info', `Token #${patientToSkip.tokenNumber} marked as skipped.`);
          }
          break;
        }
        case 'COMPLETE_PATIENT': {
          const { id } = payload as { id: string };
          const pComp = patients.find(p => p.id === id);
          if (pComp) {
            const updated = patients.map(p => 
              p.id === id ? { ...p, status: 'completed' as const, completedAt: new Date().toISOString() } : p
            );
            recalculateLocalStats(updated);
            addToast('success', `Token #${pComp.tokenNumber} consultation completed.`);
          }
          break;
        }
        case 'RESET_QUEUE': {
          recalculateLocalStats([]);
          addToast('success', 'Local queue reset successfully.');
          break;
        }
        case 'UPDATE_SETTINGS': {
          const { avgConsultationTime } = payload as { avgConsultationTime: number };
          setSettings({ avgConsultationTime });
          recalculateLocalStats(patients, avgConsultationTime);
          addToast('info', `Consultation interval modified to ${avgConsultationTime} minutes.`);
          break;
        }
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/70 relative overflow-hidden font-sans text-slate-800">
      {/* Frosted Glass visual ambient layout background glows */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] rounded-full bg-blue-200/35 blur-[130px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-cyan-200/25 blur-[120px]" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[40%] rounded-full bg-indigo-200/20 blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col flex-grow">
        {/* Clinic Header Navigation Panel */}
        <Navbar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          wsState={wsState} 
        />

        {/* Pages Router View switcher */}
        <main className="flex-grow">
          {activeTab === 'landing' && (
            <LandingPage 
              setActiveTab={setActiveTab} 
              patients={patients} 
              settings={settings} 
              stats={stats}
              onSubmitMockPatient={(name, phone) => {
                executeQueueAction('ADD_PATIENT', { name, phoneNumber: phone });
              }}
            />
          )}

          {activeTab === 'dashboard' && (
            <Dashboard 
              patients={patients}
              settings={settings}
              stats={stats}
              onAddPatient={(name, phone) => {
                executeQueueAction('ADD_PATIENT', { name, phoneNumber: phone });
              }}
              onCallNext={() => {
                executeQueueAction('CALL_NEXT');
              }}
              onSkipPatient={(id) => {
                executeQueueAction('SKIP_PATIENT', { id });
              }}
              onCompletePatient={(id) => {
                executeQueueAction('COMPLETE_PATIENT', { id });
              }}
              onResetQueue={() => {
                executeQueueAction('RESET_QUEUE');
              }}
              onUpdateSettings={(avgConsultTime) => {
                executeQueueAction('UPDATE_SETTINGS', { avgConsultationTime: avgConsultTime });
              }}
            />
          )}

          {activeTab === 'waiting' && (
            <WaitingScreen 
              patients={patients}
              settings={settings}
              stats={stats}
              currentToken={currentToken}
              nextToken={nextToken}
              onAddPatient={(name, phone) => {
                executeQueueAction('ADD_PATIENT', { name, phoneNumber: phone });
              }}
            />
          )}
        </main>

        {/* Modern footer with license microclaims */}
        <Footer />
      </div>

      {/* Sliding Toast alerts containers */}
      <ToastsContainer 
        toasts={toasts} 
        onClose={removeToast} 
      />

    </div>
  );
}
