'use client';

import { motion } from 'framer-motion';
import { FileText, Plus, Search, Filter, Download, AlertTriangle, CheckCircle2, Clock, Eye } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { staggerContainer, fadeInUp } from '@/lib/animations';

const reports = [
  { id: 'RPT-001', title: 'Monthly Fuel Price Compliance', type: 'Compliance', status: 'COMPLETED', date: '2026-07-01', author: 'NPA Audit Team' },
  { id: 'RPT-002', title: 'Q2 Settlement Reconciliation', type: 'Financial', status: 'IN_PROGRESS', date: '2026-07-10', author: 'Finance Dept' },
  { id: 'RPT-003', title: 'SLA Performance Report - June', type: 'Performance', status: 'COMPLETED', date: '2026-07-05', author: 'Operations' },
  { id: 'RPT-004', title: 'Station License Verification', type: 'Compliance', status: 'PENDING_REVIEW', date: '2026-07-12', author: 'NPA Audit Team' },
  { id: 'RPT-005', title: 'Consumer Complaint Summary', type: 'Consumer', status: 'COMPLETED', date: '2026-07-08', author: 'Consumer Affairs' },
  { id: 'RPT-006', title: 'Liquidity Crisis Early Warning', type: 'Risk', status: 'IN_PROGRESS', date: '2026-07-13', author: 'Risk Management' },
];

const statusConfig: Record<string, { variant: 'success' | 'warning' | 'info' | 'default'; label: string; icon: React.ElementType }> = {
  COMPLETED: { variant: 'success', label: 'Completed', icon: CheckCircle2 },
  IN_PROGRESS: { variant: 'info', label: 'In Progress', icon: Clock },
  PENDING_REVIEW: { variant: 'warning', label: 'Pending Review', icon: AlertTriangle },
};

const typeColors: Record<string, string> = {
  Compliance: 'text-aura-teal',
  Financial: 'text-aura-blue',
  Performance: 'text-aura-purple',
  Consumer: 'text-aura-amber',
  Risk: 'text-aura-red',
};

const summaryStats = [
  { label: 'Total Reports', value: '24', color: 'text-text-primary' },
  { label: 'Completed', value: '18', color: 'text-aura-emerald' },
  { label: 'In Progress', value: '4', color: 'text-aura-blue' },
  { label: 'Pending Review', value: '2', color: 'text-aura-amber' },
];

export default function ReportsPage() {
  return (
    <DashboardLayout>
      <PageWrapper>
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-text-primary">Reports</h1>
              <p className="text-text-secondary mt-1">Audit reports, compliance checks, and analytics</p>
            </div>
            <Button variant="primary">
              <Plus className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
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
                placeholder="Search reports..."
                className="w-full pl-10 pr-4 py-2 bg-surface-border/30 border border-surface-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-aura-blue"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Card variant="glass" padding="none">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-surface-border">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Report</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Author</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-text-muted uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border/50">
                    {reports.map((report) => {
                      const status = statusConfig[report.status];
                      return (
                        <tr key={report.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-text-muted shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-text-primary">{report.title}</p>
                                <p className="text-xs text-text-muted">{report.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-sm font-medium ${typeColors[report.type] || 'text-text-secondary'}`}>
                              {report.type}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={status.variant}>
                              <status.icon className="w-3 h-3 mr-1" />
                              {status.label}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-sm text-text-secondary">{report.date}</td>
                          <td className="px-6 py-4 text-sm text-text-secondary">{report.author}</td>
                          <td className="px-6 py-4 text-right">
                            <button className="p-1.5 rounded-lg hover:bg-white/5 text-text-muted hover:text-text-primary transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
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
