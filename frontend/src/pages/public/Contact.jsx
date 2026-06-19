import { useState } from 'react';
import { Dumbbell, Mail, Phone, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/v1/contact', formData);
      toast.success('Message sent successfully!');
      setFormData({ name: '', email: '', mobile: '', message: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <a href="/" className="flex items-center gap-2">
            <Dumbbell className="text-primary-600" size={24} />
            <span className="text-xl font-bold">GymWeb</span>
          </a>
        </div>
      </nav>

      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
            <p className="text-xl text-gray-600">We'd love to hear from you</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Get in Touch</h2>
              <div className="space-y-6">
                <ContactItem icon={<Mail size={24} />} title="Email" content="support@gymweb.com" />
                <ContactItem icon={<Phone size={24} />} title="Phone" content="+91 98765 43210" />
                <ContactItem icon={<MapPin size={24} />} title="Address" content="Bangalore, India" />
              </div>

              <div className="mt-8 p-6 bg-primary-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Book a Demo</h3>
                <p className="text-gray-600 mb-4">Want to see GymWeb in action? Schedule a personalized demo with our team.</p>
                <button className="btn-primary">Schedule Demo</button>
              </div>
            </div>

            <div className="card p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Name</label>
                  <input
                    type="text"
                    name="name"
                    className="input"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="input"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="label">Mobile</label>
                  <input
                    type="tel"
                    name="mobile"
                    className="input"
                    value={formData.mobile}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="label">Message</label>
                  <textarea
                    name="message"
                    className="input"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ContactItem({ icon, title, content }) {
  return (
    <div className="flex items-start gap-4">
      <div className="text-primary-600 mt-1">{icon}</div>
      <div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="text-gray-600">{content}</p>
      </div>
    </div>
  );
}
