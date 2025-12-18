import React, { useState } from 'react';
import { register as registerApi } from './api';

type RegisterPageProps = {
  onRegistered: () => void;
  onSwitchToLogin: () => void;
};

const RegisterPage: React.FC<RegisterPageProps> = ({
  onRegistered,
  onSwitchToLogin,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await registerApi(email, password, name);
      setSuccess('Successfully registered'); // show success text
      onRegistered(); // keep logging in / switching to app
    } catch (err: any) {
      setError(err?.message ?? 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-300 via-yellow-200 to-yellow-300 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md px-10 py-8">
        <div className="flex flex-col items-center mb-6">
          <div className="h-12 w-12 rounded-full bg-yellow-400 flex items-center justify-center font-semibold text-sm text-gray-900">
            TM
          </div>
          <h1 className="mt-3 text-xl font-semibold text-gray-900">
            Create account
          </h1>
          <p className="mt-1 text-xs text-gray-500">
            Sign up to start using the collaborative task dashboard
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1 text-sm">
            <label className="block text-gray-700">Name</label>
            <input
              type="text"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-yellow-300"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1 text-sm">
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-yellow-300"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1 text-sm">
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-yellow-300"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="text-xs text-red-500">
              {error}
            </p>
          )}

          {success && (
            <p className="text-xs text-green-600">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-full bg-yellow-400 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-yellow-500 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing up…' : 'Sign up'}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-gray-500">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-semibold text-gray-800 underline"
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
};

export { RegisterPage };