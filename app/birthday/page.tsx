'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Cake, Gift, Star, Sparkles, Calendar, Heart } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import ParticleBackground from '@/components/ParticleBackground';
import RoseExplosion from '@/components/RoseExplosion';
import { useAuth } from '@/lib/AuthContext';

const birthdayWishes = [
  { emoji: '🎂', text: '愿你的生日充满甜蜜，生活充满温馨！' },
  { emoji: '🎁', text: '愿所有的礼物都是惊喜，所有的惊喜都是幸福！' },
  { emoji: '🎉', text: '愿你的每一天都像生日一样快乐和特别！' },
  { emoji: '🌟', text: '愿你永远是那颗最闪亮的星星！' },
  { emoji: '🌸', text: '愿你的人生如花绽放，绚烂无比！' },
  { emoji: '🍰', text: '愿岁月静好，时光温柔待你！' },
  { emoji: '💐', text: '愿每一天都充满阳光和希望！' },
  { emoji: '🎈', text: '愿你的愿望都能成真，梦想都能实现！' },
];

function BirthdayContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [daysUntil, setDaysUntil] = useState(0);
  const [age, setAge] = useState(0);
  const [wishIndex, setWishIndex] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isBirthday, setIsBirthday] = useState(false);

  useEffect(() => {
    if (!user) return;

    const today = new Date();
    const birthday = new Date(user.birthday);
    
    // 计算下一个生日
    let nextBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
    if (nextBirthday < today) {
      nextBirthday.setFullYear(today.getFullYear() + 1);
    }
    
    const days = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    setDaysUntil(days);
    
    // 计算年龄（以今年生日为准）
    let currentAge = today.getFullYear() - birthday.getFullYear();
    const hasHadBirthday = (today.getMonth() > birthday.getMonth()) || 
      (today.getMonth() === birthday.getMonth() && today.getDate() >= birthday.getDate());
    if (!hasHadBirthday) {
      currentAge--;
    }
    setAge(currentAge);
    
    // 检查今天是不是生日
    const isTodayBirthday = today.getMonth() === birthday.getMonth() && today.getDate() === birthday.getDate();
    setIsBirthday(isTodayBirthday);
    
    // 随机选择一句生日祝福
    setWishIndex(Math.floor(Math.random() * birthdayWishes.length));
  }, [user]);

  const handleCelebrate = () => {
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 6500);
    // 切换到下一个祝福
    setWishIndex((prev) => (prev + 1) % birthdayWishes.length);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ParticleBackground color="#c084fc" />
      <RoseExplosion trigger={showCelebration} particleCount={4000} />

      <div className="relative z-10 p-4 md:p-8">
        {/* 顶部导航 */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/')}
            className="flex items-center gap-2 px-4 py-2 rounded-full glass hover:bg-white/40 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            返回
          </motion.button>
          <h1 className="text-2xl font-bold text-gradient-love flex items-center gap-2">
            <Cake className="w-6 h-6" />
            生日祝福
          </h1>
          <div className="w-20" />
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-6">
          {/* 生日倒计时卡片 */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-3xl p-8 text-center relative overflow-hidden"
          >
            {/* 装饰元素 */}
            <div className="absolute top-4 left-4 text-4xl opacity-30">🎈</div>
            <div className="absolute top-4 right-4 text-4xl opacity-30">🎁</div>
            <div className="absolute bottom-4 left-4 text-4xl opacity-30">🌸</div>
            <div className="absolute bottom-4 right-4 text-4xl opacity-30">💝</div>

            {isBirthday ? (
              <>
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-7xl mb-4 inline-block"
                >
                  🎂
                </motion.div>
                <h2 className="text-3xl font-bold text-gradient-love mb-2">
                  生日快乐！
                </h2>
                <p className="text-xl text-gray-700 mb-4">
                  今天是你的生日，{user.name}！
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCelebrate}
                  className="btn-love inline-flex items-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  点我庆祝
                  <Cake className="w-5 h-5" />
                </motion.button>
              </>
            ) : (
              <>
                <motion.div
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [-5, 5, -5]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-6xl mb-4 inline-block"
                >
                  🎂
                </motion.div>
                <div className="space-y-2">
                  <p className="text-lg text-gray-600">距离 {user.name} 的生日还有</p>
                  <motion.div
                    key={daysUntil}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-6xl font-bold text-gradient-love"
                  >
                    {daysUntil}
                  </motion.div>
                  <p className="text-xl font-medium text-pink-500">天</p>
                  <div className="flex items-center justify-center gap-4 mt-4 text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {user.birthday}
                    </span>
                    <span className="flex items-center gap-1">
                      <Gift className="w-4 h-4" />
                      {age} 岁
                    </span>
                  </div>
                </div>
              </>
            )}
          </motion.div>

          {/* 生日祝福卡片 */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-3xl p-8"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-6 text-center flex items-center justify-center gap-2">
              <Star className="w-6 h-6 text-yellow-500" />
              给你的生日祝福
              <Star className="w-6 h-6 text-yellow-500" />
            </h3>

            <motion.div
              key={wishIndex}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-6xl mb-4 inline-block"
              >
                {birthdayWishes[wishIndex].emoji}
              </motion.div>
              <p className="text-xl text-gray-700 leading-relaxed">
                {birthdayWishes[wishIndex].text}
              </p>
            </motion.div>

            <div className="flex justify-center gap-2 mt-6">
              {birthdayWishes.map((_, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.3 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setWishIndex(idx)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    idx === wishIndex 
                      ? 'bg-gradient-love w-8' 
                      : 'bg-pink-200 hover:bg-pink-300'
                  }`}
                />
              ))}
            </div>
          </motion.div>

          {/* 小彩蛋区 */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="glass-card rounded-3xl p-6"
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
              🎊 点击收集惊喜 🎊
            </h3>
            <div className="flex justify-center gap-4">
              {['🎁', '🎊', '🎉', '🎈', '🎀'].map((emoji, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleCelebrate}
                  className="text-4xl p-3 rounded-2xl hover:bg-white/50 transition-all"
                >
                  {emoji}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* 底部祝福 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <p className="text-gray-500 flex items-center justify-center gap-2">
              <Heart className="w-4 h-4 text-pink-400 fill-current" />
              愿所有美好如约而至
              <Heart className="w-4 h-4 text-pink-400 fill-current" />
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function BirthdayPage() {
  return (
    <ProtectedRoute>
      <BirthdayContent />
    </ProtectedRoute>
  );
}
