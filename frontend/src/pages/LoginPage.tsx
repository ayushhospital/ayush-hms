import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password) {
      setError('Please enter both username and password');
      return;
    }
    setBusy(true);
    try {
      await login(username.trim(), password);
      navigate('/', { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const inputCls = 'w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white';

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* Branding panel (desktop) */}
      <div className="hidden lg:flex flex-col justify-between w-[46%] bg-blue-950 text-white p-12">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/40">
            <span className="text-white text-base font-bold tracking-tight">AH</span>
          </div>
          <div>
            <h1 className="text-white text-lg font-bold m-0 tracking-tight">Ayush HMS</h1>
            <p className="text-slate-400 text-xs m-0 mt-0.5">Hospital Management System</p>
          </div>
        </div>
        <div>
          <p className="text-2xl font-bold leading-snug tracking-tight m-0">
            Manage outpatient, inpatient &amp; reports<br />
            from one secure place.
          </p>
          <p className="text-slate-400 text-sm mt-3 leading-relaxed">
            Secured role-based access — super users control who can access
            OPD, IPD and Reports modules.
          </p>
        </div>
        <p className="text-slate-500 text-xs">&copy; {new Date().getFullYear()} Ayush Hospital</p>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <span className="text-white text-sm font-bold">AH</span>
            </div>
            <div>
              <h1 className="text-slate-900 text-base font-bold m-0">Ayush HMS</h1>
              <p className="text-slate-500 text-[11px] m-0">Hospital Management System</p>
            </div>
          </div>

          <h2 className="text-xl font-bold text-slate-900 m-0 tracking-tight">Sign in</h2>
          <p className="text-sm text-slate-500 mt-1 mb-6">Enter your credentials to continue</p>

          {error && (
            <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. kvsubbarao"
                autoFocus
                autoComplete="username"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className={inputCls}
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="w-full py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-[11px] text-slate-400 mt-6 text-center">
            Your access is limited to the modules granted by the administrator.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;