# ✨ 沙聊 - 全栈实时聊天应用 ✨

<div align="center">
  <img src="/frontend/public/logo.jpg" alt="沙聊Logo" width="150" />
</div>

![应用截图](/frontend/public/screenshot-for-readme.png)

## 功能亮点

- 🌟 技术栈: MERN (MongoDB + Express + React + Node.js) + Socket.io + TailwindCSS + Daisy UI
- 🎃 使用 JWT 实现用户认证与授权
- 👾 基于 Socket.io 的实时消息通信
- 🚀 实时在线状态显示
- 👌 使用 Zustand 进行全局状态管理
- 🔔 实时通知系统与未读消息计数
- 👥 完整的好友关系系统
  - 用户搜索与添加好友
  - 好友请求发送与接受
  - 好友列表管理
- 👨‍👩‍👧‍👦 群组聊天功能
- 🖼️ 支持图片消息
- 🌓 明暗主题切换
- 🐞 前后端错误处理机制
- 📱 响应式设计，支持移动端和桌面端

## 新增功能：好友系统

最新版本添加了完整的好友关系管理系统，包括：

- 搜索用户并发送好友请求
- 接受或拒绝收到的好友请求
- 管理好友列表
- 查看发送和接收的好友请求
- 联系人列表现只显示已添加的好友

## 环境要求

- Node.js 16+
- MongoDB
- Cloudinary 账户（用于图片存储）

## 本地开发设置

1. 克隆仓库

```
git clone <repository-url>
cd fullstack-chat-app
```

2. 安装依赖

```
# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

3. 创建并配置`.env`文件在`backend`目录下

```
MONGODB_URI=<你的MongoDB连接URI>
PORT=5001
JWT_SECRET=<你的JWT密钥>

CLOUDINARY_CLOUD_NAME=<你的Cloudinary名称>
CLOUDINARY_API_KEY=<你的Cloudinary API密钥>
CLOUDINARY_API_SECRET=<你的Cloudinary密钥>

NODE_ENV=development
```

4. 启动开发服务器

```
# 后端开发服务器 (在backend目录)
npm run dev

# 前端开发服务器 (在frontend目录)
npm run dev
```

现在你可以访问 http://localhost:5173 查看应用。

## 生产环境部署

1. 构建前端

```
cd frontend
npm run build
```

2. 启动生产服务器

```
cd ../backend
npm run start
```

## 项目结构

```
/backend
  /src
    /controllers   - API控制器
    /middleware    - 中间件（认证等）
    /models        - MongoDB数据模型
    /routes        - API路由
    /lib           - 工具函数

/frontend
  /src
    /components    - React组件
    /pages         - 页面组件
    /store         - Zustand状态管理
    /lib           - 工具和API函数
```

## API 列表

### 认证 API

- POST `/api/auth/signup` - 用户注册
- POST `/api/auth/login` - 用户登录
- POST `/api/auth/logout` - 用户退出
- PUT `/api/auth/update-profile` - 更新用户资料
- GET `/api/auth/check` - 检查认证状态

### 消息 API

- GET `/api/messages/users` - 获取好友列表
- GET `/api/messages/:id` - 获取与特定用户的聊天历史
- POST `/api/messages/:id` - 发送消息给特定用户

### 群组 API

- POST `/api/groups/create` - 创建新群组
- GET `/api/groups/` - 获取用户的群组列表
- GET `/api/groups/:groupId/messages` - 获取群组聊天历史
- POST `/api/groups/:groupId/messages` - 发送消息到群组

### 好友 API

- GET `/api/friends/search` - 搜索用户
- POST `/api/friends/request` - 发送好友请求
- POST `/api/friends/accept` - 接受好友请求
- POST `/api/friends/cancel` - 取消好友请求或移除好友
- GET `/api/friends/requests` - 获取好友请求列表
- GET `/api/friends/:fullName?` - 获取好友列表

## 许可证

MIT
