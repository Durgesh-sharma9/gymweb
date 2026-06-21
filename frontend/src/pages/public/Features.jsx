import { Link } from 'react-router-dom';
import { Dumbbell, Users, QrCode, TrendingUp, Receipt, MessageSquare, Zap, Shield, Clock, BarChart3, Wallet } from 'lucide-react';

export default function Features() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <Dumbbell className="text-primary-600" size={24} />
            <span className="text-xl font-bold">GymWeb</span>
          </Link>
          <Link to="/signup" className="btn-primary">Start Free Trial</Link>
        </div>
      </nav>

      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Powerful Features</h1>
            <p className="text-xl text-gray-600">Everything you need to manage your gym efficiently</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Users size={40} />}
              title="Member Management"
              description="Comprehensive member profiles with photo uploads, contact details, membership history, and renewal tracking."
              features={['Photo uploads', 'Contact details', 'Membership history', 'Renewal tracking']}
            />
            <FeatureCard 
              icon={<Users size={40} />}
              title="Trainer Management"
              description="Manage your training staff with role-based access, performance tracking, and member assignments."
              features={['Role-based access', 'Performance tracking', 'Member assignments', 'Schedule management']}
            />
            <FeatureCard 
              icon={<QrCode size={40} />}
              title="QR Registration"
              description="Fast and secure member registration using QR codes. Generate unique codes for each member."
              features={['Unique QR codes', 'Fast check-in', 'Secure access', 'Mobile-friendly']}
            />
            <FeatureCard 
              icon={<TrendingUp size={40} />}
              title="Revenue Dashboard"
              description="Visual analytics for your gym's financial performance. Track revenue, expenses, and growth metrics."
              features={['Visual analytics', 'Revenue tracking', 'Expense management', 'Growth metrics']}
            />
            <FeatureCard 
              icon={<Receipt size={40} />}
              title="GST Billing"
              description="Generate GST-compliant invoices with automatic tax calculations. Professional receipts for your members."
              features={['GST compliance', 'Auto tax calculation', 'Professional receipts', 'Invoice history']}
            />
            <FeatureCard 
              icon={<MessageSquare size={40} />}
              title="WhatsApp Receipts"
              description="Send payment receipts directly to members via WhatsApp. Instant confirmation and better communication."
              features={['WhatsApp integration', 'Instant receipts', 'Payment confirmation', 'Better communication']}
            />
            <FeatureCard 
              icon={<Zap size={40} />}
              title="Custom Plans"
              description="Create flexible membership plans with custom pricing, duration, and features to suit your gym's needs."
              features={['Custom pricing', 'Flexible duration', 'Plan features', 'Discount options']}
            />
            <FeatureCard 
              icon={<BarChart3 size={40} />}
              title="Advanced Reports"
              description="Generate detailed reports on revenue, member retention, and trainer performance."
              features={['Revenue analytics', 'Retention metrics', 'Performance data', 'Financial insights']}
            />
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose GymWeb?</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <BenefitCard icon={<Shield size={32} />} title="Secure & Reliable" description="Bank-level security for your data with regular backups and 99.9% uptime guarantee." />
            <BenefitCard icon={<Clock size={32} />} title="24/7 Support" description="Our dedicated support team is available round the clock to help you succeed." />
            <BenefitCard icon={<Wallet size={32} />} title="Affordable Pricing" description="Competitive pricing with no hidden fees. Start with our free trial today." />
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-primary-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-primary-100 mb-8">Join thousands of gym owners using GymWeb</p>
          <Link to="/signup" className="inline-block bg-white text-primary-600 font-semibold px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors">
            Start Your Free Trial
          </Link>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description, features }) {
  return (
    <div className="card p-8">
      <div className="text-primary-600 mb-4">{icon}</div>
      <h3 className="text-2xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-primary-600 rounded-full"></span>
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}

function BenefitCard({ icon, title, description }) {
  return (
    <div className="text-center">
      <div className="text-primary-600 mb-4 flex justify-center">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
