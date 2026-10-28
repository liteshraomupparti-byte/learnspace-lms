import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      await resetPassword(email);
      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send reset link.');
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
          Reset your password
        </h1>
        <p className="mt-2 text-sm text-[#65748b]">
          Enter your registered email and we'll send you instructions to reset your password.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-[21px] shadow-sm border border-[#d2dce9]">
          {submitted ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-[#101827] mb-1">Check your inbox</h3>
              <p className="text-xs text-[#65748b] mb-6 leading-relaxed">
                A password reset link has been dispatched to <strong className="text-[#101827]">{email}</strong>.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[#2463eb] text-white text-sm font-semibold rounded-xl hover:bg-[#1d4fd8] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Login</span>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#34435a] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-[#8b9bb0] absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#d2dce9] text-sm text-[#101827] placeholder-[#8b9bb0] focus:ring-2 focus:ring-[#93baff] focus:border-[#2463eb]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 bg-[#2463eb] text-white text-sm font-semibold rounded-xl hover:bg-[#1d4fd8] transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {loading ? 'Sending link...' : 'Send Reset Link'}
              </button>

              <div className="pt-2 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2463eb] hover:underline"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to login</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
