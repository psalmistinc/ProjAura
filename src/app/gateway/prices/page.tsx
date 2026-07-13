'use client';

import { motion } from 'framer-motion';
import { Fuel, MapPin, CheckCircle2, Clock, AlertTriangle, ExternalLink } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { staggerContainer, fadeInUp, scrollReveal } from '@/lib/animations';

const fuelPrices = [
  { type: 'PMS', name: 'Petrol', pumpPrice: 14.28, exPumpPrice: 12.95, color: 'from-aura-blue to-aura-cyan', icon: '⛽' },
  { type: 'GO', name: 'Gas Oil', pumpPrice: 13.15, exPumpPrice: 11.82, color: 'from-aura-cyan to-aura-teal', icon: '🛢️' },
  { type: 'AGO', name: 'Automotive Gas Oil', pumpPrice: 13.82, exPumpPrice: 12.49, color: 'from-aura-teal to-aura-emerald', icon: '🚗' },
  { type: 'LPG', name: 'Liquefied Petroleum Gas', pumpPrice: 11.50, exPumpPrice: 10.17, color: 'from-aura-amber to-aura-orange', icon: '🔥' },
];

const stations = [
  { id: 'STN-001', name: 'Goil Kaneshie', region: 'Greater Accra', license: 'ACTIVE', compliance: 'COMPLIANT', lat: 5.5600, lng: -0.2300 },
  { id: 'STN-002', name: 'Total Osu', region: 'Greater Accra', license: 'ACTIVE', compliance: 'COMPLIANT', lat: 5.5580, lng: -0.1780 },
  { id: 'STN-003', name: 'Zen Petroleum Tema', region: 'Greater Accra', license: 'ACTIVE', compliance: 'PENDING', lat: 5.6698, lng: -0.0166 },
];

export default function PricesPage() {
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
              <h1 className="text-4xl font-bold text-text-primary mb-2">Fuel Prices & Station Status</h1>
              <p className="text-text-secondary">
                Official regulatory prices from the National Petroleum Authority. Updated in real-time.
              </p>
            </motion.div>

            {/* Fuel Prices Grid */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {fuelPrices.map((fuel, i) => (
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
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-surface-border">
                          <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider py-3 px-4">Station</th>
                          <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider py-3 px-4">Region</th>
                          <th className="text-center text-xs font-medium text-text-muted uppercase tracking-wider py-3 px-4">License</th>
                          <th className="text-center text-xs font-medium text-text-muted uppercase tracking-wider py-3 px-4">Fuel Marking</th>
                          <th className="text-center text-xs font-medium text-text-muted uppercase tracking-wider py-3 px-4">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stations.map((station) => (
                          <tr key={station.id} className="border-b border-surface-border/50 hover:bg-white/[0.02] transition-colors">
                            <td className="py-3 px-4">
                              <div className="text-sm font-medium text-text-primary">{station.name}</div>
                              <div className="text-xs text-text-muted font-mono">{station.id}</div>
                            </td>
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
                            <td className="py-3 px-4 text-center">
                              <Button variant="ghost" size="sm">
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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
