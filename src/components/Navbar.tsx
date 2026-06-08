import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Leaf, Menu, X, Flame } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const initials = user?.displayName
    ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? 'U';
  const name = user?.displayName || user?.email?.split('@')[0] || 'User';

  return (
    <nav className="sticky top-0 z-50" style={{ background: 'rgba(6,13,10,0.85)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(212,160,23,0.2), rgba(212,160,23,0.05))', border: '1px solid rgba(212,160,23,0.3)', boxShadow: '0 0 20px rgba(212,160,23,0.15)' }}>
              <Leaf className="w-4 h-4 text-gold-400" />
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="font-display text-xl text-white font-light">Macro</span>
              <span className="font-display text-xl text-gradient-gold font-light">Tracker</span>
            </div>
          </div>

          {/* Desktop right */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-sans"
                style={{ background: 'linear-gradient(135deg, rgba(212,160,23,0.3), rgba(212,160,23,0.1))', border: '1px solid rgba(212,160,23,0.3)', color: '#d4a017' }}>
                {initials}
              </div>
              <span className="text-white/50 text-sm font-sans">{name}</span>
            </div>
            <button onClick={logout}
              className="flex items-center gap-1.5 text-white/30 hover:text-white/70 transition-colors text-sm px-3 py-2 rounded-xl hover:bg-white/5">
              <LogOut className="w-4 h-4" />
              <span className="font-sans">Out</span>
            </button>
          </div>

          <button className="sm:hidden p-2 text-white/40 hover:text-white" onClick={() => setOpen(v => !v)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="sm:hidden px-4 pb-4 pt-2 border-t border-white/5 space-y-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/4">
            <div className="w-7 h-7 rounded-lg bg-gold-500/20 border border-gold-500/30 flex items-center justify-center text-gold-400 text-xs font-bold">{initials}</div>
            <span className="text-white/50 text-sm font-sans">{name}</span>
          </div>
          <button onClick={logout} className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm px-3 py-2 rounded-xl hover:bg-white/5 w-full">
            <LogOut className="w-4 h-4" /><span>Sign out</span>
          </button>
        </div>
      )}
    </nav>
  );
}
