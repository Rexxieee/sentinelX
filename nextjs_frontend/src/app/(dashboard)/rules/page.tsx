'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Shield, Plus, Trash2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AlertRule {
  id: string;
  name: string;
  condition_logic: any;
  severity: string;
}

export default function RulesPage() {
  const { data: session } = useSession();
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [newName, setNewName] = useState('');
  const [newSeverity, setNewSeverity] = useState('medium');
  const [newLogic, setNewLogic] = useState('{"field": "port", "operator": "==", "value": 22}');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://sentinelx-8lqt.onrender.com';

  const fetchRules = async () => {
    if (!(session as any)?.accessToken) return;
    try {
      const res = await fetch(`${apiUrl}/api/v1/alert-rules/`, {
      headers: { 'Authorization': `Bearer ${(session as any).accessToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRules(data);
      }
    } catch (err) {
      console.error('Failed to fetch rules', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
 }, [session]);

  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
   if (!(session as any)?.accessToken) return;

    try {
      const logic = JSON.parse(newLogic);
      const res = await fetch(`${apiUrl}/api/v1/alert-rules/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
  'Authorization': `Bearer ${(session as any)?.accessToken}`
        },
        body: JSON.stringify({
          name: newName,
          condition_logic: logic,
          severity: newSeverity
        })
      });

      if (res.ok) {
        setShowAddForm(false);
        setNewName('');
        fetchRules();
      }
    } catch (err) {
      alert('Invalid JSON in condition logic');
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!(session as any)?.accessToken) return;
    if (!confirm('Are you sure you want to delete this rule?')) return;

    try {
      const res = await fetch(`${apiUrl}/api/v1/alert-rules/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${(session as any)?.accessToken}` }
      });

      if (res.ok) {
        fetchRules();
      }
    } catch (err) {
      console.error('Failed to delete rule', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-white">Detection Rules</h1>
          <p className="text-slate-400">Configure automated threat detection logic and alert severities.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-neonBlue/20 text-neonBlue border border-neonBlue/30 rounded font-bold hover:bg-neonBlue hover:text-slateBlack transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Rule
        </button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-slateBlack border border-slate-700 rounded-lg p-6 overflow-hidden"
          >
            <form onSubmit={handleAddRule} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Rule Name</label>
                <input 
                  type="text" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g., SSH Brute Force Detection"
                  className="w-full bg-gunmetal border border-slate-700 rounded px-4 py-2 text-white focus:outline-none focus:border-neonBlue"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Severity</label>
                <select 
                  value={newSeverity}
                  onChange={(e) => setNewSeverity(e.target.value)}
                  className="w-full bg-gunmetal border border-slate-700 rounded px-4 py-2 text-white focus:outline-none focus:border-neonBlue"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium text-slate-300">Condition Logic (JSON)</label>
                <textarea 
                  value={newLogic}
                  onChange={(e) => setNewLogic(e.target.value)}
                  rows={3}
                  className="w-full bg-gunmetal border border-slate-700 rounded px-4 py-2 text-white font-mono text-xs focus:outline-none focus:border-neonBlue"
                  required
                />
              </div>
              <div className="md:col-span-2 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-neonBlue text-slateBlack font-bold rounded hover:bg-cyan-400 transition-colors"
                >
                  Save Rule
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="text-center py-12 text-slate-500 animate-pulse">Loading detection rules...</div>
        ) : rules.length === 0 ? (
          <div className="text-center py-20 bg-gunmetal border border-dashed border-slate-700 rounded-lg">
            <Shield className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-400">No Rules Defined</h3>
            <p className="text-slate-500 text-sm">Create your first detection rule to start monitoring traffic.</p>
          </div>
        ) : (
          rules.map((rule) => (
            <div key={rule.id} className="bg-gunmetal border border-slateBlack rounded-lg p-5 flex items-center justify-between group hover:border-slate-700 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${
                  rule.severity === 'high' || rule.severity === 'critical' ? 'bg-neonRed/10 text-neonRed' : 
                  rule.severity === 'medium' ? 'bg-orange-500/10 text-orange-400' : 'bg-neonBlue/10 text-neonBlue'
                }`}>
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-200">{rule.name}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded border ${
                      rule.severity === 'high' || rule.severity === 'critical' ? 'border-neonRed/30 text-neonRed' : 
                      rule.severity === 'medium' ? 'border-orange-500/30 text-orange-400' : 'border-neonBlue/30 text-neonBlue'
                    }`}>
                      {rule.severity}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">ID: {rule.id.split('-')[0]}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="hidden lg:block">
                  <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Logic</div>
                  <code className="text-xs text-slate-400 bg-slateBlack px-2 py-1 rounded">
                    {JSON.stringify(rule.condition_logic)}
                  </code>
                </div>
                <button 
                  onClick={() => handleDeleteRule(rule.id)}
                  className="text-slate-600 hover:text-neonRed transition-colors p-2"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
