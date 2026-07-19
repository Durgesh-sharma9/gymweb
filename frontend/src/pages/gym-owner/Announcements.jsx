import { useEffect, useState } from 'react';
import { Plus, Megaphone, Send, Users, Clock, Pin, Bell } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { LoadingSpinner, Badge, Button, Card, Modal, Input, Select, EmptyState } from '../../components/ui';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { formatDate } from '../../utils/helpers';

export default function Announcements() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', targetAudience: 'all' });

  const load = () => {
    setLoading(true);
    api.get('/announcements')
      .then((res) => setItems(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        console.error('Failed to load announcements:', err);
        toast.error('Failed to load announcements');
        setItems([]);
      })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/announcements', form);
      toast.success('Announcement created');
      setModal(false);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const pinnedItems = items.filter(a => a.pinned);
  const regularItems = items.filter(a => !a.pinned);

  if (loading) return <DashboardLayout title="Announcements" description="Send announcements to keep your members informed"><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout title="Announcements" description="Send announcements to keep your members informed">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">{items.length} announcement{items.length !== 1 ? 's' : ''}</p>
        <Button onClick={() => setModal(true)} icon={Send}>New Announcement</Button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="No announcements found"
          description="Send announcements to keep your members informed"
          action={<Button onClick={() => setModal(true)} icon={Send}>New Announcement</Button>}
        />
      ) : (
        <div className="space-y-6">
          {/* Pinned Announcements */}
          {pinnedItems.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Pin size={16} className="text-[#2563EB]" />
                <h3 className="font-semibold text-gray-900">Pinned</h3>
              </div>
              <div className="space-y-4">
                {pinnedItems.map((a) => (
                  <Card key={a._id} className="border-[#2563EB] bg-[#2563EB]/5">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-[#2563EB] rounded-xl">
                        <Megaphone size={20} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{a.title}</h3>
                          <Badge variant="primary" size="sm">Pinned</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{a.message}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Users size={14} />
                            <span className="capitalize">{a.targetAudience}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            <span>{formatDate(a.sentAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Regular Announcements */}
          {regularItems.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Recent</h3>
              <div className="space-y-4">
                {regularItems.map((a) => (
                  <Card key={a._id} className="hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gray-100 rounded-xl">
                        <Bell size={20} className="text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{a.title}</h3>
                        <p className="text-sm text-gray-600 mb-3">{a.message}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Users size={14} />
                            <span className="capitalize">{a.targetAudience}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            <span>{formatDate(a.sentAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="New Announcement">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all duration-200"
              rows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              required
              placeholder="Enter your announcement message..."
            />
          </div>
          <Select
            label="Target Audience"
            value={form.targetAudience}
            onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
          >
            <option value="all">All Members</option>
            <option value="active">Active Members</option>
            <option value="expired">Expired Members</option>
          </Select>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
            <Button type="submit" icon={Send}>Send Announcement</Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
