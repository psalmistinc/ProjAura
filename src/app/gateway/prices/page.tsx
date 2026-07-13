'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Fuel, MapPin, CheckCircle2, Clock, AlertTriangle, ExternalLink, RefreshCw, Loader2 } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { staggerContainer, fadeInUp, scrollReveal } from '@/lib/animations';

interface FuelPrice {
  type: string;
  name: string;
  pumpPrice: number;
  exPumpPrice: number;
  color: string;
  icon: string;
}

interface Station {
  id: string;
  name: string;
  region: string;
  license: string;
  compliance: string;
  omcName?: string;
}

const fuelColorMap: Record<string, string> = {
  PMS: 'from-aura-blue to-aura-cyan',
  GO: 'from-aura-cyan to-aura-teal',
  AGO: 'from-aura-teal to-aura-emerald',
  LPG: 'from-aura-amber to-aura-orange',
  KERO: 'from-aura-purple to-aura-pink',
  ATK: 'from-aura-red to-aura-orange',
  MGO: 'from-aura-emerald to-aura-teal',
};

const fuelIconMap: Record<string, string> = {
  PMS: '⛽',
  GO: '🛢️',
  AGO: '🚗',
  LPG: '🔥',
  KERO: '燈',
  ATK: '✈️',
  MGO: '🚢',
};

const fuelNameMap: Record<string, string> = {
  PMS: 'Petrol',
  GO: 'Gas Oil',
  AGO: 'Automotive Gas Oil',
  LPG: 'Liquefied Petroleum Gas',
  KERO: 'Kerosene',
  ATK: 'Aviation Turbine Fuel',
  MGO: 'Marine Gas Oil',
};

export default function PricesPage() {
  const [fuelPrices, setFuelPrices] = useState<FuelPrice[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string>('');
  const [dataSource, setDataSource] = useState<string>('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pricesRes, stationsRes] = await Promise.all([
        fetch('/api/v1/npa?action=prices'),
        fetch('/api/v1/npa?action=stations'),
      ]);

      const pricesData = await pricesRes.json();
      const stationsData = await stationsRes.json();

      if (pricesData.success) {
        const mapped: FuelPrice[] = pricesData.data.map((p: Record<string, unknown>) => ({
          type: p.fuelType,
          name: fuelNameMap[p.fuelType as string] || String(p.fuelType),
          pumpPrice: Number(p.pumpPrice),
          exPumpPrice: Number(p.exPumpPrice),
          color: fuelColorMap[p.fuelType as string] || 'from-aura-blue to-aura-cyan',
          icon: fuelIconMap[p.fuelType as string] || '⛽',
        }));
        setFuelPrices(mapped);
        setDataSource(pricesData.source);
      }

      if (stationsData.success) {
        const mapped: Station[] = stationsData.data.map((s: Record<string, unknown>) => ({
          id: String(s.stationId),
          name: String(s.stationName),
          region: String(s.region),
          license: String(s.licenseStatus),
          compliance: String(s.fuelMarkingCompliance),
          omcName: String(s.omcName),
        }));
        setStations(mapped);
      }

      setLastSync(new Date().toLocaleString());
    } catch (error) {
      console.error('Failed to fetch NPA data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await fetch('/api/v1/npa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync-prices' }),
      });
      await fetchData();
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-16">
        <PageWrapper>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            {/* Header */}
            <motion.div variants={fadeInUp} initial="hidden" animate="visible">
              <Badge variant="info" size="lg" className="mb-4">
                <Fuel className="w-3 h-3" />
                Public Gateway
              </Badge>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-4xl font-bold text-text-primary mb-2">Fuel Prices & Station Status</h1>
                  <p className="text-text-secondary">
                    Official regulatory prices from the National Petroleum Authority. {lastSync && `Last synced: ${lastSync}`}
                  </p>
                  {dataSource && (
                    <p className="text-xs text-text-muted mt-1">
                      Source: {dataSource === 'mock' ? 'Mock Data (Development)' : 'NPA Website (Live)'}
                    </p>
                  )}
                </div>
                <Button variant="outline" onClick={handleSync} disabled={syncing}>
                  {syncing ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  {syncing ? 'Syncing...' : 'Sync Now'}
                </Button>
              </div>
            </motion.div>

            {/* Fuel Prices Grid */}
            {loading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} variant="glass" padding="lg">
                    <div className="animate-pulse space-y-4">
                      <div className="h-8 bg-surface-border/30 rounded w-16" />
                      <div className="h-4 bg-surface-border/30 rounded w-24" />
                      <div className="h-10 bg-surface-border/30 rounded w-32" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {fuelPrices.map((fuel) => (
                  <motion.div key={fuel.type} variants={scrollReveal}>
                    <Card variant="glass" hover padding="lg" className="group relative overflow-hidden">
                      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${fuel.color} opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:opacity-20 transition-opacity`} />
                      <div className="relative">
                        <div className="text-3xl mb-3">{fuel.icon}</div>
                        <Badge variant="info" size="sm" className="mb-3">{fuel.type}</Badge>
                        <h3 className="text-lg font-semibold text-text-primary mb-1">{fuel.name}</h3>
                        <div className="mt-4">
                          <div className="text-3xl font-bold font-mono gradient-text">
                            ¢{fuel.pumpPrice.toFixed(2)}
                          </div>
                          <div className="text-xs text-text-muted mt-1">per litre (pump)</div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-surface-border">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-text-muted">Ex-pump price</span>
                            <span className="font-mono text-text-secondary">¢{fuel.exPumpPrice.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm mt-1">
                            <span className="text-text-muted">Margin</span>
                            <span className="font-mono text-aura-teal">
                              ¢{(fuel.pumpPrice - fuel.exPumpPrice).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Station Status */}
            <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <Card variant="glass" padding="lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-aura-blue" />
                    Licensed Stations
                  </CardTitle>
                  <Badge variant="outline" size="sm">{stations.length} Stations</Badge>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse flex gap-4">
                          <div className="h-12 bg-surface-border/30 rounded flex-1" />
                          <div className="h-12 bg-surface-border/30 rounded w-24" />
                          <div className="h-12 bg-surface-border/30 rounded w-24" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-surface-border">
                            <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider py-3 px-4">Station</th>
                            <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider py-3 px-4">OMC</th>
                            <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider py-3 px-4">Region</th>
                            <th className="text-center text-xs font-medium text-text-muted uppercase tracking-wider py-3 px-4">License</th>
                            <th className="text-center text-xs font-medium text-text-muted uppercase tracking-wider py-3 px-4">Fuel Marking</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stations.map((station) => (
                            <tr key={station.id} className="border-b border-surface-border/50 hover:bg-white/[0.02] transition-colors">
                              <td className="py-3 px-4">
                                <div className="text-sm font-medium text-text-primary">{station.name}</div>
                                <div className="text-xs text-text-muted font-mono">{station.id}</div>
                              </td>
                              <td className="py-3 px-4 text-sm text-text-secondary">{station.omcName}</td>
                              <td className="py-3 px-4 text-sm text-text-secondary">{station.region}</td>
                              <td className="py-3 px-4 text-center">
                                <Badge variant={station.license === 'ACTIVE' ? 'success' : 'danger'} size="sm">
                                  {station.license === 'ACTIVE' && <CheckCircle2 className="w-3 h-3" />}
                                  {station.license}
                                </Badge>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <Badge
                                  variant={station.compliance === 'COMPLIANT' ? 'success' : 'warning'}
                                  size="sm"
                                  pulse={station.compliance === 'PENDING'}
                                >
                                  {station.compliance === 'COMPLIANT' && <CheckCircle2 className="w-3 h-3" />}
                                  {station.compliance === 'PENDING' && <Clock className="w-3 h-3" />}
                                  {station.compliance}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Report Issue CTA */}
            <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <Card variant="gradient" padding="lg" className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-aura-amber/20 to-aura-red/20 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-text-primary flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-aura-amber" />
                      Found a Violation?
                    </h3>
                    <p className="text-text-secondary mt-1">
                      Report short-dispensing, fuel adulteration, or price gouging. Your report is geo-tagged and routed directly to NPA enforcement.
                    </p>
                  </div>
                  <Button variant="glow" size="lg">
                    Report Issue
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        </PageWrapper>
      </main>
      <Footer />
    </div>
  );
}
