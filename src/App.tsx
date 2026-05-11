/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { auth } from './firebase';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Pages - We will create these next
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';
import PublicCard from './pages/PublicCard';
import Auth from './pages/Auth';
import { PrivacyPolicy, TermsOfService } from './pages/Legal';
import { Toaster } from 'sonner';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-center" richColors />
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={user ? <Navigate to="/dashboard" /> : <Auth />} />
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard /> : <Navigate to="/auth" />} 
          />
          <Route 
            path="/edit/:cardId?" 
            element={user ? <Editor /> : <Navigate to="/auth" />} 
          />
          <Route path="/c/:cardId" element={<PublicCard />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </>
  );
}
