import { Link } from 'react-router-dom';
import { Dumbbell, Users, QrCode, TrendingUp, Receipt, MessageSquare, CheckCircle, ArrowRight, Star, Shield, Clock, Zap } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 sticky top-0 bg-white z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Dumbbell className="text-primary-600" size={32} />
              <span className="text-2xl font-bold text-gray-900">GymWeb</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link to="/features" className="text-gray-600 hover:text-primary-600">Features</Link>
              <Link to="/pricing" className="text-gray-600 hover:text-primary-600">Pricing</Link>
              <Link to="/about" className="text-gray-600 hover:text-primary-600">About</Link>
              <Link to="/contact" className="text-gray-600 hover:text-primary-600">Contact</Link>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-gray-600 hover:text-primary-600 font-medium">Login</Link>
              <Link to="/signup" className="btn-primary">Start Free Trial</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Complete Gym Management
              <span className="text-primary-600"> SaaS Platform</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Manage members, trainers, fees & attendance with ease. 
              Start your 14-day free trial today and transform your gym operations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup" className="btn-primary text-lg px-8 py-4">
                Start Free Trial <ArrowRight className="ml-2" size={20} />
              </Link>
              <button className="btn-secondary text-lg px-8 py-4">
                Book Demo
              </button>
            </div>
            <p className="mt-6 text-sm text-gray-500">No credit card required • 14-day free trial</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-600">Everything you need to run your gym efficiently</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard icon={<Users size={32} />} title="Member Management" description="Track member details, memberships, and renewal dates in one place" />
            <FeatureCard icon={<Users size={32} />} title="Trainer Management" description="Manage trainer profiles, assignments, and performance tracking" />
            <FeatureCard icon={<QrCode size={32} />} title="QR Registration" description="Quick member registration using QR codes for seamless onboarding" />
            <FeatureCard icon={<CheckCircle size={32} />} title="Attendance Tracking" description="Easy check-in/check-out system with detailed attendance reports" />
            <FeatureCard icon={<TrendingUp size={32} />} title="Revenue Dashboard" description="Real-time insights into your gym's financial performance" />
            <FeatureCard icon={<Receipt size={32} />} title="GST Billing" description="Generate GST-compliant invoices with automatic tax calculations" />
            <FeatureCard icon={<MessageSquare size={32} />} title="WhatsApp Receipts" description="Send payment receipts directly to members via WhatsApp" />
            <FeatureCard icon={<Zap size={32} />} title="Custom Plans" description="Create flexible membership plans to suit your gym's needs" />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Get started in 5 simple steps</p>
          </div>
          <div className="grid md:grid-cols-5 gap-6">
            <StepCard step="1" title="Create Account" description="Sign up for your free trial in minutes" />
            <StepCard step="2" title="Setup Gym" description="Add your gym details and branding" />
            <StepCard step="3" title="Add Trainers" description="Invite your trainers to the platform" />
            <StepCard step="4" title="Add Members" description="Register members and assign plans" />
            <StepCard step="5" title="Manage" description="Track attendance, fees, and growth" />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600">Choose the plan that fits your gym</p>
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
              ]}
              highlight={false}
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
              ]}
              highlight={true}
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
              ]}
              highlight={false}
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Trusted by Gym Owners</h2>
            <p className="text-xl text-gray-600">See what our customers say</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard 
              name="Rajesh Kumar"
              gym="Fitness First Gym"
              text="GymWeb transformed how we manage our gym. The attendance tracking and billing features saved us hours every week."
              rating={5}
            />
            <TestimonialCard 
              name="Priya Sharma"
              gym="Power House Fitness"
              text="The WhatsApp receipt feature is amazing! Our members love getting instant payment confirmations."
              rating={5}
            />
            <TestimonialCard 
              name="Amit Patel"
              gym="Iron Gym"
              text="Simple to use, powerful features. The free trial helped us understand the value before committing."
              rating={5}
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-6">
            <FAQItem 
              question="Is there a free trial?"
              answer="Yes! We offer a 14-day free trial with full access to all features. No credit card required."
            />
            <FAQItem 
              question="Can I change my plan later?"
              answer="Absolutely! You can upgrade or downgrade your plan at any time from your dashboard."
            />
            <FAQItem 
              question="What payment methods do you accept?"
              answer="We accept all major credit cards, debit cards, UPI, and bank transfers."
            />
            <FAQItem 
              question="Is my data secure?"
              answer="Yes, we use industry-standard encryption and security measures to protect your data."
            />
            <FAQItem 
              question="Do I need to install any software?"
              answer="No! GymWeb is a cloud-based platform. Access it from any device with a web browser."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Gym?</h2>
          <p className="text-xl text-primary-100 mb-8">Join thousands of gym owners who trust GymWeb</p>
          <Link to="/signup" className="inline-block bg-white text-primary-600 font-semibold px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors">
            Start Your Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Dumbbell className="text-primary-500" size={24} />
              <span className="text-xl font-bold text-white">GymWeb</span>
            </div>
            <p className="text-sm">Complete gym management solution for modern fitness businesses.</p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/features" className="hover:text-white">Features</Link></li>
              <li><Link to="/pricing" className="hover:text-white">Pricing</Link></li>
              <li><Link to="/about" className="hover:text-white">About</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
              <li><Link to="/about" className="hover:text-white">About Us</Link></li>
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white">Terms of Service</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li>support@gymweb.com</li>
              <li>+91 98765 43210</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-gray-800 text-center text-sm">
          <p>&copy; 2024 GymWeb. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="card p-6 hover:shadow-lg transition-shadow">
      <div className="text-primary-600 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function StepCard({ step, title, description }) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
        {step}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}

function PricingCard({ name, price, duration, features, highlight }) {
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
        Get Started
      </Link>
    </div>
  );
}

function TestimonialCard({ name, gym, text, rating }) {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-1 mb-4">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="text-yellow-400 fill-yellow-400" size={20} />
        ))}
      </div>
      <p className="text-gray-600 mb-4">"{text}"</p>
      <div>
        <p className="font-semibold text-gray-900">{name}</p>
        <p className="text-sm text-gray-500">{gym}</p>
      </div>
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
