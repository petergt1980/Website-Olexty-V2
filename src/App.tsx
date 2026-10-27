import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './features/auth/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CustomCursor } from './components/CustomCursor';

// Pages
import { CommunityFeedPage } from './pages/CommunityFeedPage';
import { ArcadeHubPage } from './pages/ArcadeHubPage';
import { MembersPage } from './pages/MembersPage';
import { ClipShowcasePage } from './pages/ClipShowcasePage';
import { EventsPage } from './pages/EventsPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { RosterPage } from './pages/RosterPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { SettingsPage } from './pages/SettingsPage';
import { MessagesPage } from './pages/MessagesPage';
import { NotificationsPage } from './pages/NotificationsPage';

// Admin Pages
import { AdminMembersPage } from './features/admin/pages/AdminMembersPage';

export function App() {
  // Matikan fitur Klik Kanan di seluruh halaman website
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    document.addEventListener('contextmenu', handleContextMenu);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <CustomCursor />
        <div className="min-h-screen bg-[#0b0c10] bg-grid-pattern text-[#F4F5F8] flex flex-col font-space selection:bg-rose-600 selection:text-white">
          <Navbar />
          <main className="flex-1 p-4 sm:p-6 max-w-6xl mx-auto w-full">
            <Routes>
              {/* Public & Core Routes */}
              <Route path="/" element={<Navigate to="/community" replace />} />
              <Route path="/community" element={<CommunityFeedPage />} />
              <Route path="/arcade" element={<ArcadeHubPage />} />
              <Route path="/members" element={<MembersPage />} />
              <Route path="/clips" element={<ClipShowcasePage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/roster" element={<RosterPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected Member Routes */}
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />

              {/* Admin Route */}
              <Route path="/admin" element={<AdminMembersPage />} />

              {/* Fallback 404 */}
              <Route path="*" element={<Navigate to="/community" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;