import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import AIAssistant from './components/AIAssistant';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import SignUp from './pages/auth/SignUp';
import ResetPassword from './pages/auth/ResetPassword';
import Terms from './pages/legal/Terms';
import Privacy from './pages/legal/Privacy';
import Cookies from './pages/legal/Cookies';
import AcceptableUse from './pages/legal/AcceptableUse';
import BusinessPolicy from './pages/legal/BusinessPolicy';
import { useAuthStore } from './store/authStore';
import MobileNav from './components/MobileNav';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load components for better performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));
const BusinessProfile = lazy(() => import('./pages/BusinessProfile'));
const Leads = lazy(() => import('./pages/crm/Leads'));
const Invoices = lazy(() => import('./pages/crm/Invoices'));
const RealEstateListing = lazy(() => import('./pages/listings/RealEstateListing'));
const RealEstateCategoryListing = lazy(() => import('./pages/listings/RealEstateCategoryListing'));
const ProductListing = lazy(() => import('./pages/listings/ProductListing'));
const ServiceListing = lazy(() => import('./pages/listings/ServiceListing'));
const AutomotiveListing = lazy(() => import('./pages/listings/AutomotiveListing'));
const CreateListing = lazy(() => import('./pages/CreateListing'));
const ChatWithAI = lazy(() => import('./pages/ChatWithAI'));
const Messages = lazy(() => import('./pages/Messages'));
const Reels = lazy(() => import('./pages/Reels'));
const Explore = lazy(() => import('./pages/Explore'));
const EarnMoney = lazy(() => import('./pages/ai/earn-money'));
const ProPlus = lazy(() => import('./pages/pro-plus'));
const AdminPortal = lazy(() => import('./pages/admin'));
const NewProductListing = lazy(() => import('./pages/listings/new/product'));
const NewPetListing = lazy(() => import('./pages/listings/new/pet'));
const NewAutomotiveListing = lazy(() => import('./pages/listings/new/automotive'));
const NewServiceListing = lazy(() => import('./pages/listings/new/service'));
const Notifications = lazy(() => import('./pages/Notifications'));
const SavedItems = lazy(() => import('./pages/SavedItems'));
const ListerProfile = lazy(() => import('./pages/profiles/ListerProfile'));
const AgencyProfile = lazy(() => import('./pages/profiles/AgencyProfile'));
const SocialDashboard = lazy(() => import('./pages/social'));

// Loading fallback
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

function App() {
  const { isLoading } = useAuthStore();

  if (isLoading) {
    return <LoadingFallback />;
  }

  return (
    <Router>
      <Toaster position="top-right" />
      <AIAssistant />
      <ErrorBoundary>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Admin Routes */}
          <Route 
            path="/admin/*" 
            element={
              <Suspense fallback={<LoadingFallback />}>
                <AdminPortal />
              </Suspense>
            } 
          />
          
          {/* Social Media Dashboard Routes */}
          <Route 
            path="/social/*" 
            element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingFallback />}>
                  <SocialDashboard />
                </Suspense>
              </ProtectedRoute>
            } 
          />
          
          {/* Legal Routes */}
          <Route path="/legal/terms" element={
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-grow">
                <Terms />
              </main>
              <Footer />
            </div>
          } />
          <Route path="/legal/privacy" element={
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-grow">
                <Privacy />
              </main>
              <Footer />
            </div>
          } />
          <Route path="/legal/cookies" element={
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-grow">
                <Cookies />
              </main>
              <Footer />
            </div>
          } />
          <Route path="/legal/acceptable-use" element={
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-grow">
                <AcceptableUse />
              </main>
              <Footer />
            </div>
          } />
          <Route path="/legal/business-policy" element={
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-grow">
                <BusinessPolicy />
              </main>
              <Footer />
            </div>
          } />
          
          {/* Main App Routes */}
          <Route path="/" element={
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-grow">
                <Home />
              </main>
              <Footer />
            </div>
          } />
          
          <Route path="/explore" element={
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-grow">
                <Suspense fallback={<LoadingFallback />}>
                  <Explore />
                </Suspense>
              </main>
              <Footer />
            </div>
          } />
          
          {/* Public Profile Routes */}
          <Route path="/lister/:username" element={
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-grow">
                <Suspense fallback={<LoadingFallback />}>
                  <ListerProfile />
                </Suspense>
              </main>
              <Footer />
            </div>
          } />
          
          <Route path="/agency/:agencyName" element={
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-grow">
                <Suspense fallback={<LoadingFallback />}>
                  <AgencyProfile />
                </Suspense>
              </main>
              <Footer />
            </div>
          } />
          
          {/* Listing Detail Routes */}
          <Route path="/real-estate/:id" element={
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-grow">
                <Suspense fallback={<LoadingFallback />}>
                  <RealEstateListing />
                </Suspense>
              </main>
              <Footer />
            </div>
          } />
          <Route path="/real-estate/category/:category" element={
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-grow">
                <Suspense fallback={<LoadingFallback />}>
                  <RealEstateCategoryListing />
                </Suspense>
              </main>
              <Footer />
            </div>
          } />
          <Route path="/products/:id" element={
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-grow">
                <Suspense fallback={<LoadingFallback />}>
                  <ProductListing />
                </Suspense>
              </main>
              <Footer />
            </div>
          } />
          <Route path="/services/:id" element={
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-grow">
                <Suspense fallback={<LoadingFallback />}>
                  <ServiceListing />
                </Suspense>
              </main>
              <Footer />
            </div>
          } />
          <Route path="/automotive/:id" element={
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-grow">
                <Suspense fallback={<LoadingFallback />}>
                  <AutomotiveListing />
                </Suspense>
              </main>
              <Footer />
            </div>
          } />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
                <Sidebar />
                <div className="flex-1 flex flex-col">
                  <Navbar />
                  <main className="flex-grow">
                    <Suspense fallback={<LoadingFallback />}>
                      <Dashboard />
                    </Suspense>
                  </main>
                  <Footer />
                  <MobileNav />
                </div>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/settings" element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
                <Sidebar />
                <div className="flex-1 flex flex-col">
                  <Navbar />
                  <main className="flex-grow">
                    <Suspense fallback={<LoadingFallback />}>
                      <Settings />
                    </Suspense>
                  </main>
                  <Footer />
                  <MobileNav />
                </div>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/business-profile" element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
                <Sidebar />
                <div className="flex-1 flex flex-col">
                  <Navbar />
                  <main className="flex-grow">
                    <Suspense fallback={<LoadingFallback />}>
                      <BusinessProfile />
                    </Suspense>
                  </main>
                  <Footer />
                  <MobileNav />
                </div>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/crm/leads" element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
                <Sidebar />
                <div className="flex-1 flex flex-col">
                  <Navbar />
                  <main className="flex-grow">
                    <Suspense fallback={<LoadingFallback />}>
                      <Leads />
                    </Suspense>
                  </main>
                  <Footer />
                  <MobileNav />
                </div>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/crm/invoices" element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
                <Sidebar />
                <div className="flex-1 flex flex-col">
                  <Navbar />
                  <main className="flex-grow">
                    <Suspense fallback={<LoadingFallback />}>
                      <Invoices />
                    </Suspense>
                  </main>
                  <Footer />
                  <MobileNav />
                </div>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/create-listing" element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
                <Sidebar />
                <div className="flex-1 flex flex-col">
                  <Navbar />
                  <main className="flex-grow">
                    <Suspense fallback={<LoadingFallback />}>
                      <CreateListing />
                    </Suspense>
                  </main>
                  <Footer />
                  <MobileNav />
                </div>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/chat-with-ai" element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
                <Sidebar />
                <div className="flex-1 flex flex-col">
                  <Navbar />
                  <main className="flex-grow">
                    <Suspense fallback={<LoadingFallback />}>
                      <ChatWithAI />
                    </Suspense>
                  </main>
                  <Footer />
                  <MobileNav />
                </div>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/messages" element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
                <Sidebar />
                <div className="flex-1 flex flex-col">
                  <Navbar />
                  <main className="flex-grow">
                    <Suspense fallback={<LoadingFallback />}>
                      <Messages />
                    </Suspense>
                  </main>
                  <Footer />
                  <MobileNav />
                </div>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/reels" element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
                <Sidebar />
                <div className="flex-1 flex flex-col">
                  <Navbar />
                  <main className="flex-grow">
                    <Suspense fallback={<LoadingFallback />}>
                      <Reels />
                    </Suspense>
                  </main>
                  <Footer />
                  <MobileNav />
                </div>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/ai/earn-money" element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
                <Sidebar />
                <div className="flex-1 flex flex-col">
                  <Navbar />
                  <main className="flex-grow">
                    <Suspense fallback={<LoadingFallback />}>
                      <EarnMoney />
                    </Suspense>
                  </main>
                  <Footer />
                  <MobileNav />
                </div>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/pro-plus/*" element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
                <Sidebar />
                <div className="flex-1 flex flex-col">
                  <Navbar />
                  <main className="flex-grow">
                    <Suspense fallback={<LoadingFallback />}>
                      <ProPlus />
                    </Suspense>
                  </main>
                  <Footer />
                  <MobileNav />
                </div>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/listings/new/product" element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
                <Sidebar />
                <div className="flex-1 flex flex-col">
                  <Navbar />
                  <main className="flex-grow">
                    <Suspense fallback={<LoadingFallback />}>
                      <NewProductListing />
                    </Suspense>
                  </main>
                  <Footer />
                  <MobileNav />
                </div>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/listings/new/pet" element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
                <Sidebar />
                <div className="flex-1 flex flex-col">
                  <Navbar />
                  <main className="flex-grow">
                    <Suspense fallback={<LoadingFallback />}>
                      <NewPetListing />
                    </Suspense>
                  </main>
                  <Footer />
                  <MobileNav />
                </div>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/listings/new/automotive" element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
                <Sidebar />
                <div className="flex-1 flex flex-col">
                  <Navbar />
                  <main className="flex-grow">
                    <Suspense fallback={<LoadingFallback />}>
                      <NewAutomotiveListing />
                    </Suspense>
                  </main>
                  <Footer />
                  <MobileNav />
                </div>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/listings/new/service" element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
                <Sidebar />
                <div className="flex-1 flex flex-col">
                  <Navbar />
                  <main className="flex-grow">
                    <Suspense fallback={<LoadingFallback />}>
                      <NewServiceListing />
                    </Suspense>
                  </main>
                  <Footer />
                  <MobileNav />
                </div>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/notifications" element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
                <Sidebar />
                <div className="flex-1 flex flex-col">
                  <Navbar />
                  <main className="flex-grow">
                    <Suspense fallback={<LoadingFallback />}>
                      <Notifications />
                    </Suspense>
                  </main>
                  <Footer />
                  <MobileNav />
                </div>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/saved" element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
                <Sidebar />
                <div className="flex-1 flex flex-col">
                  <Navbar />
                  <main className="flex-grow">
                    <Suspense fallback={<LoadingFallback />}>
                      <SavedItems />
                    </Suspense>
                  </main>
                  <Footer />
                  <MobileNav />
                </div>
              </div>
            </ProtectedRoute>
          } />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ErrorBoundary>
    </Router>
  );
}

// Protected route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore();
  
  if (isLoading) {
    return <LoadingFallback />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

export default App;