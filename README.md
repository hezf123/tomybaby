# To You - 专属你的浪漫空间

一个为你量身定制的浪漫互动Web应用，支持用户登录、表白、生日祝福等功能，采用可爱粉嫩的视觉风格，配有炫酷的粒子心形爆炸特效。

## ✨ 功能特性

- 🔐 **身份认证系统** - 支持用户登录，初始账号可直接使用
- 💖 **表白页面** - 浪漫情话展示和留言板功能
- 🎂 **生日祝福** - 智能生日倒计时和精美祝福卡片
- 🎨 **炫酷特效** - Three.js 实现的粒子心形爆炸动画
- 📱 **响应式设计** - 完美适配手机、平板、电脑
- 🎭 **个性化体验** - 不同用户展示不同内容

## 🛠 技术栈

- **框架**: Next.js 14 (App Router) + React 18
- **样式**: Tailwind CSS 3
- **3D效果**: Three.js + @react-three/fiber
- **动画**: Framer Motion
- **图标**: Lucide React
- **部署**: Cloudflare Pages

## 📦 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 开发模式

```bash
npm run dev
```

打开浏览器访问 `http://localhost:3000`

### 3. 生产构建

```bash
npm run build
npm start
```

## 🔑 初始账号

- **账号**: `gjj1314`
- **密码**: `gjj520`
- **姓名**: 小洁
- **生日**: 2020-08-09

登录后可在管理后台添加更多用户。

## 🚀 部署到 Cloudflare Pages

### 方式一：通过 GitHub 自动部署（推荐）

1. 将项目推送到 GitHub 仓库
2. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
3. 进入 **Workers & Pages** → **Create** → **Pages**
4. 选择 **Connect to Git**
5. 选择你的 GitHub 仓库并授权
6. 配置构建设置：
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
   - **Production branch**: `main`
7. 点击 **Save and Deploy**

### 方式二：直接上传构建产物

1. 构建项目：
   ```bash
   npm run build
   ```

2. 登录 Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages**
3. 选择 **Direct Upload**
4. 上传 `out` 目录的内容
5. 完成部署

### 方式三：使用 Wrangler CLI

```bash
# 安装 wrangler
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 构建项目
npm run build

# 部署
wrangler pages deploy out --project-name=toyou-love-app
```

## 📁 项目结构

```
toyou/
├── app/                          # Next.js App Router 页面
│   ├── layout.tsx                # 根布局
│   ├── page.tsx                  # 首页（用户卡片）
│   ├── globals.css               # 全局样式
│   ├── login/                    # 登录页
│   ├── confession/               # 表白页面
│   ├── birthday/                # 生日祝福页面
│   └── admin/                    # 管理后台
├── components/                   # 可复用组件
│   ├── ParticleBackground.tsx    # 粒子背景
│   ├── HeartExplosion.tsx        # 心形爆炸特效
│   └── ProtectedRoute.tsx        # 路由保护
├── lib/                          # 工具库
│   ├── mockData.ts              # Mock数据存储
│   └── AuthContext.tsx          # 认证上下文
├── package.json
├── tailwind.config.ts
├── next.config.js
└── wrangler.toml                # Cloudflare配置
```

## ⚙️ 配置说明

### 添加新用户

登录后访问管理后台（首页右上角设置图标），可以：
- 新增用户
- 编辑用户信息
- 删除用户

### 自定义样式

编辑 `tailwind.config.ts` 中的颜色主题可以调整整体风格。

### 修改初始数据

编辑 `lib/mockData.ts` 中的 `initialUsers` 可以修改初始用户数据。

## 📝 注意事项

- 本项目使用 localStorage 存储用户数据，为前端 Mock 实现
- 生产环境建议对接真实后端服务
- 首次登录前会自动初始化用户数据
- 清除浏览器数据会重置用户列表

## 📄 许可证

MIT License

## ❤️ 致谢

Made with 💖 just for you
