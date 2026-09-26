import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, Loader2, AlertCircle, MessageSquare, ExternalLink } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { SHOP_CONFIG, generateWhatsAppContactUrl } from '../config/shopConfig';
import { api } from '../services/api';

interface LayoutContextType {
  onOpenAppointment: () => void;
}

interface ValidationErrors {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
}

export const Contact: React.FC = () => {
  const { onOpenAppointment } = useOutletContext<LayoutContextType>();
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [waUrl, setWaUrl] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'Please enter your full name (minimum 2 characters).';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    const cleanDigits = formData.phone.replace(/[^0-9]/g, '');
    if (!formData.phone.trim() || cleanDigits.length < 10) {
      newErrors.phone = 'Please enter a valid 10-digit mobile number.';
    }

    if (!formData.message.trim() || formData.message.trim().length < 5) {
      newErrors.message = 'Please provide a message or outfit requirement (minimum 5 characters).';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Send enquiry to Express backend (validates, logs enquiry, checks email config)
      const backendResult = await api.sendContactForm({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
      });

      if (backendResult && backendResult.success === false) {
        setFormError(backendResult.error || 'Failed to submit enquiry. Please check your details.');
        setIsSubmitting(false);
        return;
      }

      // Generate WhatsApp enquiry link
      const waLink = generateWhatsAppContactUrl({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
      });

      setWaUrl(waLink);

      // Attempt to open WhatsApp chat in a new tab
      window.open(waLink, '_blank', 'noopener,noreferrer');

      setSubmitted(true);
    } catch (err: any) {
      setFormError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setSubmitted(false);
    setFormData({ name: '', email: '', phone: '', message: '' });
    setErrors({});
    setFormError(null);
    setWaUrl('');
  };

  return (
    <div className="bg-[#fffcf8] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-pink-700 bg-pink-100/80 px-3 py-1 rounded-full border border-pink-200">
            Get In Touch
          </span>
          <h1 className="text-4xl font-extrabold font-serif text-gray-900 tracking-tight">
            Contact & Boutique Location
          </h1>
          <p className="text-sm text-gray-600">
            Have questions about rentals, custom fittings, or event dates? Visit our boutique or drop us a direct message.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10">

          {/* Contact Details & Store Info */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-pink-100 shadow-sm space-y-6">
              <h3 className="text-2xl font-bold font-serif text-gray-900">{SHOP_CONFIG.SHOP_NAME}</h3>

              <div className="space-y-4 text-sm text-gray-600">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-700 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Boutique Address</h4>
                    <p>{SHOP_CONFIG.SHOP_ADDRESS}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Call & WhatsApp Enquiry</h4>
                    <p>{SHOP_CONFIG.SHOP_PHONE_DISPLAY}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Email Enquiry</h4>
                    <p>{SHOP_CONFIG.SHOP_EMAIL}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Operating Hours</h4>
                    <p>Monday - Saturday: 10:00 AM - 8:30 PM (All Days Open)</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <button
                  onClick={onOpenAppointment}
                  className="w-full py-3.5 rounded-xl gradient-btn text-white font-bold text-sm shadow-md hover:shadow-lg transition text-center"
                >
                  Schedule Trial Fitting Appointment
                </button>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-8 rounded-3xl border border-pink-100 shadow-sm">
            {submitted ? (
              <div className="text-center py-10 space-y-6">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-gray-900">Enquiry Processed & WhatsApp Opened</h3>
                  <p className="text-xs text-gray-600 max-w-sm mx-auto leading-relaxed">
                    Thank you for contacting <strong>{SHOP_CONFIG.SHOP_NAME}</strong>! Your enquiry has been prepared and WhatsApp has been launched with your details pre-filled.
                  </p>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left max-w-md mx-auto space-y-2 text-xs text-amber-900">
                  <div className="flex items-center gap-2 font-bold text-amber-800">
                    <MessageSquare className="w-4 h-4 text-amber-700" />
                    <span>Important: Press 'Send' in WhatsApp</span>
                  </div>
                  <p className="leading-relaxed">
                    Please press the <strong>Send</strong> button inside WhatsApp to deliver your enquiry directly to our boutique manager (<strong>{SHOP_CONFIG.SHOP_PHONE_DISPLAY}</strong>).
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  {waUrl && (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Re-open WhatsApp Chat</span>
                    </a>
                  )}
                  <button
                    onClick={handleResetForm}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs transition"
                  >
                    Send Another Message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <h3 className="text-xl font-bold font-serif text-gray-900 mb-2">Send Us a Direct Message</h3>

                {formError && (
                  <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                    <span>{formError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Your Name <span className="text-pink-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g. Meera Krishnan"
                    className={`w-full p-3 rounded-xl border text-xs outline-none transition ${
                      errors.name ? 'border-red-400 focus:ring-2 focus:ring-red-400 bg-red-50/20' : 'border-gray-200 focus:ring-2 focus:ring-pink-500'
                    }`}
                  />
                  {errors.name && <p className="mt-1 text-[11px] text-red-600 font-medium">{errors.name}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Email <span className="text-pink-600">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="you@domain.com"
                      className={`w-full p-3 rounded-xl border text-xs outline-none transition ${
                        errors.email ? 'border-red-400 focus:ring-2 focus:ring-red-400 bg-red-50/20' : 'border-gray-200 focus:ring-2 focus:ring-pink-500'
                      }`}
                    />
                    {errors.email && <p className="mt-1 text-[11px] text-red-600 font-medium">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Phone Number <span className="text-pink-600">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="84891 66899"
                      className={`w-full p-3 rounded-xl border text-xs outline-none transition ${
                        errors.phone ? 'border-red-400 focus:ring-2 focus:ring-red-400 bg-red-50/20' : 'border-gray-200 focus:ring-2 focus:ring-pink-500'
                      }`}
                    />
                    {errors.phone && <p className="mt-1 text-[11px] text-red-600 font-medium">{errors.phone}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Message / Outfit Requirement <span className="text-pink-600">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder="Tell us about your event date, preferred style or sizing questions..."
                    className={`w-full p-3 rounded-xl border text-xs outline-none transition ${
                      errors.message ? 'border-red-400 focus:ring-2 focus:ring-red-400 bg-red-50/20' : 'border-gray-200 focus:ring-2 focus:ring-pink-500'
                    }`}
                  />
                  {errors.message && <p className="mt-1 text-[11px] text-red-600 font-medium">{errors.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full gradient-btn text-white py-3.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing Message...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Message via WhatsApp</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default Contact;
