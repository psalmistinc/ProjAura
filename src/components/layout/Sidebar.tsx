'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, ArrowLeftRight, BarChart3,
  FileText, Settings, HelpCircle, Fuel,
  Shield, Activity
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const sidebarLinks = [
  { 
    section: 'Overview',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ]
  },
  {
    section: 'Claims & Finance',
    items: [
      { href: '/dashboard/claims', label: 'Claims Ledger', icon: ArrowLeftRight },
      { href: '/dashboard/marketplace', label: 'Marketplace', icon: BarChart3 },
      { href: '/dashboard/settlements', label: 'Settlements', icon: FileText },
    ]
  },
  {
    section: 'Public Gateway',
    items: [
      { href: '/gateway/prices', label: 'Fuel Prices', icon: Fuel },
      { href: '/gateway/stations', label: 'Stations', icon: Shield },
      { href: '/gateway/reports', label: 'Reports', icon: Activity },
    ]
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-16 bg-aura-void/50 border-r border-surface-border">
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {sidebarLinks.map((section) => (
          <div key={section.section}>
            <h4 className="px-3 mb-2 text-[10px] font-semibold text-text-muted uppercase tracking-wider">
              {section.section}
            </h4>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'relative flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all',
                      isActive
                        ? 'text-text-primary'
                        : 'text-text-muted hover:text-text-secondary hover:bg-white/[0.03]'
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute inset-0 bg-aura-blue/10 border border-aura-blue/20 rounded-lg"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <item.icon className={cn(
                      'w-4 h-4 relative z-10',
                      isActive && 'text-aura-blue'
                    )} />
                    <span className="relative z-10">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      
      <div className="p-4 border-t border-surface-border">
        <div className="glass rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-aura-teal animate-pulse" />
            <span className="text-xs text-text-muted">System Status</span>
          </div>
          <div className="text-xs text-text-secondary">
            All systems operational
          </div>
        </div>
      </div>
    </aside>
  );
}
