import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import ErrorBoundary from './components/ErrorBoundary.tsx';

// Log environment variables (without exposing sensitive values)
console.log('Environment check:', {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL ? 'defined' : 'undefined',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'defined' : 'undefined',
  recaptchaSiteKey: import.meta.env.VITE_RECAPTCHA_SITE_KEY ? 'defined' : 'undefined',
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? 'defined' : 'undefined',
  stripePublishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ? 'defined' : 'undefined',
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);