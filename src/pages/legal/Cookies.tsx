import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Cookie } from 'lucide-react';

export default function Cookies() {
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
              <Cookie className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold">Cookie Policy</h1>
          </div>

          <div className="prose max-w-none">
            <p className="text-lg">ListHouze uses cookies to enhance your experience on our platform. Here's how we use them:</p>

            <h2 className="text-xl font-semibold mt-6">Essential Cookies</h2>
            <p>These cookies are necessary for the website to function properly. They enable secure sign-in and session management.</p>

            <h2 className="text-xl font-semibold mt-6">Functional Cookies</h2>
            <p>These cookies help us improve the user experience by remembering your preferences and settings.</p>

            <h2 className="text-xl font-semibold mt-6">Analytics Cookies</h2>
            <p>We use these cookies to collect information about how you use our website, which helps us improve our services.</p>

            <h2 className="text-xl font-semibold mt-6">Personalization Cookies</h2>
            <p>These cookies allow us to personalize listings and search results based on your browsing behavior.</p>

            <h2 className="text-xl font-semibold mt-6">Managing Cookies</h2>
            <p>You can manage or disable cookies through your browser settings. However, please note that disabling certain cookies may affect the functionality of the platform.</p>

            <div className="mt-8 pt-6 border-t">
              <p className="text-sm text-gray-600">Last updated: March 31, 2025</p>
              <p className="text-sm text-gray-600">© 2025 ListHouze by Ajuba Limited</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-4 justify-center">
          <Link to="/legal/terms" className="text-blue-600 hover:text-blue-700">Terms & Conditions</Link>
          <Link to="/legal/privacy" className="text-blue-600 hover:text-blue-700">Privacy Policy</Link>
          <Link to="/legal/acceptable-use" className="text-blue-600 hover:text-blue-700">Acceptable Use</Link>
          <Link to="/legal/business-policy" className="text-blue-600 hover:text-blue-700">Business Policy</Link>
        </div>
      </div>
    </div>
  );
}