import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const SignupPage: React.FC = () => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { currentUser, register, loginWithGoogle, isConfigured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const redirectQuery = searchParams.get('redirect');
  const from = redirectQuery || (location.state as any)?.from?.pathname || '/';

  const performRedirect = (target: string) => {
    if (target.startsWith('http://') || target.startsWith('https://')) {
      window.location.href = target;
    } else {
      navigate(target, { replace: true });
    }
  };

  useEffect(() => {
    if (currentUser) {
      performRedirect(from);
    }
  }, [currentUser, from]);

  const mapAuthError = (err: any) => {
    const code = err.code || err.message || '';
    if (code.includes('unauthorized-domain')) {
      return 'Domain not authorized in Firebase Console! Go to Firebase Console > Authentication > Settings > Authorized Domains, and add your domain (e.g., localhost and 127.0.0.1).';
    }
    if (code.includes('popup-closed-by-user')) {
      return 'The Google sign-in window was closed before completing.';
    }
    if (code.includes('popup-blocked')) {
      return 'Sign-in popup was blocked by your browser. Please allow popups for this site.';
    }
    if (code.includes('email-already-in-use')) {
      return 'An account with this email address already exists. Please log in.';
    }
    if (code.includes('weak-password')) {
      return 'Password should be at least 6 characters.';
    }
    if (code.includes('invalid-email')) {
      return 'Please enter a valid email address.';
    }
    return err.message || 'Registration failed. Please try again.';
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await loginWithGoogle();
      performRedirect(from);
    } catch (err: any) {
      setErrorMsg(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!displayName.trim() || !email || !password) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await register(email, password, displayName.trim());
      performRedirect(from);
    } catch (err: any) {
      setErrorMsg(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#f7f9fc] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand */}
        <div className="inline-flex items-center justify-center mb-5">
          <img
            src="/learnspace-logo.png"
            alt="LearnSpace — Your Learning Portal"
            className="h-12 sm:h-14 w-auto object-contain select-none"
          />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-[#101827]">
          Create your student account
        </h1>
        <p className="mt-2 text-sm text-[#65748b]">
          Start your learning journey with structured courses and progress tracking.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-[21px] shadow-sm border border-[#d2dce9]">
          {!isConfigured && (
            <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">Firebase environment setup needed:</strong>
                Configure your Firebase keys in <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">.env</code> to activate live authentication.
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#34435a] mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-[#8b9bb0] absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Alex Johnson"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#d2dce9] text-sm text-[#101827] placeholder-[#8b9bb0] focus:ring-2 focus:ring-[#93baff] focus:border-[#2463eb]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#34435a] mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-[#8b9bb0] absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#d2dce9] text-sm text-[#101827] placeholder-[#8b9bb0] focus:ring-2 focus:ring-[#93baff] focus:border-[#2463eb]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#34435a] mb-1.5">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-[#8b9bb0] absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#d2dce9] text-sm text-[#101827] placeholder-[#8b9bb0] focus:ring-2 focus:ring-[#93baff] focus:border-[#2463eb]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#34435a] mb-1.5">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-[#8b9bb0] absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#d2dce9] text-sm text-[#101827] placeholder-[#8b9bb0] focus:ring-2 focus:ring-[#93baff] focus:border-[#2463eb]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-[#2463eb] text-white text-sm font-semibold rounded-xl hover:bg-[#1d4fd8] transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {loading ? (
                <span>Creating account...</span>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#d2dce9]" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-[#65748b]">Or sign up with</span>
              </div>
            </div>

            <button
              onClick={handleGoogleSignUp}
              disabled={loading}
              className="w-full mt-4 py-2.5 px-4 border border-[#d2dce9] rounded-xl text-sm font-medium text-[#33445d] hover:bg-[#f8faff] transition-colors flex items-center justify-center gap-3"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Google Account</span>
            </button>
          </div>

          <div className="mt-6 text-center text-xs text-[#65748b]">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#2463eb] hover:underline">
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
