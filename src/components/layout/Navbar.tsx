'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  Fuel, Menu, X, ChevronDown, 
  LayoutDashboard, ArrowLeftRight, 
  BarChart3, Settings, LogOut,
  Bell, Search, User, CreditCard,
  FileText, AlertTriangle, CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/claims', label: 'Claims', icon: ArrowLeftRight },
  { href: '/dashboard/marketplace', label: 'Marketplace', icon: BarChart3 },
  { href: '/gateway/prices', label: 'Prices', icon: Fuel },
];

const mockNotifications = [
  { id: 1, type: 'claim', title: 'Claim #CLM-2024-001 verified', time: '2 min ago', icon: CheckCircle2, color: 'text-aura-emerald' },
  { id: 2, type: 'sla', title: 'SLA breach risk: Claim #CLM-2024-003', time: '15 min ago', icon: AlertTriangle, color: 'text-aura-amber' },
  { id: 3, type: 'settlement', title: 'RTGS settlement initiated - GH₵ 45,000', time: '1 hour ago', icon: CreditCard, color: 'text-aura-blue' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

              {/* Notification Bell */}
              <div ref={notificationRef} className="relative">
                <button
                  onClick={() => { setNotificationOpen(!notificationOpen); setUserMenuOpen(false); }}
                  className="relative p-2 rounded-lg hover:bg-white/5 text-text-muted hover:text-text-primary transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-aura-red" />
                </button>

                <AnimatePresence>
                  {notificationOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-80 bg-aura-void/95 backdrop-blur-xl border border-surface-border rounded-xl shadow-elevated overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-surface-border flex items-center justify-between">
                        <span className="text-sm font-semibold text-text-primary">Notifications</span>
                        <span className="text-xs text-aura-blue cursor-pointer hover:underline">Mark all read</span>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {mockNotifications.map((notif) => (
                          <div
                            key={notif.id}
                            className="px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors border-b border-surface-border/50 last:border-0"
                          >
                            <div className="flex items-start gap-3">
                              <notif.icon className={cn('w-5 h-5 mt-0.5 shrink-0', notif.color)} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-text-primary">{notif.title}</p>
                                <p className="text-xs text-text-muted mt-1">{notif.time}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="px-4 py-2 border-t border-surface-border">
                        <Link
                          href="/dashboard/notifications"
                          onClick={() => setNotificationOpen(false)}
                          className="block text-center text-xs text-aura-blue hover:underline"
                        >
                          View all notifications
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Profile Menu */}
              <div ref={userMenuRef} className="relative hidden md:block">
                <button
                  onClick={() => { setUserMenuOpen(!userMenuOpen); setNotificationOpen(false); }}
                  className="flex items-center gap-2 ml-2 pl-2 border-l border-surface-border hover:opacity-80 transition-opacity"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-aura-blue to-aura-purple flex items-center justify-center text-xs font-bold text-white">
                    PA
                  </div>
                  <ChevronDown className={cn('w-4 h-4 text-text-muted transition-transform', userMenuOpen && 'rotate-180')} />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 bg-aura-void/95 backdrop-blur-xl border border-surface-border rounded-xl shadow-elevated overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-surface-border">
                        <p className="text-sm font-semibold text-text-primary">Project Aura</p>
                        <p className="text-xs text-text-muted">admin@projaura.gov.gh</p>
                      </div>
                      <div className="py-1">
                        <Link
                          href="/dashboard/settings"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
                        >
                          <User className="w-4 h-4" />
                          Profile
                        </Link>
                        <Link
                          href="/dashboard/settings"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          Settings
                        </Link>
                        <Link
                          href="/dashboard/reports"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                          Reports
                        </Link>
                      </div>
                      <div className="border-t border-surface-border py-1">
                        <button
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-aura-red hover:bg-white/5 transition-colors w-full"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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
