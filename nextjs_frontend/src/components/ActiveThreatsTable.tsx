'use client';

import { useAlertStore, ThreatAlert } from '../store/useAlertStore';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, ShieldAlert, ArrowUpRight } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

export default function ActiveThreatsTable() {
  const alerts = useAlertStore((state) => state.alerts);
  const { data: session } = useSession();
  const [escalating, setEscalating] = useState<Record<string, boolean>>({});
  const [escalated, setEscalated] = useState<Record<string, boolean>>({});

  const handleEscalate = async (alert: ThreatAlert, index: number) => {
    if (!session?.accessToken) return;
    
    const key = `${alert.details.timestamp}-${index}`;
    setEscalating(prev => ({ ...prev, [key]: true }));
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://sentinelx-8lqt.onrender.com';
      const res = await fetch(`${apiUrl}/api/v1/incidents/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.accessToken}`
        },
        body: JSON.stringify({
          notes: `Escalated Threat: ${alert.alert_type}\nSource: ${alert.details.source_ip}\nTarget Port: ${alert.details.port}\nProtocol: ${alert.details.protocol}\nAction: ${alert.details.event_action}`,
          status: 'open'
        })
      });
      
      if (res.ok) {
        setEscalated(prev => ({ ...prev, [key]: true }));
      }
    } catch (err) {
      console.error('Failed to escalate incident', err);
    } finally {
      setEscalating(prev => ({ ...prev, [key]: false }));
    }
  };

  const getSeverityStyles = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'bg-neonRed/10 text-neonRed border-neonRed/30';
      case 'medium':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'low':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-slate-500/10 text-slate-300 border-slate-500/30';
    }
  };

  return (
    <div className="bg-gunmetal border border-slateBlack rounded-lg p-6 shadow-lg flex flex-col h-[500px]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-200 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-neonRed" />
          Active Threats
        </h3>
        <span className="text-xs text-slate-400 bg-slateBlack px-3 py-1 rounded-full border border-slate-700">Live Feed</span>
      </div>

      <div className="flex-1 overflow-auto pr-2">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-gunmetal z-10 border-b border-slateBlack text-slate-400">
            <tr>
              <th className="pb-3 font-medium">Timestamp</th>
              <th className="pb-3 font-medium">Type</th>
              <th className="pb-3 font-medium">Severity</th>
              <th className="pb-3 font-medium">Source IP</th>
              <th className="pb-3 font-medium">Target Port</th>
              <th className="pb-3 font-medium">Action</th>
              <th className="pb-3 font-medium text-right">Escalate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slateBlack/50">
            <AnimatePresence initial={false}>
              {alerts.length === 0 ? (
                <motion.tr 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No active threats detected.
                  </td>
                </motion.tr>
              ) : (
                alerts.map((alert, idx) => {
                  const key = `${alert.details.timestamp}-${idx}`;
                  const isEscalating = escalating[key];
                  const isEscalated = escalated[key];
                  const isHigh = alert.severity.toLowerCase() === 'high';

                  return (
                    <motion.tr
                      key={key}
                      initial={{ opacity: 0, y: -20, backgroundColor: 'rgba(255, 0, 60, 0.2)' }}
                      animate={{ opacity: 1, y: 0, backgroundColor: 'rgba(255, 0, 60, 0)' }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4 }}
                      className="group hover:bg-slateBlack/50 transition-colors"
                    >
                      <td className="py-3 text-slate-400 whitespace-nowrap">
                        {new Date(alert.details.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-3 font-medium text-slate-200">
                        {alert.alert_type}
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold border ${getSeverityStyles(alert.severity)}`}>
                          {alert.severity.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-xs text-slate-300">
                        {alert.details.source_ip}
                      </td>
                      <td className="py-3 font-mono text-xs text-slate-300">
                        {alert.details.port} <span className="text-slate-500">({alert.details.protocol})</span>
                      </td>
                      <td className="py-3">
                        <span className={`${alert.details.event_action === 'Blocked' ? 'text-neonRed' : 'text-orange-400'} flex items-center gap-1`}>
                          <AlertCircle className="w-3 h-3" />
                          {alert.details.event_action}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        {isHigh && (
                          <button
                            onClick={() => handleEscalate(alert, idx)}
                            disabled={isEscalating || isEscalated}
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded text-xs font-bold transition-colors ${
                              isEscalated
                                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                : 'bg-neonRed/20 text-neonRed hover:bg-neonRed hover:text-slateBlack'
                            }`}
                          >
                            <ArrowUpRight className="w-3 h-3" />
                            {isEscalated ? 'ESCALATED' : isEscalating ? 'WAIT...' : 'ESCALATE'}
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
