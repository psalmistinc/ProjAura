'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  Fuel, Menu, X, ChevronDown, 
  LayoutDashboard, ArrowLeftRight, 
  BarChart3, Settings, LogOut,
  Bell, Search
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/claims', label: 'Claims', icon: ArrowLeftRight },
  { href: '/dashboard/marketplace', label: 'Marketplace', icon: BarChart3 },
  { href: '/gateway/prices', label: 'Prices', icon: Fuel },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          scrolled 
            ? 'bg-aura-void/80 backdrop-blur-xl border-b border-surface-border shadow-elevated'
            : 'bg-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-aura-blue to-aura-cyan flex items-center justify-center">
                  <Fuel className="w-5 h-5 text-white" />
                </div>
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-aura-blue to-aura-cyan blur-lg opacity-50 group-hover:opacity-80 transition-opacity" />
              </div>
              <div>
                <span className="text-lg font-bold gradient-text">PROJECT AURA</span>
                <span className="hidden sm:block text-[10px] text-text-muted tracking-widest uppercase">
                  Financial Infrastructure
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary rounded-lg hover:bg-white/5 transition-all"
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg hover:bg-white/5 text-text-muted hover:text-text-primary transition-colors">
                <Search className="w-5 h-5" />
              </button>
              <button className="relative p-2 rounded-lg hover:bg-white/5 text-text-muted hover:text-text-primary transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-aura-red" />
              </button>
              <div className="hidden md:flex items-center gap-2 ml-2 pl-2 border-l border-surface-border">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-aura-blue to-aura-purple flex items-center justify-center text-xs font-bold text-white">
                  PA
                </div>
              </div>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-white/5 text-text-muted"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-16 z-40 bg-aura-void/95 backdrop-blur-xl border-b border-surface-border md:hidden"
          >
            <nav className="p-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-text-secondary hover:text-text-primary rounded-lg hover:bg-white/5 transition-all"
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
