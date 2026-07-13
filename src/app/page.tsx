'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { useRef } from 'react';
import {
  ArrowRight, Shield, Zap, Eye, BarChart3,
  Fuel, TrendingUp, Lock, Globe, Activity,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useScrollAnimation, useMouseParallax } from '@/hooks/useScrollAnimation';
import { useCountUp } from '@/hooks/useCountUp';
import {
  staggerContainer, fadeInUp, scrollReveal,
} from '@/lib/animations';

function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
  const mouse = useMouseParallax(0.015);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <motion.div
        animate={{ x: [0, 30, -20, 0], y: [0, -20, 30, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-aura-blue/10 blur-[100px]"
      />
      <motion.div
        animate={{ x: [0, -30, 20, 0], y: [0, 20, -30, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-aura-cyan/10 blur-[100px]"
      />
      <motion.div
        animate={{ x: [0, 20, -10, 0], y: [0, -10, 20, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full bg-aura-purple/10 blur-[80px]"
      />

      <div className="absolute inset-0 grid-pattern opacity-30" />

      <motion.div style={{ y, opacity, scale }} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
          style={{ x: mouse.x, y: mouse.y }}
        >
          <Badge variant="info" size="lg" className="mb-6">
            <Zap className="w-3 h-3" />
            Sovereign Financial Infrastructure
          </Badge>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6">
            <span className="text-text-primary">The Future of</span>
            <br />
            <span className="gradient-text">Petroleum Finance</span>
          </h1>

          <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-8">
            Zero-trust claims verification. Real-time SLA accountability.
            Working capital liberation for Ghana&apos;s downstream petroleum sector.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard">
              <Button size="xl" variant="primary">
                Access Dashboard
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/gateway/prices">
              <Button size="xl" variant="outline">
                <Fuel className="w-5 h-5" />
                View Fuel Prices
              </Button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
        >
          {[
            { label: 'Claims Processed', value: '1,247', icon: BarChart3 },
            { label: 'Pool Value', value: '¢42.3M', icon: TrendingUp },
            { label: 'Avg. Days to Pay', value: '11.2', icon: Activity },
            { label: 'SLA Compliance', value: '94%', icon: Shield },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
              className="glass rounded-xl p-4"
            >
              <stat.icon className="w-4 h-4 text-aura-blue mb-2" />
              <div className="text-2xl font-bold font-mono text-text-primary">{stat.value}</div>
              <div className="text-xs text-text-muted">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 rounded-full border-2 border-surface-border flex justify-center pt-2">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1 h-1 rounded-full bg-aura-blue"
          />
        </div>
      </motion.div>
    </section>
  );
}

function FeaturesSection() {
  const { ref, isVisible } = useScrollAnimation();

  const features = [
    { icon: Shield, title: 'Immutable Claims Ledger', description: 'Zero-trust, timestamped registry with cryptographic audit trail. Every claim verified against NPA cargo-tracking data.', gradient: 'from-aura-blue to-aura-cyan' },
    { icon: Zap, title: 'SLA Countdown Engine', description: 'Public, dynamic countdown timer for each validated claim. Eliminates the legacy indefinite wait with predictable billing cycles.', gradient: 'from-aura-cyan to-aura-teal' },
    { icon: TrendingUp, title: 'Working Capital Marketplace', description: 'Verified claims convert to bankable assets. Banks bid at transparent discount rates, unlocking immediate Cedi-denominated liquidity.', gradient: 'from-aura-teal to-aura-emerald' },
    { icon: Eye, title: 'Public Price Gateway', description: 'Hyper-lightweight mobile web app for retail motorists. Real-time station licensing, fuel prices, and crowdsourced enforcement.', gradient: 'from-aura-purple to-aura-blue' },
    { icon: Lock, title: 'Fabric-Anchored Audit', description: 'Hyperledger Fabric channels for NPA, CBOD, and banks. Periodic Merkle root anchoring to Ethereum for public verifiability.', gradient: 'from-aura-amber to-aura-orange' },
    { icon: Globe, title: 'FX-De-risked Financing', description: 'Zero FX exposure — settlement in Cedi only. Discount rates projected 8-15%, isolating risk to NPA payment reliability alone.', gradient: 'from-aura-rose to-aura-purple' },
  ];

  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 dot-pattern opacity-20" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          variants={staggerContainer}
          initial="hidden"
          animate={isVisible ? 'visible' : 'hidden'}
          className="text-center mb-16"
        >
          <motion.div variants={fadeInUp}>
            <Badge variant="outline" size="lg" className="mb-4">Core Architecture</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-text-primary">Built for </span>
              <span className="gradient-text">National Scale</span>
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Three integrated modules solving the sector&apos;s greatest systemic vulnerabilities:
              opacity in fund governance and severe working capital choke points.
            </p>
          </motion.div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              variants={scrollReveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.1 }}
            >
              <Card variant="glass" hover padding="lg" className="h-full group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">{feature.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  const { ref, isVisible } = useScrollAnimation();
  const claims = useCountUp(1247, 2000);
  const pool = useCountUp(42, 2000);
  const compliance = useCountUp(94, 2000);

  return (
    <section className="relative py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          variants={staggerContainer}
          initial="hidden"
          animate={isVisible ? 'visible' : 'hidden'}
          className="glass-strong rounded-3xl p-8 md:p-12"
        >
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div variants={fadeInUp} className="text-center">
              <div ref={claims.ref} className="text-5xl font-bold font-mono gradient-text mb-2">
                {claims.count.toLocaleString()}
              </div>
              <div className="text-sm text-text-muted">Claims Processed</div>
            </motion.div>
            <motion.div variants={fadeInUp} className="text-center">
              <div ref={pool.ref} className="text-5xl font-bold font-mono gradient-text mb-2">
                ¢{pool.count}M+
              </div>
              <div className="text-sm text-text-muted">Total Pool Value</div>
            </motion.div>
            <motion.div variants={fadeInUp} className="text-center">
              <div ref={compliance.ref} className="text-5xl font-bold font-mono gradient-text mb-2">
                {compliance.count}%
              </div>
              <div className="text-sm text-text-muted">SLA Compliance</div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function CTASection() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="relative py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="relative text-center"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-aura-blue/20 via-aura-cyan/20 to-aura-teal/20 rounded-3xl blur-3xl" />
          <div className="relative glass-strong rounded-3xl p-12 md:p-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="gradient-text">Ready to Transform</span>
              <br />
              <span className="text-text-primary">Petroleum Finance?</span>
            </h2>
            <p className="text-lg text-text-secondary max-w-xl mx-auto mb-8">
              Join the growing network of OMCs, BDCs, and banks leveraging
              transparent, automated financial infrastructure.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/dashboard">
                <Button size="xl" variant="primary">
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/gateway/prices">
                <Button size="xl" variant="outline">
                  View Live Data
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <StatsSection />
      <CTASection />
      <Footer />
    </div>
  );
}
