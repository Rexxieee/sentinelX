'use client';

import { useAlertStore } from '../store/useAlertStore';
import { useWebSocket } from '../hooks/useWebSocket';

export default function Header() {
  // Initialize WebSocket connection
  useWebSocket();
  const isConnected = useAlertStore((state) => state.isConnected);
  const alertsCount = useAlertStore((state) => state.alerts.length);

  return (
    <header className="h-16 bg-gunmetal border-b border-slateBlack flex items-center justify-between px-8 sticky top-0 z-10 w-full">
      <div className="flex items-center">
        <h2 className="text-lg font-semibold text-slate-200">Security Overview</h2>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">Threat Alerts:</span>
          <span className="px-2 py-0.5 rounded-full bg-slateBlack border border-neonRed text-neonRed text-xs font-bold">
            {alertsCount}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-neonGreen animate-pulse shadow-[0_0_8px_#00ff66]' : 'bg-red-500'}`} />
          <span className="text-sm font-medium text-slate-300">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>
    </header>
  );
}
