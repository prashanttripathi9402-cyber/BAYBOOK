import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BaybookDiscovery from './components/BaybookDiscovery';
import AuthModal from './components/AuthModal';
import AddGarageModal from './components/AddGarageModal';
import BookingTrackerPage from './pages/BookingTrackerPage';
import VendorDashboardPage from './pages/VendorDashboardPage';

export default function App() {
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAddGarageModalOpen, setIsAddGarageModalOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('autofix_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('autofix_token');
    localStorage.removeItem('autofix_user');
    setUser(null);
  };

  const handleAddGarageClick = () => {
    if (!user) {
      setIsAuthModalOpen(true);
    } else if (user.role !== 'vendor' && user.role !== 'admin') {
      alert('Please sign in or register with a Garage Partner / Dealer account to add garages.');
      setIsAuthModalOpen(true);
    } else {
      setIsAddGarageModalOpen(true);
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-[#0a0a0c] text-zinc-100 flex flex-col font-sans">
        <main className="flex-1">
          <Routes>
            <Route
              path="/"
              element={
                <BaybookDiscovery
                  user={user}
                  onOpenAuthModal={() => setIsAuthModalOpen(true)}
                  onOpenAddGarageModal={handleAddGarageClick}
                />
              }
            />
            <Route path="/tracker" element={<BookingTrackerPage />} />
            <Route path="/vendor-dashboard" element={<VendorDashboardPage />} />
          </Routes>
        </main>

        <footer className="bg-[#0b0d10] border-t border-zinc-800/80 py-6 text-center text-xs text-zinc-500">
          <p>© 2026 BAYBOOK Vehicle Service Discovery Platform. All rights reserved.</p>
        </footer>

        {/* Global Modals */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={(authUser) => {
            setUser(authUser);
            if (authUser.role === 'vendor') {
              setIsAddGarageModalOpen(true);
            }
          }}
        />

        <AddGarageModal
          isOpen={isAddGarageModalOpen}
          onClose={() => setIsAddGarageModalOpen(false)}
          onGarageAdded={() => {
            window.location.reload();
          }}
        />
      </div>
    </Router>
  );
}
