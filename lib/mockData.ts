// Mock数据存储 - 模拟后端数据库
const STORAGE_KEY = 'toyou_users_db';

// 检查是否在浏览器环境
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

export interface User {
  id: string;
  username: string;
  password: string;
  birthday: string;
  name: string;
  avatar: string;
  createdAt: string;
  updatedAt: string;
}

// 初始用户数据
const initialUsers: User[] = [
  {
    id: '1',
    username: 'gjj1314',
    password: 'gjj520',
    birthday: '2020-08-09',
    name: '小洁',
    avatar: '🌹',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    username: 'll666',
    password: 'll1314520',
    birthday: '2007-10-04',
    name: '林~',
    avatar: '🌹',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: '3',
    username: 'gjj1314520gjj',
    password: 'gjj520',
    birthday: '2020-08-07',
    name: '小林',
    avatar: '🌹',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: '4',
    username: 'gjj666',
    password: 'gjj520',
    birthday: '2020-08-06',
    name: '小吴',
    avatar: '🌹',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
];

// 计算initialUsers的指纹（用于检测代码修改）
function getInitialUsersFingerprint(): string {
  return initialUsers.map(u => u.username).sort().join('|');
}

// 从localStorage加载用户数据
// 始终以initialUsers为基础，合并用户通过管理后台新增的用户
function loadUsers(): User[] {
  if (!isBrowser()) {
    return [...initialUsers];
  }
  try {
    const storedFingerprint = localStorage.getItem(STORAGE_KEY + '_fingerprint');
    const currentFingerprint = getInitialUsersFingerprint();

    // 如果指纹不匹配，说明initialUsers被修改了，清除旧数据重新初始化
    if (storedFingerprint !== currentFingerprint) {
      localStorage.removeItem(STORAGE_KEY);
    }

    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const storedUsers: User[] = JSON.parse(data);
      // 用username匹配，找出通过管理后台手动添加的用户
      const initialUsernames = new Set(initialUsers.map(u => u.username));
      const extraUsers = storedUsers.filter(u => !initialUsernames.has(u.username));
      // 始终以initialUsers为准，追加手动添加的用户
      const merged = [...initialUsers, ...extraUsers];
      saveUsers(merged);
      return merged;
    }
  } catch (e) {
    console.error('加载用户数据失败:', e);
  }
  // 没有数据或指纹不匹配，初始化
  saveUsers(initialUsers);
  return [...initialUsers];
}

// 保存用户数据到localStorage
function saveUsers(users: User[]): void {
  if (!isBrowser()) {
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEY + '_fingerprint', getInitialUsersFingerprint());
  } catch (e) {
    console.error('保存用户数据失败:', e);
  }
}

// 验证用户登录
export function login(username: string, password: string): { success: boolean; user?: User; message?: string } {
  const users = loadUsers();
  const user = users.find(u => u.username === username);
  
  if (!user) {
    return { success: false, message: '用户不存在' };
  }
  
  if (user.password !== password) {
    return { success: false, message: '密码错误' };
  }
  
  return { success: true, user };
}

// 获取所有用户
export function getUsers(): User[] {
  return loadUsers();
}

// 根据ID获取用户
export function getUserById(id: string): User | undefined {
  const users = loadUsers();
  return users.find(u => u.id === id);
}

// 新增用户
export function createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): { success: boolean; user?: User; message?: string } {
  const users = loadUsers();
  
  // 检查用户名是否已存在
  if (users.some(u => u.username === userData.username)) {
    return { success: false, message: '用户名已存在' };
  }
  
  const newUser: User = {
    ...userData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  users.push(newUser);
  saveUsers(users);
  
  return { success: true, user: newUser };
}

// 更新用户
export function updateUser(id: string, userData: Partial<Omit<User, 'id' | 'createdAt'>>): { success: boolean; user?: User; message?: string } {
  const users = loadUsers();
  const index = users.findIndex(u => u.id === id);
  
  if (index === -1) {
    return { success: false, message: '用户不存在' };
  }
  
  // 检查用户名是否已存在（排除当前用户）
  if (userData.username && users.some(u => u.username === userData.username && u.id !== id)) {
    return { success: false, message: '用户名已存在' };
  }
  
  users[index] = {
    ...users[index],
    ...userData,
    updatedAt: new Date().toISOString(),
  };
  
  saveUsers(users);
  
  return { success: true, user: users[index] };
}

// 删除用户
export function deleteUser(id: string): { success: boolean; message?: string } {
  const users = loadUsers();
  const index = users.findIndex(u => u.id === id);
  
  if (index === -1) {
    return { success: false, message: '用户不存在' };
  }
  
  // 不允许删除自己
  const currentUser = getCurrentUser();
  if (currentUser?.id === id) {
    return { success: false, message: '不能删除当前登录用户' };
  }
  
  users.splice(index, 1);
  saveUsers(users);
  
  return { success: true };
}

// 重置所有数据为初始状态
export function resetData(): void {
  saveUsers(initialUsers);
}

// 当前登录用户的session存储key
const SESSION_KEY = 'toyou_current_user';

// 设置当前登录用户
export function setCurrentUser(user: User): void {
  if (!isBrowser()) {
    return;
  }
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('保存会话失败:', e);
  }
}

// 获取当前登录用户
export function getCurrentUser(): User | null {
  if (!isBrowser()) {
    return null;
  }
  try {
    const data = sessionStorage.getItem(SESSION_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('获取会话失败:', e);
  }
  return null;
}

// 清除当前登录用户（登出）
export function clearCurrentUser(): void {
  if (!isBrowser()) {
    return;
  }
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch (e) {
    console.error('清除会话失败:', e);
  }
}
