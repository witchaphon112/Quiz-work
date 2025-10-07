import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
  type: string;
  confirmed: boolean;
  token: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  token: string | null;
}

// สร้าง Context แบบแยก
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider ที่ไม่มีการ import จากไฟล์อื่น
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // โหลดจาก AsyncStorage (ถ้ามี)
  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const [savedToken, savedUser] = await Promise.all([
          AsyncStorage.getItem('token'),
          AsyncStorage.getItem('user'),
        ]);

        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Error loading auth data:', error);
      }
    };

    loadAuthData();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // ใช้ fetch โดยตรงเพื่อหลีกเลี่ยง import จาก api.ts
      const API_BASE_URL = 'https://cis.kku.ac.th/api/classroom';
      const API_KEY = '740c059a2ce3c0aa0af32497ac1446121ee6e42f44d06bdb1dd937650b5d1bfd';
      
      const response = await fetch(`${API_BASE_URL}/signin`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'x-api-key': API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const data = await response.json();
      
      if (data.data && data.data.token) {
        setUser(data.data);
        setToken(data.data.token);

        // บันทึกลง AsyncStorage (ไม่ block UI)
        AsyncStorage.setItem('token', data.data.token).catch(() => {});
        AsyncStorage.setItem('user', JSON.stringify(data.data)).catch(() => {});

        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    // ลบค่าจาก AsyncStorage แบบไม่รอผล
    AsyncStorage.removeItem('token').catch(() => {});
    AsyncStorage.removeItem('user').catch(() => {});
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook สำหรับใช้ AuthContext
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}