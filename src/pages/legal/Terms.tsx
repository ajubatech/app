import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link to="/" className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold">Terms & Conditions</h1>
          </div>

          <div className="prose max-w-none">
            <p className="text-lg">By using ListHouze ("the Platform"), you agree to abide by the following terms:</p>

            <h2 className="text-xl font-semibold mt-6">Eligibility</h2>
            <p>You must be 18 years or older to create an account or list properties/products/services.</p>

            <h2 className="text-xl font-semibold mt-6">Accuracy</h2>
            <p>All listings must be truthful and accurately represent the item or service offered.</p>

            <h2 className="text-xl font-semibold mt-6">AI Usage</h2>
            <p>You agree that our AI tools are assistive and not a substitute for professional advice.</p>

            <h2 className="text-xl font-semibold mt-6">Content Ownership</h2>
            <p>You retain rights to your uploaded content but grant ListHouze the right to display and promote it.</p>

            <h2 className="text-xl font-semibold mt-6">Prohibited Use</h2>
            <p>You must not upload inappropriate, misleading, or unlawful content. Violations will lead to removal and possible account suspension.</p>

            <h2 className="text-xl font-semibold mt-6">Moderation</h2>
            <p>AI and human moderators may review content to maintain platform integrity.</p>

            <h2 className="text-xl font-semibold mt-6">Service Interruptions</h2>
            <p>We do our best to ensure uptime but cannot guarantee uninterrupted service.</p>

            <h2 className="text-xl font-semibold mt-6">Termination</h2>
            <p>ListHouze reserves the right to suspend or terminate accounts that violate these terms.</p>

            <div className="mt-8 pt-6 border-t">
              <p className="text-sm text-gray-600">Last updated: March 31, 2025</p>
              <p className="text-sm text-gray-600">© 2025 ListHouze by Ajuba Limited</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-4 justify-center">
          <Link to="/legal/privacy" className="text-blue-600 hover:text-blue-700">Privacy Policy</Link>
          <Link to="/legal/cookies" className="text-blue-600 hover:text-blue-700">Cookie Policy</Link>
          <Link to="/legal/acceptable-use" className="text-blue-600 hover:text-blue-700">Acceptable Use</Link>
          <Link to="/legal/business-policy" className="text-blue-600 hover:text-blue-700">Business Policy</Link>
        </div>
      </div>
    </div>
  );
}