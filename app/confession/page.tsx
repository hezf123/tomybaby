'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Sparkles, Send, MessageCircle, Star } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import ParticleBackground from '@/components/ParticleBackground';
import HeartExplosion from '@/components/HeartExplosion';
import { useAuth } from '@/lib/AuthContext';

const loveQuotes = [
  '遇见你，是我此生最浪漫的意外',
  '在遇见你之前，世界是黑白的；遇见你之后，世界变成了彩色',
  '你是我心中永远的小星星，照亮我前行的路',
  '每一次心跳，都是想你的节奏',
  '愿时光不老，我们不散',
  '你笑起来的样子，比春天还要温暖',
  '有你的每一天，都是情人节',
  '喜欢你，是我做过最勇敢的事',
];

function ConfessionContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [messages, setMessages] = useState<string[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showExplosion, setShowExplosion] = useState(false);
  const [showQuote, setShowQuote] = useState(false);

  useEffect(() => {
    // 随机选一句情话
    const randomIndex = Math.floor(Math.random() * loveQuotes.length);
    setQuoteIndex(randomIndex);
    
    // 加载保存的消息
    const saved = localStorage.getItem(`confession_messages_${user?.id}`);
    if (saved) {
      setMessages(JSON.parse(saved));
    }
  }, [user?.id]);

  const handleShowQuote = () => {
    setShowQuote(true);
    setShowExplosion(true);
    setTimeout(() => setShowExplosion(false), 8000);
    setTimeout(() => setShowQuote(false), 4000);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const updated = [...messages, newMessage.trim()];
    setMessages(updated);
    localStorage.setItem(`confession_messages_${user?.id}`, JSON.stringify(updated));
    setNewMessage('');
  };

  const handleClearMessages = () => {
    if (window.confirm('确定要清空所有留言吗？')) {
      setMessages([]);
      localStorage.removeItem(`confession_messages_${user?.id}`);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ParticleBackground />
      <HeartExplosion trigger={showExplosion} />

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
            <Heart className="w-6 h-6 fill-current" />
            表白页面
          </h1>
          <div className="w-20" />
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-6">
          {/* 情话展示区 */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-3xl p-8 text-center relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-pink-200/30 rounded-full -translate-y-20 translate-x-20" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-200/30 rounded-full translate-y-16 -translate-x-16" />
            
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="inline-block text-6xl mb-4"
            >
              💝
            </motion.div>
            
            <h2 className="text-xl text-gray-600 mb-4">给 {user.name} 的悄悄话</h2>
            
            <motion.div
              key={quoteIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              <p className="text-2xl md:text-3xl font-bold text-gradient-love leading-relaxed">
                "{loveQuotes[quoteIndex]}"
              </p>
            </motion.div>

            {/* 显示随机情话的浮动提示 */}
            {showQuote && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.5 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <div className="text-8xl animate-heartbeat">💖</div>
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShowQuote}
              className="mt-6 btn-love flex items-center gap-2 mx-auto"
            >
              <Sparkles className="w-5 h-5" />
              听我说一句
              <Heart className="w-5 h-5 fill-current" />
            </motion.button>
          </motion.div>

          {/* 留言板 */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-3xl p-6"
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-pink-500" />
              我的留言板
              <span className="text-sm font-normal text-gray-500">({messages.length})</span>
            </h3>

            {/* 留言列表 */}
            <div className="space-y-3 max-h-60 overflow-y-auto mb-4 pr-2">
              {messages.length === 0 ? (
                <p className="text-center text-gray-400 py-8">
                  <Star className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  还没有留言，写下你的心里话吧 ~
                </p>
              ) : (
                messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-4 rounded-2xl bg-gradient-to-r from-pink-100/50 to-purple-100/50 border border-pink-200/30"
                  >
                    <p className="text-gray-700">{msg}</p>
                  </motion.div>
                ))
              )}
            </div>

            {/* 输入框 */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="写下你想对TA说的话..."
                className="input-love flex-1"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="btn-love px-6 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
                发送
              </motion.button>
            </div>

            {messages.length > 0 && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handleClearMessages}
                className="mt-3 text-sm text-gray-400 hover:text-red-400 transition-colors"
              >
                清空留言
              </motion.button>
            )}
          </motion.div>

          {/* 底部装饰 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-2 text-3xl">
              <motion.span animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>💕</motion.span>
              <motion.span animate={{ y: [0, -15, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}>💖</motion.span>
              <motion.span animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}>🌸</motion.span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function ConfessionPage() {
  return (
    <ProtectedRoute>
      <ConfessionContent />
    </ProtectedRoute>
  );
}
