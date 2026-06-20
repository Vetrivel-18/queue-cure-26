import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const PORT = 3000;
const app = express();
const server = createServer(app);

app.use(express.json());

// In-memory queue state (Source of truth)
let patients: any[] = [
  { id: '1', name: 'John Doe', phoneNumber: '555-1029', tokenNumber: 101, status: 'completed' as const, createdAt: new Date(Date.now() - 3600000).toISOString(), calledAt: new Date(Date.now() - 1800000).toISOString(), completedAt: new Date(Date.now() - 900000).toISOString() },
  { id: '2', name: 'Zoe Miller', phoneNumber: '555-4421', tokenNumber: 102, status: 'called' as const, createdAt: new Date(Date.now() - 2400000).toISOString(), calledAt: new Date(Date.now() - 300000).toISOString() },
  { id: '3', name: 'Sarah Connor', phoneNumber: '555-9011', tokenNumber: 103, status: 'waiting' as const, createdAt: new Date(Date.now() - 1200000).toISOString() },
  { id: '4', name: 'Michael Vance', phoneNumber: '555-3810', tokenNumber: 104, status: 'waiting' as const, createdAt: new Date(Date.now() - 600000).toISOString() }
];

let settings = {
  avgConsultationTime: 10 // in minutes
};

let lastTokenNumber = 104;

function calculateStats() {
  const today = new Date().toDateString();
  const patientsToday = patients.filter(p => new Date(p.createdAt).toDateString() === today);
  
  const totalPatientsToday = patientsToday.length;
  const currentQueueLength = patients.filter(p => p.status === 'waiting').length;
  
  // Calculate avg waiting time: from completed patients
  const completed = patients.filter(p => p.status === 'completed' && p.calledAt && p.createdAt);
  let avgWaitingTime = settings.avgConsultationTime;
  
  if (completed.length > 0) {
    const totalWaitMs = completed.reduce((sum, p) => {
      const waitTime = new Date(p.calledAt!).getTime() - new Date(p.createdAt).getTime();
      return sum + waitTime;
    }, 0);
    avgWaitingTime = Math.round((totalWaitMs / completed.length) / 60000); // convert to minutes
  }
  
  return {
    totalPatientsToday,
    currentQueueLength,
    avgWaitingTime: avgWaitingTime > 0 ? avgWaitingTime : settings.avgConsultationTime
  };
}

function getCurrentToken() {
  const active = patients.find(p => p.status === 'called');
  return active ? active.tokenNumber : null;
}

function getNextToken() {
  const waiting = patients.filter(p => p.status === 'waiting').sort((a, b) => a.tokenNumber - b.tokenNumber);
  return waiting.length > 0 ? waiting[0].tokenNumber : null;
}

function getFullQueueState() {
  const currentToken = getCurrentToken();
  const nextToken = getNextToken();
  const stats = calculateStats();
  return {
    patients,
    settings,
    stats,
    currentToken,
    nextToken
  };
}

// WebSocket Server Room management
const clients = new Set<WebSocket>();

const wss = new WebSocketServer({ noServer: true });

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log('Client connected to WebSocket server. Active clients:', clients.size);

  // Send initial state on connection
  ws.send(JSON.stringify({
    type: 'INIT_STATE',
    payload: getFullQueueState()
  }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('Received WebSocket message:', data.type);
      
      // Handlers for real-time actions from client
      switch (data.type) {
        case 'ADD_PATIENT': {
          const { name, phoneNumber } = data.payload;
          lastTokenNumber += 1;
          const newPatient = {
            id: String(Date.now()),
            name,
            phoneNumber,
            tokenNumber: lastTokenNumber,
            status: 'waiting' as const,
            createdAt: new Date().toISOString()
          };
          patients.push(newPatient);
          broadcastQueueUpdate(`Patient ${name} added, Token ${lastTokenNumber} generated.`);
          break;
        }
        case 'CALL_NEXT': {
          // Complete any currently called patients first
          patients = patients.map(p => 
            p.status === 'called' 
              ? { ...p, status: 'completed' as const, completedAt: new Date().toISOString() } 
              : p
          );

          // Find the next waiting patient
          const waiting = patients
            .filter(p => p.status === 'waiting')
            .sort((a, b) => a.tokenNumber - b.tokenNumber);

          if (waiting.length > 0) {
            const nextId = waiting[0].id;
            patients = patients.map(p => 
              p.id === nextId 
                ? { ...p, status: 'called' as const, calledAt: new Date().toISOString() } 
                : p
            );
            const nextPatient = patients.find(p => p.id === nextId);
            broadcastQueueUpdate(`Token ${nextPatient?.tokenNumber} is now being called!`);
          } else {
            broadcastQueueUpdate('No waiting patients in the queue.', 'warning');
          }
          break;
        }
        case 'SKIP_PATIENT': {
          const { id } = data.payload;
          const patientToSkip = patients.find(p => p.id === id);
          if (patientToSkip) {
            patients = patients.map(p => 
              p.id === id ? { ...p, status: 'skipped' as const } : p
            );
            broadcastQueueUpdate(`Token ${patientToSkip.tokenNumber} (${patientToSkip.name}) marked as skipped.`);
          }
          break;
        }
        case 'COMPLETE_PATIENT': {
          const { id } = data.payload;
          const patientToComp = patients.find(p => p.id === id);
          if (patientToComp) {
            patients = patients.map(p => 
              p.id === id ? { ...p, status: 'completed' as const, completedAt: new Date().toISOString() } : p
            );
            broadcastQueueUpdate(`Consultation completed for Token ${patientToComp.tokenNumber}.`);
          }
          break;
        }
        case 'RESET_QUEUE': {
          patients = [];
          lastTokenNumber = 100;
          broadcastQueueUpdate('Clinic queue has been cleared and reset.');
          break;
        }
        case 'UPDATE_SETTINGS': {
          const { avgConsultationTime } = data.payload;
          settings.avgConsultationTime = avgConsultationTime;
          broadcast({
            type: 'SETTINGS_CHANGED',
            payload: settings
          });
          broadcastQueueUpdate(`Average consultation time updated to ${avgConsultationTime} mins.`);
          break;
        }
      }
    } catch (e) {
      console.error('Error processing WS message:', e);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log('Client disconnected from WebSockets. Active clients:', clients.size);
  });
});

function broadcast(msg: object) {
  const messageStr = JSON.stringify(msg);
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(messageStr);
    }
  });
}

function broadcastQueueUpdate(alertMsg: string, notificationType: 'success' | 'info' | 'warning' = 'success') {
  const currentToken = getCurrentToken();
  const nextToken = getNextToken();
  const stats = calculateStats();
  
  // Broadcast updated queue
  broadcast({
    type: 'QUEUE_UPDATED',
    payload: {
      patients,
      stats,
      currentToken,
      nextToken
    }
  });

  // Broadcast toast notification
  broadcast({
    type: 'NOTIFICATION',
    payload: {
      type: notificationType,
      message: alertMsg
    }
  });
}

// REST Backend endpoints for monitoring or initial loads
app.get('/api/queue-state', (req, res) => {
  res.json(getFullQueueState());
});

// Upgrade HTTP Server to support WebSockets on the same port
server.on('upgrade', (req, socket, head) => {
  if (req.url === '/ws' || req.url === '/') {
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit('connection', ws, req);
    });
  } else {
    socket.destroy();
  }
});

// Handle serving the frontend SPA
async function initializeServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Queue Cure Express + WS dev server running on http://localhost:${PORT}`);
  });
}

initializeServer().catch(err => {
  console.error('Failed to start server:', err);
});
