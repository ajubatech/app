import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ListPlus, CreditCard } from 'lucide-react';
import { useStripeBilling, CreditPackId } from '../hooks/useStripeBilling';
import toast from 'react-hot-toast';

interface CreditPack {
  id: CreditPackId;
  type: 'ai' | 'listing';
  credits: number;
  price: number;
  popular?: boolean;
}

const creditPacks: CreditPack[] = [
  {
    id: 'ai_credits_5',
    type: 'ai',
    credits: 5,
    price: 4.99
  },
  {
    id: 'ai_credits_10',
    type: 'ai',
    credits: 10,
    price: 8.99,
    popular: true
  },
  {
    id: 'ai_credits_20',
    type: 'ai',
    credits: 20,
    price: 15.99
  },
  {
    id: 'ai_credits_50',
    type: 'ai',
    credits: 50,
    price: 34.99
  },
  {
    id: 'listing_credits_5',
    type: 'listing',
    credits: 5,
    price: 9.99
  },
  {
    id: 'listing_credits_10',
    type: 'listing',
    credits: 10,
    price: 17.99,
    popular: true
  },
  {
    id: 'listing_credits_20',
    type: 'listing',
    credits: 20,
    price: 29.99
  }
];

interface CreditPacksGridProps {
  type?: 'ai' | 'listing' | 'all';
}

export default function CreditPacksGrid({ type = 'all' }: CreditPacksGridProps) {
  const { checkoutWithStripe, isLoading } = useStripeBilling();

  const filteredPacks = type === 'all' 
    ? creditPacks 
    : creditPacks.filter(pack => pack.type === type);

  const handlePurchase = async (pack: CreditPack) => {
    try {
      await checkoutWithStripe(pack.id);
    } catch (error) {
      toast.error('Failed to process payment');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {filteredPacks.map((pack) => (
        <motion.div
          key={pack.id}
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 relative"
        >
          {pack.popular && (
            <div className="absolute -top-3 right-6 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
              Popular
            </div>
          )}

          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
            {pack.type === 'ai' ? (
              <Sparkles className="w-6 h-6 text-blue-600" />
            ) : (
              <ListPlus className="w-6 h-6 text-blue-600" />
            )}
          </div>

          <h3 className="text-xl font-bold mb-1">{pack.credits} Credits</h3>
          <p className="text-gray-600 mb-4">
            {pack.type === 'ai' ? 'AI-powered listing generation' : 'Manual listing creation'}
          </p>

          <div className="flex items-baseline gap-1 mb-6">
            <span className="text-2xl font-bold">${pack.price.toFixed(2)}</span>
            <span className="text-gray-600">
              (${(pack.price / pack.credits).toFixed(2)}/credit)
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handlePurchase(pack)}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Buy Now
              </>
            )}
          </motion.button>
        </motion.div>
      ))}
    </div>
  );
}