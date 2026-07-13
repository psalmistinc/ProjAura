'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Shield, AlertTriangle, FileText, Download, Clock, Users, CheckCircle2, Printer, ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ReportData {
  reportId: string;
  reportTitle: string;
  reportType: string;
  reportData: {
    id: string;
    title: string;
    type: string;
    status: string;
    date: string;
    author: string;
    summary?: string;
    findings?: string[];
    recommendations?: string[];
  };
  createdBy: string;
  createdAt: string;
  expiresAt?: string;
  remainingAccesses?: number;
}

export default function SharedReportPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [report, setReport] = useState<ReportData | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(true);

  const handleVerify = async () => {
    if (!password) {
      setError('Please enter the password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/v1/reports/share?token=${token}&password=${encodeURIComponent(password)}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to verify password');
      }

      setReport(result.data);
      setShowPasswordForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify password');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // In production, this would generate a PDF
    const content = generateReportContent();
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report?.reportId || 'report'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateReportContent = () => {
    if (!report) return '';
    const rd = report.reportData;
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${rd.title} - Project Aura</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #1a1a2e; }
          .header { border-bottom: 2px solid #0ea5e9; padding-bottom: 20px; margin-bottom: 20px; }
          .meta { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin: 20px 0; }
          .meta-item { padding: 10px; background: #f8fafc; border-radius: 8px; }
          .meta-label { font-size: 12px; color: #64748b; text-transform: uppercase; }
          .meta-value { font-size: 14px; font-weight: bold; margin-top: 4px; }
          .section { margin: 20px 0; }
          .section-title { font-size: 18px; font-weight: bold; color: #0ea5e9; margin-bottom: 10px; }
          .finding, .recommendation { padding: 10px; background: #f1f5f9; border-left: 3px solid #0ea5e9; margin: 10px 0; border-radius: 0 8px 8px 0; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${rd.title}</h1>
          <p>Project Aura - Financial Infrastructure</p>
        </div>
        <div class="meta">
          <div class="meta-item"><div class="meta-label">Report ID</div><div class="meta-value">${rd.id}</div></div>
          <div class="meta-item"><div class="meta-label">Type</div><div class="meta-value">${rd.type}</div></div>
          <div class="meta-item"><div class="meta-label">Status</div><div class="meta-value">${rd.status}</div></div>
          <div class="meta-item"><div class="meta-label">Date</div><div class="meta-value">${rd.date}</div></div>
        </div>
        <div class="section">
          <div class="section-title">Summary</div>
          <p>${rd.summary || 'No summary available.'}</p>
        </div>
        <div class="section">
          <div class="section-title">Findings</div>
          ${(rd.findings || []).map((f, i) => `<div class="finding">${i + 1}. ${f}</div>`).join('')}
        </div>
        <div class="section">
          <div class="section-title">Recommendations</div>
          ${(rd.recommendations || []).map((r, i) => `<div class="recommendation">${i + 1}. ${r}</div>`).join('')}
        </div>
        <div class="footer">
          <p>Generated by Project Aura on ${new Date().toLocaleDateString()}</p>
          <p>Shared by ${report.createdBy} | Expires: ${report.expiresAt ? new Date(report.expiresAt).toLocaleDateString() : 'Never'}</p>
          <p>This document is confidential and intended for authorized personnel only.</p>
        </div>
      </body>
      </html>
    `;
  };

  const statusConfig: Record<string, { variant: 'success' | 'warning' | 'info' | 'default'; label: string }> = {
    COMPLETED: { variant: 'success', label: 'Completed' },
    IN_PROGRESS: { variant: 'info', label: 'In Progress' },
    PENDING_REVIEW: { variant: 'warning', label: 'Pending Review' },
    COMPLIANCE: { variant: 'info', label: 'Compliance' },
    FINANCIAL: { variant: 'default', label: 'Financial' },
    PERFORMANCE: { variant: 'success', label: 'Performance' },
    CONSUMER: { variant: 'warning', label: 'Consumer' },
    RISK: { variant: 'default', label: 'Risk' },
  };

  return (
    <div className="min-h-screen print:bg-white">
      <div className="print:hidden">
        <Navbar />
      </div>
      
      <main className="pt-24 pb-16 print:pt-0">
        <PageWrapper>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <AnimatePresence mode="wait">
              {showPasswordForm ? (
                /* Password Gate */
                <motion.div
                  key="password"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col items-center justify-center min-h-[60vh]"
                >
                  <Card variant="glass" padding="lg" className="w-full max-w-md">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-aura-blue to-aura-purple flex items-center justify-center mb-4">
                        <Lock className="w-8 h-8 text-white" />
                      </div>
                      <h1 className="text-2xl font-bold text-text-primary">Protected Report</h1>
                      <p className="text-text-secondary mt-2">
                        This report is password-protected. Enter the password to view it.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">
                          Password
                        </label>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                          placeholder="Enter password"
                          className="w-full px-4 py-2.5 bg-surface-border/30 border border-surface-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-aura-blue"
                          autoFocus
                        />
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

                      <Button
                        variant="primary"
                        className="w-full"
                        onClick={handleVerify}
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
                            Verify & Access Report
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="mt-6 text-center">
                      <button
                        onClick={() => router.push('/')}
                        className="text-sm text-text-muted hover:text-text-primary transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4 inline mr-1" />
                        Back to Home
                      </button>
                    </div>
                  </Card>
                </motion.div>
              ) : (
                /* Report Content */
                <motion.div
                  key="report"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
                    <div>
                      <Badge variant={statusConfig[report?.reportData.status || '']?.variant || 'info'} size="lg" className="mb-2">
                        {report?.reportData.status}
                      </Badge>
                      <h1 className="text-3xl font-bold text-text-primary">{report?.reportData.title}</h1>
                      <p className="text-text-secondary mt-1">
                        Report ID: {report?.reportData.id} | Shared by {report?.createdBy}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handlePrint}>
                        <Printer className="w-4 h-4 mr-2" />
                        Print
                      </Button>
                      <Button variant="outline" onClick={handleDownloadPDF}>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>

                  {/* Print Header */}
                  <div className="hidden print:block border-b-2 border-aura-blue pb-4 mb-6">
                    <h1 className="text-2xl font-bold">{report?.reportData.title}</h1>
                    <p className="text-sm text-gray-600">Project Aura - Financial Infrastructure</p>
                  </div>

                  {/* Meta Info */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4">
                    <Card variant="glass" padding="md">
                      <p className="text-xs text-text-muted">Report Type</p>
                      <p className="text-sm font-semibold text-text-primary mt-1">{report?.reportData.type}</p>
                    </Card>
                    <Card variant="glass" padding="md">
                      <p className="text-xs text-text-muted">Date</p>
                      <p className="text-sm font-semibold text-text-primary mt-1">{report?.reportData.date}</p>
                    </Card>
                    <Card variant="glass" padding="md">
                      <p className="text-xs text-text-muted">Author</p>
                      <p className="text-sm font-semibold text-text-primary mt-1">{report?.reportData.author}</p>
                    </Card>
                    <Card variant="glass" padding="md">
                      <p className="text-xs text-text-muted">Remaining Access</p>
                      <p className="text-sm font-semibold text-text-primary mt-1">
                        {report?.remainingAccesses ?? 'Unlimited'}
                      </p>
                    </Card>
                  </div>

                  {/* Summary */}
                  <Card variant="glass" padding="lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-aura-blue" />
                        Executive Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-text-secondary leading-relaxed">
                        {report?.reportData.summary || 'No summary available for this report.'}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Findings */}
                  <Card variant="glass" padding="lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-aura-emerald" />
                        Key Findings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {(report?.reportData.findings || []).length > 0 ? (
                          report?.reportData.findings?.map((finding, index) => (
                            <div
                              key={index}
                              className="flex items-start gap-3 p-3 bg-surface-border/20 rounded-lg"
                            >
                              <span className="w-6 h-6 rounded-full bg-aura-emerald/20 text-aura-emerald flex items-center justify-center text-xs font-bold shrink-0">
                                {index + 1}
                              </span>
                              <p className="text-sm text-text-secondary">{finding}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-text-muted text-sm">No findings recorded yet.</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recommendations */}
                  <Card variant="glass" padding="lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-aura-amber" />
                        Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {(report?.reportData.recommendations || []).length > 0 ? (
                          report?.reportData.recommendations?.map((rec, index) => (
                            <div
                              key={index}
                              className="flex items-start gap-3 p-3 bg-surface-border/20 rounded-lg"
                            >
                              <span className="w-6 h-6 rounded-full bg-aura-amber/20 text-aura-amber flex items-center justify-center text-xs font-bold shrink-0">
                                {index + 1}
                              </span>
                              <p className="text-sm text-text-secondary">{rec}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-text-muted text-sm">No recommendations at this time.</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Footer */}
                  <div className="text-center text-xs text-text-muted print:text-gray-500 pt-6 border-t border-surface-border print:border-gray-300">
                    <p>Generated by Project Aura on {new Date().toLocaleDateString()}</p>
                    <p className="mt-1">
                      Shared by {report?.createdBy} | Expires: {report?.expiresAt ? new Date(report.expiresAt).toLocaleDateString() : 'Never'}
                    </p>
                    <p className="mt-1">
                      This document is confidential and intended for authorized personnel only.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </PageWrapper>
      </main>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
