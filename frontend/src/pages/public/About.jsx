import { Link } from 'react-router-dom';
import { Dumbbell, Target, Users, Award } from 'lucide-react';

export default function About() {
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

      <section className="py-20 px-4 bg-gradient-to-br from-primary-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">About GymWeb</h1>
          <p className="text-xl text-gray-600">
            Empowering gym owners with modern technology to manage their business efficiently
          </p>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-gray-600 mb-4">
                GymWeb was founded with a simple mission: to make gym management easy and accessible for everyone. 
                We believe that gym owners should focus on their members, not on paperwork and administrative tasks.
              </p>
              <p className="text-gray-600 mb-4">
                Our platform combines powerful features with intuitive design, helping gyms of all sizes streamline 
                their operations and grow their business.
              </p>
              <p className="text-gray-600">
                From small neighborhood gyms to large fitness chains, GymWeb scales to meet your needs.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <StatCard icon={<Users size={32} />} title="Gyms Served" value="500+" />
              <StatCard icon={<Users size={32} />} title="Active Members" value="50,000+" />
              <StatCard icon={<Target size={32} />} title="States Covered" value="20+" />
              <StatCard icon={<Award size={32} />} title="Satisfaction Rate" value="98%" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <ValueCard 
              title="Simplicity"
              description="We believe in making complex tasks simple. Our platform is designed to be intuitive and easy to use."
            />
            <ValueCard 
              title="Reliability"
              description="You can count on GymWeb 24/7. Our platform is built with reliability and uptime as top priorities."
            />
            <ValueCard 
              title="Innovation"
              description="We continuously improve our platform with new features and technologies to stay ahead of the curve."
            />
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Us?</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <FeatureItem 
              title="Built for Gyms"
              description="Our platform is specifically designed for gym management, not a generic solution adapted for gyms."
            />
            <FeatureItem 
              title="Affordable Pricing"
              description="Competitive pricing with no hidden fees. Start with our free trial and see the value for yourself."
            />
            <FeatureItem 
              title="Excellent Support"
              description="Our dedicated support team is available to help you succeed with GymWeb."
            />
            <FeatureItem 
              title="Continuous Updates"
              description="We regularly add new features and improvements based on customer feedback."
            />
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-primary-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Join the GymWeb Family</h2>
          <p className="text-xl text-primary-100 mb-8">Start your free trial today and see the difference</p>
          <Link to="/signup" className="inline-block bg-white text-primary-600 font-semibold px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors">
            Get Started Now
          </Link>
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon, title, value }) {
  return (
    <div className="card p-6 text-center">
      <div className="text-primary-600 mb-3 flex justify-center">{icon}</div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-gray-600">{title}</div>
    </div>
  );
}

function ValueCard({ title, description }) {
  return (
    <div className="card p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function FeatureItem({ title, description }) {
  return (
    <div className="flex gap-4">
      <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
}
