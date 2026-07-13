'use client';

import Link from 'next/link';
import { Fuel, ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-surface-border bg-aura-void/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-aura-blue to-aura-cyan flex items-center justify-center">
                <Fuel className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold gradient-text">AURA</span>
            </Link>
            <p className="text-sm text-text-muted">
              Sovereign financial transparency infrastructure for Ghana&apos;s downstream petroleum sector.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-3">Platform</h4>
            <ul className="space-y-2">
              <li><Link href="/dashboard/claims" className="text-sm text-text-muted hover:text-text-primary transition-colors">Claims</Link></li>
              <li><Link href="/dashboard/marketplace" className="text-sm text-text-muted hover:text-text-primary transition-colors">Marketplace</Link></li>
              <li><Link href="/gateway/prices" className="text-sm text-text-muted hover:text-text-primary transition-colors">Fuel Prices</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-3">Resources</h4>
            <ul className="space-y-2">
              <li><Link href="/docs" className="text-sm text-text-muted hover:text-text-primary transition-colors">Documentation</Link></li>
              <li><Link href="/api" className="text-sm text-text-muted hover:text-text-primary transition-colors">API Reference</Link></li>
              <li><Link href="/status" className="text-sm text-text-muted hover:text-text-primary transition-colors">System Status</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-3">Legal</h4>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="text-sm text-text-muted hover:text-text-primary transition-colors">Privacy</Link></li>
              <li><Link href="/terms" className="text-sm text-text-muted hover:text-text-primary transition-colors">Terms</Link></li>
              <li><Link href="/compliance" className="text-sm text-text-muted hover:text-text-primary transition-colors">Compliance</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-surface-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-muted">
            &copy; 2026 Project Aura. Public-interest financial infrastructure.
          </p>
          <div className="flex items-center gap-4">
            <a href="https://github.com/psalmistinc/ProjAura" target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-text-primary transition-colors">
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
