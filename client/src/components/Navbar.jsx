import React from 'react';
import { Bot, PlusCircle, LayoutDashboard, Sparkles } from 'lucide-react';

export default function Navbar({ currentView, onNavigate }) {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <a
          href="#dashboard"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('dashboard');
          }}
          className="brand-link"
        >
          <div className="brand-icon">
            <Bot size={22} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span>Zenith Support</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              AI-Powered Resolution Engine
            </span>
          </div>
        </a>

        <nav className="nav-links">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`nav-btn ${currentView === 'dashboard' ? 'nav-btn-ghost active' : 'nav-btn-ghost'}`}
          >
            <LayoutDashboard size={17} />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => onNavigate('new')}
            className={`nav-btn ${currentView === 'new' ? 'nav-btn-primary' : 'nav-btn-primary'}`}
          >
            <PlusCircle size={17} />
            <span>New Request</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
