import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';

export default function Privacy() {
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
              <Lock className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold">Privacy Policy</h1>
          </div>

          <div className="prose max-w-none">
            <p className="text-lg">We take your privacy seriously. Here's how we protect your data:</p>

            <h2 className="text-xl font-semibold mt-6">Data Collection</h2>
            <p>We collect only necessary data to operate the platform (name, email, location, listing data).</p>

            <h2 className="text-xl font-semibold mt-6">Data Usage</h2>
            <p>We use your data to offer personalized recommendations and AI enhancements.</p>

            <h2 className="text-xl font-semibold mt-6">Data Sharing</h2>
            <p>We never sell your data to third parties.</p>

            <h2 className="text-xl font-semibold mt-6">Data Control</h2>
            <p>You can delete your account and request data removal anytime.</p>

            <h2 className="text-xl font-semibold mt-6">AI & Data Processing</h2>
            <p>Our AI systems process your data to provide personalized experiences, improve listings, and ensure platform safety. This processing includes:</p>
            <ul>
              <li>Analyzing listing content to suggest improvements</li>
              <li>Processing images for better categorization</li>
              <li>Monitoring for policy violations</li>
              <li>Generating personalized recommendations</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6">Data Security</h2>
            <p>We implement industry-standard security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction.</p>

            <div className="mt-8 pt-6 border-t">
              <p className="text-sm text-gray-600">Last updated: March 31, 2025</p>
              <p className="text-sm text-gray-600">© 2025 ListHouze by Ajuba Limited</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-4 justify-center">
          <Link to="/legal/terms" className="text-blue-600 hover:text-blue-700">Terms & Conditions</Link>
          <Link to="/legal/cookies" className="text-blue-600 hover:text-blue-700">Cookie Policy</Link>
          <Link to="/legal/acceptable-use" className="text-blue-600 hover:text-blue-700">Acceptable Use</Link>
          <Link to="/legal/business-policy" className="text-blue-600 hover:text-blue-700">Business Policy</Link>
        </div>
      </div>
    </div>
  );
}