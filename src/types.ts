export type PatientStatus = 'waiting' | 'called' | 'completed' | 'skipped';

export interface Patient {
  id: string;
  name: string;
  phoneNumber: string;
  tokenNumber: number;
  status: PatientStatus;
  createdAt: string;
  calledAt?: string;
  completedAt?: string;
}

export interface ClinicSettings {
  avgConsultationTime: number; // in minutes
}

export interface QueueStats {
  totalPatientsToday: number;
  currentQueueLength: number;
  avgWaitingTime: number; // in minutes
}

export interface QueueState {
  patients: Patient[];
  settings: ClinicSettings;
  stats: QueueStats;
  currentToken: number | null;
  nextToken: number | null;
}

export type WSMessage =
  | { type: 'INIT_STATE'; payload: QueueState }
  | { type: 'QUEUE_UPDATED'; payload: { patients: Patient[]; stats: QueueStats; currentToken: number | null; nextToken: number | null } }
  | { type: 'SETTINGS_CHANGED'; payload: ClinicSettings }
  | { type: 'NOTIFICATION'; payload: { type: 'success' | 'info' | 'warning'; message: string } };
