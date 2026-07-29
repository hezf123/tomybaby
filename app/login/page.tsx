'use client';

import { useState, FormEvent } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!username.trim() || !password.trim()) {
      setError('请输入账号和密码');
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await login(username.trim(), password);
      if (result.success) {
        router.push('/');
      } else {
        setError(result.message || '登录失败');
      }
    } catch (err) {
      setError('登录失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-4xl opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          >
            {['💕', '💖', '🌸', '✨', '🌹'][Math.floor(Math.random() * 5)]}
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass-card rounded-3xl p-8 shadow-glow">
          {/* Logo和标题 */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-love shadow-love mb-4"
            >
              <Heart className="w-10 h-10 text-white fill-current" />
            </motion.div>
            <h1 className="text-3xl font-bold text-gradient-love mb-2">
              To You
            </h1>
            <p className="text-gray-600 flex items-center justify-center gap-1">
              <Sparkles className="w-4 h-4 text-pink-400" />
              专属你的浪漫空间
              <Sparkles className="w-4 h-4 text-pink-400" />
            </p>
          </motion.div>

          {/* 登录表单 */}
          <motion.form
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                账号
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入账号"
                className="input-love"
                disabled={isSubmitting || isLoading}
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                密码
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                className="input-love"
                disabled={isSubmitting || isLoading}
                autoComplete="current-password"
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-red-100 border border-red-200 text-red-600 text-sm"
              >
                {error}
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting || isLoading}
              className="btn-love w-full flex items-center justify-center gap-2"
            >
              {isSubmitting || isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  登录中...
                </>
              ) : (
                <>
                  <Heart className="w-5 h-5" />
                  进入我的空间
                </>
              )}
            </motion.button>
          </motion.form>

          {/* 提示信息 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 text-center text-sm text-gray-500"
          >
          </motion.div>
        </div>

        {/* 底部装饰 */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-6 text-gray-500 text-sm"
        >
          Made with <Heart className="w-4 h-4 inline text-pink-500 fill-current" /> just for you
        </motion.p>
      </motion.div>
    </div>
  );
}
