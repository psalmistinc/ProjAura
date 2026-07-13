'use client';

import { motion } from 'framer-motion';
import { Settings, User, Bell, Shield, Database, Save } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { staggerContainer, fadeInUp } from '@/lib/animations';

const settingsSections = [
  {
    title: 'Profile',
    icon: User,
    fields: [
      { label: 'Organization Name', value: 'Project Aura', type: 'text' },
      { label: 'Email', value: 'admin@projaura.gov.gh', type: 'email' },
      { label: 'Phone', value: '+233 30 123 4567', type: 'tel' },
    ],
  },
  {
    title: 'Notifications',
    icon: Bell,
    fields: [
      { label: 'Email Notifications', value: true, type: 'toggle' },
      { label: 'SLA Breach Alerts', value: true, type: 'toggle' },
      { label: 'Settlement Updates', value: true, type: 'toggle' },
      { label: 'Weekly Reports', value: false, type: 'toggle' },
    ],
  },
  {
    title: 'Security',
    icon: Shield,
    fields: [
      { label: 'Two-Factor Authentication', value: true, type: 'toggle' },
      { label: 'Session Timeout (minutes)', value: 30, type: 'number' },
      { label: 'API Key', value: '••••••••••••••••', type: 'text' },
    ],
  },
  {
    title: 'Data & Privacy',
    icon: Database,
    fields: [
      { label: 'Data Retention (days)', value: 365, type: 'number' },
      { label: 'Audit Log Access', value: true, type: 'toggle' },
    ],
  },
];

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <PageWrapper>
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
          <motion.div variants={fadeInUp}>
            <h1 className="text-3xl font-bold text-text-primary">Settings</h1>
            <p className="text-text-secondary mt-1">Manage your account and application preferences</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {settingsSections.map((section) => (
              <motion.div key={section.title} variants={fadeInUp}>
                <Card variant="glass" padding="md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <section.icon className="w-5 h-5 text-aura-blue" />
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {section.fields.map((field) => (
                        <div key={field.label} className="flex items-center justify-between">
                          <label className="text-sm text-text-secondary">{field.label}</label>
                          {field.type === 'toggle' ? (
                            <div className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${field.value ? 'bg-aura-blue' : 'bg-surface-border'}`}>
                              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${field.value ? 'translate-x-5' : 'translate-x-0.5'}`} />
                            </div>
                          ) : (
                            <input
                              type={field.type}
                              defaultValue={field.value as string | number}
                              className="bg-surface-border/30 border border-surface-border rounded-lg px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-aura-blue w-48"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div variants={fadeInUp} className="flex justify-end gap-3">
            <Button variant="outline">Cancel</Button>
            <Button variant="primary">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </motion.div>
        </motion.div>
      </PageWrapper>
    </DashboardLayout>
  );
}
