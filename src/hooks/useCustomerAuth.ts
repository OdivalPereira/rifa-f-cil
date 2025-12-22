import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

const TOKEN_KEY = 'customer_auth_token';
const PHONE_KEY = 'customer_auth_phone';

interface AuthResult {
  success: boolean;
  error?: string;
}

export function useCustomerAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [phone, setPhone] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedPhone = localStorage.getItem(PHONE_KEY);

    if (storedToken && storedPhone) {
      // Verify token is still valid
      verifyToken(storedToken).then((valid) => {
        if (valid) {
          setToken(storedToken);
          setPhone(storedPhone);
          setIsAuthenticated(true);
        } else {
          // Clear invalid token
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(PHONE_KEY);
        }
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyToken = async (tokenToVerify: string): Promise<boolean> => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/customer-auth?action=verify`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ token: tokenToVerify }),
        }
      );

      const result = await response.json();
      return result.valid === true;
    } catch {
      return false;
    }
  };

  const register = useCallback(async (phoneNumber: string, pin: string): Promise<AuthResult> => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/customer-auth?action=register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ phone: phoneNumber, pin }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Erro ao criar conta' };
      }

      // Store token
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(PHONE_KEY, data.phone);
      setToken(data.token);
      setPhone(data.phone);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: 'Erro de conexão' };
    }
  }, []);

  const login = useCallback(async (phoneNumber: string, pin: string): Promise<AuthResult> => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/customer-auth?action=login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ phone: phoneNumber, pin }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Erro ao entrar' };
      }

      // Store token
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(PHONE_KEY, data.phone);
      setToken(data.token);
      setPhone(data.phone);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Erro de conexão' };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(PHONE_KEY);
    setToken(null);
    setPhone(null);
    setIsAuthenticated(false);
  }, []);

  return {
    isAuthenticated,
    phone,
    token,
    isLoading,
    register,
    login,
    logout,
  };
}
