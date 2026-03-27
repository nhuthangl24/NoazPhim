'use client';

import { AuthProvider } from './AuthContext';
import AuthModal from './AuthModal';

export default function Providers({ children }) {
  return (
    <AuthProvider>
      {children}
      <AuthModal />
    </AuthProvider>
  );
}
