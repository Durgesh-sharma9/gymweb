import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Upload, MapPin, CreditCard, UserPlus, Users, ArrowRight, ArrowLeft, X } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    logo: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    plans: [],
    trainer: {
      name: '',
      email: '',
      mobile: '',
      password: '',
    },
    member: {
      name: '',
      mobile: '',
      email: '',
    },
  });

  useEffect(() => {
    fetchOnboardingStatus();
  }, []);

  const fetchOnboardingStatus = async () => {
    try {
      const response = await axios.get('/api/v1/onboarding/status');
      setStatus(response.data.data);
      if (response.data.data.isComplete) {
        navigate('/gym/dashboard');
      }
    } catch (error) {
      console.error('Failed to fetch onboarding status');
    }
  };

  const handleNext = async () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = async () => {
    try {
      await axios.post('/api/v1/onboarding/skip');
      navigate('/gym/dashboard');
    } catch (error) {
      toast.error('Failed to skip onboarding');
    }
  };

  const handleStepSubmit = async () => {
    setLoading(true);
    try {
      await axios.post(`/api/v1/onboarding/step/${currentStep}`, formData);
      toast.success(`Step ${currentStep} completed`);
      if (currentStep < 5) {
        setCurrentStep(currentStep + 1);
      } else {
        navigate('/gym/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to complete step');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Upload Logo', icon: <Upload size={24} /> },
    { number: 2, title: 'Gym Details', icon: <MapPin size={24} /> },
    { number: 3, title: 'Membership Plans', icon: <CreditCard size={24} /> },
    { number: 4, title: 'Add Trainer', icon: <UserPlus size={24} /> },
    { number: 5, title: 'Add Member', icon: <Users size={24} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Setup Your Gym</h1>
          <button onClick={handleSkip} className="text-gray-500 hover:text-gray-700 flex items-center gap-2">
            <X size={20} />
            Skip for now
          </button>
        </div>

        <div className="flex justify-between mb-8">
          {steps.map((step) => (
            <div
              key={step.number}
              className={`flex flex-col items-center ${
                step.number <= currentStep ? 'text-primary-600' : 'text-gray-400'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  step.number <= currentStep
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-300'
                }`}
              >
                {step.number < currentStep ? (
                  <CheckCircle size={20} />
                ) : (
                  step.icon
                )}
              </div>
              <span className="text-xs mt-2 font-medium">{step.title}</span>
            </div>
          ))}
        </div>

        <div className="card p-8">
          {currentStep === 1 && <Step1 formData={formData} setFormData={setFormData} />}
          {currentStep === 2 && <Step2 formData={formData} setFormData={setFormData} />}
          {currentStep === 3 && <Step3 formData={formData} setFormData={setFormData} />}
          {currentStep === 4 && <Step4 formData={formData} setFormData={setFormData} />}
          {currentStep === 5 && <Step5 formData={formData} setFormData={setFormData} />}

          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="btn-secondary flex items-center gap-2"
            >
              <ArrowLeft size={20} />
              Back
            </button>
            <button
              onClick={handleStepSubmit}
              disabled={loading}
              className="btn-primary flex items-center gap-2"
            >
              {loading ? 'Saving...' : currentStep === 5 ? 'Complete Setup' : 'Next'}
              {currentStep < 5 && <ArrowRight size={20} />}
            </button>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            Step {currentStep} of 5 • You can come back anytime to complete this
          </p>
        </div>
      </div>
    </div>
  );
}

function Step1({ formData, setFormData }) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Upload Your Gym Logo</h2>
      <p className="text-gray-600 mb-6">Add your gym's logo to personalize your account</p>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <Upload className="mx-auto text-gray-400 mb-4" size={48} />
        <p className="text-gray-600 mb-2">Drag and drop your logo here</p>
        <p className="text-sm text-gray-500 mb-4">or click to browse</p>
        <input
          type="text"
          className="input"
          placeholder="Logo URL"
          value={formData.logo}
          onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
        />
      </div>
    </div>
  );
}

function Step2({ formData, setFormData }) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Add Gym Details</h2>
      <p className="text-gray-600 mb-6">Provide your gym's location information</p>
      
      <div className="space-y-4">
        <div>
          <label className="label">Address</label>
          <input
            type="text"
            className="input"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Street address"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">City</label>
            <input
              type="text"
              className="input"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="City"
            />
          </div>
          <div>
            <label className="label">State</label>
            <input
              type="text"
              className="input"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              placeholder="State"
            />
          </div>
        </div>
        <div>
          <label className="label">Pincode</label>
          <input
            type="text"
            className="input"
            value={formData.pincode}
            onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
            placeholder="Pincode"
          />
        </div>
      </div>
    </div>
  );
}

function Step3({ formData, setFormData }) {
  const [newPlan, setNewPlan] = useState({ name: '', duration: 30, price: 1000 });

  const addPlan = () => {
    if (newPlan.name && newPlan.duration && newPlan.price) {
      setFormData({
        ...formData,
        plans: [...formData.plans, { ...newPlan }],
      });
      setNewPlan({ name: '', duration: 30, price: 1000 });
    }
  };

  const removePlan = (index) => {
    setFormData({
      ...formData,
      plans: formData.plans.filter((_, i) => i !== index),
    });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Create Membership Plans</h2>
      <p className="text-gray-600 mb-6">Define membership plans for your gym</p>
      
      <div className="space-y-4 mb-6">
        {formData.plans.map((plan, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">{plan.name}</p>
              <p className="text-sm text-gray-600">{plan.duration} days • ₹{plan.price}</p>
            </div>
            <button onClick={() => removePlan(index)} className="text-red-600 hover:text-red-700">
              <X size={20} />
            </button>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 pt-6">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="label">Plan Name</label>
            <input
              type="text"
              className="input"
              value={newPlan.name}
              onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
              placeholder="Monthly"
            />
          </div>
          <div>
            <label className="label">Duration (days)</label>
            <input
              type="number"
              className="input"
              value={newPlan.duration}
              onChange={(e) => setNewPlan({ ...newPlan, duration: parseInt(e.target.value) })}
              placeholder="30"
            />
          </div>
          <div>
            <label className="label">Price (₹)</label>
            <input
              type="number"
              className="input"
              value={newPlan.price}
              onChange={(e) => setNewPlan({ ...newPlan, price: parseInt(e.target.value) })}
              placeholder="1000"
            />
          </div>
        </div>
        <button onClick={addPlan} className="btn-secondary w-full mt-4">
          Add Plan
        </button>
      </div>
    </div>
  );
}

function Step4({ formData, setFormData }) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Add Your First Trainer</h2>
      <p className="text-gray-600 mb-6">Add a trainer to help manage your gym</p>
      
      <div className="space-y-4">
        <div>
          <label className="label">Trainer Name</label>
          <input
            type="text"
            className="input"
            value={formData.trainer.name}
            onChange={(e) => setFormData({ ...formData, trainer: { ...formData.trainer, name: e.target.value } })}
            placeholder="Trainer name"
          />
        </div>
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            className="input"
            value={formData.trainer.email}
            onChange={(e) => setFormData({ ...formData, trainer: { ...formData.trainer, email: e.target.value } })}
            placeholder="trainer@gym.com"
          />
        </div>
        <div>
          <label className="label">Mobile</label>
          <input
            type="tel"
            className="input"
            value={formData.trainer.mobile}
            onChange={(e) => setFormData({ ...formData, trainer: { ...formData.trainer, mobile: e.target.value } })}
            placeholder="+91 98765 43210"
          />
        </div>
        <div>
          <label className="label">Password (optional)</label>
          <input
            type="password"
            className="input"
            value={formData.trainer.password}
            onChange={(e) => setFormData({ ...formData, trainer: { ...formData.trainer, password: e.target.value } })}
            placeholder="Leave blank for default"
          />
        </div>
      </div>
    </div>
  );
}

function Step5({ formData, setFormData }) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Add Your First Member</h2>
      <p className="text-gray-600 mb-6">Register your first gym member</p>
      
      <div className="space-y-4">
        <div>
          <label className="label">Member Name</label>
          <input
            type="text"
            className="input"
            value={formData.member.name}
            onChange={(e) => setFormData({ ...formData, member: { ...formData.member, name: e.target.value } })}
            placeholder="Member name"
          />
        </div>
        <div>
          <label className="label">Mobile</label>
          <input
            type="tel"
            className="input"
            value={formData.member.mobile}
            onChange={(e) => setFormData({ ...formData, member: { ...formData.member, mobile: e.target.value } })}
            placeholder="+91 98765 43210"
          />
        </div>
        <div>
          <label className="label">Email (optional)</label>
          <input
            type="email"
            className="input"
            value={formData.member.email}
            onChange={(e) => setFormData({ ...formData, member: { ...formData.member, email: e.target.value } })}
            placeholder="member@email.com"
          />
        </div>
      </div>
    </div>
  );
}
