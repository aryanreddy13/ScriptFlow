import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function Login() {
  const { currentUser, loading, loginWithGoogle } = useAuth();
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && currentUser) {
      navigate('/dashboard', { replace: true });
    }
  }, [currentUser, loading, navigate]);

  const handleGoogleLogin = async () => {
    try {
      setError('');
      await loginWithGoogle();
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Google login failed:', err);
      setError(`Google login failed: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-brandBg px-4 py-10 text-brandFg sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-md flex-col gap-8 rounded border border-panelBorder bg-[#111111] p-8 shadow-xl">
        <div className="space-y-2 text-center">
          <img src="/logo.png" alt="ScriptFlow Logo" className="mx-auto h-14 w-14 rounded-lg object-cover" />
          <h1 className="text-3xl font-black tracking-tight text-[#EAEAEA]">ScriptFlow</h1>
          <p className="text-sm leading-6 text-[#D4D4D8]">
            Sign in with Google to access the backend automation dashboard.
          </p>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="inline-flex items-center justify-center rounded border border-panelBorder bg-[#0A0A0A] px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#EAEAEA] transition hover:border-brandAccent"
        >
          Sign in with Google
        </button>

        {error && <p className="text-sm text-[#EF4444]">{error}</p>}
      </div>
    </div>
  );
}
