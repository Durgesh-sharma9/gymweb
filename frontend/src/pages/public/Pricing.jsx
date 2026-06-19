import { Link } from 'react-router-dom';
import { Dumbbell, CheckCircle } from 'lucide-react';

export default function Pricing() {
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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h1>
            <p className="text-xl text-gray-600">Choose the plan that fits your gym's needs</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PricingCard 
              name="Free Trial"
              price="0"
              duration="14 days"
              features={[
                'Up to 50 members',
                'Basic attendance tracking',
                'Email support',
                '1 trainer account',
                'Standard reports',
                'Mobile access',
              ]}
              highlight={false}
              cta="Start Free Trial"
            />
            <PricingCard 
              name="Starter"
              price="999"
              duration="/month"
              features={[
                'Up to 200 members',
                'Full attendance tracking',
                'GST billing',
                'WhatsApp receipts',
                '5 trainer accounts',
                'Priority support',
                'Advanced reports',
                'Custom branding',
              ]}
              highlight={true}
              cta="Get Started"
            />
            <PricingCard 
              name="Professional"
              price="2499"
              duration="/month"
              features={[
                'Unlimited members',
                'Advanced analytics',
                'Custom branding',
                'API access',
                'Unlimited trainers',
                'Dedicated support',
                'White-label option',
                'Custom integrations',
                'Priority feature requests',
              ]}
              highlight={false}
              cta="Contact Sales"
            />
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <FAQItem 
              question="What happens after my free trial ends?"
              answer="You can choose to upgrade to a paid plan or your account will be paused. Your data will be safely stored for 30 days."
            />
            <FAQItem 
              question="Can I change my plan later?"
              answer="Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle."
            />
            <FAQItem 
              question="Is there a setup fee?"
              answer="No, there are no setup fees. You only pay for your chosen plan."
            />
            <FAQItem 
              question="What payment methods do you accept?"
              answer="We accept credit cards, debit cards, UPI, and bank transfers."
            />
            <FAQItem 
              question="Is my data secure?"
              answer="Absolutely. We use industry-standard encryption and security measures to protect your data."
            />
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-primary-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Start Your Free Trial Today</h2>
          <p className="text-xl text-primary-100 mb-8">No credit card required • 14-day free trial</p>
          <Link to="/signup" className="inline-block bg-white text-primary-600 font-semibold px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors">
            Get Started Now
          </Link>
        </div>
      </section>
    </div>
  );
}

function PricingCard({ name, price, duration, features, highlight, cta }) {
  return (
    <div className={`card p-8 ${highlight ? 'border-2 border-primary-600 relative' : ''}`}>
      {highlight && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-medium">
          Most Popular
        </div>
      )}
      <h3 className="text-2xl font-bold text-gray-900 mb-2">{name}</h3>
      <div className="mb-6">
        <span className="text-4xl font-bold text-gray-900">₹{price}</span>
        <span className="text-gray-600">{duration}</span>
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-2 text-gray-600">
            <CheckCircle className="text-primary-600" size={20} />
            {feature}
          </li>
        ))}
      </ul>
      <Link to="/signup" className={`btn w-full ${highlight ? 'btn-primary' : 'btn-secondary'}`}>
        {cta}
      </Link>
    </div>
  );
}

function FAQItem({ question, answer }) {
  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{question}</h3>
      <p className="text-gray-600">{answer}</p>
    </div>
  );
}
