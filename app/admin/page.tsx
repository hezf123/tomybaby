'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Users, UserPlus, Edit2, Trash2, X, Save, Calendar, Hash } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import ParticleBackground from '@/components/ParticleBackground';
import { getUsers, createUser, updateUser, deleteUser, User } from '@/lib/mockData';

const avatarOptions = ['🌹', '🌸', '🌺', '🌻', '🌷', '💐', '🌼', '🍀', '🍁', '🌙', '⭐', '🌈'];

function AdminContent() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    birthday: '',
    name: '',
    avatar: '🌹',
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const allUsers = getUsers();
    setUsers(allUsers);
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      birthday: '',
      name: '',
      avatar: '🌹',
    });
    setEditingUser(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (user: User) => {
    setFormData({
      username: user.username,
      password: user.password,
      birthday: user.birthday,
      name: user.name,
      avatar: user.avatar,
    });
    setEditingUser(user);
    setShowAddModal(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (!formData.username.trim() || !formData.password.trim() || !formData.name.trim()) {
      setMessage('请填写完整信息');
      return;
    }

    try {
      if (editingUser) {
        // 更新用户
        const result = updateUser(editingUser.id, formData);
        if (result.success) {
          setMessage('用户更新成功！');
          loadUsers();
          setTimeout(() => {
            setShowAddModal(false);
            setMessage('');
          }, 1000);
        } else {
          setMessage(result.message || '更新失败');
        }
      } else {
        // 新增用户
        const result = createUser(formData);
        if (result.success) {
          setMessage('用户创建成功！');
          loadUsers();
          setTimeout(() => {
            setShowAddModal(false);
            setMessage('');
          }, 1000);
        } else {
          setMessage(result.message || '创建失败');
        }
      }
    } catch (err) {
      setMessage('操作失败，请重试');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('确定要删除这个用户吗？')) return;

    try {
      const result = deleteUser(id);
      if (result.success) {
        loadUsers();
      } else {
        alert(result.message || '删除失败');
      }
    } catch (err) {
      alert('删除失败');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ParticleBackground color="#9333ea" />

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
            <Users className="w-6 h-6" />
            用户管理
          </h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={openAddModal}
            className="btn-love flex items-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            新增用户
          </motion.button>
        </motion.div>

        {/* 用户列表 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <div className="glass-card rounded-3xl p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              用户列表
              <span className="text-sm font-normal text-gray-500">({users.length} 位用户)</span>
            </h2>

            <div className="space-y-4">
              {users.length === 0 ? (
                <p className="text-center text-gray-400 py-8">暂无用户</p>
              ) : (
                users.map((user, idx) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/40 hover:bg-white/50 transition-all"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gradient-love flex items-center justify-center text-3xl shadow-love shrink-0">
                      {user.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        {user.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Hash className="w-3 h-3" />
                          {user.username}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {user.birthday}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => openEditModal(user)}
                        className="p-2 rounded-xl bg-blue-100 text-blue-600 hover:bg-blue-200 transition-all"
                        title="编辑"
                      >
                        <Edit2 className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(user.id)}
                        className="p-2 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition-all"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* 添加/编辑用户弹窗 */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              transition={{ type: 'spring', damping: 25 }}
              className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingUser ? '编辑用户' : '新增用户'}
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowAddModal(false)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-all"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* 头像选择 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    选择头像
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {avatarOptions.map((avatar) => (
                      <motion.button
                        key={avatar}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={() => setFormData({ ...formData, avatar })}
                        className={`w-10 h-10 rounded-xl text-2xl flex items-center justify-center transition-all ${
                          formData.avatar === avatar
                            ? 'bg-gradient-love shadow-love scale-110'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {avatar}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* 用户名 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    账号 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="input-love"
                    placeholder="请输入账号"
                  />
                </div>

                {/* 密码 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    密码 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input-love"
                    placeholder="请输入密码"
                  />
                </div>

                {/* 姓名 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    姓名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-love"
                    placeholder="请输入姓名"
                  />
                </div>

                {/* 生日 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    生日
                  </label>
                  <input
                    type="date"
                    value={formData.birthday}
                    onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                    className="input-love"
                  />
                </div>

                {/* 消息提示 */}
                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-xl text-sm ${
                      message.includes('成功')
                        ? 'bg-green-100 text-green-600'
                        : 'bg-red-100 text-red-600'
                    }`}
                  >
                    {message}
                  </motion.div>
                )}

                {/* 按钮 */}
                <div className="flex gap-3 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                  >
                    取消
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="btn-love flex-1 flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {editingUser ? '保存修改' : '创建用户'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute>
      <AdminContent />
    </ProtectedRoute>
  );
}
