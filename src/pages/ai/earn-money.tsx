import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Briefcase, GraduationCap, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import EarnWithListAI from '../../components/EarnWithListAI';

export default function EarnMoney() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [skills, setSkills] = useState<string[]>([]);
  const [licenses, setLicenses] = useState<string[]>([]);
  const [availability, setAvailability] = useState<string[]>([]);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Submit all data
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    try {
      // Save skills to user_skills table
      const { error: skillsError } = await supabase
        .from('user_skills')
        .insert(
          skills.map(skill => ({
            skill,
            verified: false
          }))
        );

      if (skillsError) throw skillsError;

      // Get AI recommendations
      const { data: recommendations, error: aiError } = await supabase.functions
        .invoke('ai-income-coach', {
          body: { skills, licenses, availability }
        });

      if (aiError) throw aiError;

      // Save recommendations
      const { error: saveError } = await supabase
        .from('ai_recommendations')
        .insert({
          type: 'job',
          content: recommendations
        });

      if (saveError) throw saveError;

      toast.success('Profile created! Here are your personalized recommendations.');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Earn Money with ListHouze
          </h1>
          <p className="text-xl text-gray-600">
            Let's find the perfect earning opportunities for you
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between items-center mb-12 relative">
          <div className="absolute left-0 right-0 top-1/2 h-1 bg-gray-200 -z-10" />
          <div className="absolute left-0 right-0 top-1/2 h-1 bg-blue-600 -z-10" style={{ width: `${(step / 3) * 100}%` }} />
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                s <= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}
            >
              {s}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-white rounded-xl shadow-sm p-8"
        >
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">What are your skills?</h2>
              <p className="text-gray-600">
                Select or type your skills to help us find the best opportunities
              </p>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Type a skill and press Enter"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const input = e.target as HTMLInputElement;
                      if (input.value) {
                        setSkills([...skills, input.value]);
                        input.value = '';
                      }
                    }
                  }}
                />
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2"
                    >
                      {skill}
                      <button
                        onClick={() => setSkills(skills.filter((_, i) => i !== index))}
                        className="hover:text-blue-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Do you have any licenses or certifications?</h2>
              <p className="text-gray-600">
                Add any professional licenses or certifications you hold
              </p>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Type a license/certification and press Enter"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const input = e.target as HTMLInputElement;
                      if (input.value) {
                        setLicenses([...licenses, input.value]);
                        input.value = '';
                      }
                    }
                  }}
                />
                <div className="flex flex-wrap gap-2">
                  {licenses.map((license, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-2"
                    >
                      {license}
                      <button
                        onClick={() => setLicenses(licenses.filter((_, i) => i !== index))}
                        className="hover:text-green-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">What hours can you work?</h2>
              <p className="text-gray-600">
                Select your preferred working hours
              </p>
              <div className="space-y-4">
                {[
                  'Weekday mornings',
                  'Weekday afternoons',
                  'Weekday evenings',
                  'Weekends',
                  'Flexible hours',
                  'Full-time',
                  'Part-time'
                ].map((time) => (
                  <label
                    key={time}
                    className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={availability.includes(time)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setAvailability([...availability, time]);
                        } else {
                          setAvailability(availability.filter(t => t !== time));
                        }
                      }}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>{time}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-between">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-2 border rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
            )}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNext}
              className="ml-auto bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              {step === 3 ? 'Get Recommendations' : 'Next'}
            </motion.button>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Browse Jobs</h3>
            <p className="text-gray-600 mb-4">
              Find local job opportunities that match your skills
            </p>
            <button className="text-blue-600 font-medium hover:underline flex items-center gap-1">
              View Jobs <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          >
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <GraduationCap className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Free Training</h3>
            <p className="text-gray-600 mb-4">
              Access free courses to enhance your skills
            </p>
            <button className="text-green-600 font-medium hover:underline flex items-center gap-1">
              Start Learning <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Create Listing</h3>
            <p className="text-gray-600 mb-4">
              Offer your services and start earning
            </p>
            <button className="text-purple-600 font-medium hover:underline flex items-center gap-1">
              Get Started <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>

        {/* AI Assistant */}
        <EarnWithListAI />
      </div>
    </div>
  );
}