import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Clock, RefreshCw } from 'lucide-react';

export default function EmailVerificationPage() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(600);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = location.state?.email;

  useEffect(() => {
    if (emailFromState) {
      setEmail(emailFromState);
    } else {
      navigate('/user-registration');
    }
  }, [emailFromState, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setError('Please enter complete 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:8000/api/v1/verify/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: fullCode })
      });

      const data = await res.json();

      if (data.success) {
        setSuccess('Email verified successfully!');
        setTimeout(() => {
          navigate('/user-login');
        }, 2000);
      } else {
        setError(data.message || 'Verification failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:8000/api/v1/verify/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (data.success) {
        setTimer(600);
        setCanResend(false);
        setSuccess('New verification code sent!');
        setCode(['', '', '', '', '', '']);
      } else {
        setError(data.message || 'Failed to resend code');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 text-white rounded-2xl mb-4">
            <span className="text-2xl font-bold">الدين</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Verify Your Email</h2>
          <p className="text-gray-600 mt-2">We've sent a verification code to</p>
          <p className="font-semibold text-emerald-600">{email}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg text-sm">
              {success}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
              Enter 6-digit verification code
            </label>
            <div className="flex justify-center gap-2">
              {code.map((digit, index) => (
                <input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-2xl font-bold border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                  disabled={loading}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm mb-6">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className={timer < 60 ? 'text-red-500' : 'text-gray-600'}>
              Code expires in: {formatTime(timer)}
            </span>
          </div>

          <button
            onClick={handleVerify}
            disabled={loading || code.join('').length !== 6}
            className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            <Shield className="w-4 h-4" />
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>

          <button
            onClick={handleResend}
            disabled={!canResend || loading}
            className="w-full py-2 text-emerald-600 hover:text-emerald-700 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Resend Code
          </button>

          <p className="mt-6 text-center text-sm text-gray-500">
            <button
              onClick={() => navigate('/user-login')}
              className="text-emerald-600 hover:text-emerald-700"
            >
              Back to Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}