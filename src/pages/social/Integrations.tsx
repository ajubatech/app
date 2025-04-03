import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link as LinkIcon, Check, X, Instagram, Facebook, Twitter as TwitterIcon, Linkedin, BookText as TikTok, Globe, Youtube, Mail, AlertCircle, Info } from 'lucide-react';

export default function IntegrationsPage() {
  const [connectedAccounts, setConnectedAccounts] = useState([
    { id: 'instagram', name: 'Instagram', connected: true, account: '@chatorigali', icon: <Instagram /> },
    { id: 'facebook', name: 'Facebook', connected: true, account: 'Chatori Gali', icon: <Facebook /> },
    { id: 'twitter', name: 'Twitter', connected: false, account: '', icon: <TwitterIcon /> },
    { id: 'linkedin', name: 'LinkedIn', connected: true, account: 'Chatori Gali', icon: <Linkedin /> },
    { id: 'tiktok', name: 'TikTok', connected: true, account: '@chatorigali', icon: <TikTok /> },
    { id: 'youtube', name: 'YouTube', connected: false, account: '', icon: <Youtube /> }
  ]);
  
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<any>(null);
  
  const handleConnect = (platform: any) => {
    setSelectedPlatform(platform);
    setShowConnectModal(true);
  };
  
  const handleDisconnect = (platformId: string) => {
    if (confirm(`Are you sure you want to disconnect ${platformId}?`)) {
      const updatedAccounts = connectedAccounts.map(account => 
        account.id === platformId 
          ? { ...account, connected: false, account: '' } 
          : account
      );
      
      setConnectedAccounts(updatedAccounts);
    }
  };
  
  const completeConnection = () => {
    const updatedAccounts = connectedAccounts.map(account => 
      account.id === selectedPlatform.id 
        ? { ...account, connected: true, account: `@${selectedPlatform.id}_user` } 
        : account
    );
    
    setConnectedAccounts(updatedAccounts);
    setShowConnectModal(false);
  };
  
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Integrations</h1>
          <p className="text-gray-600">Connect your social media accounts</p>
        </div>
      </div>
      
      {/* Info Alert */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 mt-0.5" />
        <div>
          <p className="font-medium text-blue-800">Connect your accounts</p>
          <p className="text-blue-700">
            Connect your social media accounts to schedule and publish content directly from ListHouze.
          </p>
        </div>
      </div>
      
      {/* Connected Accounts */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold mb-6">Social Media Accounts</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {connectedAccounts.map((platform) => (
            <div 
              key={platform.id}
              className="border rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 ${platform.connected ? 'bg-blue-100' : 'bg-gray-100'} rounded-full flex items-center justify-center`}>
                  {React.cloneElement(platform.icon as React.ReactElement, { 
                    className: `w-6 h-6 ${platform.connected ? 'text-blue-600' : 'text-gray-600'}` 
                  })}
                </div>
                <div>
                  <p className="font-medium">{platform.name}</p>
                  {platform.connected ? (
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <Check className="w-4 h-4" />
                      Connected as {platform.account}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-600">Not connected</p>
                  )}
                </div>
              </div>
              
              {platform.connected ? (
                <button
                  onClick={() => handleDisconnect(platform.id)}
                  className="px-3 py-1 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm"
                >
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={() => handleConnect(platform)}
                  className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  Connect
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Other Integrations */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-6">Other Integrations</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <Globe className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <p className="font-medium">WordPress</p>
                <p className="text-sm text-gray-600">Connect your blog</p>
              </div>
            </div>
            
            <button
              className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              Connect
            </button>
          </div>
          
          <div className="border rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <Mail className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <p className="font-medium">Email Marketing</p>
                <p className="text-sm text-gray-600">Connect your email service</p>
              </div>
            </div>
            
            <button
              className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              Connect
            </button>
          </div>
        </div>
      </div>
      
      {/* Connect Modal */}
      {showConnectModal && selectedPlatform && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Connect {selectedPlatform.name}</h2>
              <button
                onClick={() => setShowConnectModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {React.cloneElement(selectedPlatform.icon as React.ReactElement, { 
                  className: "w-8 h-8 text-blue-600" 
                })}
              </div>
              <p className="text-gray-600 mb-4">
                You'll be redirected to {selectedPlatform.name} to authorize ListHouze to access your account.
              </p>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 flex items-start gap-2 text-left">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm text-yellow-800">
                    This is a demo integration. In a real implementation, you would be redirected to the platform's authentication page.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={completeConnection}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                Connect Account
              </button>
              <button
                onClick={() => setShowConnectModal(false)}
                className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}