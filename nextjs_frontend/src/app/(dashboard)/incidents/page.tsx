'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, PlayCircle, CheckCircle2, RefreshCw } from 'lucide-react';

interface Incident {
  id: string;
  status: 'open' | 'investigating' | 'resolved';
  assigned_to: string | null;
  notes: string;
}

export default function IncidentsPage() {
  const { data: session } = useSession();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://sentinelx-8lqt.onrender.com';

  const fetchIncidents = async () => {
    if (!(session as any)?.accessToken) return;
    try {
      const res = await fetch(`${apiUrl}/api/v1/incidents/`, {
        headers: { 'Authorization': `Bearer ${(session as any).accessToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setIncidents(data);
      }
    } catch (err) {
      console.error('Failed to fetch incidents', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [session]);

  const updateIncidentStatus = async (id: string, newStatus: string) => {
    if (!(session as any)?.accessToken) return;
    
    // Optimistic update
    setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, status: newStatus as any } : inc));

    try {
      await fetch(`${apiUrl}/api/v1/incidents/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(session as any).accessToken}`
        },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (err) {
      console.error('Failed to update incident', err);
      // Revert on failure
      fetchIncidents();
    }
  };

  const handleDeleteIncident = async (id: string) => {
    if (!(session as any)?.accessToken) return;
    if (!confirm('Are you sure you want to delete this incident?')) return;

    try {
      const res = await fetch(`${apiUrl}/api/v1/incidents/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${(session as any).accessToken}` }
      });

      if (res.ok) {
        fetchIncidents();
      }
    } catch (err) {
      console.error('Failed to delete incident', err);
    }
  };

  const columns = [
    {
      id: 'open',
      title: 'Open',
      icon: <Clock className="w-5 h-5 text-neonRed" />,
      color: 'border-neonRed',
      nextAction: 'investigating',
      actionLabel: 'Investigate'
    },
    {
      id: 'investigating',
      title: 'Investigating',
      icon: <PlayCircle className="w-5 h-5 text-orange-400" />,
      color: 'border-orange-500',
      nextAction: 'resolved',
      actionLabel: 'Resolve'
    },
    {
      id: 'resolved',
      title: 'Resolved',
      icon: <CheckCircle2 className="w-5 h-5 text-neonGreen" />,
      color: 'border-neonGreen',
      nextAction: null,
      actionLabel: ''
    }
  ];

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-white">Incident Response</h1>
          <p className="text-slate-400">Manage escalated threats and active investigations.</p>
        </div>
        <button 
          onClick={fetchIncidents}
          className="flex items-center gap-2 px-4 py-2 bg-slateBlack border border-slate-700 rounded text-slate-300 hover:text-white hover:border-slate-500 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 min-h-0">
        {columns.map(col => {
          const colIncidents = incidents.filter(i => i.status === col.id);
          
          return (
            <div key={col.id} className="bg-gunmetal border border-slateBlack rounded-lg shadow-lg flex flex-col h-full overflow-hidden">
              <div className={`p-4 border-b border-slateBlack border-t-2 ${col.color} bg-slateBlack/50 flex items-center justify-between`}>
                <div className="flex items-center gap-2 font-bold text-slate-200">
                  {col.icon}
                  <span className="capitalize">{col.title}</span>
                </div>
                <span className="bg-gunmetal px-2 py-0.5 rounded text-xs font-bold text-slate-400 border border-slate-700">
                  {colIncidents.length}
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading && incidents.length === 0 ? (
                  <div className="text-center text-slate-500 text-sm py-4 animate-pulse">Loading...</div>
                ) : colIncidents.length === 0 ? (
                  <div className="text-center text-slate-600 text-sm py-8 border border-dashed border-slate-700 rounded-lg">
                    No incidents here
                  </div>
                ) : (
                  <AnimatePresence>
                    {colIncidents.map(incident => (
                      <motion.div
                        key={incident.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="bg-slateBlack border border-slate-700 rounded p-4 group hover:border-slate-500 transition-colors"
                      >
                        <div className="text-xs text-slate-500 font-mono mb-2">ID: {incident.id.split('-')[0]}</div>
                        <div className="text-sm text-slate-300 whitespace-pre-wrap mb-4 font-mono">
                          {incident.notes}
                        </div>
                        
                        {col.nextAction ? (
                          <button
                            onClick={() => updateIncidentStatus(incident.id, col.nextAction!)}
                            className="w-full py-2 bg-gunmetal border border-slate-700 rounded text-xs font-bold text-slate-300 hover:text-white hover:border-slate-500 hover:bg-slate-800 transition-colors"
                          >
                            {col.actionLabel} &rarr;
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDeleteIncident(incident.id)}
                            className="w-full py-2 bg-neonRed/10 border border-neonRed/30 rounded text-xs font-bold text-neonRed hover:bg-neonRed hover:text-slateBlack transition-all"
                          >
                            Clear Archive
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
