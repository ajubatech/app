import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Linkedin, Mail } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function Footer() {
  const { user } = useAuthStore();
  
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">ListHouze</h3>
            <p className="text-sm">Your next-gen AI-powered marketplace for local communities.</p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="hover:text-white">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
              <li><Link to="/blog" className="hover:text-white">Blog</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Categories</h4>
            <ul className="space-y-2">
              <li><Link to="/real-estate" className="hover:text-white">Real Estate</Link></li>
              <li><Link to="/products" className="hover:text-white">Products</Link></li>
              <li><Link to="/services" className="hover:text-white">Services</Link></li>
              <li><Link to="/automotive" className="hover:text-white">Automotive</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link to="/legal/terms" className="hover:text-white">Terms & Conditions</Link></li>
              <li><Link to="/legal/privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link to="/legal/cookies" className="hover:text-white">Cookie Policy</Link></li>
              <li><Link to="/legal/acceptable-use" className="hover:text-white">Acceptable Use</Link></li>
              <li><Link to="/legal/business-policy" className="hover:text-white">Business Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-8 pt-8 border-t border-gray-800">
          <p className="text-sm">&copy; {new Date().getFullYear()} ListHouze. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="https://facebook.com/listhouze" className="hover:text-white"><Facebook className="w-5 h-5" /></a>
            <a href="https://instagram.com/listhouze" className="hover:text-white"><Instagram className="w-5 h-5" /></a>
            <a href="https://linkedin.com/company/listhouze" className="hover:text-white"><Linkedin className="w-5 h-5" /></a>
            <a href="mailto:support@listhouze.com.au" className="hover:text-white"><Mail className="w-5 h-5" /></a>
          </div>
        </div>
      </div>
      
      {/* Add padding at the bottom for mobile navigation */}
      {user && <div className="h-16 md:hidden"></div>}
    </footer>
  );
}