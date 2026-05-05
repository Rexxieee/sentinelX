import { create } from 'zustand';

export interface ThreatAlert {
  alert_type: string;
  severity: string;
  details: {
    timestamp: string;
    source_ip: string;
    destination_ip: string;
    port: number;
    protocol: string;
    event_action: string;
    source_geo?: { lat: number; lon: number };
  };
}

interface AlertStore {
  alerts: ThreatAlert[];
  isConnected: boolean;
  addAlert: (alert: ThreatAlert) => void;
  setConnectionStatus: (status: boolean) => void;
  clearAlerts: () => void;
}

export const useAlertStore = create<AlertStore>((set) => ({
  alerts: [],
  isConnected: false,
  addAlert: (alert) => set((state) => ({
    alerts: [alert, ...state.alerts].slice(0, 50) // Keep last 50 alerts
  })),
  setConnectionStatus: (status) => set({ isConnected: status }),
  clearAlerts: () => set({ alerts: [] })
}));
