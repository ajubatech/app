import React from 'react';
import { Link } from 'react-router-dom';

interface LegalLinksProps {
  className?: string;
  linkClassName?: string;
}

export default function LegalLinks({ className = '', linkClassName = 'text-sm text-gray-500 hover:text-gray-700' }: LegalLinksProps) {
  return (
    <div className={`flex flex-wrap gap-4 ${className}`}>
      <Link to="/legal/terms" className={linkClassName}>
        Terms & Conditions
      </Link>
      <Link to="/legal/privacy" className={linkClassName}>
        Privacy Policy
      </Link>
      <Link to="/legal/cookies" className={linkClassName}>
        Cookie Policy
      </Link>
      <Link to="/legal/acceptable-use" className={linkClassName}>
        Acceptable Use
      </Link>
      <Link to="/legal/business-policy" className={linkClassName}>
        Business Policy
      </Link>
    </div>
  );
}