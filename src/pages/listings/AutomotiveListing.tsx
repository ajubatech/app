import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Thumbs } from 'swiper/modules';
import { 
  Heart, Share2, MapPin, Calendar, Shield, 
  Star, MessageCircle, Car, Fuel, Gauge, 
  Settings, CheckCircle2, AlertCircle, History
} from 'lucide-react';
import { useListingStore } from '../../store/listingStore';
import { formatDistance } from 'date-fns';
import { motion } from 'framer-motion';
import InvoiceButton from '../../components/InvoiceButton';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';

export default function AutomotiveListing() {
  const { id } = useParams();
  const { selectedListing: listing } = useListingStore();
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  if (!listing) return null;

  const automotive = listing.metadata as Automotive;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          <Swiper
            modules={[Navigation, Pagination, Thumbs]}
            navigation
            pagination={{ clickable: true }}
            thumbs={{ swiper: thumbsSwiper }}
            className="aspect-[4/3] rounded-2xl overflow-hidden"
          >
            {listing.images.map((image, index) => (
              <SwiperSlide key={index}>
                <img 
                  src={image} 
                  alt={`${listing.title} - Image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </SwiperSlide>
            ))}
          </Swiper>
          
          <Swiper
            onSwiper={setThumbsSwiper}
            spaceBetween={10}
            slidesPerView={4}
            freeMode={true}
            watchSlidesProgress={true}
            modules={[Navigation, Thumbs]}
            className="h-24"
          >
            {listing.images.map((image, index) => (
              <SwiperSlide key={index}>
                <img 
                  src={image} 
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg cursor-pointer"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Vehicle Info */}
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {automotive.year} {automotive.make} {automotive.model} {automotive.variant}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{listing.location?.address}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Listed {formatDistance(new Date(listing.created_at), new Date(), { addSuffix: true })}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-full border border-gray-200 hover:bg-gray-50"
              >
                <Heart className="w-6 h-6 text-gray-600" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-full border border-gray-200 hover:bg-gray-50"
              >
                <Share2 className="w-6 h-6 text-gray-600" />
              </motion.button>
            </div>
          </div>

          {/* Price */}
          <div className="bg-blue-50 p-6 rounded-xl">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-blue-600">
                ${listing.price.toLocaleString()}
              </span>
              <span className="text-sm text-gray-600">Drive away</span>
            </div>
            <div className="mt-4 flex gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Make an Offer
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 border border-blue-600 text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Finance Options
              </motion.button>
            </div>
          </div>

          {/* Key Features */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <Car className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Body Type</p>
              <p className="font-medium">{automotive.body_type}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <Gauge className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Odometer</p>
              <p className="font-medium">{automotive.odometer.toLocaleString()} km</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <Settings className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Transmission</p>
              <p className="font-medium capitalize">{automotive.transmission}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <Fuel className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Fuel Type</p>
              <p className="font-medium">{automotive.fuel_type}</p>
            </div>
          </div>

          {/* Registration */}
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Registration Details</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Plate</p>
                <p className="font-medium">{automotive.registration.plate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">State</p>
                <p className="font-medium">{automotive.registration.state}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Expiry</p>
                <p className="font-medium">{automotive.registration.expiry}</p>
              </div>
            </div>
          </div>
          
          {/* Invoice Button */}
          <div>
            <InvoiceButton 
              listingId={listing.id}
              buttonText="Generate Invoice for this Vehicle"
              className="w-full"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          <div className="prose max-w-none">
            <h2 className="text-2xl font-bold mb-4">Vehicle Description</h2>
            <p className="text-gray-600 whitespace-pre-line">
              {listing.description}
            </p>
          </div>

          {/* Engine & Performance */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Engine & Performance</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600">Engine Size</p>
                <p className="font-medium">{automotive.engine.size}L</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600">Cylinders</p>
                <p className="font-medium">{automotive.engine.cylinders}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600">Power</p>
                <p className="font-medium">{automotive.engine.power}kW</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600">Torque</p>
                <p className="font-medium">{automotive.engine.torque}Nm</p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Features & Equipment</h2>
            <div className="grid grid-cols-2 gap-4">
              {automotive.features.map((feature, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Vehicle History */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Vehicle History</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <History className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="font-medium">Previous Owners</p>
                  <p className="text-sm text-gray-600">{automotive.history.owners}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                {automotive.history.accidents ? (
                  <AlertCircle className="w-6 h-6 text-red-600" />
                ) : (
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                )}
                <div>
                  <p className="font-medium">Accident History</p>
                  <p className="text-sm text-gray-600">
                    {automotive.history.accidents ? 'Reported' : 'No accidents'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                {automotive.history.service_history ? (
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                )}
                <div>
                  <p className="font-medium">Service History</p>
                  <p className="text-sm text-gray-600">
                    {automotive.history.service_history ? 'Full history' : 'Partial history'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Seller Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-4 mb-6">
              <img
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt="Seller"
                className="w-16 h-16 rounded-full"
              />
              <div>
                <p className="font-medium">Premium Motors</p>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">4.8</span>
                  <span className="text-gray-600">(42 reviews)</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors">
                <MessageCircle className="w-5 h-5" />
                Message Seller
              </button>
              <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors">
                Request Inspection
              </button>
            </div>
          </div>

          {/* Safety Features */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Buyer Protection</h3>
            </div>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Vehicle history verified</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Secure payments</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Professional inspection available</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Money-back guarantee</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}