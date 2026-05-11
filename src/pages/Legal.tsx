import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans overflow-x-hidden">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-yellow-400 mb-12 hover:gap-3 transition-all font-bold">
          <ChevronLeft className="w-5 h-5" />
          Back to Home
        </Link>
        <h1 className="text-4xl font-black mb-8 tracking-tighter">Privacy Policy</h1>
        <div className="space-y-6 text-white/60 leading-relaxed">
          <p>Effective Date: April 30, 2026</p>
          <section>
            <h2 className="text-xl font-bold text-white mb-2">1. Information We Collect</h2>
            <p>We collect information you provide directly to us when you create a digital business card, including your name, email address, phone number, social media profiles, and any other information you choose to display.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-white mb-2">2. How We Use Your Information</h2>
            <p>We use the information we collect to provide, maintain, and improve our services, and to facilitate professional networking by sharing your digital card data with those who scan your NFC tag or visit your unique URL.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-white mb-2">3. Information Sharing</h2>
            <p>Your digital business card is designed to be shared. Any information you include on your card will be visible to anyone with access to your card's link or NFC tag. We do not sell your personal data to third parties.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-white mb-2">4. Data Security</h2>
            <p>We implement reasonable security measures to protect your information, but no method of transmission over the internet is 100% secure.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans overflow-x-hidden">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-yellow-400 mb-12 hover:gap-3 transition-all font-bold">
          <ChevronLeft className="w-5 h-5" />
          Back to Home
        </Link>
        <h1 className="text-4xl font-black mb-8 tracking-tighter">Terms of Service</h1>
        <div className="space-y-6 text-white/60 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-2">1. Acceptance of Terms</h2>
            <p>By using TapNix, you agree to these Terms of Service. If you do not agree, please do not use our services.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-white mb-2">2. User Responsibility</h2>
            <p>You are responsible for the content you upload to your digital business card. You agree not to upload any content that is illegal, offensive, or violates the rights of others.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-white mb-2">3. Service Availability</h2>
            <p>We strive to keep TapNix available at all times but do not guarantee uninterrupted service. We reserve the right to modify or discontinue the service at any time.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-white mb-2 shadow-sm uppercase tracking-tighter italic">4. Limitation of Liability</h2>
            <p>TapNix is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the service.</p>
          </section>
        </div>
      </div>
    </div>
  );
};
