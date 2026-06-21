import { useEffect, useState } from 'react';
import { FileText, Check } from 'lucide-react';
import api from '../../api/axios';
import { LoadingSpinner, StatusBadge } from '../../components/ui';
import DashboardLayout from '../../components/layout/DashboardLayout';

export default function Templates() {
  const [templates, setTemplates] = useState([
    { id: 'professional_white', name: 'Professional White', description: 'Clean and professional design with white background', active: true },
    { id: 'modern_dark', name: 'Modern Dark', description: 'Sleek dark theme for modern gyms', active: true },
    { id: 'premium_gold', name: 'Premium Gold', description: 'Luxurious gold accent design', active: true },
  ]);
  const [loading, setLoading] = useState(false);

  const toggleTemplate = (id) => {
    setTemplates(templates.map(t => t.id === id ? { ...t, active: !t.active } : t));
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Receipt Templates</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div key={template.id} className={`card p-6 border-2 transition-all ${template.active ? 'border-primary-500' : 'border-gray-200 opacity-60'}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${template.active ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-400'}`}>
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{template.name}</h3>
                  <p className="text-sm text-gray-500">{template.id}</p>
                </div>
              </div>
              <button
                onClick={() => toggleTemplate(template.id)}
                className={`p-2 rounded-full transition-colors ${template.active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}
              >
                <Check size={18} />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">{template.description}</p>
            <div className="flex items-center gap-2">
              <StatusBadge status={template.active ? 'active' : 'inactive'} />
              <span className="text-xs text-gray-500">
                Available in: Starter, Professional, Enterprise
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-6 mt-6">
        <h3 className="font-semibold mb-4">Template Assignment by Plan</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">Starter Plan</p>
              <p className="text-sm text-gray-500">Professional White</p>
            </div>
            <span className="text-sm text-gray-500">1 Template</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">Professional Plan</p>
              <p className="text-sm text-gray-500">Professional White, Modern Dark</p>
            </div>
            <span className="text-sm text-gray-500">2 Templates</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">Enterprise Plan</p>
              <p className="text-sm text-gray-500">All Templates</p>
            </div>
            <span className="text-sm text-gray-500">3 Templates</span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
