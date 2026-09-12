import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import SubmitRequest from './pages/SubmitRequest';
import RequestDetail from './pages/RequestDetail';
import { api } from './api/client';
import { AlertTriangle } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' | 'new' | 'detail'
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [healthInfo, setHealthInfo] = useState(null);

  useEffect(() => {
    // Check system health on startup
    api
      .getHealth()
      .then((data) => setHealthInfo(data))
      .catch((err) => {
        console.warn('Backend health check error (server might still be starting):', err.message);
      });
  }, []);

  const handleNavigate = (view, ticketId = null) => {
    setCurrentView(view);
    if (ticketId) {
      setSelectedTicketId(ticketId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectTicket = (id) => {
    setSelectedTicketId(id);
    setCurrentView('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isSupabaseMissing = healthInfo && healthInfo.environment && !healthInfo.environment.supabase_configured;
  const isGeminiMissing = healthInfo && healthInfo.environment && !healthInfo.environment.gemini_configured;

  return (
    <div className="app-container">
      <Navbar currentView={currentView} onNavigate={handleNavigate} />

      <main className="main-content">
        {(isSupabaseMissing || isGeminiMissing) && (
          <div className="alert alert-error" style={{ marginBottom: '24px' }}>
            <AlertTriangle size={20} style={{ flexShrink: 0 }} />
            <div>
              <strong>Setup Configuration Notice:</strong>
              <ul style={{ paddingLeft: '20px', marginTop: '4px' }}>
                {isSupabaseMissing && (
                  <li>
                    Supabase is not configured. Please set <code>SUPABASE_URL</code> and{' '}
                    <code>SUPABASE_SERVICE_ROLE_KEY</code> in your <code>.env</code> file.
                  </li>
                )}
                {isGeminiMissing && (
                  <li>
                    Google Gemini API key is not configured. Please set <code>GEMINI_API_KEY</code> in your{' '}
                    <code>.env</code> file.
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}

        {currentView === 'dashboard' && (
          <Dashboard
            onSelectTicket={handleSelectTicket}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'new' && (
          <SubmitRequest
            onTicketCreated={(ticket) => handleNavigate('detail', ticket.id)}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'detail' && (
          <RequestDetail
            ticketId={selectedTicketId}
            onBack={() => handleNavigate('dashboard')}
          />
        )}
      </main>
    </div>
  );
}
