import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { LoadingSpinner } from '../../components/ui';
import DashboardLayout from '../../components/layout/DashboardLayout';

export default function SuperAdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    platformName: 'GymWeb',
    platformLogo: '',
    trialDuration: 14,
    supportEmail: 'support@gymweb.com',
    supportMobile: '+91 9876543210',
  });

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/super-admin/settings', settings);
      toast.success('Settings saved successfully');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Platform Settings</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="card p-6">
          <h3 className="font-semibold mb-4">General Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="label">Platform Name</label>
              <input
                className="input"
                value={settings.platformName}
                onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Platform Logo URL</label>
              <input
                className="input"
                value={settings.platformLogo}
                onChange={(e) => setSettings({ ...settings, platformLogo: e.target.value })}
                placeholder="https://example.com/logo.png"
              />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold mb-4">Trial Settings</h3>
          <div>
            <label className="label">Trial Duration (Days)</label>
            <input
              type="number"
              className="input"
              value={settings.trialDuration}
              onChange={(e) => setSettings({ ...settings, trialDuration: parseInt(e.target.value) })}
              min="1"
              max="90"
              required
            />
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold mb-4">Support Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="label">Support Email</label>
              <input
                type="email"
                className="input"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Support Mobile</label>
              <input
                className="input"
                value={settings.supportMobile}
                onChange={(e) => setSettings({ ...settings, supportMobile: e.target.value })}
                required
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="btn-primary" disabled={saving}>
            <Save size={18} className="mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
}
