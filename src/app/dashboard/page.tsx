'use client';

import { motion } from 'framer-motion';
import {
  ArrowUpRight, ArrowDownRight, Clock, CheckCircle2,
  AlertTriangle, Fuel, TrendingUp, BarChart3, Activity
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { staggerContainer, fadeInUp } from '@/lib/animations';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from 'recharts';

const claimsData = [
  { month: 'Jan', claims: 85, paid: 72 },
  { month: 'Feb', claims: 92, paid: 88 },
  { month: 'Mar', claims: 110, paid: 95 },
  { month: 'Apr', claims: 98, paid: 91 },
  { month: 'May', claims: 125, paid: 112 },
  { month: 'Jun', claims: 142, paid: 130 },
  { month: 'Jul', claims: 118, paid: 105 },
];

const poolData = [
  { month: 'Jan', value: 28 },
  { month: 'Feb', value: 32 },
  { month: 'Mar', value: 35 },
  { month: 'Apr', value: 38 },
  { month: 'May', value: 40 },
  { month: 'Jun', value: 42 },
  { month: 'Jul', value: 42.3 },
];

const recentClaims = [
  { id: 'CLM-00412', type: 'UPPF', org: 'Goil Ghana', amount: 2300000, status: 'VERIFIED_LOGGED', sla: 12 },
  { id: 'CLM-00411', type: 'UNDER_RECOVERY', org: 'Zen Petroleum', amount: 1800000, status: 'SLA_ACTIVE', sla: 3 },
  { id: 'CLM-00410', type: 'UPPF', org: 'Total Ghana', amount: 3100000, status: 'PAID', sla: 0 },
  { id: 'CLM-00409', type: 'UPPF', org: 'Shell Ghana', amount: 1500000, status: 'SLA_BREACHED', sla: -2 },
  { id: 'CLM-00408', type: 'UNDER_RECOVERY', org: 'NP Ghana', amount: 2800000, status: 'NPA_DATA_CROSSED', sla: null },
];

const statusConfig: Record<string, { variant: 'success' | 'warning' | 'danger' | 'info' | 'default'; label: string }> = {
  VERIFIED_LOGGED: { variant: 'info', label: 'Verified' },
  SLA_ACTIVE: { variant: 'warning', label: 'SLA Active' },
  PAID: { variant: 'success', label: 'Paid' },
  SLA_BREACHED: { variant: 'danger', label: 'Breached' },
  NPA_DATA_CROSSED: { variant: 'default', label: 'Processing' },
};

function KPICard({ title, value, change, changeType, icon: Icon, color }: {
  title: string; value: string; change: string; changeType: 'up' | 'down';
  icon: React.ElementType; color: string;
}) {
  return (
    <Card variant="glass" hover padding="md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-text-muted mb-1">{title}</p>
          <p className="text-3xl font-bold font-mono text-text-primary">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1">
        {changeType === 'up' ? (
          <ArrowUpRight className="w-3 h-3 text-aura-teal" />
        ) : (
          <ArrowDownRight className="w-3 h-3 text-aura-red" />
        )}
        <span className={`text-xs ${changeType === 'up' ? 'text-aura-teal' : 'text-aura-red'}`}>
          {change}
        </span>
        <span className="text-xs text-text-muted">vs last month</span>
      </div>
    </Card>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload) return null;
  return (
    <div className="glass-strong rounded-lg p-3 border border-surface-border">
      <p className="text-sm font-medium text-text-primary mb-1">{label}</p>
      {payload.map((item: any, i: number) => (
        <p key={i} className="text-xs text-text-secondary">
          <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: item.color }} />
          {item.name}: {item.value}
        </p>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <PageWrapper>
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-8">
          {/* Header */}
          <motion.div variants={fadeInUp}>
            <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
            <p className="text-text-secondary mt-1">Project Aura — Real-time claims and marketplace overview</p>
          </motion.div>

          {/* KPI Cards */}
          <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard title="Total Claims" value="1,247" change="+12.5%" changeType="up" icon={BarChart3} color="from-aura-blue to-aura-cyan" />
            <KPICard title="Active SLA" value="89" change="-8.2%" changeType="down" icon={Clock} color="from-aura-amber to-aura-orange" />
            <KPICard title="Pool Value" value="¢42.3M" change="+5.1%" changeType="up" icon={TrendingUp} color="from-aura-teal to-aura-emerald" />
            <KPICard title="Compliance" value="94%" change="+2.3%" changeType="up" icon={Activity} color="from-aura-purple to-aura-violet" />
          </motion.div>

          {/* Charts Row */}
          <motion.div variants={fadeInUp} className="grid lg:grid-cols-2 gap-6">
            <Card variant="glass" padding="lg">
              <CardHeader>
                <CardTitle>Claims Volume</CardTitle>
                <Badge variant="info" size="sm">7 Months</Badge>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={claimsData}>
                    <defs>
                      <linearGradient id="claimsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="paidGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#20C997" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#20C997" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(44,116,179,0.1)" />
                    <XAxis dataKey="month" stroke="#5A7499" fontSize={12} />
                    <YAxis stroke="#5A7499" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="claims" stroke="#3B82F6" fill="url(#claimsGrad)" name="Claims" />
                    <Area type="monotone" dataKey="paid" stroke="#20C997" fill="url(#paidGrad)" name="Paid" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card variant="glass" padding="lg">
              <CardHeader>
                <CardTitle>Pool Value (¢M)</CardTitle>
                <Badge variant="success" size="sm">Growing</Badge>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={poolData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(44,116,179,0.1)" />
                    <XAxis dataKey="month" stroke="#5A7499" fontSize={12} />
                    <YAxis stroke="#5A7499" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" fill="url(#barGrad)" radius={[4, 4, 0, 0]} name="Value (¢M)" />
                    <defs>
                      <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06B6D4" />
                        <stop offset="100%" stopColor="#2C74B3" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* SLA Overview */}
          <motion.div variants={fadeInUp}>
            <Card variant="glass" padding="lg">
              <CardHeader>
                <CardTitle>SLA Compliance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: 'Paid On Time', value: 85, color: 'teal' as const },
                    { label: 'SLA Active (On Track)', value: 92, color: 'blue' as const },
                    { label: 'Claims Verified', value: 78, color: 'cyan' as const },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-4">
                      <span className="text-sm text-text-secondary w-48">{item.label}</span>
                      <Progress value={item.value} color={item.color} className="flex-1" />
                      <span className="text-sm font-mono text-text-primary w-12 text-right">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Claims */}
          <motion.div variants={fadeInUp}>
            <Card variant="glass" padding="lg">
              <CardHeader>
                <CardTitle>Recent Claims</CardTitle>
                <Badge variant="outline" size="sm">Last 5</Badge>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-surface-border">
                        <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider py-3 px-4">ID</th>
                        <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider py-3 px-4">Type</th>
                        <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider py-3 px-4">Organization</th>
                        <th className="text-right text-xs font-medium text-text-muted uppercase tracking-wider py-3 px-4">Amount</th>
                        <th className="text-center text-xs font-medium text-text-muted uppercase tracking-wider py-3 px-4">Status</th>
                        <th className="text-center text-xs font-medium text-text-muted uppercase tracking-wider py-3 px-4">SLA</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentClaims.map((claim) => {
                        const cfg = statusConfig[claim.status] || { variant: 'default' as const, label: claim.status };
                        return (
                          <tr key={claim.id} className="border-b border-surface-border/50 hover:bg-white/[0.02] transition-colors">
                            <td className="py-3 px-4 font-mono text-sm text-aura-blue">{claim.id}</td>
                            <td className="py-3 px-4 text-sm text-text-secondary">{claim.type}</td>
                            <td className="py-3 px-4 text-sm text-text-primary">{claim.org}</td>
                            <td className="py-3 px-4 text-sm text-text-primary text-right font-mono">
                              ¢{(claim.amount / 1_000_000).toFixed(1)}M
                            </td>
                            <td className="py-3 px-4 text-center">
                              <Badge variant={cfg.variant} size="sm">{cfg.label}</Badge>
                            </td>
                            <td className="py-3 px-4 text-center">
                              {claim.sla !== null ? (
                                <span className={`text-sm font-mono ${claim.sla < 0 ? 'text-aura-red' : claim.sla <= 3 ? 'text-aura-amber' : 'text-aura-teal'}`}>
                                  {claim.sla > 0 ? `${claim.sla}d` : claim.sla === 0 ? '—' : `${Math.abs(claim.sla)}d late`}
                                </span>
                              ) : (
                                <span className="text-sm text-text-muted">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </PageWrapper>
    </DashboardLayout>
  );
}
