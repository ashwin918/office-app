import React, { useState } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await API.post('/api/login', form);
      login(res.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>🏢</div>
          <h1 style={styles.title}>Office Task Manager</h1>
          <p style={styles.subtitle}>Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Username</label>
            <input style={styles.input} type="text" placeholder="Enter username"
              value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input style={styles.input} type="password" placeholder="Enter password"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          {error && <div style={styles.error}>⚠️ {error}</div>}
          <button style={loading ? { ...styles.btn, opacity: 0.7 } : styles.btn} type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div style={styles.hint}>
          <strong>Admin:</strong> username: <code>admin</code> / password: <code>admin</code>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e3a5f 0%, #2d6a9f 100%)', fontFamily: "'Inter', sans-serif" },
  card: { background: '#fff', borderRadius: 16, padding: '48px 40px', width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
  logo: { textAlign: 'center', marginBottom: 32 },
  logoIcon: { fontSize: 48, marginBottom: 8 },
  title: { margin: 0, fontSize: 24, fontWeight: 700, color: '#1e3a5f' },
  subtitle: { margin: '6px 0 0', color: '#666', fontSize: 14 },
  field: { marginBottom: 20 },
  label: { display: 'block', marginBottom: 6, fontWeight: 500, color: '#333', fontSize: 14 },
  input: { width: '100%', padding: '12px 14px', border: '2px solid #e0e0e0', borderRadius: 8, fontSize: 15, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' },
  error: { background: '#fff3f3', border: '1px solid #ffcccc', color: '#cc0000', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 14 },
  btn: { width: '100%', padding: '13px', background: 'linear-gradient(135deg, #1e3a5f, #2d6a9f)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
  hint: { marginTop: 24, padding: '12px 14px', background: '#f0f7ff', borderRadius: 8, fontSize: 13, color: '#444', textAlign: 'center' },
};