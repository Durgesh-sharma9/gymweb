import { useEffect, useState } from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import api from '../../api/axios';
import { LoadingSpinner } from '../../components/ui';
import DashboardLayout from '../../components/layout/DashboardLayout';

export default function ExportCenter() {
  const [loading, setLoading] = useState(false);

  const handleExport = async (type, format) => {
    setLoading(true);
    try {
      const response = await api.get(`/super-admin/export/${type}?format=${format}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_export.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Export Center</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
              <FileSpreadsheet size={24} />
            </div>
            <h3 className="font-bold text-lg">All Gyms</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">Export all gym data including owner details, plans, and subscription status.</p>
          <div className="flex gap-2">
            <button
              onClick={() => handleExport('gyms', 'xlsx')}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
              disabled={loading}
            >
              <Download size={16} />
              Excel
            </button>
            <button
              onClick={() => handleExport('gyms', 'csv')}
              className="btn-secondary flex-1 flex items-center justify-center gap-2"
              disabled={loading}
            >
              <Download size={16} />
              CSV
            </button>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-lg">
              <FileSpreadsheet size={24} />
            </div>
            <h3 className="font-bold text-lg">All Members</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">Export all member data across all gyms including membership details.</p>
          <div className="flex gap-2">
            <button
              onClick={() => handleExport('members', 'xlsx')}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
              disabled={loading}
            >
              <Download size={16} />
              Excel
            </button>
            <button
              onClick={() => handleExport('members', 'csv')}
              className="btn-secondary flex-1 flex items-center justify-center gap-2"
              disabled={loading}
            >
              <Download size={16} />
              CSV
            </button>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
              <FileSpreadsheet size={24} />
            </div>
            <h3 className="font-bold text-lg">All Trainers</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">Export all trainer data across all gyms including permissions.</p>
          <div className="flex gap-2">
            <button
              onClick={() => handleExport('trainers', 'xlsx')}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
              disabled={loading}
            >
              <Download size={16} />
              Excel
            </button>
            <button
              onClick={() => handleExport('trainers', 'csv')}
              className="btn-secondary flex-1 flex items-center justify-center gap-2"
              disabled={loading}
            >
              <Download size={16} />
              CSV
            </button>
          </div>
        </div>
      </div>

      <div className="card p-6 mt-6">
        <h3 className="font-semibold mb-4">Export Information</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>• Excel files (.xlsx) include formatting and multiple sheets</li>
          <li>• CSV files (.csv) are compatible with most spreadsheet applications</li>
          <li>• Exports include all current data at the time of download</li>
          <li>• Large exports may take a few moments to generate</li>
        </ul>
      </div>
    </DashboardLayout>
  );
}
