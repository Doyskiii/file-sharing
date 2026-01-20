'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/use-session";
import api from "@/lib/api";

export const FormLogin = () => {
  const router = useRouter();
  const { login } = useSession();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register fields
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await api.post('/login', {
        email: loginEmail,
        password: loginPassword
      });

      // Use session hook to handle login
      login(response.data.token, response.data.user);

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await api.post('/register', {
        username: registerUsername,
        email: registerEmail,
        password: registerPassword
      });

      // Auto-login after successful registration
      login(response.data.token, response.data.user);

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Tab Navigation */}
      <div className="flex border-b border-zinc-700 mb-6">
        <button
          onClick={() => setActiveTab('login')}
          className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
            activeTab === 'login'
              ? 'text-white border-b-2 border-blue-500'
              : 'text-zinc-400 hover:text-zinc-300'
          }`}
        >
          Login
        </button>
        <button
          onClick={() => setActiveTab('register')}
          className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
            activeTab === 'register'
              ? 'text-white border-b-2 border-blue-500'
              : 'text-zinc-400 hover:text-zinc-300'
          }`}
        >
          Sign Up
        </button>
      </div>

      {error && (
        <div className="text-sm text-red-400 border border-red-500/50 p-3 rounded-lg mb-4 bg-red-500/10">
          {error}
        </div>
      )}

      {success && (
        <div className="text-sm text-green-400 border border-green-500/50 p-3 rounded-lg mb-4 bg-green-500/10">
          {success}
        </div>
      )}

      {/* Login Form */}
      {activeTab === 'login' && (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm mb-2 text-zinc-300">Email</label>
            <input
              type="email"
              className="w-full bg-zinc-800/50 border border-zinc-600 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-2 text-zinc-300">Password</label>
            <input
              type="password"
              className="w-full bg-zinc-800/50 border border-zinc-600 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-800"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      )}

      {/* Register Form */}
      {activeTab === 'register' && (
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm mb-2 text-zinc-300">Username</label>
            <input
              type="text"
              className="w-full bg-zinc-800/50 border border-zinc-600 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              value={registerUsername}
              onChange={(e) => setRegisterUsername(e.target.value)}
              placeholder="Choose a username"
              required
              minLength={3}
              maxLength={50}
            />
          </div>

          <div>
            <label className="block text-sm mb-2 text-zinc-300">Email</label>
            <input
              type="email"
              className="w-full bg-zinc-800/50 border border-zinc-600 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              value={registerEmail}
              onChange={(e) => setRegisterEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-2 text-zinc-300">Password</label>
            <input
              type="password"
              className="w-full bg-zinc-800/50 border border-zinc-600 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              value={registerPassword}
              onChange={(e) => setRegisterPassword(e.target.value)}
              placeholder="Create a password (min 8 chars)"
              required
              minLength={8}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:opacity-50 text-white py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-zinc-800"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
      )}
    </div>
  );
};