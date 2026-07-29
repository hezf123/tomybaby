'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, login as mockLogin, getCurrentUser, setCurrentUser, clearCurrentUser } from './mockData';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化时从sessionStorage恢复用户
  useEffect(() => {
    const initUser = getCurrentUser();
    setUser(initUser);
    setIsLoading(false);
  }, []);

  // 登录
  const login = useCallback(async (username: string, password: string) => {
    setIsLoading(true);
    try {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const result = mockLogin(username, password);
      
      if (result.success && result.user) {
        setCurrentUser(result.user);
        setUser(result.user);
        return { success: true };
      }
      
      return { success: false, message: result.message };
    } catch (error) {
      return { success: false, message: '登录失败，请重试' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 登出
  const logout = useCallback(() => {
    clearCurrentUser();
    setUser(null);
  }, []);

  // 更新用户信息
  const updateUser = useCallback((updatedUser: User) => {
    setCurrentUser(updatedUser);
    setUser(updatedUser);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
