import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, KeyRound, ArrowRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast'; // <--- Import toast

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/forgot-password', { email });
      setMessage(response.data.message || 'Reset code sent to your email.');
      if (response.data.debug_code) {
        console.log("Debug Reset Code:", response.data.debug_code);
      }
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Email not found or failed to send code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== passwordConfirmation) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/reset-password', {
        email,
        code,
        password,
        password_confirmation: passwordConfirmation
      });

      // <--- Replaced native alert() with sleek react-hot-toast notification --->
      toast.success(response.data.message || 'Password reset successfully!');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formCard}>
        <div style={styles.brandHeader}>
          <h1 style={styles.title}>Reset Password</h1>
          <p style={styles.subtitle}>
            {step === 1 ? 'Enter your registered email to receive a verification code.' : 'Enter the code sent to your email and set a new password.'}
          </p>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}
        {message && <div style={styles.successBox}>{message}</div>}

        {step === 1 ? (
          <form onSubmit={handleRequestCode} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <div style={styles.inputContainer}>
                <Mail size={18} color="#94a3b8" style={styles.inputIcon} />
                <input 
                  type="email" 
                  required 
                  style={styles.inputField} 
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} style={styles.submitBtn}>
              {loading ? 'Sending Code...' : 'Send Reset Code'} <ArrowRight size={18} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Verification Code</label>
              <div style={styles.inputContainer}>
                <KeyRound size={18} color="#94a3b8" style={styles.inputIcon} />
                <input 
                  type="text" 
                  required 
                  style={styles.inputField} 
                  placeholder="Enter 6-digit code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>New Password</label>
              <div style={styles.inputContainer}>
                <Lock size={18} color="#94a3b8" style={styles.inputIcon} />
                <input 
                  type="password" 
                  required 
                  style={styles.inputField} 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Confirm New Password</label>
              <div style={styles.inputContainer}>
                <Lock size={18} color="#94a3b8" style={styles.inputIcon} />
                <input 
                  type="password" 
                  required 
                  style={styles.inputField} 
                  placeholder="••••••••"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} style={styles.submitBtn}>
              {loading ? 'Updating Password...' : 'Reset Password'} <CheckCircle2 size={18} />
            </button>
          </form>
        )}

        <div style={styles.footerText}>
          <Link to="/" style={styles.backLink}>Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', minHeight: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', fontFamily: "'Inter', sans-serif" },
  formCard: { backgroundColor: '#fff', padding: '40px', borderRadius: '24px', width: '100%', maxWidth: '440px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' },
  brandHeader: { marginBottom: '25px', textAlign: 'center' },
  title: { fontSize: '1.75rem', fontWeight: '900', color: '#0f172a', margin: '0 0 8px 0' },
  subtitle: { color: '#64748b', fontSize: '0.9rem', lineHeight: '1.4' },
  errorBox: { backgroundColor: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '600', marginBottom: '20px' },
  successBox: { backgroundColor: '#d1fae5', color: '#065f46', padding: '12px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '600', marginBottom: '20px' },
  form: { display: 'flex', flexDirection: 'column', gap: '18px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase' },
  inputContainer: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: '16px' },
  inputField: { width: '100%', padding: '14px 16px 14px 48px', borderRadius: '12px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' },
  submitBtn: { backgroundColor: '#0f172a', color: '#fff', border: 'none', padding: '16px', borderRadius: '12px', fontWeight: 'bold', fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '10px' },
  footerText: { textAlign: 'center', marginTop: '25px' },
  backLink: { color: '#7c3aed', fontWeight: 'bold', fontSize: '0.9rem', textDecoration: 'none' }
};

export default ForgotPassword;