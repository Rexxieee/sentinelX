import Link from 'next/link';
import { LayoutDashboard, AlertTriangle, ShieldAlert, Settings } from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Incidents', href: '/incidents', icon: AlertTriangle },
    { name: 'Rules', href: '/rules', icon: ShieldAlert },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 h-screen bg-gunmetal border-r border-slateBlack flex flex-col fixed left-0 top-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold tracking-wider text-neonBlue">Sentinel<span className="text-neonRed">X</span></h1>
      </div>
      <nav className="flex-1 mt-6">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className="flex items-center gap-3 px-6 py-3 text-slate-300 hover:text-white hover:bg-slateBlack transition-colors duration-200 border-l-4 border-transparent hover:border-neonBlue"
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-6 border-t border-slateBlack">
        <div className="text-xs text-slate-500 text-center">Version 1.0.0</div>
      </div>
    </aside>
  );
}
