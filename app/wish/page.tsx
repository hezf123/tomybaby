'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Plus, Trash2, Check, Clock,
  Heart, X, Gift
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import ParticleBackground from '@/components/ParticleBackground';
import { useAuth } from '@/lib/AuthContext';

// ==================== 类型定义 ====================
type WishStatus = 'pending' | 'in-progress' | 'completed';
type WishCategory = 'travel' | 'food' | 'event' | 'learning' | 'life' | 'other';

interface Wish {
  id: string;
  title: string;
  description: string;
  category: WishCategory;
  status: WishStatus;
  createdAt: string;
  completedAt?: string;
  emoji: string;
}

// ==================== 数据配置 ====================
const CATEGORY_INFO: Record<WishCategory, { name: string; icon: string; color: string }> = {
  travel: { name: '旅行', icon: '✈️', color: '#06B6D4' },
  food: { name: '美食', icon: '🍜', color: '#F97316' },
  event: { name: '活动', icon: '🎪', color: '#EC4899' },
  learning: { name: '学习', icon: '📚', color: '#8B5CF6' },
  life: { name: '生活', icon: '🏠', color: '#10B981' },
  other: { name: '其他', icon: '💫', color: '#6B7280' },
};

const STATUS_INFO: Record<WishStatus, { name: string; color: string; bg: string }> = {
  pending: { name: '待实现', color: '#9CA3AF', bg: 'bg-gray-100' },
  'in-progress': { name: '进行中', color: '#F59E0B', bg: 'bg-amber-100' },
  completed: { name: '已完成', color: '#10B981', bg: 'bg-emerald-100' },
};

const INITIAL_WISHES: Wish[] = [
  {
    id: '1',
    title: '一起去看海',
    description: '找一个阳光明媚的日子，牵手漫步在沙滩上，看日落',
    category: 'travel',
    status: 'pending',
    createdAt: new Date().toISOString(),
    emoji: '🌊',
  },
  {
    id: '2',
    title: '学做对方最喜欢的菜',
    description: '为对方学做一道拿手菜，给彼此一个惊喜',
    category: 'food',
    status: 'in-progress',
    createdAt: new Date().toISOString(),
    emoji: '👨‍🍳',
  },
  {
    id: '3',
    title: '一起去游乐园',
    description: '坐过山车、摩天轮，找回童年的快乐',
    category: 'event',
    status: 'pending',
    createdAt: new Date().toISOString(),
    emoji: '🎢',
  },
  {
    id: '4',
    title: '共读一本书',
    description: '选一本两个人都感兴趣的书，然后交流读后感',
    category: 'learning',
    status: 'completed',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    completedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    emoji: '📖',
  },
  {
    id: '5',
    title: '拍一组情侣写真',
    description: '记录下最美好的瞬间，留给未来慢慢回味',
    category: 'life',
    status: 'pending',
    createdAt: new Date().toISOString(),
    emoji: '📷',
  },
  {
    id: '6',
    title: '一起看日出',
    description: '清晨出发，找一个绝佳观景点，迎接第一缕阳光',
    category: 'travel',
    status: 'pending',
    createdAt: new Date().toISOString(),
    emoji: '🌅',
  },
];

// ==================== 存储工具 ====================
const STORAGE_KEY = 'toyou_wishes';

function loadWishes(): Wish[] {
  if (typeof window === 'undefined') return INITIAL_WISHES;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_WISHES));
  return INITIAL_WISHES;
}

function saveWishes(wishes: Wish[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(wishes));
}

// ==================== SVG 图表组件 ====================
function ProgressDonut({ wishes }: { wishes: Wish[] }) {
  const total = wishes.length;
  const completed = wishes.filter(w => w.status === 'completed').length;
  const inProgress = wishes.filter(w => w.status === 'in-progress').length;
  const pending = wishes.filter(w => w.status === 'pending').length;

  const size = 160;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const completedPercent = total > 0 ? completed / total : 0;
  const inProgressPercent = total > 0 ? inProgress / total : 0;

  const completedDash = circumference * completedPercent;
  const inProgressDash = circumference * inProgressPercent;

  return (
    <div className="flex items-center gap-6">
      <div className="relative w-[160px] h-[160px]">
        <svg width={size} height={size} className="-rotate-90">
          {/* 背景环 */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
          />
          {/* 完成部分 */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#10B981"
            strokeWidth={strokeWidth}
            strokeDasharray={`${completedDash} ${circumference}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.6s ease' }}
          />
          {/* 进行中部分 */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#F59E0B"
            strokeWidth={strokeWidth}
            strokeDasharray={`${inProgressDash} ${circumference}`}
            strokeDashoffset={-completedDash}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.6s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            key={completed}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-3xl font-bold text-gray-800"
          >
            {Math.round(completedPercent * 100)}%
          </motion.span>
          <span className="text-xs text-gray-500">完成率</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-sm text-gray-600">已完成 {completed}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-sm text-gray-600">进行中 {inProgress}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-gray-300" />
          <span className="text-sm text-gray-600">待实现 {pending}</span>
        </div>
      </div>
    </div>
  );
}

function CategoryBars({ wishes }: { wishes: Wish[] }) {
  const categoryCounts = useMemo(() => {
    const counts: Record<string, { total: number; completed: number }> = {};
    Object.keys(CATEGORY_INFO).forEach(key => {
      const items = wishes.filter(w => w.category === key);
      counts[key] = {
        total: items.length,
        completed: items.filter(w => w.status === 'completed').length,
      };
    });
    return counts;
  }, [wishes]);

  const maxTotal = Math.max(...Object.values(categoryCounts).map(c => c.total), 1);

  return (
    <div className="space-y-3">
      {Object.entries(CATEGORY_INFO).map(([key, info]) => {
        const data = categoryCounts[key];
        const widthPercent = maxTotal > 0 ? (data.total / maxTotal) * 100 : 0;
        const completedPercent = data.total > 0 ? (data.completed / data.total) * 100 : 0;

        return (
          <div key={key} className="flex items-center gap-3">
            <span className="w-20 text-xs text-gray-600 flex items-center gap-1">
              <span>{info.icon}</span>
              <span>{info.name}</span>
            </span>
            <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${widthPercent}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: info.color + '40' }}
              />
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${widthPercent * completedPercent / 100}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                className="h-full rounded-full absolute top-0 left-0"
                style={{ background: info.color }}
              />
            </div>
            <span className="w-12 text-xs text-right text-gray-500">
              {data.completed}/{data.total}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ==================== 添加心愿弹窗 ====================
function AddWishModal({ isOpen, onClose, onAdd }: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (wish: Omit<Wish, 'id' | 'createdAt'>) => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<WishCategory>('travel');
  const [emoji, setEmoji] = useState('✨');

  const emojis = ['✨', '🌟', '💖', '🎉', '🌸', '🌈', '🎈', '🍀', '🦋', '🌙', '☀️', '🔥'];

  const handleSubmit = () => {
    if (!title.trim()) return;
    onAdd({
      title: title.trim(),
      description: description.trim(),
      category,
      status: 'pending',
      emoji,
    });
    setTitle('');
    setDescription('');
    setCategory('travel');
    setEmoji('✨');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <motion.div
            initial={{ scale: 0.9, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
            className="relative glass-card rounded-3xl p-6 md:p-8 max-w-md w-full overflow-hidden"
          >
            <div className="absolute -top-10 -right-10 w-28 h-28 bg-teal-300/40 rounded-full" />
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-cyan-300/30 rounded-full" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/40 transition-colors z-10"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>

            <div className="relative">
              <h3 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
                <Gift className="w-5 h-5 text-teal-500" />
                添加新心愿
              </h3>

              <div className="space-y-4">
                {/* emoji选择 */}
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-2 block">选择图标</label>
                  <div className="flex flex-wrap gap-2">
                    {emojis.map(e => (
                      <motion.button
                        key={e}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setEmoji(e)}
                        className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                          emoji === e ? 'bg-teal-100 ring-2 ring-teal-400' : 'bg-white/60 hover:bg-white/90'
                        }`}
                      >
                        {e}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* 标题 */}
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-2 block">心愿标题</label>
                  <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="想一起做的事..."
                    className="w-full px-4 py-3 rounded-xl bg-white/60 border border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-200 outline-none transition-all text-gray-800"
                    autoFocus
                  />
                </div>

                {/* 描述 */}
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-2 block">详细描述</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="详细描述一下这个心愿吧..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-white/60 border border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-200 outline-none transition-all text-gray-800 resize-none"
                  />
                </div>

                {/* 分类 */}
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-2 block">分类</label>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(CATEGORY_INFO).map(([key, info]) => (
                      <motion.button
                        key={key}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCategory(key as WishCategory)}
                        className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                          category === key
                            ? 'text-white shadow-md'
                            : 'bg-white/60 text-gray-600 hover:bg-white/90'
                        }`}
                        style={category === key ? { background: info.color } : {}}
                      >
                        {info.icon} {info.name}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={!title.trim()}
                className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                添加心愿
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ==================== 主页面 ====================
function WishContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [wishes, setWishes] = useState<Wish[]>(() => loadWishes());
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | WishStatus>('all');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | WishCategory>('all');

  const filteredWishes = useMemo(() => {
    return wishes.filter(w => {
      if (activeFilter !== 'all' && w.status !== activeFilter) return false;
      if (activeCategoryFilter !== 'all' && w.category !== activeCategoryFilter) return false;
      return true;
    });
  }, [wishes, activeFilter, activeCategoryFilter]);

  const handleAdd = (data: Omit<Wish, 'id' | 'createdAt'>) => {
    const newWish: Wish = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...wishes, newWish];
    setWishes(updated);
    saveWishes(updated);
  };

  const handleStatusChange = (id: string, status: WishStatus) => {
    const updated = wishes.map(w =>
      w.id === id
        ? {
            ...w,
            status,
            completedAt: status === 'completed' ? new Date().toISOString() : undefined,
          }
        : w
    );
    setWishes(updated);
    saveWishes(updated);
  };

  const handleDelete = (id: string) => {
    const updated = wishes.filter(w => w.id !== id);
    setWishes(updated);
    saveWishes(updated);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ParticleBackground />

      <div className="relative z-10 p-4 md:p-8 pb-20">
        {/* 顶部导航 */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between mb-6"
        >
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 p-2 rounded-xl glass hover:bg-white/30 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
            <span className="text-gray-600 font-medium">返回</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{user?.name}</span>
            <span className="text-xl">{user?.avatar}</span>
          </div>
        </motion.div>

        {/* 标题 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block text-5xl mb-3"
          >
            💝
          </motion.div>
          <h1 className="text-3xl font-bold text-gradient-love mb-2">想一起做的事</h1>
          <p className="text-gray-500">把每一个心愿变成美好的回忆</p>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* 数据概览 */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid md:grid-cols-2 gap-6"
          >
            {/* 进度环 */}
            <div className="glass-card rounded-3xl p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-teal-500" />
                心愿进度
              </h2>
              <ProgressDonut wishes={wishes} />
            </div>

            {/* 分类统计 */}
            <div className="glass-card rounded-3xl p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-teal-500" />
                分类统计
              </h2>
              <CategoryBars wishes={wishes} />
            </div>
          </motion.div>

          {/* 操作栏 */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-3xl p-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-5">
              <h2 className="text-lg font-bold text-gray-800 flex-1">心愿清单</h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddModal(true)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium flex items-center gap-2 shadow-love"
              >
                <Plus className="w-4 h-4" />
                添加心愿
              </motion.button>
            </div>

            {/* 筛选 */}
            <div className="flex flex-wrap gap-2 mb-4">
              {(['all', 'pending', 'in-progress', 'completed'] as const).map(status => (
                <motion.button
                  key={status}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    activeFilter === status
                      ? 'bg-teal-500 text-white shadow'
                      : 'bg-white/50 text-gray-600 hover:bg-white/80'
                  }`}
                >
                  {status === 'all' ? '全部' : STATUS_INFO[status].name}
                </motion.button>
              ))}
              <div className="w-px h-6 bg-gray-200 mx-1" />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeCategoryFilter === 'all'
                    ? 'bg-teal-500 text-white shadow'
                    : 'bg-white/50 text-gray-600 hover:bg-white/80'
                }`}
              >
                全部分类
              </motion.button>
              {Object.entries(CATEGORY_INFO).map(([key, info]) => (
                <motion.button
                  key={key}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveCategoryFilter(key as WishCategory)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    activeCategoryFilter === key
                      ? 'text-white shadow'
                      : 'bg-white/50 text-gray-600 hover:bg-white/80'
                  }`}
                  style={activeCategoryFilter === key ? { background: info.color } : {}}
                >
                  {info.icon} {info.name}
                </motion.button>
              ))}
            </div>

            {/* 心愿列表 */}
            <motion.div
              key={`${activeFilter}-${activeCategoryFilter}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              {filteredWishes.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-5xl mb-3"
                  >
                    💭
                  </motion.div>
                  <p>还没有心愿，点击"添加心愿"开始吧</p>
                </div>
              ) : (
                filteredWishes.map((wish, index) => (
                  <motion.div
                    key={wish.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group p-4 rounded-2xl bg-white/60 hover:bg-white/90 transition-all border border-white/40"
                  >
                    <div className="flex items-start gap-4">
                      {/* emoji */}
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                          wish.status === 'completed' ? 'opacity-50' : ''
                        }`}
                        style={{ background: CATEGORY_INFO[wish.category].color + '20' }}
                      >
                        {wish.emoji}
                      </div>

                      {/* 内容 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4
                              className={`font-bold text-gray-800 ${
                                wish.status === 'completed' ? 'line-through text-gray-400' : ''
                              }`}
                            >
                              {wish.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className="text-xs px-2 py-0.5 rounded-full text-white"
                                style={{ background: CATEGORY_INFO[wish.category].color }}
                              >
                                {CATEGORY_INFO[wish.category].icon} {CATEGORY_INFO[wish.category].name}
                              </span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ${STATUS_INFO[wish.status].bg}`}
                                style={{ color: STATUS_INFO[wish.status].color }}
                              >
                                {STATUS_INFO[wish.status].name}
                              </span>
                            </div>
                          </div>

                          {/* 操作按钮 */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {wish.status !== 'completed' && (
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() =>
                                  handleStatusChange(
                                    wish.id,
                                    wish.status === 'pending' ? 'in-progress' : 'completed'
                                  )
                                }
                                className="p-2 rounded-lg hover:bg-emerald-100 text-emerald-600"
                                title={wish.status === 'pending' ? '开始' : '完成'}
                              >
                                <Check className="w-4 h-4" />
                              </motion.button>
                            )}
                            {wish.status === 'completed' && (
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleStatusChange(wish.id, 'pending')}
                                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                                title="恢复"
                              >
                                <Clock className="w-4 h-4" />
                              </motion.button>
                            )}
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDelete(wish.id)}
                              className="p-2 rounded-lg hover:bg-red-100 text-red-500"
                              title="删除"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>

                        {wish.description && (
                          <p
                            className={`text-sm text-gray-500 mt-2 ${
                              wish.status === 'completed' ? 'line-through' : ''
                            }`}
                          >
                            {wish.description}
                          </p>
                        )}

                        {wish.status === 'completed' && wish.completedAt && (
                          <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            {new Date(wish.completedAt).toLocaleString('zh-CN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })} 完成
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* 添加弹窗 */}
      <AddWishModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAdd}
      />
    </div>
  );
}

// 需要用到的图标组件
function BarChart3({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3v18h18" />
      <path d="M7 16V9" />
      <path d="M12 16V5" />
      <path d="M17 16v-3" />
    </svg>
  );
}

// ==================== 导出页面（带登录保护） ====================
export default function WishPage() {
  return (
    <ProtectedRoute>
      <WishContent />
    </ProtectedRoute>
  );
}
