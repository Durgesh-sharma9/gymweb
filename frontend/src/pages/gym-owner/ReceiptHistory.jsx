import { useEffect, useState } from 'react';
import { Search, Download, MessageCircle, Eye } from 'lucide-react';
import api from '../../api/axios';
import { LoadingSpinner, StatusBadge } from '../../components/ui';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { formatCurrency, formatDate } from '../../utils/helpers';

export default function ReceiptHistory() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    api.get(`/invoices?${params}`).then((res) => {
      setInvoices(res.data.invoices || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(load, [search]);

  const handleDownloadPDF = async (invoice) => {
    try {
      const response = await api.get(`/invoices/${invoice._id}/pdf`, { responseType: 'arraybuffer' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt_${invoice.invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const handleSendWhatsApp = (invoice) => {
    const { memberSnapshot, membershipSnapshot, lineItems, gymSnapshot } = invoice;
    const message = `🧾 Receipt\n\nReceipt No: ${invoice.invoiceNumber}\nDate: ${formatDate(invoice.createdAt)}\n\nMember ID: ${memberSnapshot.memberId || '-'}\nMember: ${memberSnapshot.fullName}\nMobile: ${memberSnapshot.mobile}\n\nPlan: ${membershipSnapshot.planName}\nPeriod: ${formatDate(membershipSnapshot.startDate)} - ${formatDate(membershipSnapshot.endDate)}\n\nPlan Amount: ₹${lineItems.baseAmount}\nDiscount: ₹${lineItems.discount}\nFinal Amount: ₹${lineItems.finalAmount}\nPaid: ₹${lineItems.paidAmount}\n\nView Receipt:\n${window.location.origin}/invoice/${invoice.publicToken}`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${memberSnapshot.mobile}?text=${encodedMessage}`, '_blank');
  };

  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Receipt History</h1>

      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input className="input pl-10" placeholder="Search by receipt number, member name, or mobile..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {invoices.length === 0 ? (
        <div className="card p-8 text-center text-gray-500">
          No receipts found
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3">Receipt No</th>
                <th className="text-left p-3">Member</th>
                <th className="text-left p-3">Amount</th>
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice._id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{invoice.invoiceNumber}</td>
                  <td className="p-3">
                    <div>{invoice.memberSnapshot.fullName}</div>
                    <div className="text-xs text-gray-500">{invoice.memberSnapshot.mobile}</div>
                  </td>
                  <td className="p-3">{formatCurrency(invoice.lineItems.finalAmount)}</td>
                  <td className="p-3">{formatDate(invoice.createdAt)}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button onClick={() => window.open(`${window.location.origin}/invoice/${invoice.publicToken}`, '_blank')} className="text-primary-600 hover:underline flex items-center gap-1">
                        <Eye size={16} /> View
                      </button>
                      <button onClick={() => handleDownloadPDF(invoice)} className="text-primary-600 hover:underline flex items-center gap-1">
                        <Download size={16} /> PDF
                      </button>
                      <button onClick={() => handleSendWhatsApp(invoice)} className="text-green-600 hover:underline flex items-center gap-1">
                        <MessageCircle size={16} /> WhatsApp
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
