import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import IssueCards from './components/IssueCards';
import Footer from './components/Footer';
import Login from './components/Login';
import Admin from './components/Admin';
import FieldWorker from './components/FieldWorker';
import WardEngineer from './components/WardEngineer';
import ZoneOfficer from './components/ZoneOfficer';
import ReportIssue from './components/ReportIssue';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

const AppLayout = () => (
  <div className="app-container">
    <Navbar />
    <HeroSection />
    <IssueCards />
    <Footer />
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Public route */}
        <Route path="/" element={<Login />} />

        {/* Citizen routes */}
        <Route path="/app" element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        } />
        <Route path="/app/report" element={
          <ProtectedRoute>
            <ReportIssue />
          </ProtectedRoute>
        } />

        {/* Staff-only routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Admin />
          </ProtectedRoute>
        } />
        <Route path="/field-worker" element={
          <ProtectedRoute allowedRoles={['field_worker']}>
            <FieldWorker />
          </ProtectedRoute>
        } />
        <Route path="/ward-engineer" element={
          <ProtectedRoute allowedRoles={['ward_engineer']}>
            <WardEngineer />
          </ProtectedRoute>
        } />
        <Route path="/zone-officer" element={
          <ProtectedRoute allowedRoles={['zone_officer']}>
            <ZoneOfficer />
          </ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
