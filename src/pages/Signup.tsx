import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function Signup() {
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true); setError('');
    try { await signup(email, password, name); }
    catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      setError(msg.includes('email-already-in-use') ? 'An account with this email already exists.' : 'Sign up failed. Please try again.');
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-app flex items-center justify-center p-4">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, rgba(6,78,59,0.8) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, rgba(212,160,23,0.4) 0%, transparent 70%)' }} />
      </div>

      <div className="w-full max-w-sm relative opacity-0 animate-scale-in" style={{ animationFillMode: 'forwards' }}>
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl items-center justify-center mb-5"
            style={{ background: 'linear-gradient(135deg, rgba(212,160,23,0.2), rgba(212,160,23,0.05))', border: '1px solid rgba(212,160,23,0.3)', boxShadow: '0 0 40px rgba(212,160,23,0.15)' }}>
            <Leaf className="w-7 h-7 text-gold-400" />
          </div>
          <h1 className="font-display text-4xl font-light tracking-wide">
            <span className="text-white">Macro</span><span className="text-gradient-gold">Tracker</span>
          </h1>
          <p className="text-white/25 text-sm font-sans mt-2">Start your nutrition journey</p>
        </div>

        <div className="rounded-3xl p-7" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 24px 64px rgba(0,0,0,0.4)' }}>
          <h2 className="font-display text-2xl text-white font-light mb-1">Create Account</h2>
          <p className="text-white/30 text-sm font-sans mb-6">Free forever to get started</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-xs">Your Name</label>
              <input className="input-dark" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="David" required />
            </div>
            <div>
              <label className="label-xs">Email</label>
              <input className="input-dark" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required />
            </div>
            <div>
              <label className="label-xs">Password</label>
              <div className="relative">
                <input className="input-dark pr-12" type={showPw ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" autoComplete="new-password" required />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="label-xs">Confirm Password</label>
              <input className="input-dark" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Re-enter password" required />
            </div>

            {error && <p className="text-red-400 text-sm bg-red-500/8 border border-red-500/15 rounded-2xl px-4 py-3 font-sans">{error}</p>}

            <button type="submit" disabled={loading}
              className="btn-gold w-full flex items-center justify-center gap-2 disabled:opacity-50 mt-2 py-3.5">
              {loading
                ? <div className="w-4 h-4 border-2 border-emerald-950/30 border-t-emerald-950 rounded-full animate-spin" />
                : <><span>Create Account</span><ArrowRight className="w-4 h-4" /></>
              }
            </button>
          </form>
        </div>

        <p className="text-center text-white/25 text-sm font-sans mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-gold-400 hover:text-gold-300 font-semibold transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
