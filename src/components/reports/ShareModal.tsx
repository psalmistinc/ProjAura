'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Copy, Check, Clock, Shield, AlertTriangle, X, Link, Lock, Users, Calendar } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ReportData {
  id: string;
  title: string;
  type: string;
  status: string;
  date: string;
  author: string;
  summary?: string;
  findings?: string[];
  recommendations?: string[];
}

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: ReportData;
}

interface ShareResult {
  shareUrl: string;
  shareId: string;
  expiresAt: string;
  maxAccessCount: number;
  createdBy: string;
}

export function ShareModal({ isOpen, onClose, report }: ShareModalProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [expiresInHours, setExpiresInHours] = useState(72);
  const [maxAccessCount, setMaxAccessCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shareResult, setShareResult] = useState<ShareResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    setError('');

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/v1/reports/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId: report.id,
          reportTitle: report.title,
          reportType: report.type,
          reportData: {
            ...report,
            summary: report.summary || 'Report summary not available.',
            findings: report.findings || ['No findings recorded yet.'],
            recommendations: report.recommendations || ['No recommendations at this time.'],
          },
          password,
          expiresInHours,
          maxAccessCount,
          createdBy: 'Current Officer',
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to create share link');
      }

      setShareResult(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create share link');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (shareResult?.shareUrl) {
      await navigator.clipboard.writeText(shareResult.shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setPassword('');
    setConfirmPassword('');
    setError('');
    setShareResult(null);
    setCopied(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Share Report" size="md">
      <div className="space-y-6">
        {/* Report Info */}
        <div className="bg-surface-border/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-aura-blue to-aura-purple flex items-center justify-center shrink-0">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-text-primary truncate">{report.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="info" size="sm">{report.type}</Badge>
                <span className="text-xs text-text-muted">{report.id}</span>
              </div>
            </div>
          </div>
        </div>

        {shareResult ? (
          /* Success State */
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 text-aura-emerald">
              <Check className="w-5 h-5" />
              <span className="text-sm font-medium">Share link created successfully!</span>
            </div>

            <div className="bg-surface-border/20 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Link className="w-4 h-4 text-text-muted" />
                <span className="text-xs text-text-muted">Share URL</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={shareResult.shareUrl}
                  readOnly
                  className="flex-1 bg-surface-border/30 border border-surface-border rounded-lg px-3 py-2 text-sm text-text-primary font-mono"
                />
                <Button
                  variant={copied ? 'success' : 'outline'}
                  size="sm"
                  onClick={handleCopyLink}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-text-muted">
                <Clock className="w-4 h-4" />
                <span>Expires: {new Date(shareResult.expiresAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-text-muted">
                <Users className="w-4 h-4" />
                <span>Max access: {shareResult.maxAccessCount}</span>
              </div>
            </div>

            <div className="bg-aura-amber/10 border border-aura-amber/20 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-aura-amber mt-0.5" />
                <p className="text-xs text-aura-amber">
                  Share this link and password securely with authorized personnel only. 
                  The link will expire after the specified time or access limit.
                </p>
              </div>
            </div>

            <Button variant="outline" className="w-full" onClick={handleClose}>
              Close
            </Button>
          </motion.div>
        ) : (
          /* Form State */
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                <Lock className="w-4 h-4 inline mr-2" />
                Set Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full px-4 py-2.5 bg-surface-border/30 border border-surface-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-aura-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full px-4 py-2.5 bg-surface-border/30 border border-surface-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-aura-blue"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Expires In
                </label>
                <select
                  value={expiresInHours}
                  onChange={(e) => setExpiresInHours(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-surface-border/30 border border-surface-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-aura-blue"
                >
                  <option value={24}>24 hours</option>
                  <option value={48}>48 hours</option>
                  <option value={72}>3 days</option>
                  <option value={168}>7 days</option>
                  <option value={720}>30 days</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  <Users className="w-4 h-4 inline mr-2" />
                  Max Access
                </label>
                <select
                  value={maxAccessCount}
                  onChange={(e) => setMaxAccessCount(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-surface-border/30 border border-surface-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-aura-blue"
                >
                  <option value={1}>1 access</option>
                  <option value={5}>5 accesses</option>
                  <option value={10}>10 accesses</option>
                  <option value={25}>25 accesses</option>
                  <option value={50}>50 accesses</option>
                </select>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-aura-red text-sm"
              >
                <AlertTriangle className="w-4 h-4" />
                {error}
              </motion.div>
            )}

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleShare}
                disabled={loading}
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Generate Secure Link
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
