import React, { useState } from 'react';
import LandingPage from './pages/LandingPage.jsx';
import AdminSecret from './pages/AdminSecret.jsx';

export default function App() {
  const [page, setPage] = useState('landing'); // 'landing' or 'admin'

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      
      {/* Premium Glassmorphic Glowing Background circles */}
      <div className="bg-glow-container">
        <div className="bg-glow-ball-1"></div>
        <div className="bg-glow-ball-2"></div>
      </div>

      {/* Page Routing */}
      {page === 'landing' ? (
        <LandingPage onNavigateToAdmin={() => setPage('admin')} />
      ) : (
        <AdminSecret onNavigateHome={() => setPage('landing')} />
      )}

    </div>
  );
}
