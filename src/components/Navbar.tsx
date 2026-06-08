import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Leaf, Menu, X } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = user?.displayName
    ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? 'U';

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5" style={{ background: 'rgba(2, 44, 34, 0.85)', backdropFilter: 'blur(20px)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gold-500/10 border border-gold-500/30 flex items-center justify-center">
              <Leaf className="w-4 h-4 text-gold-400" />
            </div>
            <div>
              <span className="font-display text-lg text-white tracking-wide">Macro</span>
              <span className="font-display text-lg text-gold-400 tracking-wide">Tracker</span>
            </div>
          </div>

          {/* Desktop right */}
          <div className="hidden sm:flex items-center gap-4">
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-white/5 border border-white/8">
              <div className="w-7 h-7 rounded-lg bg-gold-500/20 border border-gold-500/30 flex items-center justify-center text-gold-400 text-xs font-semibold font-sans">
                {initials}
              </div>
              <span className="text-white/60 text-sm font-sans">
                {user?.displayName || user?.email?.split('@')[0]}
              </span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 text-white/40 hover:text-white/80 transition-colors text-sm font-sans px-3 py-1.5 rounded-xl hover:bg-white/5"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign out</span>
            </button>
          </div>

          {/* Mobile hamburger */}
          <button className="sm:hidden text-white/60 hover:text-white p-2" onClick={() => setMenuOpen(v => !v)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden px-4 pb-4 border-t border-white/5 mt-0">
          <div className="pt-4 flex flex-col gap-3">
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5">
              <div className="w-7 h-7 rounded-lg bg-gold-500/20 border border-gold-500/30 flex items-center justify-center text-gold-400 text-xs font-semibold">
                {initials}
              </div>
              <span className="text-white/60 text-sm">{user?.displayName || user?.email}</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 text-white/40 hover:text-white/80 transition-colors text-sm px-3 py-2 rounded-xl hover:bg-white/5 w-full text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
