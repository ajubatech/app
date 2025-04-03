import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldAlert } from 'lucide-react';

export default function AcceptableUse() {
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
              <ShieldAlert className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold">Acceptable Use Policy</h1>
          </div>

          <div className="prose max-w-none">
            <p className="text-lg">To keep ListHouze safe and productive, users must:</p>

            <h2 className="text-xl font-semibold mt-6">Community Standards</h2>
            <ul>
              <li>Treat other users with respect</li>
              <li>Avoid hate speech, scams, and abuse</li>
              <li>Use listings solely for their intended category</li>
              <li>Avoid creating fake or misleading accounts</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6">Security</h2>
            <p>Users must not bypass security features (e.g., AI moderation, reCAPTCHA).</p>

            <h2 className="text-xl font-semibold mt-6">Content Guidelines</h2>
            <p>Users must not misuse the reel feature for spamming or inappropriate content.</p>

            <h2 className="text-xl font-semibold mt-6">Listing Integrity</h2>
            <p>All listings must:</p>
            <ul>
              <li>Accurately represent the item or service</li>
              <li>Include honest descriptions and images</li>
              <li>Be placed in the correct category</li>
              <li>Comply with local laws and regulations</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6">Enforcement</h2>
            <p>Violations may result in:</p>
            <ul>
              <li>Listing removal</li>
              <li>Temporary account suspension</li>
              <li>Permanent ban from the platform</li>
            </ul>

            <div className="mt-8 pt-6 border-t">
              <p className="text-sm text-gray-600">Last updated: March 31, 2025</p>
              <p className="text-sm text-gray-600">© 2025 ListHouze by Ajuba Limited</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-4 justify-center">
          <Link to="/legal/terms" className="text-blue-600 hover:text-blue-700">Terms & Conditions</Link>
          <Link to="/legal/privacy" className="text-blue-600 hover:text-blue-700">Privacy Policy</Link>
          <Link to="/legal/cookies" className="text-blue-600 hover:text-blue-700">Cookie Policy</Link>
          <Link to="/legal/business-policy" className="text-blue-600 hover:text-blue-700">Business Policy</Link>
        </div>
      </div>
    </div>
  );
}