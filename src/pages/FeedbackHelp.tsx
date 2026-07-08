import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useToast } from '../contexts/ToastContext';
import { api } from '../services/api';
import {
  MessageSquare,
  Phone,
  ArrowLeft,
  Send,
  HelpCircle,
  AlertTriangle,
  Lightbulb,
  MessageCircle,
} from 'lucide-react';

export const FeedbackHelp: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuthStore();
  const { showToast } = useToast();

  const [feedbackType, setFeedbackType] = useState('Suggestion');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Autofilled values
  const name = currentUser?.name || 'Guest User';
  const phone = currentUser?.phone || '';
  const email = currentUser?.email || '';
  const role = currentUser?.role || 'CUSTOMER';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      showToast('Please type a message before submitting', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/feedback', {
        feedbackType,
        message,
      });

      if (res.data.success) {
        showToast(res.data.message || 'Feedback submitted successfully!', 'success');
        setMessage('');
      } else {
        showToast('Failed to submit feedback. Try again.', 'error');
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Error sending feedback. Please check connection.';
      showToast(errMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const roleLower = role.toLowerCase();
    if (roleLower === 'driver' || roleLower === 'delivery partner') {
      navigate('/delivery');
    } else if (roleLower === 'restaurant_owner' || roleLower === 'restaurant owner') {
      navigate('/merchant');
    } else if (roleLower === 'admin') {
      navigate('/admin');
    } else {
      navigate('/home');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12 text-left">
      {/* Top Header */}
      <header className="sticky top-0 bg-white border-b border-gray-100 px-gutter py-4 flex items-center gap-3 z-10">
        <button
          onClick={handleBack}
          className="p-2 hover:bg-gray-100 rounded-full text-secondary hover:text-on-surface transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-headline-lg text-sm font-black text-on-surface">Help &amp; Feedback Center</h1>
          <p className="text-[9px] text-secondary font-bold uppercase tracking-wider">Fretza Assistance &amp; Diagnostics</p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-gutter mt-8 grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left column - Help Options */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white border border-outline-variant/10 rounded-3xl p-6 shadow-xs space-y-4">
            <h2 className="text-xs font-black text-on-surface flex items-center gap-2 border-b border-gray-100 pb-3">
              <Phone className="w-4 h-4 text-primary" />
              Contact Customer Support
            </h2>
            <p className="text-[11px] text-secondary leading-relaxed">
              Facing issues with your active order, payments, or store profile? Get in touch directly with our support desk:
            </p>

            <div className="space-y-3 pt-2">
              {/* Phone call support */}
              <a
                href="tel:7978253881"
                className="flex items-center justify-between p-3.5 bg-gray-50 border border-gray-100 hover:border-primary-container rounded-2xl group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-on-surface">Direct Call Line</p>
                    <p className="text-[10px] text-secondary mt-0.5">7978253881</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-sm text-secondary group-hover:text-primary transition-colors">
                  chevron_right
                </span>
              </a>

              {/* WhatsApp support */}
              <a
                href="https://wa.me/917978253881"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3.5 bg-gray-50 border border-gray-100 hover:border-green-200 rounded-2xl group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-on-surface">WhatsApp Chat Support</p>
                    <p className="text-[10px] text-secondary mt-0.5">Send a message instantly</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-sm text-secondary group-hover:text-green-600 transition-colors">
                  chevron_right
                </span>
              </a>
            </div>
          </div>

          {/* Quick FAQ info panel */}
          <div className="bg-white border border-outline-variant/10 rounded-3xl p-6 shadow-xs space-y-4">
            <h2 className="text-xs font-black text-on-surface flex items-center gap-2 border-b border-gray-100 pb-3">
              <HelpCircle className="w-4 h-4 text-primary" />
              Frequently Asked Questions
            </h2>
            <div className="space-y-4 text-left">
              <div>
                <h4 className="text-xs font-bold text-on-surface">How long does Merchant verification take?</h4>
                <p className="text-[10px] text-secondary mt-1">
                  Administrators review and verify restaurant owner profiles within 24 hours of registration. You'll see your status toggle to "Approved" on your dashboard.
                </p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-on-surface">As a Driver, how do I get assigned orders?</h4>
                <p className="text-[10px] text-secondary mt-1">
                  Make sure you toggle your status to "Online" from your Rider Profile settings. Once online, active orders in your vicinity will instantly appear on your dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right column - Feedback Form */}
        <div className="md:col-span-7">
          <form onSubmit={handleSubmit} className="bg-white border border-outline-variant/10 rounded-3xl p-6 shadow-xs space-y-6">
            <div className="border-b border-gray-100 pb-3">
              <h2 className="text-xs font-black text-on-surface flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                Submit Platform Feedback
              </h2>
              <p className="text-[10px] text-secondary mt-1">
                Help us improve Fretza! Send us bugs, suggestions, complaints or feature requests.
              </p>
            </div>

            {/* Read-only User metadata (Audited Autofill) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 text-xs">
              <div className="space-y-1">
                <span className="block text-[9px] font-bold text-secondary uppercase">Your Name</span>
                <span className="font-bold text-on-surface-variant">{name}</span>
              </div>
              <div className="space-y-1">
                <span className="block text-[9px] font-bold text-secondary uppercase">Phone Number</span>
                <span className="font-bold text-on-surface-variant">{phone || 'Not Configured'}</span>
              </div>
              <div className="space-y-1">
                <span className="block text-[9px] font-bold text-secondary uppercase">Email Address</span>
                <span className="font-bold text-on-surface-variant">{email || 'Not Provided'}</span>
              </div>
              <div className="space-y-1">
                <span className="block text-[9px] font-bold text-secondary uppercase">User Role</span>
                <span className="font-bold text-primary uppercase">{role.replace('_', ' ')}</span>
              </div>
            </div>

            {/* Feedback Type */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-secondary uppercase">Feedback Type</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { value: 'Bug', icon: AlertTriangle, label: 'Bug' },
                  { value: 'Suggestion', icon: Lightbulb, label: 'Suggestion' },
                  { value: 'Complaint', icon: AlertTriangle, label: 'Complaint' },
                  { value: 'Feature Request', icon: MessageSquare, label: 'Request' },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = feedbackType === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setFeedbackType(item.value)}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                        isSelected
                          ? 'bg-orange-50 border-primary text-primary font-bold shadow-xs'
                          : 'bg-white border-outline-variant/30 text-secondary hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4 mb-1" />
                      <span className="text-[10px]">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Message Area */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-secondary uppercase">Message Details</label>
              <textarea
                rows={5}
                required
                placeholder="Please describe your issue, suggest changes, or file your complaint..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/30 focus:border-primary focus:bg-white rounded-2xl px-4 py-3 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-primary hover:bg-orange-600 text-white font-bold text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              {submitting ? 'Submitting Feedback...' : 'Send Feedback Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
