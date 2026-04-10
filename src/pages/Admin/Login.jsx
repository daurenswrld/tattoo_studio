import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, ChevronRight, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import './Admin.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      navigate('/admin/dashboard');
    } catch (err) {
      setError('Неверный логин или пароль');
      console.error('Login error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="container">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="admin-login__card"
        >
          <button className="admin-login__back" onClick={() => navigate('/')}>
            <ArrowLeft size={18} /> Вернуться на сайт
          </button>
          
          <div className="admin-login__header">
            <h1 className="admin-login__title">Вход в систему</h1>
            <p className="admin-login__subtitle">Введите данные для управления записями</p>
          </div>

          <form className="admin-login__form" onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label"><Mail size={14} /> Email</label>
              <input 
                type="email" 
                className="form-input" 
                placeholder="master@studio.com"
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label"><Lock size={14} /> Пароль</label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="••••••••"
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <p className="admin-login__error">{error}</p>}

            <button 
              type="submit" 
              className="button button--primary admin-login__submit" 
              disabled={loading}
            >
              {loading ? 'Вход...' : (
                <>Войти <ChevronRight size={18} /></>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
