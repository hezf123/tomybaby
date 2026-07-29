'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, UtensilsCrossed, RotateCcw, ChevronRight, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import ParticleBackground from '@/components/ParticleBackground';
import { useAuth } from '@/lib/AuthContext';

// 美食数据
interface FoodItem {
  name: string;
  emoji: string;
  category: string;
  description: string;
  reason: string;
  color: string;
}

const foodList: FoodItem[] = [
  { name: '火锅', emoji: '🍲', category: '中餐', color: '#EF4444', description: '麻辣鲜香的川味火锅，毛肚、鸭肠、肥牛卷，配上蒜泥香油碟', reason: '聚餐首选！热腾腾的火锅最适合和朋友一起分享，想吃什么涮什么，自由又美味' },
  { name: '麻辣烫', emoji: '🥘', category: '小吃', color: '#F97316', description: '自选菜品搭配浓郁骨汤，麻辣鲜香一碗端', reason: '一人食的完美选择，菜品丰富价格实惠，暖胃又满足' },
  { name: '汉堡', emoji: '🍔', category: '快餐', color: '#EAB308', description: '经典芝士牛肉汉堡，多汁肉饼搭配新鲜蔬菜', reason: '快速解决一餐的好选择，层次丰富的口感让人满足' },
  { name: '披萨', emoji: '🍕', category: '西餐', color: '#EC4899', description: '意式薄底披萨，浓郁芝士拉丝，搭配培根和蘑菇', reason: '芝士就是力量！丰富的topping满足各种口味偏好' },
  { name: '寿司', emoji: '🍣', category: '日料', color: '#14B8A6', description: '新鲜三文鱼刺身和握寿司，搭配芥末和酱油', reason: '清爽健康的选择，精致的摆盘让用餐变成一种享受' },
  { name: '烧烤', emoji: '🍖', category: '中餐', color: '#DC2626', description: '炭火烤肉串，羊肉、鸡翅、烤茄子，配冰啤酒', reason: '烟火气满满！夏夜露天烧烤是人生一大乐事' },
  { name: '炸鸡', emoji: '🍗', category: '快餐', color: '#D97706', description: '韩式炸鸡，外酥里嫩，搭配甜辣酱或蜂蜜芥末', reason: '追剧神器！酥脆的外皮下是多汁的鸡肉，一口接一口停不下来' },
  { name: '麻辣香锅', emoji: '🥙', category: '中餐', color: '#EA580C', description: '自选食材爆炒，干辣椒和花椒的完美融合', reason: '比火锅更方便，比炒菜更过瘾，一人一份刚刚好' },
  { name: '拉面', emoji: '🍜', category: '面食', color: '#F59E0B', description: '日式豚骨拉面，浓郁白汤配溏心蛋和叉烧', reason: '一碗热腾腾的拉面能治愈所有不开心，汤头是灵魂' },
  { name: '水饺', emoji: '🥟', category: '面食', color: '#F97316', description: '手工水饺，韭菜鸡蛋和猪肉白菜两种经典馅料', reason: '中国人的comfort food，蘸醋吃蒜，简单又幸福' },
  { name: '韩式拌饭', emoji: '🍚', category: '韩餐', color: '#84CC16', description: '石锅拌饭，各种蔬菜配煎蛋和辣酱，拌匀后锅巴香脆', reason: '营养均衡的韩式料理，拌饭的仪式感让吃饭更有趣' },
  { name: '酸菜鱼', emoji: '🐟', category: '中餐', color: '#06B6D4', description: '酸辣可口的酸菜鱼，嫩滑鱼片搭配酸菜和金针菇', reason: '酸辣开胃，鱼肉嫩滑，配上一碗白米饭绝了' },
  { name: '蛋炒饭', emoji: '🍳', category: '中餐', color: '#FBBF24', description: '粒粒分明的蛋炒饭，加火腿丁和青豆，简单却美味', reason: '最简单的也是最难的，一份好的蛋炒饭能让人回味无穷' },
  { name: '螺蛳粉', emoji: '🍝', category: '小吃', color: '#A855F7', description: '柳州螺蛳粉，酸笋的"臭"和汤底的鲜完美结合', reason: '爱的人欲罢不能，酸辣鲜香烫五味俱全，嗦粉的快乐你懂的' },
  { name: '黄焖鸡', emoji: '🐔', category: '中餐', color: '#92400E', description: '黄焖鸡米饭，嫩滑鸡肉配土豆青椒，汤汁拌饭一绝', reason: '国民快餐三巨头之一，实惠量大，汤汁拌饭能干三碗' },
  { name: '奶茶', emoji: '🧋', category: '饮品', color: '#D4A574', description: '珍珠奶茶配椰果，少糖去冰，Q弹珍珠嚼劲十足', reason: '下午茶必备！一杯奶茶能让心情瞬间变好' },
];

// 分类数据
const categories = [
  { name: '全部', emoji: '🍽️', icon: 'all' },
  { name: '中餐', emoji: '🥢', icon: 'chinese' },
  { name: '西餐', emoji: '🍴', icon: 'western' },
  { name: '日料', emoji: '🍣', icon: 'japanese' },
  { name: '韩餐', emoji: '🍚', icon: 'korean' },
  { name: '快餐', emoji: '🍔', icon: 'fastfood' },
  { name: '小吃', emoji: '🍢', icon: 'snack' },
  { name: '面食', emoji: '🍝', icon: 'noodle' },
  { name: '饮品', emoji: '🧋', icon: 'drink' },
];

// ==================== 转盘组件 ====================
function SpinningWheel({ foods, onResult }: { foods: FoodItem[]; onResult: (food: FoodItem) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [spinning, setSpinning] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const animationRef = useRef<number | null>(null);
  const rotationRef = useRef<number>(0);

  const wheelFoods = useMemo(() => foods.slice(0, 12), [foods]);
  const segmentAngle = useMemo(() => (2 * Math.PI) / wheelFoods.length, [wheelFoods.length]);

  const drawWheel = useCallback((rotation: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = size / 2 - 8;

    ctx.clearRect(0, 0, size, size);

    // 外圈光晕
    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, radius + 6, 0, 2 * Math.PI);
    const outerGlow = ctx.createRadialGradient(center, center, radius, center, center, radius + 6);
    outerGlow.addColorStop(0, 'rgba(251, 146, 60, 0.3)');
    outerGlow.addColorStop(1, 'rgba(251, 146, 60, 0)');
    ctx.fillStyle = outerGlow;
    ctx.fill();
    ctx.restore();

    // 绘制扇形
    for (let i = 0; i < wheelFoods.length; i++) {
      const startAngle = i * segmentAngle + rotation;
      const endAngle = startAngle + segmentAngle;

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();

      // 渐变填充
      const gradient = ctx.createLinearGradient(
        center + Math.cos(startAngle + segmentAngle / 2) * radius * 0.5,
        center + Math.sin(startAngle + segmentAngle / 2) * radius * 0.5,
        center + Math.cos(startAngle + segmentAngle / 2) * radius,
        center + Math.sin(startAngle + segmentAngle / 2) * radius
      );
      gradient.addColorStop(0, wheelFoods[i].color + '40');
      gradient.addColorStop(1, wheelFoods[i].color + '80');
      ctx.fillStyle = gradient;
      ctx.fill();

      // 边框
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 文字和emoji
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(startAngle + segmentAngle / 2);
      ctx.textAlign = 'center';

      // emoji
      ctx.font = `${size > 350 ? 24 : 18}px serif`;
      ctx.fillText(wheelFoods[i].emoji, radius * 0.68, 6);

      // 名字
      ctx.font = `bold ${size > 350 ? 14 : 11}px sans-serif`;
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 2;
      ctx.fillText(wheelFoods[i].name, radius * 0.4, 4);
      ctx.shadowBlur = 0;

      ctx.restore();
    }

    // 中心圆
    ctx.beginPath();
    ctx.arc(center, center, radius * 0.18, 0, 2 * Math.PI);
    const centerGrad = ctx.createRadialGradient(center, center, 0, center, center, radius * 0.18);
    centerGrad.addColorStop(0, '#ffffff');
    centerGrad.addColorStop(1, '#fbbf24');
    ctx.fillStyle = centerGrad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // 中心文字
    ctx.font = 'bold 14px sans-serif';
    ctx.fillStyle = '#92400E';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('GO', center, center);

    // 指针（三角形，指向角度 0 / 3 点钟方向）
    ctx.beginPath();
    ctx.moveTo(size - 25, center);
    ctx.lineTo(size - 50, center - 16);
    ctx.lineTo(size - 50, center + 16);
    ctx.closePath();
    ctx.fillStyle = '#EF4444';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [wheelFoods, segmentAngle]);

  // 只在挂载时初始化一次
  useEffect(() => {
    drawWheel(rotationRef.current);
  }, [drawWheel]);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setSelectedIndex(null);

    const canvas = canvasRef.current;
    if (!canvas) return;

    // 随机目标索引
    const targetIndex = Math.floor(Math.random() * wheelFoods.length);
    // 扇区内随机偏移（-0.4 到 +0.4 个扇区宽度，避免压线）
    const jitter = (Math.random() - 0.5) * segmentAngle * 0.8;
    // 目标：让目标扇区的中心 + jitter 停在指针处（角度 0）
    // 扇区中心角度 = targetIndex*segmentAngle + segmentAngle/2 + rotation
    // 要求：= 0 (mod 2π)
    // => rotation = -(targetIndex*segmentAngle + segmentAngle/2) + 2π*N + jitter
    const N = 5 + Math.floor(Math.random() * 3); // 5~7 圈
    const targetRotation = (2 * Math.PI * N) - targetIndex * segmentAngle - segmentAngle / 2 + jitter;
    const startRotation = rotationRef.current;
    const delta = targetRotation - startRotation;

    const duration = 4000 + Math.random() * 1000;
    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentRotation = startRotation + delta * eased;
      rotationRef.current = currentRotation;

      drawWheel(currentRotation);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        rotationRef.current = targetRotation;
        setSpinning(false);
        setSelectedIndex(targetIndex);
        onResult(wheelFoods[targetIndex]);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center">
      <div className="relative inline-block">
        <canvas
          ref={canvasRef}
          width={380}
          height={380}
          className="max-w-full"
          style={{ maxWidth: '380px', width: '100%', height: 'auto' }}
        />
        {/* 选中指示 */}
        {selectedIndex !== null && !spinning && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400 }}
            className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-9 h-9 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg border-2 border-white"
          >
            ✓
          </motion.div>
        )}
      </div>

      <motion.button
        whileHover={{ scale: spinning ? 1 : 1.05 }}
        whileTap={{ scale: spinning ? 1 : 0.95 }}
        onClick={spin}
        disabled={spinning}
        className={`mt-6 px-10 py-4 rounded-2xl font-bold text-lg shadow-lg transition-all flex items-center gap-3 ${
          spinning
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:shadow-xl'
        }`}
      >
        {spinning ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <RotateCcw className="w-5 h-5" />
            </motion.div>
            转盘中...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            开始转盘
          </>
        )}
      </motion.button>
    </div>
  );
}

// ==================== 主页面 ====================
function FoodContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [result, setResult] = useState<FoodItem | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [activeCategory, setActiveCategory] = useState('全部');
  const [detailFood, setDetailFood] = useState<FoodItem | null>(null);

  const filteredFoods = activeCategory === '全部'
    ? foodList
    : foodList.filter(f => f.category === activeCategory);

  const handleWheelResult = (food: FoodItem) => {
    setResult(food);
    setTimeout(() => setShowResult(true), 300);
  };

  const handleNewSpin = () => {
    setResult(null);
    setShowResult(false);
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
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block text-5xl mb-3"
          >
            🍽️
          </motion.div>
          <h1 className="text-3xl font-bold text-gradient-love mb-2">宝宝今天吃什么</h1>
          <p className="text-gray-500">把选择交给命运，把美味留给自己</p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {/* 转盘区域 */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-3xl p-6 md:p-8 mb-8"
          >
            <div className="flex items-center justify-center gap-2 mb-6">
              <UtensilsCrossed className="w-5 h-5 text-orange-500" />
              <h2 className="text-xl font-bold text-gray-800">美食转盘</h2>
              <Sparkles className="w-5 h-5 text-amber-500" />
            </div>

            <SpinningWheel foods={foodList} onResult={handleWheelResult} />

            {/* 结果展示 */}
            <AnimatePresence>
              {showResult && result && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mt-6 p-6 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200/50"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <motion.span
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="text-5xl"
                      >
                        {result.emoji}
                      </motion.span>
                      <div>
                        <h3 className="text-2xl font-bold text-orange-700">{result.name}</h3>
                        <span className="text-sm text-orange-400 bg-orange-100 px-3 py-1 rounded-full">
                          {result.category}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-3 leading-relaxed">
                      {result.description}
                    </p>

                    <div className="flex items-start gap-2 p-3 rounded-xl bg-white/60">
                      <span className="text-lg mt-0.5">💡</span>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        <span className="font-medium text-orange-600">推荐理由：</span>
                        {result.reason}
                      </p>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleNewSpin}
                      className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium flex items-center justify-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      再转一次
                    </motion.button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* 美食分类 */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-3xl p-6 md:p-8"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>📋</span> 美食探索
            </h2>

            {/* 分类筛选 */}
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map(cat => (
                <motion.button
                  key={cat.name}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveCategory(cat.name)}
                  className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                    activeCategory === cat.name
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                      : 'bg-white/50 text-gray-600 hover:bg-white/80'
                  }`}
                >
                  {cat.emoji} {cat.name}
                </motion.button>
              ))}
            </div>

            {/* 美食列表 */}
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid sm:grid-cols-2 gap-3"
            >
              {filteredFoods.map((food, index) => (
                <motion.div
                  key={food.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setDetailFood(food)}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/60 hover:bg-white/90 transition-all cursor-pointer group"
                >
                  <span className="text-3xl">{food.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-800 text-sm">{food.name}</h4>
                    <p className="text-xs text-gray-500 truncate">{food.description}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-orange-400 transition-colors shrink-0" />
                </motion.div>
              ))}
            </motion.div>

            {filteredFoods.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <span className="text-4xl block mb-2">🍽️</span>
                该分类暂无美食
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* 列表项点击详情弹窗 */}
      <AnimatePresence>
        {detailFood && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setDetailFood(null)}
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.85, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
              className="relative glass-card rounded-3xl p-6 md:p-8 max-w-md w-full overflow-hidden"
            >
              <div
                className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-30"
                style={{ background: detailFood.color }}
              />
              <div
                className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full opacity-20"
                style={{ background: detailFood.color }}
              />

              <button
                onClick={() => setDetailFood(null)}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/40 transition-colors z-10"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>

              <div className="relative">
                <div className="flex items-center gap-4 mb-5">
                  <motion.span
                    animate={{ scale: [1, 1.12, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-6xl"
                  >
                    {detailFood.emoji}
                  </motion.span>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">{detailFood.name}</h3>
                    <span
                      className="text-xs font-medium px-3 py-1 rounded-full text-white inline-block mt-1"
                      style={{ background: detailFood.color }}
                    >
                      {detailFood.category}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">菜品特点</h4>
                    <p className="text-gray-700 leading-relaxed text-sm">{detailFood.description}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-orange-50/60 border border-orange-100">
                    <h4 className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-1">💡 推荐理由</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">{detailFood.reason}</p>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setResult(detailFood);
                      setShowResult(true);
                      setDetailFood(null);
                      // 滚动到转盘位置
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium flex items-center justify-center gap-2 text-sm"
                  >
                    <Sparkles className="w-4 h-4" />
                    就吃这个！
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setDetailFood(null)}
                    className="px-5 py-3 rounded-xl bg-white/60 text-gray-600 font-medium text-sm hover:bg-white/90 transition-colors"
                  >
                    继续看看
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FoodPage() {
  return (
    <ProtectedRoute>
      <FoodContent />
    </ProtectedRoute>
  );
}
