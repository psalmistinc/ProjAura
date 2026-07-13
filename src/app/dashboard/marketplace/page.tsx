'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Clock, DollarSign, ArrowUpRight, Percent, Building2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { staggerContainer, fadeInUp, scrollReveal } from '@/lib/animations';

const assets = [
  { id: 'AST-001', claimId: 'CLM-00412', org: 'Goil Ghana Ltd', fuel: 'PMS', faceValue: 2300000, maturityDate: '2026-07-28', status: 'BIDDING_ACTIVE', bids: 3, bestRate: 2.1 },
  { id: 'AST-002', claimId: 'CLM-00411', org: 'Zen Petroleum', fuel: 'AGO', faceValue: 1800000, maturityDate: '2026-07-18', status: 'BIDDING_ACTIVE', bids: 5, bestRate: 1.9 },
  { id: 'AST-003', claimId: 'CLM-00405', org: 'Total Ghana', fuel: 'GO', faceValue: 3100000, maturityDate: '2026-07-15', status: 'MATCHED', bids: 8, bestRate: 2.3 },
  { id: 'AST-004', claimId: 'CLM-00401', org: 'Shell Ghana', fuel: 'PMS', faceValue: 1500000, maturityDate: '2026-07-12', status: 'SETTLED', bids: 4, bestRate: 2.0 },
];

const statusConfig: Record<string, { variant: 'success' | 'warning' | 'danger' | 'info' | 'default'; label: string }> = {
  LISTED: { variant: 'default', label: 'Listed' },
  BIDDING_ACTIVE: { variant: 'info', label: 'Bidding Active' },
  MATCHED: { variant: 'warning', label: 'Matched' },
  SETTLED: { variant: 'success', label: 'Settled' },
  MATURED_UNPAID: { variant: 'danger', label: 'Matured Unpaid' },
};

const topBanks = [
  { name: 'Stanbic Bank Ghana', totalFunded: 15200000, avgRate: 2.1, deals: 12, active: true },
  { name: 'Ecobank Ghana', totalFunded: 12800000, avgRate: 2.3, deals: 10, active: true },
  { name: 'GCB Bank', totalFunded: 9500000, avgRate: 2.5, deals: 8, active: false },
];

export default function MarketplacePage() {
  return (
    <DashboardLayout>
      <PageWrapper>
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
          <motion.div variants={fadeInUp}>
            <h1 className="text-3xl font-bold text-text-primary">Working Capital Marketplace</h1>
            <p className="text-text-secondary mt-1">Tokenized claims traded at transparent discount rates</p>
          </motion.div>

          {/* Marketplace Stats */}
          <motion.div variants={fadeInUp} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Assets Listed', value: '47', icon: TrendingUp, color: 'from-aura-blue to-aura-cyan' },
              { label: 'Capital Unlocked', value: '¢52.8M', icon: DollarSign, color: 'from-aura-teal to-aura-emerald' },
              { label: 'Avg. Discount Rate', value: '2.15%', icon: Percent, color: 'from-aura-purple to-aura-violet' },
              { label: 'Active Bidders', value: '12', icon: Building2, color: 'from-aura-amber to-aura-orange' },
            ].map((stat) => (
              <Card key={stat.label} variant="glass" hover padding="md">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-text-muted">{stat.label}</p>
                    <p className="text-2xl font-bold font-mono text-text-primary mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </Card>
            ))}
          </motion.div>

          {/* Active Assets */}
          <motion.div variants={fadeInUp}>
            <Card variant="glass" padding="lg">
              <CardHeader>
                <CardTitle>Active Assets</CardTitle>
                <Badge variant="info" size="sm">{assets.length} Assets</Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assets.map((asset, i) => {
                    const cfg = statusConfig[asset.status] || { variant: 'default' as const, label: asset.status };
                    return (
                      <motion.div
                        key={asset.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass rounded-xl p-5 hover:border-aura-blue/30 transition-all cursor-pointer group"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-aura-blue to-aura-cyan flex items-center justify-center text-white font-bold text-sm">
                              {asset.fuel}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm text-aura-blue">{asset.claimId}</span>
                                <Badge variant={cfg.variant} size="sm">{cfg.label}</Badge>
                              </div>
                              <div className="text-sm text-text-primary font-medium mt-0.5">{asset.org}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-6 lg:gap-8">
                            <div className="text-right">
                              <div className="text-lg font-bold font-mono text-text-primary">
                                ¢{(asset.faceValue / 1_000_000).toFixed(1)}M
                              </div>
                              <div className="text-xs text-text-muted">Face Value</div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold font-mono text-aura-teal">
                                {asset.bestRate}%
                              </div>
                              <div className="text-xs text-text-muted">Best Rate</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-text-secondary">
                                <Clock className="w-3 h-3 inline mr-1" />
                                {asset.maturityDate}
                              </div>
                              <div className="text-xs text-text-muted">Maturity</div>
                            </div>
                            {asset.status === 'BIDDING_ACTIVE' && (
                              <Button variant="glow" size="sm">
                                Place Bid
                                <ArrowUpRight className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Top Liquidity Providers */}
          <motion.div variants={fadeInUp}>
            <Card variant="glass" padding="lg">
              <CardHeader>
                <CardTitle>Top Liquidity Providers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topBanks.map((bank, i) => (
                    <div key={bank.name} className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/[0.02] transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-aura-steel/50 flex items-center justify-center text-sm font-bold text-text-secondary">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-text-primary">{bank.name}</div>
                        <div className="text-xs text-text-muted">{bank.deals} deals completed</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-mono text-text-primary">¢{(bank.totalFunded / 1_000_000).toFixed(1)}M</div>
                        <div className="text-xs text-text-muted">Total Funded</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-mono text-aura-teal">{bank.avgRate}%</div>
                        <div className="text-xs text-text-muted">Avg Rate</div>
                      </div>
                      <Badge variant={bank.active ? 'success' : 'default'} size="sm">
                        {bank.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </PageWrapper>
    </DashboardLayout>
  );
}
