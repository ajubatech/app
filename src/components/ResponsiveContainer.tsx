import React from 'react';
import { useAuthStore } from '../store/authStore';
import MobileNav from './MobileNav';

interface ResponsiveContainerProps {
  children: React.ReactNode;
}

export default function ResponsiveContainer({ children }: ResponsiveContainerProps) {
  const { user } = useAuthStore();
  
  return (
    <div className="min-h-screen flex flex-col">
      {children}
      {user && <MobileNav />}
    </div>
  );
}