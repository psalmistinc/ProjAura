'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle, Search, Filter, CheckCircle2, Clock, MapPin,
  ChevronRight, Camera, Send
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { staggerContainer, fadeInUp, scrollReveal } from '@/lib/animations';

const reports = [
  { id: 'RPT-001', type: 'SHORT_DISPENSING', lat: 5.5600, lng: -0.2300, station: 'Goil Kaneshie', description: 'Pump dispensed only 38L instead of 40L on meter reading.', status: 'FORWARDED_TO_NPA', priority: 65, date: '2026-07-12', duplicates: 1 },
  { id: 'RPT-002', type: 'FUEL_ADULTERATION', lat: 5.5580, lng: -0.1780, station: 'Total Osu', description: 'Strong kerosene smell from PMS. Vehicle engine knocking after fill-up.', status: 'UNDER_INVESTIGATION', priority: 85, date: '2026-07-11', duplicates: 3 },
  { id: 'RPT-003', type: 'PRICE_GOUGING', lat: 5.6698, lng: -0.0166, station: 'Zen Petroleum Tema', description: 'Charging ¢15.50/L for PMS when official price is ¢14.28/L.', status: 'TRIAGED', priority: 55, date: '2026-07-10', duplicates: 0 },
  { id: 'RPT-004', type: 'SHORT_DISPENSING', lat: 5.6830, lng: -0.0080, station: 'Shell Spintex', description: 'Meter跳了两次 — charged for 42L but tank only took 39L.', status: 'RECEIVED', priority: 60, date: '2026-07-13', duplicates: 0 },
  { id: 'RPT-005', type: 'UNLICENSED_SALE', lat: 5.6050, lng: -0.2200, station: null, description: 'Unmarked fuel tanker selling diesel from parking lot near Lapaz intersection.', status: 'FORWARDED_TO_NPA', priority: 75, date: '2026-07-09', duplicates: 2 },
  { id: 'RPT-006', type: 'FUEL_ADULTERATION', lat: 6.6880, lng: -1.6240, station: 'Total Kumasi', description: 'Fuel appears darker than usual. Multiple customers complaining.', status: 'RECEIVED', priority: 80, date: '2026-07-13', duplicates: 1 },
];

const typeConfig: Record<string, { variant: 'danger' | 'warning' | 'info' | 'purple'; label: string; color: string }> = {
  SHORT_DISPENSING: { variant: 'warning', label: 'Short Dispensing', color: 'text-aura-amber' },
  FUEL_ADULTERATION: { variant: 'danger', label: 'Fuel Adulteration', color: 'text-aura-red' },
  PRICE_GOUGING: { variant: 'info', label: 'Price Gouging', color: 'text-aura-blue' },
  UNLICENSED_SALE: { variant: 'purple', label: 'Unlicensed Sale', color: 'text-aura-purple' },
};

const statusConfig: Record<string, { variant: 'success' | 'warning' | 'danger' | 'info' | 'default'; label: string }> = {
  RECEIVED: { variant: 'default', label: 'Received' },
  TRIAGED: { variant: 'info', label: 'Triaged' },
  FORWARDED_TO_NPA: { variant: 'warning', label: 'Forwarded to NPA' },
  UNDER_INVESTIGATION: { variant: 'danger', label: 'Under Investigation' },
  RESOLVED: { variant: 'success', label: 'Resolved' },
  DISMISSED: { variant: 'default', label: 'Dismissed' },
};

export default function ReportsPage() {
  const [showForm, setShowForm] = useState(false);

  const stats = {
    total: reports.length,
    active: reports.filter((r) => ['RECEIVED', 'TRIAGED', 'FORWARDED_TO_NPA', 'UNDER_INVESTIGATION'].includes(r.status)).length,
    highPriority: reports.filter((r) => r.priority >= 75).length,
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-16">
        <PageWrapper>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <Badge variant="danger" size="lg" className="mb-4">
                  <AlertTriangle className="w-3 h-3" />
                  Public Gateway
                </Badge>
                <h1 className="text-4xl font-bold text-text-primary mb-2">Consumer Reports</h1>
                <p className="text-text-secondary">
                  Crowdsourced enforcement pipeline. Reports are geo-tagged and routed to NPA field teams.
                </p>
              </div>
              <Button variant="glow" size="lg" onClick={() => setShowForm(!showForm)}>
                <Camera className="w-4 h-4" />
                Report Issue
              </Button>
            </motion.div>

            {showForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Card variant="glow" padding="lg">
                  <h3 className="text-lg font-semibold text-text-primary mb-4">Submit a Report</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-text-muted mb-1">Complaint Type</label>
                      <select className="w-full px-3 py-2 rounded-lg border bg-aura-navy/30 border-surface-border text-sm text-text-primary focus:border-aura-blue outline-none">
                        <option value="">Select type...</option>
                        <option value="SHORT_DISPENSING">Short Dispensing</option>
                        <option value="FUEL_ADULTERATION">Fuel Adulteration</option>
                        <option value="PRICE_GOUGING">Price Gouging</option>
                        <option value="UNLICENSED_SALE">Unlicensed Sale</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-text-muted mb-1">Station (if known)</label>
                      <input
                        type="text"
                        placeholder="Station name or ID..."
                        className="w-full px-3 py-2 rounded-lg border bg-aura-navy/30 border-surface-border text-sm text-text-primary placeholder:text-text-muted focus:border-aura-blue outline-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm text-text-muted mb-1">Description</label>
                      <textarea
                        rows={3}
                        placeholder="Describe what you observed..."
                        className="w-full px-3 py-2 rounded-lg border bg-aura-navy/30 border-surface-border text-sm text-text-primary placeholder:text-text-muted focus:border-aura-blue outline-none resize-none"
                      />
                    </div>
                    <div className="md:col-span-2 flex items-center justify-between">
                      <p className="text-xs text-text-muted">
                        <MapPin className="w-3 h-3 inline mr-1" />
                        Your location will be auto-tagged for enforcement routing.
                      </p>
                      <Button variant="primary" size="md">
                        <Send className="w-4 h-4" />
                        Submit Report
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-3 gap-4">
              <motion.div variants={fadeInUp}>
                <Card variant="glass" padding="md">
                  <p className="text-sm text-text-muted">Total Reports</p>
                  <p className="text-3xl font-bold font-mono text-text-primary">{stats.total}</p>
                </Card>
              </motion.div>
              <motion.div variants={fadeInUp}>
                <Card variant="glass" padding="md">
                  <p className="text-sm text-text-muted">Active Cases</p>
                  <p className="text-3xl font-bold font-mono text-aura-amber">{stats.active}</p>
                </Card>
              </motion.div>
              <motion.div variants={fadeInUp}>
                <Card variant="glass" padding="md">
                  <p className="text-sm text-text-muted">High Priority</p>
                  <p className="text-3xl font-bold font-mono text-aura-red">{stats.highPriority}</p>
                </Card>
              </motion.div>
            </motion.div>

            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
              {reports.map((report, i) => {
                const type = typeConfig[report.type] || { variant: 'default' as const, label: report.type, color: 'text-text-muted' };
                const status = statusConfig[report.status] || { variant: 'default' as const, label: report.status };
                return (
                  <motion.div key={report.id} variants={scrollReveal}>
                    <Card variant="glass" hover padding="lg" className="group">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={type.variant} size="sm">{type.label}</Badge>
                            <Badge variant={status.variant} size="sm">{status.label}</Badge>
                            {report.duplicates > 0 && (
                              <Badge variant="outline" size="sm">{report.duplicates} similar</Badge>
                            )}
                          </div>
                          <p className="text-sm text-text-primary mb-2">{report.description}</p>
                          <div className="flex items-center gap-4 text-xs text-text-muted">
                            <span className="font-mono">{report.id}</span>
                            {report.station && <span>{report.station}</span>}
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {report.lat.toFixed(4)}, {report.lng.toFixed(4)}
                            </span>
                            <span>{report.date}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-sm font-mono text-text-primary">P{report.priority}</div>
                            <div className="text-xs text-text-muted">Priority</div>
                          </div>
                          <div className="w-20">
                            <div className="h-2 rounded-full bg-aura-steel/20 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  report.priority >= 75 ? 'bg-gradient-to-r from-aura-red to-aura-rose' :
                                  report.priority >= 50 ? 'bg-gradient-to-r from-aura-amber to-aura-orange' :
                                  'bg-gradient-to-r from-aura-blue to-aura-cyan'
                                }`}
                                style={{ width: `${report.priority}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </PageWrapper>
      </main>
      <Footer />
    </div>
  );
}
