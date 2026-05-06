'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface Event {
  timestamp: string;
  source_ip: string;
  destination_ip: string;
  port: number;
  protocol: string;
  event_action: string;
}

interface ChartData {
  time: string;
  volume: number;
}

export default function NetworkTrafficChart() {
  const { data: session } = useSession();
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchRecentEvents = async () => {
     if (!(session as any)?.accessToken) return;
      
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://sentinelx-8lqt.onrender.com';
        const res = await fetch(`${apiUrl}/api/v1/events/recent`, {
          headers: {
            'Authorization': `Bearer ${(session as any)?.accessToken}`
          }
        });
        if (!res.ok) throw new Error('Failed to fetch');
        
        const json = await res.json();
        const events: Event[] = json.events;
        
        // Group by second
        const buckets: Record<string, number> = {};
        events.forEach(e => {
          const d = new Date(e.timestamp);
          const timeKey = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
          buckets[timeKey] = (buckets[timeKey] || 0) + 1;
        });

        const sortedKeys = Object.keys(buckets).sort();
        const chartData = sortedKeys.map(k => ({ time: k, volume: buckets[k] }));
        
        setData(chartData);
      } catch (err) {
        console.error('Error fetching traffic data', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentEvents();
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchRecentEvents, 5000);
    return () => clearInterval(interval);
 }, [session]);

  return (
    <div className="bg-gunmetal border border-slateBlack rounded-lg p-6 shadow-lg h-[400px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-slate-200">Network Traffic Volume</h3>
        <span className="text-xs text-slate-400 bg-slateBlack px-3 py-1 rounded-full border border-slate-700">Live Updates (5s)</span>
      </div>
      
      <div className="flex-1 w-full h-full min-h-0">
        {loading && data.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500 animate-pulse">Loading traffic data...</div>
        ) : error && data.length === 0 ? (
          <div className="flex items-center justify-center h-full text-neonRed/80">Failed to load traffic data. Is the backend running?</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00f0ff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" vertical={false} />
              <XAxis 
                dataKey="time" 
                stroke="#718096" 
                fontSize={12}
                tickMargin={10}
                minTickGap={20}
              />
              <YAxis 
                stroke="#718096" 
                fontSize={12}
                tickFormatter={(val) => Math.round(val).toString()}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0b0f19', borderColor: '#1a202c', color: '#e2e8f0' }}
                itemStyle={{ color: '#00f0ff' }}
                labelStyle={{ color: '#a0aec0' }}
              />
              <Area 
                type="monotone" 
                dataKey="volume" 
                stroke="#00f0ff" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorVolume)" 
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
