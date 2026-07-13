'use client';

import { motion } from 'framer-motion';
import { ArrowLeftRight, CheckCircle2, Clock, AlertTriangle, Building2, Filter, Search } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { staggerContainer, fadeInUp } from '@/lib/animations';

const settlements = [
  { id: 'STL-001', claimId: 'CLM-00403', from: 'Stanbic Bank Ghana', to: 'Goil Ghana Ltd', amount: 2150000, discount: 45000, net: 2105000, status: 'CONFIRMED', rtgsRef: 'RTGS-2026-0712-001', date: '2026-07-12', rate: 2.1 },
  { id: 'STL-002', claimId: 'CLM-00398', from: 'Ecobank Ghana', to: 'Zen Petroleum', amount: 1780000, discount: 34000, net: 1746000, status: 'CONFIRMED', rtgsRef: 'RTGS-2026-0710-003', date: '2026-07-10', rate: 1.9 },
  { id: 'STL-003', claimId: 'CLM-00401', from: 'GCB Bank', to: 'Total Ghana', amount: 3050000, discount: 72000, net: 2978000, status: 'RTGS_SUBMITTED', rtgsRef: 'RTGS-2026-0711-002', date: '2026-07-11', rate: 2.3 },
  { id: 'STL-004', claimId: 'CLM-00395', from: 'Stanbic Bank Ghana', to: 'Shell Ghana', amount: 1480000, discount: 30000, net: 1450000, status: 'PENDING', rtgsRef: null, date: '2026-07-13', rate: 2.0 },
  { id: 'STL-005', claimId: 'CLM-00390', from: 'Ecobank Ghana', to: 'NP Ghana', amount: 2720000, discount: 58000, net: 2662000, status: 'CONFIRMED', rtgsRef: 'RTGS-2026-0708-004', date: '2026-07-08', rate: 2.2 },
  { id: 'STL-006', claimId: 'CLM-00387', from: 'Stanbic Bank Ghana', to: 'Engen Ghana', amount: 1950000, discount: 41000, net: 1909000, status: 'CONFIRMED', rtgsRef: 'RTGS-2026-0705-005', date: '2026-07-05', rate: 2.1 },
  { id: 'STL-007', claimId: 'CLM-00382', from: 'Ecobank Ghana', to: 'Goil Ghana Ltd', amount: 3200000, discount: 68000, net: 3132000, status: 'FAILED', rtgsRef: 'RTGS-2026-0703-006', date: '2026-07-03', rate: 2.1 },
];

const statusConfig: Record<string, { variant: 'success' | 'warning' | 'danger' | 'info' | 'default'; label: string; icon: React.ElementType }> = {
  PENDING: { variant: 'default', label: 'Pending', icon: Clock },
  RTGS_SUBMITTED: { variant: 'info', label: 'RTGS Submitted', icon: ArrowLeftRight },
  CONFIRMED: { variant: 'success', label: 'Confirmed', icon: CheckCircle2 },
  FAILED: { variant: 'danger', label: 'Failed', icon: AlertTriangle },
  DISPUTED: { variant: 'warning', label: 'Disputed', icon: AlertTriangle },
};

const summaryStats = [
  { label: 'Total Settled', value: '¢12.8M', color: 'text-aura-teal' },
  { label: 'Pending', value: '¢1.48M', color: 'text-aura-amber' },
  { label: 'Total Discount', value: '¢348K', color: 'text-text-muted' },
  { label: 'Avg. Rate', value: '2.1%', color: 'text-aura-blue' },
];

export default function SettlementsPage() {
  return (
    <DashboardLayout>
      <PageWrapper>
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
          <motion.div variants={fadeInUp}>
            <h1 className="text-3xl font-bold text-text-primary">Settlements</h1>
            <p className="text-text-secondary mt-1">RTGS transfer tracking and settlement history</p>
          </motion.div>

          <motion.div variants={fadeInUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {summaryStats.map((stat) => (
              <Card key={stat.label} variant="glass" hover padding="md">
                <p className="text-sm text-text-muted">{stat.label}</p>
                <p className={`text-2xl font-bold font-mono mt-1 ${stat.color}`}>{stat.value}</p>
              </Card>
            ))}
          </motion.div>

          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search by settlement ID, RTGS reference..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border bg-aura-navy/30 border-surface-border text-sm text-text-primary placeholder:text-text-muted focus:border-aura-blue focus:ring-1 focus:ring-aura-blue/50 outline-none transition-all"
              />
            </div>
            <Button variant="secondary" size="md">
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Card variant="glass" padding="none">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-surface-border">
                      <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider py-3 px-4">Settlement ID</th>
                      <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider py-3 px-4">Claim</th>
                      <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider py-3 px-4">From → To</th>
                      <th className="text-right text-xs font-medium text-text-muted uppercase tracking-wider py-3 px-4">Amount</th>
                      <th className="text-right text-xs font-medium text-text-muted uppercase tracking-wider py-3 px-4">Discount</th>
                      <th className="text-right text-xs font-medium text-text-muted uppercase tracking-wider py-3 px-4">Net</th>
                      <th className="text-center text-xs font-medium text-text-muted uppercase tracking-wider py-3 px-4">Status</th>
                      <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider py-3 px-4">RTGS Ref</th>
                    </tr>
                  </thead>
                  <tbody>
                    {settlements.map((s, i) => {
                      const cfg = statusConfig[s.status] || { variant: 'default' as const, label: s.status, icon: Clock };
                      return (
                        <motion.tr
                          key={s.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="border-b border-surface-border/50 hover:bg-white/[0.02] transition-colors cursor-pointer"
                        >
                          <td className="py-3 px-4 font-mono text-sm text-aura-blue">{s.id}</td>
                          <td className="py-3 px-4 font-mono text-sm text-text-secondary">{s.claimId}</td>
                          <td className="py-3 px-4">
                            <div className="text-sm text-text-primary">{s.from}</div>
                            <div className="text-xs text-text-muted">→ {s.to}</div>
                          </td>
                          <td className="py-3 px-4 text-sm text-text-primary text-right font-mono">¢{(s.amount / 1_000_000).toFixed(2)}M</td>
                          <td className="py-3 px-4 text-sm text-aura-red text-right font-mono">-¢{(s.discount / 1_000).toFixed(0)}K</td>
                          <td className="py-3 px-4 text-sm text-aura-teal text-right font-mono font-medium">¢{(s.net / 1_000_000).toFixed(2)}M</td>
                          <td className="py-3 px-4 text-center">
                            <Badge variant={cfg.variant} size="sm">
                              <cfg.icon className="w-3 h-3" />
                              {cfg.label}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 font-mono text-xs text-text-muted">{s.rtgsRef || '—'}</td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </PageWrapper>
    </DashboardLayout>
  );
}
