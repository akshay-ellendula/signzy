import React from 'react';
import { Bell, Settings } from 'lucide-react';

const Header = () => {
  return (
    <header className="header">
      <div style={{ flex: 1 }}>
        {/* Breadcrumbs or Title could go here */}
      </div>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <Bell size={20} />
        </button>
        <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <Settings size={20} />
        </button>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
          A
        </div>
      </div>
    </header>
  );
};

export default Header;
