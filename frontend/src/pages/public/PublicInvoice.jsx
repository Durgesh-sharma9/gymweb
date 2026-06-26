import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axios';
import { LoadingSpinner } from '../../components/ui';
import { formatCurrency, formatDate } from '../../utils/helpers';

export default function PublicInvoice() {
  const { token } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/public/invoices/${token}`).then((res) => setInvoice(res.data)).finally(() => setLoading(false));
  }, [token]);

  if (loading) return <LoadingSpinner />;
  if (!invoice) return <div className="p-8 text-center">Invoice not found</div>;

  const { gymSnapshot, memberSnapshot, membershipSnapshot, lineItems } = invoice;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto card p-8">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold">{gymSnapshot.name}</h1>
          <p className="text-sm text-gray-500">{gymSnapshot.address}</p>
          <p className="text-sm text-gray-500">{gymSnapshot.mobile}</p>
        </div>

        <div className="text-center mb-4">
          <h2 className="text-lg font-semibold">RECEIPT</h2>
          <p className="text-sm text-gray-500">{invoice.invoiceNumber} · {formatDate(invoice.createdAt)}</p>
        </div>

        <div className="border-t border-b py-4 mb-4 space-y-1 text-sm">
          <p><strong>Member ID:</strong> {memberSnapshot.memberId || '-'}</p>
          <p><strong>Member:</strong> {memberSnapshot.fullName}</p>
          <p><strong>Mobile:</strong> {memberSnapshot.mobile}</p>
          <p><strong>Plan:</strong> {membershipSnapshot.planName}</p>
          <p><strong>Period:</strong> {formatDate(membershipSnapshot.startDate)} - {formatDate(membershipSnapshot.endDate)}</p>
        </div>

        <div className="space-y-1 text-sm mb-4">
          <div className="flex justify-between"><span>Plan Amount</span><span>{formatCurrency(lineItems.baseAmount)}</span></div>
          {lineItems.discount > 0 && <div className="flex justify-between"><span>Discount</span><span>-{formatCurrency(lineItems.discount)}</span></div>}
          {lineItems.tax > 0 && <div className="flex justify-between"><span>Tax</span><span>{formatCurrency(lineItems.tax)}</span></div>}
          <div className="flex justify-between font-bold text-base border-t pt-2"><span>Final Amount</span><span>{formatCurrency(lineItems.finalAmount)}</span></div>
          <div className="flex justify-between"><span>Paid</span><span>{formatCurrency(lineItems.paidAmount)}</span></div>
          {lineItems.dueAmount > 0 && <div className="flex justify-between text-red-600"><span>Due</span><span>{formatCurrency(lineItems.dueAmount)}</span></div>}
        </div>

        <p className="text-sm text-gray-500 capitalize">Payment: {invoice.paymentMethod?.replace('_', ' ')}</p>

        {invoice.qrCodeUrl && (
          <div className="text-center mt-4">
            <img src={invoice.qrCodeUrl} alt="QR" className="mx-auto w-24 h-24" />
          </div>
        )}

        <div className="flex gap-2 mt-6">
          <a href={`/api/v1/public/invoices/${token}/pdf`} className="btn-primary flex-1 block text-center" download>
            Download PDF
          </a>
          <button onClick={() => window.print()} className="btn-secondary flex-1">
            Print
          </button>
        </div>
      </div>
    </div>
  );
}
