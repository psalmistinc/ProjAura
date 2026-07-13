'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Search, Filter, CheckCircle2, Clock, AlertTriangle, Phone, Navigation } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { staggerContainer, fadeInUp, scrollReveal } from '@/lib/animations';

const stations = [
  { id: 'STN-001', name: 'Goil Kaneshie', region: 'Greater Accra', district: 'Accra Metro', license: 'ACTIVE', compliance: 'COMPLIANT', lastInspection: '2025-11-15', phone: '+233 30 222 1234', lat: 5.5600, lng: -0.2300 },
  { id: 'STN-002', name: 'Total Osu', region: 'Greater Accra', district: 'Accra Metro', license: 'ACTIVE', compliance: 'COMPLIANT', lastInspection: '2025-10-20', phone: '+233 30 277 5678', lat: 5.5580, lng: -0.1780 },
  { id: 'STN-003', name: 'Zen Petroleum Tema', region: 'Greater Accra', district: 'Tema Metro', license: 'ACTIVE', compliance: 'PENDING', lastInspection: '2025-12-01', phone: '+233 30 298 9012', lat: 5.6698, lng: -0.0166 },
  { id: 'STN-004', name: 'Shell Spintex', region: 'Greater Accra', district: 'Tema Metro', license: 'ACTIVE', compliance: 'COMPLIANT', lastInspection: '2025-09-10', phone: '+233 30 298 3456', lat: 5.6830, lng: -0.0080 },
  { id: 'STN-005', name: 'NP Accra Mall', region: 'Greater Accra', district: 'Accra Metro', license: 'ACTIVE', compliance: 'COMPLIANT', lastInspection: '2025-08-22', phone: '+233 30 277 7890', lat: 5.6340, lng: -0.1820 },
  { id: 'STN-006', name: 'Engen Legon', region: 'Greater Accra', district: 'Accra Metro', license: 'EXPIRED', compliance: 'NON_COMPLIANT', lastInspection: '2025-03-15', phone: '+233 30 277 2345', lat: 5.6520, lng: -0.1870 },
  { id: 'STN-007', name: 'Goil Lapaz', region: 'Greater Accra', district: 'Accra Metro', license: 'ACTIVE', compliance: 'COMPLIANT', lastInspection: '2025-11-30', phone: '+233 30 277 6789', lat: 5.6050, lng: -0.2200 },
  { id: 'STN-008', name: 'Total Kumasi', region: 'Ashanti', district: 'Kumasi Metro', license: 'ACTIVE', compliance: 'PENDING', lastInspection: '2025-10-05', phone: '+233 32 222 3456', lat: 6.6880, lng: -1.6240 },
  { id: 'STN-009', name: 'Shell Takoradi', region: 'Western', district: 'Sekondi-Takoradi', license: 'SUSPENDED', compliance: 'NON_COMPLIANT', lastInspection: '2025-06-12', phone: '+233 31 222 7890', lat: 4.9340, lng: -1.7960 },
  { id: 'STN-010', name: 'NP Tamale', region: 'Northern', district: 'Tamale Metro', license: 'ACTIVE', compliance: 'COMPLIANT', lastInspection: '2025-12-10', phone: '+233 37 222 1234', lat: 9.4034, lng: -0.8393 },
];

const regions = ['All Regions', 'Greater Accra', 'Ashanti', 'Western', 'Northern', 'Central', 'Eastern'];

const licenseConfig: Record<string, { variant: 'success' | 'warning' | 'danger'; label: string }> = {
  ACTIVE: { variant: 'success', label: 'Active' },
  EXPIRED: { variant: 'danger', label: 'Expired' },
  SUSPENDED: { variant: 'danger', label: 'Suspended' },
};

const complianceConfig: Record<string, { variant: 'success' | 'warning' | 'danger'; label: string }> = {
  COMPLIANT: { variant: 'success', label: 'Compliant' },
  PENDING: { variant: 'warning', label: 'Pending' },
  NON_COMPLIANT: { variant: 'danger', label: 'Non-Compliant' },
};

export default function StationsPage() {
  const [selectedRegion, setSelectedRegion] = useState('All Regions');

  const filtered = selectedRegion === 'All Regions'
    ? stations
    : stations.filter((s) => s.region === selectedRegion);

  const activeCount = stations.filter((s) => s.license === 'ACTIVE').length;
  const compliantCount = stations.filter((s) => s.compliance === 'COMPLIANT').length;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-16">
        <PageWrapper>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <motion.div variants={fadeInUp} initial="hidden" animate="visible">
              <Badge variant="info" size="lg" className="mb-4">
                <MapPin className="w-3 h-3" />
                Public Gateway
              </Badge>
              <h1 className="text-4xl font-bold text-text-primary mb-2">Licensed Stations</h1>
              <p className="text-text-secondary">
                Verify station licensing status and fuel marking compliance across Ghana.
              </p>
            </motion.div>

            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <motion.div variants={fadeInUp}>
                <Card variant="glass" padding="md">
                  <p className="text-sm text-text-muted">Total Stations</p>
                  <p className="text-3xl font-bold font-mono text-text-primary">{stations.length}</p>
                </Card>
              </motion.div>
              <motion.div variants={fadeInUp}>
                <Card variant="glass" padding="md">
                  <p className="text-sm text-text-muted">Active Licenses</p>
                  <p className="text-3xl font-bold font-mono text-aura-teal">{activeCount}</p>
                </Card>
              </motion.div>
              <motion.div variants={fadeInUp}>
                <Card variant="glass" padding="md">
                  <p className="text-sm text-text-muted">Fuel Marking Compliant</p>
                  <p className="text-3xl font-bold font-mono text-aura-blue">{compliantCount}</p>
                </Card>
              </motion.div>
            </motion.div>

            <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search stations by name or ID..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border bg-aura-navy/30 border-surface-border text-sm text-text-primary placeholder:text-text-muted focus:border-aura-blue focus:ring-1 focus:ring-aura-blue/50 outline-none transition-all"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {regions.map((region) => (
                  <button
                    key={region}
                    onClick={() => setSelectedRegion(region)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                      selectedRegion === region
                        ? 'bg-aura-blue/20 text-aura-blue border border-aura-blue/30'
                        : 'bg-aura-navy/30 text-text-muted border border-surface-border hover:text-text-secondary'
                    }`}
                  >
                    {region}
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid md:grid-cols-2 gap-4">
              {filtered.map((station, i) => {
                const lic = licenseConfig[station.license] || { variant: 'danger' as const, label: station.license };
                const comp = complianceConfig[station.compliance] || { variant: 'warning' as const, label: station.compliance };
                return (
                  <motion.div key={station.id} variants={scrollReveal}>
                    <Card variant="glass" hover padding="lg" className="group">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-text-primary group-hover:text-aura-blue transition-colors">
                            {station.name}
                          </h3>
                          <p className="text-xs text-text-muted font-mono">{station.id}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={lic.variant} size="sm">{lic.label}</Badge>
                          <Badge variant={comp.variant} size="sm" pulse={comp.variant === 'warning'}>
                            {comp.label}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-text-secondary">
                          <MapPin className="w-3 h-3 text-text-muted" />
                          {station.district}, {station.region}
                        </div>
                        <div className="flex items-center gap-2 text-text-secondary">
                          <Phone className="w-3 h-3 text-text-muted" />
                          {station.phone}
                        </div>
                        <div className="flex items-center gap-2 text-text-secondary">
                          <Clock className="w-3 h-3 text-text-muted" />
                          Last inspection: {station.lastInspection}
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-surface-border flex items-center justify-between">
                        <span className="text-xs text-text-muted">
                          {station.lat.toFixed(4)}, {station.lng.toFixed(4)}
                        </span>
                        <Button variant="ghost" size="sm">
                          <Navigation className="w-3 h-3" />
                          Directions
                        </Button>
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
