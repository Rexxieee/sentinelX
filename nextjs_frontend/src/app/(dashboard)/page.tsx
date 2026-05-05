import ActiveThreatsTable from '@/components/ActiveThreatsTable';
import NetworkTrafficChart from '@/components/NetworkTrafficChart';
import ThreatGlobe from '@/components/ThreatGlobe';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
        <p className="text-slate-400">Real-time overview of network security and traffic anomalies.</p>
      </div>

      <div className="h-[500px] w-full">
        <ThreatGlobe />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <NetworkTrafficChart />
        <ActiveThreatsTable />
      </div>
    </div>
  );
}
