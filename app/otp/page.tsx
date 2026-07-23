'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

export default function OtpPage() {
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [error, setError] = useState('');
  const [otpTarget, setOtpTarget] = useState<{ type: string; target: string } | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Read OTP target from localStorage
    const stored = localStorage.getItem('xpress_otp_target');
    if (!stored) {
      router.replace('/login');
      return;
    }
    setOtpTarget(JSON.parse(stored));
  }, [router]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (text: string, index: number) => {
    const clean = text.replace(/[^0-9]/g, '').slice(0, 1);
    const newOtp = [...otp];
    newOtp[index] = clean;
    setOtp(newOtp);
    setError('');

    // Auto focus next
    if (clean && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
    }
  };

  // ✅ Check Supabase for existing profile
  const findExistingProfile = async (): Promise<any | null> => {
    if (!otpTarget) return null;
    try {
      const column = otpTarget.type === 'phone' ? 'phone' : 'email';
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq(column, otpTarget.target)
        .limit(1)
        .maybeSingle();

      if (data && !error) return data;
      return null;
    } catch (e) {
      console.warn('Profile lookup failed:', e);
      return null;
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // ✅ Dummy OTP for testing
      if (code === '123456') {
        const existingProfile = await findExistingProfile();

        let sessionUser;

        if (existingProfile) {
          // ✅ Returning user — save prefill data
          localStorage.setItem('xpress_prefill', JSON.stringify({
            name: existingProfile.name || '',
            phone: existingProfile.phone || (otpTarget?.type === 'phone' ? otpTarget.target : ''),
            email: existingProfile.email || (otpTarget?.type === 'email' ? otpTarget.target : ''),
          }));

          sessionUser = {
            id: existingProfile.id,
            name: existingProfile.name || null,
            email: existingProfile.email || (otpTarget?.type === 'email' ? otpTarget.target : null),
            phone: null, // ✅ null forces CompleteProfile for verification
          };
        } else {
          // ✅ New user
          localStorage.setItem('xpress_prefill', JSON.stringify({
            name: '',
            phone: otpTarget?.type === 'phone' ? otpTarget.target : '',
            email: otpTarget?.type === 'email' ? otpTarget.target : '',
          }));

          const mockId = 'usr_' + Math.random().toString(36).substring(2, 11);
          sessionUser = {
            id: mockId,
            name: null,
            email: otpTarget?.type === 'email' ? otpTarget.target : null,
            phone: null,
          };
        }

        // Clear OTP target
        localStorage.removeItem('xpress_otp_target');

        await login(sessionUser);
        router.replace('/complete-profile');
        return;
      }

      setError('Invalid OTP. Use 123456 for testing.');

    } catch (e) {
      setError('Verification failed. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    if (timer > 0) return;
    setTimer(30);
    setOtp(['', '', '', '', '', '']);
    setError('');
    inputRefs.current[0]?.focus();
  };

  if (!otpTarget) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-gray-900 mb-2">
              Verify Account
            </h1>
            <p className="text-gray-500 text-sm">
              Enter the 6-digit code sent to
            </p>
            <p className="text-gray-900 font-bold text-base mt-1">
              {otpTarget.target}
            </p>
          </div>

          {/* OTP Input Boxes */}
          <div className="flex justify-between gap-2 mb-8">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="tel"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                autoFocus={index === 0}
                className={`w-12 h-14 text-center text-xl font-black border-2 rounded-xl outline-none transition-all ${
                  digit
                    ? 'border-red-500 bg-white text-gray-900'
                    : 'border-gray-200 bg-gray-50 text-gray-900'
                } focus:border-red-500 focus:ring-2 focus:ring-red-100`}
              />
            ))}
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-500 text-sm font-medium text-center mb-4">
              {error}
            </p>
          )}

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={isLoading}
            className={`w-full h-14 rounded-xl font-bold text-white text-base transition-all ${
              isLoading
                ? 'bg-red-300 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 active:scale-95'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Verifying...
              </span>
            ) : (
              'Verify & Continue'
            )}
          </button>

          {/* Resend Timer */}
          <div className="text-center mt-6">
            {timer > 0 ? (
              <p className="text-gray-400 text-sm">
                Resend OTP in{' '}
                <span className="text-red-600 font-bold">{timer}s</span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                className="text-red-600 font-bold text-sm underline hover:text-red-700"
              >
                Resend OTP Code
              </button>
            )}
          </div>

          {/* Back to Login */}
          <div className="text-center mt-4">
            <button
              onClick={() => router.push('/login')}
              className="text-gray-400 text-sm hover:text-gray-600"
            >
              ← Back to Login
            </button>
          </div>

        </div>

        {/* Testing hint */}
        <p className="text-center text-gray-400 text-xs mt-4">
          💡 Use OTP <span className="font-bold text-gray-600">123456</span> for testing
        </p>
      </div>
    </div>
  );
}