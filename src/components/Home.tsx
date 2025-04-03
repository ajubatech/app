import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Sparkles, ArrowRight, ShoppingBag, Building2, Car, Wrench } from 'lucide-react';
import { motion } from 'framer-motion';
import ListAIOnboardingWidget from '../components/ListAIOnboardingWidget';

export default function Home() {
  const handleTryFullExperience = () => {
    // Scroll to the categories section
    const categoriesSection = document.getElementById('categories-section');
    if (categoriesSection) {
      categoriesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="text-center py-16 px-4">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Your AI-Powered<br />Community Marketplace
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Buy, sell, rent, and discover with the power of AI at your fingertips.
        </p>
        
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products, properties, services..."
              className="w-full px-6 py-4 pr-32 rounded-full text-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 px-6 py-2 rounded-full text-white hover:opacity-90 transition-opacity">
              Search
            </button>
          </div>
        </div>
      </section>

      {/* AI Assistant Section */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 md:p-12">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-6">
                <Sparkles className="w-4 h-4" />
                <span className="font-medium">AI-Powered Experience</span>
              </div>
              
              <h2 className="text-3xl font-bold mb-4">
                Your Personal Marketplace Assistant
              </h2>
              <p className="text-gray-600 mb-6">
                Our AI helps you find exactly what you're looking for, create better listings,
                and connect with the right people. It's like having a personal shopping and
                selling companion.
              </p>
              
              <ul className="space-y-3 mb-8">
                {[
                  'Get tailored recommendations based on your preferences',
                  'Generate professional descriptions for your listings',
                  'Analyze market prices to optimize your listings',
                  'Receive insights on trending items and categories'
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-blue-600" />
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleTryFullExperience}
                className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Try the Full AI Experience
              </motion.button>
            </div>

            <div className="flex-1 bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold">ListAI</h3>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-gray-600">
                  Hi there! I'm your ListAI assistant. How can I help you today?
                </p>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Ask about products, properties, or services..."
                  className="w-full px-4 py-3 pr-12 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-700">
                  <ArrowRight className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories-section" className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4">Explore Categories</h2>
        <p className="text-gray-600 text-center mb-12">
          Discover everything our marketplace has to offer
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <div key={category.name} className="bg-white rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className={`w-12 h-12 rounded-xl ${category.bgColor} flex items-center justify-center mb-4`}>
                {category.icon}
              </div>
              
              <h3 className="text-xl font-semibold mb-4">{category.name}</h3>
              
              <div className="space-y-3">
                {category.subcategories.map((sub) => (
                  <Link
                    key={sub.name}
                    to={sub.link}
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
                  >
                    {sub.icon}
                    <span>{sub.name}</span>
                  </Link>
                ))}
              </div>

              <Link
                to={category.viewAllLink}
                className="inline-flex items-center gap-2 text-blue-600 font-medium mt-6 hover:text-blue-700"
              >
                <span>Browse All {category.name}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ListAI Onboarding Widget */}
      <ListAIOnboardingWidget />
    </div>
  );
}

const categories = [
  {
    name: 'Products',
    icon: <ShoppingBag className="w-6 h-6 text-blue-600" />,
    bgColor: 'bg-blue-50',
    viewAllLink: '/products/category/all',
    subcategories: [
      { name: 'Fashion', icon: <ShoppingBag className="w-4 h-4" />, link: '/products/category/fashion' },
      { name: 'Electronics', icon: <ShoppingBag className="w-4 h-4" />, link: '/products/category/electronics' },
      { name: 'Home & Garden', icon: <ShoppingBag className="w-4 h-4" />, link: '/products/category/home-garden' },
      { name: 'Food & Drink', icon: <ShoppingBag className="w-4 h-4" />, link: '/products/category/food-drink' }
    ]
  },
  {
    name: 'Real Estate',
    icon: <Building2 className="w-6 h-6 text-green-600" />,
    bgColor: 'bg-green-50',
    viewAllLink: '/real-estate/category/all',
    subcategories: [
      { name: 'For Sale', icon: <Building2 className="w-4 h-4" />, link: '/real-estate/category/for-sale' },
      { name: 'For Rent', icon: <Building2 className="w-4 h-4" />, link: '/real-estate/category/for-rent' },
      { name: 'Commercial', icon: <Building2 className="w-4 h-4" />, link: '/real-estate/category/commercial' },
      { name: 'Land', icon: <Building2 className="w-4 h-4" />, link: '/real-estate/category/land' }
    ]
  },
  {
    name: 'Automotive',
    icon: <Car className="w-6 h-6 text-orange-600" />,
    bgColor: 'bg-orange-50',
    viewAllLink: '/automotive/category/all',
    subcategories: [
      { name: 'Vehicles', icon: <Car className="w-4 h-4" />, link: '/automotive/category/vehicles' },
      { name: 'Parts', icon: <Car className="w-4 h-4" />, link: '/automotive/category/parts' },
      { name: 'Repairs', icon: <Car className="w-4 h-4" />, link: '/automotive/category/repairs' }
    ]
  },
  {
    name: 'Services',
    icon: <Wrench className="w-6 h-6 text-purple-600" />,
    bgColor: 'bg-purple-50',
    viewAllLink: '/services/category/all',
    subcategories: [
      { name: 'Home Services', icon: <Wrench className="w-4 h-4" />, link: '/services/category/home' },
      { name: 'Creative', icon: <Wrench className="w-4 h-4" />, link: '/services/category/creative' },
      { name: 'Personal Care', icon: <Wrench className="w-4 h-4" />, link: '/services/category/personal-care' },
      { name: 'Health', icon: <Wrench className="w-4 h-4" />, link: '/services/category/health' },
      { name: 'Education', icon: <Wrench className="w-4 h-4" />, link: '/services/category/education' }
    ]
  }
];