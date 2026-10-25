import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoutes } from '../components/ProtectedRoutes';

import { CommunityFeedPage } from '../pages/CommunityFeedPage';
import { MembersPage } from '../pages/MembersPage';
import { RosterPage } from '../pages/RosterPage';
import { EventsPage } from '../pages/EventsPage';
import { LeaderboardPage } from '../pages/LeaderboardPage';
import { ClipShowcasePage } from '../pages/ClipShowcasePage';
import { PostDetailPage } from '../pages/PostDetailPage';
import { UserProfilePage } from '../pages/UserProfilePage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { SettingsPage } from '../pages/SettingsPage';
import { MessagesPage } from '../pages/MessagesPage';
import { NotificationsPage } from '../pages/NotificationsPage';

import { AdminMembersPage } from '../features/admin/pages/AdminMembersPage';

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Rute Publik */}
      <Route path="/" element={<Navigate to="/community" replace />} />
      <Route path="/community" element={<CommunityFeedPage />} />
      <Route path="/members" element={<MembersPage />} />
      <Route path="/roster" element={<RosterPage />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/leaderboard" element={<LeaderboardPage />} />
      <Route path="/clips" element={<ClipShowcasePage />} />
      <Route path="/post/:id" element={<PostDetailPage />} />
      <Route path="/user/:uid" element={<UserProfilePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Rute Member Terproteksi */}
      <Route element={<ProtectedRoutes />}>
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
      </Route>

      {/* Rute Admin Terproteksi */}
      <Route element={<ProtectedRoutes requireAdmin />}>
        <Route path="/admin" element={<AdminMembersPage />} />
        <Route path="/admin/settings" element={<AdminMembersPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/community" replace />} />
    </Routes>
  );
};