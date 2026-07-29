'use client';

import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Heart, Cake, Sparkles, LogOut, Calendar } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import ParticleBackground from '@/components/ParticleBackground';

function HomeContent() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) return null;

  // 计算生日信息
  const today = new Date();
  const birthday = new Date(user.birthday);
  const nextBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
  if (nextBirthday < today) {
    nextBirthday.setFullYear(today.getFullYear() + 1);
  }
  const daysUntilBirthday = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 粒子背景 */}
      <ParticleBackground />

      {/* 内容层 */}
      <div className="relative z-10 p-4 md:p-8">
        {/* 顶部导航 */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-12 h-12 rounded-full bg-gradient-love flex items-center justify-center text-2xl shadow-love"
            >
              {user.avatar}
            </motion.div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">你好，{user.name}</h1>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                生日: {user.birthday}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="p-3 rounded-full glass hover:bg-white/40 transition-all"
              title="退出登录"
            >
              <LogOut className="w-5 h-5 text-gray-600" />
            </motion.button>
          </div>
        </motion.div>

        {/* 主内容区 */}
        <div className="max-w-4xl mx-auto">
          {/* 欢迎横幅 */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-3xl p-6 mb-8 text-center"
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block text-5xl mb-3"
            >
              💕
            </motion.div>
            <h2 className="text-2xl md:text-3xl font-bold text-gradient-love mb-2">
              欢迎回来，{user.name}！
            </h2>
            <p className="text-gray-600">
              {daysUntilBirthday <= 30 
                ? `距离你的生日还有 ${daysUntilBirthday} 天`
                : `祝你每一天都充满幸福与美好`
              }
            </p>
          </motion.div>

          {/* 功能卡片 */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* 表白卡片 */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.02, y: -4 }}
              onClick={() => router.push('/confession')}
              className="glass-card rounded-3xl p-6 cursor-pointer group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-300/30 rounded-full -translate-y-16 -translate-x-16 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-love shadow-love mb-4"
                >
                  <Heart className="w-8 h-8 text-white fill-current" />
                </motion.div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">表白页面</h3>
                <p className="text-gray-600 mb-4">
                  说出你心中最想说的话，让爱意在此刻绽放
                </p>
                <div className="flex items-center text-pink-500 font-medium">
                  <Sparkles className="w-4 h-4 mr-2" />
                  进入表白 →
                </div>
              </div>
            </motion.div>

            {/* 生日祝福卡片 */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.02, y: -4 }}
              onClick={() => router.push('/birthday')}
              className="glass-card rounded-3xl p-6 cursor-pointer group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-300/30 rounded-full -translate-y-16 -translate-x-16 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-dream shadow-love mb-4"
                >
                  <Cake className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">生日祝贺</h3>
                <p className="text-gray-600 mb-4">
                  {daysUntilBirthday <= 30 
                    ? `还有 ${daysUntilBirthday} 天就是你的生日啦！` 
                    : '为你准备了特别的生日祝福'
                  }
                </p>
                <div className="flex items-center text-purple-500 font-medium">
                  <Sparkles className="w-4 h-4 mr-2" />
                  查看祝福 →
                </div>
              </div>
            </motion.div>
          </div>

          {/* 底部温馨提示 */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center"
          >
            <p className="text-gray-500 text-sm">
              <Heart className="w-4 h-4 inline text-pink-400 fill-current" />
              每一个瞬间都是爱的见证
              <Heart className="w-4 h-4 inline text-pink-400 fill-current" />
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <ProtectedRoute>
      <HomeContent />
    </ProtectedRoute>
  );
}
