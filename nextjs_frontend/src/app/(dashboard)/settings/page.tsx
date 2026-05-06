'use client';

import { Settings, Bell, Lock, Database, Globe, Save, CheckCircle2, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('General');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://sentinelx-8lqt.onrender.com';

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1500);
  };

  const handleDangerAction = async (action: string) => {
  if (!(session as any)?.accessToken) {
      alert('You must be logged in to perform this action.');
      return;
    }

    if (confirm(`Are you sure you want to ${action}? This action cannot be undone.`)) {
      try {
        let endpoint = '';
        if (action === 'reset rules') {
          endpoint = '/api/v1/alert-rules/';
        } else if (action === 'flush cache') {
          endpoint = '/api/v1/incidents/reset';
        }

        const res = await fetch(`${apiUrl}${endpoint}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${(session as any)?.accessToken}` }
        });

        if (res.ok) {
          alert(`${action} successfully executed.`);
        } else {
          const error = await res.json();
          alert(`Failed to ${action}: ${error.detail || 'Unknown error'}`);
        }
      } catch (err) {
        console.error(`Error during ${action}:`, err);
        alert(`An error occurred while attempting to ${action}.`);
      }
    }
  };

  const navItems = [
    { name: 'General', icon: Settings },
    { name: 'Notifications', icon: Bell },
    { name: 'Security', icon: Lock },
    { name: 'Data Sources', icon: Database },
    { name: 'Global View', icon: Globe },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-white">Settings</h1>
        <p className="text-slate-400">Manage your account preferences and dashboard configuration.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === item.name
                    ? 'bg-neonBlue/10 text-neonBlue border border-neonBlue/20' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slateBlack'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'General' && (
            <div className="bg-gunmetal border border-slateBlack rounded-lg shadow-lg overflow-hidden">
              <div className="p-6 border-b border-slateBlack">
                <h2 className="text-xl font-bold text-slate-200">General Configuration</h2>
                <p className="text-sm text-slate-500 mt-1">Configure basic dashboard behavior and API connectivity.</p>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Dashboard Name</label>
                  <input 
                    type="text" 
                    defaultValue="SentinelX Main Command"
                    className="w-full bg-slateBlack border border-slate-700 rounded px-4 py-2 text-white focus:outline-none focus:border-neonBlue"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">API Endpoint URL</label>
                  <input 
                    type="text" 
                    defaultValue="https://sentinelx-8lqt.onrender.com"
                    className="w-full bg-slateBlack border border-slate-700 rounded px-4 py-2 text-white focus:outline-none focus:border-neonBlue"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slateBlack/50 rounded-lg border border-slate-700">
                  <div>
                    <div className="text-sm font-bold text-slate-200">Auto-Refresh Interval</div>
                    <div className="text-xs text-slate-500">Frequency of background data synchronization</div>
                  </div>
                  <select className="bg-gunmetal border border-slate-700 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-neonBlue">
                    <option>5 Seconds</option>
                    <option>10 Seconds</option>
                    <option>30 Seconds</option>
                  </select>
                </div>
              </div>

              <div className="p-6 bg-slateBlack/30 border-t border-slateBlack flex justify-end">
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-neonBlue text-slateBlack font-bold rounded hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving...' : saved ? 'Saved' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'Notifications' && (
            <div className="bg-gunmetal border border-slateBlack rounded-lg shadow-lg p-6 space-y-6">
              <h2 className="text-xl font-bold text-slate-200">Notification Settings</h2>
              <div className="space-y-4">
                {['Email Alerts', 'SMS Notifications', 'Desktop Notifications', 'Browser Sound'].map(label => (
                  <div key={label} className="flex items-center justify-between p-4 bg-slateBlack/50 rounded-lg border border-slate-700">
                    <span className="text-slate-300">{label}</span>
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked={label === 'Email Alerts'} />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neonBlue"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Security' && (
            <div className="space-y-6">
              <div className="bg-gunmetal border border-slateBlack rounded-lg shadow-lg p-6 space-y-6">
                <h2 className="text-xl font-bold text-slate-200">Security Credentials</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">New Password</label>
                    <input type="password" placeholder="••••••••" className="w-full bg-slateBlack border border-slate-700 rounded px-4 py-2 text-white focus:outline-none focus:border-neonBlue" />
                  </div>
                  <button className="px-6 py-2 bg-slate-700 text-white font-bold rounded hover:bg-slate-600 transition-colors">Update Password</button>
                </div>
              </div>

              <div className="bg-neonRed/5 border border-neonRed/20 rounded-lg p-6">
                <h3 className="text-lg font-bold text-neonRed flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Danger Zone
                </h3>
                <p className="text-sm text-slate-400 mt-2">These actions are destructive and cannot be undone.</p>
                <div className="mt-4 flex gap-4">
                  <button onClick={() => handleDangerAction('flush cache')} className="px-4 py-2 border border-neonRed text-neonRed text-sm font-bold rounded hover:bg-neonRed hover:text-white transition-colors">Flush Cache</button>
                  <button onClick={() => handleDangerAction('reset rules')} className="px-4 py-2 bg-neonRed text-white text-sm font-bold rounded hover:bg-red-700 transition-colors">Reset Rules</button>
                </div>
              </div>
            </div>
          )}

          {(activeTab === 'Data Sources' || activeTab === 'Global View') && (
            <div className="bg-gunmetal border border-slateBlack rounded-lg shadow-lg p-12 text-center space-y-4">
              <Database className="w-12 h-12 text-slate-700 mx-auto" />
              <h2 className="text-xl font-bold text-slate-400">{activeTab} coming soon</h2>
              <p className="text-slate-600 text-sm max-w-xs mx-auto">This section is currently under development. Advanced configuration for {activeTab.toLowerCase()} will be available in the next release.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
