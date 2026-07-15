import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { LoadingSpinner } from '../../components/ui';
import DashboardLayout from '../../components/layout/DashboardLayout';

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [gym, setGym] = useState(null);
  const [gymForm, setGymForm] = useState({});
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('general');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([api.get('/gym/settings'), api.get('/gym/settings/registration-link'), api.get('/auth/me')])
      .then(([s, q, me]) => {
        setSettings(s.data);
        setQrData(q.data);
        setGym(me.data.gym);
        setGymForm({
          name: me.data.gym?.name || '',
          address: me.data.gym?.address || '',
          city: me.data.gym?.city || '',
          state: me.data.gym?.state || '',
          pincode: me.data.gym?.pincode || '',
          mobile: me.data.gym?.mobile || '',
          email: me.data.gym?.email || '',
          logo: me.data.gym?.logo || '',
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const saveGeneral = async () => {
    setSaving(true);
    try {
      const res = await api.put('/gym/settings/general', gymForm);
      setGym(res.data);
      toast.success('Gym details saved');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const saveTax = async () => {
    await api.put('/gym/settings/tax', settings);
    toast.success('Tax settings saved');
  };

  const saveDiscount = async () => {
    await api.put('/gym/settings/discount', { discountEnabled: settings.discountEnabled });
    toast.success('Discount settings saved');
  };

  const saveReceipt = async () => {
    await api.put('/gym/settings/receipt', settings);
    toast.success('Receipt settings saved');
  };

  const handleBackup = async () => {
    try {
      const response = await api.get('/backup', { responseType: 'arraybuffer' });
      const blob = new Blob([response.data], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `gym-backup-${gym?.slug || 'data'}-${Date.now()}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Backup downloaded');
    } catch (err) {
      toast.error(err.message || 'Backup failed');
    }
  };

  if (loading) return <DashboardLayout title="Settings"><LoadingSpinner /></DashboardLayout>;

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'tax', label: 'Tax / GST' },
    { id: 'discount', label: 'Discount' },
    { id: 'receipt', label: 'Receipt' },
    { id: 'qr', label: 'QR Registration' },
    { id: 'backup', label: 'Backup' },
  ];

  return (
    <DashboardLayout title="Settings">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Settings</h1>

      <div className="flex gap-2 mb-6 border-b dark:border-gray-800 overflow-x-auto">
        {tabs.map((t) => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)} className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px whitespace-nowrap ${tab === t.id ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'general' && (
        <div className="card p-5 max-w-lg space-y-4 dark:bg-gray-900 dark:border-gray-800">
          <div><label className="label">Gym Name</label><input className="input" value={gymForm.name} onChange={(e) => setGymForm({ ...gymForm, name: e.target.value })} /></div>
          <div><label className="label">Address</label><input className="input" value={gymForm.address} onChange={(e) => setGymForm({ ...gymForm, address: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">City</label><input className="input" value={gymForm.city} onChange={(e) => setGymForm({ ...gymForm, city: e.target.value })} /></div>
            <div><label className="label">State</label><input className="input" value={gymForm.state} onChange={(e) => setGymForm({ ...gymForm, state: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Pincode</label><input className="input" value={gymForm.pincode} onChange={(e) => setGymForm({ ...gymForm, pincode: e.target.value })} /></div>
            <div><label className="label">Mobile</label><input className="input" value={gymForm.mobile} onChange={(e) => setGymForm({ ...gymForm, mobile: e.target.value })} /></div>
          </div>
          <div><label className="label">Email</label><input type="email" className="input" value={gymForm.email} onChange={(e) => setGymForm({ ...gymForm, email: e.target.value })} /></div>
          <div><label className="label">Logo URL</label><input className="input" value={gymForm.logo} onChange={(e) => setGymForm({ ...gymForm, logo: e.target.value })} placeholder="https://..." /></div>
          <p className="text-xs text-gray-500">Currency: INR (₹) — configured for Indian gyms</p>
          <button type="button" onClick={saveGeneral} disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Gym Details'}</button>
        </div>
      )}

      {tab === 'tax' && (
        <div className="card p-5 max-w-lg space-y-4 dark:bg-gray-900 dark:border-gray-800">
          <label className="flex items-center gap-2"><input type="checkbox" checked={settings.taxEnabled} onChange={(e) => setSettings({ ...settings, taxEnabled: e.target.checked })} /> Enable GST / Tax</label>
          <div><label className="label">Tax Name</label><input className="input" value={settings.taxName} onChange={(e) => setSettings({ ...settings, taxName: e.target.value })} placeholder="GST" /></div>
          <div><label className="label">Tax Percentage (%)</label><input type="number" className="input" value={settings.taxPercentage} onChange={(e) => setSettings({ ...settings, taxPercentage: Number(e.target.value) })} /></div>
          <div><label className="label">Tax Mode</label>
            <select className="input" value={settings.taxMode} onChange={(e) => setSettings({ ...settings, taxMode: e.target.value })}>
              <option value="included">Included In Fee</option>
              <option value="added_extra">Added Extra</option>
            </select>
          </div>
          <label className="flex items-center gap-2"><input type="checkbox" checked={settings.showTaxBreakdownOnInvoice} onChange={(e) => setSettings({ ...settings, showTaxBreakdownOnInvoice: e.target.checked })} /> Show Tax Breakdown On Invoice</label>
          <button type="button" onClick={saveTax} className="btn-primary">Save Tax Settings</button>
        </div>
      )}

      {tab === 'discount' && (
        <div className="card p-5 max-w-lg space-y-4 dark:bg-gray-900 dark:border-gray-800">
          <label className="flex items-center gap-2"><input type="checkbox" checked={settings.discountEnabled} onChange={(e) => setSettings({ ...settings, discountEnabled: e.target.checked })} /> Enable Discount</label>
          <p className="text-sm text-gray-500">When enabled, discount fields appear during member creation and renewal.</p>
          <button type="button" onClick={saveDiscount} className="btn-primary">Save</button>
        </div>
      )}

      {tab === 'receipt' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-5 space-y-4 dark:bg-gray-900 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Select Template</h2>
              <div className="space-y-4">
                {[
                  { id: 'professional_white', name: 'Professional White', description: 'Clean white professional receipt', color: 'bg-white border-gray-200' },
                  { id: 'modern_blue', name: 'Modern Blue', description: 'Dark premium receipt with blue accents', color: 'bg-blue-50 border-blue-200' },
                  { id: 'premium_gold', name: 'Premium Gold', description: 'Luxury gold themed receipt', color: 'bg-yellow-50 border-yellow-200' },
                ].map((template) => (
                  <div
                    key={template.id}
                    role="button"
                    tabIndex={0}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${settings.defaultReceiptTemplate === template.id ? 'border-primary-600 ring-2 ring-primary-200' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'} ${template.color}`}
                    onClick={() => setSettings({ ...settings, defaultReceiptTemplate: template.id })}
                    onKeyDown={(e) => e.key === 'Enter' && setSettings({ ...settings, defaultReceiptTemplate: template.id })}
                  >
                    <h3 className="font-semibold text-gray-900">{template.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t dark:border-gray-700">
                <label className="label">Invoice Prefix</label>
                <input className="input" value={settings.invoicePrefix} onChange={(e) => setSettings({ ...settings, invoicePrefix: e.target.value })} />
              </div>
              <button type="button" onClick={saveReceipt} className="btn-primary w-full">Save Receipt Settings</button>
            </div>
          </div>
        </div>
      )}

      {tab === 'qr' && qrData && (
        <div className="card p-5 max-w-lg space-y-4 dark:bg-gray-900 dark:border-gray-800">
          <div>
            <label className="label">Registration Link</label>
            <input className="input" readOnly value={qrData.registrationUrl} />
          </div>
          {qrData.registrationQR && (
            <div className="text-center">
              <p className="label mb-2">Registration QR Code</p>
              <img src={qrData.registrationQR} alt="Registration QR" className="mx-auto w-48 h-48" />
            </div>
          )}
        </div>
      )}

      {tab === 'backup' && (
        <div className="card p-5 max-w-lg space-y-4 dark:bg-gray-900 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Database Backup</h2>
          <p className="text-sm text-gray-500">Download a JSON backup of all gym data including members, payments, attendance, and settings.</p>
          <button type="button" onClick={handleBackup} className="btn-primary flex items-center gap-2">
            <Download size={18} /> Download Backup
          </button>
        </div>
      )}
    </DashboardLayout>
  );
}
