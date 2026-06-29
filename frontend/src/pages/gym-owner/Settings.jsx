import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { LoadingSpinner } from '../../components/ui';
import DashboardLayout from '../../components/layout/DashboardLayout';

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [gym, setGym] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('general');

  useEffect(() => {
    Promise.all([api.get('/gym/settings'), api.get('/gym/settings/registration-link'), api.get('/auth/me')])
      .then(([s, q, me]) => { setSettings(s.data); setQrData(q.data); setGym(me.data.gym); })
      .finally(() => setLoading(false));
  }, []);

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

  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'tax', label: 'Tax / GST' },
    { id: 'discount', label: 'Discount' },
    { id: 'receipt', label: 'Receipt' },
    { id: 'qr', label: 'QR Registration' },
  ];

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="flex gap-2 mb-6 border-b">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${tab === t.id ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'general' && (
        <div className="card p-5 max-w-lg space-y-4">
          <p className="text-sm text-gray-500">Gym: <strong>{gym?.name}</strong></p>
          <p className="text-sm text-gray-500">Slug: {gym?.slug}</p>
        </div>
      )}

      {tab === 'tax' && (
        <div className="card p-5 max-w-lg space-y-4">
          <label className="flex items-center gap-2"><input type="checkbox" checked={settings.taxEnabled} onChange={(e) => setSettings({ ...settings, taxEnabled: e.target.checked })} /> Tax Enabled</label>
          <div><label className="label">Tax Name</label><input className="input" value={settings.taxName} onChange={(e) => setSettings({ ...settings, taxName: e.target.value })} /></div>
          <div><label className="label">Tax Percentage</label><input type="number" className="input" value={settings.taxPercentage} onChange={(e) => setSettings({ ...settings, taxPercentage: Number(e.target.value) })} /></div>
          <div><label className="label">Tax Mode</label>
            <select className="input" value={settings.taxMode} onChange={(e) => setSettings({ ...settings, taxMode: e.target.value })}>
              <option value="included">Included In Fee</option>
              <option value="added_extra">Added Extra</option>
            </select>
          </div>
          <label className="flex items-center gap-2"><input type="checkbox" checked={settings.showTaxBreakdownOnInvoice} onChange={(e) => setSettings({ ...settings, showTaxBreakdownOnInvoice: e.target.checked })} /> Show Tax Breakdown On Invoice</label>
          <button onClick={saveTax} className="btn-primary">Save Tax Settings</button>
        </div>
      )}

      {tab === 'discount' && (
        <div className="card p-5 max-w-lg space-y-4">
          <label className="flex items-center gap-2"><input type="checkbox" checked={settings.discountEnabled} onChange={(e) => setSettings({ ...settings, discountEnabled: e.target.checked })} /> Enable Discount</label>
          <p className="text-sm text-gray-500">When enabled, discount fields appear during member creation and renewal.</p>
          <button onClick={saveDiscount} className="btn-primary">Save</button>
        </div>
      )}

      {tab === 'receipt' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-5 space-y-4">
              <h2 className="text-lg font-semibold">Select Template</h2>
              <div className="space-y-4">
                {[
                  { id: 'professional_white', name: 'Professional White', description: 'Clean white professional receipt', color: 'bg-white border-gray-200' },
                  { id: 'modern_blue', name: 'Modern Blue', description: 'Dark premium receipt with blue accents', color: 'bg-blue-50 border-blue-200' },
                  { id: 'premium_gold', name: 'Premium Gold', description: 'Luxury gold themed receipt', color: 'bg-yellow-50 border-yellow-200' },
                ].map((template) => (
                  <div
                    key={template.id}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${settings.defaultReceiptTemplate === template.id ? 'border-primary-600 ring-2 ring-primary-200' : 'border-gray-200 hover:border-gray-300'} ${template.color}`}
                    onClick={() => setSettings({ ...settings, defaultReceiptTemplate: template.id })}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{template.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                      </div>
                      {settings.defaultReceiptTemplate === template.id && (
                        <div className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t">
                <label className="label">Invoice Prefix</label>
                <input className="input" value={settings.invoicePrefix} onChange={(e) => setSettings({ ...settings, invoicePrefix: e.target.value })} />
              </div>
              <button onClick={saveReceipt} className="btn-primary w-full">Save Receipt Settings</button>
            </div>

            <div className="card p-5">
              <h2 className="text-lg font-semibold mb-4">Live Preview</h2>
              <div className="bg-gray-50 rounded-lg p-4 min-h-[400px]">
                {settings.defaultReceiptTemplate === 'professional_white' && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <div className="text-center mb-4">
                      <div className="font-bold text-xl text-gray-900">{gym?.name || 'Gym Name'}</div>
                      <div className="text-sm text-gray-600">{gym?.address || 'Gym Address'}</div>
                      <div className="text-sm text-gray-600">{gym?.mobile || 'Phone'}</div>
                    </div>
                    <div className="text-center border-b pb-4 mb-4">
                      <div className="font-semibold text-lg">RECEIPT</div>
                      <div className="text-sm text-gray-600">REC000001</div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span>Member ID:</span><span>GYM0001</span></div>
                      <div className="flex justify-between"><span>Member:</span><span>John Doe</span></div>
                      <div className="flex justify-between"><span>Plan:</span><span>Monthly Plan</span></div>
                      <div className="flex justify-between"><span>Plan Amount:</span><span>₹1,500</span></div>
                      <div className="flex justify-between"><span>Discount:</span><span>-₹200</span></div>
                      <div className="flex justify-between font-semibold border-t pt-2"><span>Final Amount:</span><span>₹1,300</span></div>
                      <div className="flex justify-between"><span>Paid:</span><span>₹1,300</span></div>
                    </div>
                  </div>
                )}
                {settings.defaultReceiptTemplate === 'modern_blue' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 shadow-sm">
                    <div className="text-center mb-4">
                      <div className="font-bold text-xl text-blue-900">{gym?.name || 'Gym Name'}</div>
                      <div className="text-sm text-gray-600">{gym?.address || 'Gym Address'}</div>
                      <div className="text-sm text-gray-600">{gym?.mobile || 'Phone'}</div>
                    </div>
                    <div className="text-center border-b border-blue-200 pb-4 mb-4">
                      <div className="font-semibold text-lg text-blue-900">RECEIPT</div>
                      <div className="text-sm text-gray-600">REC000001</div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span>Member ID:</span><span>GYM0001</span></div>
                      <div className="flex justify-between"><span>Member:</span><span>John Doe</span></div>
                      <div className="flex justify-between"><span>Plan:</span><span>Monthly Plan</span></div>
                      <div className="flex justify-between"><span>Plan Amount:</span><span>₹1,500</span></div>
                      <div className="flex justify-between"><span>Discount:</span><span>-₹200</span></div>
                      <div className="flex justify-between font-semibold border-t border-blue-200 pt-2 text-blue-900"><span>Final Amount:</span><span>₹1,300</span></div>
                      <div className="flex justify-between"><span>Paid:</span><span>₹1,300</span></div>
                    </div>
                  </div>
                )}
                {settings.defaultReceiptTemplate === 'premium_gold' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 shadow-sm">
                    <div className="text-center mb-4">
                      <div className="font-bold text-xl text-yellow-800">{gym?.name || 'Gym Name'}</div>
                      <div className="text-sm text-gray-600">{gym?.address || 'Gym Address'}</div>
                      <div className="text-sm text-gray-600">{gym?.mobile || 'Phone'}</div>
                    </div>
                    <div className="text-center border-b border-yellow-200 pb-4 mb-4">
                      <div className="font-semibold text-lg text-yellow-800">RECEIPT</div>
                      <div className="text-sm text-gray-600">REC000001</div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span>Member ID:</span><span>GYM0001</span></div>
                      <div className="flex justify-between"><span>Member:</span><span>John Doe</span></div>
                      <div className="flex justify-between"><span>Plan:</span><span>Monthly Plan</span></div>
                      <div className="flex justify-between"><span>Plan Amount:</span><span>₹1,500</span></div>
                      <div className="flex justify-between"><span>Discount:</span><span>-₹200</span></div>
                      <div className="flex justify-between font-semibold border-t border-yellow-200 pt-2 text-yellow-800"><span>Final Amount:</span><span>₹1,300</span></div>
                      <div className="flex justify-between"><span>Paid:</span><span>₹1,300</span></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'qr' && qrData && (
        <div className="card p-5 max-w-lg space-y-4">
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
          {qrData.checkInQR && (
            <div className="text-center">
              <p className="label mb-2">Check-In QR Code</p>
              <img src={qrData.checkInQR} alt="Check-In QR" className="mx-auto w-48 h-48" />
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
