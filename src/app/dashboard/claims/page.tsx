'use client';

import { motion } from 'framer-motion';
import { Plus, Search, Filter, ArrowUpRight, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { staggerContainer, fadeInUp } from '@/lib/animations';

const claims = [
  { id: 'CLM-00412', type: 'UPPF', org: 'Goil Ghana Ltd', fuel: 'PMS', volume: 125000, amount: 2300000, status: 'VERIFIED_LOGGED', slaDeadline: '2026-07-28', slaElapsed: 35 },
  { id: 'CLM-00411', type: 'UNDER_RECOVERY', org: 'Zen Petroleum', fuel: 'AGO', volume: 85000, amount: 1800000, status: 'SLA_ACTIVE', slaDeadline: '2026-07-18', slaElapsed: 78 },
  { id: 'CLM-00410', type: 'UPPF', org: 'Total Ghana', fuel: 'GO', volume: 200000, amount: 3100000, status: 'PAID', slaDeadline: null, slaElapsed: 100 },
  { id: 'CLM-00409', type: 'UPPF', org: 'Shell Ghana', fuel: 'PMS', volume: 95000, amount: 1500000, status: 'SLA_BREACHED', slaDeadline: '2026-07-10', slaElapsed: 100 },
  { id: 'CLM-00408', type: 'UNDER_RECOVERY', org: 'NP Ghana', fuel: 'LPG', volume: 150000, amount: 2800000, status: 'NPA_DATA_CROSSED', slaDeadline: null, slaElapsed: 0 },
  { id: 'CLM-00407', type: 'UPPF', org: 'Engen Ghana', fuel: 'PMS', volume: 110000, amount: 2050000, status: 'SUBMITTED', slaDeadline: null, slaElapsed: 0 },
  { id: 'CLM-00406', type: 'UPPF', org: 'Goil Ghana Ltd', fuel: 'AGO', volume: 75000, amount: 1400000, status: 'PHYSICAL_DELIVERY_CONFIRMED', slaDeadline: null, slaElapsed: 0 },
];

const statusConfig: Record<string, { variant: 'success' | 'warning' | 'danger' | 'info' | 'default'; label: string; icon: React.ElementType }> = {
  SUBMITTED: { variant: 'default', label: 'Submitted', icon: Clock },
  NPA_DATA_CROSSED: { variant: 'default', label: 'NPA Crossed', icon: Clock },
  PHYSICAL_DELIVERY_CONFIRMED: { variant: 'info', label: 'Delivery Confirmed', icon: CheckCircle2 },
  VERIFIED_LOGGED: { variant: 'info', label: 'Verified & Logged', icon: CheckCircle2 },
  SLA_ACTIVE: { variant: 'warning', label: 'SLA Active', icon: Clock },
  SLA_BREACHED: { variant: 'danger', label: 'SLA Breached', icon: AlertTriangle },
  PAID: { variant: 'success', label: 'Paid', icon: CheckCircle2 },
};

export default function ClaimsPage() {
  return (
    <DashboardLayout>
      <PageWrapper>
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-text-primary">Claims Ledger</h1>
              <p className="text-text-secondary mt-1">Immutable, timestamped registry with SLA tracking</p>
            </div>
            <Button variant="primary" size="md">
              <Plus className="w-4 h-4" />
              Submit Claim
            </Button>
          </motion.div>

          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search claims by ID, organization..."
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
                      <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider py-3 px-4">Claim ID</th>
                      <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider py-3 px-4">Type</th>
                      <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider py-3 px-4">Organization</th>
                      <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider py-3 px-4">Fuel</th>
                      <th className="text-right text-xs font-medium text-text-muted uppercase tracking-wider py-3 px-4">Amount (¢)</th>
                      <th className="text-center text-xs font-medium text-text-muted uppercase tracking-wider py-3 px-4">Status</th>
                      <th className="text-center text-xs font-medium text-text-muted uppercase tracking-wider py-3 px-4 min-w-[140px]">SLA Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {claims.map((claim, i) => {
                      const cfg = statusConfig[claim.status] || { variant: 'default' as const, label: claim.status, icon: Clock };
                      const slaColor = claim.slaElapsed >= 100 ? 'red' : claim.slaElapsed >= 70 ? 'amber' : 'teal';
                      return (
                        <motion.tr
                          key={claim.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="border-b border-surface-border/50 hover:bg-white/[0.02] transition-colors cursor-pointer"
                        >
                          <td className="py-3 px-4">
                            <span className="font-mono text-sm text-aura-blue hover:underline">{claim.id}</span>
                          </td>
                          <td className="py-3 px-4 text-sm text-text-secondary">{claim.type}</td>
                          <td className="py-3 px-4 text-sm text-text-primary font-medium">{claim.org}</td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" size="sm">{claim.fuel}</Badge>
                          </td>
                          <td className="py-3 px-4 text-sm text-text-primary text-right font-mono">
                            ¢{(claim.amount / 1_000_000).toFixed(2)}M
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge variant={cfg.variant} size="sm">
                              <cfg.icon className="w-3 h-3" />
                              {cfg.label}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 min-w-[140px]">
                            {claim.slaDeadline ? (
                              <div className="space-y-1">
                                <Progress value={claim.slaElapsed} color={slaColor} size="sm" />
                                <div className="flex justify-between text-[10px] text-text-muted">
                                  <span>{claim.slaElapsed}%</span>
                                  <span>{claim.slaDeadline}</span>
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-text-muted">—</span>
                            )}
                          </td>
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
