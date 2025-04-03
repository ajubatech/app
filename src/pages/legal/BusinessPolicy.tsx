import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Building2 } from 'lucide-react';

export default function BusinessPolicy() {
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
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold">Business User Policy</h1>
          </div>

          <div className="prose max-w-none">
            <p className="text-lg">Business users get access to extra tools, analytics, and premium features on ListHouze.</p>

            <h2 className="text-xl font-semibold mt-6">Business Account Benefits</h2>
            <ul>
              <li>Enhanced analytics dashboard</li>
              <li>Team collaboration tools</li>
              <li>Priority customer support</li>
              <li>Advanced listing workflows</li>
              <li>Bulk listing capabilities</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6">AI Usage Limits</h2>
            <p>AI usage limits apply unless on a Pro+ subscription. Business accounts on the Pro+ plan receive unlimited AI credits for listing creation and optimization.</p>

            <h2 className="text-xl font-semibold mt-6">Business Account Audits</h2>
            <p>Business accounts may be audited by ListHouze Admins for compliance with our platform policies. This helps maintain the integrity and quality of business listings.</p>

            <h2 className="text-xl font-semibold mt-6">Team Collaboration</h2>
            <p>Business dashboards support team member collaboration and advanced listing workflows. Team members must adhere to the same platform policies.</p>

            <h2 className="text-xl font-semibold mt-6">Bulk Listing Guidelines</h2>
            <p>Misuse of bulk listing or auto-reposting tools may result in restrictions. Business users must ensure all bulk listings meet our quality standards.</p>

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
          <Link to="/legal/acceptable-use" className="text-blue-600 hover:text-blue-700">Acceptable Use</Link>
        </div>
      </div>
    </div>
  );
}